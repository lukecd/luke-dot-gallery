# Approved Relaxation Station captures

Source: `/Users/luke/Documents/luke-dev/relaxation-station/assets/sources/attempts/store-capture-27/`.
The accompanying original manifest identifies the 20 approved captures dated
2026-10-27. All 20 source SHA-256 checksums were verified before export.

The Luke.gallery carousel uses the five manifest entries marked **iPad landscape**:
Splash (`splash-landing-v2`), Tide (`tide-heron-v3`), Rain (`rain-downpour-v1`),
Autumn (`autumn-breeze-v1`), Space (`space-rest-v2`), in that display order.

Each export is 1770×1230 WebP at quality 90, proportionally downsampled from
2360×1640. No cropping, retouching, or composition changes. The existing tablet
display has the same 2360:1640 aspect ratio and uses `object-fit: contain`.
Splash retains the logo and tagline; all four story captures have no controls.
Portrait and Duo variants are not used because this placement is a landscape
tablet at every breakpoint. The original capture folder retains every variant.

## Validation — 2026-10-27

- All five source compositions inspected directly; exported Splash inspected.
- All five exports verified as 1770×1230, with matching gallery paths.
- `npm run lint`, `npm test` (production build), and `git diff --check` passed.
- Browser comparison HTML was blocked because `file:` URLs are disallowed.
- After listing in-app tabs, claiming the existing localhost:3000 preview was
  blocked by the browser URL policy on its `data:` connection-error page.
  No alternate browser or indirect workaround was attempted. The required
  three desktop/mobile carousel passes remain unverified due to this blocker.
