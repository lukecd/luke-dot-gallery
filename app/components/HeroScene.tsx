import Image from "next/image";
import { HeroCategoryNavigation } from "./HeroCategoryNavigation";
import { MastheadHome } from "./MastheadHome";
import { RocketSmokeSequence } from "./RocketSmokeSequence";
import { SiteMenu } from "./SiteMenu";

type HeroLayerProps = {
  src: string;
  className: string;
  priority?: boolean;
  sizes?: string;
};

function HeroLayer({ src, className, priority = false, sizes = "100vw" }: HeroLayerProps) {
  return <Image src={src} alt="" fill priority={priority} sizes={sizes} className={`layer ${className}`} />;
}

function StarField() {
  return <div className="star-field" aria-hidden="true">{[["17-star-west-large.png", "star star-west-large"], ["18-star-center-large.png", "star star-center-large"], ["19-star-east-large.png", "star star-east-large"], ["20-star-west-mid.png", "star star-west-mid"], ["21-star-east-small.png", "star star-east-small"]].map(([file, className]) => <HeroLayer key={file} src={`/assets/hero/${file}`} className={className} sizes="7vw" />)}</div>;
}

function OrbitalSystem() {
  return <div className="orbital-anchor" aria-hidden="true"><div className="orbital-content"><HeroLayer src="/assets/hero/04-rear-ring.png" className="rear-ring" sizes="(max-width: 600px) 40vw, 31vw" /><HeroLayer src="/assets/hero/03-planet.png" className="planet" sizes="(max-width: 600px) 25vw, 20vw" /><HeroLayer src="/assets/hero/05-front-ring.png" className="front-ring" sizes="(max-width: 600px) 40vw, 31vw" /></div></div>;
}

function Spaceport() {
  return <div className="spaceport-anchor" aria-hidden="true"><div className="spaceport-content"><HeroLayer src="/assets/hero/06-spaceport-city.png" className="city" sizes="90vw" /><HeroLayer src="/assets/hero/09-central-spaceport-detail.png" className="city-detail" sizes="90vw" /></div></div>;
}

function RocketLaunch() {
  return (
    <div className="rocket-anchor" aria-hidden="true">
      <RocketSmokeSequence />
      <HeroLayer
        src="/assets/hero/16-rocket-gantry-base.png"
        className="rocket-gantry"
        sizes="30vw"
      />
      <div className="rocket-flight">
        <HeroLayer src="/assets/hero/15-rocket-body.png" className="rocket-body" sizes="18vw" />
      </div>
    </div>
  );
}

function ForegroundFoliage() {
  return <div className="foliage-anchor" aria-hidden="true"><div className="foliage-content"><HeroLayer src="/assets/hero/10-left-foliage.png" className="foliage-left" sizes="65vw" /><HeroLayer src="/assets/hero/11-center-foliage.png" className="foliage-center" priority sizes="88vw" /><HeroLayer src="/assets/hero/12-right-foliage.png" className="foliage-right" sizes="70vw" /></div></div>;
}

export function HeroScene() {
  return <>
    <HeroLayer src="/assets/hero/01-sky-base.png" className="sky" priority />
    <HeroLayer src="/assets/hero/02-planets-dots-only.png" className="stars" priority />
    <StarField />
    <OrbitalSystem />
    <header className="masthead"><MastheadHome /><span className="masthead-star" aria-hidden="true">✦</span></header>
    <SiteMenu />
    <div className="foreground-stage"><Spaceport /><div className="title-anchor"><div className="title-content"><section className="title-zone"><HeroCategoryNavigation /><h1>LUKE</h1></section></div></div><RocketLaunch /><div className="dish-anchor" aria-hidden="true"><HeroLayer src="/assets/hero/08-observatory-dish.png" className="dish" sizes="22vw" /></div><ForegroundFoliage /></div>
    <p className="launch">SCROLL TO LAUNCH <span aria-hidden="true">↓</span></p>
  </>;
}
