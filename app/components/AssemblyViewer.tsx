"use client";

import { useState } from "react";
import { AssemblyWorld } from "@/app/components/StudyWorld";
import { TRANSFORMATION_STUDIES, type TransformationSlug } from "@/app/studies/study-data";
import styles from "@/app/assembly/page.module.css";

export default function AssemblyViewer() {
  const [activeSlug, setActiveSlug] = useState<TransformationSlug>("living-core");
  const activeStudy = TRANSFORMATION_STUDIES.find(({ slug }) => slug === activeSlug)!;

  return (
    <section className={styles.workspace}>
      <aside className={styles.controls}>
        <div>
          <p className={styles.controlEyebrow}>Transformation state</p>
          <h2>Choose the core form</h2>
          <p className={styles.controlNote}>
            Orbital bodies, helix, eye, and selected form move independently. Forms still exchange without transition or scroll-driven morphing.
          </p>
        </div>

        <div className={styles.stateList} role="list" aria-label="Transformation states">
          {TRANSFORMATION_STUDIES.map((study, index) => (
            <button
              aria-pressed={study.slug === activeSlug}
              className={study.slug === activeSlug ? styles.activeState : undefined}
              key={study.slug}
              onClick={() => setActiveSlug(study.slug)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{study.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.legend}>
          <span><i className={styles.persistentDot} />Persistent apparatus</span>
          <span><i className={styles.activeDot} />Selected transformation</span>
        </div>
      </aside>

      <div className={styles.viewer}>
        <div className={styles.canvas}>
          <AssemblyWorld activeSlug={activeSlug} />
        </div>
        <div className={styles.caption}>
          <p>Orbital motion study · State {String(TRANSFORMATION_STUDIES.findIndex(({ slug }) => slug === activeSlug) + 1).padStart(2, "0")}</p>
          <h2>{activeStudy.label}</h2>
        </div>
      </div>
    </section>
  );
}
