import { PortfolioExperience } from "./components/PortfolioExperience";
import type { Metadata } from "next";
import { site } from "./lib/site";

export const metadata: Metadata = { alternates: { canonical: `${site.url}/` } };

export default function Home() {
  return <PortfolioExperience />;
}
