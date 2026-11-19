import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";
import { createSupabaseServerClient } from "@/admin-lib/supabase/server";

import { getAdminApp } from "@/admin-lib/admin/apps";
import { hasFeature, type AdminFeature } from "@/admin-lib/admin/app-model";

type AdminAccessOptions = {
  allowMfaSetup?: boolean;
};

export class GardenDeskAccessError extends Error {
  constructor(message: string, readonly status = 401) {
    super(message);
    this.name = "GardenDeskAccessError";
  }
}

function getOwnerEmail() {
  const email = process.env.SOW_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error("SOW_ADMIN_EMAIL is not configured.");
  }
  return email;
}

export async function requireGardenDeskAdmin(options: AdminAccessOptions = {}) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email || user.email.toLowerCase() !== getOwnerEmail()) {
    redirect("/admin/login");
  }

  const service = createSupabaseServiceClient();
  const { data: profile } = await service
    .from("desk_admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || profile.role === "viewer") {
    redirect("/admin/login?error=not-authorized");
  }

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const requiresMfa = assurance?.currentLevel !== "aal2";
  if (requiresMfa && !options.allowMfaSetup) {
    redirect("/admin/security");
  }

  return { user, role: profile.role, requiresMfa };
}

/**
 * Route-handler equivalent of requireGardenDeskAdmin. It never redirects so
 * an API caller receives the correct 401/403 response instead of HTML.
 */
export async function requireGardenDeskApiAdmin(feature?: AdminFeature) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email || user.email.toLowerCase() !== getOwnerEmail()) {
    throw new GardenDeskAccessError("You are not signed in to Garden Desk.");
  }

  const service = createSupabaseServiceClient();
  const { data: profile } = await service
    .from("desk_admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile || profile.role === "viewer") {
    throw new GardenDeskAccessError("You do not have access to Garden Desk.", 403);
  }

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel !== "aal2") {
    throw new GardenDeskAccessError("Two-factor authentication is required.", 403);
  }

  if (feature) {
    const app = await getAdminApp("sow");
    if (!app || !hasFeature(app, feature)) throw new GardenDeskAccessError("This Sow tool is not enabled.", 404);
  }

  return { user, role: profile.role };
}
