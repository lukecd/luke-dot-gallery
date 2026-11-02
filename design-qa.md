# Hero redesign QA — 2026-10-26

final result: passed

## Visual truth and evidence

- Selected direction: third displayed concept, Launch Window; user approved a
  lighter frame, stronger rocket and reduced planet competition. Refined mock
  removes the planet, and was generated/displayed before implementation.
- Source: `audit-output/hangar-hero/selected-reference.png` (1586×992).
- Implementation: `http://localhost:3000/`, opening at scrollY 0.
- Desktop screenshot: `audit-output/hangar-hero/pass-1-desktop.png`.
- Full comparison: `audit-output/hangar-hero/comparison-desktop.png`, reference
  left / implementation right, both normalized to 793×496 and inspected together.
- Focused type/control comparison: `audit-output/hangar-hero/comparison-title.png`.
- Desktop CSS viewport: 1586×992. Browser capture returned a 1571×983 JPEG
  payload (saved with .png suffix); normalized for comparison. Capture output
  is browser-scaled, not a native 1:1 pixel diff.
- Compact CSS viewport: 900×620; capture 885×610.
- Phone CSS viewport: 390×667; capture 375×641.
- Final regular panel check: 946×1173, `final-preview.png`.

## Comparison history

1. First complete assembly: `iteration-1-desktop.png`. [P2] Frame feet too far
   forward; original rocket too slender for the selected composition; category
   type and action too small relative to reference. Corrected the frame's
   vertical anchors and apron depth, generated a broader hero-only rocket, and
   tuned existing Barlow Condensed / DM Mono typography. No bitmap stretching
   was used to broaden the rocket.
2. Desktop comparison after geometry corrections exposed a remaining [P2]
   category-height / action-size difference. Increased category vertical
   proportion and action text, keeping the original site fonts and live UI.
   Restarted the clean browser count after these final style changes.
3. Final side-by-side full-view and focused comparison: no actionable P0/P1/P2
   differences. Intentional differences: retained the site's real fonts, sky,
   header star and navigation; independent generated terrain is lower/simpler
   than the mock and the rocket uses the same established paper identity.

## Three consecutive clean checks

1. Desktop 1586×992: clean reload, all images loaded, centered title and grounded
   frame/rocket inspected. Clicked launch action; Sow visible, hangar opacity 0,
   progress rocket opacity 1. Masthead returned to opening.
   Evidence: `pass-1-desktop.png`, `pass-1-sow.png`.
2. Compact 900×620: clean reload, no title/rocket collision or clipped controls.
   Scrolled through ignition and liftoff: smoke stays on apron, title clears
   before rocket rises. At scrollY 280, lift -19svh and title opacity 0. Menu
   navigation to Lazy Designer shows progress rocket at 28.01vw; hangar gone.
   Evidence: `pass-2-compact.png`, `pass-2-ignition.png`,
   `pass-2-liftoff.png`, `pass-2-progress.png`.
3. Phone 390×667: clean reload, grounded frame and rocket, legible unclipped
   heading/action. Shift-Tab exposed visible launch focus ring; Enter launched
   into Sow. Masthead restored opening. No browser console errors captured.
   Evidence: `pass-3-phone.png`, `pass-3-focus.png`, `pass-3-sow.png`.

## Required fidelity surfaces

- Typography: real Barlow Condensed and DM Mono retained; hierarchy, category
  spacing, line height and action scale compared in focused image. No wrapping
  or truncation at inspected sizes.
- Spacing/layout: centered composition, calm sky, low terrain, visible floor;
  rocket and architectural feet share the apron. Short windows reserve a gap
  above the rocket. Mobile preserves the complete scene.
- Colors: original navy sky and cream/rust/teal palette retained. Paper layers
  have restrained contrast; planet and foliage removed from hero only.
- Image quality: independent ImageGen assets, verified real alpha on frame,
  terrain and rocket. No checkerboard pixels or visible halos in assembled
  views. Existing smoke sprite and traveling rocket reused.
- Copy/content: existing header, name, categories and launch wording retained.
  No invented claims. Launch action is now an accessible button, hidden hero
  controls become inert once a project is active.
- Behavior: smoke, lift, scene fade, launch click/keyboard, menu navigation,
  masthead return and horizontal progress rocket verified. No page overflow
  hiding controls at inspected sizes.

## Validation and limits

- `npm run lint`: passed after final changes.
- `npm test`: production build and TypeScript passed after final changes.
- `git diff --check`: passed.
- No new dependencies; no deployment or merge performed.
- Reduced-motion CSS disables the new title/lift transforms; OS preference was
  not emulated in these browser checks. Existing project/contact behavior was
  not exhaustively retested beyond the launch handoff and progress samples.

## Follow-up polish

No blocking findings. Any further changes should be art-direction refinements
based on Luke's review, not a new redesign of the project sections.

---

## Books collection — 2026-11-01

final result: passed

Detailed findings, comparison history, fidelity surfaces, scope changes, and
three consecutive clean desktop/mobile browser checks:
[design/books/qa.md](design/books/qa.md).

Source visual truth: Luke's `Screenshot 2569-11-01 at 19.30.01.png` (520×373).
Implementation: `audit-output/books/pass-3-desktop.jpg`, 1440px desktop viewport;
mobile: `audit-output/books/pass-2-mobile.jpg`, 390×844 CSS viewport.
Combined comparison: `audit-output/books/comparison.jpg` (aspect-ratio-preserving
composition comparison, not a pixel-identical claim). Full-resolution captures
were separately checked for readable labels and controls. The user's compact
header/unified-collection corrections supersede the reference's older framing.
Final overview: `audit-output/books/final-overview.jpg`.

No actionable P0/P1/P2 findings. Catalog gaps and remaining P3 cover refinements
are recorded in the detailed report. Lint, eight focused tests, production build,
and whitespace check passed. Nothing pushed or deployed.


## Books connections revision — 2026-11-01

Passed: read-status UI removed, large selected/related covers, explicit author,
series, Dune-universe and shared-subject links. All 325 entries have local covers
(32 recovered in this revision). Three consecutive clean desktop/mobile browser
passes cover filters, follow, Back/Forward, details, Dune dates and show-more.
Evidence and full limitations: `design/books/qa.md`, final revision audit;
`audit-output/books/connections-revision/`. Local only, no push or deployment.


## Books direct navigation and Frequency metadata — 2026-11-01

Removed details panel; book clicks open Connections, authors link to exact author
lists, purchase date appears beside the selected book. Three clean desktop/mobile
checks verified author/coauthor links and Back/Forward. Later, corrected Frequency
from its publisher description/categories and ran another three clean checks.
Evidence: `audit-output/books/direct-navigation/`; full audit: `design/books/qa.md`.
All code checks pass (14 Node tests, lint, production build). Subject enrichment
is still incomplete for 33 purchased records. Local only.

## Library discovery covers and image budget — 2026-11-02

- Connected downloaded local covers to catalog discoveries without losing them on refresh; reviewed editions still win. Corrected verified author-name collisions, retail displays and duplicate-edition recommendations through a persistent exclusion list.
- 317 / 323 visible discoveries have covers. Six source-image gaps and two remaining 128px source limitations are recorded in `audit-output/books/discovery-covers/image-budget.json` and `design/books/discovery.md`.
- WebP assets bounded to 432×648, no upscaling, 70 KiB maximum. Actual displayed-image average 23,275 bytes; maximum 69,242 bytes. Original downloads and unused replacements archived outside public. Card `sizes` matches 105px desktop and 70px mobile; lazy loading retained.
- Three consecutive clean final browser passes: (1) 1365px desktop reload of author discoveries, publisher covers visible, Show more increases cards from 12 to 24; (2) fresh 390px mobile page, series filter produces four loaded cover images at 70px and cards remain within viewport; (3) fresh 1280px page, Saturn search displays the replacement cover, author navigation opens collected books, browser Back restores the search and cover.
- Evidence: `audit-output/books/discovery-covers/desktop.jpg`, `mobile.jpg`, `search-and-back.jpg`.
- `npm run lint`, all 25 `npm run books:test` checks, and final `npm test` production build passed. Added byte/dimension/format checks, retained-cover tests, and exclusion persistence tests. Updated source allowlist for previously added verified publisher URLs.
- Lighthouse deferred to the requested post-deployment pass. Nothing pushed or deployed.

## Personal library introduction copy — 2026-11-02

- Used Luke's revised Books introduction, with a separate 16px footnote about Amazon purchases, remembered paperbacks and books lost to time or memory. The main introduction stays 20px desktop / 19px mobile with the existing rust rule.
- What's Next now reads: “I built this to help me find what to read next. Let me know if you recommend any of them.” Connections copy is unchanged.
- Three consecutive clean browser checks: desktop Books → What's Next at 1365px; fresh mobile Books → What's Next at 390px; fresh direct What's Next link → Books → browser Back at 1280px. Text wraps without clipping, the footnote appears only on Books, and Back restores the matching intro.
- Screenshots saved under `audit-output/books/personal-introductions/`. Lint, production build and diff whitespace check passed. No push or deployment.
