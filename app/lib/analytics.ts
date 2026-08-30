export const GA_MEASUREMENT_ID = "G-Q5T874Q6XS";

export type AnalyticsSectionId =
  | "launch"
  | "sow"
  | "lazy"
  | "grok"
  | "dflow"
  | "music"
  | "cheer"
  | "lamont"
  | "contact";

export type NavigationMethod = "menu" | "hero_category" | "masthead";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function sendEvent(name: string, parameters: Record<string, string>) {
  if (process.env.NODE_ENV !== "production" || typeof window === "undefined") return;

  const event = ["event", name, parameters];
  if (window.gtag) {
    window.gtag(...event);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}

export function trackSectionView(sectionId: AnalyticsSectionId) {
  sendEvent("section_view", {
    section_id: sectionId,
    section_name: sectionId === "launch" ? "Launch" : sectionId,
  });
}

export function trackSectionJump(menuTarget: AnalyticsSectionId, navigationMethod: NavigationMethod) {
  sendEvent("section_jump", {
    navigation_method: navigationMethod,
    menu_target: menuTarget,
  });
}
