"use client";

import { useCallback, useEffect, useState } from "react";

import styles from "@/app/admin/admin.module.css";
import { AdminDataState } from "@/admin-components/AdminDataState";
import { ConfirmationDialog } from "@/admin-components/ConfirmationDialog";
import { ActionButton } from "@/admin-components/ActionButton";

type Person = { id: string; email: string; displayName: string | null; firstSeenAt: string; lastSeenAt: string; submissionKinds: string[]; subscribed: boolean };

function date(value: string) { return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }

export function PeopleDirectory() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requestPeople = useCallback(async () => {
    const response = await fetch("/api/admin/people");
    const data = await response.json() as { people?: Person[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Could not load people.");
    return data.people ?? [];
  }, []);
  const load = useCallback(async () => {
    setRefreshing(true);
    try { setPeople(await requestPeople()); setError(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load people."); }
    finally { setRefreshing(false); }
  }, [requestPeople]);
  async function deletePerson() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/people", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ personId: pendingDelete.id, scope: "all-apps" }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not delete this person.");
      setPeople((current) => current?.filter((person) => person.id !== pendingDelete.id) ?? []); setPendingDelete(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not delete this person."); }
    finally { setDeleting(false); }
  }
  useEffect(() => {
    let current = true;
    void requestPeople().then((nextPeople) => {
      if (current) { setPeople(nextPeople); setError(null); }
    }).catch((caught: unknown) => {
      if (current) setError(caught instanceof Error ? caught.message : "Could not load people.");
    });
    return () => { current = false; };
  }, [requestPeople]);
  return <section className={styles.subscriberWorkspace}>
    <header className={styles.compactHeader}><div><p className={styles.eyebrow}>People</p><h1>All contacts</h1><span>Shared contacts across all apps. Manage individual subscriptions from each app’s subscriber list.</span></div><ActionButton size="compact" variant="secondary" loading={refreshing} loadingLabel="Refreshing…" onClick={() => { void load(); }}>Refresh</ActionButton></header>
    {people === null && !error ? <AdminDataState state="loading" title="Loading people…" description="Checking Luke’s Apps contacts." /> : null}
    {error ? <AdminDataState state="error" title="People could not load." description={`${error} No data has been changed.`} onRetry={() => { void load(); }} /> : null}
    {people?.length === 0 ? <AdminDataState state="empty" title="No people yet." description="People will appear when they contact you or join a mailing list." /> : null}
    {people && people.length > 0 ? <section className={styles.subscriberLedger}><div className={styles.subscriberColumns}><span>Person</span><span>Activity</span><span>Last seen</span><span>Any mailing list</span><span>Action</span></div>{people.map((person) => <article key={person.id}><span><strong>{person.displayName || "Unnamed contact"}</strong><small>{person.email}</small></span><span>{person.submissionKinds.length ? `${person.submissionKinds.length} submission${person.submissionKinds.length === 1 ? "" : "s"}` : "Mailing list only"}<small>First seen {date(person.firstSeenAt)}</small></span><time dateTime={person.lastSeenAt}>{date(person.lastSeenAt)}</time><b>{person.subscribed ? "Subscribed" : "Not subscribed"}</b><ActionButton size="compact" variant="secondary" onClick={() => setPendingDelete(person)}>Delete</ActionButton></article>)}</section> : null}
    {pendingDelete && <ConfirmationDialog eyebrow="Permanent deletion" title={`Delete everywhere: ${pendingDelete.displayName || pendingDelete.email}?`} description="This permanently removes this contact across ALL apps, including every mailing-list subscription and consent record, Sow submissions, illustration records, and email history. To remove only one subscription, use that app’s subscriber list. This cannot be undone." confirmLabel="Delete across all apps" destructive busy={deleting} busyLabel="Deleting…" onConfirm={() => { void deletePerson(); }} onCancel={() => setPendingDelete(null)} />}
  </section>;
}
