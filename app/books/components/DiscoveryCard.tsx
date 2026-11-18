import { BookLink } from "./BookLink";
import Image from "next/image";
import { trackEvent } from "../../lib/analytics";
import { AuthorLinks } from "./AuthorLinks";
import { discoveryConnectionBook, discoveryReason, type DiscoveryBook } from "../discovery";
import type { Book } from "../types";
import styles from "../discovery.module.css";

export function DiscoveryCard({ candidate, books, onAuthor, onSelect }: {
  candidate: DiscoveryBook; books: Book[];
  onSelect: (id: string) => void;
  onAuthor: (name: string) => void;
}) {
  const book = discoveryConnectionBook(candidate, books);
  return <article className={styles.card} onClick={event => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a");
    if (link?.href === candidate.sourceUrl) trackEvent("library_recommendation_outbound", { book_id: candidate.id, link_url: candidate.sourceUrl });
  }}>
    {candidate.cover && <BookLink className={styles.coverLink} id={candidate.id} onSelect={onSelect} label={`See connections for ${candidate.title}`}><Image className={styles.cover} src={candidate.cover} alt={`Cover of ${candidate.title}`} width={140} height={210} sizes="(max-width: 600px) 100px, 140px" loading="lazy" /></BookLink>}
    <div className={styles.cardBody}>
      <p className={styles.reason}>{discoveryReason(candidate,books)}</p>
      <h3><BookLink id={candidate.id} onSelect={onSelect} label={`See connections for ${candidate.title}`}>{candidate.title}</BookLink></h3>
      <p className={styles.author}><AuthorLinks authors={book.authors} onAuthor={onAuthor} /></p>
      <p className={styles.meta}>{candidate.publicationYear ? `${candidate.sourceUrl.startsWith("https://openlibrary.org") ? "Catalog year" : "First published"} ${candidate.publicationYear}` : "Publication year unknown"} · Not in my collection</p>
      <a className={styles.source} href={candidate.sourceUrl} target="_blank" rel="noreferrer">About this book ↗</a>
    </div>
  </article>;
}
