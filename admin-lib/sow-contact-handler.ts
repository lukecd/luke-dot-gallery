import { NextResponse } from "next/server";

import {
  CONTACT_EMAIL,
  formatContactEmail,
  MARKETING_CONSENT_COPY_VERSION,
  type ContactPayload,
  type ContactReason,
} from "@/admin-lib/sow-contact";
import {
  createSupabaseServiceClient,
  isSupabaseServiceConfigured,
} from "@/admin-lib/supabase/service";

import { subscribeToMailingList } from "@/admin-lib/admin/mailing-lists";

const MAX_IMAGE_BYTES = 600_000;
const MAX_REQUEST_BYTES = 750_000;
const UPLOAD_BUCKET = "garden-desk-uploads";

const submissionKinds: Record<Exclude<ContactReason, "updates">, string> = {
  feedback: "feedback",
  "feature-request": "feature_request",
  "bug-report": "bug_report",
  "plant-suggestion": "plant_suggestion",
  "testflight-invitation": "testflight_invitation",
};

type ContactInput = ContactPayload & {
  image?: File;
};

async function subscribeToUpdates({ email, name, source, submissionId }: {
  email: string; name: string; source: string; submissionId?: string | null;
}) {
  await subscribeToMailingList({ appSlug: "sow", listSlug: "updates", email, name, source,
    consentCopyVersion: MARKETING_CONSENT_COPY_VERSION, submissionId });
}

class DuplicateTestFlightRequestError extends Error {
  constructor() {
    super("You have already requested a TestFlight invitation. We will be in touch when there is space.");
    this.name = "DuplicateTestFlightRequestError";
  }
}

class DuplicatePlantSuggestionError extends Error {
  constructor() {
    super("We already have an illustration request for this plant. Thank you — there is no need to send it again.");
    this.name = "DuplicatePlantSuggestionError";
  }
}

function plantRequestKey(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

async function sendViaResend(
  payload: ContactPayload,
  imageBase64?: string,
): Promise<{ attempted: boolean; ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    return { attempted: false, ok: true };
  }

  const { subject, text } = formatContactEmail(payload);
  const body: Record<string, unknown> = {
    from,
    to: CONTACT_EMAIL,
    reply_to: payload.email,
    subject,
    text,
  };

  if (imageBase64) {
    body.attachments = [{ filename: "garden-reference.jpg", content: imageBase64 }];
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return { attempted: true, ok: response.ok };
  } catch {
    return { attempted: true, ok: false };
  }
}

function contactTitle(payload: ContactPayload) {
  if (payload.reason === "plant-suggestion") {
    return payload.plantName ?? "Plant suggestion";
  }
  if (payload.reason === "testflight-invitation") {
    return "TestFlight invitation request";
  }
  const label: Record<ContactReason, string> = {
    feedback: "Feedback",
    "feature-request": "Feature request",
    "bug-report": "Bug report",
    "plant-suggestion": "Plant suggestion",
    "testflight-invitation": "TestFlight invitation request",
    updates: "Sow updates",
  };
  return label[payload.reason];
}

async function persistContact(payload: ContactInput) {
  if (!isSupabaseServiceConfigured()) {
    throw new Error("The Garden Desk database is not configured.");
  }

  const supabase = createSupabaseServiceClient();
  const email = payload.email.trim().toLowerCase();

  if (payload.reason === "plant-suggestion") {
    const requestKey = plantRequestKey(payload.plantName ?? "");
    const { data: existingJob, error: existingJobError } = await supabase
      .from("desk_plant_generation_jobs")
      .select("id")
      .eq("request_key", requestKey)
      .maybeSingle();
    if (existingJobError) throw new Error("We could not check this plant suggestion.");
    if (existingJob) throw new DuplicatePlantSuggestionError();
  }

  if (payload.reason === "testflight-invitation") {
    const { data: existingPerson, error: personLookupError } = await supabase
      .from("desk_people")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (personLookupError) {
      throw new Error("We could not check this TestFlight request.");
    }
    if (existingPerson) {
      const { data: existingRequests, error: requestLookupError } = await supabase
        .from("desk_testflight_requests")
        .select("id, desk_submissions!inner(person_id)")
        .eq("desk_submissions.person_id", existingPerson.id)
        .limit(1);
      if (requestLookupError) {
        throw new Error("We could not check this TestFlight request.");
      }
      if (existingRequests && existingRequests.length > 0) {
        throw new DuplicateTestFlightRequestError();
      }
    }
  }

  const { data: person, error: personError } = await supabase
    .from("desk_people")
    .upsert({ email, last_seen_at: new Date().toISOString() }, { onConflict: "email" })
    .select("id")
    .single();

  if (personError || !person) {
    throw new Error("We could not save this person.");
  }

  if (payload.name.trim()) {
    const { error: nameError } = await supabase
      .from("desk_people")
      .update({ display_name: payload.name.trim() })
      .eq("id", person.id);
    if (nameError) {
      throw new Error("We could not save this person.");
    }
  }

  if (payload.reason === "updates") {
    await subscribeToUpdates({ email, name: payload.name, source: "website-footer" });
    return { submissionId: null };
  }

  const { data: submission, error: submissionError } = await supabase
    .from("desk_submissions")
    .insert({
      kind: submissionKinds[payload.reason],
      person_id: person.id,
      title: contactTitle(payload),
      message: payload.message ?? null,
      device: payload.device ?? null,
      location: payload.location ?? null,
      plant_name: payload.plantName ?? null,
      growing_region: payload.region ?? null,
      source: "website-contact",
      metadata: {
        updates_opt_in: Boolean(payload.updatesOptIn),
        marketing_consent_copy_version: payload.updatesOptIn ? MARKETING_CONSENT_COPY_VERSION : null,
      },
    })
    .select("id")
    .single();

  if (submissionError || !submission) {
    throw new Error("We could not save this note.");
  }

  if (payload.updatesOptIn) {
    await subscribeToUpdates({ email, name: payload.name, source: `website-contact:${payload.reason}`, submissionId: submission.id });
  }

  if (payload.reason === "testflight-invitation") {
    const { error } = await supabase.from("desk_testflight_requests").insert({
      submission_id: submission.id,
      device: payload.device,
    });
    if (error) {
      throw new Error("We could not save this TestFlight request.");
    }
  }

  if (payload.reason === "plant-suggestion") {
    const requestKey = plantRequestKey(payload.plantName ?? "");
    const { error } = await supabase.from("desk_plant_generation_jobs").insert({
      submission_id: submission.id,
      requested_plant_name: payload.plantName,
      request_key: requestKey,
      metadata: {
        source: "website-contact",
        growing_region: payload.region ?? null,
      },
    });
    if (error) {
      // The database uniqueness index is the final guard for concurrent form
      // submissions. Remove the just-created request record before reporting
      // the already-queued illustration to the gardener.
      if (error.code === "23505") {
        await supabase.from("desk_submissions").delete().eq("id", submission.id);
        throw new DuplicatePlantSuggestionError();
      }
      throw new Error("We could not prepare this plant suggestion.");
    }
  }

  if (payload.image) {
    const extension = payload.image.type.split("/")[1]?.replace("jpeg", "jpg") ?? "image";
    const storagePath = `${new Date().toISOString().slice(0, 10)}/${submission.id}/${crypto.randomUUID()}.${extension}`;
    const imageBytes = Buffer.from(await payload.image.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(storagePath, imageBytes, {
        contentType: payload.image.type,
        upsert: false,
      });
    if (uploadError) {
      throw new Error("We could not save this image.");
    }

    const { error: attachmentError } = await supabase.from("desk_attachments").insert({
      submission_id: submission.id,
      bucket_id: UPLOAD_BUCKET,
      storage_path: storagePath,
      original_filename: payload.image.name || null,
      content_type: payload.image.type,
      byte_size: payload.image.size,
    });
    if (attachmentError) {
      await supabase.storage.from(UPLOAD_BUCKET).remove([storagePath]);
      throw new Error("We could not save this image.");
    }
  }

  return { submissionId: submission.id };
}

export async function handleSowContact(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }
  let form: FormData;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return NextResponse.json({ error: "Request too large." }, { status: 413 });
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    form = await new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData();
  } catch {
    return NextResponse.json({ error: "Invalid contact form." }, { status: 400 });
  }

  if (form.get("website")) return NextResponse.json({ ok: true });

  const reason = form.get("reason");
  const name = form.get("name");
  const email = form.get("email");
  const message = form.get("message");
  const plantName = form.get("plantName");
  const image = form.get("image");
  const region = form.get("region");
  const device = form.get("device");
  const location = form.get("location");
  const updatesOptIn = form.get("updatesOptIn") === "true";

  if (
    reason !== "feedback" &&
    reason !== "feature-request" &&
    reason !== "bug-report" &&
    reason !== "plant-suggestion" &&
    reason !== "testflight-invitation" &&
    reason !== "updates"
  ) {
    return NextResponse.json({ error: "Invalid contact reason" }, { status: 400 });
  }
  if (updatesOptIn && form.get("marketingConsentVersion") !== MARKETING_CONSENT_COPY_VERSION) {
    return NextResponse.json({ error: "The signup wording has changed. Please reload the page and try again." }, { status: 400 });
  }
  if (reason === "updates" && !updatesOptIn) {
    return NextResponse.json({ error: "Please agree to receive Sow updates." }, { status: 400 });
  }
  if (typeof email !== "string" || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if ((typeof name === "string" && name.trim().length > 100) ||
      (typeof message === "string" && message.trim().length > 10_000) ||
      [plantName, region, device, location].some((value) => typeof value === "string" && value.trim().length > 300)) {
    return NextResponse.json({ error: "Please shorten your message or details." }, { status: 400 });
  }
  if (
    (reason === "feedback" || reason === "feature-request" || reason === "bug-report") &&
    (typeof message !== "string" || !message.trim())
  ) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (reason === "plant-suggestion" && (typeof plantName !== "string" || !plantName.trim())) {
    return NextResponse.json({ error: "Plant name is required" }, { status: 400 });
  }
  if (reason === "testflight-invitation" && (typeof device !== "string" || !device.trim())) {
    return NextResponse.json({ error: "Device is required" }, { status: 400 });
  }
  if (reason === "bug-report") {
    if (typeof device !== "string" || !device.trim()) {
      return NextResponse.json({ error: "Device is required" }, { status: 400 });
    }
    if (typeof location !== "string" || !location.trim()) {
      return NextResponse.json({ error: "Where it happened is required" }, { status: 400 });
    }
  }
  if (image instanceof File && image.size > 0) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 500 KB after compression" },
        { status: 400 },
      );
    }
  }

  const payload: ContactInput = {
    reason,
    name: typeof name === "string" ? name.trim() : "",
    email: email.trim(),
    message: typeof message === "string" ? message.trim() || undefined : undefined,
    plantName:
      reason === "plant-suggestion" && typeof plantName === "string"
        ? plantName.trim()
        : undefined,
    region: typeof region === "string" ? region.trim() || undefined : undefined,
    device: typeof device === "string" ? device.trim() || undefined : undefined,
    location: typeof location === "string" ? location.trim() || undefined : undefined,
    updatesOptIn,
    image: reason === "bug-report" && image instanceof File && image.size > 0 ? image : undefined,
  };

  try {
    await persistContact(payload);
  } catch (error) {
    if (error instanceof DuplicateTestFlightRequestError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof DuplicatePlantSuggestionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "We could not save your note. Please try again shortly." },
      { status: 503 },
    );
  }

  // Email remains a courtesy notification. The Garden Desk database is the
  // durable record, so a temporary email-provider outage does not lose a note.
  // Newsletter signup does not create a noisy internal email; it is already
  // visible in Garden Desk and will receive a proper confirmation flow later.
  if (payload.reason !== "updates") {
    const imageBase64 = payload.image
      ? Buffer.from(await payload.image.arrayBuffer()).toString("base64")
      : undefined;
    await sendViaResend(payload, imageBase64);
  }

  return NextResponse.json({ ok: true });
}
