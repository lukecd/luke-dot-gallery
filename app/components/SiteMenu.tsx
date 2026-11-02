"use client";

import { useState } from "react";
import Link from "next/link";
import { projectNavigationItems } from "../data/projectScenes";
import { ProjectLink } from "./ProjectLink";

export function SiteMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((value) => !value)}>
        <span className="sr-only">Open project menu</span><span aria-hidden="true">☰</span>
      </button>
      <nav className={`site-menu ${open ? "is-open" : ""}`} id="site-menu" aria-label="Site menu">
        {projectNavigationItems.map((item) => (
          <ProjectLink key={item.id} id={item.id} method="menu" onNavigate={() => setOpen(false)}>
            {item.label}
          </ProjectLink>
        ))}
        <Link href="/books" onClick={() => setOpen(false)}>Library →</Link>
      </nav>
    </>
  );
}
