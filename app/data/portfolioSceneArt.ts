export type PortfolioSceneArt = {
  id: string;
  src: string;
  scene: "sow" | "lazy" | "grok" | "dflow" | "music" | "cheer" | "lamont";
  left: string;
  top: string;
  width: string;
  zIndex: number;
  slot: "scene" | "card" | "visual";
  placement?: "below-start" | "below-end";
  opacity?: string;
};

export const portfolioSceneArt: PortfolioSceneArt[] = [
  { id: "sow-eye-planet", src: "/assets/space-clip-art/sow-eye-planet-v3.png", scene: "sow", left: "35%", top: "11%", width: "17vw", zIndex: 7, slot: "scene" },
  { id: "sow-signal-seed", src: "/assets/space-clip-art/sow-signal-seed-v3.png", scene: "sow", left: "7%", top: "70%", width: "8vw", zIndex: 18, slot: "card", placement: "below-start" },
  { id: "lazy-ring-garden", src: "/assets/space-clip-art/lazy-ring-garden-planet-v3.png", scene: "lazy", left: "78%", top: "7%", width: "24vw", zIndex: 5, slot: "scene" },
  { id: "lazy-orbital-pruner", src: "/assets/space-clip-art/lazy-orbital-pruner-v2.png", scene: "lazy", left: "35%", top: "78%", width: "10vw", zIndex: 18, slot: "visual", placement: "below-start" },
  { id: "grok-mind-satellite", src: "/assets/space-clip-art/grok-mind-satellite-v1.png", scene: "grok", left: "78%", top: "8%", width: "20vw", zIndex: 7, slot: "scene" },
  { id: "grok-thought-orb", src: "/assets/space-clip-art/grok-orbiting-thought-v1.png", scene: "grok", left: "9%", top: "72%", width: "9vw", zIndex: 18, slot: "visual", placement: "below-start" },
  { id: "dflow-interchange", src: "/assets/space-clip-art/dflow-interchange-station-v1.png", scene: "dflow", left: "-5%", top: "7%", width: "30vw", zIndex: 5, slot: "scene" },
  { id: "dflow-cargo-comet", src: "/assets/space-clip-art/dflow-cargo-comet-v1.png", scene: "dflow", left: "80%", top: "74%", width: "16vw", zIndex: 18, slot: "visual", placement: "below-end" },
  { id: "music-aurora-saucer", src: "/assets/space-clip-art/music-aurora-saucer-v1.png", scene: "music", left: "5%", top: "65%", width: "18vw", zIndex: 8, slot: "scene" },
  { id: "music-resonance-orbs", src: "/assets/space-clip-art/music-resonance-orbs-v1.png", scene: "music", left: "40%", top: "42%", width: "10vw", zIndex: 18, slot: "visual", placement: "below-end" },
  { id: "cheer-bubble-cruiser", src: "/assets/space-clip-art/cheer-bubble-cruiser-v1.png", scene: "cheer", left: "-4%", top: "7%", width: "25vw", zIndex: 7, slot: "scene" },
  { id: "cheer-hello-satellite", src: "/assets/space-clip-art/cheer-hello-satellite-v1.png", scene: "cheer", left: "76%", top: "72%", width: "14vw", zIndex: 18, slot: "visual", placement: "below-end" },
  { id: "lamont-dawn-planet", src: "/assets/space-clip-art/lamont-dawn-planet-v1.png", scene: "lamont", left: "70%", top: "5%", width: "28vw", zIndex: 6, slot: "scene" },
  { id: "lamont-landing-beacon", src: "/assets/space-clip-art/lamont-landing-beacon-v1.png", scene: "lamont", left: "8%", top: "68%", width: "16vw", zIndex: 18, slot: "visual", placement: "below-start", opacity: "calc(var(--lamont-reveal) * var(--lamont-beacon-opacity))" },
];
