"use client";
/* eslint-disable @next/next/no-img-element */

import { lazy, Suspense, useState } from "react";

const ScrollWorld = lazy(() => import("./components/ScrollWorld"));

function VideoFacade({
  embedUrl,
  poster,
  title,
}: {
  embedUrl: string;
  poster: string;
  title: string;
}) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
      />
    );
  }

  return (
    <button className="video-facade" type="button" onClick={() => setActive(true)} aria-label={`Play ${title}`}>
      <img src={poster} alt="" loading="lazy" decoding="async" />
      <span>Play video <i aria-hidden="true">▶</i></span>
    </button>
  );
}

export default function Home() {
  return (
    <main>
      <Suspense fallback={null}>
        <ScrollWorld />
      </Suspense>
      <section className="hero" id="top" data-scene="hero">
        <img
          className="hero-machine-plate"
          src="/images/living-machine-plate.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-vignette" aria-hidden="true" />

        <header className="nav shell">
          <a className="wordmark" href="#top" aria-label="Luke, home">
            Luke<span className="wordmark-dot">.</span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
            <a href="/resume/Luke-Cassady-Dorion-Resume.pdf" target="_blank" rel="noreferrer">
              Résumé
            </a>
          </nav>
        </header>

        <div className="hero-copy shell">
          <p className="eyebrow reveal reveal-one">Developer · designer · maker</p>
          <h1 className="reveal reveal-two">
            I make things for people<span className="accent">...</span>
            <br />
            <em>with computers.</em>
          </h1>
          <p className="hero-description reveal reveal-three">
            Apps, tools, explanations, music, and occasionally films.
          </p>
          <a className="text-link reveal reveal-four" href="#work">
            Explore selected work <span aria-hidden="true">↘</span>
          </a>
        </div>

        <div className="scroll-note" aria-hidden="true">
          <span /> Scroll to grow
        </div>
      </section>

      <section className="work" id="work" data-scene="work">
        <div className="work-glow" aria-hidden="true" />

        <article className="sow-card shell">
          <div className="sow-copy">
            <span className="project-number">01</span>
            <p className="project-kind">Independent product · 2026</p>
            <h2>Sow</h2>
            <h3>A garden journal that listens.</h3>
            <p>
              An iPhone and iPad app that turns a short garden walk into a lasting memory... using voice,
              photographs, weather, and the rhythms of the natural world.
            </p>
            <div className="project-tags" aria-label="Project disciplines">
              <span>Product design</span>
              <span>iOS + iPadOS</span>
              <span>AI-assisted journaling</span>
            </div>
            <div className="project-actions">
              <a href="https://sow.garden" target="_blank" rel="noreferrer">Visit sow.garden ↗</a>
              <span className="disabled-action" aria-disabled="true">Download on the App Store</span>
            </div>
          </div>

          <div className="sow-gallery" aria-label="Selected Sow app screens">
            <figure className="sow-image sow-image-clear">
              <img src="/images/sow/plants-and-walks.webp" alt="Sow garden walks and plant memories across iPhone and iPad" loading="lazy" decoding="async" />
            </figure>
          </div>
        </article>
      </section>

      <section className="ai-project project-section" id="ai-garden" data-scene="garden">
        <div className="shell project-section-grid">
          <div className="project-section-copy">
            <p className="eyebrow dark"><span>02</span> Creative AI · Shopify · Made by me</p>
            <h2>AI Garden<br /><em>Designer</em></h2>
            <p>Describe your space, share a photograph, and turn an idea into a garden you can plan and build.</p>
          </div>
          <div className="ai-canvas" aria-label="AI Garden Designer project placeholder">
            <div className="plan-grid" />
            <div className="garden-bed bed-one" />
            <div className="garden-bed bed-two" />
            <div className="garden-bed bed-three" />
            <span className="plan-node node-one" />
            <span className="plan-node node-two" />
            <span className="plan-node node-three" />
            <p>Garden plan / 01</p>
          </div>
        </div>
      </section>

      <section className="devrel project-section" id="devrel" data-scene="devrel">
        <div className="shell devrel-heading">
          <p className="eyebrow"><span>03</span> Developer relations</p>
          <h2>Helping developers<br /><em>understand and build.</em></h2>
          <p>
            I work in Developer Relations full time. I make technical systems easier to understand through
            documentation, examples, demos, and video.
          </p>
        </div>
        <div className="shell feature-video">
          <div className="video-frame">
            <VideoFacade
              embedUrl="https://www.youtube-nocookie.com/embed/9Y5rc8OC6yE?rel=0&autoplay=1"
              poster="/images/devrel-das-poster.webp"
              title="Grok DAS in 5 minutes"
            />
          </div>
          <div className="video-copy">
            <p className="project-kind">Technical explainer</p>
            <h3>Grok DAS in five minutes.</h3>
            <p>
              A five-minute explanation of a data availability system, focused on the concepts developers need
              before they start building.
            </p>
            <a href="https://www.youtube.com/watch?v=9Y5rc8OC6yE" target="_blank" rel="noreferrer">Watch on YouTube ↗</a>
          </div>
        </div>
      </section>

      <section className="docs project-section" id="docs" data-scene="docs">
        <div className="shell docs-grid">
          <div className="docs-copy">
            <p className="eyebrow"><span>04</span> Documentation systems</p>
            <h2>DFlow<br /><em>Docs</em></h2>
            <p>
              Documentation for a unified trading API on Solana... concepts, integration guides, examples,
              troubleshooting, and API reference.
            </p>
            <a href="https://pond.dflow.net/" target="_blank" rel="noreferrer">Explore the docs ↗</a>
          </div>
          <a className="docs-window" href="https://pond.dflow.net/" target="_blank" rel="noreferrer" aria-label="Open the DFlow documentation">
            <div className="window-bar"><i /><i /><i /><span>pond.dflow.net</span></div>
            <img className="docs-screenshot" src="/images/dflow-docs.webp" alt="DFlow documentation homepage" loading="lazy" decoding="async" />
          </a>
        </div>
      </section>

      <section className="creative-work project-section" id="creative-work" data-scene="creative">
        <div className="shell creative-heading">
          <p className="eyebrow dark"><span>05</span> Away from the keyboard</p>
          <h2>Music and moving images.</h2>
        </div>
        <div className="shell creative-grid">
          <article className="album-card">
            <img src="/images/travel-back-to-the-now.webp" alt="Travel Back to the Now album cover" loading="lazy" decoding="async" />
            <div><p className="project-kind">Album</p><h3>Travel Back to the Now</h3><p>Traditional Thai sounds, psychedelic noise, and dance music grooves... made to quiet the mind and return the listener to the present.</p><div className="media-links"><a href="https://music.apple.com/us/album/travel-back-to-the-now-ep/1519280723" target="_blank" rel="noreferrer">Apple Music ↗</a><a href="https://open.spotify.com/artist/2t2qaObfUFyPorEkNyo0jt" target="_blank" rel="noreferrer">Spotify ↗</a></div></div>
          </article>
          <article className="film-card cheer-film">
            <div className="film-frame"><VideoFacade embedUrl="https://www.youtube-nocookie.com/embed/F71UCJ-nd2U?rel=0&autoplay=1" poster="/images/cheer-ambassadors-poster.webp" title="The Cheer Ambassadors" /></div>
            <p className="project-kind">Documentary · Director</p><h3>The Cheer Ambassadors</h3><p>An award-winning underdog story about Thailand’s self-taught national cheerleading team, seen by festival audiences in more than ten countries.</p>
          </article>
          <article className="film-card lamont-film">
            <div className="film-frame"><VideoFacade embedUrl="https://player.vimeo.com/video/160713735?h=354e808d5d&autoplay=1" poster="/images/lamont-design-poster.webp" title="Lamont Design" /></div>
            <p className="project-kind">Brand film · Producer</p><h3>Lamont Design</h3><p>A portrait of a designer, his relationship with Thailand, and a contemporary table made through traditional Thai craftsmanship.</p>
          </article>
        </div>
      </section>

      <section className="contact" id="contact" data-scene="contact">
        <div className="contact-orbit" aria-hidden="true"><i /></div>
        <div className="shell contact-grid">
          <div className="contact-copy">
            <p className="eyebrow"><span>06</span> Say hello</p>
            <h2>Working on something <em>interesting?</em></h2>
            <div className="contact-links">
              <a href="/resume/Luke-Cassady-Dorion-Resume.pdf" target="_blank" rel="noreferrer">View résumé ↗</a>
              <a href="https://github.com/lukecd" target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </div>

          <form className="contact-form" action="https://getform.io/f/19f5b563-72f2-49a9-a5a0-faa9d50c4b5e" method="post">
            <label>
              Your name
              <input type="text" name="name" autoComplete="name" required />
            </label>
            <label>
              Email
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label>
              What are you making?
              <textarea name="message" rows={4} required />
            </label>
            <button type="submit">Send a note <span aria-hidden="true">→</span></button>
          </form>
        </div>

        <footer className="shell footer">
          <span>Luke Cassady-Dorion</span>
          <span>Koh Samui, Thailand · <span className="status-dot" /> Available selectively</span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </section>
    </main>
  );
}
