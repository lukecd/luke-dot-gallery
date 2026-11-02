/** Enrich the sanitized collection with public Open Library metadata and local covers.
 * Run after import-amazon.ts. Cached, resumable, one metadata request per second.
 * Queries contain book titles/ISBNs only, never personal purchase information.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { Book, Library } from "../../app/books/types";

type Match = { key: string; title: string; author_name?: string[]; cover_i?: number; subject?: string[] };
type Cached = { match: Match | null; candidates?: string[]; query?: string };
const library: Library = JSON.parse(readFileSync("app/books/data/library.json", "utf8"));
const cachePath = "design/books/open-library-cache.json";
const cache: Record<string, Cached> = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
// These are disambiguation search hints, never facts assigned without a catalog match.
const hints: Record<string, { title?: string; author?: string; skip?: boolean; authors?: string[] }> = JSON.parse(readFileSync("design/books/catalog-hints.json", "utf8"));
const retryUnmatched = process.argv.includes("--retry-unmatched");
const exclusions: string[] = JSON.parse(readFileSync("design/books/excluded-books.json", "utf8"));
mkdirSync("public/assets/books/covers", { recursive: true });
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const nextRequest = new Map<string, number>();
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").replace(/^the/, "");
const authorAliases: Record<string, string> = { "村上春樹": "Haruki Murakami", "刘慈欣": "Cixin Liu", "Liu Cixin": "Cixin Liu", "劉慈欣": "Cixin Liu", "陈楸帆": "Chen Qiufan", "Carolyn Gilman": "Carolyn Ives Gilman", "A.G. Riddle": "A. G. Riddle", "J.R.R. Tolkien": "J. R. R. Tolkien", "Thích Nhất Hạnh": "Thich Nhat Hanh", "Demick Barbara": "Barbara Demick", "Daniel Lyons": "Dan Lyons" };
const authorName = (a: string) => (authorAliases[a] ?? a.replace(/\s+/g," ")).trim();
function queryTitle(title: string) {
  let clean = title.replace(/\s*\[[^\]]*\]/g, "").replace(/\s*\([^)]*\)/g, "").replace(/\s*[—–].*$/, "").replace(/\s+by\s+.*$/i, "").trim();
  if (/^Dune: /i.test(clean)) clean = clean.replace(/^Dune: /i, "");
  if (/^Aestus:/i.test(clean)) return "Aestus The City";
  clean = clean.split(/\s*:\s*/)[0];
  return clean;
}
async function get(url: string) {
  const host = new URL(url).host;
  const start = Math.max(Date.now(), nextRequest.get(host) ?? 0);
  nextRequest.set(host, start + 1100);
  await wait(Math.max(0, start - Date.now()));
  const response = await fetch(url, { headers: { "User-Agent": "LukeGalleryBooks/1.0 (personal book catalog; https://luke.gallery)" }, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}
const seriesRules = [
  [/A Song of Ice and Fire/i, "A Song of Ice and Fire"], [/Red Rising (?:Series )?Book/i, "Red Rising"],
  [/MaddAddam Trilogy/i, "MaddAddam"], [/The Broken Earth Book/i, "The Broken Earth"],
  [/Three-Body Problem Series/i, "Remembrance of Earth's Past"], [/Wayward Pines Trilogy/i, "Wayward Pines"],
  [/The Long Winter Trilogy/i, "The Long Winter"], [/The Commonwealth Saga/i, "The Commonwealth Saga"],
  [/The Expanse Book/i, "The Expanse"], [/Arkship Trilogy/i, "Arkship"],
  [/The Captive's War/i, "The Captive's War"], [/Legends of Dune Trilogy/i, "Legends of Dune"],
  [/White Space (?:Book|Novel)/i, "White Space"], [/Tales of the City/i, "Tales of the City"],
  [/Discworld Novel/i, "Discworld"], [/Strain Trilogy/i, "The Strain"], [/The Alchemy Wars/i, "The Alchemy Wars"],
  [/Silo series/i, "Silo"], [/Teixcalaan Book/i, "Teixcalaan"], [/Noumena Book/i, "Noumena"],
  [/The Violet Wars Book/i, "The Violet Wars"], [/The Children of Time Novels/i, "Children of Time"],
  [/The Jackpot Trilogy/i, "The Jackpot Trilogy"], [/Takeshi Kovacs Novels/i, "Takeshi Kovacs"],
  [/Semiosis Duology/i, "Semiosis"], [/Space Odyssey Series/i, "Space Odyssey"], [/The Baroque Cycle/i, "The Baroque Cycle"],
] as const;
function setSeries(book: Book) {
  const raw = book.originalTitles.join(" ");
  const rule = seriesRules.find(([re]) => re.test(raw));
  if (!rule) return;
  book.series = rule[1];
  const digit = raw.match(/Book\s+(\d+)/i)?.[1];
  const roman = raw.match(/Arkship Trilogy Book (III|II|I)\b/i)?.[1];
  const word = raw.match(/Book (One|Two|Three)/i)?.[1].toLowerCase();
  book.seriesOrder = digit ? Number(digit) : roman ? { I: 1, II: 2, III: 3 }[roman.toUpperCase()] ?? null : word ? { one: 1, two: 2, three: 3 }[word] ?? null : null;
}
let completed = 0;
async function enrichBook(book: Book) {
  const hint = hints[book.id];
  const title = hint?.title ?? queryTitle(book.originalTitles[0]);
  const fingerprint = `${title}|${hint?.author ?? ""}`;
  if (hint?.skip) cache[book.id] = { match: null, query: fingerprint, candidates: ["Excluded ambiguous catalog match; needs manual identification."] };
  if (!hint?.skip && (!(book.id in cache) || (retryUnmatched && !cache[book.id].match) || (hint && cache[book.id].query !== fingerprint) || (cache[book.id].query && cache[book.id].query !== fingerprint))) {
    try {
      const isbn = book.identifiers.find(s => /^\d{9}[\dX]$/.test(s));
      const params = new URLSearchParams({ ...(isbn ? { isbn } : { title, ...(hint?.author ? { author: hint.author } : {}) }), limit: "8", fields: "key,title,author_name,cover_i,subject" });
      let result = await (await get(`https://openlibrary.org/search.json?${params}`)).json() as { docs: Match[] };
      if (isbn && !result.docs.length) {
        result = await (await get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=5&fields=key,title,author_name,cover_i,subject`)).json() as { docs: Match[] };
      }
      const choose = (docs: Match[]) => docs.find(d => (norm(d.title) === norm(title) || norm(queryTitle(d.title)) === norm(queryTitle(title))) && (!hint?.author || (d.author_name ?? []).some(a => norm(authorName(a)) === norm(hint.author!))));
      let match = choose(result.docs) ?? (isbn && result.docs.length === 1 ? result.docs[0] : null);
      if (!match && hint?.author) {
        // A broader title-only lookup can find transliterated author records that
        // Open Library's author-name filter misses. Identity checks stay strict.
        result = await (await get(`https://openlibrary.org/search.json?${new URLSearchParams({ q: title.replace(/[^\p{L}\p{N}\s]/gu," "), limit:"30", fields:"key,title,author_name,cover_i,subject" })}`)).json() as { docs: Match[] };
        match = choose(result.docs) ?? null;
      }
      cache[book.id] = { match, query: fingerprint, ...(match ? {} : { candidates: result.docs.map(d => `${d.title} — ${(d.author_name ?? []).join(", ")}`) }) };
    } catch (e) { console.log(`Metadata unavailable: ${title}: ${String(e)}`); }
    writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n");
  }
  const match = cache[book.id]?.match;
  if (match) {
    book.title = title;
    book.authors = (match.author_name ?? []).map(authorName).filter((a,i,all) => all.findIndex(name => norm(name) === norm(a)) === i);
    if (hint?.authors) book.authors = book.authors.filter(a => hint.authors!.some(expected => norm(a) === norm(expected)));
    if (hint?.author && book.authors.some(a => norm(a) === norm(hint.author!)) && ['b00baxfajc','b001r4ckgu'].includes(book.id)) book.authors = [hint.author];
    book.workId = match.key;
    book.subjects = (match.subject ?? []).filter(s => !/^accessible|^protected|^in library|^overdrive|^large type|^nyt:|^reading level|^fic[0-9]/i.test(s));
    book.sources = [{ label: "Open Library", url: `https://openlibrary.org${match.key}` }];
    if (match.cover_i) {
      const path = `public/assets/books/covers/${match.cover_i}.jpg`;
      if (!existsSync(path)) {
        try {
          const response = await get(`https://covers.openlibrary.org/b/id/${match.cover_i}-M.jpg?default=false`);
          if (response.headers.get("content-type")?.startsWith("image/")) writeFileSync(path, Buffer.from(await response.arrayBuffer()));
        } catch { /* A missing cover is shown as an editorial text entry, never fake artwork. */ }
      }
      if (existsSync(path)) book.cover = `/assets/books/covers/${match.cover_i}.jpg`;
    }
  } else {
    book.title = title; book.authors = []; book.subjects = []; book.sources = []; book.cover = null; delete book.workId;
  }
  const overrides = JSON.parse(readFileSync("design/books/catalog-overrides.json", "utf8"));
  setSeries(book);
  Object.assign(book, overrides[book.id]);
  completed++;
  if (completed % 20 === 0) {
    writeFileSync("app/books/data/library.json", JSON.stringify(library, null, 2) + "\n");
    console.log(`Enriched ${completed}/${library.books.length}`);
  }
}
// Up to three in-flight books overlap network latency; request starts stay rate-limited.
const queue = [...library.books];
await Promise.all(Array.from({ length: 3 }, async () => {
  for (let book = queue.shift(); book; book = queue.shift()) await enrichBook(book);
}));
// Canonical work matching merges print/Kindle editions without merging unrelated equal titles.
const merged = new Map<string, Book>();
for (const book of library.books) {
  const key = book.workId ?? book.id;
  const existing = merged.get(key);
  if (!existing) { merged.set(key, book); continue; }
  existing.originalTitles = [...new Set([...existing.originalTitles, ...book.originalTitles])];
  existing.identifiers = [...new Set([...existing.identifiers, ...book.identifiers])];
  existing.purchases = [...existing.purchases, ...book.purchases].filter((p, i, all) => all.findIndex(a => a.date === p.date && a.format === p.format && a.status === p.status) === i).sort((a,b) => a.date.localeCompare(b.date));
  existing.series ??= book.series; existing.seriesOrder ??= book.seriesOrder;
}
library.books = [...merged.values()].filter(book => ![book.id, book.workId ?? "", ...book.identifiers].some(id => exclusions.includes(id)));
library.memories = JSON.parse(readFileSync("design/books/reading-notes.json", "utf8")).memories.filter((memory: { id: string }) => !exclusions.includes(memory.id));
for (const memory of library.memories) {
  memory.books = memory.books?.filter(book => !exclusions.includes(book.id));
  for (const remembered of memory.books ?? []) {
    const candidate: Book = { id: remembered.id, title: remembered.title, originalTitles: [remembered.title], identifiers: [], authors: [], series: memory.series, seriesOrder: remembered.seriesOrder, purchases: [], cover: null, subjects: [], sources: [] };
    await enrichBook(candidate);
    remembered.cover = candidate.cover;
    remembered.sources = candidate.sources;
    remembered.subjects = candidate.subjects;
  }
}
writeFileSync("app/books/data/library.json", JSON.stringify(library, null, 2) + "\n");
console.log(JSON.stringify({ books: library.books.length, identified: library.books.filter(b => b.workId).length, covers: library.books.filter(b => b.cover).length, series: new Set(library.books.map(b => b.series).filter(Boolean)).size }));
