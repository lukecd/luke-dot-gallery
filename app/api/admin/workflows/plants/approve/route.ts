import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { approvePlantIllustrations } from "@/admin-lib/admin/workflows";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { jobIds?: unknown };
    if (!Array.isArray(body.jobIds) || !body.jobIds.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "Choose one or more illustrations to approve." }, { status: 400 });
    }
    const admin = await requireGardenDeskApiAdmin("plant_illustrations");
    return NextResponse.json({ outcomes: await approvePlantIllustrations(body.jobIds, admin.user.id) });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not approve the illustrations." }, { status: 409 });
  }
}
