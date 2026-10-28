# Launch artwork and motion

## Publication approval — 2026-10-28

Luke reviewed the local project sizing, continuous launch smoke, and revised
landing from the top of the screen, then explicitly requested pushing all these
updates to main. Lint and production build passed on the final code. Automated
browser verification remains blocked as recorded below; user visual approval
is distinct from the outstanding automated three-pass checks.

## Paper exhaust extension, 2026-10-27

Generated with built-in ImageGen using the existing `rocket-smoke-sprite.png`
as the material/color reference. Exact working prompt and acceptance criteria
are in the **Launch exhaust extension** entry in root `prompts.md`.

Source: `/Users/luke/.codex/generated_images/01a176b7-7a96-7832-bb5e-b84cf98c2b55/exec-bee00820-3847-4d1a-b3eb-5e364c9117fa.png`.
Retained unchanged as `rocket-exhaust-paper-v1.png`; delivery asset is the
lossless `rocket-exhaust-paper-v1.webp` (1024×1536). No artwork edits or cropping.
Both have a genuine alpha channel. Source alpha spans 0–254, with 1,062,182
fully transparent pixels. The dark/glowing RGB around the source preview is
transparent, not a painted backdrop. The exported alpha matches the source.

Texture, palette and isolated silhouette are provisionally accepted. Existing
ground smoke is unchanged. It grows to 1.55× around its registered y=461/512
ground origin, then drifts upward only during late dissipation.

### Plume connection correction, 2026-10-28

Luke's screenshot rejected the original assembly: a fixed-length plume moved
with the rocket, exposing a gap and a flat, floating foot above the ground cloud.
The artwork itself is reused unchanged; no new raster generation or editing.

`RocketExhaust` now sits beside the flight layer. Its top follows the engine
(88% of the rocket anchor plus the shared lift), while its bottom follows the
ground cloud (98% of the anchor plus the shared drift). The visible alpha bounds
y=80–1491 map to these endpoints. The image keeps its original 2:3 ratio as it
grows, rather than stretching its paper texture vertically. The ground cloud
renders in front; a lower overlap mask avoids exposing the plume's flat foot.
The exhaust fades over progress .70–.90, while the ground cloud lasts to .94.
The obsolete independent exhaust scale has been removed.

The approved project-image sizing is unaffected by this correction.

Launch scroll timing (viewport units): ignition .22; liftoff .42–.72; hangar
fade .66–.86; ground cloud fade .70–.94. Previously ground smoke disappeared
instantly at .62 and liftoff ended at .62. Reduced-motion CSS hides both smoke
layers and retains the existing stationary rocket treatment. Contact landing
smoke timing and artwork are unchanged.

## Verification

### Landing sequence, 2026-10-28

The contact landing reuses the unchanged paper plume through `PaperExhaust`,
which also retains the approved launch artwork mapping. No assets were generated.
Local contact progress 0–1 now has these phases:

- Descent .18–.84, easing out to a stationary touchdown. The initial offset is
  110dvh, putting the entire rocket above the top edge even on tall screens.
  Opacity switches directly to 1 at .18 while still offscreen; no entrance fade.
  The pad reveal/scale belongs only to the pad artwork, not the rocket's parent.
- Engine exhaust appears .20–.28, shortens while braking .60–.84, and shuts
  off .78–.84. Its maximum length is 55% of rocket height; the engine-to-pad
  distance caps it so it cannot extend through the floor.
- Ground cloud grows .58–.86, at a width of 38% of the pad and scale .65–1.12.
  Its registered ground origin stays fixed at the rocket's touchdown baseline.
- The full cloud remains through touchdown, then fades .86–1.00 without
  reversing through smaller sprite frames. Contact form timing stays unchanged.
- Reduced motion hides exhaust and cloud and removes the rocket's descent.

Lint and production build passed. Assertions passed for 1,001 forward/reverse
landing states and 4,004 floor-clearance samples, including early exhaust,
ground smoke before touchdown, smoke persisting afterward, and complete clearing
at the end. Representative launch states also passed after shared easing/artwork
extraction. Browser inspection remains blocked by the recorded approval denial;
it was not retried or bypassed. Three clean visual passes remain outstanding.
This landing change is local and not published.

After Luke's screenshots showed a late, translucent entrance, the viewport-based
approach replaced the original 165%-of-rocket-height offset. Geometry checks
passed at 7,007 scroll/viewport combinations: fully offscreen start, opaque
entry, monotonic descent, exact touchdown and floor clearance. Ground cloud
timing and scale match the preceding landing version. Production build passed;
browser checks remain blocked by the same recorded policy limitation.

2026-10-28 correction:

- Lint and production build passed. The first restricted build could not fetch
  Google Fonts; the approved network-enabled rerun succeeded.
- Geometry assertions passed at 5,005 scroll/viewport samples covering phones,
  portrait tablet, landscape iPad and desktop. The source alpha endpoints track
  the engine and ground exactly; dimensions remain positive; opacity is bounded
  and the trail is gone at progress .90. These are code checks, not visual proof.
- Browser inventory found the newly loaded local preview tab. Acquiring that
  tab was rejected by automatic approval review as a retry of the earlier local
  preview denial. No alternate browser or indirect workaround was attempted.
  Three clean forward/reverse browser passes remain blocked; the assembled
  animation is therefore still pending visual validation. Not published.

Earlier extension checks:

- Lint, production build, and diff whitespace checks passed.
- Timing assertions passed across 1,001 scroll positions: finite values,
  bounded opacity and sprite indices, continuous fades, monotonic lift/growth,
  grounded early cloud, cloud surviving scenery, and no launch effects at 1.0.
- An initial test assertion distinguished -0 from 0; corrected the assertion
  to numeric equality without changing implementation.
- Full composition and three forward/reverse desktop/mobile browser passes are
  **not verified**. The existing local tab remains on the same connection-error
  page whose `data:` URL was denied by Browser Use policy in the earlier turn.
  Tab inventory confirmed that unchanged state; no bypass or alternate browser
  was attempted. No production publication was performed for this update.
