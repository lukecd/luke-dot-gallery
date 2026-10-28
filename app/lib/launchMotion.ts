import { fraction, smoothstep } from "./scrollMotion";

/** Scroll-based and reversible: the cloud has its own exit after liftoff. */
export function getLaunchMotion(progress: number) {
  const ignition = fraction(progress, .22, .28);
  const cloudGrowth = smoothstep(fraction(progress, .28, .7));
  const cloudExit = smoothstep(fraction(progress, .7, .94));
  const lift = fraction(progress, .42, .72);

  return {
    smokeFrame: progress < .22 || progress >= .94
      ? 0
      : Math.min(6, 1 + Math.floor(fraction(progress, .28, .62) * 6)),
    smokeOpacity: smoothstep(ignition) * (1 - cloudExit),
    smokeScale: 1 + cloudGrowth * .55,
    smokeDrift: smoothstep(fraction(progress, .76, .94)) * -4,
    exhaustOpacity: smoothstep(fraction(progress, .42, .47)) * (1 - smoothstep(fraction(progress, .7, .9))),
    rocketLift: lift * -118,
    rocketOpacity: 1 - smoothstep(fraction(progress, .72, .84)),
    hangarOpacity: 1 - smoothstep(fraction(progress, .66, .86)),
  };
}
