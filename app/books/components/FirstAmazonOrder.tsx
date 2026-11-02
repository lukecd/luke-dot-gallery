import type { Book } from "../types";
import { BookCard } from "./BookCard";
import styles from "../books.module.css";

// Luke remembers buying these together in his first Amazon order.
// Keep the original export dates intact; they differ between the two records.
export const firstAmazonOrderIds = ["0525934189", "0316771635"];

export function FirstAmazonOrder({ books, onSelect, onAuthor }: { books: Book[]; onSelect: (id: string) => void; onAuthor: (author: string) => void }) {
  return <section className={styles.firstAmazonOrder} aria-label="My first Amazon order">
    <h3>My first Amazon order</h3>
    <p className={styles.firstOrderIntroduction}>I bought these two together back in 1997.</p>
    <div className={styles.firstOrderBooks}>{books.map(book => <BookCard key={book.id} book={book} onSelect={onSelect} onAuthor={onAuthor} />)}</div>
  </section>;
}
