import { connectionReason, type BookConnection } from "../connections";
import { AuthorLinks } from "./AuthorLinks";
import { PurchaseDate } from "./PurchaseDate";
import { BookCover } from "./BookCover";
import { BookLink } from "./BookLink";
import styles from "../books.module.css";

export function ConnectionCluster({ connections, relation, onFocus, onAuthor }: { connections: BookConnection[]; relation: string; onFocus: (id: string) => void; onAuthor: (author: string) => void }) {
  return <div className={styles.connectionCards}>{connections.map(connection => <article key={connection.book.id} className={styles.connectionCard}><BookLink id={connection.book.id} label={`Follow ${connection.book.title}`} onSelect={onFocus}>
    <span className={styles.connectionCover}><BookCover book={connection.book} large /></span>
    <strong>{connection.book.title}</strong></BookLink>
    <span className={styles.connectionAuthor}><AuthorLinks authors={connection.book.authors} onAuthor={onAuthor} /></span>
    <PurchaseDate book={connection.book} />
    <span className={styles.connectionReason}>{connectionReason(connection, relation)}</span>
  </article>)}</div>;
}
