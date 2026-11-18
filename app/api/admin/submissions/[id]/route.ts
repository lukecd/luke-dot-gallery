import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { serializeSubmissionAttachments } from "@/admin-lib/admin/submission-attachments";
import { isDeskSubmissionStatus, type GardenDeskSubmission } from "@/admin-lib/admin/submissions";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await requireGardenDeskApiAdmin("feedback");
    const body = await request.json() as { status?: unknown };
    if (!isDeskSubmissionStatus(body.status)) {
      return NextResponse.json({ error: "Invalid submission status." }, { status: 400 });
    }

    const { id } = await params;
    const service = createSupabaseServiceClient();
    const { data, error } = await service
      .from("desk_submissions")
      .update({ status: body.status })
      .eq("id", id)
      .select("id, kind, status, title, message, device, location, received_at, desk_people!inner(display_name, email), desk_attachments(id, bucket_id, storage_path, original_filename, content_type, byte_size)")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
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
      person: Array.isArray(data.desk_people) ? data.desk_people[0] : data.desk_people,
      attachments: await serializeSubmissionAttachments(data.desk_attachments),
    };
    return NextResponse.json({ submission });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not update this submission." }, { status: 500 });
  }
}
