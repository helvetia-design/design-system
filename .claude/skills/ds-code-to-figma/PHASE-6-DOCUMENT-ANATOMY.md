# Phase 6 — Document: Anatomy

## Objective

Fill in the second section of the left `documentation` column: "🏗️ Anatomy". **Skip this entire
phase** when the component's `<name>.figma.md` has no `anatomy:` list (no `@part` tags found in
Phase 1) — go straight to [`PHASE-7-DOCUMENT-SPECS.md`](PHASE-7-DOCUMENT-SPECS.md) instead.

Build this right after "Copy me" is confirmed, before
[`PHASE-7-DOCUMENT-SPECS.md`](PHASE-7-DOCUMENT-SPECS.md) — unless this phase is skipped per the
condition above.

## Inputs

- "👉 Copy me", built and confirmed as the first child of the left `documentation` column in
  [`PHASE-5-DOCUMENT-COPY-ME.md`](PHASE-5-DOCUMENT-COPY-ME.md).
- `<name>.figma.md`'s `anatomy:` list (letter, part name, description) from Phase 1 — absence of
  this list is the skip condition above.

## References

- `PHASE-4-DOCUMENT-LAYOUT.md`'s "0. Shared `Section`/`Preview`/`Title` components" section.
- `PHASE-4-DOCUMENT-LAYOUT.md`'s "2. Body — 2-column layout and column sizing" section.
- `PHASE-4-DOCUMENT-LAYOUT.md`'s "Cross-cutting build pitfalls" section.
- The prior revision of this document, or `ds-close`'s reference pages, for the full
  diagram/circle/leader-line construction rules (unchanged by this restructure).
- `conventions/build-mechanics.md`'s "Color and paint" section.

## Instructions

Mostly unchanged in diagram/legend content from the prior template — only its position in the page
moved (now second in the left column, still skipped entirely when the component's
`<name>.figma.md` has no `anatomy:` list). **Structure: a `Section` instance in `Flat` variant**
(`Title` set to `kind=anatomy`) **as the outer zero-inset container, with one nested `Preview`
instance in `Default` variant inside that outer slot** — the real diagram/circle/leader-line/legend
content goes into the _nested_ `Preview`'s own slot, not the outer `Section`'s slot directly.
Confirmed live on `Documentaion`: the Anatomy `Section`'s `Preview` slot has zero inset and
contains exactly one nested `Preview` instance, which itself has the usual 14px inset holding the
real `Anatomy box` content. See the prior revision of this document (or `ds-close`) for the full
diagram/circle/leader-line construction rules — those didn't change.

**Two content fixes (per explicit user correction, not yet reflected on the `Documentaion`
reference — treat these as this document's own specification going forward):**

- **Both `diagram-area` and `legend` are `layoutSizingHorizontal: 'FILL'`, not a fixed width.**
  They're children of the nested `Default`-variant `Preview`'s auto-layout slot — set `FILL` on
  each (after appending, per the usual append-before-FILL ordering) so they stretch to the slot's
  real width instead of staying at a hardcoded `608`/`293`px.
- **In each legend line (`"A · badge — The badge element itself."`), the letter and the part name
  are Bold — the rest of the sentence stays Regular.** Use `setRangeFontName` on two sub-ranges of
  the same text node: the single letter (`0` to `1`), and the part-name word located via
  `characters.indexOf(partName, 1)` (e.g. `"badge"` in `"A · badge — ..."`) — both to `Baloise
Create Text` **Bold**, leaving the `" · "`, `" — "`, and trailing description in Regular. Don't
  build the letter/part-name as separate text nodes to bold them — the whole line stays one text
  node with mixed-range formatting, same technique as any other partial-bold text in this file.
- **The legend line's fill binds to `🔗 Alias/🔤 Text/Color/Primary` (`VariableID:137:288`)** —
  same rule as every other skill-authored label, see `conventions/build-mechanics.md`'s
  "Color and paint" section; don't hardcode a near-black literal even if it looks indistinguishable.

Append this `Section` instance as the second child of the left `documentation` column (see
`PHASE-4-DOCUMENT-LAYOUT.md`'s "2. Body — 2-column layout and column sizing" section). Iterate on
it with the user (screenshot checkpoint) before moving on.

## Output

- A "🏗️ Anatomy" `Section` instance (or an explicit skip, when the component has no `anatomy:`
  list), appended as the second child of the left `documentation` column.

## Completion Criteria

- The `Section` instance uses `kind=anatomy` and `Flat` variant, with exactly one nested
  `Default`-variant `Preview` holding the real diagram/legend content.
- `diagram-area` and `legend` are `FILL` width; each legend line's letter and part name are Bold,
  the rest Regular; the legend line's fill is bound to `🔗 Alias/🔤 Text/Color/Primary`.
- The section has been iterated on and confirmed with the user via a screenshot checkpoint (unless
  this phase was skipped).

## Next Phase

Proceed to [`PHASE-7-DOCUMENT-SPECS.md`](PHASE-7-DOCUMENT-SPECS.md) once Anatomy is built and
confirmed (or immediately, if this phase was skipped).
