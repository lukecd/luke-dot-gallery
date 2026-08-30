# Image Prompt Library

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
