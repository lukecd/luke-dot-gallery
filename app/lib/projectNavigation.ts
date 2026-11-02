import { projectNavigationItems, type ProjectSceneId } from "../data/projectScenes";
import { trackSectionJump, type NavigationMethod } from "./analytics";

export function navigateToProject(id: ProjectSceneId, navigationMethod: NavigationMethod) {
  const destination = projectNavigationItems.find((item) => item.id === id);
  if (!destination) return;

  trackSectionJump(id, navigationMethod);
  if (window.location.hash !== `#${id}`) window.history.pushState({ ...window.history.state }, "", `/#${id}`);
  scrollToProject(id, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth");
}

export function scrollToProject(id: string, behavior: ScrollBehavior = "instant") {
  const destination = projectNavigationItems.find(item => item.id === id);
  if (id && !destination) return;
  window.scrollTo({ top: (destination?.progress ?? 0) * window.innerHeight, behavior });
}

export function navigateToLaunch() {
  trackSectionJump("launch", "masthead");
  if (window.location.hash) window.history.pushState({ ...window.history.state }, "", "/");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
