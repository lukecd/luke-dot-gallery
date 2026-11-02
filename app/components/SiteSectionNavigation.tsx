"use client";
import Link from "next/link";
import styles from "./SiteSectionNavigation.module.css";

export function SiteSectionNavigation({ active, onPortfolioHome, onLibraryHome }: {
  active: "portfolio" | "library"; onPortfolioHome?: () => void; onLibraryHome?: () => void;
}) {
  return <nav className={styles.navigation} aria-label="Site sections">
    <Link href="/" aria-current={active === "portfolio" ? "page" : undefined} onNavigate={onPortfolioHome ? event => {event.preventDefault();onPortfolioHome();} : undefined}>Portfolio</Link>
    <span aria-hidden="true">/</span>
    <Link href="/books" aria-current={active === "library" ? "page" : undefined} onNavigate={onLibraryHome ? event => {event.preventDefault();onLibraryHome();} : undefined}>Library</Link>
  </nav>;
}
