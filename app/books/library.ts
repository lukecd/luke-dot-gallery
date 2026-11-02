import type { Book, Purchase, Library } from "./types";

export const dateLabel = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
export const firstPurchase = (book: Book): Purchase | undefined => [...book.purchases].sort((a,b) => a.date.localeCompare(b.date))[0];
export const normalizeSearch = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function matchesBook(book: Book, query: string) {
  const text = normalizeSearch([book.title, ...book.originalTitles, ...book.authors, book.series ?? "", ...book.subjects].join(" "));
  return normalizeSearch(query).split(/\s+/).every(word => text.includes(word));
}
export function purchaseLabel(purchase: Purchase) { return `${purchase.status === "preorder" ? "Preordered" : "Purchased"} ${dateLabel(purchase.date)}`; }
export function sameAuthors(a: Book, b: Book) { return a.authors.some(author => b.authors.includes(author)); }
export function seriesSort(a: Book, b: Book) { return (a.seriesOrder ?? 999) - (b.seriesOrder ?? 999) || (firstPurchase(a)?.date ?? "").localeCompare(firstPurchase(b)?.date ?? ""); }
export function relatedBooks(book: Book, books: Book[]) {
  const series = book.series ? books.filter(b => b.id !== book.id && b.series === book.series).sort(seriesSort) : [];
  const authors = books.filter(b => b.id !== book.id && sameAuthors(book,b) && !series.includes(b));
  const together = books.filter(b => b.id !== book.id && b.purchases.some(p => book.purchases.some(bp => bp.date === p.date)) && !series.includes(b) && !authors.includes(b));
  return { series, authors, together };
}

export function collectionBooks(library: Library): Book[] {
  return [
    ...library.books.map(book => ({ ...book, readingStatus: "read" } as Book)),
    ...library.memories.flatMap(memory => (memory.books ?? []).map(book => ({
      id:book.id, title:book.title, authors:book.authors, originalTitles:[book.title], identifiers:[],
      series:memory.series, seriesOrder:book.seriesOrder, purchases:[], cover:book.cover,
      subjects:book.subjects ?? [], sources:book.sources, readingStatus:"read", publicationYear:book.publicationYear,
    } as Book))),
  ];
}
