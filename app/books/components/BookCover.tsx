import Image from "next/image";
import type { Book } from "../types";
import styles from "../books.module.css";

export function BookCover({ book, large = false }: { book: Pick<Book, "cover" | "title">; large?: boolean }) {
  return book.cover
    ? <Image loading={large ? "eager" : "lazy"} src={book.cover} alt="" width={220} height={330} className={styles.cover} sizes={large ? "(max-width: 600px) 45vw, 250px" : "(max-width: 600px) 45vw, (max-width: 1100px) 25vw, 240px"} />
    : <div className={styles.coverUnavailable}><span>COVER NOT YET FOUND</span><strong>{book.title}</strong></div>;
}
