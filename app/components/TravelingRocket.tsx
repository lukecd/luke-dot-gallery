import Image from "next/image";

/**
 * The in-flight rocket that travels with the project sequence after it leaves
 * the launch gantry. Its position is derived from portfolio scroll progress.
 */
export function TravelingRocket() {
  return (
    <div className="traveling-rocket" aria-hidden="true">
      <Image
        src="/assets/hero/15-rocket-body.png"
        alt=""
        width={1024}
        height={1536}
        sizes="6vw"
        priority
      />
    </div>
  );
}
