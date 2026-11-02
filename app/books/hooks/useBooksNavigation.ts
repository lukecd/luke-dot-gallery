"use client";
import { useRef, useSyncExternalStore } from "react";
import { booksLocationUrl, readBooksLocation, type BooksLocation } from "../navigation";

const changeEvent = "books-location-change";
function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(changeEvent, callback);
  return () => { window.removeEventListener("popstate", callback); window.removeEventListener(changeEvent, callback); };
}
const snapshot = () => window.location.search;
const serverSnapshot = () => "";
const clientReady = () => true;
const serverReady = () => false;

export function useBooksNavigation() {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const search = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const state = readBooksLocation(search);
  const searchEntry = useRef<string | null>(null);
  function navigate(patch: Partial<BooksLocation>, replace = false) {
    const next = { ...readBooksLocation(window.location.search), ...patch };
    const url = booksLocationUrl(next);
    searchEntry.current = null;
    if (url === `${window.location.pathname}${window.location.search}`) return;
    // Retain Next's history metadata, so route-level Back also continues to work.
    const historyState = { ...window.history.state };
    window.history[replace ? "replaceState" : "pushState"](historyState, "", url);
    window.dispatchEvent(new Event(changeEvent));
  }
  function changeQuery(query: string) {
    // One history entry per editing session, never one entry per keystroke.
    const replace = searchEntry.current === window.location.search;
    navigate({ query, year: "all" }, replace);
    searchEntry.current = window.location.search;
  }
  return { ready, state, navigate, changeQuery, finishQuery: () => { searchEntry.current = null; } };
}
