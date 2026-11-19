import "server-only";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";
import { getAdminApp } from "@/admin-lib/admin/apps";
import { hasFeature } from "@/admin-lib/admin/app-model";
import { GardenDeskAccessError } from "@/admin-lib/admin/auth";

export async function requireMailingApp(slug: string) {
  const app = await getAdminApp(slug);
  if (!app || !hasFeature(app, "mailing_lists")) throw new GardenDeskAccessError("Mailing lists are unavailable for this app.", 404);
  return app;
}

export async function getMailingLists(appId: string) {
  const { data, error } = await createSupabaseServiceClient().from("desk_mailing_lists")
    .select("id, slug, name, consent_text, consent_copy_version, signup_enabled").eq("app_id", appId).order("created_at");
  if (error) throw new Error("Could not load mailing lists.");
  return data ?? [];
}

export async function subscribeToMailingList(input: {
  appSlug: string; listSlug: string; email: string; name?: string; source: string;
  consentCopyVersion: string; submissionId?: string | null;
}) {
  const { error } = await createSupabaseServiceClient().rpc("desk_subscribe_with_creator_updates", {
    p_app_slug: input.appSlug, p_list_slug: input.listSlug, p_email: input.email.trim().toLowerCase(),
    p_name: input.name ?? "", p_source: input.source,
    p_consent_copy_version: input.consentCopyVersion, p_submission_id: input.submissionId ?? null,
  });
  if (error) throw new Error("We could not save your subscription. Please reload the form and try again.");
}
