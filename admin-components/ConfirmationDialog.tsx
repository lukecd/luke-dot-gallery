"use client";

import { useEffect, useRef } from "react";

import styles from "@/app/admin/admin.module.css";
import { ActionButton } from "@/admin-components/ActionButton";

type ConfirmationDialogProps = { eyebrow?: string; title: string; description: string; confirmLabel: string; busy?: boolean; busyLabel?: string; destructive?: boolean; onConfirm: () => void; onCancel: () => void };

export function ConfirmationDialog({ eyebrow = "Confirm action", title, description, confirmLabel, busy = false, busyLabel, destructive = false, onConfirm, onCancel }: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = dialogRef.current; if (!dialog) return; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={dialogRef} className={styles.confirmationDialog} aria-labelledby="confirmation-dialog-title" onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }} onClick={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <p className={styles.eyebrow}>{eyebrow}</p><h2 id="confirmation-dialog-title">{title}</h2><p>{description}</p>
    <div className={styles.confirmationDialogActions}><ActionButton size="compact" variant="secondary" disabled={busy} onClick={onCancel}>Cancel</ActionButton><ActionButton size="compact" className={destructive ? styles.confirmationDialogDestructive : undefined} loading={busy} loadingLabel={busyLabel ?? "Working…"} onClick={onConfirm}>{confirmLabel}</ActionButton></div>
  </dialog>;
}
