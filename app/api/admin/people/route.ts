import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

function hasNewsletterConsent(subscription: unknown) {
  if (Array.isArray(subscription)) return subscription.some((entry) => entry?.status === "subscribed");
  return typeof subscription === "object" && subscription !== null && (subscription as { status?: string }).status === "subscribed";
}

export async function GET() {
  try {
    await requireGardenDeskApiAdmin();
    const { data, error } = await createSupabaseServiceClient().from("desk_people").select("id, email, display_name, first_seen_at, last_seen_at, desk_submissions(kind), desk_mailing_subscriptions(status)").order("last_seen_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ people: (data ?? []).map((person) => ({ id: person.id, email: person.email, displayName: person.display_name, firstSeenAt: person.first_seen_at, lastSeenAt: person.last_seen_at, submissionKinds: (person.desk_submissions ?? []).map((submission) => submission.kind), subscribed: hasNewsletterConsent(person.desk_mailing_subscriptions) })) });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not load people." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { personId, scope } = await request.json() as { personId?: unknown; scope?: unknown };
    if (scope !== "all-apps") return NextResponse.json({ error: "Confirm deletion across all apps, or unsubscribe from a single list instead." }, { status: 400 });
    if (typeof personId !== "string" || !personId) return NextResponse.json({ error: "Choose a person to delete." }, { status: 400 });
    await requireGardenDeskApiAdmin();
    const service = createSupabaseServiceClient();
    const { data: submissions, error: submissionsError } = await service.from("desk_submissions").select("id").eq("person_id", personId);
    if (submissionsError) throw submissionsError;
    const submissionIds = (submissions ?? []).map((submission) => submission.id);
    if (submissionIds.length) {
      const { data: jobs, error: jobsError } = await service.from("desk_plant_generation_jobs").select("id").in("submission_id", submissionIds);
      if (jobsError) throw jobsError;
      const jobIds = (jobs ?? []).map((job) => job.id);
      const { data: assets, error: assetsError } = jobIds.length
        ? await service.from("desk_generated_plant_assets").select("bucket_id, storage_path").in("job_id", jobIds)
        : { data: [], error: null };
      if (assetsError) throw assetsError;
      const { error: deliveryError } = await service.from("desk_email_deliveries").delete().in("submission_id", submissionIds);
      if (deliveryError) throw deliveryError;
      const { error: submissionError } = await service.from("desk_submissions").delete().in("id", submissionIds);
      if (submissionError) throw submissionError;
      for (const asset of assets ?? []) {
        const { error: storageError } = await service.storage.from(asset.bucket_id).remove([asset.storage_path]);
        if (storageError) throw storageError;
      }
    }
    const { error: personDeliveryError } = await service.from("desk_email_deliveries").delete().eq("person_id", personId);
    if (personDeliveryError) throw personDeliveryError;
    const { error: personError } = await service.from("desk_people").delete().eq("id", personId);
    if (personError) throw personError;
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not permanently delete this person." }, { status: 500 });
  }
}
