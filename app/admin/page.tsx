import { notFound } from "next/navigation";
import { getAdminApp } from "@/admin-lib/admin/apps";
import type { Metadata } from "next";

import { AdminShell } from "@/admin-components/AdminShell";
import { GardenDesk } from "@/admin-components/GardenDesk";
import { requireGardenDeskAdmin } from "@/admin-lib/admin/auth";

export const metadata: Metadata = {
  title: "Luke’s Apps · Admin",
  robots: { index: false },
};

type AdminPageProps = {
  searchParams: Promise<{ view?: string; app?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireGardenDeskAdmin();
  const { view, app: appSlug = "sow" } = await searchParams;
  const app = await getAdminApp(appSlug);
  if (!app) notFound();
  return <AdminShell appSlug={app.slug}><GardenDesk key={app.id} app={app} initialView={view} /></AdminShell>;
}
