"use client";
import { useEffect, useMemo, useRef } from "react";
import { trackEvent } from "../../lib/analytics";
import { books } from "../collection";
import { defaultLocation } from "../navigation";
import { firstPurchase, matchesBook, normalizeSearch } from "../library";
import { AuthorLinks } from "./AuthorLinks";
import { BooksHeader } from "./BooksHeader";
import { LibraryControls } from "./LibraryControls";
import { PurchaseTimeline } from "./PurchaseTimeline";
import { BookDiscovery } from "./BookDiscovery";
import { ConnectionMap } from "./ConnectionMap";
import { useBooksNavigation } from "../hooks/useBooksNavigation";
import styles from "../books.module.css";

const years = [...new Set(books.map(b => firstPurchase(b)?.date.slice(0,4)).filter((y): y is string => Boolean(y)))].sort().reverse();
export function BooksExperience({ initialSearch }: { initialSearch: string }) {
  const { state, navigate, changeQuery, finishQuery } = useBooksNavigation(initialSearch);
  const { query, author, year, sort, view, focusId, relation, discoveryFilter } = state;
  const previousView = useRef<string | null>(null);
  useEffect(() => {
    if (previousView.current !== view) {
      trackEvent("library_view", { library_view: view });
      previousView.current = view;
    }
  }, [view]);
  const matches = useMemo(() => books.filter(b => matchesBook(b, query) && (!author || b.authors.some(name => normalizeSearch(name) === normalizeSearch(author)))), [query, author]);
  const visible = matches.filter(b => year === "all" || (firstPurchase(b)?.date.slice(0,4) ?? "undated") === year);
  const focused = matches.find(b => b.id === (focusId === "dune" ? "memory-dune-1" : focusId)) ?? matches.find(b => normalizeSearch(b.title) === normalizeSearch(query)) ?? matches[0];
  const clear = () => navigate({ query: "", author: "", year: "all" });
  const showAllBooks = () => {
    navigate(defaultLocation);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const showConnections = (focusId: string) => {
    trackEvent("library_book_select", { book_id: focusId });
    navigate({ focusId, relation: "all", view: "connections", query: "", author: "", year: "all" });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const showAuthor = (author: string) => {
    trackEvent("library_author_select", { author_name: author });
    navigate({ author, query: "", year: "all", view: "timeline", relation: "all" });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const completeSearch = () => {
    finishQuery();
    if (query.trim()) trackEvent("library_search", { ...(view === "next" ? {} : { result_count: matches.length }), library_view: view });
  };
  const results = view === "timeline" ? visible : matches;
  return <main className={styles.page}><div className={styles.container}>
    <BooksHeader view={view} onHome={showAllBooks} />
    <LibraryControls query={query} onQuery={changeQuery} onQueryEnd={completeSearch} view={view} onView={view => navigate({ view, author: "", year: "all" })} sort={sort} onSort={sort => navigate({ sort })} />
    {view !== "next" && <div className={styles.collectionSummary} role="status" aria-live="polite"><span>{results.length} {results.length === 1 ? "book" : "books"}{author && <> by <AuthorLinks authors={[author]} onAuthor={showAuthor} /></>}</span>{(query || author || year !== "all") && <button className={styles.textButton} onClick={clear}>Clear filters</button>}</div>}
    {view === "next" && <BookDiscovery books={books} query={query} author={author} filter={discoveryFilter} onFilter={discoveryFilter => { trackEvent("library_discovery_filter", { discovery_filter: discoveryFilter }); navigate({discoveryFilter}); }} onAuthor={showAuthor} />}
    {view === "timeline" && (visible.length ? <PurchaseTimeline books={visible} year={year} years={years} onYear={year => navigate({ year })} sort={sort} onSelect={showConnections} onAuthor={showAuthor} /> : <div className={styles.empty}><h2>No books found.</h2><p>Try another search.</p><button className={styles.primaryButton} onClick={clear}>Reset filters</button></div>)}
    {view === "connections" && <ConnectionMap key={`${focused?.id}:${relation}`} relation={relation} onRelation={relation => { trackEvent("library_connection_filter", { relation }); navigate({ relation }); }} book={focused} books={books} choices={[...matches].sort((a,b) => a.title.localeCompare(b.title))} onFocus={showConnections} onAuthor={showAuthor} onHome={showAllBooks} />}
    <footer className={styles.footer}><span>LUKE / BOOKS</span><p>A personal collection, still growing.</p></footer>
  </div></main>;
}
