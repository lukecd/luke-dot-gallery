import "server-only";
import { cache } from "react";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";
import { type AdminApp, type AdminFeature, isAdminFeature } from "@/admin-lib/admin/app-model";

export const getAdminApps = cache(async (): Promise<AdminApp[]> => {
  const { data, error } = await createSupabaseServiceClient().from("desk_apps")
    .select("id, slug, name, desk_app_features(feature_key, enabled)")
    .is("archived_at", null).order("created_at").order("slug");
  if (error) throw new Error("Could not load app settings. Check that the shared admin migrations have been applied.");
  return (data ?? []).map((app) => ({ id: app.id, slug: app.slug, name: app.name,
    features: (app.desk_app_features ?? []).filter((feature) => feature.enabled && isAdminFeature(feature.feature_key)).map((feature) => feature.feature_key as AdminFeature) }));
});

export async function getAdminApp(slug: string) {
  return (await getAdminApps()).find((app) => app.slug === slug) ?? null;
}
