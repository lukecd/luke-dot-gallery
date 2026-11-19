import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ActionButton.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  size?: "compact" | "regular";
  variant?: "primary" | "secondary";
};

/**
 * Use for client-side operations that mutate state or await a network request.
 * Use Button for navigation links instead.
 */
export function ActionButton({
  children,
  className = "",
  disabled = false,
  loading = false,
  loadingLabel,
  size = "regular",
  variant = "primary",
  ...rest
}: Props) {
  return <button type="button" aria-busy={loading || undefined} disabled={disabled || loading} className={`${styles.button} ${styles[size]} ${styles[variant]} ${className}`} {...rest}>
    {loading && <span aria-hidden="true" className={styles.spinner} />}
    <span>{loading ? (loadingLabel ?? children) : children}</span>
  </button>;
}
