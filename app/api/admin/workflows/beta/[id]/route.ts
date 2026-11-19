import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { sendTestFlightInvitation } from "@/admin-lib/admin/workflows";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let action: unknown;
  try {
    action = (await request.json()).action;
  } catch {
    return NextResponse.json({ error: "A workflow action is required." }, { status: 400 });
  }

  try {
    await requireGardenDeskApiAdmin("testflight");
    if (action === "send") return NextResponse.json(await sendTestFlightInvitation(id));
    return NextResponse.json({ error: "Unknown workflow action." }, { status: 400 });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update invitation." }, { status: 409 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await requireGardenDeskApiAdmin("testflight");
    const { error } = await createSupabaseServiceClient().from("desk_testflight_requests").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ removed: true });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not remove this TestFlight request." }, { status: 500 });
  }
}
