import { fraction, smoothstep } from "./scrollMotion";

/** Local contact-scene progress, 0–1. All phases reverse with scrolling. */
export function getLandingMotion(progress: number) {
  const descent = fraction(progress, .18, .84);
  const braking = smoothstep(fraction(progress, .6, .84));
  const cloudGrowth = smoothstep(fraction(progress, .58, .86));
  const cloudOpacity = smoothstep(fraction(progress, .58, .66))
    * (1 - smoothstep(fraction(progress, .86, 1)));

  return {
    // Ease out: the approach is brisk, then slows continuously to touchdown.
    rocketLand: 1 - (1 - descent) ** 3,
    // Switch on while still above the viewport; entry is movement, not a fade.
    rocketOpacity: progress >= .18 ? 1 : 0,
    exhaustOpacity: smoothstep(fraction(progress, .2, .28))
      * (1 - smoothstep(fraction(progress, .78, .84))),
    exhaustLength: .55 - braking * .47,
    smokeFrame: cloudOpacity === 0
      ? 0
      : Math.min(6, 1 + Math.floor(fraction(progress, .58, .82) * 6)),
    smokeOpacity: cloudOpacity,
    smokeScale: .65 + cloudGrowth * .47,
  };
}
