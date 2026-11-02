import Link from "next/link";
import type { ReactNode } from "react";

export function AllBooksLink({ onHome, className, children }: {
  onHome: () => void; className?: string; children: ReactNode;
}) {
  return <Link href="/books" className={className} onNavigate={event => {
    event.preventDefault();
    onHome();
  }}>{children}</Link>;
}
