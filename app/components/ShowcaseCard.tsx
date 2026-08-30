import type { ReactNode } from "react";

type ShowcaseCardProps = { category: string; kind?: string; title: string; description: string; children: ReactNode };

export function ShowcaseCard({ category, kind, title, description, children }: ShowcaseCardProps) {
  return <div className="showcase-card"><p className="showcase-kicker">{category}</p>{kind && <p className="film-kind">{kind}</p>}<h2>{title}</h2><p>{description}</p>{children}</div>;
}
