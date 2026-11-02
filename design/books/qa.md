# Current revision: useful connections, 2026-11-01

See the final revision audit below. Earlier sections document the superseded design.

# Books — local implementation QA, 2026-11-01

final result: passed

## Visual truth and scope

Selected map reference: `/var/folders/29/j1w_brts76n9f_g76d2kxk380000gn/T/TemporaryItems/NSIRD_screencaptureui_2R3ZOz/Screenshot 2569-11-01 at 19.30.01.png`.
Source is a 520×373 captured concept, with an embedded desktop design rather than
an exact browser viewport. Implementation was inspected at 1440×1000 CSS pixels
and 390×844 mobile. Evidence is in `audit-output/books/`.

`comparison.jpg` places source and implementation in the same comparison input.
It scales both to fit separate columns, preserving aspect ratios; this is a
composition comparison, not a pixel-difference claim. Original full-resolution
captures were also inspected for labels, covers, and spacing. `final-overview.jpg`
shows the compact header and book grid above the fold.

Luke's later corrections supersede concept copy/layout details: all six original
Dune titles, reading dates unknown, no format/source segmentation, one collection,
and a substantially smaller header. Real downloaded covers replace generated
concept covers. Thematic suggestions shown in the concept remain future work;
only recorded series, authors, and purchase-day edges are currently drawn.

## Findings and corrections

- P1: Oversized introduction and redundant explanatory sections hid books below
  the fold. Replaced with compact title, one toolbar, and short result count.
  Main collection starts around 220px on desktop. Removed the memory tab and
  format filter. The six originals now appear in the same searchable list.
- P2: Mobile background was stretched and the introductory text joined without
  a space. Background now preserves its aspect ratio; that introduction was
  subsequently removed in the compact redesign.
- P2: Dune branches had a visual gap and six covers wrapped 5+1. Branches now
  share a connected central junction; originals use a balanced 3×2 group.
- P2: The central detail link lacked contrast on the rust sun. Changed to navy.
- P1: Following a related title outside a search filter could retain the old
  focus. It now clears restrictive filters and follows the selected title;
  Back restores the earlier search and focus.

No actionable P0/P1/P2 findings remain for this local first version.

## Required fidelity surfaces

- Typography: existing Barlow Condensed and DM Mono retained. Condensed central
  title, small supporting labels, no clipped controls at tested widths.
- Spacing: compact shared header; books above fold; centered diagram and labeled
  branches, with a vertical mobile arrangement. No horizontal page overflow.
- Colors: warm ivory, ink navy, rust and muted teal match the selected direction.
  Focus rings remain visible. Background art is quieter on mobile for contrast.
- Imagery: local ImageGen paper/desert asset, actual local Open Library covers,
  no shelves or fabricated publisher art. Some catalog covers are absent or
  represent different editions; these remain explicit data-review limitations.
- Copy: first-person headline, plain status labels. Publication years appear in
  Dune details; purchase dates remain labeled purchases. Unknown dates stay null.

## Three consecutive final clean browser passes

All final passes followed the last interaction/contrast correction, with no code
changes between them. Tested in the in-app browser, using a separate background
QA tab so Luke could continue using his preview.

1. Desktop: reload the Pines search; inspect author and series branches; follow
   Upgrade outside the filtered result; Back restores Pines and its search.
   Screenshot: `pass-1-desktop.jpg`.
2. Mobile: unified Dune search; title sort survives reload; inspect all eight
   titles together; open Dune, Back closes, Forward reopens, Escape closes;
   confirm unknown reading date and distinct 1965 publication year; no overflow.
   Screenshot: `pass-2-mobile.jpg`.
3. Desktop: direct URL opens Dune details; Close stays in the collection; switch
   to Connections, follow a prequel, Back restores Dune; inspect full map.
   Screenshot: `pass-3-desktop.jpg`.

Also checked search-edit history coalescing, reading-status filtering, and the
final default overview. Final-pass console inspection showed no new errors.
An earlier development-only HMR error occurred during the component rewrite;
it did not recur after reload or during the final passes. Viewport override was
reset and the temporary QA tab closed; Luke's preview remains open.

## Code and data validation

- `npm run lint`: passed.
- `npm test`: production build and TypeScript passed; `/books` statically rendered.
- Eight focused Node tests: passed (safe fields, cover paths, search, dates,
  relationships, confirmed Dune titles, URL round trips and invalid values).
- `git diff --check`: passed.
- 319 purchased works plus six original Dune titles, 325 total displayed books.
- Purchase export stays outside the repo; only sanitized fields are included.
- No new dependencies, backend database, push, deployment, or homepage link.

## Remaining limits / P3 follow-up

Catalog matching is incomplete: 300/319 purchase works identified, 287 covers,
plus six Dune covers. Some covers are title pages or unusual editions. Reading
status is unknown for purchases Luke has not confirmed. Status is static data;
there is no browser editor or backend write path. No new-release monitoring or
semantic theme recommendations are claimed. Reduced motion is supported in CSS
but OS preference emulation was not separately exercised in these passes.

Capture dimensions: pass 1 desktop 1425×990, pass 2 mobile full page 390×1976,
pass 3 desktop full page 1440×1405, final overview 1425×990. The small desktop
viewport-capture difference is the browser's captured content area/scrollbar;
no density-based exact-pixel match is asserted. Combined evidence is 1440×760.


## Final revision audit — larger covers and explained connections

Final result: passed, local only. Luke's latest direction supersedes the earlier
read-status labels and decorative map. The layout now anchors the selected book
with a large cover and connects to other books through labeled subject, author,
series and Dune-universe relationships. No selected book appears as its own link.

Corrections found during this revision:
- P1: Tiny covers and self-only series branches made the old map meaningless.
  Selected covers are 290px high on desktop, related covers 210px; every link
  has a reason and can be followed. Mobile uses a two-column cover layout.
- P1: Sparse metadata left 2001 with no useful links. Reviewed its canonical
  catalog work, recovered full subjects, and corrected translated-book matches.
- P1: 32 missing covers. Downloaded exact-identifier Amazon images, inspected a
  contact sheet of all 32, and verified the Murakami examples in the browser.
  All 325 collection entries now have local cover files.
- P2: Following a lower-page cover retained the scroll position. Explicitly
  following a book now returns to the top. Large covers load eagerly.
- P2: Broad matching categorized a novel's businessmen as business/economics.
  Restricted that topic to whole catalog terms and added a regression test.
- Read-status UI removed at Luke's request. Purchase dates still mean purchases;
  original Dune reading dates remain unknown and publication years separate.

Three consecutive clean independent browser passes after the last UI/data-logic
change, each beginning from a reload or fresh direct navigation:
1. Desktop 1440×1000: 2001 → Space travel → Caliban's War; Back restores filter
   and selected book; Forward restores Caliban; details and Escape work. All
   visible covers render and connection reasons are legible.
2. Mobile 390×844: 1Q84 → Same author → After Dark; Back/Forward preserve both
   books and filter; details has no status label. Five Murakami covers render,
   no horizontal overflow, no clipped titles or controls.
3. Desktop 1440×1000: Dune, Same series sorted Messiah through Chapterhouse;
   details shows Read: Date unknown and Published: 1965; universe filter follows
   a prequel and preserves Luke's reaction; Back restores the filter; Show more
   expands six to twelve related books. No browser console errors.

Screenshots: `audit-output/books/connections-revision/pass-1-desktop.jpg`,
`pass-2-mobile.jpg`, `pass-3-desktop.jpg`. The earlier passes were restarted after
fixing scroll behavior and subject matching. Viewport reset after verification.

Validation: ESLint, 12 focused Node tests, production build/typecheck, and diff
whitespace check pass. A sandboxed font-fetch build stalled; the normal build
with network access for the existing Google Fonts completed successfully.

Limit: subject links inherit catalog quality and are not semantic plot analysis.
Broad labels can connect fiction and nonfiction about the same subject. No new
release monitoring or completeness claim for an author's bibliography. Nothing
pushed, deployed, or linked from the portfolio.


## Direct navigation and author links — subsequent revision

Implemented: book clicks open Connections; no details dialog, cover disclaimer,
or provenance panel. Selected book shows the earliest purchase date, preorder
label where applicable, or Unknown. Every displayed author name links to an exact
author filter, including separate coauthors. Native link modifiers work; regular
clicks use the existing client history. Legacy `book=` URLs open Connections.

Three clean checks after these changes:
1. Desktop: legacy 2001 URL, Arthur C. Clarke author list, direct book click,
   Back/Forward; related Orson Scott Card link returns all five collection books.
2. Mobile 390×844: Haruki Murakami list has six books; After Dark opens directly,
   purchase date shown, author returns to list; Back/Forward and title sort work.
   No horizontal overflow; author names, covers and dates visibly inspected.
3. Desktop: Kevin J. Anderson via keyboard activation, Brian Herbert from a
   timeline card, direct The Machine Crusade click, history restoration, Dune's
   unknown purchase date, and Frank Herbert's six originals. No console errors.

Evidence: `audit-output/books/direct-navigation/pass-{1,2,3}-*.jpg` and
`final-connections.jpg`. The exact-text locator for Unknown did not match its
combined paragraph; DOM and screenshot confirmed the correct visible label.

## Frequency metadata correction — latest revision

Missing Open Library subjects caused a false impression of no connections.
Added reviewed, source-backed genre/subjects and series metadata, retaining
source URLs in JSON. Empty copy now states when subjects have not been added.
Three additional clean browser checks after the correction:
1. Desktop: Frequency shows six covers and 97 links; Alien contact → 2001;
   Back restores Frequency and filter.
2. Mobile: Space travel filter, no overflow, visible purchase date, author link
   to Joshua T. Calvert's one collection entry; Back restores the subject filter.
3. Desktop: legacy Frequency link, Raving's missing-subject message, Back restores
   Frequency and six connections. No console errors. Viewport reset afterward.
Evidence: `frequency-pass-{1,2,3}.jpg` in the same directory.

ESLint, 14 Node tests, production build/typecheck and diff whitespace check pass.
33 other purchased records still lack subjects; this is recorded as an enrichment
gap, not a claim that those books lack thematic connections. No full-summary or
full-text analysis has been performed. Nothing pushed or deployed.

## Header home link — latest navigation refinement

BOOKS in LUKE / BOOKS now links to `/books`, resetting view, author, search, year,
order and connection filter. LUKE still links to the portfolio. Three clean
checks: desktop from Livesuit's author connections with Back; mobile from a
Murakami author/title-sort list with Back; desktop keyboard activation from a
Dune search, Back and Forward. Each returned all 325 entries at `/books`.
No overflow or console errors. Evidence: `direct-navigation/header-home.jpg`.
Lint and production build passed after this change; viewport restored.

## Kindle cover correction — The Long Winter

The purchase records for Winter World (2021-03-06), The Solar War (2021-04-11),
and The Lost Colony (2021-04-28) all say Kindle. Open Library work-level covers
had incorrectly supplied Recorded Books audiobook artwork. Downloaded and visually
inspected the three exact-ASIN Amazon covers, stored them locally, and persisted
cover/source overrides so enrichment retains the correction.

Three clean browser checks: desktop Solar War → Winter World → Back; fresh mobile
reload → Lost Colony with purchase date; fresh desktop author list → Solar War,
all three images loaded and visibly correct. Evidence: `kindle-cover-correction.jpg`.
14 data tests and production build passed. No TS/React/CSS changes in this pass,
so lint was not repeated. Nothing pushed. Seven requested exclusions remain in
place, leaving 318 collection entries.

## Purchase dates on every book

A shared PurchaseDate component now renders the earliest recorded purchase on
collection cards, author-filtered cards, connection cards, and the focused book.
Missing records display “Purchase date: unknown”; preorder records retain their
explicit preorder label. No reading or publication dates are substituted.

Three consecutive clean browser checks:
1. Desktop Dirty Life connections: six related dates visible; follow At Home in
   Asia, confirm its date, and Back restores the original connections.
2. Mobile 390×844 Dune series: selected book and all five related cards show
   unknown dates; follow Dune Messiah and Back restores Dune and the filter.
3. Fresh desktop Frank Herbert collection: all six unknown dates visible;
   open Dune and Back restores the author collection. No console errors.

Evidence: `audit-output/books/purchase-dates/{desktop,mobile,author}.jpg`.
Lint, all 14 data/navigation tests, production build and diff whitespace check
passed. Viewport restored; temporary QA tab closed. Nothing pushed or deployed.

## Broader LGBTQ themes and complete Tales of the City

Renamed the umbrella topic to LGBTQ themes; old LGBTQ lives URLs still select it.
Added missing terminology (including bisexual, intersex and same-sex subjects)
and 13 reviewed subject corrections. Source URLs and brief evidence are retained
in lgbtq-subject-review.json and catalog-overrides.json. Memoirs and fiction share
the umbrella topic; only memoir/biography records get that separate genre tag.
38 books now match, including the seven newly added Tales of the City books.
This is a targeted metadata review, not an exhaustive full-text analysis.

Tales of the City has all ten titles in bibliography order. Existing Kindle
purchases for volumes 7, 8 and 9 retain their February 2014 dates. Added volumes
1–6 and 10 with unknown purchase/reading dates; recollection and print format
are retained in reading-notes.json. Removed narrator Kate Mulgrew from Anna
Madrigal's author field. Enrichment now applies reviewed series-order overrides
after automatic rules, and respects each remembered book's actual series.

Initial asset inspection rejected translated work-level covers; selected English
print-edition covers instead. Mobile QA then found the Richard Hunt biography's
cover wrongly depicting Selvadurai's same-title novel. Replaced it with its exact
ASIN cover and retained the full biography title to distinguish the two works.
Restarted the clean-check count after this correction:
1. Fresh mobile 390×844 RuPaul legacy-topic URL: corrected biography cover,
   known dates, broad-topic links, follow How To Burn A Rainbow and Back.
2. Fresh desktop Tales series: expand all nine related titles, confirm order,
   English covers, three known dates and unknown dates; follow Mona and Back.
3. Fresh desktop Emperor topic: gay fiction connects to fantasy and Tales titles,
   no memoir classification; follow Tales and Back restores the topic filter.
No console errors. Viewport reset and QA tab closed.

Evidence: audit-output/books/lgbtq-tales/{themes-mobile,series-desktop,fiction-desktop}.jpg.
Lint, all 16 tests, final production build and whitespace checks passed.
325 total collection entries. Nothing pushed or deployed.

## 2026-11-02 — Portfolio / Library and discovery

- Added shared navigation and a library invitation below the contact form.
- Added What’s next with reviewed series continuations, rotating Open Library author discoveries, browser-local save/hide/undo, and URL-backed filters.
- Added authenticated refresh route, daily Vercel cron configuration, private JSON Blob storage adapter and local snapshot refresh command. Cloud configuration remains inactive; nothing deployed or pushed.
- Lint, 22 book tests, TypeScript and final production build passed. Local read API returned 200; refresh without configuration returned 503 without running a refresh.
- Three consecutive clean browser passes after the series-order correction:
  1. Desktop: series order, all four local covers, save/filter, reload persistence, browser Back.
  2. 390px mobile: readable controls/cards without horizontal overflow, Already read → Hidden → Undo, shared navigation, contact invitation and its destination.
  3. Fresh desktop tab: contact ending composition, invitation → library → discoveries → author collection, Back/Forward state restoration, no console errors.
- Evidence: `audit-output/books/discovery/` (desktop, mobile, portfolio mobile/desktop, final desktop).
- Live Vercel cron and Blob integration cannot be exercised before deployment credentials/resources exist. Fallback and upstream-failure behavior are covered locally; source metadata remains subject to catalog errors.

## 2026-11-02 — Public discovery, no reading-manager controls

Removed Save for later, Already read, Not interested, Undo, Saved/Hidden filters,
all preference state/localStorage access, and unused action styles. Legacy saved
and hidden URL filters fall back to All discoveries. Public browsing, author
links, source links and search remain. Updated project guidance to preserve this
public presentation model.

Lint, 22 tests and production build passed. Three clean scoped browser checks:
1. Desktop series cards have no management actions; author navigation and Back work.
2. 390px mobile cards have no management actions; author/series filters work.
3. Fresh legacy Saved/Hidden URLs fall back to All discoveries; search works and
   removed control count is zero. Viewport restored; test tab closed.
Evidence: audit-output/books/public-discovery/desktop.jpg and mobile.jpg.
The prior accessibility audit's card-removal focus issue is eliminated by removing
that interaction; typography/contrast recommendations remain pending.

## 2026-11-02 — Personal introductions

Replaced the discovery slogan with a first-person explanation of finding the next
book and sharing the suggestions. Added first-person introductions to Books and
Connections, grounded in Luke’s stated reasons for making the library. Shared
LibraryIntroduction component keeps the paragraphs at 16px/1.65 on desktop and
mobile. Other typography remains outside this copy change.

Lint and production build passed. Three clean browser passes: desktop navigation
through all three introductions; 390px mobile review of all three views; fresh
desktop reload and Back/Forward verification. Confirmed computed 16px font and
26.4px line height. Evidence in audit-output/books/personal-copy/. Nothing pushed.

## 2026-11-02 — Consistent openings and cover repair

Moved each view's introduction into BooksHeader above search; removed duplicate
paragraphs from the Connections and discovery sections. Rewrote the introductions
to explain the content and browsing rather than narrating imagined feelings.
Serif introductions use a rust rule, 20px/26px desktop and 19px/24.7px mobile.

Checked all 325 collection cover files for decoding, dimensions and blank-image
statistics. Replaced the blank Linguistic Diversity and National Unity cover with
its University of Chicago Press image and the sideways Wayward thumbnail with
its Pan Macmillan image. Saved source links and persistent catalog overrides.
Final file check: 325 covers, no missing, blank or undersized images detected.

Lint, production build and diff whitespace check passed. The first sandboxed
build stalled and held a build lock; stopped that process and reran successfully
with local process permissions. Three consecutive clean browser passes after the
final copy/style/assets changes:
1. 390px mobile: all three introductions, tab navigation, Wayward focus cover,
   computed 19px/24.7px type and no horizontal overflow.
2. Desktop: all introductions, restored publisher cover for Linguistic Diversity,
   Books navigation and browser Back restoring Connections and its introduction.
3. Fresh 768px tablet reload: all three views, LGBTQ filter and Show more
   connections; all 13 rendered covers loaded, no horizontal overflow.

Evidence: audit-output/books/opening/. Viewport reset and test tab closed.
LGBTQ metadata unchanged. Nothing pushed or deployed.

## 2026-11-02 — Connections navigation recovery

Added a persistent Back to all books link above Connections, a clearly bordered
44px Choose another book select, and a NoConnections component with a Browse all
books action. Empty connections no longer show the zero-count filter or invite
visitors to follow nonexistent cover links. Empty searches also offer Browse all
books. All collection-return links reset URL filters through existing navigation;
native browser Back restores the previous connection state.

Lint, production build and whitespace checks passed. Three clean browser passes:
1. Desktop: exact reported book, empty-state action to /books, browser Back,
   dropdown selection of Dune and populated connection cards.
2. 390px mobile: visible return link and selector, empty-state layout, keyboard
   Enter on Browse all books and Back restoration; no horizontal overflow.
3. Fresh desktop reload: zero-result search recovery clears all filters and returns
   all 325 books; persistent Back to all books link also returns to /books.
Evidence: audit-output/books/navigation-recovery/desktop.jpg and mobile.jpg.
Viewport restored and QA tab closed. Existing-tab binding returned an unavailable
API error; checks used a fresh tab in the same in-app browser. Nothing pushed.
