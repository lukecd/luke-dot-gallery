import type { ReactNode } from "react";
import { isPlainClick } from "../../lib/linkNavigation";
import { booksLocationUrl, defaultLocation } from "../navigation";
import styles from "../books.module.css";

export function BookLink({ id, label, children, onSelect }: { id: string; label: string; children: ReactNode; onSelect: (id: string) => void }) {
  return <a className={styles.bookTarget} href={booksLocationUrl({ ...defaultLocation, view: "connections", focusId: id })} aria-label={label} onClick={event => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    onSelect(id);
  }}>{children}</a>;
}
