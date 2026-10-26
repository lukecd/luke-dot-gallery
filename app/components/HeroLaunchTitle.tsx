"use client";

import { navigateToProject } from "../lib/projectNavigation";
import { HeroCategoryNavigation } from "./HeroCategoryNavigation";
import styles from "./HangarScene.module.css";

export function HeroLaunchTitle() {
  return (
    <div className={styles.title}>
      <HeroCategoryNavigation />
      <h1>LUKE</h1>
      <button type="button" className={styles.launch} onClick={() => navigateToProject("sow", "hero_launch")}>
        SCROLL TO LAUNCH <span aria-hidden="true">↓</span>
      </button>
    </div>
  );
}
