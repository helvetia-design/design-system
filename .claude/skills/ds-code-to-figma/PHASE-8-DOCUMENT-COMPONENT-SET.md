# Phase 8 — Document: Component Set

## Objective

Fill in the right `component` column's single section, "🔒 Component Set", handle the
`inverted`-axis and open-ended content-selection special cases, and finish the whole documentation
frame by appending it into the category page's `Documentation Frames` row. This is the last of the
five documentation sub-phases — once it's done, move on to
[`PHASE-9-REVIEW.md`](PHASE-9-REVIEW.md).

Build this right after Specs is confirmed. Finish it (including the append-and-write-back step at
the end of this file) before Phase 9's visual-regression review, so that review covers the
documentation page too, not just the raw component set.

## Inputs

- "📐 Specs", built and confirmed in [`PHASE-7-DOCUMENT-SPECS.md`](PHASE-7-DOCUMENT-SPECS.md),
  completing the left `documentation` column.
- The real `COMPONENT_SET`(s) built in Phase 3 — including, where applicable, the `Primary`/
  `Inverted` split or the wrapper + Instance Swap library for an open-ended content-selection prop.
- The category page's `Documentation Frames` row (Phase 3/4).

## References

- `🧰 Annotations` page — the `github example` reference frame (background/inspiration only, not
  a literal structural template).
- `conventions/component-set-rendering.md` — stale-bounding-box note, `ABSOLUTE`-positioning
  pitfalls, the "never auto-rehugs" note.
- `conventions/variant-grouping.md`'s "Open-ended content-selection props" section.
- `CHANGELOG.md`'s "Old table-overlay mechanics" section.
- `PHASE-4-DOCUMENT-LAYOUT.md`'s "Cross-cutting build pitfalls" section.

## Instructions

1. Build [🔒 Component Set](#6--component-set) in the right `component` column — **count the real
   crossed axes first** and add row/column labels for any 3+-axis set (never skip this check).
2. If the component has a true `inverted`/dark-context axis, build the normal single frame above
   from the `Primary` set's instances, then apply
   [the stacked-component-sets handling](#handling-an-inverted-axis-one-frame-stacked-component-sets)
   to "🔒 Component Set" only — never build a second frame.
3. If the component has an open-ended content-selection prop (many options, e.g. an icon `name`),
   apply the [wrapper + Instance Swap library handling](#handling-an-open-ended-content-selection-prop-wrapper--instance-swap-library)
   instead of a single plain component set.
4. Iterate on the layout with the user before considering the documentation frame done — the exact
   structure is something to confirm visually (screenshot checkpoints), same as the variant matrix
   itself in Phase 3.
5. **Append the finished frame into the category page's `Documentation Frames` row**
   (`framesRow.appendChild(outerFrame)`), always at the end — never inserted at an
   alphabetically-correct position, never repositioning a sibling component's already-built frame.
   Write the frame's node id back into `<name>.figma.md` (`figmaDocFrameNodeId`).

### 6. "🔒 Component Set"

**Replaces "🔒 Main components" — renamed, and radically simplified: no table chrome at all. Not a
`Section`/`Preview` instance either** — just a bare `Title` instance (`kind=component-set`) plus
the real set. Confirmed live on `Documentaion`'s right column (`Component Sets` →
`Badge`, node `2129:84`):

- **Before building this section, count the real axes on the set being displayed** (every crossed
  variant property — `size`, `state`, `variation`, whatever Phase 2 settled on — not counting a
  structural `inverted`/`brand`/etc. split, which doesn't live on the set itself). **This is a
  required check, not an optional judgment call** — skipping it is a real, confirmed mistake,
  twice over: `ds-spinner`'s Component Set panel (3 real axes: `variation` × `size` ×
  `labelPosition`) first shipped with no labels at all because this check was skipped, caught when
  the user compared it against the `🧰 Annotations` page's own `github example` reference; then
  `ds-logo` (a single `size` axis, one row of 3 variants per top-level set) shipped the same way a
  second time, caught again by the user pointing at the `ds-spinner` precedent. **If the component
  has an `inverted`/`brand`/etc. split (see
  [the stacked-component-sets handling](#handling-an-inverted-axis-one-frame-stacked-component-sets)
  below), count axes and decide on labels independently for each display clone — every clone needs
  the same labels since every clone has the same axis count.**
- **Every `COMPONENT_SET` display in this section gets row/column labels and dashed internal grid
  dividers — no axis count is ever exempt, not even a single-axis set.** An earlier revision of this
  rule skipped labeling entirely for a "2-axis or fewer" set, reasoning that Figma's own native
  variant grid plus its selection-inspector property picker already made the axes legible without
  manual chrome. **This was reversed after `ds-logo` (one axis, `size`) shipped with no labels and
  the user flagged it, pointing back at `ds-spinner`'s labeled panel as the standard every
  component should match** — the inspector's property picker only shows axis names when a variant
  is actively selected in the Figma UI, not in a passive screenshot/read of the documentation page,
  so an unlabeled set is illegible outside an editing session. **Always build the labeled structure
  below, for 1, 2, or 3+ axes alike** — the only thing that changes by axis count is which sides
  get labels (see "Row Labels"/"Column Labels" below: a lone column axis like `ds-logo`'s `size`
  gets Column Labels only, no Row Labels, since there's nothing varying across rows).
- **For a 3+-axis component (the Primer-style nested-matrix case from `PHASE-2-PROPOSE.md`), the
  same labeled structure gets real row/column labels and a dashed internal grid around the
  `COMPONENT_SET`** — nesting is illegible without it. Originally modeled on this file's own
  `github example` reference frame (Badge page, a rebuild of Primer's own Button variant grid),
  then substantially revised after a full build-and-review pass on `ds-spinner`'s real 3-axis set
  (`variation` × `size` × `labelPosition`) surfaced several corrections — **this is the current,
  confirmed mechanism; the `github example` frame is background/inspiration only, not a literal
  structural template anymore.**

  **Overall structure — labels live outside the box, in a real auto-layout wrapper, not overlaid
  on top of it:**

  ```
  Labeled Set              (HORIZONTAL auto-layout, itemSpacing 16, counterAxisAlignItems MIN, HUG)
  ├─ Row Labels            (FIXED 140w × [40 + box height]h, plain frame, manual child x/y)
  └─ Column + Box          (VERTICAL auto-layout, itemSpacing 0, HUG both axes)
     ├─ Column Labels      (FIXED width = box's own width, 40h, plain frame, manual child x/y)
     ├─ <the COMPONENT_SET itself>   (HUG width — see sizing note below)
     └─ Grid               (ABSOLUTE-positioned overlay, same w/h as the box, clipsContent: false)
  ```

  `Labeled Set` is what gets appended in place of a bare `COMPONENT_SET` wherever this section
  would otherwise just drop the set in directly (e.g. inside `main-component`, or inside each
  display clone's position in the stacked-sets panel below) — **always**, regardless of axis count,
  per the "every display gets labels" rule above. For a lone column axis (no row axis at all, e.g.
  `ds-logo`'s single `size` row), the `Row Labels` child is simply omitted — `Labeled Set` then has
  just one child, `Column + Box`.

  **The `COMPONENT_SET` itself hugs its real content width — never `FILL`.** An earlier revision of
  this section set `layoutSizingHorizontal = 'FILL'` on labeled sets (stretching them to fill the
  panel's `minWidth` column), which left a large empty strip to the right of the real content once
  labels moved outside the box — explicitly reversed per user correction. **This "hug, don't
  stretch" rule applies to every labeled set now, at any axis count** — since every `COMPONENT_SET`
  display is labeled (see above), there is no remaining case that still uses `FILL`. Since a
  `COMPONENT_SET` can't genuinely auto-hug (`layoutMode: 'NONE'`, see
  `conventions/component-set-rendering.md`'s stale-bounding-box note), compute the real content
  width/height from its variant children's
  `x`/`y`/`width`/`height` and `resize()` it explicitly, with `layoutSizingHorizontal = 'FIXED'`
  (not `'HUG'`, which only auto-layout frames or their text children can take) — don't leave it at
  whatever default width `combineAsVariants()` or the panel's own `FILL` happened to produce.

  **Build the `Grid` overlay as real sibling children of a plain `layoutMode: 'NONE'` wrapper frame
  around the `COMPONENT_SET`, not as an `ABSOLUTE`-positioned child of an auto-layout parent.**
  Wrap the real `COMPONENT_SET` and the divider rectangles together in one small `Box` frame
  (`figma.createFrame()`, `layoutMode: 'NONE'`, resized to the set's own real content
  width/height, `fills: []`, `clipsContent: false`); append the `COMPONENT_SET` first, then each
  divider rectangle (so dividers render on top), both using plain `x`/`y` — a `NONE`-mode frame's
  children position freely without needing `layoutPositioning = 'ABSOLUTE'` at all, sidestepping
  every pitfall `conventions/component-set-rendering.md` documents for that property (the
  same-script-rollback-on-later-error gotcha, the "must be an auto-layout frame or child of one"
  structural requirement). This is
  simpler and more robust than the older `ABSOLUTE`-overlay-inside-auto-layout technique the ASCII
  sketch above still names (`Grid` as a sibling of `COMPONENT_SET` inside `Column + Box`) — prefer
  the plain-`NONE`-wrapper approach for any new build. (From: `ds-logo`'s Component Set panel,
  2026-10-30 — built this way from the start, no `ABSOLUTE`-overlay issues hit.)

  **Getting the real grid positions — prefer Figma's native `GRID` auto-layout mode, with a manual
  fallback:**
  - Setting `set.layoutMode = 'GRID'` on an already-built, `NONE`-mode variant set can trigger a
    one-time "smart conversion" that auto-arranges the existing variant children into a clean,
    evenly-spaced grid (uniform padding, uniform row/column gap) — confirmed live: converting
    `ds-spinner`'s `Primary` set this way produced `padding: 24` all sides, `gridRowGap: 91`,
    `gridColumnGap: 180`, `gridRowCount: 4`, `gridColumnCount: 2`, with every child repositioned
    onto clean column x-anchors (`26`, `270`) and row y-anchors (`26`, `181`, `336`, `451`) — far
    more reliable than manually computing a packing layout by hand.
  - **This conversion is not reliable — confirmed non-deterministic in the same session.** It
    worked once on `ds-spinner`'s `Primary` set, then failed to reflow on the structurally-identical
    `Inverted` set across many retries (toggling `NONE`→`GRID`, explicitly setting
    `gridRowCount`/`gridColumnCount`, even a freshly-cloned copy) — `layoutMode` reported `'GRID'`
    with no thrown error each time, but children stayed at their old `NONE`-mode positions. **Don't
    burn more than a couple of retries on this.** Fallback: manually set each remaining set's
    children to the exact same `x`/`y` values the first, successfully-converted set ended up with
    (same variant names → same relative position, since both sets share the same variant property
    structure) — then set that set's own `layoutMode` back to `NONE` (manual positions) and
    `resize()` it to the same final `width`/`height` the converted one reported. Visually identical
    result either way; native `GRID` mode is a nice-to-have for ease of computation, not a
    requirement for correctness. (From: `ds-spinner`'s Component Set panel, 2026-10-29.)
  - Whichever path is used, treat the resulting real child `x`/`y`/`width`/`height` values (not a
    hand-sketched idealized spacing) as the source of truth for every label/grid-line position
    computed below.

  **Column/row label positions — symmetric midpoint of each region, not the raw content bounding
  box.** Compute each divider's position first (see Grid below), then center each label within the
  region its divider boundaries define — e.g. column 1's label centers between the box's own left
  padding edge and the column divider; column 2's label centers between that divider and the box's
  right padding edge. Same for row groups. This reads as evenly spaced even when the real content
  in different columns/rows has different widths/heights (as `ds-spinner`'s `size=base`/`size=sm`
  content does).

  **A component with only one axis total (e.g. `ds-logo`'s lone `size` axis) has no row axis at
  all — omit `Row Labels` entirely** (don't build an empty/placeholder bracket column) and lay the
  variants out in a single row, with just `Column Labels` above it and dashed vertical dividers
  between cells; no horizontal divider is needed since there's only one row.

  **Row Labels** (`Baloise`-free — this label system intentionally uses `Inter Medium`, `12px`,
  matching the `github example` reference's own typography, not this file's usual Baloise
  families): for each outer-axis value (e.g. `Logo`, `Circle`), one text label plus one `Bracket`
  — a `FRAME`, no fill, `strokeAlign: 'INSIDE'`, **`top`/`bottom`/`left` strokes at weight `2`**
  (matching the `COMPONENT_SET`'s own 2px dashed outer border — not `1`, corrected per explicit
  request), `right` at `0` (opens toward the content). For each inner-axis value (e.g. `Right`,
  `Bottom`), text only, no bracket, positioned at that row's own center. **Where two adjacent outer
  brackets meet at a shared boundary (e.g. `Logo`'s bottom edge and `Circle`'s top edge), leave a
  4px gap instead of letting them touch or form one continuous line** — shorten each bracket by 2px
  on its facing edge. All label/bracket colors: `{r: 0.592, g: 0.278, b: 1}` literal purple (Primary
  display), `{r: 0.745, g: 0.51, b: 0.98}` literal lighter purple (Inverted display, for contrast
  against the dark fill) — not yet bound Figma Variables; bind one if/when this label system gets a
  token owner.

  **Column Labels**: one text label per column value (e.g. `Base`, `SM`), no bracket (a single-level
  column axis never gets one — see the standing rule below), centered per the symmetric-midpoint
  rule above, in a `40`px-tall strip directly above the box.

  **Grid — dashed internal separators only, stretched edge-to-edge with the box, no separate outer
  perimeter.** The `COMPONENT_SET`'s own existing 2px dashed border already frames the whole grid —
  don't draw a second perimeter around the internal cells. Build only the internal dividers (one
  per boundary between adjacent rows/columns), each stretched to **meet the box's own edges with
  zero gap** (full box width for horizontal dividers, full box height for the vertical divider) —
  not inset by any margin. All dividers: **2px** weight (matching the outer border and the row
  brackets — not `1`), `dashPattern: [10, 5]`, same literal purple as the labels.
  - **Build the vertical divider as a thin stroked `RECTANGLE`, never a rotated `LINE`.** A rotated
    `LINE` node (`resize()` to its length, then `rotation = -90`) can silently fail to render inside
    this overlay even when its `absoluteTransform` is independently verified mathematically correct
    (confirmed: checked start/end coordinates matched the intended vertical segment exactly, yet
    the line was invisible across five identical re-screenshots) — suspected pre-rotation
    bounding-box clip-testing bug. **Working alternative**: a `RECTANGLE` with `fills: []`, a near-
    zero `width` (e.g. `0.01`), the divider's real height, and only `strokeLeftWeight` set (others
    `0`) — draws identically to a vertical dashed line with none of the rotated-`LINE` rendering
    risk. Horizontal dividers render fine as plain (non-rotated) `LINE` nodes — this issue is
    specific to rotation. (From: `ds-spinner`'s Component Set panel, 2026-10-29.)
  - The `Grid` overlay frame itself needs `clipsContent: false` — its own bounding box is sized to
    match the box exactly, so anything drawn right at its edges (per the "meet the box's own edges
    with zero gap" rule above) sits exactly on the clip boundary and can get inconsistently
    clipped otherwise.
  - **Inner axes never get a bracket** — text only, positioned at that axis value's row/column
    center. Only the single outermost axis per side (the one Phase 2 placed furthest out in the
    nesting order) gets the bracket treatment, sized to span its whole group's row/column extent
    (with the 4px meeting-gap rule above applied between adjacent outer groups).
  - **A 2-axis component's single row axis and single column axis don't get brackets either** —
    a bracket signals "these rows/columns are grouped under me," which only means something once
    there's an inner axis nested beneath it. One axis per side still gets a plain text label (no
    bracket) if its value isn't otherwise obvious from the cells themselves, same visual weight as
    an inner axis label in the 3+-axis case.
  - **Labelling individual cells (not just axis rows/columns) remains out of scope** — this is
    row/column-header labelling only, not a return to full per-cell table chrome.
  - **For a stacked `inverted` panel** (see
    [the stacked-component-sets handling](#handling-an-inverted-axis-one-frame-stacked-component-sets)
    below), build the full `Labeled Set` wrapper independently for both the `Primary` and
    `Inverted` display clones — both need identical labels/grid geometry, since `inverted` only
    changes color, never which axes exist or where variants sit.

- **The section wrapper (`main-component`)**: `VERTICAL` auto-layout, padding `40` on all sides,
  `itemSpacing: 16`, `primaryAxisSizingMode: 'AUTO'` (hug height), two children: the section heading
  (`"🔒 Component Set"`, 28px Bold `Baloise Create Headline`, `Alias/Text/Color/Primary` — same
  heading style as every other section) and the real `COMPONENT_SET` directly below it.
- **The real master `COMPONENT_SET` is placed as a normal, non-absolute auto-layout child** —
  confirmed live: `layoutPositioning: 'AUTO'`, `layoutSizingHorizontal: 'FILL'`,
  `layoutSizingVertical: 'FIXED'` (resized to its real content height, `540` on `ds-badge`). This is
  a major simplification over the old template's `ABSOLUTE`-auto-layout-child-overlaid-on-table-
  chrome mechanism (see `CHANGELOG.md`'s "Old table-overlay mechanics" section for that history) —
  there is no table to align against anymore, so the set just flows normally as the wrapper's second
  child. `appendChild` the real set into `main-component`, then `set.layoutSizingHorizontal =
'FILL'` and `set.resize(set.width, set.height)` (or a deliberately chosen height) as needed.
- **Visual chrome lives on the set itself, not a separate wrapper box**: fill white, **2px dashed**
  stroke (`dashPattern: [10, 5]`) bound to `🌐 Global/🌈 Color/Purple/4`, `cornerRadius: 5`. Set these
  directly on the `COMPONENT_SET` node — there is no separate dashed-border frame wrapping it.
- **Internal arrangement of the set's variant children is whatever `combineAsVariants()` produced
  natively** (Figma's own default variant grid — one axis stepping across x, the other stepping down
  y, in property-definition order) — don't compute or bake any custom cell-centering math for this
  section anymore, unlike the old template's one-time-baked local positions. If the set's children
  need repositioning for readability, treat it as adjusting the real master set's own layout, not as
  a documentation-page concern.
- **The `COMPONENT_SET` stays unlocked** — this is a change from the old template, which locked
  the set once to stop a human dragging the whole grid out of alignment inside hand-built table
  chrome. That protection no longer applies: there's no table geometry to misalign, the set is
  just a normal auto-layout child of its section wrapper, and leaving it unlocked lets a human
  select, inspect, or rearrange individual variants directly in the Figma UI. Don't set
  `locked: true` on it when building or editing this section.
- **Still apply the standing rules that don't depend on table chrome**: never move a variant out
  of its own set (`figma.combineAsVariants()` + manual `key=value` renaming if a round-trip is
  ever needed), and re-verify the set's own `width`/`height` explicitly after any repositioning of
  its children (a `COMPONENT_SET` never auto-rehugs — see `conventions/component-set-rendering.md`).
- **The set's `FILL` width (step above) is what the `Component Sets` column's own `minWidth=1000`
  sizing (see "2. Body — 2-column layout and column sizing") exists to support** — the column
  `HUG`s to its content with a 1000px floor and symmetric 40px padding on all sides, so the set's
  `FILL` width always has real room to flow into (`920` at the floor, `1000 - 40 - 40`) and grows
  automatically alongside the column if the real set ever needs more than 1000px. Don't hardcode a
  width on the set itself to "make room" — that's the column's job, not this section's. **This
  `FILL` rule is for the plain, unlabeled (2-axis) case only** — a labeled 3+-axis set uses `HUG`
  instead, per the "hug, don't stretch" rule above; the two cases intentionally size differently.
- **If the component has an open-ended content-selection prop** (see
  [wrapper + Instance Swap library](#handling-an-open-ended-content-selection-prop-wrapper--instance-swap-library)),
  this section shows the real wrapper set's own native arrangement the same way — not N separate
  per-option tables, same as before, just without any table chrome now either.

### Handling an `inverted` axis (one frame, stacked component sets)

**SUPERSEDED, 2026-10-29, same day as the category-page rebuild — a component with a true
`inverted`/dark-context axis still gets exactly ONE documentation frame, never two.** An earlier
revision of this section (built once, live on `ds-spinner`, then explicitly reversed per user
correction) tried a two-frame side-by-side split, each frame independently getting the full
header + 2-column body. **This is wrong and must not be repeated**: under the category-page
scheme, "one documentation frame per component" is a hard invariant — a second full frame for
`inverted` broke it, showing up as two separate cards in the `Documentation Frames` row for what
is still conceptually one component. Confirmed corrected live on `ds-spinner`.

**`inverted` still must not be a Figma variant property on one shared component set** — split any
component with a true `inverted`/dark-context axis into **two separate top-level component sets**
(`<Component>/Primary` and `<Component>/Inverted`), same reasoning as always (different token
values across every text/fill layer, not just one swappable paint). What changed is **where those
two sets are shown**: both live inside the **same single documentation frame's "🔒 Component Set"
panel**, stacked vertically, each under its own small sub-label — not two separate frames.

- Build the documentation frame exactly like any other component — **once** — using the `Primary`
  set's real instances for Copy me/Anatomy/Specs (the `Inverted` set's instances don't get
  their own copies of these sections; geometry and content are identical, only Component Set colors
  differ).
- In "🔒 Component Set", after the `Title` instance, append: a plain text sub-label **`Primary`**
  (`Baloise Create Text` Bold, 14px, fill bound to `🔗 Alias/🔤 Text/Color/Primary` —
  `VariableID:137:288`, never a hardcoded black/navy literal, see `conventions/build-mechanics.md`'s
  "Color and paint" section) directly above the `Primary` display clone (white fill,
  dashed-purple chrome, same as the plain case), then a second sub-label **`Inverted`** directly
  above the `Inverted` display clone — **the only element that uses the dark
  `Alias/Surface/Primary` (`VariableID:137:2764`) background in this whole scheme**, swapped
  directly onto the cloned `COMPONENT_SET`'s own `fills` (dashed-purple stroke unchanged). Both
  sub-labels get `layoutSizingHorizontal = 'HUG'`. **Every display clone, at any axis count
  (including a single `size`-only axis), is wrapped in its own full `Labeled Set` structure**
  (row/column labels as applicable, dashed internal grid — see
  [6. "🔒 Component Set"](#6--component-set) above), and that wrapper `HUG`s its own real content
  width rather than `FILL`ing the panel. `Primary` and `Inverted` (or any other structural split,
  e.g. `ds-logo`'s `brand` × `color`) use identical sizing mode and identical label/grid geometry
  across every clone — only color differs between them.
- **No other section gets a dark-preview-surface treatment anymore** — Copy me, Anatomy, and Specs
  all stay on their normal light `Preview` chrome, showing only `Primary`-variant
  instances. The old "minimal-dark-theming" rule (swap the Copy me box to
  dark too) is dropped along with the two-frame split it was built for.
- The frame's header `kicker` stays the plain `"Core / <Category>"` — no `" · Inverted"` suffix,
  since there's no second frame to disambiguate from anymore.

This also surfaces the same real bug worth checking for every time: does the master component's own
`inverted=true` variant actually have every text element recolored for dark-context contrast? Fix
any such gap in the master component, not with a per-instance override.

### Handling an open-ended content-selection prop (wrapper + Instance Swap library)

Unchanged by the 2026-10-29 restructure — see `conventions/variant-grouping.md`'s
"Open-ended content-selection props" section for the full wrapper-`COMPONENT_SET` + Instance Swap library
pattern, its fallback (N separate top-level sets), and every build pitfall (multi-vector glyph
flattening, `<clipPath>` stripping, per-row dark-preview backgrounds for invisible token-swap
options). The only change under the new template: "🔒 Component Set" (ⁿée "Main components") shows
the real wrapper set's own native arrangement with no table chrome, same as the plain case above —
and the separate "🖼️ \<Plural noun\> names" browsing section for the content axis itself still gets
built, in the right column below "🔒 Component Set", same mechanism as before.

See `PHASE-4-DOCUMENT-LAYOUT.md`'s "Cross-cutting build pitfalls" section for build gotchas that apply here too.

## Output

- A "🔒 Component Set" panel in the right `component` column — labeled per the axis-count rules
  above, with the stacked `Primary`/`Inverted` handling or the Instance Swap wrapper handling
  applied where the component needs them.
- The finished documentation frame, appended as the last child of the category page's
  `Documentation Frames` row.
- The frame's node id, written back into `<name>.figma.md` (`figmaDocFrameNodeId`).

## Completion Criteria

- The real axis count was checked, and every `COMPONENT_SET` display is labeled (row/column
  labels + dashed grid) regardless of axis count — never skipped for a "simple" 1- or 2-axis set.
- A true `inverted` axis produces exactly one documentation frame with both sets stacked inside
  "🔒 Component Set" — never two frames.
- The layout was iterated on and confirmed with the user via screenshot checkpoints.
- The finished frame is appended (never inserted out of order) into the `Documentation Frames`
  row, and its node id is written back into `<name>.figma.md`.

## Next Phase

Proceed to [`PHASE-9-REVIEW.md`](PHASE-9-REVIEW.md) once the documentation frame is complete and
appended, and the page has been iterated on with the user (step 4 above).
