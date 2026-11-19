"use client";

// Development-only fixture for reviewing the real components with sample data.
// API requests from the mounted preview are intercepted; none reaches an API.
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminNavigation } from "@/admin-components/AdminNavigation";
import { GardenDesk } from "@/admin-components/GardenDesk";
import { MailingSignup } from "@/admin-components/MailingSignup";
import { CREATOR_UPDATES_CONSENT } from "@/admin-lib/mailing-consent";
import type { AdminApp } from "@/admin-lib/admin/app-model";
import type { MailingList, Subscriber } from "@/admin-lib/admin/subscriber-model";

const apps: AdminApp[] = [
  { id: "sow", slug: "sow", name: "Sow", features: ["mailing_lists", "feedback", "testflight", "plant_illustrations", "analytics"] },
  { id: "relaxation-station", slug: "relaxation-station", name: "Relaxation Station", features: ["mailing_lists"] },
  { id: "sp-stories", slug: "sp-stories", name: "Luke’s app updates", features: ["mailing_lists"] },
];
function consent(app: AdminApp) {
  return CREATOR_UPDATES_CONSENT[app.slug as keyof typeof CREATOR_UPDATES_CONSENT];
}
function mailingList(app: AdminApp): MailingList {
  return { id: app.id, slug: "updates", name: app.slug === "sow" ? "Garden Letter" : app.slug === "sp-stories" ? "All app updates" : "Relaxation Station updates", signup_enabled: true,
    consent_text: consent(app).text,
    consent_copy_version: consent(app).version };
}
const names = ["Alex Rivera", "Taylor Kim", "Jordan Blake", "Casey Nguyen", "Morgan Lee", "Riley Patel", "Sam Chen"];
function sampleRows(app: AdminApp): Subscriber[] {
  return Array.from({ length: app.slug === "sow" ? 7 : app.slug === "sp-stories" ? 18 : 28 }, (_, index) => ({ id: `${app.id}-${index}`, status: (app.slug === "sp-stories" ? index === 17 : index % 7 === 5) ? "unsubscribed" : "subscribed", source: "hosted-signup", consentedAt: "2026-09-22T10:00:00Z", consentCopyVersion: consent(app).version, sourceSubmissionId: null,
    person: { display_name: names[index % names.length], email: `${names[index % names.length].toLowerCase().replace(" ", ".")}${index < 7 ? "" : index}@example.com` } }));
}

export function SharedAdminPreview() {
  const params = useSearchParams();
  const router = useRouter();
  const app = apps.find((item) => item.slug === params.get("app")) ?? apps[2];
  const view = params.get("view") ?? "letters";
  const state = params.get("state") ?? "populated";
  const fixtureKey = `${app.slug}-${view}-${state}`;
  const [ready, setReady] = useState("");
  useEffect(() => {
    const original = window.fetch;
    const rows = new Map(apps.map((item) => [item.slug, sampleRows(item)]));
    window.fetch = async (input, init) => {
      const url = new URL(String(input), window.location.origin);
      if (url.pathname === "/lab/shared-admin") return original(input, init);
      const selectedApp = apps.find((item) => item.slug === url.searchParams.get("app")) ?? app;
      if (state === "loading") return new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }));
      if (state === "error") return Response.json({ error: "Sample connection error. Change Preview state to try again." }, { status: 503 });
      if (url.pathname.includes("/subscribe") && init?.method === "POST") return Response.json({ ok: true });
      if (url.pathname === "/api/admin/mailing-lists") return Response.json({ lists: [mailingList(selectedApp)] });
      if (url.pathname === "/api/admin/subscribers" && init?.method === "PATCH") {
        const body = JSON.parse(String(init.body));
        const row = rows.get(body.app)?.find((item) => item.id === body.subscriptionId);
        if (row) row.status = "unsubscribed";
        return Response.json({ ok: Boolean(row) });
      }
      if (url.pathname === "/api/admin/subscribers") {
        const all = state === "empty" ? [] : rows.get(selectedApp.slug) ?? [];
        const filtered = all.filter((row) => (!url.searchParams.get("status") || row.status === url.searchParams.get("status")) && row.person.email.includes(url.searchParams.get("search") ?? ""));
        const page = Number(url.searchParams.get("page") ?? 1);
        return Response.json({ list: mailingList(selectedApp), lists: [mailingList(selectedApp)], page, total: filtered.length, activeCount: all.filter((row) => row.status === "subscribed").length, subscribers: filtered.slice((page - 1) * 25, page * 25) });
      }
      if (!init?.method || init.method === "GET") {
        if (url.pathname === "/api/admin/summary") return Response.json({ features: 3, bugs: 1, illustrationsQueued: 0, illustrationsReady: 0, illustrationsGenerating: 0, illustrationsGenerated: 0, illustrationsSent: 0, letters: 6, beta: 0 });
        if (url.pathname === "/api/admin/people") return Response.json({ people: (state === "empty" ? [] : sampleRows(app)).map((row) => ({ id: row.id, displayName: row.person.display_name, email: row.person.email, firstSeenAt: row.consentedAt, lastSeenAt: row.consentedAt, submissionKinds: [], subscribed: row.status === "subscribed" })) });
        if (url.pathname === "/api/admin/submissions") return Response.json({ submissions: [] });
        if (url.pathname === "/api/admin/categories") return Response.json({ categories: [] });
        if (url.pathname === "/api/admin/templates") return Response.json({ templates: [] });
        if (url.pathname === "/api/admin/workflows/plants") return Response.json({ jobs: [], configured: true, metrics: { queued: 0, generating: 0, ready: 0, generated: 0, sent: 0 } });
        if (url.pathname === "/api/admin/workflows/beta") return Response.json({ requests: [], configured: false, publicLink: "" });
      }
      return Response.json({ error: "This action is unavailable in the sample preview. No live request was made." }, { status: 503 });
    };
    const timer = window.setTimeout(() => setReady(fixtureKey), 0);
    return () => { window.clearTimeout(timer); window.fetch = original; };
  }, [app, state, fixtureKey]);
  function navigate(next: Record<string, string>) {
    const query = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) => query.set(key, value));
    router.push(`/lab/shared-admin?${query}`);
  }
  return <div onClickCapture={(event) => {
    const link = (event.target as HTMLElement).closest("a");
    if (!link) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || url.hash === "#admin-content") return;
    event.preventDefault(); event.stopPropagation();
    if (url.pathname === "/admin") navigate({ app: url.searchParams.get("app") ?? "sow", view: url.searchParams.get("view") ?? "letters" });
    else if (url.pathname.startsWith("/updates/")) navigate({ view: "signup" });
  }}>
    <div style={{ padding: "10px 20px", background: "#103747", color: "#FCF8F2", font: "14px var(--sow-font-sans)", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
      <strong>Preview · Sample data · Nothing is saved</strong>
      <label>Preview state <select aria-label="Preview state" value={state} onChange={(event) => navigate({ state: event.target.value })}>{["populated", "empty", "loading", "error"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <button onClick={() => navigate({ view: view === "signup" ? "letters" : "signup" })}>{view === "signup" ? "Back to subscribers" : "Preview signup form"}</button>
    </div>
    {ready === fixtureKey ? view === "signup" ? <MailingSignup key={fixtureKey} app={app} list={mailingList(app)} /> : <AdminNavigation apps={apps} app={app}><GardenDesk key={fixtureKey} app={app} initialView={view} /></AdminNavigation> : <p>Loading preview…</p>}
  </div>;
}
