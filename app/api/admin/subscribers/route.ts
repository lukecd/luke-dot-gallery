import { NextResponse } from "next/server";
import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";
import { getMailingLists, requireMailingApp } from "@/admin-lib/admin/mailing-lists";

export async function GET(request: Request) {
  try {
    await requireGardenDeskApiAdmin();
    const params = new URL(request.url).searchParams;
    const app = await requireMailingApp(params.get("app") ?? "sow");
    const lists = await getMailingLists(app.id);
    const list = lists.find((item) => item.slug === (params.get("list") ?? lists[0]?.slug));
    if (!list) throw new GardenDeskAccessError("Mailing list not found.", 404);
    const page = Math.max(1, Math.min(100000, Number.parseInt(params.get("page") ?? "1", 10) || 1));
    const status = params.get("status");
    const service = createSupabaseServiceClient();
    let query = service.from("desk_mailing_subscriptions")
      .select("id, status, source, consented_at, consent_copy_version, source_submission_id, desk_people!inner(display_name, email)", { count: "exact" })
      .eq("list_id", list.id).order("consented_at", { ascending: false }).order("id");
    if (status === "subscribed" || status === "unsubscribed") query = query.eq("status", status);
    const search = (params.get("search") ?? "").trim().slice(0, 254);
    if (search) query = query.ilike("desk_people.email", `%${search.replace(/[\\%_]/g, "\\$&")}%`);
    const [{ data, error, count }, active] = await Promise.all([
      query.range((page - 1) * 25, page * 25 - 1),
      service.from("desk_mailing_subscriptions").select("id", { count: "exact", head: true }).eq("list_id", list.id).eq("status", "subscribed"),
    ]);
    if (error || active.error) throw new Error("Could not load subscribers.");
    return NextResponse.json({ app, lists, list, page, total: count ?? 0, activeCount: active.count ?? 0,
      subscribers: (data ?? []).map((subscription) => ({ id: subscription.id, status: subscription.status,
        source: subscription.source, consentedAt: subscription.consented_at,
        consentCopyVersion: subscription.consent_copy_version, sourceSubmissionId: subscription.source_submission_id,
        person: Array.isArray(subscription.desk_people) ? subscription.desk_people[0] : subscription.desk_people,
      })),
    });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not load subscribers." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireGardenDeskApiAdmin();
    const body = await request.json();
    if (typeof body.app !== "string" || typeof body.subscriptionId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.subscriptionId) || body.action !== "unsubscribe") {
      return NextResponse.json({ error: "Choose a subscription to unsubscribe." }, { status: 400 });
    }
    // Ownership is checked inside the atomic function. Unsubscribe is allowed
    // even if the app or mailing feature was subsequently disabled.
    const { error } = await createSupabaseServiceClient().rpc("desk_unsubscribe_from_list", { p_app_slug: body.app, p_subscription_id: body.subscriptionId });
    if (error) throw new Error("Could not unsubscribe this address.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not unsubscribe this address." }, { status: 500 });
  }
}
