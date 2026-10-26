import { projects, sowScreens } from "../content";
import { AppScreenGallery, type AppScreen } from "./AppScreenGallery";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";

const screens: AppScreen[] = sowScreens.map((screen, index) => ({
  ...screen,
  video: index === 0 ? "/assets/sow/today-botanical-ceremony-web.mp4" : undefined,
}));

export function SowProject() {
  const project = projects.sow;
  return (
    <section className="project-scene sow-scene" aria-label="Sow project">
      <div className="visual-art-anchor"><AppScreenGallery name="Sow" screens={screens} /></div>
      <ShowcaseCard category="APPS" title={project.title} subtitle={project.tagline} description={project.description}>
        <ExternalLink {...project.link} />
      </ShowcaseCard>
    </section>
  );
}
