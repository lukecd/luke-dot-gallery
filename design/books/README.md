# Local book collection

Preview: `http://localhost:3000/books`.

Luke authorized publishing the library to `main` on 2 November 2026, after
reviewing the collection and its homepage links. The route retains
`noindex, nofollow`. Future publication still requires an explicit request.

## Data and provenance

- `app/books/data/library.json` is the sanitized, static collection imported by
  the books client. It is loaded only on the books route. No backend or runtime
  metadata service is used.
- `reading-notes.json` retains Luke's own reading memories separately from
  purchase evidence. Luke subsequently confirmed the six original Dune novels and their publication
  years. Each is recorded as read in paperback, with reading dates unknown. The prequel group records his dislike; the collection applies his report of reading
  the prequels to the two matching titles in his purchases. No completion dates
  are inferred.
- `open-library-cache.json` contains public bibliographic lookup results, not
  private Amazon transactions. `catalog-hints.json` contains search hints for
  ambiguous titles and contributor corrections. Hints alone never supply author
  facts: a matching catalog record is required. Entries marked `skip` deliberately
  reject an ambiguous match pending further identification.
- `public/assets/books/covers/` contains downloaded Open Library and exact-ASIN Amazon covers. Each
  book's source link identifies its catalog work. Artwork represents the work,
  not necessarily the exact purchased edition. The UI never hotlinks covers.
- Raw ZIPs, addresses, payment details, order IDs, prices and recipient data stay
  outside the project. The source ZIP is read in place and is not extracted here.

## Meaning of the views

- Timeline: first recorded purchase/preorder per canonical book. All retained
  purchase dates remain in the data, with the first shown on Connections; format stays in the data. Dates are not reading
  dates or publication dates. Oldest/newest sorting, purchase-year filtering,
  title sorting, and local title/author/series/subject
  search are supported.
- Connections: explicit series, catalog authors, and shared catalog subjects. The
  complete cached subject list is normalized by `app/books/connections.ts` into
  readable topics. Each related cover explains the match. These are deterministic
  subject links, not generated plot summaries or verified sequel announcements.
  Six connections appear initially, with a control to show more. Series filters
  preserve sequence order. Dune originals and Legends of Dune have an explicit
  universe link, preserving Luke's prequel reaction.
- One collection: all 325 entries are treated as read at Luke's explicit request.
  There are no reading-status controls, badges, or source/format segments. The
  underlying purchase and manually supplied provenance remains available.
- `catalog-overrides.json` preserves reviewed canonical matches, author names
  visible on purchased-edition covers, cover paths, and source URLs. Translated
  Murakami titles and Three-Body Problem required canonical-work corrections.
  All 319 purchased works and six original Dune novels now have local covers.

A few unknown authors remain visibly unresolved. Successful orders with an
inconsistent old fulfillment flag are retained as purchase evidence, not proof
of delivery/reading. Digital cancellations and matched completed digital returns
are excluded; a pending preorder remains labeled as a preorder. Two print-book
orders also appear in order-level refund data, but both contain multiple items
and neither is identified as a book return in Return Requests. We do not guess
that those individual books were refunded. Journals and other book-category
items are retained for Luke's review.

## Updating locally

From the project root (Node 24):

```sh
node --experimental-strip-types scripts/books/import-amazon.ts '/absolute/path/to/Your Orders.zip'
node --experimental-strip-types scripts/books/enrich.ts
node --experimental-strip-types scripts/books/repair-covers.ts
node --experimental-strip-types --test scripts/books/library.test.ts
npm run lint
npm test
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Import resets the generated catalog; enrichment reapplies cached metadata and
merges records sharing an Open Library work ID. Queries send titles/ISBNs and
disambiguating author names only. Luke specifically approved those lookups to
Open Library in this chat. Add `--retry-unmatched` when rerunning enrichment to
retry unresolved catalog matches. Requests are rate-limited per host.

To remove a book for the initial review, put its `workId` (preferred), `id`, or
Amazon identifier into `excluded-books.json`, then rerun enrichment. A work ID
excludes all merged acquisitions of that work. Memory IDs are supported too.
This prevents a later import/enrichment from silently restoring exclusions.
The standalone import stage only knows Amazon IDs; always complete enrichment
before considering its output ready for review. No browser edits are implied
to save to disk.

## Validation

See `qa.md` for the final browser checks and code validation. A normal connection
to the user's newly open localhost tab resolved the earlier connection-error-page
inspection issue; no browser safety restriction was bypassed.

Views, search, exact author, year/order, selected book and connection filter are encoded in
URL query parameters. Browser Back/Forward restore those states. A continuous
search edit creates one history entry; subsequent keystrokes replace that entry.
Book clicks open Connections directly. Author names throughout the grid and
connections are links to all collection entries with that author (including
coauthored works). Old `book=` detail URLs open the corresponding Connections
view. The detail panel has been removed. All state stays client-side.

The offline `scripts/books/apply-catalog-overrides.ts` replays complete cached
subjects and reviewed corrections without network access. `repair-covers.ts`
only requests public image URLs for identifiers; it never transmits purchase
history or customer information. All runtime images are served locally.


## Description-backed subject corrections

Open Library subject coverage is incomplete. Frequency (`b0h34hf1bq`) had no
subjects despite a verified cover and authors. Its exact Amazon product listing
and the publisher description/categories on Audible establish science fiction,
space exploration, first contact and thriller subjects. The reviewed override
stores those tags, Frequency series order 1, and source URLs. This is a manual
interpretation of the description/categories, not a full-text analysis.

Sources reviewed 2026-11-01:
- https://www.amazon.com/dp/B0H34HF1BQ
- https://www.audible.com/es_US/pd/Frequency-Audiolibro/B0H5B3RXT9

Frequency now has 97 total connections, including 80 science-fiction matches.
33 purchased records still have empty subjects. The UI distinguishes missing
subject data from a complete record with no shared connections. A broader
publisher-description enrichment pass has not been performed.

The BOOKS breadcrumb is the collection home link: it clears all view/filter state
and returns to `/books`. Browser Back restores the previous book or author list.
