import styles from "../books.module.css";
import type { LibraryView } from "../navigation";
import { booksLocationUrl, defaultLocation } from "../navigation";
import { isPlainClick } from "../../lib/linkNavigation";

export function LibraryControls({ query, onQuery, onQueryEnd, view, onView, sort, onSort }: {
  query: string; onQuery: (q: string) => void; onQueryEnd: () => void;
  view: LibraryView; onView: (view: LibraryView) => void; sort: string; onSort: (s: string) => void;
}) {
  return <div className={styles.libraryToolbar}>
    <input type="search" value={query} onChange={e => onQuery(e.target.value)} onBlur={onQueryEnd} placeholder="Search books, authors, series…" aria-label="Search books, authors, series or subjects" />
    <nav className={styles.views} aria-label="Collection views">{([['timeline', 'Books'], ['connections', 'Connections'], ['next', 'What’s next']] as const).map(([key, label]) => <a key={key} href={booksLocationUrl({ ...defaultLocation, view: key })} aria-current={view === key ? "page" : undefined} onClick={event => { if (isPlainClick(event)) { event.preventDefault(); onView(key); } }}>{label}</a>)}</nav>
    {view === "timeline" && <select value={sort} onChange={e => onSort(e.target.value)} aria-label="Purchase order"><option value="newest">Newest purchases</option><option value="oldest">Oldest purchases</option><option value="title">Title A–Z</option></select>}
  </div>;
}
