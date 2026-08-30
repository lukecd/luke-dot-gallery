"use client";

import { useState } from "react";
import { projectNavigationItems } from "../data/projectScenes";
import { navigateToProject } from "../lib/projectNavigation";

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const goTo = (id: (typeof projectNavigationItems)[number]["id"]) => {
    navigateToProject(id, "menu");
    setOpen(false);
  };

  return (
    <>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((value) => !value)}>
        <span className="sr-only">Open project menu</span><span aria-hidden="true">☰</span>
      </button>
      <nav className={`site-menu ${open ? "is-open" : ""}`} id="site-menu" aria-label="Projects">
        {projectNavigationItems.map((item) => (
          <button key={item.id} type="button" onClick={() => goTo(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
