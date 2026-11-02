import { firstPurchase } from "../library";
import type { Book } from "../types";
import { BookCard } from "./BookCard";
import styles from "../books.module.css";

export function PurchaseTimeline({ books, year, years, onYear, sort, onSelect, onAuthor }: { books: Book[]; year: string; years: string[]; onYear: (year: string) => void; sort: string; onSelect: (id: string) => void; onAuthor: (author: string) => void }) {
  const grouped = new Map<string, Book[]>();
  for (const book of books) {
    const key = sort === "title" ? "All books" : firstPurchase(book)?.date.slice(0, 4) ?? "undated";
    grouped.set(key, [...(grouped.get(key) ?? []), book]);
  }
  const entries = [...grouped.entries()].sort(([a], [b]) => a === "undated" ? 1 : b === "undated" ? -1 : sort === "oldest" ? a.localeCompare(b) : b.localeCompare(a));
  return <div className={styles.timelineLayout}>
    <aside className={styles.yearNav} aria-label="Filter purchase year"><p className={styles.eyebrow}>PURCHASE YEAR</p><div><button aria-pressed={year === "all"} onClick={() => onYear("all")}>All years</button>{years.map(y => <button key={y} aria-pressed={year === y} onClick={() => onYear(y)}>{y}</button>)}<button aria-pressed={year === "undated"} onClick={() => onYear("undated")}>Undated</button></div></aside>
    <div className={styles.timeline}>{entries.map(([y, group]) => <section className={styles.yearGroup} key={y} aria-labelledby={`year-${y}`}><div className={styles.yearHeading}><h2 id={`year-${y}`}>{y === "undated" ? "Undated" : y}</h2><span>{group.length} {group.length === 1 ? "book" : "books"}</span><span className={styles.yearRule} /></div><div className={styles.bookGrid}>{group.sort((a,b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? (firstPurchase(a)?.date ?? "").localeCompare(firstPurchase(b)?.date ?? "") : (firstPurchase(b)?.date ?? "").localeCompare(firstPurchase(a)?.date ?? "")).map(book => <BookCard key={book.id} book={book} onSelect={onSelect} onAuthor={onAuthor} />)}</div></section>)}</div>
  </div>;
}
