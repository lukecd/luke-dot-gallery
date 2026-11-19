import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { getTestFlightTemplate, updateTestFlightTemplate } from "@/admin-lib/admin/workflows";

export async function GET() {
  try {
    await requireGardenDeskApiAdmin("testflight");
    return NextResponse.json({ template: await getTestFlightTemplate() });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not load the TestFlight email template." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as { subject?: unknown; text?: unknown };
    await requireGardenDeskApiAdmin("testflight");
    if (typeof body.subject !== "string" || typeof body.text !== "string") {
      return NextResponse.json({ error: "Email subject and message are required." }, { status: 400 });
    }
    return NextResponse.json({ template: await updateTestFlightTemplate({ subject_template: body.subject, text_template: body.text }) });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save the TestFlight email template." }, { status: 409 });
  }
}
