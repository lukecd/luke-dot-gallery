"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { IconType } from "react-icons";
import { PiBugBeetleDuotone, PiChartLineUpDuotone, PiEnvelopeSimpleDuotone, PiHouseDuotone, PiLightbulbDuotone, PiPaperPlaneTiltDuotone, PiPaletteDuotone, PiTagDuotone, PiTrayArrowDownDuotone, PiCoffeeDuotone, PiSquaresFourDuotone, PiCaretDown, PiSidebarSimpleDuotone } from "react-icons/pi";

import styles from "@/app/admin/admin.module.css";
import theme from "@/app/admin/admin-theme.module.css";
import { AdminAudienceContext } from "@/admin-components/AdminAudienceContext";
import { appAdminHref, defaultAdminView, hasFeature, type AdminApp, type AdminFeature } from "@/admin-lib/admin/app-model";

const sidebarPreferenceKey = "lukes-apps:sidebar";
let sidebarVisibleInSession = true;
function readSidebarPreference() {
  try { return window.localStorage.getItem(sidebarPreferenceKey) !== "hidden"; }
  catch { return sidebarVisibleInSession; }
}
function subscribeToSidebarPreference(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(sidebarPreferenceKey, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(sidebarPreferenceKey, onChange);
  };
}
function showSidebarOnServer() { return true; }

type NavigationItem = { label: string; Icon: IconType; view?: string; href?: string; feature?: AdminFeature };
const tools: NavigationItem[] = [
  { label: "Overview", Icon: PiHouseDuotone, view: "overview" },
  { label: "Inbox", Icon: PiTrayArrowDownDuotone, view: "inbox", feature: "feedback" },
  { label: "Feature requests", Icon: PiLightbulbDuotone, view: "features", feature: "feedback" },
  { label: "Bug reports", Icon: PiBugBeetleDuotone, view: "bugs", feature: "feedback" },
  { label: "Plant suggestions", Icon: PiPaletteDuotone, view: "plants", feature: "plant_illustrations" },
  { label: "Workflow emails", Icon: PiEnvelopeSimpleDuotone, view: "emails" },
  { label: "TestFlight", Icon: PiPaperPlaneTiltDuotone, view: "beta", feature: "testflight" },
  { label: "Categories", Icon: PiTagDuotone, view: "categories", feature: "feedback" },
  { label: "Analytics", Icon: PiChartLineUpDuotone, href: "/admin/analytics", feature: "analytics" },
];

function AppGlyph({ slug }: { slug: string }) {
  const Icon = slug === "sp-stories" ? PiEnvelopeSimpleDuotone : slug === "relaxation-station" ? PiCoffeeDuotone : PiSquaresFourDuotone;
  return <Icon aria-hidden="true" className={styles.appGlyph} data-app={slug} />;
}

export function AdminNavigation({ children, apps, app }: { children: React.ReactNode; apps: AdminApp[]; app: AdminApp }) {
  const sidebarVisible = useSyncExternalStore(subscribeToSidebarPreference, readSidebarPreference, showSidebarOnServer);
  function toggleSidebar() {
    sidebarVisibleInSession = !sidebarVisible;
    try { window.localStorage.setItem(sidebarPreferenceKey, sidebarVisibleInSession ? "visible" : "hidden"); }
    catch { /* Keep the toggle working when browser storage is unavailable. */ }
    window.dispatchEvent(new Event(sidebarPreferenceKey));
  }
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") ?? defaultAdminView(app);
  const audienceView = ["letters", "settings"].includes(activeView) && pathname !== "/admin/analytics";
  const [counts, setCounts] = useState<Record<string, number>>({});
  const reportCount = useCallback((id: string, count: number) => setCounts((previous) => previous[id] === count ? previous : { ...previous, [id]: count }), []);
  const sharedApp = apps.find((item) => item.slug === "sp-stories");
  const productApps = apps.filter((item) => item.slug !== "sp-stories");
  const appLink = (item: AdminApp, shared = false) => <Link key={item.id} href={appAdminHref(item, hasFeature(item, "mailing_lists") ? "letters" : undefined)} className={app.id === item.id ? styles.selectedApp : undefined} aria-current={app.id === item.id ? "true" : undefined}>
    <AppGlyph slug={item.slug} /><span>{shared ? "All app updates" : item.name}</span>{counts[item.id] !== undefined && <small>{counts[item.id]}</small>}
  </Link>;

  return <AdminAudienceContext.Provider value={reportCount}><main className={`${theme.theme} ${styles.desk}`}>
    <a href="#admin-content" className={styles.skipLink}>Skip to content</a>
    <header className={styles.topBar}>
      <Link href={sharedApp ? appAdminHref(sharedApp) : "/admin"} className={styles.adminWordmark}>Luke&apos;s Apps</Link>
      <details key={`${pathname}?${searchParams}`} className={styles.appsMenu}><summary>Apps <PiCaretDown aria-hidden="true" /></summary><nav aria-label="Switch app">{productApps.map((item) => <Link key={item.id} href={appAdminHref(item)}><AppGlyph slug={item.slug} />{item.name}</Link>)}{sharedApp && <Link href={appAdminHref(sharedApp)}>All app updates</Link>}</nav></details>
      <nav className={styles.topApps} aria-label="App shortcuts">{productApps.slice(0, 2).map((item) => <Link key={item.id} href={appAdminHref(item)} aria-current={app.id === item.id ? "true" : undefined}>{item.name}</Link>)}</nav>
      <nav className={styles.accountNav} aria-label="Workspace"><Link href={appAdminHref(app, "people")}>All contacts</Link><Link href="/admin/security">Account</Link><Link href="/admin/security" className={styles.accountAvatar} aria-label="Luke’s account">LC</Link></nav>
    </header>
    {audienceView && <section className={styles.audienceHero} aria-label="Audience workspace"><h1>Audience</h1><div className={styles.heroArtwork}><Image src="/admin/envelope.png" alt="" width={780} height={520} sizes="(max-width: 900px) 180px, 390px" className={styles.envelopeArt} />{activeView === "letters" && <div className={styles.audienceCount} aria-live="polite"><strong>{counts[app.id] ?? "—"}</strong><span>subscribers</span></div>}</div></section>}
    <div className={`${styles.deskBody} ${sidebarVisible ? "" : styles.sidebarHidden}`}>
      <div className={styles.workspaceNav}>
        <div className={styles.sidebarControl}><button type="button" className={styles.sidebarToggle} onClick={toggleSidebar} aria-expanded={sidebarVisible} aria-controls="admin-sidebar" aria-label={sidebarVisible ? "Hide sidebar" : "Show sidebar"} title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}><PiSidebarSimpleDuotone aria-hidden="true" /></button></div>
        {hasFeature(app, "mailing_lists") && <nav className={styles.audienceTabs} aria-label={`${app.name} mailing tools`}><Link href={appAdminHref(app, "letters")} aria-current={audienceView && activeView === "letters" ? "page" : undefined}>Subscribers</Link><Link href={appAdminHref(app, "settings")} aria-current={audienceView && activeView === "settings" ? "page" : undefined}>List settings</Link></nav>}
      </div>
      <aside id="admin-sidebar" className={styles.sidebar} hidden={!sidebarVisible}>
        <nav className={styles.appSwitcher} aria-label="Audiences">
          {sharedApp && <div className={styles.appGroup}><p>Shared audience</p>{appLink(sharedApp, true)}</div>}
          <div className={styles.appGroup}><p>Apps</p>{productApps.map((item) => appLink(item))}</div>
        </nav>
        {app.slug === "sow" && <nav className={styles.sideNav} aria-label="Sow tools"><p>Sow tools</p>{tools.filter((item) => (!item.feature || hasFeature(app, item.feature)) && (item.view !== "emails" || hasFeature(app, "testflight") || hasFeature(app, "plant_illustrations"))).map(({ label, Icon, view, href }) => {
          const active = view ? pathname !== "/admin/analytics" && activeView === view : pathname === href;
          return <Link aria-current={active ? "page" : undefined} className={active ? styles.activeNavItem : undefined} href={view ? appAdminHref(app, view) : href!} key={label}><Icon aria-hidden="true" className={styles.navGlyph} /><span>{label}</span></Link>;
        })}</nav>}
        {app.slug === "ramble-patch" && hasFeature(app, "feedback") && <nav className={styles.sideNav} aria-label="Ramble Patch tools"><p>Ramble Patch tools</p><Link href={appAdminHref(app, "messages")} aria-current={activeView === "messages" ? "page" : undefined} className={activeView === "messages" ? styles.activeNavItem : undefined}><PiTrayArrowDownDuotone aria-hidden="true" /><span>Messages</span></Link></nav>}
        <p className={styles.sidebarFooter}>Luke’s private workspace.</p>
      </aside>
      <div id="admin-content" tabIndex={-1} className={styles.contentColumn}>
        {children}
      </div>
    </div>
  </main></AdminAudienceContext.Provider>;
}
