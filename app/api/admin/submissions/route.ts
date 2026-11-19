import sharp from "sharp";

import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { serializeSubmissionAttachments } from "@/admin-lib/admin/submission-attachments";
import { isDeskSubmissionType, type GardenDeskSubmission } from "@/admin-lib/admin/submissions";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

const MANUAL_SUBMISSION_TYPES = ["feature_request", "bug_report"] as const;

function isManualSubmissionType(value: unknown): value is (typeof MANUAL_SUBMISSION_TYPES)[number] {
  return typeof value === "string" && MANUAL_SUBMISSION_TYPES.includes(value as (typeof MANUAL_SUBMISSION_TYPES)[number]);
}

export async function GET(request: Request) {
  try {
    await requireGardenDeskApiAdmin("feedback");

    const type = new URL(request.url).searchParams.get("type");
    if (type !== null && !isDeskSubmissionType(type)) {
      return NextResponse.json({ error: "Invalid submission type." }, { status: 400 });
    }

    const service = createSupabaseServiceClient();
    let query = service
      .from("desk_submissions")
      .select("id, kind, status, title, message, device, location, received_at, desk_people!inner(display_name, email), desk_attachments(id, bucket_id, storage_path, original_filename, content_type, byte_size)")
      .order("received_at", { ascending: false });
    if (type) query = query.eq("kind", type);
    const { data, error } = await query;

    if (error) throw error;

    const submissions = await Promise.all((data ?? []).map(async (submission): Promise<GardenDeskSubmission> => ({
        id: submission.id,
        type: submission.kind,
        status: submission.status,
        title: submission.title,
        message: submission.message,
        device: submission.device,
        location: submission.location,
        receivedAt: submission.received_at,
        person: Array.isArray(submission.desk_people) ? submission.desk_people[0] : submission.desk_people,
        attachments: await serializeSubmissionAttachments(submission.desk_attachments),
      })));

    return NextResponse.json({ submissions });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load Garden Desk submissions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireGardenDeskApiAdmin("feedback");
    let body: { type?: unknown; title?: unknown; message?: unknown };
    let image: File | null = null;
    try {
      if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
        const form = await request.formData();
        body = { type: form.get("type"), title: form.get("title"), message: form.get("message") };
        const uploaded = form.get("image");
        if (uploaded !== null && !(uploaded instanceof File)) {
          return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
        }
        image = uploaded instanceof File && uploaded.size > 0 ? uploaded : null;
      } else {
        body = await request.json();
      }
      if (!body || typeof body !== "object") throw new Error("Invalid body");
    } catch {
      return NextResponse.json({ error: "Could not read this submission." }, { status: 400 });
    }

    if (!isManualSubmissionType(body.type)) {
      return NextResponse.json({ error: "Choose either a bug report or a feature request." }, { status: 400 });
    }
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "A short title is required." }, { status: 400 });
    }
    if (typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json({ error: "A note is required." }, { status: 400 });
    }
    if (body.title.trim().length > 180 || body.message.trim().length > 10_000) {
      return NextResponse.json({ error: "Keep the title under 180 characters and the note under 10,000." }, { status: 400 });
    }

    let imageBytes: Buffer | null = null;
    if (image) {
      if (body.type !== "bug_report" || !["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > 500_000) {
        return NextResponse.json({ error: "Bug-report screenshots must be JPEG, PNG, or WebP images under 500 KB." }, { status: 400 });
      }
      try {
        // Decode real pixels and strip metadata; MIME strings alone are untrusted.
        imageBytes = await sharp(Buffer.from(await image.arrayBuffer()), { limitInputPixels: 16_000_000 })
          .rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
        if (imageBytes.length > 500_000) throw new Error("Image too large");
      } catch {
        return NextResponse.json({ error: "Could not read this screenshot. Choose a smaller image." }, { status: 400 });
      }
    }

    const service = createSupabaseServiceClient();
    const email = admin.user.email!.trim().toLowerCase();
    const { data: person, error: personError } = await service
      .from("desk_people")
      .upsert({ email, last_seen_at: new Date().toISOString() }, { onConflict: "email" })
      .select("id, display_name, email")
      .single();
    if (personError || !person) throw personError ?? new Error("Could not create the Garden Desk person record.");

    const { data, error } = await service
      .from("desk_submissions")
      .insert({
        kind: body.type,
        person_id: person.id,
        title: body.title.trim(),
        message: body.message.trim(),
        source: "garden-desk",
        metadata: { entered_by: admin.user.id, entry_method: "manual" },
      })
      .select("id, kind, status, title, message, device, location, received_at")
      .single();
    if (error || !data) throw error ?? new Error("Could not create the Garden Desk submission.");

    let attachments: GardenDeskSubmission["attachments"] = [];
    let warning: string | undefined;
    if (imageBytes) {
      let attachmentSaved = false;
      const bucket = service.storage.from("garden-desk-uploads");
      const storagePath = `${new Date().toISOString().slice(0, 10)}/${data.id}/${crypto.randomUUID()}.jpg`;
      try {
        const { error: uploadError } = await bucket.upload(storagePath, imageBytes, { contentType: "image/jpeg", upsert: false });
        if (uploadError) throw uploadError;
        const { data: attachment, error: attachmentError } = await service.from("desk_attachments")
          .insert({ submission_id: data.id, bucket_id: "garden-desk-uploads", storage_path: storagePath,
            original_filename: "screenshot.jpg", content_type: "image/jpeg", byte_size: imageBytes.length })
          .select("id, bucket_id, storage_path, original_filename, content_type, byte_size").single();
        if (attachmentError || !attachment) {
          await bucket.remove([storagePath]);
          throw attachmentError ?? new Error("Attachment unavailable");
        }
        attachmentSaved = true;
        attachments = await serializeSubmissionAttachments([attachment]);
        if (attachments.length === 0) warning = "Bug report saved. Its screenshot preview is temporarily unavailable; refresh to try again.";
      } catch {
        // The report already exists. Return success with a warning so the UI
        // does not invite a retry that creates a duplicate report.
        warning = attachmentSaved
          ? "Bug report saved. Its screenshot preview is temporarily unavailable; refresh to try again."
          : "Bug report saved, but the screenshot could not be attached. Do not resubmit the report.";
      }
    }

    const submission: GardenDeskSubmission = {
      id: data.id,
      type: data.kind,
      status: data.status,
      title: data.title,
      message: data.message,
      device: data.device,
      location: data.location,
      receivedAt: data.received_at,
      person: { display_name: person.display_name, email: person.email },
      attachments,
    };
    return NextResponse.json({ submission, ...(warning ? { warning } : {}) }, { status: 201 });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not add this Garden Desk submission." }, { status: 500 });
  }
}
