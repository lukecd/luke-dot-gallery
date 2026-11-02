import { useState } from "react";
import type { Book } from "../types";
import type { DiscoveryBook } from "../discovery";
import { BookCard } from "./BookCard";
import { DiscoveryCard } from "./DiscoveryCard";
import styles from "../books.module.css";
import discoveryStyles from "../discovery.module.css";
import searchStyles from "./LibrarySearchResults.module.css";

export function LibrarySearchResults({ matches, candidates, books, onSelect, onAuthor, onClear }: {
  matches: Book[];
  candidates: DiscoveryBook[];
  books: Book[];
  onSelect: (id: string) => void;
  onAuthor: (author: string) => void;
  onClear: () => void;
}) {
  const [limit, setLimit] = useState(24);
  const total = matches.length + candidates.length;
  return <section aria-label="Search results" className={searchStyles.results}>
    <div className={styles.collectionSummary}>
      <span role="status" aria-live="polite">{total} {total === 1 ? "result" : "results"} across Books and What’s next</span>
      <button className={styles.textButton} onClick={onClear}>Clear search</button>
    </div>
    {matches.length > 0 && <section aria-labelledby="search-library-heading">
      <h2 id="search-library-heading" className={searchStyles.heading}>Books I’ve read</h2>
      <div className={styles.bookGrid}>{matches.slice(0, limit).map(book => <BookCard key={book.id} book={book} onSelect={onSelect} onAuthor={onAuthor} />)}</div>
    </section>}
    {candidates.length > 0 && <section aria-labelledby="search-discovery-heading">
      <h2 id="search-discovery-heading" className={searchStyles.heading}>What’s next</h2>
      <div className={discoveryStyles.grid}>{candidates.slice(0, limit).map(candidate => <DiscoveryCard key={candidate.id} candidate={candidate} books={books} onSelect={onSelect} onAuthor={onAuthor} />)}</div>
    </section>}
    {!total && <div className={styles.empty}><h2>No books found.</h2><p>Try another title, author, series, or subject.</p><button className={styles.primaryButton} onClick={onClear}>Clear search</button></div>}
    {(matches.length > limit || candidates.length > limit) && <button className={discoveryStyles.more} onClick={() => setLimit(limit + 24)}>Show more results</button>}
  </section>;
}
