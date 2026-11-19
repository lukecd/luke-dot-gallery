import type { Metadata } from "next";

import { AdminSecurity } from "@/admin-components/AdminSecurity";
import { requireGardenDeskAdmin } from "@/admin-lib/admin/auth";

export const metadata: Metadata = {
  title: "Luke’s Apps · security",
  robots: { index: false },
};

export default async function AdminSecurityPage() {
  await requireGardenDeskAdmin({ allowMfaSetup: true });
  return <AdminSecurity />;
}
