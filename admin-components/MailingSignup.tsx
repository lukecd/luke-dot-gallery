"use client";
import { useState, type FormEvent } from "react";
import type { AdminApp } from "@/admin-lib/admin/app-model";
import type { MailingList } from "@/admin-lib/admin/subscriber-model";
import { ActionButton } from "@/admin-components/ActionButton";
import styles from "@/app/admin/admin.module.css";
import theme from "@/app/admin/admin-theme.module.css";
export function MailingSignup({ app, list }: { app: AdminApp; list: MailingList }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("sending"); setError(null);
    try {
      const response = await fetch(`/api/mailing-lists/${app.slug}/${list.slug}/subscribe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), name: form.get("name"), website: form.get("website"), consent: form.get("consent") === "on", consentVersion: list.consent_copy_version }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setState("sent");
    } catch (caught) { setState("idle"); setError(caught instanceof Error ? caught.message : "Please try again."); }
  }
  return <main className={`${theme.theme} ${styles.signupPage}`}><p>SP Stories</p><h1>{app.name}</h1><h2>{list.name}</h2>
    {state === "sent" ? <p role="status">Thank you. You’re on the list.</p> : <form onSubmit={submit}>
      <label>First name <span>(optional)</span><input name="name" autoComplete="given-name" maxLength={100} /></label>
      <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className={styles.signupConsent}><input name="consent" type="checkbox" required />{list.consent_text}</label>
      <p>Luke Cassady-Dorion uses your name and email to send the messages described above. To unsubscribe or request removal, email <a href="mailto:luke@spstories.com">luke@spstories.com</a>.</p>
      <ActionButton type="submit" loading={state === "sending"} loadingLabel="Joining…">Join the list</ActionButton>
      {error ? <p role="alert">{error}</p> : null}
    </form>}
  </main>;
}
