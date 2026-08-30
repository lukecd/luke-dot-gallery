"use client";

import { usePortfolioScroll } from "../hooks/usePortfolioScroll";
import { CheerAmbassadorsProject } from "./CheerAmbassadorsProject";
import { ContactScene } from "./ContactScene";
import { DflowDocsProject } from "./DflowDocsProject";
import { GrokDasProject } from "./GrokDasProject";
import { HeroScene } from "./HeroScene";
import { LamontDesignProject } from "./LamontDesignProject";
import { LazyDesignerProject } from "./LazyDesignerProject";
import { MusicProject } from "./MusicProject";
import { PortfolioSceneArt } from "./PortfolioSceneArt";
import { SowProject } from "./SowProject";
import { TravelingRocket } from "./TravelingRocket";

const projectScenes = [
  { id: "sow", Component: SowProject },
  { id: "lazy", Component: LazyDesignerProject },
  { id: "grok", Component: GrokDasProject },
  { id: "dflow", Component: DflowDocsProject },
  { id: "music", Component: MusicProject },
  { id: "cheer", Component: CheerAmbassadorsProject },
  { id: "lamont", Component: LamontDesignProject },
] as const;

function PortfolioScrollExperience() {
  const { activeSceneId, mountedSceneIds, portfolioRef } = usePortfolioScroll();

  return (
    <>
      <main
        ref={portfolioRef}
        className="hero"
        aria-label="Luke personal transmission"
        data-active-scene={activeSceneId ?? "launch"}
      >
        <HeroScene />
        <TravelingRocket />
        <PortfolioSceneArt mountedSceneIds={mountedSceneIds} />
        {projectScenes.map(({ id, Component }) => mountedSceneIds.includes(id) && (
          <div key={id} inert={activeSceneId !== id}>
            <Component />
          </div>
        ))}
        {mountedSceneIds.includes("contact") && (
          <ContactScene isActive={activeSceneId === "contact"} />
        )}
      </main>
      <div className="scroll-runway" aria-hidden="true" />
    </>
  );
}

export function PortfolioExperience() {
  return <PortfolioScrollExperience />;
}
