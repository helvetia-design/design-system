# Phase 8 — Document: Specs

## Objective

Fill in the last section of the `Documentation` column: "📐 Specs". Specs is always the last
section of the left column — the "🛠 Variants" section that historically followed it has been
retired.

Build this right after Anatomy (or right after Copy me, if the Anatomy placeholder was deleted). This
is the last phase of the skill.

## Inputs

- "🏗️ Anatomy" (or "👉 Copy me", if the Anatomy placeholder was deleted), built and confirmed in
  [`PHASE-7-DOCUMENT-ANATOMY.md`](PHASE-7-DOCUMENT-ANATOMY.md).
- `<name>.figma.md`'s `specs:` list from Phase 1 — the values (fixed or min width/height,
  padding/gaps, fixed sizes of nested elements, radius, border width, typography) per option of
  the Variants axis.

## References

- `conventions/document-sections.md`.
- `PHASE-3-BUILD.md`'s cloned frame (`body` › `Documentation` / `Component Sets` columns).
- `conventions/build-mechanics.md`.
- `🧰 Annotations` page, node `2046:5` — the `Spec/*` annotation components.
- `conventions/build-mechanics.md`'s "Color and paint" section.
- `PHASE-3-BUILD.md`'s "Labeled component set" section (stacks per split).

## Instructions

**Moved from its old end-of-page position to directly after Anatomy, now the last left-column
section (the "🛠 Variants" section that used to follow it has been retired), per explicit
request (2026-10-29).** The developer-handoff reference content itself (dimensions, padding/gaps,
radius, typography annotations) is otherwise unchanged from the prior template — one card per
Variants-axis option, using the shared `Spec/*` annotation components on the `🧰 Annotations` page
(node `2046:5`).

**Structure: fill the `Section` placeholder whose `Title` is `kind=specs` (`Flat` variant; hard stop
if missing)** — don't create a new one — **as the outer zero-inset container, with one nested `Preview` instance in `Default` variant per Variants-axis
option**, stacked vertically inside that outer slot (confirmed live on `Documentaion`: three
nested `Preview`s for `ds-badge`'s `base`/`lg`/`sm`). Each nested `Preview`'s own slot holds that
option's `preview`/`stage`/`legend` card — same annotation-component table, marker-order rule, and
legend-row rules as before, just nested one level deeper than Anatomy's single nested panel. **Each
card's own title text (`"base"`/`"sm"`/`"lg"`) binds its fill to `🔗 Alias/🔤 Text/Color/Primary`
(`VariableID:137:288`)** — same rule as every other skill-authored label, see
`conventions/build-mechanics.md`'s "Color and paint" section.

**Every nested `Preview` here uses `layoutSizingHorizontal = 'FILL'`** (per the standing rule in
`conventions/document-sections.md`), and
**the card frame built inside each nested `Preview`'s own slot must be resized to match that
slot's real width (`resize(656, ...)`, `x = 0`) — don't leave it at a wider literal width from an
earlier fixed-size workaround.** A wider card frame gets auto-centered by the slot, pushing its
`x` negative and clipping the card's own label text (`"base"`/`"lg"`/`"sm"`) off the left edge —
confirmed as a real regression during this template's dry run, caused by exactly this mismatch
after switching the nested `Preview` from a fixed `resize()` to `FILL`. **Each nested `Preview`'s
own height must end up `layoutSizingVertical: 'HUG'`, not `FIXED`** — see "Sizing" in
`conventions/document-sections.md`; apply it to every one of the per-option nested `Preview`s
here, not just the first.

**Specs always uses the default set's instances/values**, even on a component with an inverted axis
— an `inverted` split changes colors, not geometry, so showing the `…Inverted` set's numbers here would
just repeat identical figures. There's only one frame/one Specs section per component now either
way (see `PHASE-3-BUILD.md`'s "Labeled component set" section).

**The "last child of the outer frame" positioning rule from the old spec no longer applies** — since
Specs now sits inside the `Documentation` column as a normal stacked child (same as every other
left-column section), not as the final child of the whole outer frame.

The `kind=specs` placeholder is already the last child of the `Documentation` column in the
cloned frame, so nothing is appended or moved. Iterate on it with the user in Figma before moving
on.

## Output

- The cloned frame's `kind=specs` `Section` placeholder filled as "📐 Specs", with one nested
  `Default`-variant `Preview` per Variants-axis option.

## Completion Criteria

- The filled `Section` uses `kind=specs` and `Flat` variant, with one nested `Default`-variant
  `Preview` per Variants-axis option.
- Every nested `Preview` is `FILL` width and ends up `HUG` height; every card frame is resized to
  match its slot's real width (`x = 0`, no clipped label text).
- Specs shows the default set's instances/values only, never an `…Inverted` set.
- The section has been iterated on and confirmed with the user in Figma.

## Next Phase

None — this is the last phase. Once Specs is built and confirmed, the documentation frame is
complete and the component is done.
