export type LibraryView = "timeline" | "connections" | "next";
export type BooksLocation = { query: string; author: string; year: string; sort: string; view: LibraryView; focusId: string; relation: string; discoveryFilter: string };
export const defaultLocation: BooksLocation = { query: "", author: "", year: "all", sort: "newest", view: "timeline", focusId: "dune", relation: "all", discoveryFilter: "all" };
export function readBooksLocation(search: string): BooksLocation {
  const p = new URLSearchParams(search);
  // Old detail links now open the same book directly in Connections.
  const legacyBook = p.get("book");
  // Preserve bookmarked filters after broadening the topic label.
  if (p.get("relation") === "LGBTQ lives") p.set("relation", "LGBTQ themes");
  return { query: legacyBook ? "" : p.get("q") ?? "", author: legacyBook ? "" : p.get("author") ?? "", year: legacyBook ? "all" : p.get("year") || "all", sort: ["oldest", "title"].includes(p.get("sort") ?? "") ? p.get("sort")! : "newest", view: legacyBook || p.get("view") === "connections" ? "connections" : p.get("view") === "next" ? "next" : "timeline", focusId: legacyBook || p.get("focus") || "dune", relation: p.get("relation") || "all", discoveryFilter: ["series","authors"].includes(p.get("discover") ?? "") ? p.get("discover")! : "all" };
}
export function booksLocationUrl(state: BooksLocation) {
  const p = new URLSearchParams();
  const keys = { query: "q", author: "author", year: "year", sort: "sort", view: "view", focusId: "focus", relation: "relation", discoveryFilter: "discover" } as const;
  for (const [key, param] of Object.entries(keys)) {
    const value = state[key as keyof BooksLocation];
    if (value && value !== defaultLocation[key as keyof BooksLocation]) p.set(param, value);
  }
  return `/books${p.size ? `?${p}` : ""}`;
}
