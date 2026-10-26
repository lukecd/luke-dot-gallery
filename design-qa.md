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
