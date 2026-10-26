import type { ReactNode } from "react";

type ShowcaseCardProps = {
  category: string;
  kind?: string;
  title: string;
  subtitle?: string;
  description: string;
  children: ReactNode;
};

export function ShowcaseCard({ category, kind, title, subtitle, description, children }: ShowcaseCardProps) {
  return (
    <div className="showcase-card">
      <p className="showcase-kicker">{category}{kind && <> · {kind}</>}</p>
      <h2>{title}</h2>
      {subtitle && <p className="project-subtitle">{subtitle}</p>}
      <p className="project-description">{description}</p>
      <div className="project-actions">{children}</div>
    </div>
  );
}
