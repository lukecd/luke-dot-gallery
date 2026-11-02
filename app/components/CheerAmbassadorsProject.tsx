import { projects } from "../content";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";

export function CheerAmbassadorsProject({ showMedia }: { showMedia: boolean }) {
  const project = projects.cheerAmbassadors;
  return <section className="project-scene film-scene cheer-scene" id="cheer" aria-label={project.title}><ShowcaseCard category="FILMS" kind={project.kind} title={project.title} description={project.description}><ExternalLink {...project.link} /></ShowcaseCard>{showMedia && <div className="visual-art-anchor"><div className="film-visual"><iframe src="https://www.youtube-nocookie.com/embed/F71UCJ-nd2U?rel=0" title={project.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen /></div></div>}</section>;
}
