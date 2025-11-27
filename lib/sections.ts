export const SECTION_LINKS = [
	{ slug: "me", label: "Me", selector: "#me" },
	{ slug: "dev-rel", label: "DevRel", selector: "#devrel" },
	{ slug: "music", label: "Electronic Music", selector: "#music" },
	{ slug: "tv-video", label: "TV / Video", selector: "#tv-video" },
	{ slug: "contact", label: "Contact", selector: "#contact" },
] as const;

export type SectionLink = (typeof SECTION_LINKS)[number];
export type SectionSlug = SectionLink["slug"];

export const slugToSelector = SECTION_LINKS.reduce<Record<SectionSlug, string>>((acc, link) => {
	acc[link.slug] = link.selector;
	return acc;
}, {} as Record<SectionSlug, string>);

export const sectionSlugs = SECTION_LINKS.map((link) => link.slug) as SectionSlug[];

