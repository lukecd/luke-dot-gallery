import type { Book } from "./types";
import excludedDiscoveries from "./data/discovery-excluded.json" with { type: "json" };

export type DiscoveryBook = {
  id: string; title: string; authors: string[]; publicationYear: number | null;
  cover: string | null; sourceUrl: string; series?: string; seriesOrder?: number;
};
export type AuthorCheck = { attemptedAt: string; checkedAt: string | null; authorKey?: string };
export type DiscoverySnapshot = { updatedAt: string | null; checks: Record<string, AuthorCheck>; candidates: DiscoveryBook[] };
export type CatalogWork = { key: string; title: string; author_name?: string[]; author_key?: string[]; first_publish_year?: number; isbn?: string[]; language?: string[] };
export const normalizeBookIdentity = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\([^)]*\)/g, "").split(/[:—]/)[0].replace(/^the\s+/, "").replace(/[^a-z0-9]/g, "");
const sameAuthor = (a: string, b: string) => normalizeBookIdentity(a) === normalizeBookIdentity(b);
export function isCollected(candidate: DiscoveryBook, books: Book[]) {
  return books.some(book => book.workId === candidate.id || (candidate.authors.some(a => book.authors.some(b => sameAuthor(a,b))) && [book.title,...book.originalTitles].some(title => normalizeBookIdentity(title) === normalizeBookIdentity(candidate.title))));
}
function isBundleWithOwnedTitle(candidate: DiscoveryBook, books: Book[]) {
  return /\band\b|[;&]/i.test(candidate.title) && books.some(book =>
    book.title.length > 8 && book.authors.some(a => candidate.authors.some(b => sameAuthor(a,b))) &&
    normalizeBookIdentity(candidate.title).includes(normalizeBookIdentity(book.title)));
}
export function discoveryChoices(snapshot: DiscoverySnapshot, reviewed: DiscoveryBook[], books: Book[], covers: Record<string, string> = {}) {
  const merged = new Map<string, DiscoveryBook>();
  for (const book of [...reviewed, ...snapshot.candidates]) {
    if (Object.hasOwn(excludedDiscoveries,book.id)) continue;
    if (isCollected(book, books) || !book.authors.some(a => books.some(b => b.authors.some(name => sameAuthor(name,a))))) continue;
    if (isBundleWithOwnedTitle(book,books)) continue;
    const key = `${normalizeBookIdentity(book.title)}|${normalizeBookIdentity(book.authors[0] ?? "")}`;
    if (!merged.has(key)) merged.set(key,!book.cover && covers[book.id] ? {...book,cover:covers[book.id]} : book);
  }
  return [...merged.values()].sort((a,b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0) || a.title.localeCompare(b.title));
}
export function seriesStartingPoint(candidate: DiscoveryBook, books: Book[]) {
  if (!candidate.series) return undefined;
  return books.filter(book => book.series === candidate.series).sort((a,b) => (b.seriesOrder ?? 0) - (a.seriesOrder ?? 0))[0];
}
export function discoveryReason(candidate: DiscoveryBook, books: Book[]) {
  const start = seriesStartingPoint(candidate, books);
  if (start) return `${candidate.series}${candidate.seriesOrder ? ` · Book ${candidate.seriesOrder}` : ""} — you have ${start.title}`;
  const related = books.filter(book => book.authors.some(name => candidate.authors.some(author => sameAuthor(name, author))));
  return `By ${candidate.authors.join(" & ")} · ${related.length} ${related.length === 1 ? "book" : "books"} in my collection`;
}
export function catalogCandidate(work: CatalogWork, author: string, authorKey: string, books: Book[], year: number): DiscoveryBook | undefined {
  if (!/^\/works\/OL\d+W$/.test(work.key) || work.title.length < 3 || !work.author_key?.includes(authorKey)) return;
  if (!work.author_name?.length || !sameAuthor(work.author_name[0],author)) return;
  if (!work.language?.includes("eng") || !work.first_publish_year || work.first_publish_year > year) return;
  // Avoid study guides, bundles and compilations masquerading as new novels.
  if (/box(ed)? set|books set|omnibus|summary|study guide|reading group guide|collected works|complete works|colouring|coloring|episode \d|books? \d+[-–]\d+/i.test(work.title)) return;
  const candidate: DiscoveryBook = { id:work.key, title:work.title, authors:work.author_name, publicationYear:work.first_publish_year, cover:null, sourceUrl:`https://openlibrary.org${work.key}` };
  if (isCollected(candidate,books) || isBundleWithOwnedTitle(candidate,books) || work.isbn?.some(isbn => books.some(book => book.identifiers.includes(isbn)))) return;
  return candidate;
}

/** Queries contain public author names/IDs only. Purchases and personal notes stay local. */
export async function refreshDiscovery(books: Book[], previous: DiscoverySnapshot, options: {
  limit?: number; author?: string; fetcher?: typeof fetch; pauseMs?: number; now?: Date;
  onProgress?: (author: string, ok: boolean) => void;
} = {}): Promise<DiscoverySnapshot> {
  const now = options.now ?? new Date();
  const result: DiscoverySnapshot = structuredClone(previous);
  const counts = new Map<string, number>();
  for (const book of books) for (const author of book.authors) counts.set(author,(counts.get(author) ?? 0)+1);
  const authors = [...counts.keys()].filter(author => !options.author || sameAuthor(author,options.author)).sort((a,b) =>
    (previous.checks[a]?.attemptedAt ?? "").localeCompare(previous.checks[b]?.attemptedAt ?? "") || counts.get(b)!-counts.get(a)! || a.localeCompare(b));
  const fetcher = options.fetcher ?? fetch;
  const started = Date.now();
  const get = async (url: string) => {
    const response = await fetcher(url,{headers:{"User-Agent":"LukeGalleryLibrary/1.0 (https://luke.gallery)"},signal:AbortSignal.timeout(12000),cache:"no-store"});
    if (options.pauseMs !== 0) await new Promise(resolve => setTimeout(resolve,options.pauseMs ?? 1100));
    if (!response.ok) throw new Error(`Catalog response ${response.status}`);
    return response.json();
  };
  for (const author of authors.slice(0,options.limit ?? 30)) {
    if (Date.now()-started > 210000) break;
    const existing = previous.checks[author];
    try {
      let key = existing?.authorKey;
      if (!key) {
        const matches = await get(`https://openlibrary.org/search/authors.json?${new URLSearchParams({q:author,limit:"10"})}`) as {docs:{key:string;name:string;alternate_names?:string[];work_count?:number}[]};
        const exact = matches.docs.filter(a => [a.name,...(a.alternate_names??[])].some(name => sameAuthor(name,author))).sort((a,b)=>(b.work_count??0)-(a.work_count??0));
        if (!exact.length || !/^OL\d+A$/.test(exact[0].key)) throw new Error("Ambiguous author");
        key = exact[0].key;
      }
      const response = await get(`https://openlibrary.org/search.json?${new URLSearchParams({author_key:key,limit:"100",fields:"key,title,author_name,author_key,first_publish_year,isbn,language"})}`) as {docs:CatalogWork[]};
      // Confirm the bibliography contains a known work before trusting a namesake.
      if (!existing?.authorKey && !response.docs.some(work => books.some(b => b.authors.some(a => sameAuthor(a,author)) && (b.workId === work.key || normalizeBookIdentity(b.title) === normalizeBookIdentity(work.title))))) throw new Error("No known work in bibliography");
      const candidates = response.docs.map(work => catalogCandidate(work,author,key!,books,now.getUTCFullYear())).filter((b): b is DiscoveryBook => !!b).slice(0,12);
      result.candidates = result.candidates.filter(book => !book.authors.some(a => sameAuthor(a,author)));
      result.candidates.push(...candidates);
      result.checks[author] = {authorKey:key,attemptedAt:now.toISOString(),checkedAt:now.toISOString()};
      result.updatedAt = now.toISOString();
      options.onProgress?.(author,true);
    } catch {
      // Keep the last good results and successful-check date on upstream failures.
      result.checks[author] = {...existing,attemptedAt:now.toISOString(),checkedAt:existing?.checkedAt ?? null};
      options.onProgress?.(author,false);
    }
  }
  result.candidates = discoveryChoices(result,[],books);
  return result;
}
