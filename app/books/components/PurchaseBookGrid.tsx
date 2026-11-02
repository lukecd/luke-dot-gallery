import type { Book } from "../types";
import { BookCard } from "./BookCard";
import { FirstAmazonOrder, firstAmazonOrderIds } from "./FirstAmazonOrder";
import styles from "../books.module.css";

export function PurchaseBookGrid({ books, groupFirstOrder, onSelect, onAuthor }: { books: Book[]; groupFirstOrder: boolean; onSelect: (id: string) => void; onAuthor: (author: string) => void }) {
  const firstOrder = books.filter(book => firstAmazonOrderIds.includes(book.id));
  const showFirstOrder = groupFirstOrder && firstOrder.length === firstAmazonOrderIds.length;

  return <div className={styles.bookGrid}>{books.map(book => {
    if (showFirstOrder && firstAmazonOrderIds.includes(book.id)) {
      return book.id === firstOrder[0].id
        ? <FirstAmazonOrder key="first-amazon-order" books={firstOrder} onSelect={onSelect} onAuthor={onAuthor} />
        : null;
    }
    return <BookCard key={book.id} book={book} onSelect={onSelect} onAuthor={onAuthor} />;
  })}</div>;
}
