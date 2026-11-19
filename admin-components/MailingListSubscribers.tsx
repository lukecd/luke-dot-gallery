"use client";

import { useCallback, useContext, useEffect, useState, type FormEvent } from "react";
import { PiMagnifyingGlass, PiArrowSquareOut, PiArrowClockwise, PiUserMinus } from "react-icons/pi";
import styles from "@/app/admin/admin.module.css";
import { AdminAudienceContext } from "@/admin-components/AdminAudienceContext";
import { AdminDataState, AdminRefreshStatus } from "@/admin-components/AdminDataState";
import { ActionButton } from "@/admin-components/ActionButton";
import { ConfirmationDialog } from "@/admin-components/ConfirmationDialog";
import type { AdminApp } from "@/admin-lib/admin/app-model";
import { subscribersCsv, type Subscriber, type SubscriberPage } from "@/admin-lib/admin/subscriber-model";

export function MailingListSubscribers({ app }: { app: AdminApp }) {
  const reportCount = useContext(AdminAudienceContext);
  const [data, setData] = useState<SubscriberPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Subscriber | null>(null);
  const [list, setList] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const requestPage = useCallback(async (targetPage: number, signal?: AbortSignal) => {
    const query = new URLSearchParams({ app: app.slug, page: String(targetPage), status, search });
    if (list) query.set("list", list);
    const response = await fetch(`/api/admin/subscribers?${query}`, { signal });
    const result = await response.json() as SubscriberPage & { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Could not load subscribers.");
    return result;
  }, [app.slug, list, status, search]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setData(await requestPage(page)); setError(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load subscribers."); }
    finally { setLoading(false); }
  }, [requestPage, page]);

  useEffect(() => {
    const controller = new AbortController();
    void requestPage(page, controller.signal).then((result) => {
      setData(result); setError(null); setLoading(false);
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) { setError(caught instanceof Error ? caught.message : "Could not load subscribers."); setLoading(false); }
    });
    return () => controller.abort();
  }, [requestPage, page]);

  useEffect(() => { if (data) reportCount(app.id, data.activeCount); }, [app.id, data, reportCount]);

  function changeFilter(change: () => void) { setData(null); setLoading(true); setPage(1); change(); }
  function searchSubmit(event: FormEvent) { event.preventDefault(); if (search !== searchInput.trim()) changeFilter(() => setSearch(searchInput.trim())); }

  async function exportList() {
    setExporting(true);
    try {
      const first = await requestPage(1);
      const rows = [...first.subscribers];
      for (let next = 2; next <= Math.ceil(first.total / 25); next++) rows.push(...(await requestPage(next)).subscribers);
      const url = URL.createObjectURL(new Blob([subscribersCsv(rows)], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a"); link.href = url; link.download = `${app.slug}-${first.list.slug}-subscribers.csv`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not export subscribers."); }
    finally { setExporting(false); }
  }

  async function unsubscribe() {
    if (!pending) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/subscribers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app: app.slug, subscriptionId: pending.id, action: "unsubscribe" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not unsubscribe.");
      setPending(null);
      if (page > 1 && status === "subscribed" && data?.subscribers.length === 1) {
        setData(null); setLoading(true); setPage(page - 1);
      } else await refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not unsubscribe."); }
    finally { setBusy(false); }
  }

  return <section className={styles.mailingWorkspace}>
    <header className={styles.mailingHeader}><div><h2>{data?.list.name ?? (app.slug === "sp-stories" ? "All app updates" : `${app.name} subscribers`)}</h2><p>{app.slug === "sp-stories" ? "Occasional updates about apps by Luke Cassady-Dorion." : `People who asked to hear about ${app.name}.`}</p></div>
      <div className={styles.mailingActions}>
        {data?.list.signup_enabled ? <a href={`/updates/${app.slug}/${data.list.slug}`} target="_blank" rel="noreferrer"><PiArrowSquareOut aria-hidden="true" />Open signup form</a> : data ? <span>Signup closed</span> : null}
        <ActionButton size="compact" variant="secondary" loading={exporting} loadingLabel="Exporting…" disabled={loading || !data} onClick={() => { void exportList(); }}>Export</ActionButton>
        <button className={styles.mailingRefresh} disabled={loading || exporting} onClick={() => { void refresh(); }} aria-label={loading ? "Refreshing subscribers" : "Refresh subscribers"} title="Refresh subscribers"><PiArrowClockwise aria-hidden="true" /></button>
      </div>
    </header>
    <form className={styles.mailingFilters} onSubmit={searchSubmit}>
      <div className={styles.mailingSearch}><label className="sr-only" htmlFor="subscriber-search">Search email addresses</label><input id="subscriber-search" type="search" placeholder="Search email addresses…" value={searchInput} maxLength={254} onChange={(event) => setSearchInput(event.target.value)} /><button type="submit" disabled={loading} aria-label="Search subscribers"><PiMagnifyingGlass aria-hidden="true" /></button></div>
      <label><span className="sr-only">Subscription status</span><select disabled={loading || exporting} value={status} onChange={(event) => changeFilter(() => setStatus(event.target.value))}><option value="">All statuses</option><option value="subscribed">Subscribed</option><option value="unsubscribed">Unsubscribed</option></select></label>
      {data && data.lists.length > 1 ? <label><span className="sr-only">Mailing list</span><select disabled={loading || exporting} value={data.list.slug} onChange={(event) => changeFilter(() => setList(event.target.value))}>{data.lists.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label> : null}
    </form>
    {error ? <AdminDataState state="error" title="Subscribers could not load." description={error} onRetry={() => { void refresh(); }} /> : null}
    {loading && !data ? <AdminDataState state="loading" title="Loading subscribers…" description="Checking the selected mailing list." /> : null}
    {loading && data ? <AdminRefreshStatus>Refreshing subscribers…</AdminRefreshStatus> : null}
    {data?.subscribers.length === 0 ? <AdminDataState state="empty" title={search || status ? "No matching subscribers." : "No subscribers yet."} description={search || status ? "Try a different search or status." : "People who sign up for this list will appear here."} /> : null}
    {data && data.subscribers.length > 0 ? <div className={styles.mailingTableWrap} role="region" aria-label="Subscriber list" tabIndex={0}><table className={styles.mailingTable}><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Status</th><th scope="col">Source</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>
      {data.subscribers.map((subscriber) => <tr key={subscriber.id}>
        <td>{subscriber.person.display_name || "—"}</td><td>{subscriber.person.email}</td><td><span className={styles.mailingStatus} data-status={subscriber.status}>{subscriber.status === "subscribed" ? "Subscribed" : "Unsubscribed"}</span></td>
        <td><details><summary>{subscriber.source === "hosted-signup" || subscriber.source === "website" ? "Signup form" : subscriber.source.startsWith("owner-scope-adjustment") ? "Owner update" : subscriber.source.replaceAll("-", " ")}</summary><small><time dateTime={subscriber.consentedAt}>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(subscriber.consentedAt))}</time>Source: {subscriber.source}<br />Consent version: {subscriber.consentCopyVersion}</small></details></td>
        <td>{subscriber.status === "subscribed" ? <button className={styles.mailingTextButton} onClick={() => setPending(subscriber)} aria-label={`Unsubscribe ${subscriber.person.email}`} title={`Unsubscribe ${subscriber.person.email}`}><PiUserMinus aria-hidden="true" /></button> : null}</td>
      </tr>)}
    </tbody></table></div> : null}
    {data ? <div className={styles.mailingPagination}><span>{data.total === 0 ? "0 results" : `Showing ${(page - 1) * 25 + 1}–${Math.min(page * 25, data.total)} of ${data.total}`}</span><div>
      <ActionButton size="compact" variant="secondary" disabled={page <= 1 || loading} onClick={() => { setData(null); setLoading(true); setPage(page - 1); }}>Previous</ActionButton><span>Page {page}</span>
      <ActionButton size="compact" variant="secondary" disabled={page * 25 >= data.total || loading} onClick={() => { setData(null); setLoading(true); setPage(page + 1); }}>Next</ActionButton>
    </div></div> : null}
    {pending ? <ConfirmationDialog eyebrow="Mailing list" title={`Unsubscribe ${pending.person.email}?`} description={`This removes them from ${data?.list.name ?? "this list"}. Their subscriptions to other lists will remain unchanged.`} confirmLabel="Unsubscribe" busy={busy} busyLabel="Saving…" onConfirm={() => { void unsubscribe(); }} onCancel={() => setPending(null)} /> : null}
  </section>;
}
