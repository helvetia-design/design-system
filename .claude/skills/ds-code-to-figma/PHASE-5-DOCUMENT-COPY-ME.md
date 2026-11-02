# Phase 5 — Document: Copy me

**You are here:** assumes [`PHASE-4-DOCUMENT-LAYOUT.md`](PHASE-4-DOCUMENT-LAYOUT.md) has built the
category page shell, the outer frame, the purple header, and the 2-column body skeleton for this
component's documentation frame. This phase fills in the first section of the left
("documentation") column: "👉 Copy me". It relies on the shared `Section`/`Preview`/`Title`
components described in `PHASE-4-DOCUMENT-LAYOUT.md`'s "0. Shared `Section`/`Preview`/`Title`
components" section — read that first if you haven't built against it yet this run.

## When to use this

Build this right after the Phase 4 body shell exists, before
[`PHASE-6-DOCUMENT-ANATOMY.md`](PHASE-6-DOCUMENT-ANATOMY.md). "Copy me" is always the first child
of the left `documentation` column, never skipped (unlike Anatomy, which is conditional on the
component having `@part` tags).

## "👉 Copy me"

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

See `PHASE-4-DOCUMENT-LAYOUT.md`'s "Cross-cutting build pitfalls" section for build gotchas that
apply here too (fill-clearing on structural wrapper frames, awaited promises on instance text
overrides).

**Next: [`PHASE-6-DOCUMENT-ANATOMY.md`](PHASE-6-DOCUMENT-ANATOMY.md)** — once "Copy me" is built
and confirmed.
