import { projects } from "../content";
import { AppScreenGallery, type AppScreen } from "./AppScreenGallery";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";

const screens: AppScreen[] = [
  { label: "Website", src: "/assets/relaxation-station/homepage.png", alt: "Relaxation Station homepage, with its paper landscape, resting cat, and iPhone app preview", frame: "website" },
  { label: "Stories", src: "/assets/relaxation-station/stories.webp", alt: "Relaxation Station on iPad, showing Autumn, Rain, and Space stories" },
  { label: "Autumn", src: "/assets/relaxation-station/autumn.webp", alt: "Relaxation Station’s Autumn landscape, with a maple tree above a lake and distant mountains" },
];

export function RelaxationStationProject() {
  const project = projects.relaxationStation;
  return (
    <section className="project-scene relaxation-scene" aria-label={project.title}>
      <div className="visual-art-anchor"><AppScreenGallery name="Relaxation Station" screens={screens} /></div>
      <ShowcaseCard category="APPS · IN BETA" title={project.title} description={project.description}>
        <ExternalLink {...project.link} />
      </ShowcaseCard>
    </section>
  );
}
