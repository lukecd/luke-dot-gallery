"use client";

import { navigateToProject } from "../lib/projectNavigation";

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
            <button type="button" onClick={() => navigateToProject(category.projectId, "hero_category")}>
              {category.label}
            </button>
          </span>
        ))}
      </p>
    </nav>
  );
}
