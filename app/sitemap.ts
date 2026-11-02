import type { MetadataRoute } from "next";
import { site } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Only canonical public pages. Filters and private API routes are not pages.
  return [{ url: `${site.url}/` }, { url: `${site.url}/books` }];
}
