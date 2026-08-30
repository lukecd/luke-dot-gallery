import { projects } from "../content";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";
import { SceneArt } from "./SceneArt";

export function LamontDesignProject() {
  const project = projects.lamontDesign;
  return <section className="showcase-scene film-scene lamont-scene" aria-label={project.title}><ShowcaseCard category="FILMS" kind={project.kind} title={project.title} description={project.description}><ExternalLink {...project.link} /></ShowcaseCard><div className="visual-art-anchor"><div className="film-visual"><iframe src="https://player.vimeo.com/video/160713735?h=354e808d5d" title={project.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen /></div><SceneArt scene="lamont" slot="visual" /></div></section>;
}
