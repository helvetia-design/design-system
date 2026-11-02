# Phase 5 — Document: Copy me

## Objective

Fill in the first section of the left ("documentation") column: "👉 Copy me". "Copy me" is always
the first child of the left `documentation` column, never skipped (unlike Anatomy, which is
conditional on the component having `@part` tags).

Build this right after the Phase 4 body shell exists, before
[`PHASE-6-DOCUMENT-ANATOMY.md`](PHASE-6-DOCUMENT-ANATOMY.md).

## Inputs

- The category page shell, outer frame, purple header, and 2-column body skeleton built in
  [`PHASE-4-DOCUMENT-LAYOUT.md`](PHASE-4-DOCUMENT-LAYOUT.md).
- The finished component-set variant for the default/base combination (Phase 3).

## References

- `PHASE-4-DOCUMENT-LAYOUT.md`'s "0. Shared `Section`/`Preview`/`Title` components" section — read
  this first if you haven't built against it yet this run.
- `PHASE-4-DOCUMENT-LAYOUT.md`'s "2. Body — 2-column layout and column sizing" section.
- `PHASE-4-DOCUMENT-LAYOUT.md`'s "Cross-cutting build pitfalls" section — build gotchas that apply
  here too (fill-clearing on structural wrapper frames, awaited promises on instance text
  overrides).

## Instructions

**Instance the shared `Section` component in `Default` variant** (see
`PHASE-4-DOCUMENT-LAYOUT.md`'s "0. Shared `Section`/`Preview`/`Title` components" section) with
its `Title` set to `kind=copy-me`. Insert one real, representative **instance** (the default/base
combination) **directly into the `Preview`'s slot** — no further nesting — the single "drag this
into your design" example. Use a Figma `INSTANCE` (`variant.createInstance()`) of the finished
component-set variant — never the variant node itself. If the component has any boolean "Show X"
property (per Phase 2's conditional-render rule), override it to `true` on this instance for
readability, while the component set's own default stays whatever matches code.

Append this `Section` instance as the first child of the left `documentation` column (see
`PHASE-4-DOCUMENT-LAYOUT.md`'s "2. Body — 2-column layout and column sizing" section). Iterate on
it with the user (screenshot checkpoint) before moving on, same discipline as every other section
in this template.

## Output

- A "👉 Copy me" `Section` instance, holding one real representative instance of the component,
  appended as the first child of the left `documentation` column.

## Completion Criteria

- The `Section` instance uses `kind=copy-me` and `Default` variant, with the representative
  instance inserted directly into the `Preview`'s slot.
- The section has been iterated on and confirmed with the user via a screenshot checkpoint.

## Next Phase

Proceed to [`PHASE-6-DOCUMENT-ANATOMY.md`](PHASE-6-DOCUMENT-ANATOMY.md) once "Copy me" is built
and confirmed.
