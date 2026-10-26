# Launch Window hero layers

Generated with built-in ImageGen on 2026-10-26. Exact prompts, revisions, and
alpha validation are recorded in the repository's `prompts.md`.

The approved concept is retained at
`audit-output/hangar-hero/selected-reference.png`. It is an art-direction
reference, not the source of cropped production layers.

| Layer | Native size | Transparency / anchor |
| --- | --- | --- |
| frame.png | 1536 × 1024 | RGBA; center alpha 0; main bounds y29–983. Feet meet the apron. |
| terrain.png | 2172 × 724 | RGBA; sky alpha 0; main silhouette starts y297 at left, y631 at center. |
| apron.png | 2172 × 724 | Opaque RGB; top cream step preserved, centered perspective. |
| rocket.png | 1024 × 1536 | RGBA; main bounds x73–948 / y21–1514; baseline at front fin tip. |

Original generated files were copied unchanged. No bitmap painting, alpha
reconstruction, recoloring or creative cropping was used. The apron was revised
through ImageGen to remove an unwanted white band in the first candidate.

`HangarScene` owns their composition. Frame, terrain, apron and rocket remain
separate. Existing sky, stars and smoke sprites are reused. The existing small
traveling rocket and contact landing scene retain their original assets.

Asset sources (retained):
- Frame: `~/.codex/generated_images/01a1776a-6ae6-7ac0-82b8-844a1240c3c6/exec-b5368435-918a-47ba-bfd7-b8ff6883372d.png`
- Terrain: `~/.codex/generated_images/01a1776b-d678-7cc2-a465-eb8d51c13b78/exec-72dc5738-348f-4151-b1dd-9113e09dbd06.png`
- Apron: `~/.codex/generated_images/01a1776c-c932-7570-ae07-748f173d562e/exec-cd46f1bc-a3dc-46d5-8dac-b42ca5b5b252.png`
- Rocket: `~/.codex/generated_images/01a1776a-6ae6-7ac0-82b8-844a1240c3c6/exec-7bcd76c4-c12e-44f8-b8c7-048c8f974b4f.png`

The assembled scene passed three consecutive browser checks after the last
style change: desktop 1586×992, compact 900×620, phone 390×667. Evidence and
interaction checks are in `audit-output/hangar-hero/` and `design-qa.md`.
