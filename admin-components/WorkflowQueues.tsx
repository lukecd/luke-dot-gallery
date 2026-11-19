"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import styles from "@/app/admin/admin.module.css";
import { AdminDataState, AdminRefreshStatus } from "@/admin-components/AdminDataState";
import { ConfirmationDialog } from "@/admin-components/ConfirmationDialog";
import { ActionButton } from "@/admin-components/ActionButton";

type BetaRequest = {
  id: string;
  status: string;
  device: string;
  name: string;
  email: string;
  note: string;
  delivery: { id: string; status: string } | null;
};

type PlantJob = {
  id: string;
  requested_plant_name: string;
  botanical_name: string | null;
  status: string;
  created_at: string;
  canonical_name: string | null;
  canonical_key: string | null;
  canonical_aliases: string[];
  last_error: string | null;
  app_pr_url: string | null;
  app_pr_error: string | null;
  requester: { display_name: string | null; email: string } | null;
  assets: Array<{ id: string; attempt: number; status: string; createdAt: string; signedUrl: string | null; downloadUrl: string | null; downloadName: string }>;
};

type PlantMetrics = { queued: number; generating: number; ready: number; generated: number; sent: number };

const PLANT_QUEUE_REFRESH_MS = 15_000;

const plantStatusCopy: Record<string, string> = {
  queued: "Waiting for background generation",
  generating: "Generating illustration",
  awaiting_review: "Candidate ready for review",
  failed: "Generation needs attention",
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function WorkflowNotice({ children }: { children: React.ReactNode }) {
  return <p className={styles.workflowNotice}>{children}</p>;
}

function PlantApprovalDialog({ count, busy, onApprove, onCancel }: { count: number; busy: boolean; onApprove: () => void; onCancel: () => void }) {
  return <ConfirmationDialog eyebrow="Confirm approval" title={`Approve ${count} illustration${count === 1 ? "" : "s"}?`} description="This creates or updates one app pull request and sends each requester their illustration by email." confirmLabel="Approve and send" busy={busy} busyLabel={`Approving ${count}…`} onConfirm={onApprove} onCancel={onCancel} />;
}

function PlantReviewDialog({
  job,
  index,
  count,
  onClose,
  onPrevious,
  onNext,
  onApprove,
  onDelete,
  onRetryAppHandoff,
  retryingAppHandoff,
  canonicalName,
  aliases,
  editingIdentity,
  savingIdentity,
  onStartIdentityEdit,
  onCancelIdentityEdit,
  onCanonicalNameChange,
  onAliasesChange,
  onSaveIdentity,
}: {
  job: PlantJob;
  index: number;
  count: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onRetryAppHandoff: () => void;
  retryingAppHandoff: boolean;
  canonicalName: string;
  aliases: string;
  editingIdentity: boolean;
  savingIdentity: boolean;
  onStartIdentityEdit: () => void;
  onCancelIdentityEdit: () => void;
  onCanonicalNameChange: (value: string) => void;
  onAliasesChange: (value: string) => void;
  onSaveIdentity: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [checkerboard, setCheckerboard] = useState(false);
  const [actualSize, setActualSize] = useState(false);
  const candidate = job.assets[0];
  const deletable = ["queued", "awaiting_review", "failed"].includes(job.status);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return <dialog ref={dialogRef} className={styles.plantReviewDialog} aria-labelledby="plant-review-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={(event) => {
    if (event.key === "ArrowLeft" && index > 0) { event.preventDefault(); onPrevious(); }
    if (event.key === "ArrowRight" && index < count - 1) { event.preventDefault(); onNext(); }
  }}>
    <header className={styles.plantReviewHeader}>
      <div><p className={styles.eyebrow}>Illustration review</p><h2 id="plant-review-title">{job.requested_plant_name}</h2><span>{index + 1} of {count}</span></div>
      <ActionButton size="compact" variant="secondary" onClick={onClose}>Close</ActionButton>
    </header>
    <div className={styles.plantReviewLayout}>
      <section className={`${styles.plantReviewStage} ${checkerboard ? styles.plantReviewCheckerboard : ""}`} aria-label={`Candidate illustration for ${job.requested_plant_name}`}>
        {candidate?.signedUrl ? <img className={actualSize ? styles.plantReviewImageActual : styles.plantReviewImage} src={candidate.signedUrl} alt={`Candidate illustration for ${job.requested_plant_name}`} /> : <p>No candidate image is available.</p>}
      </section>
      <aside className={styles.plantReviewDetails}>
        <dl><div><dt>Requester</dt><dd>{job.requester?.display_name ?? "A gardener"}<small>{job.requester?.email ?? "No email provided"}</small></dd></div><div><dt>Identity for app</dt><dd>{editingIdentity ? <div className={styles.plantTableFields}><label>Scientific name (Latin)<input value={canonicalName} onChange={(event) => onCanonicalNameChange(event.target.value)} /></label><label>Names people use<input value={aliases} onChange={(event) => onAliasesChange(event.target.value)} /></label><div className={styles.plantReviewControls}><ActionButton size="compact" loading={savingIdentity} loadingLabel="Saving…" disabled={!canonicalName.trim()} onClick={onSaveIdentity}>Save</ActionButton><ActionButton size="compact" variant="secondary" disabled={savingIdentity} onClick={onCancelIdentityEdit}>Cancel</ActionButton></div></div> : <>{canonicalName || "Scientific name needed"}<small>{aliases || job.requested_plant_name}</small><ActionButton size="compact" variant="secondary" onClick={onStartIdentityEdit}>Edit identity</ActionButton></>}</dd></div><div><dt>Status</dt><dd>{plantStatusCopy[job.status] ?? job.status.replaceAll("_", " ")}</dd></div><div><dt>App handoff</dt><dd>{job.app_pr_url ? <a className={styles.plantReviewAppLink} href={job.app_pr_url} target="_blank" rel="noreferrer">View app pull request</a> : <><span className={job.app_pr_error ? styles.plantError : undefined}>{job.app_pr_error ? "App pull request failed" : "No app pull request recorded"}</span><small>{job.app_pr_error ?? "The requester email was sent, but no app pull request was created."}</small><ActionButton size="compact" loading={retryingAppHandoff} loadingLabel="Retrying…" disabled={!canonicalName.trim()} onClick={onRetryAppHandoff}>Retry app PR</ActionButton></>}</dd></div></dl>
        <div className={styles.plantReviewControls}><ActionButton size="compact" variant="secondary" onClick={() => setCheckerboard((current) => !current)}>{checkerboard ? "Cream background" : "Check transparency"}</ActionButton><ActionButton size="compact" variant="secondary" onClick={() => setActualSize(true)}>Actual size</ActionButton>{actualSize && <ActionButton size="compact" variant="secondary" onClick={() => setActualSize(false)}>Fit image</ActionButton>}</div>
        <div className={styles.plantReviewActions}><ActionButton size="compact" variant="secondary" disabled={index === 0} onClick={onPrevious}>Previous</ActionButton><ActionButton size="compact" variant="secondary" disabled={index === count - 1} onClick={onNext}>Next</ActionButton>{job.status === "awaiting_review" && <ActionButton size="compact" onClick={onApprove}>Approve</ActionButton>}{deletable && <ActionButton size="compact" variant="secondary" className={styles.plantTableDelete} onClick={onDelete}>Delete</ActionButton>}</div>
      </aside>
    </div>
  </dialog>;
}

export function BetaWorkflowQueue({ onToast }: { onToast: (message: string) => void }) {
  const [requests, setRequests] = useState<BetaRequest[]>([]);
  const [configured, setConfigured] = useState(false);
  const [publicLink, setPublicLink] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingSendIds, setPendingSendIds] = useState<string[] | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    try {
      const queueResponse = await fetch("/api/admin/workflows/beta");
      const queue = await queueResponse.json();
      if (!queueResponse.ok) throw new Error(queue.error || "Could not load invitations.");
      setRequests(queue.requests); setConfigured(queue.configured); setPublicLink(queue.publicLink ?? "");
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load invitations.";
      setLoadError(message);
      onToast(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onToast]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void load(true); }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [load]);

  const unsentRequests = requests.filter((request) => request.status !== "invited" && request.delivery?.status !== "sent");
  const selectedUnsentIds = selectedIds.filter((id) => unsentRequests.some((request) => request.id === id));

  function toggleSelection(requestId: string) {
    setSelectedIds((current) => current.includes(requestId) ? current.filter((id) => id !== requestId) : [...current, requestId]);
  }

  async function savePublicLink() {
    setBusy("setting");
    try {
      const response = await fetch("/api/admin/settings/testflight", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicLink }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save the TestFlight link.");
      setPublicLink(data.publicLink); setConfigured(Boolean(data.publicLink)); onToast("TestFlight link saved.");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Could not save the TestFlight link.");
    } finally { setBusy(null); }
  }

  async function sendSelected() {
    if (!pendingSendIds?.length) return;
    setBusy("send");
    try {
      const response = await fetch("/api/admin/workflows/beta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestIds: pendingSendIds }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send invitations.");
      const sent = data.outcomes.filter((outcome: { status: string }) => outcome.status === "sent").length;
      const failed = data.outcomes.length - sent;
      onToast(failed ? `${sent} invitation${sent === 1 ? "" : "s"} sent. ${failed} need attention.` : `${sent} invitation${sent === 1 ? "" : "s"} sent.`);
      setPendingSendIds(null); setSelectedIds([]); await load();
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Could not send invitations.");
    } finally { setBusy(null); }
  }
  async function removeTestFlightRequest() {
    if (!pendingRemoveId) return;
    setBusy(`remove:${pendingRemoveId}`);
    try {
      const response = await fetch(`/api/admin/workflows/beta/${pendingRemoveId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not remove this TestFlight request.");
      setPendingRemoveId(null); setSelectedIds((current) => current.filter((id) => id !== pendingRemoveId)); await load();
    } catch (error) { onToast(error instanceof Error ? error.message : "Could not remove this TestFlight request."); }
    finally { setBusy(null); }
  }

  return <div className={styles.specialWorkspace}>
    <section className={styles.betaSummary}>
      <div><p className={styles.eyebrow}>TestFlight invitations</p><h2>Invite gardeners with one clear email.</h2><p>Set the TestFlight link, write the exact invitation, then select who should receive it. Every sent email is recorded here.</p></div>
      <div><strong>{loading ? "—" : unsentRequests.length}</strong><span>ready to invite</span><strong>{loading ? "—" : requests.filter((request) => request.status === "invited" || request.delivery?.status === "sent").length}</strong><span>sent</span></div>
    </section>
    {loading ? <AdminDataState state="loading" title="Loading TestFlight invitations…" description="Checking applications and the saved invitation email." /> : loadError && requests.length === 0 ? <AdminDataState state="error" title="TestFlight invitations could not load." description={`${loadError} No invitations have been sent.`} onRetry={() => { void load(true); }} /> : <>
    {loadError && requests.length > 0 && <AdminDataState state="error" title="TestFlight invitations could not refresh." description={`${loadError} The previously loaded invitations are still shown.`} onRetry={() => { void load(); }} />}
    {refreshing && <AdminRefreshStatus />}
    <section className={styles.workflowSetting}>
      <label htmlFor="testflight-public-link">TestFlight public link</label>
      <div><input id="testflight-public-link" type="url" value={publicLink} onChange={(event) => setPublicLink(event.target.value)} placeholder="https://testflight.apple.com/join/…" /><ActionButton size="compact" loading={busy === "setting"} loadingLabel="Saving…" disabled={busy !== null} onClick={savePublicLink}>Save link</ActionButton></div>
      <p>Required before sending. This is the exact link placed into every invitation.</p>
    </section>
    <p className={styles.workflowTemplateNote}>The saved plain-text invitation is shared by every TestFlight send. <Link href="/admin?view=emails#testflight-invitation-v1">Edit email template</Link></p>
    {pendingSendIds && <ConfirmationDialog eyebrow="TestFlight invitations" title={`Send ${pendingSendIds.length} invitation${pendingSendIds.length === 1 ? "" : "s"}?`} description="This will email the selected gardeners immediately using the saved message and TestFlight link." confirmLabel="Send invitations now" busy={busy === "send"} busyLabel="Sending…" onConfirm={() => { void sendSelected(); }} onCancel={() => setPendingSendIds(null)} />}
    {pendingRemoveId && <ConfirmationDialog eyebrow="Remove from TestFlight" title="Remove this request?" description="This removes only this TestFlight request. The person and their other Luke’s Apps records remain." confirmLabel="Remove from TestFlight" destructive busy={busy === `remove:${pendingRemoveId}`} busyLabel="Removing…" onConfirm={() => { void removeTestFlightRequest(); }} onCancel={() => setPendingRemoveId(null)} />}
    {requests.length === 0 ? <AdminDataState state="empty" title="No TestFlight requests yet." description="New website applications will appear here." /> : <section className={styles.betaTable}>
      <div className={styles.workflowBulkActions}><label><input type="checkbox" checked={unsentRequests.length > 0 && selectedUnsentIds.length === unsentRequests.length} onChange={() => setSelectedIds(selectedUnsentIds.length === unsentRequests.length ? [] : unsentRequests.map((request) => request.id))} /> Select all ready</label><ActionButton className={styles.primaryWorkflowButton} size="compact" disabled={!configured || selectedUnsentIds.length === 0 || busy !== null} onClick={() => setPendingSendIds(selectedUnsentIds)}>Review and send {selectedUnsentIds.length || ""}</ActionButton></div>
      <div className={styles.betaColumns}><span aria-hidden="true" /><span>Applicant</span><span>Note</span><span>Device</span><span>Status</span><span>Action</span></div>
      {requests.map((request) => {
        const sent = request.status === "invited" || request.delivery?.status === "sent";
        return <article key={request.id}>
          <label><input type="checkbox" disabled={sent} checked={selectedIds.includes(request.id)} onChange={() => toggleSelection(request.id)} /><span className={styles.srOnly}>Select {request.name}</span></label>
          <div><strong>{request.name}</strong><small>{request.email}</small></div>
          <p>{request.note || "No additional note."}</p>
          <span>{request.device}</span>
          <span>{sent ? "Invitation sent" : "Ready to invite"}</span>
          <div className={styles.workflowButtons}><ActionButton className={styles.primaryWorkflowButton} size="compact" disabled={sent || !configured || busy !== null} onClick={() => setPendingSendIds([request.id])}>{sent ? "Sent" : "Review and send"}</ActionButton><ActionButton className={styles.secondaryWorkflowButton} size="compact" variant="secondary" disabled={busy !== null} onClick={() => setPendingRemoveId(request.id)}>Remove</ActionButton></div>
        </article>;
      })}
    </section>}</>}
  </div>;
}

export function PlantWorkflowQueue({ onToast }: { onToast: (message: string) => void }) {
  const [jobs, setJobs] = useState<PlantJob[]>([]);
  const [configured, setConfigured] = useState(false);
  const [metrics, setMetrics] = useState<PlantMetrics>({ queued: 0, generating: 0, ready: 0, generated: 0, sent: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [canonicalNames, setCanonicalNames] = useState<Record<string, string>>({});
  const [aliasInputs, setAliasInputs] = useState<Record<string, string>>({});
  const [savingIdentity, setSavingIdentity] = useState<string | null>(null);
  const [editingIdentity, setEditingIdentity] = useState<Record<string, boolean>>({});
  const [queueFilter, setQueueFilter] = useState<"queued" | "awaiting_review" | "needs_identity" | "generating" | "complete" | "failed">("awaiting_review");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [approvalDialogIds, setApprovalDialogIds] = useState<string[] | null>(null);
  const [reviewJobId, setReviewJobId] = useState<string | null>(null);
  const [pendingPlantDelete, setPendingPlantDelete] = useState<PlantJob | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const reviewTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await fetch("/api/admin/workflows/plants");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load plant requests.");
      setJobs(data.jobs);
      setConfigured(data.configured);
      setMetrics(data.metrics ?? { queued: 0, generating: 0, ready: 0, generated: 0, sent: 0 });
      setQueueFilter((current) => current === "awaiting_review" && data.jobs.some((job: PlantJob) => job.status === "queued") && !data.jobs.some((job: PlantJob) => job.status === "awaiting_review") ? "queued" : current);
      setLastUpdated(new Date());
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load plant requests.";
      setLoadError(message);
      onToast(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onToast]);
  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void load(true); }, 0);
    const interval = window.setInterval(() => { void load().catch(() => undefined); }, PLANT_QUEUE_REFRESH_MS);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [load]);

  function canonicalName(job: PlantJob) {
    return canonicalNames[job.id] ?? job.canonical_name ?? job.botanical_name ?? "";
  }

  function aliases(job: PlantJob) {
    const raw = aliasInputs[job.id] ?? (job.canonical_aliases?.length ? job.canonical_aliases.join(", ") : job.requested_plant_name);
    return raw.split(",").map((alias) => alias.trim()).filter(Boolean);
  }

  function canonicalKey(value: string) {
    return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  async function saveIdentity(job: PlantJob) {
    setSavingIdentity(job.id);
    try {
      const response = await fetch(`/api/admin/workflows/plants/${job.id}/identity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canonicalName: canonicalName(job), aliases: aliases(job) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save this plant identity.");
      setCanonicalNames((current) => ({ ...current, [job.id]: data.identity.canonicalName }));
      setAliasInputs((current) => ({ ...current, [job.id]: data.identity.aliases.join(", ") }));
      setEditingIdentity((current) => ({ ...current, [job.id]: false }));
      onToast("Canonical identity saved. No approval action has been taken.");
      await load();
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Could not save this plant identity.");
    } finally {
      setSavingIdentity(null);
    }
  }

  async function approveJobs(jobIds: string[]) {
    if (!jobIds.length) return;
    setBusy("approve");
    try {
      const response = await fetch("/api/admin/workflows/plants/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not approve the illustrations.");
      const completed = data.outcomes.filter((outcome: { status: string }) => outcome.status === "completed").length;
      const failed = data.outcomes.length - completed;
      onToast(failed ? `${completed} approved. ${failed} need attention.` : `${completed} illustration${completed === 1 ? "" : "s"} approved, handed to the app, and emailed.`);
      setApprovalDialogIds(null);
      setSelectedIds([]);
      await load();
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Could not approve the illustrations.");
    } finally {
      setBusy(null);
    }
  }

  async function approveSelected() {
    if (approvalDialogIds) await approveJobs(approvalDialogIds);
  }

  async function retryDelivery(job: PlantJob, action: "handoff" | "email") {
    setBusy(`${action}:${job.id}`);
    try {
      const response = await fetch(`/api/admin/workflows/plants/${job.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "handoff" ? { canonicalName: canonicalName(job), aliases: aliases(job) } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not retry this delivery.");
      onToast(action === "handoff" ? "App pull request created." : "Requester email sent.");
      await load();
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Could not retry this delivery.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteJob(job: PlantJob) {
    setBusy(`delete:${job.id}`);
    try {
      const response = await fetch(`/api/admin/workflows/plants/${job.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete this illustration request.");
      onToast("Illustration request deleted.");
      setSelectedIds((current) => current.filter((id) => id !== job.id));
      setReviewJobId(null);
      await load();
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Could not delete this illustration request.");
    } finally {
      setBusy(null);
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (queueFilter === "needs_identity") return job.status === "awaiting_review" && !job.canonical_name && !job.botanical_name;
    if (queueFilter === "complete") return job.status === "approved" || job.status === "sent";
    return job.status === queueFilter;
  });
  const readyJobs = filteredJobs.filter((job) => job.status === "awaiting_review");
  const selectedReadyIds = selectedIds.filter((id) => readyJobs.some((job) => job.id === id));
  const reviewIndex = filteredJobs.findIndex((job) => job.id === reviewJobId);
  const reviewJob = reviewIndex >= 0 ? filteredJobs[reviewIndex] : null;

  function closeReview() {
    const currentId = reviewJobId;
    setReviewJobId(null);
    if (currentId) window.requestAnimationFrame(() => reviewTriggerRefs.current[currentId]?.focus());
  }

  function toggleSelection(jobId: string) {
    setSelectedIds((current) => current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]);
  }

  function toggleAllReady() {
    setSelectedIds(selectedReadyIds.length === readyJobs.length ? [] : readyJobs.map((job) => job.id));
  }

  return <div className={styles.specialWorkspace}>
    <section className={styles.plantQueueHeader}>
      <div><p className={styles.eyebrow}>Illustration queue</p><h2>Illustrations in motion.</h2><p>See what is waiting to generate, ready to review, or already on its way to a gardener.</p></div>
      <div><strong>{loading ? "—" : metrics.queued}</strong><span>queued</span><strong>{loading ? "—" : metrics.ready}</strong><span>ready</span><strong>{loading ? "—" : metrics.generating}</strong><span>generating</span><strong>{loading ? "—" : metrics.generated}</strong><span>generated</span><strong>{loading ? "—" : metrics.sent}</strong><span>sent to gardeners</span></div>
    </section>
    {loading ? <AdminDataState state="loading" title="Loading plant requests…" description="Checking the illustration queue and requester email." /> : loadError && !lastUpdated ? <AdminDataState state="error" title="Plant requests could not load." description={`${loadError} No generation, approval, email, or app handoff has been started.`} onRetry={() => { void load(true); }} /> : <>
    {loadError && lastUpdated && <AdminDataState state="error" title="Plant requests could not refresh." description={`${loadError} The previously loaded queue is still shown.`} onRetry={() => { void load(); }} />}
    {!configured && <WorkflowNotice>Add the server-only <code>OPENAI_API_KEY</code> to enable generation. The queue is ready; no image will be made until it is configured.</WorkflowNotice>}
    {lastUpdated && <p className={styles.plantRefreshNote}>Last checked {formatTimestamp(lastUpdated.toISOString())}. Refreshes every 15 seconds. {refreshing && <AdminRefreshStatus />}</p>}
    <p className={styles.workflowTemplateNote}>Requester email: <Link href="/admin?view=emails#plant-illustration-ready-v1">Edit email template</Link>. The approved illustration is attached automatically.</p>
    {jobs.length === 0 ? <AdminDataState state="empty" title="No plant suggestions yet." description="A suggestion from the contact form will create the first job automatically." /> : <>
      <div className={styles.plantQueueTabs} role="tablist" aria-label="Illustration queue filters">
        <button type="button" role="tab" aria-selected={queueFilter === "queued"} onClick={() => setQueueFilter("queued")}>Queued <span>{jobs.filter((job) => job.status === "queued").length}</span></button>
        <button type="button" role="tab" aria-selected={queueFilter === "awaiting_review"} onClick={() => setQueueFilter("awaiting_review")}>Ready to approve <span>{jobs.filter((job) => job.status === "awaiting_review").length}</span></button>
        <button type="button" role="tab" aria-selected={queueFilter === "needs_identity"} onClick={() => setQueueFilter("needs_identity")}>Needs identity <span>{jobs.filter((job) => job.status === "awaiting_review" && !job.canonical_name && !job.botanical_name).length}</span></button>
        <button type="button" role="tab" aria-selected={queueFilter === "generating"} onClick={() => setQueueFilter("generating")}>Generating <span>{jobs.filter((job) => job.status === "generating").length}</span></button>
        <button type="button" role="tab" aria-selected={queueFilter === "complete"} onClick={() => setQueueFilter("complete")}>Complete <span>{jobs.filter((job) => job.status === "approved" || job.status === "sent").length}</span></button>
        <button type="button" role="tab" aria-selected={queueFilter === "failed"} onClick={() => setQueueFilter("failed")}>Failed <span>{jobs.filter((job) => job.status === "failed").length}</span></button>
      </div>
      {selectedReadyIds.length > 0 && <div className={styles.plantBulkBar}><strong>{selectedReadyIds.length} selected</strong><ActionButton size="compact" disabled={busy !== null} onClick={() => setApprovalDialogIds(selectedReadyIds)}>Approve {selectedReadyIds.length} selected</ActionButton></div>}
      {filteredJobs.length === 0 ? <WorkflowNotice>Nothing in this view right now.</WorkflowNotice> : <div className={styles.plantTableScroll}><table className={styles.plantTable}>
        <thead><tr><th scope="col"><input type="checkbox" aria-label="Select all ready candidates" checked={readyJobs.length > 0 && selectedReadyIds.length === readyJobs.length} onChange={toggleAllReady} /></th><th scope="col">Candidate</th><th scope="col">Request</th><th scope="col">Identity for app</th><th scope="col">Requester</th><th scope="col">Status</th><th scope="col"><span className={styles.srOnly}>Actions</span></th></tr></thead>
        <tbody>{filteredJobs.map((job) => {
          const candidate = job.assets[0];
          const editable = job.status === "awaiting_review";
          return <tr key={job.id} className={editingIdentity[job.id] ? styles.plantTableEditing : undefined}>
            <td><input type="checkbox" disabled={!editable} checked={selectedIds.includes(job.id)} onChange={() => toggleSelection(job.id)} aria-label={`Select ${job.requested_plant_name}`} /></td>
            <td>{candidate?.signedUrl ? <button type="button" className={styles.plantTablePreviewButton} ref={(element) => { reviewTriggerRefs.current[job.id] = element; }} onClick={() => setReviewJobId(job.id)} aria-label={`Review candidate for ${job.requested_plant_name}`}><img className={styles.plantTablePreview} src={candidate.signedUrl} alt="" /></button> : <div className={styles.plantTablePreviewMissing}>No candidate</div>}{candidate?.downloadUrl && <a className={styles.plantTableDownload} href={candidate.downloadUrl}>Download</a>}</td>
            <td><strong>{job.requested_plant_name}</strong><small>Requested {formatTimestamp(job.created_at)}</small></td>
            <td>{editingIdentity[job.id] ? <div className={styles.plantTableFields}>
              <label>Scientific name (Latin)<input value={canonicalName(job)} onChange={(event) => setCanonicalNames((current) => ({ ...current, [job.id]: event.target.value }))} placeholder="For example, Myosotis…" aria-label="Scientific name in Latin" /></label>
              <code>{canonicalKey(canonicalName(job)) || "canonical-key"}</code>
              <label>Names people use<input value={aliasInputs[job.id] ?? (job.canonical_aliases?.length ? job.canonical_aliases.join(", ") : job.requested_plant_name)} onChange={(event) => setAliasInputs((current) => ({ ...current, [job.id]: event.target.value }))} placeholder="Comma-separated aliases" aria-label="Names people use" /></label>
              <ActionButton size="compact" loading={savingIdentity === job.id} loadingLabel="Saving…" disabled={savingIdentity !== null || !canonicalKey(canonicalName(job))} onClick={() => saveIdentity(job)}>Save</ActionButton>
            </div> : <div className={styles.plantTableIdentity}>{canonicalName(job) ? <><em>{canonicalName(job)}</em><code>{canonicalKey(canonicalName(job))}</code></> : <em className={styles.plantIdentityMissing}>Scientific name needed</em>}<small>{aliases(job).join(", ")}</small></div>}</td>
            <td><strong>{job.requester?.display_name ?? "A gardener"}</strong><small>{job.requester?.email ?? "No email provided"}</small></td>
            <td><span className={styles.plantTableStatus}>{plantStatusCopy[job.status] ?? job.status.replaceAll("_", " ")}</span>{job.last_error && <small className={styles.plantError}>{job.last_error}</small>}</td>
            <td><div className={styles.plantTableActions}>{editable && <ActionButton size="compact" variant="secondary" className={styles.plantTableEdit} onClick={() => setEditingIdentity((current) => ({ ...current, [job.id]: !current[job.id] }))}>{editingIdentity[job.id] ? "Cancel" : "Edit"}</ActionButton>}{editable && selectedReadyIds.length === 0 && <ActionButton size="compact" disabled={busy !== null || !canonicalName(job)} title={canonicalName(job) ? undefined : "Set the scientific name before approving."} onClick={() => setApprovalDialogIds([job.id])}>Approve</ActionButton>}{["queued", "awaiting_review", "failed"].includes(job.status) && <ActionButton size="compact" variant="secondary" className={styles.plantTableDelete} loading={busy === `delete:${job.id}`} loadingLabel="Deleting…" disabled={busy !== null} onClick={() => setPendingPlantDelete(job)}>Delete</ActionButton>}{job.app_pr_url && <a href={job.app_pr_url} target="_blank" rel="noreferrer">App PR</a>}{job.app_pr_error && <><small className={styles.plantError}>App handoff needs retry.</small><ActionButton size="compact" loading={busy === `handoff:${job.id}`} loadingLabel="Retrying…" disabled={busy !== null} onClick={() => { void retryDelivery(job, "handoff"); }}>Retry app PR</ActionButton></>}{job.status === "approved" && <ActionButton size="compact" loading={busy === `email:${job.id}`} loadingLabel="Sending…" disabled={busy !== null} onClick={() => { void retryDelivery(job, "email"); }}>Retry email</ActionButton>}</div></td>
          </tr>;
        })}</tbody>
      </table></div>}
    </>}</>}
    {reviewJob && <PlantReviewDialog key={reviewJob.id} job={reviewJob} index={reviewIndex} count={filteredJobs.length} onClose={closeReview} onPrevious={() => setReviewJobId(filteredJobs[reviewIndex - 1]?.id ?? null)} onNext={() => setReviewJobId(filteredJobs[reviewIndex + 1]?.id ?? null)} onApprove={() => { closeReview(); setApprovalDialogIds([reviewJob.id]); }} onDelete={() => setPendingPlantDelete(reviewJob)} onRetryAppHandoff={() => { void retryDelivery(reviewJob, "handoff"); }} retryingAppHandoff={busy === `handoff:${reviewJob.id}`} canonicalName={canonicalName(reviewJob)} aliases={aliasInputs[reviewJob.id] ?? (reviewJob.canonical_aliases?.length ? reviewJob.canonical_aliases.join(", ") : reviewJob.requested_plant_name)} editingIdentity={Boolean(editingIdentity[reviewJob.id])} savingIdentity={savingIdentity === reviewJob.id} onStartIdentityEdit={() => setEditingIdentity((current) => ({ ...current, [reviewJob.id]: true }))} onCancelIdentityEdit={() => setEditingIdentity((current) => ({ ...current, [reviewJob.id]: false }))} onCanonicalNameChange={(value) => setCanonicalNames((current) => ({ ...current, [reviewJob.id]: value }))} onAliasesChange={(value) => setAliasInputs((current) => ({ ...current, [reviewJob.id]: value }))} onSaveIdentity={() => { void saveIdentity(reviewJob); }} />}
    {approvalDialogIds && <PlantApprovalDialog count={approvalDialogIds.length} busy={busy === "approve"} onApprove={() => { void approveSelected(); }} onCancel={() => setApprovalDialogIds(null)} />}
    {pendingPlantDelete && <ConfirmationDialog eyebrow="Delete illustration request" title={`Delete ${pendingPlantDelete.requested_plant_name}?`} description="This permanently removes the request and its generated candidate. This cannot be undone." confirmLabel="Delete request" destructive busy={busy === `delete:${pendingPlantDelete.id}`} busyLabel="Deleting…" onConfirm={() => { void deleteJob(pendingPlantDelete); }} onCancel={() => setPendingPlantDelete(null)} />}
  </div>;
}
