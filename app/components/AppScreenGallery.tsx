"use client";

import Image from "next/image";
import { useState } from "react";

export type AppScreen = {
  label: string;
  src: string;
  alt: string;
  video?: string;
  frame?: "website" | "tablet";
};

export function AppScreenGallery({ name, screens }: { name: string; screens: readonly AppScreen[] }) {
  const [active, setActive] = useState(0);
  const screen = screens[active];

  return (
    <div className="app-gallery" role="region" aria-label={`${name} screen gallery`}>
      <div className={`screen-frame screen-frame--${screen.frame ?? "tablet"}`}>
        <div className="screen-frame__display">
          {screen.video ? (
            <video key={screen.src} autoPlay loop muted playsInline preload="metadata" poster={screen.src} aria-label={screen.alt}>
              <source src={screen.video} type="video/mp4" />
            </video>
          ) : (
            <Image key={screen.src} src={screen.src} alt={screen.alt} fill sizes="(max-width: 600px) 88vw, (max-height: 800px) 70vh, 46rem" />
          )}
        </div>
      </div>
      <div className="screen-navigation" aria-label={`Browse ${name} screens`}>
        <button type="button" aria-label={`Previous ${name} screen`} onClick={() => setActive((current) => (current - 1 + screens.length) % screens.length)}>
          <span aria-hidden="true">←</span>
        </button>
        <span className="screen-position" role="status" aria-live="polite" aria-atomic="true">
          <span className="sr-only">{screen.label}, </span>{active + 1} of {screens.length}
        </span>
        <button type="button" aria-label={`Next ${name} screen`} onClick={() => setActive((current) => (current + 1) % screens.length)}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
