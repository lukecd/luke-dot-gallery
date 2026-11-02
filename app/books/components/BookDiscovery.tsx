import { useState } from "react";
import reviewed from "../data/discovery-reviewed.json";
import covers from "../data/discovery-covers.json";
import { discoveryChoices, seriesStartingPoint, type DiscoveryBook } from "../discovery";
import { useDiscovery } from "../hooks/useDiscovery";
import { DiscoveryCard } from "./DiscoveryCard";
import { normalizeSearch } from "../library";
import type { Book } from "../types";
import styles from "../discovery.module.css";

export function BookDiscovery({books,query,author,filter,onFilter,onAuthor}:{books:Book[];query:string;author:string;filter:string;onFilter:(value:string)=>void;onAuthor:(name:string)=>void}) {
  const snapshot = useDiscovery();
  const [limit,setLimit] = useState(12);
  const candidates = discoveryChoices(snapshot,reviewed as DiscoveryBook[],books,covers);
  const visible = candidates.filter(candidate => {
    const text = normalizeSearch([candidate.title,...candidate.authors,candidate.series??""].join(" "));
    if (!normalizeSearch(query).split(/\s+/).every(term=>text.includes(term)) || (author && !candidate.authors.some(a=>normalizeSearch(a)===normalizeSearch(author)))) return false;
    if (filter === "series") return !!seriesStartingPoint(candidate,books);
    if (filter === "authors") return !seriesStartingPoint(candidate,books);
    return true;
  }).sort((a,b) => Number(!!seriesStartingPoint(b,books))-Number(!!seriesStartingPoint(a,books)) || (a.series && b.series ? a.series.localeCompare(b.series) || (a.seriesOrder??0)-(b.seriesOrder??0) : 0));
  const checked = Object.values(snapshot.checks).filter(check=>check.checkedAt).length;
  return <section className={styles.discovery} aria-label="Book discoveries">
    <header className={styles.heading}><div><h2>Where to next?</h2></div><p className={styles.checked}>{snapshot.updatedAt ? `Catalog checked ${new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(snapshot.updatedAt))}` : "A few places to start"}{checked>0 && <span>{checked} authors checked so far</span>}</p></header>
    <nav className={styles.filters} aria-label="Discovery type">{[["all","All discoveries"],["series","Continue a series"],["authors","More by authors I’ve read"]].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>{setLimit(12);onFilter(value);}}>{label}</button>)}</nav>
    <p className={styles.note}>{visible.length} {visible.length===1?"book":"books"}</p>
    {visible.length ? <div className={styles.grid}>{visible.slice(0,limit).map(candidate=><DiscoveryCard key={candidate.id} candidate={candidate} books={books} onAuthor={onAuthor}/>)}</div> : <p className={styles.empty}>No books match this selection. Try another filter or search.</p>}
    {visible.length>limit && <button className={styles.more} onClick={()=>setLimit(limit+12)}>Show more discoveries</button>}
    <details className={styles.explanation}><summary>Where do these suggestions come from?</summary><p>Author discoveries come from Open Library bibliographies. Series links are checked against author or publisher listings. Existing collection titles and duplicate editions are filtered out. The date above shows the latest catalog update.</p></details>
  </section>;
}
