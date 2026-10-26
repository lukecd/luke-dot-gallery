# Image Prompt Library

## Social preview concepts — 2026-10-26

Selected by Luke: option 2, Liftoff. Delivery export:
`public/assets/social/liftoff-card.jpg` (1200×630 JPEG). No creative changes;
only proportional downsampling and minimal center crop to the delivery ratio.

Displayed result order (authoritative for the user's next selection):
1. Name First — `exec-82f48b7c-13ad-48c8-8f29-a68ae46f0118.png`
2. Liftoff — `exec-a9429da5-974f-4ca6-afbe-dfb0a0b5421f.png`
3. Launch Window — `exec-8eb38487-72f4-452a-b157-e17c8ca9d39d.png`

All originals are retained in
`/Users/luke/.codex/generated_images/01a176b7-7a96-7832-bb5e-b84cf98c2b55/`.
Inspected all three: correct wording, recognizable paper rocket, coherent
brand palette, distinct compositions, no website controls. Preview only;
final export dimensions and metadata integration follow selection.

Three review-only Open Graph directions; no metadata or published site change before selection.
References: current hero screenshot `audit-output/hangar-hero/pass-1-desktop.png`
and production rocket `public/assets/hero/hangar/rocket.png`.

### Shared prompt

```text
Use case: ads-marketing, reference-grounded recomposition.
Create a polished Open Graph social sharing image for Luke's personal portfolio, using the attached current homepage and rocket as exact brand/art references. Target 1200 x 630 pixels, horizontal 1.905:1 aspect ratio. Output only the finished flat card, full bleed; no browser, phone, social platform mockup, multiple panels or surrounding presentation border. This is a share image, NOT a webpage: remove all header navigation, menu button, buttons and SCROLL TO LAUNCH wording.
Use clear hierarchy, strong typography, intentional imagery and purposeful spacing. At a small chat-preview size the word LUKE and the rocket must remain immediately recognizable. Maintain at least 60px safe margins around text. Only two type families: very heavy condensed uppercase similar to Barlow Condensed for LUKE and work categories, clean monospace for the domain.
Preserve handmade mid-century retro science fiction cut-paper collage: tactile matte paper grain, crisp cut silhouettes, subtle layered-paper depth. Ink navy sky, warm cream lettering, rust-red/cream rocket with three dark teal round windows and broad red fins, subdued teal accents. No garden foliage, ringed planet, glossy 3D, neon or photorealism. Only two or three simple star accents, generous quiet space. Text permitted verbatim: "LUKE", "APPS · TECH GUIDES · MUSIC · FILMS", and "luke.gallery". No invented tagline, title, credentials, extra copy or concept label. Preserve rocket identity; do not reproduce any black transparency preview or glow from the isolated asset reference. Recompose rather than crop the existing site screenshot.
```

### Name First

```text
Direction NAME FIRST: A bold typographic calling card. Huge LUKE occupying left two-thirds, approximately x75 to730 and y155 to415. Work categories on one clear line beneath in cream condensed type around28px. Small but legible domain below, aligned left. Upright paper rocket on the right, approximately height440px, with its feet clearly touching a very shallow cream launch apron along the bottom edge. Low distant terracotta strip only on right, no hangar frame or city. Two tiny star accents in otherwise quiet navy. Clear separation between lettering and rocket; no overlap. Make LUKE the dominant recognition cue, rocket second.
```

### Liftoff

```text
Direction LIFTOFF: A dynamic graphic space travel poster as a social card. Rocket on the left half, rising diagonally toward upper middle, nose roughly x480 y75, tail toward x290 y385. A single simple sweeping layered cream/teal paper exhaust trail curves from lower-left edge toward its engine. No floor, architecture or landscape; dark navy open space. On right half, large LUKE at x630 to1130 y190 to380; two short supporting rows beneath reading "APPS · TECH GUIDES" then "MUSIC · FILMS"; domain "luke.gallery" below. Work categories legible but clearly secondary. Keep clean separation between trajectory and text. Energetic, minimal, strong silhouette at thumbnail size.
```

### Launch Window

```text
Direction LAUNCH WINDOW: Calm symmetrical miniature of the new homepage hero, carefully recomposed for a short wide social card. Very thin dark teal paper hangar arch hugs outer edges, leaving almost entire canvas open. Center a very large LUKE across the upper center, width480px and cap height195px starting aroundy75. Category line small but legible directly below at y285. A centered upright rocket occupies lower center, nose at y340 and feet touching apron at y535, about195px tall. A low simple cream paper apron spans bottom 95px, with shallow terracotta terrain on distant edge at sides. Domain "luke.gallery" in dark navy monospace centered on apron below rocket with baseline at y570, a 60px safe margin from bottom. Only two cream stars, off to either side. Keep about30px separation between category line and rocket nose. Architecture feels like a theatrical set, not a device bezel; spacious, centered, deliberate. No header or UI.
```

Validation: one horizontal card per result; brand/art fidelity; readable LUKE and rocket
at thumbnail size; correct text; no website controls; safe text margins. Final selected
asset will be exported to exact 1200×630 and wired into metadata in a later implementation.


## Selected hero — Launch Window refinement, 2026-10-26

Reference: third displayed concept, `exec-6f63b39a-daf5-4fda-9c24-9b0e5be6fffd.png`.
User approved lighter frame, stronger rocket, and a smaller or absent planet.

```text
Edit the attached selected website hero concept into its approved refinement. Output one finished 1440 x 900 landscape website hero, no browser chrome. Preserve centered composition, exact readable UI wording, retro matte cut-paper craftsmanship, navy/cream/rust/teal palette, distinctive cream-and-rust three-porthole rocket, and the feeling of looking from a hangar toward a launch apron. Changes: reduce the weight of the dark teal architectural frame by about half, making side strips narrow and the top rim exceptionally thin, an elegant theatrical paper proscenium rather than a device bezel. Remove the ringed planet entirely, leaving calm navy space. Make the rocket about 20 percent larger and unmistakably the protagonist, centered on a grounded low warm gray launch apron; rocket nose must have clear breathing space below the centered SCROLL TO LAUNCH button. Keep the LUKE wordmark large above it but slightly shorter if necessary to avoid crowding. Keep category text APPS ✱ TECH GUIDES ✱ MUSIC ✱ FILMS directly above LUKE and the small cream SCROLL TO LAUNCH ↓ action directly below. Header LUKE / PERSONAL TRANSMISSION and small menu remain. Keep distant terracotta terrain low, occupying only the lowest 15 percent of the scene, with floor below. Only three restrained cream stars positioned to the sides away from the text and rocket. No plants, trees, extra buildings, gantry, decorative interface, new text or panels. This is the coherent refined visual target for a layered responsive implementation.
```

Validation: centered readable type; clearly grounded rocket; thin framing;
no planet or foliage; no collision between action and rocket; independently
generated alpha-verified production layers rather than slicing this mockup.


## Hero concept pitch — 2026-10-26

### Purpose and references

Three review-only hero directions. No production implementation until selection.
References: `audit-output/consistent-projects/desktop-opening.png` and the user’s
15:17:30 compact hero screenshot. Retain the existing rocket, typography and
paper palette; replace the dense garden foreground with a coherent setting.

### Shared ImageGen prompt

```text
Create a realistic, production-quality website hero design with clear hierarchy, strong typography, intentional imagery and purposeful spacing. This is the hero only for Luke Cassady-Dorion's personal portfolio. Target dimensions 1440 x 900, landscape desktop viewport. One design, edge-to-edge website content only, no browser chrome or presentation board. The attached screenshots show the existing site and are grounding for its exact paper-collage style, palette, rocket identity and typography; radically simplify the composition according to the direction below rather than reproduce its crowding.

Preserve handmade mid-century retro science-fiction cut-paper art: matte worn printed paper, tactile grain, carefully cut silhouettes and restrained layered shadows. Ink navy #001b29, pale warm cream #f3dea2, rust/coral #c7603d and subdued teal. No photorealism, glossy 3D, neon, digital gradients, generic SaaS styling or plastic illustration. Preserve the recognizable cream rocket with rust-red nose and fins and three dark round portholes. No plants, leaves, flowers or jungle. No dense futuristic city or giant satellite dish. All ground-based objects must visibly connect to a platform or terrain; no inexplicable floating bases. Sparse stars, restrained planet scale, ample calm sky.

Keep exact existing content: top thin cream header rule with small monospaced "LUKE / PERSONAL TRANSMISSION" at left, small outlined hamburger button at right. Main wordmark "LUKE" in huge bold tightly condensed cream capitals. Secondary line "APPS ✱ TECH GUIDES ✱ MUSIC ✱ FILMS" in condensed capitals, coral separators. One modest cream rectangular action labeled "SCROLL TO LAUNCH ↓" in dark monospaced letters. No additional titles, taglines, invented copy, labels, cards, tabs, metrics or controls. Only two font families, condensed display and readable monospace. Group using space and alignment. Intentional whitespace; readable text; no overlapping artwork with lettering, no clipped text. Design should read quickly at reduced viewport sizes. Date context 2026-10-26, but no visible dates.

```

### Quiet Spaceport

Append to the shared prompt:

```text
Direction: QUIET SPACEPORT. Most restrained evolution of the existing hero. Strong asymmetrical composition: wordmark and category line left around x100 y320, large LUKE about 580px wide, CTA below. Right at x1080 a tall upright rocket rests on a low clearly visible cream launch pad at y760, with a slender rust gantry behind it. Rocket about 450px tall. Replace foliage with only two broad low cut-paper layers of dusty teal and warm gray lunar terrain occupying the bottom 15 percent; clean distant horizon. One tiny distant cream dome and antenna far on horizon, secondary enough to be almost a silhouette. A small rust ringed planet high right, separated from rocket, no collision. Vast uncluttered navy sky between groups. Barely a handful of cream stars. Quiet, sophisticated, tangible paper setting with strong focal hierarchy: LUKE first, rocket second, background distant. Do not place caption or concept name within the image.
```

### Launch Poster

Append to the shared prompt:

```text
Direction: LAUNCH POSTER. A decisive graphic mid-century science-fiction travel-poster composition rendered as a functional website hero. Wordmark LUKE is a massive typographic anchor in the upper-left/middle-left, category line directly above it, CTA directly below it. The rocket is already lifting off on a diagonal from lower-center toward upper-right, about 380px long, recognizable cream body, coral nose and fins, three round windows. A single broad curved cream and faded teal cut-paper exhaust ribbon sweeps from the bottom edge to the rocket, with only a few scalloped paper smoke forms at the lowest edge, creating movement without many tiny pieces. A very shallow curved dark teal planetary horizon along the bottom establishes origin. No gantry, buildings, dish or large ringed planet. One tiny distant pale moon and just three star shapes in generous navy negative space. Keep the trajectory entirely right of the typography, never behind words. The diagonal motion and bold paper shapes must feel adventurous and simple, distinctly different from a parked-rocket landscape. No extra text or concept name.
```

### Launch Window

Append to the shared prompt:

```text
Direction: LAUNCH WINDOW. A centered architectural composition, visibly different from a side-by-side hero. We are looking out from a quiet retro space hangar through one enormous rounded rectangular opening. The hangar is represented only by very broad dark teal layered cut-paper strips at the left and right edges and a subtle rounded top inner corner, not a detailed interior, no dashboard, rivets or switches. Opening fills almost entire hero below header. Center the oversized cream LUKE wordmark in the upper-middle of the open navy sky, about 600px wide. Place category line directly above the wordmark and the small SCROLL TO LAUNCH action centered immediately below it. Clear spacing below typography. In the lower third, a smaller upright cream and rust rocket sits centered on a broad simple warm gray launch apron extending all the way to the bottom, joined to dark teal side framing. Rocket approximately 220px tall, unmistakable silhouette, three round windows; no gantry needed. Distant low terracotta terrain is visible either side of the launch pad. A small ringed planet sits well off to the right within the sky, with only two or three stars. The full-width apron anchors the scene; no foliage, towers or dish. Broad graphic architectural framing must create depth without heavy visual clutter. Calm symmetrical anticipation of launch, paper theatrical set. Do not add concept names or any extra text.
```

### Validation criteria

- Three distinct compositions, each a single hero at desktop proportions.
- Existing header, wordmark, categories and launch action remain readable.
- Rocket is recognizable, prominent and narratively connected to its setting.
- Matte cut-paper texture and navy/cream/rust palette match the references.
- No foliage; no isolated cut-off architecture or floating launch platform.
- Generous space separates type and illustration; no new marketing claims.
- These are art-direction references, not pre-separated production assets.
- Responsive intent: preserve name and rocket; simplify/crop distant terrain or
  hangar edges before shrinking typography. Test actual behavior after selection.


Keep reusable ImageGen prompts, tested prompt patterns, and their validation
criteria in this file. When a prompt is materially revised during image work,
update the relevant entry here before using the revision again.

## Contact landing-scene reference

### Purpose

Create one full-scene visual reference for the portfolio's eventual contact
destination. It is a composition and palette reference only; production layers
will be generated separately after this scene is approved.

### ImageGen prompt

```text
Use case: stylized-concept
Asset type: 16:9 visual reference for a fixed-viewport portfolio contact scene

Primary request: Create an original retro-futurist alien landing valley with
strongly separable depth layers.

Scene/backdrop: Deep ink-navy outer space above a wide rust-red landing plain.
Place large near-black burgundy rock silhouettes cropped into both lower
corners, a clear midground plain with a subtle route leading inward, and
jagged muted violet and red rock formations in the far distance. In the
background center, a small vintage paper-collage rocket stands on a simple
landing pad. Behind it, two broad translucent teal aurora curtains sweep
diagonally upward through the star field. Include two small pale cream moons.

Style/medium: Handmade mid-century cut-paper collage with worn screen-print
texture, crisp torn-paper silhouettes, restrained halftone grain, and slight
printed registration shifts. It must belong with the existing Luke.gallery
paper-collage asset language, not resemble a film poster or a photorealistic
scene.

Composition/framing: Wide 16:9 landscape. Preserve an open, relatively calm
lower-left to mid-left part of the landing plain for a future contact card.
Each depth band must have a clean visual separation: stars/moons, aurora,
far terrain and landing pad, rocket, middle terrain, then foreground rocks.

Color palette: Ink navy and near-black sky; turquoise and sea-green aurora;
warm cream moons; coral, rust, dark burgundy, and muted violet terrain.

Constraints: No people, astronauts, aliens, animals, text, logos, watermark,
UI, border, glossy 3D rendering, or photorealism. Do not reproduce any
reference image's exact composition or objects.
```

### Validation criteria

- The landing rocket and pad are clearly visible in the distant center.
- Foreground rocks frame rather than obscure the calm lower-left landing plain.
- The teal aurora reads as a distinct layer behind the rocket.
- The palette is rich but remains matte paper/print rather than neon or glossy.
- No characters or text appear.

### Production-layer prompt set

Use the approved contact-scene reference for subject matter and brightness, and
use the existing opening-hero assets as the **non-negotiable production style
reference**: `01-sky-base.png`, `06-spaceport-city.png`,
`15-rocket-body.png`, and the foliage assets under `public/assets/hero/`.

Do not try to deconstruct or reproduce the finished composition. Generate each
production asset as an independent reusable layer with genuine alpha where it
is not a sky base. These assets will be placed through a hierarchy of shared
React anchors, like the opening hero; they are not full-viewport scene plates.

Style match: large, calm matte paper fields; sparse, low-frequency fibrous
paper texture; crisp cut-paper silhouettes; clean cream, coral, and teal color
blocks; thin dark cut shadows; and occasional restrained print-registration
variation. The result should look handmade at normal screen scale, not like a
close-up photograph of rough paper. Avoid dense peppery grain, fuzzy airbrush
texture, cyan/green alpha-edge halos, glossy lighting, or microscopic detail.

Palette: retain ink-navy space but make the new scene notably brighter than the
hero: luminous aqua/teal aurora, warm cream moons, saturated coral and
vermilion ground, and clear violet/magenta distant stone. Keep it printed and
matte rather than neon.

Every cutout needs clean transparent margin around its useful silhouette. No
checkerboard pattern, text, logo, border, watermark, or rectangular painted
backdrop.

Generate these seven files independently:

1. Do not generate a replacement sky. Reuse the persistent hero sky base
   (`public/assets/hero/01-sky-base.png`) and its existing star treatment.
2. `contact-moon.png`: one compact warm cream moon with a thin coral shadow,
   isolated with generous transparent space. It is a new-world accent, not a
   replacement for the persistent star field.
3. `contact-aurora.png`: two slim luminous aqua/teal paper aurora ribbons,
   isolated with ample transparent space; a supporting background object, not
   a canvas-filling curtain.
4. `contact-far-terrain.png`: a low, wide violet/magenta/coral ridge band with
   transparent sky above it. The terrain's lower 18–22% must be a continuous,
   fully opaque coral/violet paper bleed with a straight horizontal lower edge:
   no transparent holes, ragged lower contour, or sky-visible notches. It
   anchors behind the landing plain and foreground rocks, which overlap this
   bleed; its irregular cut-paper silhouette belongs only along the top ridge.
5. `contact-landing-pad.png`: a compact empty cream-and-charcoal circular
   bullseye landing pad only. It must have a centered target ring and a clear
   berth for the existing traveling rocket, with genuine transparency around
   it. Do not include gantry towers, arms, rails, antennae, or any other
   structure—never a full-frame foreground object and never a second rocket.
   The final pad must sit convincingly on the contact terrain: use a shallow,
   low-profile oval seen from the same near-horizon viewpoint as the terrain;
   keep its vertical front face very thin; omit feet, plinths, or a raised
   pedestal; add only a subtle soft contact shadow directly beneath it.
5a. `contact-gantry-bay.png`: an optional replacement overlay when the pad's
    integrated towers cannot visually frame the rocket. It must contain only a
    paired left/right coral gantry structure on true transparency—no pad,
    rocket, ground, or backdrop. The inner tower faces frame a clear central
    vertical bay aligned to the landing-pad circle; short inward arms may frame
    the berth but may never cross it. The rocket must read as landing *inside*
    this opening when assembled, not on top of a distant platform.
    First candidate rejection: it provided alpha and a central berth but was
    too tall, industrial, and realistically detailed. Revised prompt requires
    a compact, flat, printed-paper bay at roughly the rocket's height, with
    simplified lattice shapes and no dense machinery, cables, or metal realism.
6. `contact-plain.png`: a broad but shallow bright coral landing-plain band
   with a subtle pale route. It anchors below the horizon; do not fill a whole
   canvas with terrain. Its lower 18–22% must be an uninterrupted opaque coral
   paper bleed with a straight horizontal bottom edge across the entire useful
   width—no ragged lower silhouette, transparent notches, or dark paper gap.
7. `contact-foreground-left.png` and `contact-foreground-right.png`: separate
   dark burgundy paper-rock frames for the lower corners, each with a broad
   open center so the contact card can sit over the landing plain.

### Production-layer validation criteria

- Every output has genuine alpha wherever its layer is absent.
- Each PNG has a verified alpha channel and contains no baked checkerboard.
- The asset is visually self-contained, with enough transparent margin to
  position it responsively without clipping.
- Together, the assets retain the approved reference's sense of layered depth;
  they are not expected to reconstruct it pixel-for-pixel.

### Ground asset preparation

The generated plain and foreground rocks are preserved as source PNGs. Their
production variants are deterministically alpha-trimmed with a 4px safety
margin so CSS can align their visible paper edges directly:

- `contact-plain-trimmed-v1.png`: 1576×229
- `contact-foreground-left-trimmed-v1.png`: 379×311
- `contact-foreground-right-trimmed-v1.png`: 558×235
- `contact-far-terrain-trimmed-v1.png`: 1527×274
- `contact-far-terrain-trimmed-v2.png`: 1774×304
- `contact-far-terrain-trimmed-v3.png`: 1774×304 (the production integration
  filename for the accepted v2 artwork)
- `contact-landing-pad-trimmed-v1.png`: 603×331
- `contact-aurora-trimmed-v2.png`: 903×455
- `contact-moon-trimmed-v1.png`: 238×242

The landing pad is additionally sliced at its exact center into
`contact-gantry-left-v1.png` and `contact-gantry-right-v1.png`. The original
trimmed pad remains a continuous base behind both halves. The slices preserve
the source pixels and alpha; they exist only to give the rocket an explicit
center bay and predictable z-order.

Do not reintroduce compensating bottom offsets for per-file transparent
footers. These variants use their visible paper bounds; their CSS
wrappers use the recorded natural aspect ratios.

### Extraction attempt outcome

The built-in ImageGen extraction attempts visually displayed a checkerboard but
saved PNGs without an alpha channel. The checkerboard was baked image content,
so the entire six-layer set was rejected and must not be integrated. A targeted
aurora retry with an explicit alpha-channel requirement failed the same
file-level `hasAlpha` check. Future work uses the production-layer prompt set
above: separately generated assets rather than a deconstruction attempt.

### Approval-loop record

Every new contact asset follows this sequence: generate one candidate, inspect
composition/style/alpha, state a concrete rejection reason and one prompt
change if it fails, then regenerate. A candidate is accepted only after three
consecutive independent audits find no defect. The hero sky remains the shared
base; contact does not generate a competing sky plate.

For the assembled contact scene, do not report success until all of these pass
in actual browser captures at wide desktop, standard desktop, tall/narrow
desktop, and mobile: (1) no hero sky is visible beneath or between ground,
terrain, or either foreground rock; ground art deliberately overscans the
viewport bottom, (2) every terrain join is covered by an intentional overlap,
not by coincidental matching element boxes, (3) the rocket centerline and base
visually land inside the landing-pad circle, with both gantry sides framing the
rocket as a bay rather than the rocket appearing pasted in front, and (4) entry,
mid-reveal, final landing, and reverse scroll all preserve those relationships.
Any failed frame restarts the three-pass assembly audit after the relevant
asset or CSS correction.

#### Aurora iteration log

- Attempt 1 — rejected. Alpha was valid, but both ribbons touched the canvas
  edge, retained a cyan/green fringe, and used cream inlay stripes that read as
  decorative streamers rather than distant aurora. Next prompt: require two
  detached matte bands wholly within the canvas, no cream outline or glow.
- Attempt 2 — rejected. The calmer matte texture was a substantial improvement,
  but both ribbons still ran into the right canvas edge. Next prompt: place a
  compact, fully enclosed aurora group at the canvas center; CSS, not the image
  canvas, will later determine its directional placement in the scene.
- Attempt 3 — rejected. Scale and transparent margin finally worked, but the
  scalloped torn silhouettes read as flags rather than broad distant light, and
  the cyan fringe persisted. Next prompt: smooth tapered paper beams with
  deliberately clean dark edges and no ragged tears.
- Attempt 4 — accepted after three clean audits. The two beams are compact,
  smooth, separately readable, and fully enclosed by transparent margin.
  - Audit 1 (file geometry): valid alpha; opaque bounds retain 381–396px
    horizontal and 239–256px vertical margins on the 1672×941 canvas.
  - Audit 2 (visual language): broad matte aqua/teal paper fields, smooth
    silhouettes, and restrained dark underside shadows; no cream inlay,
    decorative-streamer shape, scene background, or dense paper grit.
  - Audit 3 (composition): the centered compact group has enough empty canvas
  to be positioned by a shared contact sky anchor and to fade over the
  persistent hero sky without cropping.

#### Moon iteration log

- Attempt 1 — accepted after three clean audits.
  - Audit 1 (file geometry): valid alpha; opaque bounds retain 721px left/right
    and 354px top/bottom margin on the 1672×941 canvas.
  - Audit 2 (visual language): compact cream disc, restrained coral paper
    shadow, and sparse crater marks; no dense grain, scene backdrop, or glow.
  - Audit 3 (composition): intentionally small enough to add a contact-world
    accent over the persistent hero sky without competing with the aurora.

#### Distant-terrain iteration log

- Attempt 4 — candidate selected for integration. Native alpha is zero across
  the upper canvas; useful terrain bounds are 1774×296 (about 6:1), and a
  nearly fully opaque horizontal bleed begins 210px below the terrain top and
  continues to its lower edge. The deterministic production crop is
  `contact-far-terrain-trimmed-v3.png` at 1774×304.
  - Assembly audit 1: the cropped production asset retains transparent sky and
    a continuous opaque lower bleed; no baked checkerboard or lower holes.
  - Assembly audit 2: in the complete landed C2 frame, terrain now overlaps
    the plain without exposing hero sky beneath the terrain or foreground
    rocks; pad circle, gantry pair, and rocket share the central landing axis.
  - Assembly audit 3: terrain entry and reverse landing checks retain a clean
    ground closure while the plain, gantry, and rocket use their staged reveal
    values. No broken asset or terrain seam was visible.
- Attempt 2 — rejected. The lower bleed was correctly broad and continuous,
  but the saved PNG was fully opaque: its apparent checkerboard/white field was
  baked into the bitmap, including every pixel on the top and side margins.
  Next prompt: generate without an image reference, request a native RGBA PNG
  with literal transparent pixels above and around the terrain, and require a
  pixel-checkable opaque lower bleed only within the illustrated band.
- Attempt 3 — rejected. The file had genuine transparency above the terrain
  and a continuous opaque lower 28%, but the illustrated band was too tall and
  densely detailed after its useful bounds were considered. Next prompt: make
  the useful terrain silhouette shallow (roughly 4.8–5.8 times wider than
  tall), use broad calm strata, and retain a solid lower bleed.
- Attempt 1 — accepted after three clean audits.
  - Audit 1 (file geometry): valid alpha; opaque bounds retain 76–77px side
    margins, 586px of clear sky above, and 89px below on the 1672×941 canvas.
  - Audit 2 (visual language): a low, bright coral/vermilion/violet mesa band
    with broad paper fields and cut-paper shadows. It avoids the old scene's
    full-screen rock wall and dense microscopic texture.
  - Audit 3 (composition): the horizon has enough width to establish a new
    world while leaving the shared sky and contact moon dominant; its low
    silhouette preserves a clear central landing area for the pad and rocket.

#### Landing-plain iteration log

- Attempt 1 — accepted after three clean audits.
  - Audit 1 (file geometry): valid alpha; opaque bounds retain 51–53px side
    margins, 648px of clear sky above, and 72px below on the 1672×941 canvas.
  - Audit 2 (visual language): coral and vermilion paper strata remain broad
    and matte, with one restrained cream route rather than a photoreal or
    heavily textured ground surface.
  - Audit 3 (composition): this is a shallow supporting band, not a scene
    plate; the open middle holds a landing-pad anchor and the lower corners can
    still take separate foreground rocks.

#### Landing-pad iteration log

- Attempt 1 — accepted after three clean audits.
  - Audit 1 (file geometry): valid alpha; opaque bounds retain 538–539px side
    margins, 471px above, and 147px below on the 1672×941 canvas.
  - Audit 2 (visual language): the cream/charcoal platform and slim coral
    pylons use the same restrained paper construction as the hero, with no
    rocket, metal realism, or full-frame industrial scaffolding.
  - Audit 3 (composition): it remains a compact isolated landing target with
    an empty central berth. The scene anchor—not the image canvas—will keep it
    small in relation to the landscape and existing traveling rocket.

#### Foreground-corner iteration log

- Left attempt 1 — rejected. The alpha was valid, but the boulder was too
  photographic and textured, and it rose roughly halfway up the canvas. Next
  prompt: flat, faceted cut-paper stones only, with a low silhouette confined
  to the bottom-left corner and no rocky surface detail.
- Left attempt 2 — accepted after three clean audits.
  - Audit 1 (file geometry): valid alpha; opaque bounds are confined to the
    lower-left (18–388px horizontally, 621–923px vertically) on 1672×941.
  - Audit 2 (visual language): the final stones use broad, flat angular paper
    faces with restrained fiber—not photoreal boulder texture.
  - Audit 3 (composition): the group ends before one quarter of the canvas,
    leaving a deliberately open scene center for the form and landing site.
- Right attempt 1 — accepted after three clean audits.
  - Audit 1 (file geometry): valid alpha; opaque bounds are confined to the
    lower-right (1105–1654px horizontally, 679–905px vertically) on 1672×941.
  - Audit 2 (visual language): broad burgundy/plum angular paper faces and a
    small violet/coral accent match the left asset without duplicating it.
  - Audit 3 (composition): it is a low, open-sided foreground counterweight;
    it neither encloses the scene nor competes with the central landing route.

## Paper launch-smoke sprite sheet

### Use when

Creating a six-frame paper-animation smoke plume for the desktop rocket launch.
The result must be a usable sprite source, not merely six smoke illustrations
placed beside each other.

### ImageGen prompt

```text
Use case: stylized-concept
Asset type: transparent PNG sprite sheet for a scroll-driven portfolio launch animation

Primary request: Create one horizontal six-frame paper-animation sprite sheet
of rocket-launch smoke.

Scene/backdrop: None. Fully transparent background.

Subject: A grounded, hand-cut paper smoke plume.

Style/medium: Handmade mid-century paper collage with fibrous cut-paper
texture and crisp torn edges. Match a vintage cream, red, and blue-gray rocket
illustration.

Composition/framing: Exactly six equal, side-by-side frame cells in one
horizontal strip. Each cell is an isolated, identical-size transparent canvas.
No plume may enter a neighboring cell; leave transparent padding between a
plume edge and every cell boundary. Do not show divider lines, labels,
numerals, or any visible cell boundary. In every frame, lock the plume origin
to the exact same bottom-center pixel coordinate.

Frame progression:
- Frame 1: a small, dense ignition cloud rooted at the origin.
- Frames 2–3: the plume grows outward while remaining rooted at the origin.
- Frames 4–5: a broader, layered launch plume.
- Frame 6: the widest, fullest plume, still rooted at exactly the same origin.

Color palette: Warm cream, pale gold, muted blue-gray, and restrained dusty
ochre.

Constraints: A genuinely transparent background. Only smoke. No rocket,
gantry, flame, scenery, plants, planets, sky, text, shadows cast outside the
smoke, border, watermark, gutters, or panel dividers. The six frames must read
as one cohesive frame-by-frame paper animation without repositioning.
```

### Standalone validation loop

Before integrating any candidate into the portfolio:

1. Save the candidate as a new local versioned asset; do not overwrite an
   approved asset.
2. Load it in `public/launch-smoke-preview.html`, which displays one discrete
   sprite cell at a time against a neutral background with an origin marker.
3. Watch repeated full loops and inspect screenshots for:
   - equal cell packing with no neighboring-frame bleed;
   - a stable origin with no horizontal or vertical jump;
   - no blank frame, flicker, fade, or flash;
   - a cohesive paper-animation progression;
   - clean transparency and no unintended objects or text.
4. If any criterion fails, reject the candidate, regenerate the asset, and
   restart validation at pass 1. Do not compensate for a bad source asset in
   the portfolio CSS.
5. Approve only after three independent clean preview checks with no changes
   between them. Show the generated asset and preview evidence before site
   integration.

### Candidate 1 outcome

Rejected. The generated artwork placed plumes across a shared canvas instead
of keeping each plume inside an equal isolated cell. The standalone preview
showed neighboring-frame bleed, so the source cannot be corrected with sprite
offsets alone.

### Candidate 2 revision

Candidate 1 treated the strip as a composition rather than a precise grid. Add
this instruction immediately after `Composition/framing` for the next attempt:

```text
The image width is divided into six identical columns, each exactly one sixth
of the full image width. Treat each column as a strict clipping boundary:
nothing from a frame may cross into another column. Center the plume base at
50% of each column's width and align it to the same bottom baseline in every
column. Leave at least 12% of every column transparent at its left and right
edges, and at least 8% transparent above the plume. The six plume bases must
therefore appear at 8.333%, 25%, 41.667%, 58.333%, 75%, and 91.667% of the
full image width.
```

### Candidate 2 outcome

Rejected before preview. The model improved plume spacing but still allowed
adjacent plumes to cross the one-sixth column boundaries. An invisible
six-column strip is not yielding reliable fixed cells.

### Candidate 3 revision

Use a three-column by two-row sprite grid instead of a six-column strip. A
clearly described two-dimensional contact-sheet structure gives the generator
more reliable spatial constraints. The preview must be updated to select the
six grid cells discretely only after the source itself passes inspection.

### Candidate 3 outcome

Rejected before preview. The 3×2 composition respected the broad arrangement
but lost transparency and became tall flame-like plumes. It does not match the
grounded smoke brief or the existing paper-cutout treatment.

### Candidate 4 revision

Use the terms `game asset atlas` and `strict six-cell transparent sprite grid`.
Limit each plume to 55% of its cell width and 65% of its cell height, with its
base centered at 90% of cell height. Explicitly forbid glow, gradients, and
all fire-like vertical shapes.

### Candidate 4 outcome

Rejected during preview pass 1. The source packed into discrete cells with
clean transparency, but frames 4–6 placed their smoke bases materially higher
than frames 1–3. The origin marker exposed a vertical registration jump.

### Candidate 5 revision

Retain the 3×2 grid, but specify a shared horizontal baseline that crosses all
six cells at exactly 90% of their cell height. Require the lowest opaque pixel
of every smoke plume to touch that baseline, including the second row. Frame
size may grow upward and sideways only; it may never grow downward or shift
its base upward.

### Candidate 5 outcome

Rejected during preview. The upper-row frames aligned to the origin marker,
but the bottom-row frames again sat materially higher. After five attempts,
the generator is consistently treating the lower row relative to the overall
canvas instead of the individual cell. Further prompt-only attempts have low
confidence of producing a registered production sprite.

### Registered sprite assembly

ImageGen is responsible for creating or editing the smoke artwork. When it
cannot place frames at exact pixel coordinates, use deterministic local asset
preparation to turn approved generated frames into a production sprite sheet.

Allowed preparation:

- crop equal source cells;
- measure the opaque bounds of each cell;
- translate an entire frame without changing any painted pixels so its lowest
  opaque pixel meets the documented shared baseline and its anchor meets the
  documented horizontal origin;
- expand transparent canvas bounds when required; and
- pack the registered cells into a local transparent sprite sheet.

Not allowed during preparation:

- generating, repainting, inpainting, recoloring, erasing, or stylizing art;
- using CSS or SVG as a substitute for raster art; or
- discarding the original generated source frames.

For each assembled sheet, record the source asset, cell dimensions, shared
origin, shared baseline, and output path. Validate the assembled result in the
standalone preview before any site integration.

### Accepted launch-smoke assembly

Candidate 5 was accepted only after deterministic registration. Its six source
cells measured 512 × 512 pixels and were packed into six 640 × 512 output
cells, preserving every generated pixel and adding 64 pixels of transparent
horizontal padding on each side. The shared origin is `(320, 461)` in each
output cell. The assembled sheet is
`public/assets/launch/rocket-smoke-sprite.png`; its exact source bounds and
per-frame translations are recorded in the adjacent JSON manifest. It passed
three independent six-frame standalone preview checks.

## Progressive retro-sci-fi clip-art collection

### Purpose

Create fourteen independent, transparent paper-collage clip-art assets: two
for each project scene (Sow, Lazy Designer, Grok, DFlow, Music, Cheer, and
Lamont). These are supporting objects, not scene backgrounds. They will fade
in during their own project scene while the small traveling rocket continues
smoothly left-to-right. The Contact landing world is deliberately out of
scope until its references arrive.

The supplied reference images are **style and mood references only**, not edit
targets: their surreal eye-world, layered ringed worlds, classic ships,
satellites, bold print texture, and increasingly bright colors inform this
collection. Do not reproduce any reference composition, watermark, text,
character, or brand.

### Collection-wide production rules

- Use ImageGen's built-in generation mode. Every generated candidate is a new
  image, not an edit of a supplied reference.
- Output one isolated subject per PNG with a genuinely transparent background.
  No sky rectangle, background color, checkerboard, vignette, scenery,
  shadow rectangle, frame, typography, label, logo, watermark, or border.
- Match the portfolio's handmade cut-paper / worn screen-print language:
  hard-cut silhouette, subtle paper fibers, restrained halftone and print
  misregistration. Do not make glossy 3D renders, photoreal art, or clean
  vector icons.
- Keep important forms at least 10% inside the transparent canvas on every
  edge. Use a roughly square canvas and leave deliberate negative space where
  the prompt asks for it.
- Palette progression matters. Sow begins near cream, muted teal, and coral;
  later scenes can introduce saturated cyan, electric blue, chartreuse,
  magenta, and signal yellow. They must still feel printed rather than neon
  digital.
- Botanical imagery is reserved for Sow and Lazy Designer only. From Grok
  onward, explicitly avoid leaves, petals, flowers, roots, garden terraces,
  vines, seed pods, and greenhouse forms unless a later user-approved prompt
  overrides this rule.
- Save selected assets locally beneath
  `public/assets/space-clip-art/`. Never reference a remote image URL.
- Candidate filenames must be versioned, e.g.
  `sow-eye-planet-v1.png`, never overwriting an approved asset.

### Shared prompt suffix

Append this exact constraint block to every asset prompt below:

```text
Output: one isolated transparent PNG clip-art object on a genuinely transparent
background. Preserve alpha around and between all cut-paper shapes. No text,
numbers, watermark, logo, border, background, landscape, sky, star field,
glow halo, or rectangular shadow. Keep the full object at least 10% inside
every canvas edge. This is a supporting web-layer asset, not a poster.
```

### Asset prompts and scene placement plan

Generate two variants of each prompt initially. The prompt names below are the
proposed final filenames after a candidate is approved.

#### Sow — first bright anomaly

**`sow-eye-planet.png` — foreground, large, left-middle, z-index 18**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a surreal small planet that is also a single unblinking eye.
Subject: one cream paper sphere split by a dark teal eyelid seam, with a warm
coral iris and a tiny gold pupil; a few thin concentric orbital rings partially
wrap the sphere.
Style/medium: handmade mid-century paper collage and faded screen print.
Composition/framing: centered single object, slightly tilted, compact circular
silhouette with clean transparent negative space.
Color palette: cream, muted teal, coral, dusty gold; only a restrained first
hint of brighter cyan.
Constraints: intriguing and uncanny but gentle; not horror, no lashes, no face.
```

**Generation record — 2026-08-29**

- Candidate v1: rejected. Strong material treatment, but the object filled the
  canvas and behaved like a hero illustration rather than a clip-art layer.
- Candidate v2: rejected. Improved simplicity but still exceeded the required
  transparent safe margin.
- Candidate v3: selected for review. A compact eye-planet with transparent
  alpha was saved locally as
  `public/assets/space-clip-art/sow-eye-planet-v3.png`. It must still pass the
  three standalone preview checks before production integration.

**`sow-signal-seed.png` — middle depth, small, upper-right, z-index 8**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a botanical radio beacon that reads halfway between a seed pod
and a tiny satellite.
Subject: one round moss-green seed capsule with three short copper antennae and
a small cream radio dish, radiating a few printed signal arcs.
Style/medium: handmade paper collage, distressed vintage science illustration.
Composition/framing: single compact object with its signal arcs contained
inside the transparent canvas.
Color palette: moss, muted teal, cream, dusty orange.
Constraints: no soil, plant pot, scenery, or text.
```

**Generation record — 2026-08-29**

- Candidates v1 and v2: rejected. Both had good transparent alpha but were too
  large and elaborate for their intended small supporting layer.
- Candidate v3: selected for review after simplifying to a self-contained
  seed-satellite with no detached signal arcs. It is alpha-verified and saved
  as `public/assets/space-clip-art/sow-signal-seed-v3.png`; it still requires
  three clean preview passes before production integration.

#### Lazy Designer — cultivated orbit

**`lazy-ring-garden-planet.png` — background depth, medium, top-right, z-index 4**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a layered ringed planet whose surface is made from abstract
garden terraces.
Subject: one pale turquoise planet with low stepped bands of fern green and
coral, encircled by two thin cream and gold paper rings.
Style/medium: retro-futurist cut-paper astronomical plate, lightly weathered.
Composition/framing: wide circular object with rings extending horizontally;
no separate landscape.
Color palette: turquoise, fern, cream, coral, pale gold.
Constraints: peaceful and graphic; no typography or UI elements.
```

**Generation record — 2026-08-29**

- Candidates v1 and v2: rejected. They had valid transparent alpha and a
  promising garden-world direction, but both were too detailed and too
  full-canvas for distant supporting art.
- Candidate v3: selected for review. The simplified layered world is
  alpha-verified and saved as
  `public/assets/space-clip-art/lazy-ring-garden-planet-v3.png`; it still
  requires three clean preview passes before production integration.

**`lazy-orbital-pruner.png` — foreground, small, lower-right, z-index 18**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a whimsical compact pruning-tool spacecraft.
Subject: one small teal-and-coral capsule craft with two stylized leaf-shaped
solar panels and a gold circular window; it should suggest gardening without
becoming a literal tool illustration.
Style/medium: worn paper collage, 1960s speculative space hardware.
Composition/framing: angled to travel right, with ample transparent padding.
Color palette: teal, coral, cream, small chartreuse accents.
Constraints: no pilot, exhaust flame, labels, or background.
```

**Generation record — 2026-08-29**

- Candidate v1: rejected. It was visually rich but too mechanically elaborate
  and far too large for its foreground supporting role.
- Candidate v2: selected for review. The simple right-facing capsule and leaf
  panels retain the intended garden cue without creating a second hero. It is
  alpha-verified and saved as
  `public/assets/space-clip-art/lazy-orbital-pruner-v2.png`; it still requires
  three clean preview passes before production integration.

#### Grok — thinking machine signal

**`grok-mind-satellite.png` — middle depth, medium, left-upper, z-index 9**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a retro space satellite shaped like an abstract thinking
machine.
Subject: one blue-gray capsule with a faceted amber observation band, three
delicate antenna dishes, and a small red control module.
Style/medium: screen-printed cut-paper sci-fi technical illustration.
Composition/framing: diagonal, tilted slightly right; object only.
Color palette: blue-gray, faded cyan, amber, restrained red, cream.
Constraints: no human face, text, diagram labels, or planet backdrop.
```

**`grok-orbiting-thought.png` — foreground, small, right-middle, z-index 18**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: an abstract floating thought form that feels extraterrestrial
and technological.
Subject: one small cobalt-blue paper orb with a coral core, encircled by three
uneven thin cream orbit lines and two tiny gold signal dots.
Style/medium: distressed paper print with clean cut edges.
Composition/framing: compact round object, balanced transparent space.
Color palette: cobalt, coral, cream, gold, subtle cyan.
Constraints: no brain anatomy, lettering, UI, or background.
```

#### DFlow — exchange in deep space

**`dflow-interchange-station.png` — background depth, large, upper-right, z-index 5**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a circular retro-futurist interchange station, suggesting
movement and exchange rather than a real-world finance logo.
Subject: one cream rotating ring with a dark teal inner hub, three coral dock
spokes, and tiny bright chartreuse indicator windows.
Style/medium: vintage speculative-space cut-paper illustration.
Composition/framing: broad wheel-like silhouette with transparent holes between
the spokes.
Color palette: cream, deep teal, coral, chartreuse, electric-blue accents.
Constraints: no currency symbols, numbers, labels, charts, or background.
```

**`dflow-cargo-comet.png` — foreground, medium, lower-left, z-index 18**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a tiny streamlined cargo ship carrying three glowing paper
orbs in a clear dome.
Subject: one coral-and-cyan craft pointed right, with a cream cockpit and three
small yellow, pink, and teal round cargo forms.
Style/medium: mid-century paper collage with screen-print texture.
Composition/framing: long horizontal object with no exhaust trail.
Color palette: coral, cyan, cream, signal yellow, pink.
Constraints: no pilot, text, labels, background, or motion blur.
```

#### Music — broadcast bloom

**`music-aurora-saucer.png` — middle depth, large, upper-left, z-index 10**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a graceful retro flying saucer that broadcasts a flower-like
aurora.
Subject: one flattened cream-and-cyan saucer with a magenta central window;
above it, five translucent paper petals form a compact abstract sound bloom.
Style/medium: brighter 1970s cosmic paper collage, still visibly hand printed.
Composition/framing: single diagonal object, tip and petals kept inside canvas.
Color palette: cyan, electric blue, magenta, cream, signal yellow.
Constraints: no human figure, musical notes, words, or background.
```

**`music-resonance-orbs.png` — foreground, small, lower-right, z-index 18**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: three uneven floating resonance orbs connected by thin curved
paper wave-lines.
Subject: one small group of cyan, warm pink, and pale yellow circular orbs;
they should feel like a single clip-art object.
Style/medium: luminous but matte cut-paper screen print.
Composition/framing: compact asymmetrical group with generous transparency.
Color palette: cyan, pink, yellow, cream.
Constraints: no notation, speaker, text, glow halo, or scenery.
```

#### Cheer — friendly transmission

**`cheer-bubble-cruiser.png` — middle depth, large, upper-right, z-index 11**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a cheerful green bubble-canopy cruiser with a tiny black-cat
silhouette as an abstract passenger detail.
Subject: one lime and cream capsule ship beneath a clear round paper dome,
with a small black cat shape seated inside and two coral stabilizer fins.
Style/medium: optimistic retro-future paper collage, printed texture.
Composition/framing: one playful but cleanly cut object, angled right.
Color palette: lime green, cream, coral, teal, small pink accents.
Constraints: no human person, words, logos, or background.
```

**`cheer-hello-satellite.png` — foreground, small, left-middle, z-index 18**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a friendly compact satellite sending a visual greeting signal.
Subject: one small coral satellite with a rounded teal dish and three soft
cream radiating arcs; the arcs remain within the canvas.
Style/medium: vibrant hand-cut paper with worn ink texture.
Composition/framing: small centered object with clean alpha space.
Color palette: coral, teal, cream, chartreuse accent.
Constraints: no letters, emoji, words, face, or background.
```

#### Lamont — final transmission

**`lamont-dawn-planet.png` — background depth, large, upper-left, z-index 6**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a luminous layered dawn planet with nested rings and a
surreal internal horizon.
Subject: one warm salmon sphere with cream paper rings, a dark blue inner
horizon stripe, and a narrow yellow sun sliver visible inside the planet.
Style/medium: rich retro-sci-fi risograph and cut-paper collage.
Composition/framing: circular object with layered depth but no external scene.
Color palette: salmon, warm pink, cobalt, cream, signal yellow, cyan accent.
Constraints: no text, border, stars, terrain outside the object, or background.
```

**`lamont-landing-beacon.png` — foreground, medium, lower-right, z-index 18**

```text
Use case: stylized-concept
Asset type: isolated transparent web clip-art
Primary request: a bright extraterrestrial landing beacon that foreshadows a
future world without depicting that world yet.
Subject: one squat cobalt-and-cream beacon tower with a coral dish, three tiny
yellow lights, and a clean oval base.
Style/medium: saturated paper-cut retro-future object with printed grain.
Composition/framing: upright compact object with transparent negative space.
Color palette: cobalt, cyan, coral, cream, yellow, pink accent.
Constraints: no ground, planet, rocket, text, or background.
```

### Integration and depth behavior

Once assets are approved, each project scene gets a dedicated named clip-art
layer component rather than inline markup. Every layer follows its project
scene reveal value: opacity fades from 0 to 1 during the scene’s entrance and
back to 0 during its exit. There is no autonomous movement, parallax, or CSS
keyframe animation. Position, size, and z-index are documented in a single
data module so depth remains legible:

- z-index 4–6: large, faded distant worlds behind the project boxes;
- z-index 8–11: medium objects in open negative space between or around boxes;
- z-index 18: small foreground cutouts that may overlap a box edge but never
  obscure readable copy, controls, or the traveling rocket.

Vary scale deliberately: large distant worlds should be low contrast; tiny
foreground objects can be crisp and saturated. This is what creates paper
depth without camera movement.

### Required generation and review loop

1. Generate two independent candidates for every prompt. Treat all provided
   references as style references only and use no remote image URL in the site.
2. Inspect each candidate visually before it enters the project. Reject any
   candidate with a painted background, missing/opaque alpha, poster framing,
   text, watermark, accidental extra subject, style drift, or cropped object.
3. Put only candidates that pass initial inspection into the preview page.
   Validate actual alpha on a checkerboard and against the portfolio’s dark
   space background; a checkerboard baked into an image is an automatic reject.
4. For each prompt, select the strongest candidate or make one targeted prompt
   revision. Regenerate only that asset’s failed prompt; do not use CSS to hide
   a bad background or crop away failed artwork.
5. Build the preview described below, then inspect it at desktop size for
   cohesion: repeated style, clear silhouette, palette progression, depth,
   readable scale, and no clutter. Reject any asset that makes the page look
   poster-like instead of layered.
6. Any rejected or revised asset restarts at step 1 for that asset. Selected
   assets must pass three consecutive clean preview inspections with no further
   edits. Only then copy the selected local assets into the final project
   folder and integrate them.

### Required review deliverable

Create `public/space-clip-art-preview.html`: a single, plain HTML portfolio
page that lets the user review every candidate and selected asset without
opening the application. It must include:

- a clearly labeled card for every prompt and candidate version;
- the PNG shown on both a checkerboard transparency panel and the portfolio’s
  dark-space background;
- filename, prompt name, scene assignment, proposed depth band, proposed
  z-index, and intended scale;
- a visible selected / rejected / needs-revision status;
- a compact summary of the three-pass review record for every selected asset;
- no externally hosted images, scripts, or fonts.

The page is a review artifact, not a public portfolio route, and must not be
used by the production app.


## Selected hero production layers — 2026-10-26

# Hangar frame asset — 2026-10-26

## Exact prompt

```text
Create only the architectural foreground frame from this art direction as a separately designed production asset, no full scene. Landscape canvas target1536x1024. Very thin dark desaturated teal matte cut-paper hangar doorway: narrow gently curved vertical columns hugging extreme left and right edges, slender rounded upper corners, an exceptionally thin top rim; lower ends terminate flush at bottom. Center 90 percent entirely transparent alpha. Frame looks like layered handmade worn paper with subtle cream-teal edge highlights, no metal gloss, no details, no rivets. Broadest column occupies at most4 percent canvas width. No bottom crossbar or floor. No sky, stars, terrain, rocket, text, UI, planet, shadow across transparent opening or checkerboard pixels. Symmetrical frontal view, approved reference palette. Output real RGBA transparency.
```

## Validation criteria

- Real RGBA transparency; alpha zero through the central opening.
- Visible matte teal paper columns at both edges and a thin top rim.
- No sky, foreground, text, UI, rocket, or embedded checkerboard.
- Symmetrical framing, narrow enough not to compete with the central scene.

## Generation

- Tool: built-in ImageGen, transparent_background true.
- Reference: approved refined Launch Window concept.

## Result

- Source: `/Users/luke/.codex/generated_images/01a1776a-6ae6-7ac0-82b8-844a1240c3c6/exec-b5368435-918a-47ba-bfd7-b8ff6883372d.png`.
- Project asset: `public/assets/hero/hangar/frame.png`, copied unchanged.
- Canvas 1536 × 1024, RGBA. 1,437,719 fully transparent pixels;
  135,145 partial-alpha pixels; maximum alpha 254. Center alpha is 0.
- Visible alpha bounds: x0–1535, y29–983. The bottom 40 pixels are transparent;
  position the frame so its visible feet meet or pass behind the apron.
- Inspected: narrow symmetrical teal paper arch, no embedded scene or text.
- Provisional asset acceptance only; final acceptance depends on assembled hero.


# Hangar terrain layer

Reference: `exec-ef7e2b46-a3b7-42ff-98ee-de2ff83256f8.png`.

```text
Create an independent production background terrain layer inspired by this reference, not a whole scene. Wide landscape target 1536x384, panoramic horizontal band. Low distant terracotta lunar rocky hills formed from matte cut and folded paper, muted rust palette with subtle worn print texture. Hills tallest at extreme left and right, descend into a very low flat horizon in central half, perfectly open for foreground central rocket. The center horizon should occupy only bottom 12 percent of canvas, edge hills rise to 65 percent. Lower terrain connects continuously to bottom edge. Above hill silhouette fully transparent real alpha. No frame, floor, rocket, stars, sky, planet, gantry, plants, UI or text. Refined restrained handmade mid-century retro science fiction, not photorealistic rocks. Broad simple silhouettes, no noisy tiny stones.
```

Validation: real transparent alpha above silhouette; low center and higher side terrain; muted terracotta cut paper; no scene objects; continuous opaque lower terrain; retained original source and no creative postprocessing.

## Output and validation

- Built-in ImageGen original: `/Users/luke/.codex/generated_images/01a1776b-d678-7cc2-a465-eb8d51c13b78/exec-72dc5738-348f-4151-b1dd-9113e09dbd06.png`.
- Project asset: `public/assets/hero/hangar/terrain.png` (unchanged copy).
- Canvas 2172 × 724, RGBA, real transparency confirmed. 1,154,196 fully transparent pixels. Top center and canvas center alpha 0. Lower terrain alpha around 250–253.
- Visual inspection: restrained paper hills rise at sides and fall to a flat low central horizon, with no extra objects. Ready for in-situ evaluation with apron/frame.


# Hangar launch apron — 2026-10-26

## Revision 2

First output added a white top band; rejected for production. Exact repair:

```text
Correct only the composition of this paper launch apron asset. Remove ALL empty white area above the floor. Recompose so that the narrow cream far-edge step touches the absolute top edge of the exported image, x0 through full width. All pixels from top to bottom must depict the paper floor or step. Keep the same warm cream/gray matte textured paper, symmetric one-point perspective, paving slab seam layout and restrained dark teal side insets. Output a panoramic 3:1 full bleed opaque floor-only image. Do not add any blank margins, sky, white band, background, terrain, walls, frame, rocket, text, objects or UI. The entire exported canvas is the illustrated floor, with no empty background anywhere.
```

## Exact prompt

```text
Create only a separate wide horizontal launch-apron foreground plate, target1536x384 panoramic 4:1 aspect ratio. An empty warm gray/cream matte layered-paper spaceport floor seen from low frontal viewpoint, symmetrical one-point perspective center, like floor in reference. Floor fills entire canvas edge to edge, top horizontal edge is a slender cream paper step marking distant edge of apron, below it broad quiet rectangular paper paving slabs with subtle fine seams converging to center top and gentle print texture. Restrained darker teal inset seam near each far side; center clear to ground a separate rocket. No horizon landscape, sky, backdrop, walls, arch, frame, rocket, objects, plants, stars, people, text or UI. No glossy metal, no photorealistic concrete; tactile cut-paper collage with tiny edge shadows, elegant broad shapes, low detail. Full bleed opaque floor texture.
```

## Validation

Accepted revision 2: `/Users/luke/.codex/generated_images/01a1776c-c932-7570-ae07-748f173d562e/exec-cd46f1bc-a3dc-46d5-8dac-b42ca5b5b252.png`.
Copied without alteration to `public/assets/hero/hangar/apron.png`.
Visual inspection confirms top step touches canvas edge, no white band, no objects,
warm matte paper floor and centered perspective. Actual size 2172x724 (3:1).

- Empty opaque paper apron fills entire canvas.
- No sky, text, rocket, terrain or other baked-in objects.
- Symmetric perspective and clear center support separately animated rocket.
- Cream/warm gray matte paper matches refined hero.
- Preserve generated file unchanged; report actual dimensions.




# Hero rocket — 2026-10-26

## Exact prompt

```text
Create one isolated upright retro paper rocket for approved hangar hero, front view, canvas1024x1536 transparent. Preserve identity cream body, rust-red conical nose, three vertically aligned dark teal round portholes, rust side fins and central fin, charcoal engine. Match the BROADER silhouette in approved hero reference rather than tall thin source: opaque rocket height1360px, opaque width740px, centered with generous alpha margin all sides. Substantial cream body, broad triangular side fins spreading symmetrically; matte tactile layered mid-century paper, subtle worn print, no glossy metal or photographic lighting, no glow. Flat foot/engine baseline near bottom, front fin may extend very slightly below. No ground, shadow, sky, gantry, smoke, stars, text or UI. True alpha transparency outside crisp illustrated silhouette.
```

## Validation criteria

- True alpha transparency and crisp silhouette without rendered background.
- Recognizable cream/rust rocket, three dark round portholes and charcoal engine.
- Broad silhouette approximating width/height 0.55, without stretching an existing image.
- Matte tactile cut-paper appearance; no glow, smoke, ground or cast shadow.

## References

- Approved refined Launch Window concept, exec-ef7e2b46-a3b7-42ff-98ee-de2ff83256f8.png.
- Existing identity reference: public/assets/hero/15-rocket-body.png.

## Result and validation

- Source: `/Users/luke/.codex/generated_images/01a1776a-6ae6-7ac0-82b8-844a1240c3c6/exec-7bcd76c4-c12e-44f8-b8c7-048c8f974b4f.png`.
- Project asset: `public/assets/hero/hangar/rocket.png`, copied unchanged.
- Canvas: 1024 × 1536 RGBA. Maximum alpha254. 994,606 fully transparent pixels.
- Alpha >=128 silhouette bounds: x73–948, y21–1514, 876 × 1494;
  silhouette width/height0.586, substantially broader than original.
- Any-alpha bounds: x21–1009, y18–1518; extremely faint fringe is outside
  the main silhouette. Sampled apparent preview glow beside nose/body has alpha0.
- Inspected: cream body, three dark teal round windows, rust nose and broad
  symmetric side fins; charcoal engine; no embedded scene, smoke or text.
- Fin tip reaches y1514; 21 transparent pixels below it. Main engine baseline
  is above the pointed central fin, as in the reference.
- Asset is provisional pending inspection within the assembled hero.
