import type { ProjectSceneId } from "../data/projectScenes";

export const GA_MEASUREMENT_ID = "G-Q5T874Q6XS";
export const GA_PRODUCTION_HOST = "luke.gallery";

export type AnalyticsSectionId = "launch" | ProjectSceneId;

export type NavigationMethod = "menu" | "hero_category" | "hero_launch" | "masthead";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParameters = Record<string, string | number>;

export function trackEvent(name: string, parameters: EventParameters = {}) {
  if (process.env.NODE_ENV !== "production" || typeof window === "undefined" || window.location.hostname !== GA_PRODUCTION_HOST) return;

  const event = ["event", name, parameters];
  if (window.gtag) {
    window.gtag(...event);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}

export function trackSectionView(sectionId: AnalyticsSectionId) {
  trackEvent("section_view", {
    section_id: sectionId,
    section_name: sectionId === "launch" ? "Launch" : sectionId,
  });
}

export function trackSectionJump(menuTarget: AnalyticsSectionId, navigationMethod: NavigationMethod) {
  trackEvent("section_jump", {
    navigation_method: navigationMethod,
    menu_target: menuTarget,
  });
}
