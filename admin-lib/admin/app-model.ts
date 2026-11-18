export const ADMIN_FEATURES = ["mailing_lists", "feedback", "testflight", "plant_illustrations", "analytics"] as const;
export type AdminFeature = typeof ADMIN_FEATURES[number];
export type AdminApp = { id: string; slug: string; name: string; features: AdminFeature[] };
export function isAdminFeature(value: string): value is AdminFeature {
  return (ADMIN_FEATURES as readonly string[]).includes(value);
}
export function hasFeature(app: AdminApp, feature: AdminFeature) {
  return app.features.includes(feature);
}
export function defaultAdminView(app: AdminApp) {
  return app.slug === "sow" ? "overview" : "letters";
}
export function appAdminHref(app: AdminApp, view = defaultAdminView(app)) {
  return `/admin?${new URLSearchParams({ app: app.slug, view })}`;
}
