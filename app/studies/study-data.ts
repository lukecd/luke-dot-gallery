export const PERSISTENT_STUDIES = [
  { slug: "portal", label: "Portal / aperture", kind: "Persistent hero system" },
  { slug: "spine", label: "Structural spine + rails", kind: "Persistent hero system" },
  { slug: "globe", label: "Glass globe assembly", kind: "Persistent hero system" },
  { slug: "botanical-orbits", label: "Botanical + orbital structure", kind: "Persistent hero system" },
] as const;

export const TRANSFORMATION_STUDIES = [
  { slug: "living-core", label: "Intricate living core", kind: "Transformation state" },
  { slug: "zinnia", label: "Zinnia", kind: "Transformation state" },
  { slug: "ai-garden", label: "Germinating AI Garden form", kind: "Transformation state" },
  { slug: "technical-cube", label: "Technical cube", kind: "Transformation state" },
  { slug: "dflow", label: "DFlow routing manifold", kind: "Transformation state" },
  { slug: "waveform", label: "Music / film waveform", kind: "Transformation state" },
] as const;

export const STUDIES = [...PERSISTENT_STUDIES, ...TRANSFORMATION_STUDIES] as const;

export type StudySlug = (typeof STUDIES)[number]["slug"];
export type TransformationSlug = (typeof TRANSFORMATION_STUDIES)[number]["slug"];

export const isStudySlug = (value: string): value is StudySlug =>
  STUDIES.some((study) => study.slug === value);
