"use client";
import { useEffect, useState } from "react";
import styles from "@/app/admin/admin.module.css";
import type { AdminApp } from "@/admin-lib/admin/app-model";
import type { MailingList } from "@/admin-lib/admin/subscriber-model";
import { AdminDataState } from "@/admin-components/AdminDataState";

export function MailingListSettings({ app }: { app: AdminApp }) {
  const [lists, setLists] = useState<MailingList[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/mailing-lists?app=${encodeURIComponent(app.slug)}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => setLists(data.lists)).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [app.slug]);
  return <section className={styles.mailingWorkspace}>
    <header className={styles.mailingHeader}><div><h2>List settings</h2><p>{app.name}</p></div></header>
    {error ? <AdminDataState state="error" title="Settings could not load." description="Reload the page to try again. No data has changed." /> : lists === null ? <AdminDataState state="loading" title="Loading list settings…" description="Checking available signup forms." /> : lists.map((list) => <section key={list.id} className={styles.mailingSettings}>
      <h3>{list.name}</h3><dl><div><dt>Signup</dt><dd>{list.signup_enabled ? "Open" : "Closed"}</dd></div><div><dt>Consent wording</dt><dd>{list.consent_text}</dd></div><div><dt>Consent version</dt><dd>{list.consent_copy_version}</dd></div><div><dt>Signup form</dt><dd><a href={`/updates/${app.slug}/${list.slug}`}>Open signup form</a></dd></div></dl>
    </section>)}
  </section>;
}
