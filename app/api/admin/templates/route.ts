import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { getAdminApp } from "@/admin-lib/admin/apps";
import { hasFeature, type AdminFeature } from "@/admin-lib/admin/app-model";
import {
  listGardenDeskEmailTemplates,
  updateGardenDeskEmailTemplate,
  type GardenDeskEmailTemplateKey,
} from "@/admin-lib/admin/workflows";

const templateKeys = ["plant-illustration-ready-v1", "testflight-invitation-v1"] as const;
const templateFeatures: Record<GardenDeskEmailTemplateKey, AdminFeature> = {
  "plant-illustration-ready-v1": "plant_illustrations",
  "testflight-invitation-v1": "testflight",
};

function isTemplateKey(value: unknown): value is GardenDeskEmailTemplateKey {
  return typeof value === "string" && templateKeys.includes(value as GardenDeskEmailTemplateKey);
}

export async function GET() {
  try {
    await requireGardenDeskApiAdmin();
    const app = await getAdminApp("sow");
    if (!app) throw new GardenDeskAccessError("Sow is unavailable.", 404);
    const templates = (await listGardenDeskEmailTemplates()).filter((template) => isTemplateKey(template.template_key) && hasFeature(app, templateFeatures[template.template_key]));
    return NextResponse.json({ templates });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not load the Garden Desk emails." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as { templateKey?: unknown; subject?: unknown; text?: unknown };
    await requireGardenDeskApiAdmin();
    if (!isTemplateKey(body.templateKey) || typeof body.subject !== "string" || typeof body.text !== "string") {
      return NextResponse.json({ error: "Choose an email template and provide its subject and message." }, { status: 400 });
    }
    const app = await getAdminApp("sow");
    if (!app || !hasFeature(app, templateFeatures[body.templateKey])) throw new GardenDeskAccessError("This Sow tool is not enabled.", 404);
    return NextResponse.json({
      template: await updateGardenDeskEmailTemplate(body.templateKey, { subject_template: body.subject, text_template: body.text }),
    });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save the Garden Desk email." }, { status: 409 });
  }
}
