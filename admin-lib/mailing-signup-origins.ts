// Only public signup endpoints use this map. It grants no admin/data access.
// Add each app's exact website origins here when connecting another website.
const websiteOrigins: Record<string, readonly string[]> = {
  "relaxation-station": ["https://relaxation-station.xyz", "https://www.relaxation-station.xyz"],
};

export function mailingSignupCorsHeaders(request: Request, app: string, environment: string | undefined): Headers | null {
  const origin = request.headers.get("origin");
  const sameOrigin = origin === new URL(request.url).origin;
  const approvedWebsite = origin !== null && websiteOrigins[app]?.includes(origin);
  const localWebsite = environment === "development" && app === "relaxation-station" && origin === "http://127.0.0.1:3000";
  if (!origin || (!sameOrigin && !approvedWebsite && !localWebsite)) return null;
  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
    "Cache-Control": "no-store",
  });
}
