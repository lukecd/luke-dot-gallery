"use client";

import { useState } from "react";

import theme from "@/app/admin/admin-theme.module.css";
import styles from "@/app/admin/admin-auth.module.css";

export function AdminLogin({ error }: { error?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function requestLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    try {
      const response = await fetch("/api/admin/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Request failed");
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <main className={`${theme.theme} ${styles.page}`}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Luke’s Apps · private workspace</p>
        <h1>Welcome back.</h1>
        <p>Use your owner email to receive a private sign-in link.</p>
        <form onSubmit={requestLink}>
          <label htmlFor="admin-email">Owner email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : "Send private sign-in link"}
          </button>
        </form>
        {state === "sent" && <p className={styles.success}>If that address is approved, a sign-in link is on its way.</p>}
        {state === "error" && <p className={styles.error}>We could not start sign-in. Please try again.</p>}
        {error && <p className={styles.error}>That link is no longer available. Request a fresh one.</p>}
      </section>
    </main>
  );
}
