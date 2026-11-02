import { useState } from "react";
import { bookConnections, bookTopics, selectConnections } from "../connections";
import type { Book } from "../types";
import { PurchaseDate } from "./PurchaseDate";
import { AuthorLinks } from "./AuthorLinks";
import { BookCover } from "./BookCard";
import { ConnectionCluster } from "./ConnectionCluster";
import { AllBooksLink } from "./AllBooksLink";
import { NoConnections } from "./NoConnections";
import styles from "../books.module.css";

export function ConnectionMap({ book, books, choices, relation, onRelation, onFocus, onAuthor, onHome }: { book: Book | undefined; books: Book[]; choices: Book[]; relation: string; onRelation: (relation: string) => void; onFocus: (id: string) => void; onAuthor: (author: string) => void; onHome: () => void }) {
  const [limit, setLimit] = useState(6);
  if (!book) return <div className={styles.empty}><p>No books match this search.</p><AllBooksLink onHome={onHome} className={styles.connectionBrowse}>Browse all books</AllBooksLink></div>;
  const connections = bookConnections(book, books);
  const subjects = bookTopics(book).filter(topic => connections.some(c => c.topics.includes(topic)));
  const options = [{id:"all",label:"All connections",count:connections.length},
    ...(connections.some(c => c.sameSeries) ? [{id:"series",label:"Same series",count:connections.filter(c => c.sameSeries).length}] : []),
    ...(connections.some(c => c.sameWorld) ? [{id:"world",label:"Dune universe",count:connections.filter(c => c.sameWorld).length}] : []),
    ...(connections.some(c => c.sameAuthor) ? [{id:"author",label:"Same author",count:connections.filter(c => c.sameAuthor).length}] : []),
    ...subjects.map(topic => ({id:topic,label:topic,count:connections.filter(c => c.topics.includes(topic)).length}))];
  const active = options.some(option => option.id === relation) ? relation : "all";
  const related = selectConnections(connections, active);
  const shown = related.slice(0,limit);
  return <section className={styles.connectionMap} aria-label="Book connections">
    <AllBooksLink onHome={onHome} className={styles.connectionBack}>← Back to all books</AllBooksLink>
    <div className={styles.connectionWorkspace}>
      <aside className={styles.focusBook}>
        <label htmlFor="map-focus" className={styles.eyebrow}>Choose another book</label>
        <select id="map-focus" value={book.id} onChange={e => onFocus(e.target.value)}>{choices.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select>
        <div className={styles.focusCover}><BookCover book={book} large /></div>
        <h2>{book.title}</h2><p className={styles.focusAuthor}><AuthorLinks authors={book.authors} onAuthor={onAuthor} /></p>
        <PurchaseDate book={book} className={styles.focusPurchase} />
        {book.series === "Legends of Dune" && <p className={styles.personalNote}>Read them. Didn’t like them.</p>}
        {!!shown.length && <p className={styles.followHint}>Follow a cover to see where it leads.</p>}
      </aside>
      <div className={styles.connectionBranches}>
        <header className={styles.connectionsHeading}><h2>What connects it</h2></header>
        {!!connections.length && <nav className={styles.connectionFilters} aria-label="Connection type">{options.map(option => <button key={option.id} aria-pressed={active === option.id} onClick={() => onRelation(option.id)}>{option.label}{" "}<span>{option.count}</span></button>)}</nav>}
        {!!shown.length ? <><p className={styles.connectionCount}>Showing {shown.length} of {related.length} connections{active === "all" ? " · closest matches first" : ` · ${options.find(option => option.id === active)?.label}`}</p><ConnectionCluster connections={shown} relation={active} onFocus={onFocus} onAuthor={onAuthor} />{related.length > shown.length && <button className={`${styles.textButton} ${styles.connectionMore}`} onClick={() => setLimit(limit + 6)}>Show more connections</button>}</> : <NoConnections onHome={onHome} />}
      </div>
    </div>
    <details className={styles.connectionExplanation}><summary>How are these connected?</summary><p>Author and series links use the book records. Subject links use Open Library’s catalog labels, supplemented with subjects checked against book descriptions, and grouped into topics such as science fiction or space travel.</p></details>
  </section>;
}
