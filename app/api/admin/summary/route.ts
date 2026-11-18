import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { getPlantGenerationMetrics } from "@/admin-lib/admin/workflows";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

async function countRows(table: string, filter?: { column: string; value: string; operator?: "eq" | "neq" }) {
  const service = createSupabaseServiceClient();
  const query = service.from(table).select("id", { count: "exact", head: true });
  const { count, error } = filter
    ? filter.operator === "neq"
      ? await query.neq(filter.column, filter.value)
      : await query.eq(filter.column, filter.value)
    : await query;
  if (error) throw error;
  return count ?? 0;
}

async function countOpenSubmissions(kind: "feature_request" | "bug_report") {
  const { count, error } = await createSupabaseServiceClient()
    .from("desk_submissions")
    .select("id", { count: "exact", head: true })
    .eq("kind", kind)
    .neq("status", "done");
  if (error) throw error;
  return count ?? 0;
}

export async function GET() {
  try {
    await requireGardenDeskApiAdmin();
    const [features, bugs, letters, beta, delivery] = await Promise.all([
      countOpenSubmissions("feature_request"),
      countOpenSubmissions("bug_report"),
      countRows("desk_newsletter_subscriptions", { column: "status", value: "subscribed" }),
      countRows("desk_testflight_requests", { column: "status", value: "requested" }),
      getPlantGenerationMetrics(),
    ]);
    return NextResponse.json({
      features,
      bugs,
      letters,
      beta,
      illustrationsQueued: delivery.queued,
      illustrationsReady: delivery.ready,
      illustrationsGenerating: delivery.generating,
      illustrationsGenerated: delivery.generated,
      illustrationsSent: delivery.sent,
    });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load Garden Desk counts." }, { status: 500 });
  }
}
