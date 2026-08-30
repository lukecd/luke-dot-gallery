import { projectNavigationItems, type ProjectSceneId } from "../data/projectScenes";
import { trackSectionJump, type NavigationMethod } from "./analytics";

export function navigateToProject(id: ProjectSceneId, navigationMethod: NavigationMethod) {
  const destination = projectNavigationItems.find((item) => item.id === id);
  if (!destination) return;

  trackSectionJump(id, navigationMethod);
  window.scrollTo({ top: destination.progress * window.innerHeight, behavior: "smooth" });
}

export function navigateToLaunch() {
  trackSectionJump("launch", "masthead");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
