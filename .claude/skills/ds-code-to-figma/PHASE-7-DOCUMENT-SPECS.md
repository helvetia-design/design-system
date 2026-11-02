# Phase 7 — Document: Specs

**You are here:** assumes [`PHASE-6-DOCUMENT-ANATOMY.md`](PHASE-6-DOCUMENT-ANATOMY.md) has built
(or skipped) "🏗️ Anatomy". This phase fills in the last section of the left `documentation`
column: "📐 Specs". It relies on the shared `Section`/`Preview`/`Title` components described in
`PHASE-4-DOCUMENT-LAYOUT.md`'s "0. Shared `Section`/`Preview`/`Title` components" section.

## When to use this

Build this right after Anatomy (or right after Copy me, if Anatomy was skipped), before
[`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md). Specs is always the last
section of the left column — the "🛠 Variants" section that historically followed it has been
retired.

### 5. "📐 Specs"

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

See `PHASE-4-DOCUMENT-LAYOUT.md`'s "Cross-cutting build pitfalls" section for build gotchas that
apply here too.

**Next: [`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md)** — once Specs is
built and confirmed. The left column is now complete; the component-set phase fills in the right
column and finishes this documentation frame.
