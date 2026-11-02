# Phase 4 — Document: Copy me

## Objective

Fill in the first section of the left ("documentation") column: "👉 Copy me". "Copy me" is always
the first child of the left `documentation` column, never skipped (unlike Anatomy, which is
conditional on the component having `@part` tags).

Build this right after Phase 3 has built the documentation frame, before
[`PHASE-5-DOCUMENT-ANATOMY.md`](PHASE-5-DOCUMENT-ANATOMY.md).

## Inputs

- The category page, documentation frame, filled header and 2-column body skeleton cloned from the
  template in [`PHASE-3-BUILD.md`](PHASE-3-BUILD.md).
- The finished component-set variant for the default/base combination (Phase 3).

## References

- `conventions/document-sections.md` — read
  this first if you haven't built against it yet this run.
- `PHASE-3-BUILD.md`'s cloned frame (`body` › `Documentation` / `Component Sets` columns).
- `conventions/build-mechanics.md` — build gotchas that apply
  here too (fill-clearing on structural wrapper frames, awaited promises on instance text
  overrides).

## Instructions

**Fill the `Section` placeholder whose `Title` is `kind=copy-me` (`Default` variant) in the cloned frame's `body` ›
`Documentation` column** — don't create a new `Section`. It is the first one in the column; hard stop if no `kind=copy-me` placeholder exists
(see `conventions/document-sections.md`). Insert one real, representative **instance** (the
default/base combination) **directly into the `Preview`'s slot** — no further nesting — the single
"drag this into your design" example. Use a Figma `INSTANCE` (`variant.createInstance()`) of the
finished component-set variant — never the variant node itself. If the component has any boolean
"Show X" property (per Phase 2's conditional-render rule), override it to `true` on this instance
for readability, while the component set's own default stays whatever matches code.

Iterate on it with the user in Figma before moving on, same discipline as every other section.

## Output

- The cloned frame's first `Section` placeholder in the left `documentation` column, filled as
  "👉 Copy me" with one real representative instance of the component.

## Completion Criteria

- The filled `Section` uses `kind=copy-me` and `Default` variant, with the representative
  instance inserted directly into the `Preview`'s slot.
- The section has been iterated on and confirmed with the user in Figma.

## Next Phase

Proceed to [`PHASE-5-DOCUMENT-ANATOMY.md`](PHASE-5-DOCUMENT-ANATOMY.md) once "Copy me" is built
and confirmed.
