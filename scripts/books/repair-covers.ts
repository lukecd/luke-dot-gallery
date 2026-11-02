/** Recover covers for exact purchased identifiers. Run after catalog enrichment. */
import { readFileSync, writeFileSync } from "node:fs";
import type { Library } from "../../app/books/types";
const path = "app/books/data/library.json";
const library: Library = JSON.parse(readFileSync(path,"utf8"));
const overridesPath = "design/books/catalog-overrides.json";
let overrides: Record<string, Record<string, unknown>> = {};
try { overrides = JSON.parse(readFileSync(overridesPath,"utf8")); } catch { /* first run */ }
for (const book of library.books.filter(b => !b.cover)) {
  const identifier = book.identifiers[0];
  const url = `https://images-na.ssl-images-amazon.com/images/P/${identifier}.01.LZZZZZZZ.jpg`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/") || bytes.length < 2000) { console.log(`Unresolved: ${book.title}`); continue; }
    const cover = `/assets/books/covers/amazon-${identifier.toLowerCase()}.jpg`;
    writeFileSync(`public${cover}`, bytes);
    const source = { label: "Amazon edition", url: `https://www.amazon.com/dp/${identifier}` };
    book.cover = cover;
    book.sources = [...book.sources.filter(s => s.label !== source.label), source];
    overrides[book.id] = { ...overrides[book.id], cover, sources: book.sources };
    console.log(`Recovered: ${book.title}`);
  } catch (e) { console.log(`Unavailable: ${book.title}: ${String(e)}`); }
  await new Promise(resolve => setTimeout(resolve, 300));
}
writeFileSync(overridesPath,JSON.stringify(overrides,null,2)+"\n");
writeFileSync(path,JSON.stringify(library,null,2)+"\n");
console.log(`${library.books.filter(b=>b.cover).length}/${library.books.length} purchase covers`);
