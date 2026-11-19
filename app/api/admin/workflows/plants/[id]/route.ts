import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { approvePlantIllustrations, deletePlantGenerationJob, queuePlantGeneration, retryPlantAppHandoff, reviewPlantCandidate, sendApprovedPlantIllustration } from "@/admin-lib/admin/workflows";

export const maxDuration = 300;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  let body: { action?: unknown; assetId?: unknown; canonicalName?: unknown; aliases?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "A workflow action is required." }, { status: 400 }); }
  if (body.action !== "generate" && body.action !== "approve" && body.action !== "reject" && body.action !== "handoff" && body.action !== "email") return NextResponse.json({ error: "Unknown workflow action." }, { status: 400 });

  try {
    const admin = await requireGardenDeskApiAdmin("plant_illustrations");
    if (body.action === "generate") return NextResponse.json(await queuePlantGeneration(id, admin.user.id));
    if (body.action === "email") return NextResponse.json(await sendApprovedPlantIllustration(id, admin.user.id));
    const plant = {
      name: typeof body.canonicalName === "string" ? body.canonicalName : "",
      aliases: Array.isArray(body.aliases) ? body.aliases.filter((alias): alias is string => typeof alias === "string") : [],
    };
    if (body.action === "approve") return NextResponse.json({ outcomes: await approvePlantIllustrations([id], admin.user.id) });
    if (body.action === "handoff") return NextResponse.json(await retryPlantAppHandoff(id, plant));
    if (typeof body.assetId !== "string" || !body.assetId) return NextResponse.json({ error: "Choose a candidate first." }, { status: 400 });
    return NextResponse.json(await reviewPlantCandidate(id, body.assetId, "reject", admin.user.id));
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update this illustration." }, { status: 409 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const admin = await requireGardenDeskApiAdmin("plant_illustrations");
    return NextResponse.json(await deletePlantGenerationJob(id, admin.user.id));
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete this illustration request." }, { status: 409 });
  }
}
