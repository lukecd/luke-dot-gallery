export const fraction = (value: number, start: number, end: number) =>
  Math.min(Math.max((value - start) / (end - start), 0), 1);

export const smoothstep = (value: number) => value * value * (3 - 2 * value);
