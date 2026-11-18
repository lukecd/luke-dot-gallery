import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { getPlantGenerationMetrics, listPlantGenerationJobs } from "@/admin-lib/admin/workflows";

export async function GET() {
  try {
    await requireGardenDeskApiAdmin("plant_illustrations");
    const [jobs, metrics] = await Promise.all([
      listPlantGenerationJobs(),
      getPlantGenerationMetrics(),
    ]);
    return NextResponse.json({
      jobs,
      metrics,
      configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not load the plant queue." }, { status: 500 });
  }
}
