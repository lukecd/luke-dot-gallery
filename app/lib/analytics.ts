import type { ProjectSceneId } from "../data/projectScenes";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
export const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/i.test(measurementId) ? measurementId : "";
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
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== "production" || typeof window === "undefined" || window.location.hostname !== GA_PRODUCTION_HOST) return;

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
