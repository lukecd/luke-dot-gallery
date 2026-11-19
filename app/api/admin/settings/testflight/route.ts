import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { getTestFlightPublicLink, updateTestFlightPublicLink } from "@/admin-lib/admin/workflows";

export async function GET() {
  try {
    await requireGardenDeskApiAdmin("testflight");
    return NextResponse.json({ publicLink: await getTestFlightPublicLink() });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not load the TestFlight setting." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireGardenDeskApiAdmin("testflight");
    const { publicLink } = await request.json() as { publicLink?: unknown };
    if (typeof publicLink !== "string") return NextResponse.json({ error: "A TestFlight public link is required." }, { status: 400 });
    return NextResponse.json({ publicLink: await updateTestFlightPublicLink(publicLink, admin.user.id) });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save the TestFlight setting." }, { status: 400 });
  }
}
