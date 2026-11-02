import { connectionReason, type BookConnection } from "../connections";
import { AuthorLinks } from "./AuthorLinks";
import { PurchaseDate } from "./PurchaseDate";
import { BookCover } from "./BookCard";
import styles from "../books.module.css";

export function ConnectionCluster({ connections, relation, onFocus, onAuthor }: { connections: BookConnection[]; relation: string; onFocus: (id: string) => void; onAuthor: (author: string) => void }) {
  return <div className={styles.connectionCards}>{connections.map(connection => <article key={connection.book.id} className={styles.connectionCard}><button className={styles.bookTarget} aria-label={`Follow ${connection.book.title}`} onClick={() => onFocus(connection.book.id)}>
    <span className={styles.connectionCover}><BookCover book={connection.book} large /></span>
    <strong>{connection.book.title}</strong></button>
    <span className={styles.connectionAuthor}><AuthorLinks authors={connection.book.authors} onAuthor={onAuthor} /></span>
    <PurchaseDate book={connection.book} />
    <span className={styles.connectionReason}>{connectionReason(connection, relation)}</span>
  </article>)}</div>;
}
