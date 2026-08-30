export const projectSceneIds = ["sow", "lazy", "grok", "dflow", "music", "cheer", "lamont", "contact"] as const;

export type ProjectSceneId = (typeof projectSceneIds)[number];

type ProjectSceneWindow = {
  id: ProjectSceneId;
  activeFrom: number;
  mountFrom: number;
  mountUntil: number;
  navigationProgress: number;
};

// These windows deliberately overlap only while adjacent scenes crossfade.
// Keeping the ranges beside the scroll choreography makes mounting predictable.
const projectSceneWindows: ProjectSceneWindow[] = [
  { id: "sow", activeFrom: .64, mountFrom: .56, mountUntil: 1.46, navigationProgress: 1.05 },
  { id: "lazy", activeFrom: 1.38, mountFrom: 1.30, mountUntil: 2.36, navigationProgress: 1.92 },
  { id: "grok", activeFrom: 2.32, mountFrom: 2.24, mountUntil: 3.40, navigationProgress: 2.90 },
  { id: "dflow", activeFrom: 3.32, mountFrom: 3.24, mountUntil: 4.40, navigationProgress: 3.84 },
  { id: "music", activeFrom: 4.32, mountFrom: 4.24, mountUntil: 5.40, navigationProgress: 4.84 },
  { id: "cheer", activeFrom: 5.32, mountFrom: 5.24, mountUntil: 6.40, navigationProgress: 5.84 },
  { id: "lamont", activeFrom: 6.32, mountFrom: 6.24, mountUntil: 7.48, navigationProgress: 6.84 },
  { id: "contact", activeFrom: 7.46, mountFrom: 7.0, mountUntil: Number.POSITIVE_INFINITY, navigationProgress: 8 },
];

const projectNavigationLabels: Record<ProjectSceneId, string> = {
  sow: "Sow iOS App",
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
