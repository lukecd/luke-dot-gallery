# Library accessibility audit — 2 November 2026

Scope: local Books, Connections and What’s next views. Current-run browser screenshots, computed CSS, contrast calculations, keyboard interaction and 320px responsive checks. Target: WCAG 2.2 AA, with larger practical reading sizes than the minimum conformance requirements alone imply.

## Changes completed

Removed the caveat after the discovery count; it now reads “4 books”. Removed the catalog-coverage caveat, the defensive comparison of subject links versus plot similarity, and “yet” wording in empty states. Retained actual unknown dates and actionable storage-error messages. No typography, colors or accessibility behavior changed during this audit.

Lint and production build passed. Three clean copy-verification passes: desktop discovery count/source disclosure; desktop connection disclosure; mobile discovery after reload and filter navigation. Accessibility defects below are findings, not fixed or claimed compliant.

## Findings and smallest fix plan

1. **High: important content is set at 9–11px.** Books uses 10px author names/purchase dates and 9px series labels. Connections uses 10px author names, reasons and counts; some reasons/counts drop to 9px on mobile. Discovery uses 10px reasons, publication metadata and action text, 11px authors. These are primary reading information, not fine print. Set normal text and controls to 16px, secondary metadata to at least 14px. Use rem values and remove mobile rules that shrink text. Keep the existing display headings and palette. Monospace can remain for short labels; use the site's body sans serif for longer explanations if increasing size alone still feels tiring.

2. **High: selected connection counts fail text contrast.** `#f5eedb` at 70% opacity over `#356b68` composites to approximately 3.46:1. Normal-size text requires 4.5:1. Remove the count opacity; the unmodified color pair is 5.25:1. Other measured pairs: muted text on paper 5.05:1; muted text on discovery cards 4.70:1; teal reasons on discovery cards 4.88:1; ink on paper 12.76:1. These pass minimum contrast, but small light strokes still make them uncomfortable to read. Darken secondary text to provide more headroom, aiming for 7:1 for sustained reading. Rust on paper is only 4.53:1; audit its hover/card combinations when adjusting tokens.

3. **Medium: action targets feel cramped.** Discovery action buttons are 27px high; author links have roughly 14px-high bounding boxes. Main discovery filters are about 34px high. The action buttons meet the 24px AA minimum, so this is not a blanket target-size failure. Use at least 44px-high primary controls for comfortable touch use, and increase author-link line height. Evaluate spacing exceptions for inline links individually.

4. **Medium: hiding a book loses keyboard focus.** Activating Already read with Enter removes the card and leaves `document.activeElement` on BODY. There is no status/live region in the discovery view to announce the change. Move focus to the next card action (or results heading when no card remains), and announce a short result such as “Children of Ruin marked read.” Add book-specific accessible names to repeated Save/Undo/About links where helpful. Check the same behavior for Not interested and Undo.

Implementation order: shared library font/color tokens → apply across all three views and adjust grid density → control spacing and focus handling → recheck contrast, keyboard flow, 200% zoom and narrow layouts. Larger type will mean fewer cards per row and taller cards; accept that tradeoff instead of shrinking metadata again. No new page structure or backend is needed.

## Flow evidence

### 1. What’s next — functional, poor small-text readability

Filters work, button state is exposed with aria-pressed, and a visible 3px keyboard focus ring appears when tabbing between filters. Count/source copy is now direct. Keyboard removal of a card loses focus, as noted above.

![Discovery](/Users/luke/Documents/luke-dev/luke-dot-gallery/audit-output/books/accessibility/01-discovery.jpg)

![Discovery at 320px with keyboard focus](/Users/luke/Documents/luke-dev/luke-dot-gallery/audit-output/books/accessibility/05-discovery-mobile.jpg)

### 2. Books — functional, dates and authors undersized

Book buttons and author links have accessible names, search has a label, and collection results use a status region. Titles are readable, but the metadata needed to understand the collection is visually subordinate to the point of being difficult to read.

![Books](/Users/luke/Documents/luke-dev/luke-dot-gallery/audit-output/books/accessibility/02-books.jpg)

### 3. Connections — functional, undersized labels and a contrast failure

Book selection and subject filters work. Source explanation is now factual. The selected count's opacity causes a contrast failure. At 320px, the sampled page reflows without horizontal document overflow, but some supporting text drops to 9px.

![Connections](/Users/luke/Documents/luke-dev/luke-dot-gallery/audit-output/books/accessibility/03-connections.jpg)

![Connections at 320px](/Users/luke/Documents/luke-dev/luke-dot-gallery/audit-output/books/accessibility/04-connections-mobile.jpg)

## Verification limits

This was a manual, scoped audit, not a full WCAG certification. No assistive-technology screen-reader session, OS high-contrast mode, browser text-only resizing, 200% browser zoom or automated axe run was performed. The 320px check is responsive reflow evidence, not a substitute for zoom testing. Contrast calculations use computed flat colors; book-cover artwork was not treated as UI text. Test preference changes were undone and the viewport was restored.

References: [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [target size minimum and exceptions](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [200% text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).
