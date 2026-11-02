"use client";

import { ProjectLink } from "./ProjectLink";
import { HeroCategoryNavigation } from "./HeroCategoryNavigation";
import styles from "./HangarScene.module.css";

export function HeroLaunchTitle() {
  return (
    <div className={`${styles.title} portfolio-title`}>
      <HeroCategoryNavigation />
      <h1>LUKE</h1>
      <p className={styles.identity}>Luke Cassady-Dorion</p>
      <ProjectLink id="sow" method="hero_launch" className={styles.launch}>
        SCROLL TO LAUNCH <span aria-hidden="true">↓</span>
      </ProjectLink>
    </div>
  );
}
