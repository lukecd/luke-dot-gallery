import { projects } from "../content";
import { AppScreenGallery, type AppScreen } from "./AppScreenGallery";
import { ExternalLink } from "./ExternalLink";
import { ShowcaseCard } from "./ShowcaseCard";

const screens: AppScreen[] = [
  { label: "Splash", src: "/assets/relaxation-station/capture-27/splash.webp", alt: "Relaxation Station logo and ‘You’re allowed to do nothing’ above a mountain lake, with an orange cat resting on the shore" },
  { label: "Tide", src: "/assets/relaxation-station/capture-27/tide.webp", alt: "Tide: a heron flying over a quiet bay at sunset, with an orange cat on the sandy shore" },
  { label: "Rain", src: "/assets/relaxation-station/capture-27/rain.webp", alt: "Rain: a sheltered porch with wind chimes, a glowing lantern, and an orange cat overlooking a rainy mountain valley" },
  { label: "Autumn", src: "/assets/relaxation-station/capture-27/autumn.webp", alt: "Autumn: falling maple leaves above a path overlooking a forest, lake, and small village at sunset" },
  { label: "Space", src: "/assets/relaxation-station/capture-27/space.webp", alt: "Space: two astronauts and an orange cat resting beneath a colorful spiral in a star-filled sky" },
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
