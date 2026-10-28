import Image from "next/image";
import { projects } from "../content";
import { ShowcaseCard } from "./ShowcaseCard";

export function LazyDesignerProject() {
  const project = projects.lazyDesigner;
  return (
    <section className="project-scene lazy-scene" aria-label="Lazy Designer project">
      <div className="visual-art-anchor"><figure className="lazy-visual">
        <Image src="/assets/lazy-designer/lazy-designer-ui.png" alt="Lazy Designer completed garden screen showing the recommended plant list, garden rendering, and cart action" fill sizes="min(92vw, 64rem)" />
      </figure></div>
      <ShowcaseCard category="APPS" title={project.title} description={project.description}>
        <button className="showcase-link" type="button" disabled aria-label={project.link.disabledLabel}>{project.link.label}</button>
      </ShowcaseCard>
    </section>
  );
}
