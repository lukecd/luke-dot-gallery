import Image from "next/image";
import type { CSSProperties } from "react";
import { portfolioSceneArt } from "../data/portfolioSceneArt";
import type { ProjectSceneId } from "../data/projectScenes";

const sceneOpacity = {
  sow: "var(--sow-card-reveal)",
  lazy: "var(--lazy-reveal)",
  grok: "var(--tech-reveal)",
  dflow: "var(--dflow-reveal)",
  music: "var(--music-reveal)",
  cheer: "var(--cheer-reveal)",
  lamont: "var(--lamont-reveal)",
} as const;

type SceneArtSlot = "card" | "visual";
type ProjectArtSceneId = Exclude<ProjectSceneId, "contact">;

type SceneArtProps = {
  scene: ProjectArtSceneId;
  slot: SceneArtSlot;
};

export function SceneArt({ scene, slot }: SceneArtProps) {
  return portfolioSceneArt.filter((art) => art.scene === scene && art.slot === slot).map((art) => (
    <div
      aria-hidden="true"
      className={`scene-art scene-art--anchored scene-art--${art.placement}`}
      key={art.id}
      style={{ "--scene-art-width": art.width, "--scene-art-opacity": art.opacity ?? sceneOpacity[scene] } as CSSProperties}
    >
      <Image src={art.src} alt="" fill sizes={art.width} />
    </div>
  ));
}
