# VERATIS Final Refinement Pass

A surgical elevation pass. The site is already strong — this phase tightens hierarchy, restrains teal, reframes copy, and pushes the verification system to the center of the brand. No redesigns, no rewrites of working layouts.

## Scope by file

### 1. Homepage (`src/routes/index.tsx`)
- **Reframe categories**: Recovery → Tissue Recovery · Performance → Performance Research · Cognition → Neuro Research (plus a fourth: Cellular Longevity if grid allows).
- **Remove review/testimonial section** entirely. Replace with an "Operational metrics" strip: lots on record, average purity, pass rate YTD, mean release time, archive depth (years), independent lab partner. Tabular, numeric, no stars, no quotes.
- **Asymmetric rhythm**: nudge one or two evenly-spaced sections off the symmetric grid — e.g. an editorial 7/5 split where currently 6/6, more generous whitespace on the verification band.
- **Reduce decorative teal**: convert non-verification teal accents to ink/charcoal/mist. Keep teal exclusively on verification, COA, batch-status, and lab-partner elements.

### 2. Verification centerpiece (`src/components/site/BatchVerify.tsx` + verify section on home)
- Tighten the dark verification block: increase top/bottom padding rhythm, refine the input (taller, monospace lot field, hairline border, focus ring in primary, inset shadow), refine the submit button (squared, uppercase 0.16em tracking, status dot).
- Add subtle live elements above the input: "Archive: {n} lots · {avg}% mean purity · last release {date}" in monospace micro-type.
- After-submit: show a compact certificate thumbnail preview card (lot, product, purity %, tested date, lab signature line, "Download COA" link) instead of just a result row.
- Add a "Try sample lot PP-2426" affordance under the input as a quiet ghost link.

### 3. Footer (`src/components/site/Footer.tsx`)
- Rebuild as an "end-of-publication" footer: large restrained wordmark, four columns (Catalog / Verification / Standards / Company), a top-row "Verify batch" quick-lookup input, a bottom utility rail with ISO 17025 / A2LA cert / lab partner / lot count / "For research use only".
- Hairline dividers, generous vertical rhythm, ink background or warm-white with ink type — pick whichever contrasts the page above. Numbers in tabular monospace.

### 4. Visual signature (cross-cutting, minimal new components)
- Introduce a small reusable `LotTag` component (monospace, hairline border, optional status dot) and use it wherever a product is referenced on the homepage and category cards — establishes the serialized fingerprint.
- Introduce a hairline "archive index" micro-strip (`PP-2426 · PP-2419 · PP-2411 …`) that can sit above the verification band as ambient operational realism.

### 5. Color discipline (`src/styles.css`)
- Audit teal usage. Keep `--primary` (teal) reserved for verification semantics. Add (or confirm) `--ink`, `--mist`, neutral accents and migrate decorative teal in homepage/category/hero copy to ink/foreground.

### 6. Typography polish
- Slightly tighter tracking on display headlines (-0.01em to -0.015em), opentype features (`font-feature-settings: "ss01", "tnum", "cv11"` where the font supports it) on numerals and lot codes, ensure all numbers use `tabular-nums`.

## Out of scope
- Header (already refined this session)
- Logo asset (already swapped/sized)
- Routing, data model, backend
- New pages

## Sequence
1. Read current `index.tsx`, `BatchVerify.tsx`, `Footer.tsx`, `styles.css`, `ProductCard.tsx` in parallel.
2. Build `LotTag` + tiny archive-strip helper.
3. Refactor BatchVerify (dark block polish + cert preview + sample-lot hint).
4. Edit homepage: reframe categories, swap reviews → operational metrics, asymmetry tweaks, teal audit.
5. Rebuild footer.
6. Token/typography pass in `styles.css`.
7. Visual QA against preview at current viewport.

This is a single coherent pass — no behavior changes, no new routes, no library additions.