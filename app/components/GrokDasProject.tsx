import { projects } from "../content";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";
import { SceneArt } from "./SceneArt";

export function GrokDasProject() {
  const project = projects.grokDas;
  return <section className="showcase-scene grok-scene" id="tech-guides" aria-label={project.title}><ShowcaseCard category="TECH GUIDES" title={project.title} description={project.description}><ExternalLink {...project.link} /></ShowcaseCard><div className="visual-art-anchor"><div className="tech-visual" aria-label="Technical guide collection"><iframe src="https://www.youtube-nocookie.com/embed/9Y5rc8OC6yE?rel=0" title="Grok DAS in five minutes" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen /></div><SceneArt scene="grok" slot="visual" /></div></section>;
}
