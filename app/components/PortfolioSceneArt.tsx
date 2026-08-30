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

type PortfolioSceneArtProps = { mountedSceneIds: readonly ProjectSceneId[] };

export function PortfolioSceneArt({ mountedSceneIds }: PortfolioSceneArtProps) {
  return portfolioSceneArt.filter((art) => art.slot === "scene" && mountedSceneIds.includes(art.scene)).map((art) => {
    const style = {
      left: art.left,
      top: art.top,
      width: art.width,
      zIndex: art.zIndex,
      "--scene-art-opacity": sceneOpacity[art.scene],
    } as CSSProperties;

    return (
      <div className="scene-art" key={art.id} style={style} aria-hidden="true">
        <Image src={art.src} alt="" fill sizes={art.width} />
      </div>
    );
  });
}
