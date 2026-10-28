import Image from "next/image";
import { HeroLaunchTitle } from "./HeroLaunchTitle";
import { RocketSmokeSequence } from "./RocketSmokeSequence";
import { RocketExhaust } from "./RocketExhaust";
import styles from "./HangarScene.module.css";

/** Each paper layer has its own anchor; the floor and rocket share a baseline. */
export function HangarScene({ isActive }: { isActive: boolean }) {
  return (
    <section className={styles.scene} inert={!isActive} aria-label="Ready for launch">
      <div className={styles.scenery} aria-hidden="true">
        <div className={styles.terrain}>
          <Image src="/assets/hero/hangar/terrain.png" alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.apron}>
          <Image src="/assets/hero/hangar/apron.png" alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.frame}>
          <Image src="/assets/hero/hangar/frame.png" alt="" fill priority sizes="100vw" />
        </div>
        <Image src="/assets/hero/17-star-west-large.png" alt="" width={300} height={300} className={styles.starWest} sizes="5vw" />
        <Image src="/assets/hero/19-star-east-large.png" alt="" width={300} height={300} className={styles.starEast} sizes="4vw" />
        <Image src="/assets/hero/20-star-west-mid.png" alt="" width={300} height={300} className={styles.starLow} sizes="3vw" />
      </div>
      <HeroLaunchTitle />
      <div className={styles.rocketAnchor} aria-hidden="true">
        <RocketExhaust />
        <RocketSmokeSequence className={styles.smoke} />
        <div className={styles.flight}>
          <Image src="/assets/hero/hangar/rocket.png" alt="" fill priority sizes="(max-width: 600px) 55vw, 30vh" />
        </div>
      </div>
    </section>
  );
}
