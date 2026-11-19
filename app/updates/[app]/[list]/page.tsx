import { notFound } from "next/navigation";
import { getAdminApp } from "@/admin-lib/admin/apps";
import { hasFeature } from "@/admin-lib/admin/app-model";
import { getMailingLists } from "@/admin-lib/admin/mailing-lists";
import { MailingSignup } from "@/admin-components/MailingSignup";
export const metadata = { title: "SP Stories · Mailing list", robots: { index: false } };
export default async function UpdatesPage({ params }: { params: Promise<{ app: string; list: string }> }) {
  const route = await params;
  const app = await getAdminApp(route.app);
  if (!app || !hasFeature(app, "mailing_lists")) notFound();
  const list = (await getMailingLists(app.id)).find((item) => item.slug === route.list && item.signup_enabled);
  if (!list) notFound();
  return <MailingSignup app={app} list={list} />;
}
