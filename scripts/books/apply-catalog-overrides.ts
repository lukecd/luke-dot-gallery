/** Reapply reviewed matches and complete cached subjects without network requests. */
import { readFileSync, writeFileSync } from "node:fs";
import type { Book, Library } from "../../app/books/types";
const path = "app/books/data/library.json";
const library: Library = JSON.parse(readFileSync(path, "utf8"));
const cache = JSON.parse(readFileSync("design/books/open-library-cache.json", "utf8"));
const overrides: Record<string, Partial<Book>> = JSON.parse(readFileSync("design/books/catalog-overrides.json", "utf8"));
const subjects = (id: string) => (cache[id]?.match?.subject ?? []).filter((s: string) => !/^accessible|^protected|^in library|^overdrive|^large type|^nyt:|^reading level|^fic[0-9]/i.test(s));
for (const book of library.books) {
  book.subjects = subjects(book.id);
  Object.assign(book, overrides[book.id]);
}
for (const memory of library.memories) for (const book of memory.books ?? []) {
  book.subjects = overrides[book.id]?.subjects ?? subjects(book.id);
}
writeFileSync(path, JSON.stringify(library, null, 2) + "\n");
console.log(`Applied ${Object.keys(overrides).length} reviewed catalog overrides.`);
