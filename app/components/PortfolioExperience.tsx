"use client";

import { useSyncExternalStore } from "react";
import { useProjectAnchors } from "../hooks/useProjectAnchors";
import { usePortfolioScroll } from "../hooks/usePortfolioScroll";
import { CheerAmbassadorsProject } from "./CheerAmbassadorsProject";
import { ContactScene } from "./ContactScene";
import { DflowDocsProject } from "./DflowDocsProject";
import { GrokDasProject } from "./GrokDasProject";
import { HeroScene } from "./HeroScene";
import { LamontDesignProject } from "./LamontDesignProject";
import { LazyDesignerProject } from "./LazyDesignerProject";
import { MusicProject } from "./MusicProject";
import { SowProject } from "./SowProject";
import { RelaxationStationProject } from "./RelaxationStationProject";
import { TravelingRocket } from "./TravelingRocket";

const projectScenes = [
  { id: "sow", Component: SowProject },
  { id: "relaxation", Component: RelaxationStationProject },
  { id: "lazy", Component: LazyDesignerProject },
  { id: "grok", Component: GrokDasProject },
  { id: "dflow", Component: DflowDocsProject },
  { id: "music", Component: MusicProject },
  { id: "cheer", Component: CheerAmbassadorsProject },
  { id: "lamont", Component: LamontDesignProject },
] as const;
const subscribe = () => () => {};
const clientEnhanced = () => true;
const serverEnhanced = () => false;

function PortfolioScrollExperience() {
  useProjectAnchors();
  const enhanced = useSyncExternalStore(subscribe, clientEnhanced, serverEnhanced);
  const { activeSceneId, mountedSceneIds, portfolioRef, showLaunchEffects } = usePortfolioScroll();

  return (
    <>
      <main
        ref={portfolioRef}
        className="hero"
        aria-label="Luke personal transmission"
        data-active-scene={activeSceneId ?? "launch"}
      >
        <HeroScene isActive={activeSceneId === null} showLaunchEffects={showLaunchEffects} />
        <TravelingRocket />
        {projectScenes.map(({ id, Component }) => (
          <div className="portfolio-project" key={id} inert={enhanced && activeSceneId !== id}>
            <Component showMedia={mountedSceneIds.includes(id)} />
          </div>
        ))}
        <ContactScene isActive={!enhanced || activeSceneId === "contact"} showMedia={mountedSceneIds.includes("contact")} />
      </main>
      <div className="scroll-runway" aria-hidden="true" />
    </>
  );
}

export function PortfolioExperience() {
  return <PortfolioScrollExperience />;
}
