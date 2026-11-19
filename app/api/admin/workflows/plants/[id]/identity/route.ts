import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { savePlantCanonicalIdentity } from "@/admin-lib/admin/workflows";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireGardenDeskApiAdmin("plant_illustrations");
    const { id } = await context.params;
    const body = await request.json() as { canonicalName?: unknown; aliases?: unknown };
    if (typeof body.canonicalName !== "string") {
      return NextResponse.json({ error: "A botanical name is required." }, { status: 400 });
    }
    if (!Array.isArray(body.aliases) || body.aliases.some((alias) => typeof alias !== "string")) {
      return NextResponse.json({ error: "Aliases must be a list of plant names." }, { status: 400 });
    }
    return NextResponse.json({
      identity: await savePlantCanonicalIdentity(id, { canonicalName: body.canonicalName, aliases: body.aliases }, admin.user.id),
    });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save this plant identity." }, { status: 400 });
  }
}
