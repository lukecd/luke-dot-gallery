import { booksLocationUrl, defaultLocation } from "../navigation";
import styles from "../books.module.css";

export function AuthorLinks({ authors, onAuthor }: { authors: string[]; onAuthor: (author: string) => void }) {
  return <>{authors.map((author, index) => <span key={author}>{index > 0 && ", "}<a className={styles.authorLink} href={booksLocationUrl({ ...defaultLocation, author })} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onAuthor(author);
  }}>{author}</a></span>)}</>;
}
