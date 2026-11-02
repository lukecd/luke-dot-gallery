"use client";
import type { ReactNode } from "react";
import type { ProjectSceneId } from "../data/projectScenes";
import type { NavigationMethod } from "../lib/analytics";
import { navigateToProject } from "../lib/projectNavigation";
import { isPlainClick } from "../lib/linkNavigation";

export function ProjectLink({ id, method, children, className, onNavigate }: { id: ProjectSceneId; method: NavigationMethod; children: ReactNode; className?: string; onNavigate?: () => void }) {
  return <a href={`/#${id}`} className={className} onClick={event => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    navigateToProject(id, method);
    onNavigate?.();
  }}>{children}</a>;
}
