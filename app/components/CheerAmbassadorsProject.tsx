import { projects } from "../content";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";
import { SceneArt } from "./SceneArt";

export function CheerAmbassadorsProject() {
  const project = projects.cheerAmbassadors;
  return <section className="showcase-scene film-scene cheer-scene" id="films" aria-label={project.title}><ShowcaseCard category="FILMS" kind={project.kind} title={project.title} description={project.description}><ExternalLink {...project.link} /></ShowcaseCard><div className="visual-art-anchor"><div className="film-visual"><iframe src="https://www.youtube-nocookie.com/embed/F71UCJ-nd2U?rel=0" title={project.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen /></div><SceneArt scene="cheer" slot="visual" /></div></section>;
}
