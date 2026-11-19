"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import styles from "@/app/admin/admin.module.css";
import { AdminDataState } from "@/admin-components/AdminDataState";
import { AppMessages } from "@/admin-components/AppMessages";
import { CategoriesList } from "@/admin-components/CategoriesList";
import { MailingListSubscribers } from "@/admin-components/MailingListSubscribers";
import { MailingListSettings } from "@/admin-components/MailingListSettings";
import { defaultAdminView, hasFeature, type AdminApp, type AdminFeature } from "@/admin-lib/admin/app-model";
import { PeopleDirectory } from "@/admin-components/PeopleDirectory";
import { EmailTemplates } from "@/admin-components/EmailTemplates";
import { SubmissionBoard } from "@/admin-components/SubmissionBoard";
import { SubmissionInbox } from "@/admin-components/SubmissionInbox";
import { BetaWorkflowQueue, PlantWorkflowQueue } from "@/admin-components/WorkflowQueues";

type DeskView = "overview" | "inbox" | "messages" | "features" | "bugs" | "plants" | "people" | "letters" | "emails" | "beta" | "categories" | "settings";
type DeskSummary = Record<"features" | "bugs" | "illustrationsQueued" | "illustrationsReady" | "illustrationsGenerating" | "illustrationsGenerated" | "illustrationsSent" | "letters" | "beta", number>;

const viewCopy: Record<Exclude<DeskView, "overview" | "beta" | "plants" | "settings" | "messages">, { eyebrow: string; title: string; description: string }> = {
  inbox: { eyebrow: "Intake", title: "Incoming notes", description: "Feedback, requests, and reports will appear here as gardeners submit them." },
  features: { eyebrow: "Feature requests", title: "What gardeners want next", description: "Feature requests will collect here for review." },
  bugs: { eyebrow: "Bug reports", title: "Reports to investigate", description: "Bug reports will appear here for investigation." },
  people: { eyebrow: "People", title: "Gardeners who write to Sow", description: "A relationship record will appear as people contact Sow or join the beta." },
  letters: { eyebrow: "Garden Letter", title: "Newsletter subscribers", description: "People who opt in through the website will appear here." },
  emails: { eyebrow: "Workflow emails", title: "Write what Sow sends", description: "Operational email templates are managed in one place." },
  categories: { eyebrow: "Categories", title: "Product categories", description: "Categories will become useful when real submissions reveal repeat patterns." },
};

function isDeskView(value: string | undefined): value is DeskView {
  return ["overview", "inbox", "messages", "features", "bugs", "plants", "people", "letters", "emails", "beta", "categories", "settings"].includes(value ?? "");
}

const viewFeatures: Partial<Record<DeskView, AdminFeature>> = {
  letters: "mailing_lists", settings: "mailing_lists", plants: "plant_illustrations", beta: "testflight",
  inbox: "feedback", features: "feedback", bugs: "feedback", categories: "feedback",
  messages: "feedback",
};

export function GardenDesk({ initialView, app }: { initialView?: string; app: AdminApp }) {
  const view: DeskView = isDeskView(initialView) ? initialView : defaultAdminView(app);
  const feature = viewFeatures[view];
  const available = (!feature || hasFeature(app, feature)) && (view !== "emails" || hasFeature(app, "testflight") || hasFeature(app, "plant_illustrations")) && (app.slug === "sow" ? view !== "messages" : ["letters", "settings", "people"].includes(view) || (app.slug === "ramble-patch" && view === "messages"));
  const [summary, setSummary] = useState<DeskSummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (app.slug !== "sow" || view !== "overview") return;
    fetch("/api/admin/summary")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<DeskSummary>;
      })
      .then(setSummary)
      .catch(() => setSummaryError(true));
  }, [app.slug, view]);

  if (!available) return <section className={styles.workspace}><AdminDataState state="empty" title="This tool is not enabled." description={`Choose a tool available for ${app.name}.`} /></section>;

  return <section className={styles.workspace}>
    {view === "overview" ? <Overview summary={summary} error={summaryError} /> : null}
    {view === "beta" ? <BetaWorkflowQueue onToast={setToast} /> : null}
    {view === "plants" ? <PlantWorkflowQueue onToast={setToast} /> : null}
    {view === "inbox" ? <SubmissionInbox onToast={setToast} /> : null}
    {view === "messages" ? <AppMessages app={app} /> : null}
    {view === "features" ? <SubmissionWorkflow type="feature_request" onToast={setToast} /> : null}
    {view === "bugs" ? <SubmissionWorkflow type="bug_report" onToast={setToast} /> : null}
    {view === "letters" ? <MailingListSubscribers key={app.id} app={app} /> : null}
    {view === "settings" ? <MailingListSettings app={app} /> : null}
    {view === "emails" ? <EmailTemplates onToast={setToast} /> : null}
    {view === "people" ? <PeopleDirectory /> : null}
    {view === "categories" ? <CategoriesList /> : null}
    {view !== "overview" && view !== "beta" && view !== "plants" && view !== "inbox" && view !== "messages" && view !== "features" && view !== "bugs" && view !== "letters" && view !== "emails" && view !== "people" && view !== "categories" && view !== "settings" ? <EmptyWorkspace view={view} /> : null}
    {toast && <button type="button" className={styles.toast} onClick={() => setToast(null)}>{toast} <span>×</span></button>}
  </section>;
}

function SubmissionWorkflow({ type, onToast }: { type: "feature_request" | "bug_report"; onToast: (message: string) => void }) {
  const [presentation, setPresentation] = useState<"board" | "table">("board");
  return <>
    <nav className={styles.submissionViewToggle} aria-label="Submission view">
      <button type="button" aria-pressed={presentation === "board"} onClick={() => setPresentation("board")}>Board</button>
      <button type="button" aria-pressed={presentation === "table"} onClick={() => setPresentation("table")}>Table</button>
    </nav>
    {presentation === "board" ? <SubmissionBoard type={type} onToast={onToast} /> : <SubmissionInbox type={type} onToast={onToast} />}
  </>;
}

function Overview({ summary, error }: { summary: DeskSummary | null; error: boolean }) {
  const loading = summary === null && !error;
  const needsAttention = [
    { label: "Plant requests waiting to generate", count: summary?.illustrationsQueued, detail: "queued", href: "/admin?view=plants" },
    { label: "Illustrations ready to approve", count: summary?.illustrationsReady, detail: "candidate review", href: "/admin?view=plants" },
    { label: "Illustrations generating", count: summary?.illustrationsGenerating, detail: "in progress", href: "/admin?view=plants" },
    { label: "Feature requests", count: summary?.features, detail: "not done", href: "/admin?view=features" },
    { label: "Bug reports", count: summary?.bugs, detail: "not done", href: "/admin?view=bugs" },
    { label: "TestFlight applications", count: summary?.beta, detail: "waiting to invite", href: "/admin?view=beta" },
  ];
  const libraryAndAudience = [
    { label: "Illustrations sent", count: summary?.illustrationsSent, detail: summary ? `${summary.illustrationsGenerated} generated in all` : "checking delivery history", href: "/admin?view=plants" },
    { label: "Garden Letter subscribers", count: summary?.letters, detail: "actively subscribed", href: "/admin?view=letters" },
  ];

  return <>
    <header className={styles.compactHeader}>
      <div><p className={styles.eyebrow}>Sow</p><h1>Overview</h1><span>Requests, illustrations, and updates for Sow.</span></div>
    </header>
    <OverviewLedger title="Needs attention" description="Open requests for Sow." rows={needsAttention} />
    <OverviewLedger title="Library & audience" description="The growing illustration library and people who asked to hear from Sow." rows={libraryAndAudience} />
    {loading && <AdminDataState state="loading" title="Loading Luke’s Apps…" description="Checking the current operational summary." />}
    {error && <AdminDataState state="error" title="Luke’s Apps could not load the current count." description="No data has been changed. Reload the page to try again." />}
  </>;
}

function OverviewLedger({ title, description, rows }: { title: string; description: string; rows: Array<{ label: string; count: number | undefined; detail: string; href: string }> }) {
  return <section className={styles.overviewLedger} aria-label={title}>
    <header><div><p className={styles.eyebrow}>{title}</p><p>{description}</p></div></header>
    <div>{rows.map((row) => <Link key={row.label} href={row.href}><strong>{row.count ?? "—"}</strong><span><b>{row.label}</b><small>{row.detail}</small></span></Link>)}</div>
  </section>;
}

function EmptyWorkspace({ view }: { view: Exclude<DeskView, "overview" | "beta" | "plants" | "settings" | "messages"> }) {
  const copy = viewCopy[view];
  return <>
    <header className={styles.compactHeader}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><span>{copy.description}</span></div></header>
    <AdminDataState state="empty" title="No records yet." description="This section is ready for real website submissions." />
  </>;
}
