import { notFound } from "next/navigation";
import { getAdminApp } from "@/admin-lib/admin/apps";
import { hasFeature } from "@/admin-lib/admin/app-model";
import type { Metadata } from "next";

import { AdminShell } from "@/admin-components/AdminShell";
import { AnalyticsDashboard } from "@/admin-components/AnalyticsDashboard";
import {
  getAnalyticsSnapshot,
  parseAnalyticsEnvironment,
  parseAnalyticsRange,
} from "@/admin-lib/admin/analytics";
import { requireGardenDeskAdmin } from "@/admin-lib/admin/auth";

export const metadata: Metadata = {
  title: "Luke’s Apps · analytics",
  robots: { index: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AnalyticsPageProps = {
  searchParams: Promise<{ environment?: string; range?: string }>;
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  await requireGardenDeskAdmin();

  const app = await getAdminApp("sow");
  if (!app || !hasFeature(app, "analytics")) notFound();

  const params = await searchParams;
  const range = parseAnalyticsRange(params.range);
  const environment = parseAnalyticsEnvironment(params.environment);
  const snapshot = await getAnalyticsSnapshot(range, environment);

  return <AdminShell><AnalyticsDashboard snapshot={snapshot} /></AdminShell>;
}
