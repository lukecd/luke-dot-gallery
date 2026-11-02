# SEO and indexing — 2 November 2026

Implementation is prepared on `codex/site-seo-indexing`. Luke must review, merge, and promote the deployment. Nothing in this work submits URLs to search engines or changes the live site automatically.

## What changed

The site has two public destinations: the portfolio and the library. Both now have page-specific titles and descriptions, canonical URLs, social sharing metadata, and verified identity markup. The library's prepublication `noindex, nofollow` restriction is removed. `/sitemap.xml` lists only `/` and `/books`; `/robots.txt` allows public content and excludes API routes. No artificial modification dates are supplied.

The portfolio now includes all eight projects' headings, descriptions, and destination links in its initial HTML. Artwork and embedded players still mount near their scenes. Real fragment links replace JavaScript-only project buttons, and direct links, reloads, Back, and Forward restore the appropriate scene. A small stylesheet provides a readable text-and-links layout when JavaScript is disabled. Luke's full name appears under the large LUKE heading.

The library now renders the requested year, author, search, connection, or discovery view on the server. This replaces the initial loading message. Book cards, authors, and view tabs have real links; their interactive behavior remains available after hydration. Ordinary library query states canonicalize to `/books`, rather than creating hundreds of competing search entries. A dedicated local sharing image is 48 KB (1200 × 800 JPEG).

Author links have larger click targets. Small library labels and purchase dates were increased to 12px, with author text at 13px. Invisible launch exhaust waits until scrolling begins, and rocket image sizes match their rendered widths more closely. The existing hangar frame's responsive stretching is unchanged because correcting that requires a separate artwork/layout decision.

Related library corrections are included: Saltcrop's sourced subjects, and one shared “My first Amazon order” group for Atlas Shrugged and The Millennial Project. The original export dates remain intact.

## Analytics

Existing GA4 page views and portfolio `section_view` / `section_jump` events remain. New custom events are:

| Event | Purpose / parameters |
| --- | --- |
| `project_outbound` | Project CTA destination (`link_url`) |
| `generate_lead` | Confirmed successful contact API response (`method: contact_form`) |
| `contact_error` | Failed submission (`error_type: server` or `network`) |
| `library_view` | Books, Connections, or What's Next (`library_view`) |
| `library_book_select` | Open a book's connections (`book_id`) |
| `library_author_select` | Browse an author (`author_name`) |
| `library_connection_filter` | Select a connection topic (`relation`) |
| `library_discovery_filter` | Select discovery category (`discovery_filter`) |
| `library_search` | Finish a nonempty search (`library_view`, collection `result_count`) |
| `library_recommendation_outbound` | Open a recommendation's source (`book_id`, `link_url`) |

Custom events send neither contact form values nor raw search text. Tracking runs only in production on `luke.gallery`, so localhost and preview testing do not generate these events. No manual `page_view` events were added: GA enhanced measurement may already track history changes, and the account settings need inspection before changing that policy. Automatic GA page-location/search collection is separate from the custom-event privacy choices above.

## Verification

- `npm run lint`: pass.
- `npm test`: production build passes; homepage static, library server-rendered on demand.
- `npm run books:test`: all 25 tests pass.
- `npm run seo:test -- http://localhost:3001`: pass. Checks initial HTML, requested library state, project/book links, canonical URLs, metadata, schema, robots, sitemap, and a real 404.
- Analytics host guard, queued event delivery, and direct gtag delivery checked with a local mock. No real contact message was submitted.
- Three consecutive clean browser passes: desktop project anchors/reload/Back/Forward and library book/author links; mobile project menu, connection filtering/Back and discovery filters; fresh desktop contact/music links, search-to-connections/Back, and discovery reload.
- Script-free portfolio layout checked in a local fixture made from server HTML with scripts removed and the no-JavaScript stylesheet active. This verifies the fallback layout, not a browser-wide JavaScript preference change.
- No application console warnings/errors observed in the checked production flows.

Local production Lighthouse 13.5.0, one run per page/device:

| Page / device | Performance | Accessibility | Best practices | SEO | LCP |
| --- | ---: | ---: | ---: | ---: | ---: |
| Portfolio / mobile | 93 | 100 | 92 | 100 | 3.2s |
| Portfolio / desktop | 99 | 100 | 96 | 100 | 0.9s |
| Library / mobile | 93 | 100 | 100 | 100 | 3.2s |
| Library / desktop | 100 | 100 | 100 | 100 | 0.8s |

The earlier live library SEO score was 63 and accessibility was 96. These new numbers are local lab measurements, not live performance or field Core Web Vitals. Homepage best-practices warnings remain for the decorative frame/terrain aspect ratios and the mobile frame's stretched resolution. Lighthouse also reports potential JavaScript and render-blocking savings; those do not justify removing the site's interactive design without further measurement. Mobile LCP still deserves a live recheck after deployment.

Raw local reports and screenshots are in `audit-output/seo-2026-11-02/after/`. The original live audit is `audit-output/seo-2026-11-02/README.md`.

## Release and indexing checklist

1. **Review and deploy.** Luke merges the review branch and promotes the deployment. Review the two visible changes in particular: the full-name line and more readable library labels. Unrelated local Sow artwork changes were excluded from the branch.
2. **Verify the live build.** Run `npm run seo:test -- https://luke.gallery`. Check `/robots.txt`, `/sitemap.xml`, the library share image, and the two canonical tags. Confirm no deployment-level `X-Robots-Tag: noindex` remains on production. Keep preview deployments excluded from indexing.
3. **Open Google Search Console.** Use an existing property if available. Otherwise create a Domain property for `luke.gallery` and complete Google's DNS verification using the account's exact TXT record. DNS/account access is needed for this step; no verification record has been invented or installed.
4. **Submit the sitemap once.** Submit `https://luke.gallery/sitemap.xml` in Search Console. Confirm it can be fetched and contains the two canonical URLs. Filters and project fragments do not belong in this sitemap.
5. **Inspect both URLs.** Run a live URL Inspection for `https://luke.gallery/` and `https://luke.gallery/books`. Check crawl permission, indexing eligibility, rendered text, and canonical selection. Request indexing after the live checks pass. Submission requests discovery; it does not guarantee indexing or a deadline.
6. **Verify analytics in the account.** In GA Realtime/DebugView, visit each library view, select a book/author/topic, follow a recommendation, and send one deliberate real contact test if wanted. Confirm each action once. Mark `generate_lead` as a key event if contact enquiries are the desired conversion. Register only useful low-cardinality custom dimensions such as `library_view`, `relation`, and `discovery_filter`.
7. **Resolve page-view policy.** Inspect enhanced measurement's browser-history setting and site-search collection. Search uses history updates, so filters/typing may inflate page views. Decide whether to keep history tracking or replace it with deliberate virtual page views; do not run both. Review automatic URL/search-term collection separately from our custom events.
8. **Monitor after release.** Check Search Console indexing and sitemap reports over the following days/weeks, then impressions/clicks and Core Web Vitals when data exists. Use actual excluded-page reasons rather than repeated indexing requests. Re-run Lighthouse on the live URLs on mobile and desktop; investigate regressions before adding more features.

## What can wait

A two-page personal site does not need an SEO service, a new database, a book-review schema generator, or a sitemap entry for every filter. Individual project pages are worthwhile later if Luke wants substantial project stories people can find and share. Keep titles/descriptions accurate as the portfolio changes; add each genuinely new public page to the sitemap. Public profile links can be added to Person markup once the exact profiles are confirmed.

Search Console ownership, existing indexing coverage, search queries, backlinks, GA dashboard configuration, and real-user Core Web Vitals remain unverified because authenticated account access was not part of this session.

## Reference documentation

- [Google: lazy-loaded content and interaction](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading)
- [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google Analytics: SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)
- [Google Analytics: page-view configuration](https://developers.google.com/analytics/devguides/collection/ga4/views)
