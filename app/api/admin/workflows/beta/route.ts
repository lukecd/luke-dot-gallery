import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { getTestFlightPublicLink, listTestFlightRequests, sendTestFlightInvitations } from "@/admin-lib/admin/workflows";

export async function GET() {
  try {
    await requireGardenDeskApiAdmin("testflight");
    const publicLink = await getTestFlightPublicLink();
    return NextResponse.json({ requests: await listTestFlightRequests(), configured: Boolean(publicLink), publicLink });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load the invitation queue." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { requestIds?: unknown };
    await requireGardenDeskApiAdmin("testflight");
    if (!Array.isArray(body.requestIds) || !body.requestIds.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "Choose one or more TestFlight requests." }, { status: 400 });
    }
    return NextResponse.json({ outcomes: await sendTestFlightInvitations(body.requestIds) });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not send invitations." }, { status: 409 });
  }
}
