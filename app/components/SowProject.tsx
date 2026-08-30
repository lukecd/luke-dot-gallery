"use client";

import Image from "next/image";
import { useState } from "react";
import { projects, sowScreens } from "../content";
import { SceneArt } from "./SceneArt";

export function SowProject() {
  const [activeScreen, setActiveScreen] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <section className="sow-scene" aria-label="Sow project">
      <div className="sow-card"><h2>{projects.sow.title}</h2><p className="sow-tagline">{projects.sow.tagline}</p><p className="sow-description">{projects.sow.description}</p><a href={projects.sow.link.href} target="_blank" rel="noreferrer">{projects.sow.link.label}</a><SceneArt scene="sow" slot="card" /></div>
      <div className="sow-gallery" role="region" aria-label="Sow app screen gallery">
        <div className="sow-preview">
          <div className="sow-screen-stage">
            <div className={`sow-slide ${activeScreen === 0 ? "is-active" : ""}`}>
              <Image src="/assets/sow/today-botanical-ceremony-poster.webp" alt={activeScreen === 0 ? sowScreens[0].alt : ""} fill priority sizes="55vw" className={`sow-video-poster ${videoPlaying ? "is-playing" : ""}`} />
              <video autoPlay loop muted playsInline preload="auto" aria-hidden={!videoPlaying} onPlaying={() => setVideoPlaying(true)}>
                <source src="/assets/sow/today-botanical-ceremony-web.mp4" type="video/mp4" />
              </video>
            </div>
            {[2, 3, 4].map((screen, index) => (
              <div className={`sow-slide ${activeScreen === index + 1 ? "is-active" : ""}`} key={screen}>
                <Image src={`/assets/sow/main-flow-${screen}.webp`} alt={activeScreen === index + 1 ? sowScreens[index + 1].alt : ""} fill priority sizes="55vw" />
              </div>
            ))}
          </div>
        </div>
        <div className="sow-gallery-nav" aria-label="Choose a Sow app screen">
          {sowScreens.map((screen, index) => (
            <button className={activeScreen === index ? "is-active" : ""} type="button" key={screen.label} onClick={() => setActiveScreen(index)} aria-pressed={activeScreen === index}>
              {screen.label}
            </button>
          ))}
        </div>
        <SceneArt scene="sow" slot="visual" />
      </div>
    </section>
  );
}
