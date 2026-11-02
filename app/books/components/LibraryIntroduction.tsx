import type { LibraryView } from "../navigation";
import styles from "../books.module.css";

const introductions: Record<LibraryView, string> = {
  timeline: "This is a collection of (most of*) the books I’ve read over the years. You can browse by purchase date or follow the connections between them.",
  connections: "Choose a book to see others in my collection by the same author, in the same series, or about similar subjects.",
  next: "I built this to help me find what to read next. Let me know if you recommend any of them.",
};

export function LibraryIntroduction({ view }: { view: LibraryView }) {
  return <div className={styles.viewIntroduction}>
    <p>{introductions[view]}</p>
    {view === "timeline" && <p className={styles.introductionFootnote}>
      <small>* Includes my Amazon book purchases and the paperbacks I remember. The rest are lost to the sands of time... or just my memory.</small>
    </p>}
  </div>;
}
