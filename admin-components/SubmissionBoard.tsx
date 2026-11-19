"use client";
/* eslint-disable @next/next/no-img-element -- signed private storage URLs cannot use the static image optimizer. */

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import styles from "@/app/admin/admin.module.css";
import { AdminDataState } from "@/admin-components/AdminDataState";
import { ActionButton } from "@/admin-components/ActionButton";
import type { DeskSubmissionStatus, GardenDeskSubmission } from "@/admin-lib/admin/submissions";

import { compressImageFile } from "@/admin-lib/compress-image";

type WorkflowType = "feature_request" | "bug_report";

const workflowCopy = {
  feature_request: { eyebrow: "Feature requests", title: "What gardeners want next", description: "Move ideas through a clear editorial review.", columns: ["new", "reviewing", "planned", "in_progress", "done"] },
  bug_report: { eyebrow: "Bug reports", title: "Reports to investigate", description: "Keep every report visible until the work is done.", columns: ["new", "reviewing", "in_progress", "done"] },
} as const;

const labels: Record<DeskSubmissionStatus, string> = { new: "New", reviewing: "Reviewing", planned: "Planned", in_progress: "In progress", done: "Done" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date(value));
}

function hasUsefulTitle(submission: GardenDeskSubmission) {
  const genericTitle = submission.type === "bug_report" ? "bug report" : "feature request";
  return Boolean(submission.title && submission.title.trim().toLowerCase() !== genericTitle);
}

function ManualSubmissionDialog({ type, onClose, onCreated }: { type: WorkflowType; onClose: () => void; onCreated: (submission: GardenDeskSubmission, warning?: string) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const label = type === "bug_report" ? "bug report" : "feature request";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("title", title);
      formData.set("message", message);
      if (imageFile) formData.set("image", await compressImageFile(imageFile), "screenshot.jpg");
      const response = await fetch("/api/admin/submissions", {
        method: "POST",
        body: formData,
      });
      const data = await response.json() as { submission?: GardenDeskSubmission; error?: string; warning?: string };
      if (!response.ok || !data.submission) throw new Error(data.error || `Could not add this ${label}.`);
      onCreated(data.submission, data.warning);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `Could not add this ${label}.`);
    } finally {
      setSaving(false);
    }
  }

  return <dialog ref={dialogRef} className={styles.submissionCreateDialog} aria-labelledby="manual-submission-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <form onSubmit={submit}>
      <header><div><p className={styles.eyebrow}>Luke’s Apps</p><h2 id="manual-submission-title">Add {label}</h2><p>This will be recorded as a manual Luke’s Apps entry under your account.</p></div><ActionButton size="compact" variant="secondary" disabled={saving} onClick={onClose}>Close</ActionButton></header>
      <label htmlFor="manual-submission-title-input">Short title<input id="manual-submission-title-input" value={title} maxLength={180} required autoFocus onChange={(event) => setTitle(event.target.value)} placeholder={type === "bug_report" ? "What is going wrong?" : "What should Sow do?"} /></label>
      <label htmlFor="manual-submission-message">Details<textarea id="manual-submission-message" value={message} maxLength={10_000} required onChange={(event) => setMessage(event.target.value)} placeholder={type === "bug_report" ? "What happened, and what did you expect instead?" : "Describe the idea, need, or context."} /></label>
      {type === "bug_report" ? <div className={styles.submissionCreateImage}><label htmlFor="manual-submission-image">Screenshot <span>Optional</span></label><input id="manual-submission-image" type="file" accept="image/*" disabled={saving} onChange={(event) => { void handleImageChange(event); }} />{imagePreview ? <img src={imagePreview} alt="Screenshot preview" /> : null}</div> : null}
      {error ? <p className={styles.submissionCreateError} role="alert">{error}</p> : null}
      <footer><ActionButton size="compact" variant="secondary" disabled={saving} onClick={onClose}>Cancel</ActionButton><ActionButton size="compact" type="submit" loading={saving} loadingLabel="Adding…">Add {label}</ActionButton></footer>
    </form>
  </dialog>;
}

export function SubmissionBoard({ type, onToast }: { type: WorkflowType; onToast: (message: string) => void }) {
  const copy = workflowCopy[type];
  const [submissions, setSubmissions] = useState<GardenDeskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<DeskSubmissionStatus | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions?type=${type}`);
      const data = await response.json() as { submissions?: GardenDeskSubmission[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load submissions.");
      setSubmissions(data.submissions ?? []);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load submissions.");
    } finally { setLoading(false); }
  }, [type]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function updateStatus(submission: GardenDeskSubmission, status: DeskSubmissionStatus) {
    if (status === submission.status) return;
    const originalStatus = submission.status;
    setSavingId(submission.id);
    setSubmissions((current) => current.map((item) => item.id === submission.id ? { ...item, status } : item));
    setAnnouncement(`Moving ${submission.person.display_name || "submission"} to ${labels[status]}.`);
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json() as { submission?: GardenDeskSubmission; error?: string };
      if (!response.ok || !data.submission) throw new Error(data.error || "Could not update this submission.");
      setSubmissions((current) => current.map((item) => item.id === submission.id ? data.submission! : item));
      setAnnouncement(`${submission.person.display_name || "Submission"} moved to ${labels[data.submission.status]}.`);
      onToast(`Marked ${labels[data.submission.status].toLowerCase()}.`);
    } catch (caught) {
      setSubmissions((current) => current.map((item) => item.id === submission.id ? { ...item, status: originalStatus } : item));
      setAnnouncement(`Could not move ${submission.person.display_name || "submission"}. It returned to ${labels[originalStatus]}.`);
      onToast(caught instanceof Error ? caught.message : "Could not update this submission.");
    } finally { setSavingId(null); }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, submission: GardenDeskSubmission) {
    if (savingId !== null) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", submission.id);
    setDraggingId(submission.id);
    setAnnouncement(`Moving ${submission.person.display_name || "submission"}. Choose a status column to drop it.`);
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: DeskSubmissionStatus) {
    event.preventDefault();
    const submissionId = event.dataTransfer.getData("text/plain") || draggingId;
    const submission = submissions.find((item) => item.id === submissionId);
    setDraggingId(null);
    setDropStatus(null);
    if (!submission || savingId !== null) return;
    void updateStatus(submission, status);
  }

  return <section className={styles.submissionWorkspace}>
    <header className={styles.compactHeader}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><span>{copy.description}</span></div><div className={styles.submissionBoardActions}><ActionButton size="compact" onClick={() => setAdding(true)}>Add {type === "bug_report" ? "bug report" : "feature request"}</ActionButton><ActionButton size="compact" variant="secondary" loading={loading} loadingLabel="Refreshing…" disabled={savingId !== null} onClick={() => { void load(); }}>Refresh</ActionButton></div></header>
    {loading ? <AdminDataState state="loading" title="Loading submissions…" description="Checking notes from gardeners." /> : null}
    {!loading && error ? <AdminDataState state="error" title="Submissions could not load." description={`${error} No data has been changed.`} onRetry={() => { void load(); }} /> : null}
    {!loading && !error && submissions.length === 0 ? <AdminDataState state="empty" title={`No ${type === "bug_report" ? "bug reports" : "feature requests"} yet.`} description="New submissions will appear here." /> : null}
    {!loading && !error && submissions.length > 0 ? <><p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</p><div className={styles.submissionBoard} aria-label={`${copy.eyebrow} by status`}>
      {copy.columns.map((status) => <section className={`${styles.submissionBoardColumn} ${dropStatus === status ? styles.submissionBoardDropTarget : ""}`} key={status} onDragEnter={() => { if (draggingId) setDropStatus(status); }} onDragOver={(event) => { if (draggingId && savingId === null) event.preventDefault(); }} onDrop={(event) => handleDrop(event, status)}><header><h2>{labels[status]}</h2><span>{submissions.filter((submission) => submission.status === status).length}</span></header>
        {submissions.filter((submission) => submission.status === status).map((submission) => <article className={`${styles.submissionBoardCard} ${draggingId === submission.id ? styles.submissionBoardCardDragging : ""}`} key={submission.id} draggable={savingId === null} onDragStart={(event) => handleDragStart(event, submission)} onDragEnd={() => { setDraggingId(null); setDropStatus(null); }} aria-label={`${submission.person.display_name || "Submission"}, ${labels[submission.status]}. Drag to move, or use the status selector.`}>
          <strong>{submission.person.display_name || "A gardener"}</strong><small>{submission.person.email} · {formatDate(submission.receivedAt)}</small>{hasUsefulTitle(submission) ? <h3>{submission.title}</h3> : null}<p>{submission.message || submission.title || "No written note."}</p>
          {submission.attachments[0] ? <a className={styles.submissionBoardAttachment} href={submission.attachments[0].signedUrl} target="_blank" rel="noreferrer" aria-label={`Open ${submission.attachments[0].filename ?? "attached image"} in a new tab`}><img src={submission.attachments[0].signedUrl} alt={submission.attachments[0].filename ? `Attachment: ${submission.attachments[0].filename}` : "Attached image"} /></a> : null}
          <label htmlFor={`board-status-${submission.id}`}>Move to status</label><select id={`board-status-${submission.id}`} value={submission.status} disabled={savingId !== null} onChange={(event) => { void updateStatus(submission, event.target.value as DeskSubmissionStatus); }}>
            {copy.columns.map((option) => <option key={option} value={option}>{labels[option]}</option>)}
          </select>
        </article>)}</section>)}
    </div></> : null}
    {adding ? <ManualSubmissionDialog type={type} onClose={() => setAdding(false)} onCreated={(submission, warning) => { setSubmissions((current) => [submission, ...current]); setAnnouncement(`${labelForType(type)} added to New.`); onToast(warning || `${type === "bug_report" ? "Bug report" : "Feature request"} added.`); }} /> : null}
  </section>;
}

function labelForType(type: WorkflowType) {
  return type === "bug_report" ? "Bug report" : "Feature request";
}
