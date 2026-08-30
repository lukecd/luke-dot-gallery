export const sowScreens = [
  { label: "Morning", alt: "Sow Today screen showing a morning garden journal" },
  { label: "Walks", alt: "Sow Walks archive showing garden entries" },
  { label: "Plants", alt: "Sow plant memories screen" },
  { label: "Memory", alt: "Sow field note showing an Orange Zinnia" },
] as const;

export const projects = {
  sow: {
    title: "Sow",
    tagline: "A voice-first garden journal for iPhone and iPad.",
    description: "Tell Sow about your garden every morning. Share what bloomed, what’s growing, what needs work, and what you’re excited about. Sow turns those small observations into a structured garden journal you can return to anytime.",
    link: { label: "VISIT SOW.GARDEN ↗", href: "https://www.sow.garden/" },
  },
  lazyDesigner: {
    title: "Lazy Designer",
    tagline: "A custom Shopify app for an online garden store.",
    paragraphs: [
      "A customer uploads a photo of their space, then the app creates a garden designed to flourish in their USDA growing zone while reflecting their aesthetic preferences.",
      "The challenge was building visually interesting gardens using only plants from the store’s live, in-stock catalogue.",
      "The result is a garden plan that feels personal, practical, and ready to buy.",
    ],
    link: { label: "VISIT LAZY DESIGNER ↗", disabledLabel: "Visit Lazy Designer, coming soon" },
  },
  grokDas: {
    title: "Grok DAS in five minutes.",
    kind: "Technical explainer",
    description: "A five-minute explanation of Celestia's Data Availability Sampling, giving people everything they need to understand the complex topic quickly.",
    link: { label: "WATCH ON YOUTUBE ↗", href: "https://www.youtube.com/watch?v=9Y5rc8OC6yE" },
  },
  dflowDocs: {
    title: "DFlow Docs",
    kind: "Documentation systems",
    description: "Docs for DFlow's Solana trading API: concepts, concept, code recipes, troubleshooting, and API reference.",
    link: { label: "EXPLORE THE DOCS ↗", href: "https://pond.dflow.net/" },
  },
  travelBackToTheNow: {
    title: "Travel Back to the Now",
    kind: "Album",
    description: "Traditional Thai sounds, psychedelic noise, and dance music grooves, made to quiet the mind and return the listener to the present.",
    links: [
      { label: "APPLE MUSIC ↗", href: "https://music.apple.com/us/album/travel-back-to-the-now-ep/1519280723" },
      { label: "SPOTIFY ↗", href: "https://open.spotify.com/artist/2t2qaObfUFyPorEkNyo0jt" },
    ],
  },
  cheerAmbassadors: {
    title: "The Cheer Ambassadors",
    kind: "Documentary · Director",
    description: "An award-winning underdog story about Thailand’s self-taught national cheerleading team, seen by festival audiences in more than ten countries.",
    link: { label: "WATCH ON YOUTUBE ↗", href: "https://www.youtube.com/watch?v=F71UCJ-nd2U" },
  },
  lamontDesign: {
    title: "Lamont Design",
    kind: "Brand film · Producer",
    description: "A portrait of a designer, his relationship with Thailand, and a contemporary table made through traditional Thai craftsmanship.",
    link: { label: "WATCH ON VIMEO ↗", href: "https://vimeo.com/160713735" },
  },
} as const;
