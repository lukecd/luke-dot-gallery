import Image from "next/image";
import { projects } from "../content";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";
import { SceneArt } from "./SceneArt";

export function MusicProject() {
  const project = projects.travelBackToTheNow;
  return <section className="showcase-scene music-scene" id="music" aria-label="Music"><ShowcaseCard category="MUSIC" title={project.title} description={project.description}><div className="showcase-links">{project.links.map((link) => <ExternalLink key={link.href} {...link} />)}</div></ShowcaseCard><div className="visual-art-anchor"><a className="album-visual" href={project.links[0].href} target="_blank" rel="noreferrer" aria-label="Listen to Travel Back to the Now on Apple Music"><Image src="/images/travel-back-to-the-now.png" alt="Travel Back to the Now album cover" fill sizes="55vw" /></a><SceneArt scene="music" slot="visual" /></div></section>;
}
