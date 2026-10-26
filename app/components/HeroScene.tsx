import Image from "next/image";
import { HangarScene } from "./HangarScene";
import { MastheadHome } from "./MastheadHome";
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

export function HeroScene({ isActive }: { isActive: boolean }) {
  return (
    <>
      <HeroLayer src="/assets/hero/01-sky-base.png" className="sky" priority />
      <HeroLayer src="/assets/hero/02-planets-dots-only.png" className="stars" priority />
      <StarField />
      <header className="masthead"><MastheadHome /><span className="masthead-star" aria-hidden="true">✦</span></header>
      <SiteMenu />
      <HangarScene isActive={isActive} />
    </>
  );
}
