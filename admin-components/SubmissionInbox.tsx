"use client";
/* eslint-disable @next/next/no-img-element -- signed private storage URLs cannot use the static image optimizer. */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import styles from "@/app/admin/admin.module.css";
import { AdminDataState, AdminRefreshStatus } from "@/admin-components/AdminDataState";
import { ActionButton } from "@/admin-components/ActionButton";
import {
  type DeskSubmissionType,
  type DeskSubmissionStatus,
  type GardenDeskSubmission,
} from "@/admin-lib/admin/submissions";

const statusOptions: Array<{ value: DeskSubmissionStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

type SubmissionListType = Extract<DeskSubmissionType, "feature_request" | "bug_report">;
type SubmissionSortKey = "person" | "category" | "message" | "receivedAt" | "status";
type SortDirection = "ascending" | "descending";

const submissionTypeLabels: Record<DeskSubmissionType, string> = {
  feedback: "Feedback",
  feature_request: "Feature request",
  bug_report: "Bug report",
  plant_suggestion: "Plant suggestion",
  testflight_invitation: "TestFlight request",
};

const workspaceCopy: Record<"all" | SubmissionListType, { eyebrow: string; title: string; description: string; emptyTitle: string; emptyDescription: string }> = {
  all: {
    eyebrow: "Intake",
    title: "Incoming notes",
    description: "Feedback, requests, reports, and suggestions from gardeners, kept together and ready to review.",
    emptyTitle: "No submissions yet.",
    emptyDescription: "New notes from the contact form will appear here.",
  },
  feature_request: {
    eyebrow: "Feature requests",
    title: "What gardeners want next",
    description: "Feature requests from gardeners, ready to review.",
    emptyTitle: "No feature requests yet.",
    emptyDescription: "Feature requests from the contact form will appear here.",
  },
  bug_report: {
    eyebrow: "Bug reports",
    title: "Reports to investigate",
    description: "Bug reports from gardeners, ready to investigate.",
    emptyTitle: "No bug reports yet.",
    emptyDescription: "Bug reports from the contact form will appear here.",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: DeskSubmissionStatus) {
  return statusOptions.find((option) => option.value === status)?.label
    ?? status.replaceAll("_", " ");
}

function submissionText(submission: GardenDeskSubmission) {
  return submission.message || submission.title || "No written note.";
}

function relatedQueue(submission: GardenDeskSubmission) {
  if (submission.type === "plant_suggestion") return { href: "/admin?view=plants", label: "Open illustration queue" };
  if (submission.type === "testflight_invitation") return { href: "/admin?view=beta", label: "Open TestFlight queue" };
  return null;
}

function submissionAttachments(submission: GardenDeskSubmission) {
  if (submission.attachments.length === 0) return null;
  return <section className={styles.submissionAttachments} aria-label="Attachments">
    <p className={styles.eyebrow}>Attachment{submission.attachments.length === 1 ? "" : "s"}</p>
    <div>
      {submission.attachments.map((attachment) => <a key={attachment.id} href={attachment.signedUrl} target="_blank" rel="noreferrer">
        <img src={attachment.signedUrl} alt={attachment.filename ? `Attachment: ${attachment.filename}` : "Attached image"} />
        <span>Open full image</span>
      </a>)}
    </div>
  </section>;
}

function sortValue(submission: GardenDeskSubmission, key: SubmissionSortKey) {
  if (key === "person") return submission.person.display_name || submission.person.email;
  if (key === "category") return submissionTypeLabels[submission.type];
  if (key === "message") return submissionText(submission);
  if (key === "receivedAt") return new Date(submission.receivedAt).getTime();
  return statusLabel(submission.status);
}

export function SubmissionInbox({ onToast, type }: { onToast: (message: string) => void; type?: SubmissionListType }) {
  const copy = workspaceCopy[type ?? "all"];
  const query = type ? `?type=${type}` : "";
  const [submissions, setSubmissions] = useState<GardenDeskSubmission[]>([]);
  const [sort, setSort] = useState<{ key: SubmissionSortKey; direction: SortDirection }>({ key: "receivedAt", direction: "descending" });
  const [draftStatuses, setDraftStatuses] = useState<Record<string, DeskSubmissionStatus>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await fetch(`/api/admin/submissions${query}`);
      const data = await response.json() as { submissions?: GardenDeskSubmission[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load submissions.");
      const nextSubmissions = data.submissions ?? [];
      setSubmissions(nextSubmissions);
      setDraftStatuses(Object.fromEntries(nextSubmissions.map((submission) => [submission.id, submission.status])));
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load submissions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void load(true); }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [load]);

  async function saveStatus(submission: GardenDeskSubmission) {
    const status = draftStatuses[submission.id] ?? submission.status;
    if (status === submission.status) return;
    setSavingId(submission.id);
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json() as { submission?: GardenDeskSubmission; error?: string };
      if (!response.ok || !data.submission) throw new Error(data.error || "Could not update this submission.");
      setSubmissions((current) => current.map((item) => item.id === submission.id ? data.submission! : item));
      setDraftStatuses((current) => ({ ...current, [submission.id]: data.submission!.status }));
      onToast(`${submissionTypeLabels[data.submission.type]} marked ${statusLabel(data.submission.status).toLowerCase()}.`);
    } catch (caughtError) {
      onToast(caughtError instanceof Error ? caughtError.message : "Could not update this submission.");
    } finally {
      setSavingId(null);
    }
  }

  const visibleSubmissions = [...submissions].sort((left, right) => {
    const leftValue = sortValue(left, sort.key);
    const rightValue = sortValue(right, sort.key);
    const compared = typeof leftValue === "number" && typeof rightValue === "number"
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: "base" });
    if (compared !== 0) return sort.direction === "ascending" ? compared : -compared;
    return new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime();
  });

  function toggleSort(key: SubmissionSortKey) {
    setSort((current) => current.key === key
      ? { key, direction: current.direction === "ascending" ? "descending" : "ascending" }
      : { key, direction: "ascending" });
  }

  function sortLabel(label: string, key: SubmissionSortKey) {
    const direction = sort.key === key ? sort.direction : null;
    return <button type="button" className={styles.submissionSortButton} onClick={() => toggleSort(key)} aria-label={`Sort by ${label.toLowerCase()}${direction ? `, currently ${direction}` : ""}`}>
      {label} <span aria-hidden="true">{direction === "ascending" ? "↑" : direction === "descending" ? "↓" : "↕"}</span>
    </button>;
  }

  return <section className={styles.submissionWorkspace}>
    <header className={styles.compactHeader}>
      <div>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <span>{copy.description}</span>
      </div>
      <ActionButton size="compact" variant="secondary" loading={refreshing} loadingLabel="Refreshing…" disabled={loading || savingId !== null} onClick={() => { void load(); }}>Refresh</ActionButton>
    </header>

    {loading ? <AdminDataState state="loading" title="Loading submissions…" description="Checking notes from gardeners." /> : null}
    {!loading && error && submissions.length === 0 ? <AdminDataState state="error" title="Submissions could not load." description={`${error} No data has been changed.`} onRetry={() => { void load(true); }} /> : null}
    {!loading && error && submissions.length > 0 ? <AdminDataState state="error" title="Submissions could not refresh." description={`${error} The previously loaded submissions are still shown.`} onRetry={() => { void load(); }} /> : null}
    {!loading && !error && submissions.length === 0 ? <AdminDataState state="empty" title={copy.emptyTitle} description={copy.emptyDescription} /> : null}
    {!loading && submissions.length > 0 ? <>
      <div className={styles.submissionRefreshLine}>{refreshing ? <AdminRefreshStatus>Refreshing submissions…</AdminRefreshStatus> : <span>{submissions.length} submission{submissions.length === 1 ? "" : "s"}</span>}</div>
      <section className={`${styles.submissionList} ${!type ? styles.submissionListWithCategory : ""}`} aria-label={type ? submissionTypeLabels[type] : "All submissions"}>
        <div className={styles.submissionColumns}>
          {sortLabel("From", "person")}
          {!type ? sortLabel("Category", "category") : null}
          {sortLabel("Message", "message")}{sortLabel("Received", "receivedAt")}{sortLabel("Status", "status")}
        </div>
        {visibleSubmissions.map((submission) => {
          const draftStatus = draftStatuses[submission.id] ?? submission.status;
          const statusChanged = draftStatus !== submission.status;
          const saving = savingId === submission.id;
          return <details className={styles.submissionItem} key={submission.id}>
            <summary>
              <span className={styles.submissionPerson}><strong>{submission.person.display_name || "A gardener"}</strong><small>{submission.person.email}</small></span>
              {!type ? <span className={styles.submissionCategory}>{submissionTypeLabels[submission.type]}</span> : null}
              <span className={styles.submissionPreview}>{submissionText(submission)}</span>
              <time dateTime={submission.receivedAt}>{formatDate(submission.receivedAt)}</time>
              <span className={`${styles.submissionStatus} ${styles[`submissionStatus${submission.status.replace(/(^|_)([a-z])/g, (_, __, letter: string) => letter.toUpperCase())}`] ?? ""}`}>{statusLabel(submission.status)}</span>
            </summary>
            <div className={styles.submissionDetail}>
              <div><p className={styles.eyebrow}>{submissionTypeLabels[submission.type]}</p><p>{submissionText(submission)}</p>{relatedQueue(submission) ? <Link className={styles.submissionQueueLink} href={relatedQueue(submission)!.href}>{relatedQueue(submission)!.label}</Link> : null}{submissionAttachments(submission)}</div>
              <dl>
                {submission.device ? <div><dt>Device</dt><dd>{submission.device}</dd></div> : null}
                {submission.location ? <div><dt>Where it happened</dt><dd>{submission.location}</dd></div> : null}
              </dl>
              <div className={styles.submissionStatusControl}>
                <label htmlFor={`submission-status-${submission.id}`}>Status</label>
                <div><select id={`submission-status-${submission.id}`} value={draftStatus} disabled={saving} onChange={(event) => setDraftStatuses((current) => ({ ...current, [submission.id]: event.target.value as DeskSubmissionStatus }))}>
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <ActionButton size="compact" loading={saving} loadingLabel="Saving…" disabled={!statusChanged || savingId !== null} onClick={() => { void saveStatus(submission); }}>Save status</ActionButton></div>
              </div>
            </div>
          </details>;
        })}
      </section>
    </> : null}
  </section>;
}
