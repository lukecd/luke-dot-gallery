import { NextResponse } from "next/server";
import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { getAdminApp } from "@/admin-lib/admin/apps";
import { hasFeature } from "@/admin-lib/admin/app-model";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

export async function GET(request: Request) {
  try {
    await requireGardenDeskApiAdmin();
    const slug = new URL(request.url).searchParams.get("app");
    if (slug !== "ramble-patch") return NextResponse.json({ error: "App unavailable." }, { status: 404 });
    const app = await getAdminApp(slug);
    if (!app || !hasFeature(app, "feedback")) return NextResponse.json({ error: "App unavailable." }, { status: 404 });
    const { data, error } = await createSupabaseServiceClient().from("desk_app_messages")
      .select("id, message, received_at, status, desk_people!inner(display_name, email)")
      .eq("app_id", app.id).order("received_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ messages: data });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }
}
