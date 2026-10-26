# Social preview image

Selected direction: option 2, Liftoff, from the social-preview concept set on
2026-10-26. Selection refers to the second displayed generated image, not the
earlier homepage hero concepts.

Source (retained unchanged):
`/Users/luke/.codex/generated_images/01a176b7-7a96-7832-bb5e-b84cf98c2b55/exec-a9429da5-974f-4ca6-afbe-dfb0a0b5421f.png`

Delivery asset: `liftoff-card.jpg`, 1200×630, JPEG quality90/MozJPEG. The selected
image was only resized and minimally center-cropped to the delivery ratio;
no illustration, typography, color, or content was regenerated or repainted.

Shared Open Graph and Twitter large-image metadata in `app/layout.tsx` uses
this local asset, with explicit dimensions and alternative text. Exact creative
prompt is in the social-preview section of `prompts.md`.

Validation on 2026-10-26: lint and production build passed. Production HTML
contains the absolute Open Graph/Twitter image URLs, 1200×630 dimensions and
large-image card type. Three consecutive browser checks after reload at
1200px, 600px and 360px widths passed: artwork and lettering remain intact,
with readable headings and no unintended cropping. Local page metadata also
matches the production output.
