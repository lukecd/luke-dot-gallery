export type Purchase = { date: string; format: string; source: "Amazon"; status: "purchased" | "preorder" };
export type BookSource = { label: string; url: string };
export type Book = {
  id: string;
  title: string;
  originalTitles: string[];
  identifiers: string[];
  authors: string[];
  series: string | null;
  seriesOrder: number | null;
  purchases: Purchase[];
  cover: string | null;
  subjects: string[];
  sources: BookSource[];
  workId?: string;
  readingStatus?: "read" | "not-read" | "unknown";
  publicationYear?: number;
};
export type RememberedBook = { subjects?: string[]; id: string; title: string; authors: string[]; publicationYear: number; cover: string | null; sources: BookSource[]; readDate: null; format: string; seriesOrder: number };
export type ReadingMemory = { id: string; series: string; group: string; readingStatus: string; format: string | null; reportedBookCount?: number; reaction?: string; exactTitles: string[] | null; books?: RememberedBook[]; readDates: null; note: string };
export type Library = {
  updated: string;
  books: Book[];
  memories: ReadingMemory[];
};
