import { notFound } from "next/navigation";
import { getAdminApps } from "@/admin-lib/admin/apps";
import { AdminNavigation } from "@/admin-components/AdminNavigation";

export async function AdminShell({ children, appSlug = "sow" }: { children: React.ReactNode; appSlug?: string }) {
  const apps = await getAdminApps();
  const app = apps.find((item) => item.slug === appSlug);
  if (!app) notFound();
  return <AdminNavigation apps={apps} app={app}>{children}</AdminNavigation>;
}
