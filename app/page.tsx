"use client";

import { useEffect, useRef } from "react";
import LivingMachine from "./components/LivingMachine";

const signals = [
  { x: "64%", y: "18%", delay: "0s", size: "7px" },
  { x: "78%", y: "31%", delay: "1.1s", size: "4px" },
  { x: "58%", y: "48%", delay: "2.4s", size: "5px" },
  { x: "87%", y: "58%", delay: "3.2s", size: "4px" },
  { x: "69%", y: "76%", delay: "1.8s", size: "6px" },
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handlePointer = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--pointer-x", `${x * 18}px`);
      hero.style.setProperty("--pointer-y", `${y * 12}px`);
    };

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty("--page-progress", String(scrollable > 0 ? window.scrollY / scrollable : 0));
    };

    hero.addEventListener("pointermove", handlePointer);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      hero.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main>
      <div className="page-signal" aria-hidden="true"><i /></div>
      <section className="hero" ref={heroRef} id="top">
        <div className="hero-art" aria-hidden="true">
          <div className="hero-image" />
          <LivingMachine />
          <div className="hero-vignette" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          {signals.map((signal, index) => (
            <span
              className="signal"
              key={index}
              style={{
                left: signal.x,
                top: signal.y,
                animationDelay: signal.delay,
                width: signal.size,
                height: signal.size,
              }}
            />
          ))}
        </div>

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

      <section className="work" id="work">
        <div className="work-glow" aria-hidden="true" />
        <div className="shell section-heading">
          <p className="eyebrow dark"><span>01</span> Selected work</p>
          <p className="section-intro">A quiet place for noticing what grows.</p>
        </div>

        <article className="sow-card shell">
          <div className="sow-copy">
            <span className="project-number">01</span>
            <p className="project-kind">Independent product · 2026</p>
            <h2>Sow</h2>
            <h3>A garden journal that listens.</h3>
            <p>
              An iPhone and iPad app that turns a short garden walk into a lasting memory—using voice,
              photographs, weather, and the rhythms of the natural world.
            </p>
            <div className="project-tags" aria-label="Project disciplines">
              <span>Product design</span>
              <span>iOS + iPadOS</span>
              <span>AI-assisted journaling</span>
            </div>
            <div className="project-actions">
              <a href="https://sow.garden" target="_blank" rel="noreferrer">Visit sow.garden ↗</a>
              <a href="#app-store" onClick={(event) => event.preventDefault()}>Download on the App Store ↗</a>
            </div>
          </div>

          <div className="sow-gallery" aria-label="Selected Sow app screens">
            <figure className="sow-image sow-image-clear">
              <img src="/images/sow/plants-and-walks.png" alt="Sow garden walks and plant memories across iPhone and iPad" />
            </figure>
          </div>
        </article>
      </section>

      <section className="ai-project project-section" id="ai-garden">
        <div className="shell project-section-grid">
          <div className="project-section-copy">
            <p className="eyebrow dark"><span>02</span> Creative AI · Shopify</p>
            <h2>AI Garden<br /><em>Designer</em></h2>
            <p>A tool for turning a conversation, a photograph, and a patch of earth into a garden you can imagine—and build.</p>
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

      <section className="devrel project-section" id="devrel">
        <div className="shell devrel-heading">
          <p className="eyebrow"><span>03</span> Developer relations</p>
          <h2>Helping developers<br /><em>get it—and build it.</em></h2>
          <p>
            Developer Relations is my full-time craft. I turn unfamiliar infrastructure into clear stories,
            useful documentation, and working examples—so developers can move from “what is this?” to shipping.
          </p>
        </div>
        <div className="shell feature-video">
          <div className="video-frame">
            <iframe
              src="https://www.youtube-nocookie.com/embed/9Y5rc8OC6yE?rel=0"
              title="Grok DAS in 5 minutes"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="video-copy">
            <p className="project-kind">Technical explainer</p>
            <h3>Grok DAS in five minutes.</h3>
            <p>
              A compact visual explanation of a complex data-availability system—designed to give developers
              the mental model they need before the details arrive.
            </p>
            <a href="https://www.youtube.com/watch?v=9Y5rc8OC6yE" target="_blank" rel="noreferrer">Watch on YouTube ↗</a>
          </div>
        </div>
      </section>

      <section className="docs project-section" id="docs">
        <div className="shell docs-grid">
          <div className="docs-copy">
            <p className="eyebrow"><span>04</span> Documentation systems</p>
            <h2>DFlow<br /><em>Docs</em></h2>
            <p>
              Documentation for a unified trading API on Solana: information architecture, conceptual guides,
              integration paths, examples, and reference material built to help developers find momentum quickly.
            </p>
            <a href="https://pond.dflow.net/" target="_blank" rel="noreferrer">Explore the docs ↗</a>
          </div>
          <a className="docs-window" href="https://pond.dflow.net/" target="_blank" rel="noreferrer" aria-label="Open the DFlow documentation">
            <div className="window-bar"><i /><i /><i /><span>pond.dflow.net</span></div>
            <div className="docs-interface">
              <aside><b>DFlow</b><span>Welcome</span><span>Get Started</span><span>Spot Trading</span><span>AI</span><span>APIs</span></aside>
              <div className="docs-content"><small>WELCOME TO DFLOW</small><h3>Build on DFlow.</h3><p>Integrate spot trading into your app with one unified API.</p><div className="code-lines"><i /><i /><i /><i /></div></div>
            </div>
          </a>
        </div>
      </section>

      <section className="creative-work project-section" id="creative-work">
        <div className="shell creative-heading">
          <p className="eyebrow dark"><span>05</span> Away from the keyboard</p>
          <h2>Music and moving images.</h2>
        </div>
        <div className="shell creative-grid">
          <article className="album-card">
            <img src="/images/travel-back-to-the-now.png" alt="Travel Back to the Now album cover" />
            <div><p className="project-kind">Album</p><h3>Travel Back to the Now</h3><p>Traditional Thai sounds, psychedelic noise, and dance-music grooves—made to quiet the mind and return the listener to the present.</p><div className="media-links"><a href="https://music.apple.com/us/album/travel-back-to-the-now-ep/1519280723" target="_blank" rel="noreferrer">Apple Music ↗</a><a href="https://open.spotify.com/artist/2t2qaObfUFyPorEkNyo0jt" target="_blank" rel="noreferrer">Spotify ↗</a></div></div>
          </article>
          <article className="film-card cheer-film">
            <div className="film-frame"><iframe src="https://www.youtube-nocookie.com/embed/F71UCJ-nd2U?rel=0" title="The Cheer Ambassadors" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
            <p className="project-kind">Documentary · Director</p><h3>The Cheer Ambassadors</h3><p>An award-winning underdog story about Thailand’s self-taught national cheerleading team, seen by festival audiences in more than ten countries.</p>
          </article>
          <article className="film-card lamont-film">
            <div className="film-frame"><iframe src="https://player.vimeo.com/video/160713735?h=354e808d5d" title="Lamont Design" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>
            <p className="project-kind">Brand film · Producer</p><h3>Lamont Design</h3><p>A portrait of a designer, his relationship with Thailand, and a contemporary table made through traditional Thai craftsmanship.</p>
          </article>
        </div>
      </section>

      <section className="contact" id="contact">
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
