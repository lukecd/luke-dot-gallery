import Image from "next/image";
import { projects } from "../content";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";
import { SceneArt } from "./SceneArt";

export function DflowDocsProject() {
  const project = projects.dflowDocs;
  return <section className="showcase-scene dflow-scene" aria-label={project.title}><ShowcaseCard category="TECH GUIDES" title={project.title} description={project.description}><ExternalLink {...project.link} /></ShowcaseCard><div className="visual-art-anchor"><a className="docs-visual" href={project.link.href} target="_blank" rel="noreferrer" aria-label="Open DFlow Docs"><Image src="/images/dflow-docs.webp" alt="DFlow documentation homepage" fill sizes="55vw" /></a><SceneArt scene="dflow" slot="visual" /></div></section>;
}
