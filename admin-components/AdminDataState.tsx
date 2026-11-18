"use client";

import type { ReactNode } from "react";

import styles from "@/app/admin/admin.module.css";
import { ActionButton } from "@/admin-components/ActionButton";

type AdminDataStateProps = {
  state: "loading" | "empty" | "error";
  title: string;
  description?: string;
  onRetry?: () => void;
};

export function AdminDataState({ state, title, description, onRetry }: AdminDataStateProps) {
  if (state === "loading") {
    return <section className={styles.adminDataState} aria-live="polite" aria-busy="true">
      <span className={styles.adminDataSpinner} aria-hidden="true" />
      <div><strong>{title}</strong>{description && <p>{description}</p>}</div>
    </section>;
  }

  return <section className={`${styles.adminDataState} ${state === "error" ? styles.adminDataStateError : ""}`} role={state === "error" ? "alert" : undefined}>
    <div><strong>{title}</strong>{description && <p>{description}</p>}</div>
    {state === "error" && onRetry && <ActionButton size="compact" onClick={onRetry}>Retry</ActionButton>}
  </section>;
}

export function AdminRefreshStatus({ children = "Refreshing…" }: { children?: ReactNode }) {
  return <span className={styles.adminRefreshStatus} role="status"><span className={styles.adminDataSpinner} aria-hidden="true" />{children}</span>;
}
