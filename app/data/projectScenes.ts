export const projectSceneIds = ["sow", "relaxation", "lazy", "grok", "dflow", "music", "cheer", "lamont", "contact"] as const;

export type ProjectSceneId = (typeof projectSceneIds)[number];

type ProjectSceneWindow = {
  id: ProjectSceneId;
  activeFrom: number;
  revealUntil: number;
  exitFrom: number;
  mountFrom: number;
  mountUntil: number;
  navigationProgress: number;
};

// These windows deliberately overlap only while adjacent scenes crossfade.
// Keeping the ranges beside the scroll choreography makes mounting predictable.
const projectSceneWindows: ProjectSceneWindow[] = [
  { id: "sow", activeFrom: .64, revealUntil: 1, exitFrom: 1.14, mountFrom: .56, mountUntil: 1.46, navigationProgress: 1.05 },
  { id: "relaxation", activeFrom: 1.38, revealUntil: 1.86, exitFrom: 2.06, mountFrom: 1.30, mountUntil: 2.36, navigationProgress: 1.92 },
  { id: "lazy", activeFrom: 2.38, revealUntil: 2.86, exitFrom: 3.06, mountFrom: 2.3, mountUntil: 3.36, navigationProgress: 2.92 },
  { id: "grok", activeFrom: 3.32, revealUntil: 3.78, exitFrom: 4.1, mountFrom: 3.24, mountUntil: 4.4, navigationProgress: 3.9 },
  { id: "dflow", activeFrom: 4.32, revealUntil: 4.78, exitFrom: 5.1, mountFrom: 4.24, mountUntil: 5.4, navigationProgress: 4.84 },
  { id: "music", activeFrom: 5.32, revealUntil: 5.78, exitFrom: 6.1, mountFrom: 5.24, mountUntil: 6.4, navigationProgress: 5.84 },
  { id: "cheer", activeFrom: 6.32, revealUntil: 6.78, exitFrom: 7.1, mountFrom: 6.24, mountUntil: 7.4, navigationProgress: 6.84 },
  { id: "lamont", activeFrom: 7.32, revealUntil: 7.78, exitFrom: 8.18, mountFrom: 7.24, mountUntil: 8.48, navigationProgress: 7.84 },
  { id: "contact", activeFrom: 8.46, revealUntil: 9, exitFrom: Number.POSITIVE_INFINITY, mountFrom: 8, mountUntil: Number.POSITIVE_INFINITY, navigationProgress: 9 },
];

const projectNavigationLabels: Record<ProjectSceneId, string> = {
  sow: "Sow iOS App",
  relaxation: "Relaxation Station App",
  lazy: "Lazy Designer Shopify App",
  grok: "DAS Explainer Video",
  dflow: "DFlow Docs",
  music: "Travel Back to the Now Album",
  cheer: "The Cheer Ambassadors Film",
  lamont: "Lamont Design Video",
  contact: "Contact",
};

// Menu destinations are deliberately inside each scene's fully revealed window,
// so a direct jump never lands while its main visual is still entering.
export const projectNavigationItems = projectSceneWindows.map(({ id, navigationProgress }) => ({
  id,
  label: projectNavigationLabels[id],
  progress: navigationProgress,
}));

export function getMountedProjectSceneIds(progress: number): ProjectSceneId[] {
  return projectSceneWindows
    .filter(({ mountFrom, mountUntil }) => progress >= mountFrom && progress < mountUntil)
    .map(({ id }) => id);
}

export function getActiveProjectSceneId(progress: number): ProjectSceneId | null {
  return projectSceneWindows.reduce<ProjectSceneId | null>(
    (activeId, scene) => progress >= scene.activeFrom ? scene.id : activeId,
    null,
  );
}

// Shared scene timing drives both navigation and reveal/exit animation.
export function getProjectSceneProgress(id: ProjectSceneId, progress: number) {
  const scene = projectSceneWindows.find((window) => window.id === id)!;
  const fraction = (start: number, end: number) => Math.min(Math.max((progress - start) / (end - start), 0), 1);
  return {
    reveal: fraction(scene.activeFrom, scene.revealUntil),
    exit: Number.isFinite(scene.exitFrom) ? fraction(scene.exitFrom, scene.mountUntil) : 0,
  };
}
