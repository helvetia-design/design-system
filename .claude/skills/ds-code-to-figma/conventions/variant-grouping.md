# Conventions — variant grouping (Phase 2)

Relevant to Phase 2's grouping proposal. See `../CONVENTIONS.md` for the index and baseline rules
(the core "same layers → variant, different layers → top-level split" test lives there); see
`../CHANGELOG.md` for superseded approaches (crossed-variant content-selection props, the
2,370-component `ds-icon` attempt).

## Prop-to-variant mapping

- **A boolean prop with no static visual effect is excluded from the Figma mapping entirely.**
  Figma components are inherently static — a prop that only toggles animation playback (e.g.
  `ds-spinner`'s `deactivated`) has nothing for a Figma variant property to represent.
- **A prop whose visual effect is conditional on another prop still gets its own independent
  variant axis**, rather than being collapsed or special-cased — simplicity over eliminating
  visually-redundant combinations. E.g. `ds-spinner`'s `labelPosition` only has a visible effect
  when `label` is non-empty, but stays its own axis regardless.
- **An `instance-text-override` prop (e.g. `label`) ships with placeholder text on every variant
  member, not left empty** — standard component-library practice; consumers clear or override it.
  The exception is when a specific member is meant to demonstrate the true code default and that
  default is an empty string — ask the user which policy applies rather than assuming.
- **A free-text prop whose presence is conditionally rendered in code** (e.g. `hasValue(label) &&
<span>`) needs a paired boolean "Show X" component property controlling the layer's `visible`
  via `componentPropertyReferences`, not just relying on empty text — Figma doesn't collapse an
  auto-layout gap/width for an empty-but-present text layer the way code's conditional render omits
  the element entirely. Default the boolean to match code's real default. Check every
  `instance-text-override` prop for this during Phase 1/2, don't wait to discover it after the
  build.

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

- **Total variant count is checked against a hard-stop ceiling of 500 before any grouping is
  presented for approval** — this skill's own conservative limit, not a number Figma enforces.
  Count = sum, across every top-level split, of the product of that split's own crossed
  variant-property option counts (every property, including `state`). Lightweight Instance Swap
  library members are excluded from the count. If the count exceeds 500, stop before presenting
  the grouping; recompute and re-check after every mitigation choice, looping until under
  threshold.
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
