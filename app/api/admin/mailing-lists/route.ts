import { NextResponse } from "next/server";
import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { getMailingLists, requireMailingApp } from "@/admin-lib/admin/mailing-lists";
export async function GET(request: Request) {
  try {
    await requireGardenDeskApiAdmin();
    const app = await requireMailingApp(new URL(request.url).searchParams.get("app") ?? "sow");
    return NextResponse.json({ lists: await getMailingLists(app.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof GardenDeskAccessError ? error.message : "Could not load mailing lists." }, { status: error instanceof GardenDeskAccessError ? error.status : 500 });
  }
}
