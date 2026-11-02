import Link from "next/link";
import { SiteSectionNavigation } from "../../components/SiteSectionNavigation";
import { LibraryIntroduction } from "./LibraryIntroduction";
import type { LibraryView } from "../navigation";
import styles from "../books.module.css";

export function BooksHeader({ onHome, view }: { onHome: () => void; view: LibraryView }) {
  return <header className={`${styles.booksHeader} ${styles.booksHeaderWithIntroduction}`}>
    <nav className={styles.brand} aria-label="Breadcrumb"><Link href="/" aria-label="Luke's portfolio">LUKE</Link><span aria-hidden="true"> / </span><Link href="/books" aria-label="All books" onNavigate={event => { event.preventDefault(); onHome(); }}>BOOKS</Link></nav>
    <h1>What I’ve read,<br /><span>and what connects it.</span></h1>
    <div className={styles.portfolioLink}><SiteSectionNavigation active="library" onLibraryHome={onHome} /></div>
    <LibraryIntroduction view={view} />
  </header>;
}
