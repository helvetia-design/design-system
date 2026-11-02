# Phase 7 — Document: Specs

## Objective

Fill in the last section of the left `documentation` column: "📐 Specs". Specs is always the last
section of the left column — the "🛠 Variants" section that historically followed it has been
retired.

Build this right after Anatomy (or right after Copy me, if Anatomy was skipped), before
[`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md).

## Inputs

- "🏗️ Anatomy" (or "👉 Copy me", if Anatomy was skipped), built and confirmed in
  [`PHASE-6-DOCUMENT-ANATOMY.md`](PHASE-6-DOCUMENT-ANATOMY.md).
- `<name>.figma.md`'s `specs:` list from Phase 1 — the values (fixed or min width/height,
  padding/gaps, fixed sizes of nested elements, radius, border width, typography) per option of
  the Variants axis.

## References

- `PHASE-4-DOCUMENT-LAYOUT.md`'s "0. Shared `Section`/`Preview`/`Title` components" section.
- `PHASE-4-DOCUMENT-LAYOUT.md`'s "2. Body — 2-column layout and column sizing" section.
- `PHASE-4-DOCUMENT-LAYOUT.md`'s "Cross-cutting build pitfalls" section.
- `🧰 Annotations` page, node `2046:5` — the `Spec/*` annotation components.
- `conventions/build-mechanics.md`'s "Color and paint" section.
- `PHASE-8-DOCUMENT-COMPONENT-SET.md`'s "Handling an `inverted` axis" section.

## Instructions

**Moved from its old end-of-page position to directly after Anatomy, now the last left-column
section (the "🛠 Variants" section that used to follow it has been retired), per explicit
request (2026-10-29).** The developer-handoff reference content itself (dimensions, padding/gaps,
radius, typography annotations) is otherwise unchanged from the prior template — one card per
Variants-axis option, using the shared `Spec/*` annotation components on the `🧰 Annotations` page
(node `2046:5`).

**Structure: a `Section` instance in `Flat` variant** (`Title` set to `kind=specs`) **as the outer
zero-inset container, with one nested `Preview` instance in `Default` variant per Variants-axis
option**, stacked vertically inside that outer slot (confirmed live on `Documentaion`: three
nested `Preview`s for `ds-badge`'s `base`/`lg`/`sm`). Each nested `Preview`'s own slot holds that
option's `preview`/`stage`/`legend` card — same annotation-component table, marker-order rule, and
legend-row rules as before, just nested one level deeper than Anatomy's single nested panel. **Each
card's own title text (`"base"`/`"sm"`/`"lg"`) binds its fill to `🔗 Alias/🔤 Text/Color/Primary`
(`VariableID:137:288`)** — same rule as every other skill-authored label, see
`conventions/build-mechanics.md`'s "Color and paint" section.

**Every nested `Preview` here uses `layoutSizingHorizontal = 'FILL'`** (per the standing rule in
`PHASE-4-DOCUMENT-LAYOUT.md`'s "0. Shared `Section`/`Preview`/`Title` components" section), and
**the card frame built inside each nested `Preview`'s own slot must be resized to match that
slot's real width (`resize(656, ...)`, `x = 0`) — don't leave it at a wider literal width from an
earlier fixed-size workaround.** A wider card frame gets auto-centered by the slot, pushing its
`x` negative and clipping the card's own label text (`"base"`/`"lg"`/`"sm"`) off the left edge —
confirmed as a real regression during this template's dry run, caused by exactly this mismatch
after switching the nested `Preview` from a fixed `resize()` to `FILL`. **Each nested `Preview`'s
own height must end up `layoutSizingVertical: 'HUG'`, not `FIXED`** — see the flexible-height
sequence (`resize()` then `primaryAxisSizingMode = 'AUTO'; layoutSizingVertical = 'HUG'`) in
`PHASE-4-DOCUMENT-LAYOUT.md`'s "0. Shared `Section`/`Preview`/`Title` components" section above;
apply it to every one of the per-option nested `Preview`s here, not just the first.

**Specs always uses the `Primary` set's instances/values**, even on an `inverted`-split component
— an `inverted` split changes colors, not geometry, so showing `Inverted`-set numbers here would
just repeat identical figures. There's only one frame/one Specs section per component now either
way (see `PHASE-8-DOCUMENT-COMPONENT-SET.md`'s "Handling an `inverted` axis" section).

**The "last child of the outer frame" positioning rule from the old spec no longer applies** — since
Specs now sits inside the left `documentation` column as a normal stacked child (same as every other
left-column section), not as the final child of the whole outer frame.

Append this `Section` instance as the last child of the left `documentation` column (see
`PHASE-4-DOCUMENT-LAYOUT.md`'s "2. Body — 2-column layout and column sizing" section). Iterate on
it with the user (screenshot checkpoint) before moving on.

## Output

- A "📐 Specs" `Section` instance, with one nested `Default`-variant `Preview` per Variants-axis
  option, appended as the last child of the left `documentation` column.

## Completion Criteria

- The `Section` instance uses `kind=specs` and `Flat` variant, with one nested `Default`-variant
  `Preview` per Variants-axis option.
- Every nested `Preview` is `FILL` width and ends up `HUG` height; every card frame is resized to
  match its slot's real width (`x = 0`, no clipped label text).
- Specs shows the `Primary` set's instances/values only, never `Inverted`.
- The section has been iterated on and confirmed with the user via a screenshot checkpoint.

## Next Phase

Proceed to [`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md) once Specs is
built and confirmed. The left column is now complete; the component-set phase fills in the right
column and finishes this documentation frame.
