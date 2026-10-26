"use client";

import { useEffect, useRef, useState } from "react";
import {
  getActiveProjectSceneId,
  getProjectSceneProgress,
  getMountedProjectSceneIds,
  type ProjectSceneId,
} from "../data/projectScenes";
import { trackSectionView } from "../lib/analytics";

export function usePortfolioScroll() {
  const portfolioRef = useRef<HTMLElement>(null);
  const [mountedSceneIds, setMountedSceneIds] = useState<ProjectSceneId[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<ProjectSceneId | null>(null);
  const lastTrackedSectionId = useRef<ProjectSceneId | "launch" | null>(null);

  useEffect(() => {
    const sectionId = activeSceneId ?? "launch";
    if (lastTrackedSectionId.current === sectionId) return;

    trackSectionView(sectionId);
    lastTrackedSectionId.current = sectionId;
  }, [activeSceneId]);

  useEffect(() => {
    const updateScrollState = () => {
      const portfolio = portfolioRef.current;
      if (!portfolio) return;

      const progress = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 9);
      const nextMountedSceneIds = getMountedProjectSceneIds(progress);
      const nextActiveSceneId = getActiveProjectSceneId(progress);

      setMountedSceneIds((currentSceneIds) =>
        currentSceneIds.join(",") === nextMountedSceneIds.join(",")
          ? currentSceneIds
          : nextMountedSceneIds,
      );
      setActiveSceneId((currentSceneId) => currentSceneId === nextActiveSceneId ? currentSceneId : nextActiveSceneId);
      const heroProgress = Math.min(progress, 1);
      const ease = (value: number) => value * value * (3 - 2 * value);
      const { reveal: sowProgress, exit: sowExitProgress } = getProjectSceneProgress("sow", progress);
      const { reveal: relaxationProgress, exit: relaxationExitProgress } = getProjectSceneProgress("relaxation", progress);
      const { reveal: lazyProgress, exit: lazyExitProgress } = getProjectSceneProgress("lazy", progress);
      const { reveal: techProgress, exit: techExitProgress } = getProjectSceneProgress("grok", progress);
      const { reveal: dflowProgress, exit: dflowExitProgress } = getProjectSceneProgress("dflow", progress);
      const { reveal: musicProgress, exit: musicExitProgress } = getProjectSceneProgress("music", progress);
      const { reveal: cheerProgress, exit: cheerExitProgress } = getProjectSceneProgress("cheer", progress);
      const { reveal: lamontProgress, exit: lamontExitProgress } = getProjectSceneProgress("lamont", progress);
      const lamontBeaconExitProgress = Math.min(Math.max((progress - 8.02) / 0.2, 0), 1);
      const contactSkyProgress = Math.min(Math.max((progress - 8) / 0.4, 0), 1);
      const contactPlainProgress = Math.min(Math.max((progress - 8.1) / 0.24, 0), 1);
      const contactTerrainProgress = Math.min(Math.max((progress - 8.22) / 0.3, 0), 1);
      const contactPadProgress = Math.min(Math.max((progress - 8.4) / 0.22, 0), 1);
      const contactRocksProgress = Math.min(Math.max((progress - 8.38) / 0.24, 0), 1);
      const contactRocketProgress = Math.min(Math.max((progress - 8.48) / 0.42, 0), 1);
      const contactOutroProgress = Math.min(Math.max((progress - 8.9) / 0.1, 0), 1);
      const contactSmokeBuildFrame =
        contactRocketProgress < 0.72
          ? 0
          : Math.min(Math.floor((contactRocketProgress - 0.72) / 0.056) + 1, 6);
      const contactSmokeFrame = contactOutroProgress > 0
        ? Math.max(0, 6 - Math.ceil(contactOutroProgress * 6))
        : contactSmokeBuildFrame;
      const contactSmokeSpriteFrame = Math.max(contactSmokeFrame - 1, 0);
      const travelRocketProgress = Math.min(Math.max((progress - 0.55) / 7.25, 0), 1);
      const travelRocketReveal = Math.min(Math.max((progress - 0.55) / 0.15, 0), 1);
      const travelRocketExit = Math.min(Math.max((progress - 8.1) / 0.22, 0), 1);
      const easedSowProgress = ease(sowProgress);
      const easedSowExit = ease(sowExitProgress);
      const ignitionStart = .22;
      const rocketLiftStart = .42;
      const smokeExitStart = .62;
      const rocketLaunchProgress = Math.min(Math.max((heroProgress - rocketLiftStart) / .20, 0), 1);
      const heroRocketExitProgress = Math.min(Math.max((progress - .72) / .22, 0), 1);
      const smokeFrame =
        heroProgress < ignitionStart || heroProgress >= smokeExitStart
          ? 0
          : heroProgress < 0.45
            ? 1
            : heroProgress < 0.48
              ? 2
              : heroProgress < 0.52
                ? 3
                : heroProgress < 0.56
                  ? 4
                  : heroProgress < 0.6
                    ? 5
                    : 6;
      const spriteFrame = Math.max(smokeFrame - 1, 0);

      portfolio.style.setProperty("--hangar-opacity", String(1 - ease(Math.min(Math.max((heroProgress - .62) / .18, 0), 1))));
      portfolio.style.setProperty("--hero-title-opacity", String(1 - ease(Math.min(Math.max((heroProgress - .04) / .24, 0), 1))));
      portfolio.style.setProperty("--smoke-opacity", smokeFrame === 0 ? "0" : "1");
      portfolio.style.setProperty("--smoke-column", String(spriteFrame % 3));
      portfolio.style.setProperty("--smoke-row", String(Math.floor(spriteFrame / 3)));
      portfolio.style.setProperty("--rocket-lift", `${Math.round(rocketLaunchProgress * -118)}svh`);
      portfolio.style.setProperty("--hero-rocket-opacity", String(1 - ease(heroRocketExitProgress)));
      portfolio.style.setProperty("--travel-rocket-x", `${Math.round((-5 + travelRocketProgress * 101) * 100) / 100}vw`);
      portfolio.style.setProperty("--travel-rocket-opacity", String(ease(travelRocketReveal) * (1 - ease(travelRocketExit))));
      portfolio.style.setProperty("--sow-card-reveal", String(easedSowProgress * (1 - easedSowExit)));
      portfolio.style.setProperty("--sow-preview-reveal", String(ease(Math.min(Math.max((sowProgress - 0.12) / 0.88, 0), 1)) * (1 - easedSowExit)));
      portfolio.style.setProperty("--sow-exit", String(easedSowExit));
      portfolio.style.setProperty("--relaxation-reveal", String(ease(relaxationProgress) * (1 - ease(relaxationExitProgress))));
      portfolio.style.setProperty("--relaxation-exit", String(ease(relaxationExitProgress)));
      portfolio.style.setProperty("--lazy-reveal", String(ease(lazyProgress) * (1 - ease(lazyExitProgress))));
      portfolio.style.setProperty("--lazy-exit", String(ease(lazyExitProgress)));
      portfolio.style.setProperty("--tech-reveal", String(ease(techProgress) * (1 - ease(techExitProgress))));
      portfolio.style.setProperty("--tech-exit", String(ease(techExitProgress)));
      portfolio.style.setProperty("--dflow-reveal", String(ease(dflowProgress) * (1 - ease(dflowExitProgress))));
      portfolio.style.setProperty("--dflow-exit", String(ease(dflowExitProgress)));
      portfolio.style.setProperty("--music-reveal", String(ease(musicProgress) * (1 - ease(musicExitProgress))));
      portfolio.style.setProperty("--music-exit", String(ease(musicExitProgress)));
      portfolio.style.setProperty("--cheer-reveal", String(ease(cheerProgress) * (1 - ease(cheerExitProgress))));
      portfolio.style.setProperty("--cheer-exit", String(ease(cheerExitProgress)));
      portfolio.style.setProperty("--lamont-reveal", String(ease(lamontProgress)));
      portfolio.style.setProperty("--lamont-exit", String(ease(lamontExitProgress)));
      portfolio.style.setProperty("--lamont-beacon-opacity", String(1 - ease(lamontBeaconExitProgress)));
      portfolio.style.setProperty("--contact-sky-reveal", String(ease(contactSkyProgress)));
      portfolio.style.setProperty("--contact-terrain-reveal", String(ease(contactTerrainProgress)));
      portfolio.style.setProperty("--contact-plain-reveal", String(ease(contactPlainProgress)));
      portfolio.style.setProperty("--contact-pad-reveal", String(ease(contactPadProgress)));
      portfolio.style.setProperty("--contact-rocks-reveal", String(ease(contactRocksProgress)));
      portfolio.style.setProperty("--contact-rocket-land", String(ease(contactRocketProgress)));
      portfolio.style.setProperty("--contact-smoke-opacity", contactSmokeFrame === 0 ? "0" : "1");
      portfolio.style.setProperty("--contact-smoke-column", String(contactSmokeSpriteFrame % 3));
      portfolio.style.setProperty("--contact-smoke-row", String(Math.floor(contactSmokeSpriteFrame / 3)));
      portfolio.style.setProperty("--contact-form-reveal", String(ease(contactOutroProgress)));
      portfolio.style.setProperty(
        "--smoke-image",
        smokeFrame > 0 || contactSmokeFrame > 0
          ? 'url("/assets/launch/rocket-smoke-sprite.png")'
          : "none",
      );
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return { activeSceneId, mountedSceneIds, portfolioRef };
}
