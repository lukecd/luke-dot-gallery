export const sowScreens = [
  { label: "Morning", src: "/assets/sow/today-botanical-ceremony-poster.webp", alt: "Sow Today screen showing a morning garden journal" },
  { label: "Walks", src: "/assets/sow/website-walks-archive-landscape.webp", alt: "Sow Walks archive showing a June garden entry with red lettuce" },
  { label: "Plants", src: "/assets/sow/website-plants-landscape.webp", alt: "Sow plant history showing Burgundy Okra photos and captions" },
  { label: "Memory", src: "/assets/sow/website-zinnia-memory-landscape.webp", alt: "Sow Orange Zinnia memory with a photo, garden observation, location, and date" },
] as const;

export const projects = {
  sow: {
    title: "Sow",
    tagline: "A voice-first garden journal for iPhone and iPad.",
    description: "Speak your daily observations. Sow turns what’s blooming, growing, and needing care into a garden journal you can return to.",
    link: { label: "EXPLORE THE APP ↗", href: "https://www.sow.garden/" },
  },
  relaxationStation: {
    title: "Relaxation Station",
    description: "Animated landscapes and generative music for a little time with nothing to achieve. A relaxation app for iPhone and iPad, now inviting beta testers.",
    link: { label: "EXPLORE THE APP ↗", href: "https://www.relaxation-station.xyz/" },
  },
  lazyDesigner: {
    title: "Lazy Designer",
    description: "A Shopify app that turns a photo of your space into a garden plan, using plants suited to your climate and available in the store.",
    link: { label: "EXPLORE THE APP ↗", disabledLabel: "Explore the app, Lazy Designer coming soon" },
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
