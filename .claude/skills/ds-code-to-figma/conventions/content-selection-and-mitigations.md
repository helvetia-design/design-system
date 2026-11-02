# Conventions — content-selection props and threshold mitigations (Phase 2, Phase 8)

Relevant to Phase 2's grouping proposal when a component has an open-ended content prop or
exceeds the variant threshold, and to Phase 8 when documenting wrapper sets. See `../CONVENTIONS.md` for the index
(the core "same layers → variant, different layers → top-level split" test lives in
`../PHASE-2-PROPOSE.md` step 1); see
`../CHANGELOG.md` for superseded approaches (crossed-variant content-selection props, the
2,370-component `ds-icon` attempt).

## Prop-to-variant mapping

The prop-to-variant mapping rules (no-static-effect booleans excluded, conditional props keep their
own axis, placeholder text on text-override props, paired "Show X" boolean for conditionally
rendered text) are canonical in `../PHASE-2-PROPOSE.md` step 1 — not duplicated here.

## Open-ended content-selection props (current rule)

- **A pure open-ended content-selection prop with no crossed sub-props** (e.g. an icon `name`
  backed by an unbounded set of SVGs) becomes N separate top-level components, one per option
  (`<Component>/<option>`), swapped via Figma's native Instance Swap — never a crossed variant
  property, however many options it has. Same treatment as a true `inverted`/dark-context axis.
- **A large open-ended content-selection prop that also has crossed same-layers sub-props** (e.g.
  `ds-icon`'s `size`/`color` on top of 79 names) gets **one wrapper `COMPONENT_SET`** crossing
  only the sub-props, with each variant containing a nested `INSTANCE` bound to an
  `INSTANCE_SWAP` component property (`addComponentProperty('Icon', 'INSTANCE_SWAP', defaultId)`
  on the set, `componentPropertyReferences = { mainComponent: propKey }` on each variant's nested
  instance), **plus a lightweight Instance Swap library** of single-vector `COMPONENT`s (not
  sets) parked off-canvas — not N top-level sets each repeating the full cross-product. Figma
  preserves per-instance overrides (resize, fill rebinds) across an Instance Swap when the
  overridden node has a name-matching counterpart in the new component — verify this explicitly by
  testing an actual swap, don't just assume it propagates. Reduced `ds-icon` from a 2,370-component
  attempt to 109 (30 wrapper variants + 79 library members). Apply this pattern by default for any
  future component with this shape.
  - **A glyph/content library item needs exactly one fill-bearing node, name-matched to the
    wrapper's default's own structure, for color overrides to propagate fully on swap.** An icon
    with more than one top-level `VECTOR` (e.g. a 2-path logo) only gets one path recolored on
    swap (or none, if nesting differs from the default). Fix: `figma.flatten()` any multi-vector
    library item into one `VECTOR` before adding it to the library, **then immediately reassign
    `vector.fills = JSON.parse(JSON.stringify(vector.fills))`** (a value-preserving reassignment,
    not a real change) — `flatten()` otherwise leaves the new vector's fills reading correctly on
    the master but empty when read through a swapped instance. (From: `ds-icon`'s `xing` /
    `information`, the only 2 of 79 icons with multi-path source SVGs.)

## The 500-variant threshold

- The count formula and hard-stop loop are canonical in `../PHASE-2-PROPOSE.md` step 3.
- **When over threshold, a token-swap axis** (same layers, only a different bound-Variable value —
  color is the common case, but this generalizes to border-width, elevation, or any
  variable-bound attribute) **can be resolved via a per-instance Figma Variable override** instead
  of a crossed variant property, using `setBoundVariableForPaint` (or the matching bound-variable
  setter for non-paint fields). Reserved for when the threshold is actually exceeded, not a
  universal default — a small, harmless token-swap axis still gets a normal crossed variant
  dropdown by default, since that's more discoverable for consumers. **Size axes are never
  eligible for this mitigation** — resolve a size-driven explosion via a crossed variant (if it
  fits on its own) or a structural wrapper/Instance-Swap split, never a variable swap.
- **An open-ended/structural axis contributing to a threshold breach uses the existing wrapper +
  Instance Swap split pattern** above, rather than a new technique — the mitigation for this axis
  type was already solved; the hard-stop check just surfaces when it's needed sooner than a human
  would have noticed.
