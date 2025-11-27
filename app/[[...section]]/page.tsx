import { notFound } from "next/navigation";
import PageSections from "../components/PageSections";
import { SectionSlug, sectionSlugs } from "../../lib/sections";

type PageParams = {
	section?: string[];
};

type PageProps = {
	params: Promise<PageParams> | PageParams;
};

const isValidSection = (value: string): value is SectionSlug => sectionSlugs.includes(value as SectionSlug);

export default async function Page({ params }: PageProps) {
	const resolvedParams = await params;
	const slugParam = resolvedParams.section?.[0];

	if (slugParam && !isValidSection(slugParam)) {
		notFound();
	}

	return <PageSections sectionSlug={(slugParam as SectionSlug) ?? null} />;
}

