import Image from "next/image";
import { projects } from "../content";
import { SceneArt } from "./SceneArt";

export function LazyDesignerProject() {
  const project = projects.lazyDesigner;

  return (
    <section className="lazy-scene" aria-label="Lazy Designer project">
      <div className="lazy-card"><h2>{project.title}</h2><p className="lazy-tagline">{project.tagline}</p>{project.paragraphs.map((paragraph) => <p className="lazy-description" key={paragraph}>{paragraph}</p>)}<button className="lazy-link" type="button" disabled aria-label={project.link.disabledLabel}>{project.link.label}</button><SceneArt scene="lazy" slot="card" /></div>
      <div className="visual-art-anchor"><figure className="lazy-visual">
        <Image src="/assets/lazy-designer/lazy-designer-ui.png" alt="Lazy Designer completed garden screen showing the recommended plant list, garden rendering, and cart action" fill sizes="55vw" priority />
      </figure><SceneArt scene="lazy" slot="visual" /></div>
    </section>
  );
}
