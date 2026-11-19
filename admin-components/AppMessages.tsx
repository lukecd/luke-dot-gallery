"use client";

import { useEffect, useState } from "react";
import styles from "@/app/admin/admin.module.css";
import { AdminDataState } from "@/admin-components/AdminDataState";
import type { AdminApp } from "@/admin-lib/admin/app-model";

type AppMessage = { id: string; message: string; received_at: string; status: string; desk_people: { display_name: string | null; email: string } | Array<{ display_name: string | null; email: string }> };

export function AppMessages({ app }: { app: AdminApp }) {
  const [messages, setMessages] = useState<AppMessage[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/app-messages?${new URLSearchParams({ app: app.slug })}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<{ messages: AppMessage[] }>; })
      .then((data) => setMessages(data.messages))
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [app.slug]);
  return <>
    <header className={styles.compactHeader}><div><p className={styles.eyebrow}>{app.name}</p><h1>Messages</h1><span>Messages sent through the website.</span></div></header>
    {error ? <AdminDataState state="error" title="Messages could not be loaded." description="Please reload the page and try again." /> :
      messages === null ? <AdminDataState state="loading" title="Loading messages…" /> :
      messages.length === 0 ? <AdminDataState state="empty" title="No messages yet." description="Messages from the website will appear here." /> :
      <div className={styles.appMessageList}>{messages.map((item) => {
        const person = Array.isArray(item.desk_people) ? item.desk_people[0] : item.desk_people;
        return <article key={item.id} className={styles.appMessage}><header><strong>{person?.display_name || "No name provided"}</strong><time dateTime={item.received_at}>{new Date(item.received_at).toLocaleDateString()}</time></header><a href={`mailto:${encodeURIComponent(person?.email ?? "")}`}>{person?.email}</a><p>{item.message}</p></article>;
      })}</div>}
  </>;
}
