# Book discovery

Local implementation, November 2, 2026. No cloud resources provisioned or deployment performed.

- `/books?view=next` merges a checked-in catalog snapshot with reviewed series suggestions.
- Open Library author bibliographies identify candidates. Matching authors must have a known collection title in their bibliography. Owned work IDs, title/author pairs and ISBNs are excluded. English-language works only; common bundles and guides are excluded. Catalog metadata is imperfect, including duplicate works and publication years. This is discovery, not a definitive list of unread books or new releases.
- Reviewed series suggestions link to publisher/author evidence and use local covers. The scheduled job never guesses series order or downloads unreviewed covers.
- This is a public, read-only library. Visitors browse recommendations, search/filter, follow authors and open source links. There are no saved/hidden/read-status actions or browser-local preferences.

## Local refresh

`npm run books:discover -- --author "Andy Weir"` refreshes an author after adding a book. Omit `--author` for a rotating batch of 30. The command updates both the checked-in snapshot and ignored `.cache/books/discovery.json`. Local API refreshes write only the cache. Run `npm run books:test` after collection updates.

Run `npm run books:covers` after refreshing discoveries to download missing covers
for the new snapshot. It batches exact Open Library work IDs and saves local assets
under `public/assets/books/discovery/`. Downloads are resumable. Review unresolved
titles against publisher pages and record replacements in
`app/books/data/discovery-covers.json`, with provenance in
`design/books/discovery-cover-sources.json`. This separate work-ID map survives
catalog refreshes, including API snapshots that contain no cover paths. Existing
reviewed edition covers take precedence. All displayed images are local assets.

## Deployment setup (not activated)

`vercel.json` schedules `/api/books/refresh` daily at 22:00 UTC (05:00 Bangkok).
Configure a **private Vercel Blob store** with `BLOB_READ_WRITE_TOKEN` and a strong
`CRON_SECRET` in the deployment environment. Vercel sends `Authorization: Bearer
<CRON_SECRET>`. Never put either secret in client code, source control or a URL.
The route is disabled without the secret and refuses deployed writes without Blob.
One private JSON object (`books/discovery.json`) stores the current snapshot;
there is no database. The public read route exposes only book metadata and check dates.

A daily run checks up to 30 authors, prioritizing those least recently attempted,
with a 210-second work budget and 12-second request timeout. A full catalog cycle
therefore takes multiple days. Failed lookups retain previous results. Storage
read failures abort a refresh rather than overwriting good data; public reads fall
back to the checked-in snapshot. Newly collected books are filtered at render time,
even before the next refresh. Scheduled tasks run only after deployment; no local
scheduler is installed. Review hosting limits and Blob costs before activation.

References: https://openlibrary.org/dev/docs/api/authors,
https://openlibrary.org/dev/docs/api/search,
https://vercel.com/docs/cron-jobs/manage-cron-jobs,
https://vercel.com/docs/vercel-blob/private-storage.

## Cover size policy — 2 November 2026

Discovery covers use local WebP files, bounded to 432 × 648 pixels without
upscaling. Downloads pass through `scripts/books/cover-image.ts`: quality 80,
then 70/60 only if needed to meet the 70 KiB ceiling. New sources must be at
least 210 pixels wide; blank scans are rejected. Cards declare their real
105px desktop / 70px mobile width to Next Image and load lazily.

`npm run books:optimize-covers` converts existing discovery covers and archives
originals under ignored `.cache/books/cover-originals`, outside the deployment.
`npm run books:test` checks local paths, dimensions, format and byte budgets.
Publisher/bookshop provenance is recorded in `discovery-cover-sources.json`.
Reviewed catalog exclusions persist across refreshes: namesakes, retail display
products and duplicate editions must not return as recommendations.

Current audit: 317 of 323 suggestions have covers; average 23.3 KB, maximum
69.3 KB. Higher-resolution editions replaced 19 small catalog thumbnails.
Two older Charles Silverstein titles (`Man to man`, `Family Matter`) retain
128px source images because larger verified editions were unavailable; those
are source limitations, not compression artifacts. Six missing images remain:
Texas Hill Country Loop (publisher image access denied), Brainy (no verified
usable cover), Burma and India (available preview is a title page or cropped
scan), Birdie and Beletta (ebook listing unavailable), Mary's prophet, and
The art of relaxation (no usable cover in the consulted catalogs). No books
were excluded solely for lacking a cover.

The per-file report is `audit-output/books/discovery-covers/image-budget.json`.
All original library covers were also measured: 355 stored files, 6.49 MB total,
18.3 KB average, 99 KB maximum. Lighthouse has not been run for this pass;
production performance will be measured after deployment as requested.
