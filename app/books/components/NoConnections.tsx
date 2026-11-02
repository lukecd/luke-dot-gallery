import { AllBooksLink } from "./AllBooksLink";
import styles from "../books.module.css";

export function NoConnections({ onHome }: { onHome: () => void }) {
  return <div className={styles.connectionEmpty}>
    <h3>No connections for this book yet.</h3>
    <p>Browse all books to find another starting point, or use the “Choose another book” menu.</p>
    <AllBooksLink onHome={onHome} className={styles.connectionBrowse}>Browse all books</AllBooksLink>
  </div>;
}
