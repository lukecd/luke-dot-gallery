import { booksLocationUrl, defaultLocation } from "../navigation";
import { isPlainClick } from "../../lib/linkNavigation";
import styles from "../books.module.css";

export function AuthorLinks({ authors, onAuthor }: { authors: string[]; onAuthor: (author: string) => void }) {
  return <>{authors.map((author, index) => <span key={author}>{index > 0 && ", "}<a className={styles.authorLink} href={booksLocationUrl({ ...defaultLocation, author })} onClick={event => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    onAuthor(author);
  }}>{author}</a></span>)}</>;
}
