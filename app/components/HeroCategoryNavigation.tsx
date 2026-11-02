"use client";

import { ProjectLink } from "./ProjectLink";

const heroCategories = [
  { label: "APPS", projectId: "sow" },
  { label: "TECH GUIDES", projectId: "grok" },
  { label: "MUSIC", projectId: "music" },
  { label: "FILMS", projectId: "cheer" },
] as const;

export function HeroCategoryNavigation() {
  return (
    <nav className="title-category-links" aria-label="Browse work by category">
      <p>
        {heroCategories.map((category, index) => (
          <span key={category.projectId}>
            {index > 0 && <b aria-hidden="true">✱</b>}
            <ProjectLink id={category.projectId} method="hero_category">
              {category.label}
            </ProjectLink>
          </span>
        ))}
      </p>
    </nav>
  );
}
