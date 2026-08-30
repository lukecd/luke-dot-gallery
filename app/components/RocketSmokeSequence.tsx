/**
 * A CSS background is intentional here: selecting one cell from a local sprite
 * sheet requires discrete background positioning, which `next/image` does not
 * provide without rendering multiple images.
 */
type RocketSmokeSequenceProps = {
  className?: string;
};

export function RocketSmokeSequence({ className = "" }: RocketSmokeSequenceProps) {
  return <div className={`rocket-smoke-sequence ${className}`.trim()} aria-hidden="true" />;
}
