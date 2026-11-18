import { NextResponse } from "next/server";

import { GardenDeskAccessError, requireGardenDeskApiAdmin } from "@/admin-lib/admin/auth";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

export async function GET() {
  try {
    await requireGardenDeskApiAdmin("feedback");
    const { data, error } = await createSupabaseServiceClient().from("desk_categories").select("id, name, purpose, sort_order, created_at").order("sort_order").order("name");
    if (error) throw error;
    return NextResponse.json({ categories: data ?? [] });
  } catch (error) {
    if (error instanceof GardenDeskAccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not load categories." }, { status: 500 });
  }
}
