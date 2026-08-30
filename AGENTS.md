# Luke.gallery — Agent Guide

## Project

Luke.gallery is Luke Cassady-Dorion's personal portfolio. It is a Next.js 16,
React 19, TypeScript, and Tailwind CSS project. The product and brand context
lives in [`.agents/product-marketing.md`](.agents/product-marketing.md); read
it before changing public-facing copy or project positioning.

## Working conventions

- Preserve existing user changes. This repository may be in the middle of a
  visual rewrite; do not revert, delete, or overwrite unrelated work.
- Prefer small, focused changes. Reuse existing components, tokens, and assets
  before introducing new patterns or dependencies.
- Use TypeScript throughout. Keep components accessible and responsive, and
  use `next/image` for raster images where it fits the layout.
- Give every distinct visual section, interaction, or reusable piece of UI its
  own named React component. Keep page files focused on composition and
  orchestration rather than accumulating inline JSX, state, or rendering logic.
- Keep one portfolio scene per component file. Reuse only true primitives with
  a stable interface; never use CSS class-name checks to make a supposedly
  shared component render different product-specific designs.
- Follow DRY: extract shared UI, repeated behavior, and repeated constants into
  appropriately named components, hooks, data modules, or utilities. Do not
  duplicate markup, hard-coded values, or scroll/animation calculations across
  components.
- Do not invent claims, metrics, titles, or credentials. Keep portfolio copy
  plain, specific, and unforced. Avoid generic marketing language such as
  “creative technologist,” “cutting-edge,” and “seamless.”
- Keep internal/prototype surfaces such as Three.js studies and assembly pages
  out of public search indexing unless the task explicitly changes that choice.
- Never merge a pull request, merge a branch into `main`, or promote a
  deployment to production. Prepare and push a reviewable branch only; Luke
  performs all merges and production promotions.

## Validation

- Run `npm run lint` after TypeScript, React, or styling changes when practical.
- Run `npm test` for changes that can affect the production render or routes.
- For visual work, inspect the result in a browser at desktop and mobile widths.
- Report any verification not run, along with the reason.
- Do not declare visual or interactive work complete after one pass. Run three
  independent clean browser checks of the relevant flow. Each pass must inspect
  the visible result and the behavior that changes it. If any pass finds a
  defect, fix it and restart the count at the first pass; completion requires
  three consecutive passes with no further changes needed.
- For a user request that says to iterate, keep working, or not stop until a
  visual result succeeds, a failed inspection is an internal loop condition—not
  a handoff point. Do not send a final response, ask for approval, or report
  intermediate work as delivered after any failed visual criterion. Record the
  defect, make the next scoped correction, and restart the three-pass browser
  audit. Only end the task after three consecutive clean passes, unless a real
  external blocker prevents further in-scope work.
- For multi-asset visual work, use this closed-loop control flow:

  1. For each required role, generate or prepare assets until each is
     technically and visually **provisionally** acceptable.
  2. Assemble every provisional asset into the complete composition.
  3. While the complete composition fails, render the required states, identify
     the highest-impact defect, and attribute it to the prompt, generated
     asset, assembly, or evaluator.
  4. For prompt/asset defects, revise the stored working prompt, generate
     replacements, and select the strongest eligible result. For assembly
     defects, revise the assembly data or CSS. For evaluator defects, use an
     approved alternative evaluation strategy.
  5. Reassemble and reevaluate. A provisional asset must be replaced if it
     fails in situ; do not preserve it merely because it passed file-level
     inspection.
  6. Return only when the complete system passes, eight hours of active work
     expire, or a genuine external/contradictory-requirements blocker exists.
- The in-app local preview may already be open. Treat its presence as available
  context; do not ask the user to re-enable it merely because an automated
  browser attempt fails. To inspect it, use the Browser plugin's in-app-browser
  binding, list the user's open tabs, and claim the tab whose URL matches the
  local preview before reusing that claimed tab. Do not describe the preview as
  unavailable without first following that connection path.
- If access to an already-open local preview is denied by the browser safety
  layer, do not retry through another browser, raw browser protocol, or an
  indirect workaround, and do not ask the user to re-enable the preview. State
  that exact policy limitation, preserve the failed check as a verification
  gap, and continue with the strongest available code and asset inspection.

## Audits and recommendations

- When the user asks for an audit, diagnose and present a proposed solution,
  its tradeoffs, and the smallest implementation plan before changing code,
  unless they explicitly ask to implement it in the same request.
- An audit is not a claim that the solution has been implemented or visually
  verified. Keep those stages distinct in the handoff.

## Image generation and editing

Maintain reusable ImageGen prompts and their validation criteria in
[`prompts.md`](prompts.md). When an image prompt is materially revised during
the work, update that entry before using the revision again.

Use the ImageGen tool for any requested raster-image generation or modification.
Do not attempt to synthesize or edit bitmap assets with Python, SVG, CSS, or
another workaround when ImageGen is the appropriate tool.

Treat a finished scene image as an art-direction reference, not a source that
can reliably be deconstructed into production layers. For parallax, depth, or
responsive scene composition, generate the sky/base separately and generate
each movable element as an independently alpha-verified asset. Do not accept a
rendered checkerboard as proof of transparency; verify the exported file's
alpha channel before adding it to the project.

For production sprite sheets, deterministic, non-creative asset preparation is
allowed after ImageGen has created or approved the artwork: crop equal cells,
measure opaque bounds, translate a frame to a documented shared origin, and
pack cells into a local sheet while preserving alpha. Do not use this step to
invent, repaint, inpaint, recolor, erase, or otherwise change the illustrated
content. Keep the source frames, record the anchor and output geometry, and
visually validate the assembled sheet in its standalone preview.

- For a new image, send a complete prompt and omit reference-image parameters.
- For an edit, inspect every local source image first, then pass its local path
  as `referenced_image_paths`. If a source image is only available in the chat,
  include the smallest sufficient number of recent images instead.
- Never provide both local reference paths and recent-chat-image parameters in
  the same request.
- Describe the requested subject, composition, style, lighting, palette, aspect
  ratio, and any elements that must remain unchanged. Be explicit about output
  requirements such as transparent background or no text.
- When ImageGen finishes, present the generated result through the image-result
  display mechanism so the user can see it. Do not merely paste a URL or claim
  an image was made without showing it.
- Use the generated asset only after confirming it is visually suitable; retain
  source material and avoid overwriting an existing asset unless the user asked
  for that replacement.

## Asset references

- All static images used by the site must be local project assets: store public
  files under a clear `public/` subdirectory (normally `public/assets/`) and
  reference them with root-relative paths such as `/assets/hero/01-sky-base.png`,
  or import a colocated local asset when that is more appropriate.
- Never use a GitHub, CDN, third-party, or `/_next/image` URL as an image
  source. Do not hotlink image content, even when the remote file originated in
  this repository.
- Prefer `next/image` for static raster images. A raw `<img>` requires a
  documented, task-specific reason.
- External destination links and explicitly requested media embeds may remain
  external; they are not a substitute for locally hosted image assets.

## Useful commands

```bash
npm run dev    # local Next.js server
npm run lint   # ESLint
npm test       # production build verification
```
