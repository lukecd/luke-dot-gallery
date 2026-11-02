import Image from "next/image";
import { trackEvent } from "../../lib/analytics";
import { AuthorLinks } from "./AuthorLinks";
import { discoveryReason, type DiscoveryBook } from "../discovery";
import type { Book } from "../types";
import styles from "../discovery.module.css";

export function DiscoveryCard({ candidate, books, onAuthor }: {
  candidate: DiscoveryBook; books: Book[];
  onAuthor: (name: string) => void;
}) {
  return <article className={styles.card} onClick={event => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a");
    if (link?.href === candidate.sourceUrl) trackEvent("library_recommendation_outbound", { book_id: candidate.id, link_url: candidate.sourceUrl });
  }}>
    {candidate.cover && <a href={candidate.sourceUrl} target="_blank" rel="noreferrer" aria-label={`About ${candidate.title}`}><Image className={styles.cover} src={candidate.cover} alt={`Cover of ${candidate.title}`} width={105} height={160} sizes="(max-width: 600px) 70px, 105px" loading="lazy" /></a>}
    <div className={styles.cardBody}>
      <p className={styles.reason}>{discoveryReason(candidate,books)}</p>
      <h3><a href={candidate.sourceUrl} target="_blank" rel="noreferrer">{candidate.title}</a></h3>
      <p className={styles.author}><AuthorLinks authors={candidate.authors} onAuthor={onAuthor} /></p>
      <p className={styles.meta}>{candidate.publicationYear ? `${candidate.sourceUrl.startsWith("https://openlibrary.org") ? "Catalog year" : "First published"} ${candidate.publicationYear}` : "Publication year unknown"} · Not in my collection</p>
      <a className={styles.source} href={candidate.sourceUrl} target="_blank" rel="noreferrer">About this book ↗</a>
    </div>
  </article>;
}
