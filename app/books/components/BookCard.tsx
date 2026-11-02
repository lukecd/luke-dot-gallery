import Image from "next/image";
import { AuthorLinks } from "./AuthorLinks";
import { PurchaseDate } from "./PurchaseDate";
import type { Book } from "../types";
import styles from "../books.module.css";

export function BookCover({ book, large = false }: { book: Pick<Book, "cover" | "title">; large?: boolean }) {
  return book.cover
    ? <Image loading={large ? "eager" : "lazy"} src={book.cover} alt="" width={large ? 220 : 144} height={large ? 320 : 212} className={styles.cover} sizes={large ? "220px" : "(max-width: 600px) 130px, 150px"} />
    : <div className={styles.coverUnavailable}><span>COVER NOT YET FOUND</span><strong>{book.title}</strong></div>;
}

export function BookCard({ book, onSelect, onAuthor }: { book: Book; onSelect: (id: string) => void; onAuthor: (author: string) => void }) {
  return <article className={styles.bookCard}>
    <button className={styles.bookTarget} onClick={() => onSelect(book.id)} aria-label={`See connections for ${book.title}`}>
      <span className={styles.coverFrame}><BookCover book={book} /></span>
      <span className={styles.bookTitle}>{book.title}</span>
    </button>
    <span className={styles.bookAuthor}>{book.authors.length ? <AuthorLinks authors={book.authors} onAuthor={onAuthor} /> : "Author to identify"}</span>
    <PurchaseDate book={book} />
    {book.series && <span className={styles.seriesLabel}>{book.series}{book.seriesOrder ? ` · ${book.seriesOrder}` : ""}</span>}
  </article>;
}
