import type { Metadata } from "next";
import { BooksExperience } from "./components/BooksExperience";
import { StructuredData } from "../components/StructuredData";
import { libraryMetadata, site } from "../lib/site";

export const metadata: Metadata = {
  title: libraryMetadata.title,
  description: libraryMetadata.description,
  alternates: { canonical: `${site.url}/books` },
  openGraph: { type: "website", siteName: site.name, title: libraryMetadata.title, description: libraryMetadata.description, url: `${site.url}/books`, images: [libraryMetadata.image] },
  twitter: { card: "summary_large_image", title: libraryMetadata.title, description: libraryMetadata.description, images: [libraryMetadata.image] },
};

export default async function BooksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const initialSearch = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") initialSearch.set(key, value);
    else if (value?.length) initialSearch.set(key, value[0]);
  }
  return <>
    <StructuredData data={{ "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${site.url}/books#page`, url: `${site.url}/books`, name: libraryMetadata.title, description: libraryMetadata.description, isPartOf: { "@id": `${site.url}/#website` }, author: { "@id": `${site.url}/#person` } }} />
    <BooksExperience initialSearch={initialSearch.toString()} />
  </>;
}
