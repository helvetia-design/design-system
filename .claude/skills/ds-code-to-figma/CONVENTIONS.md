# Mapping conventions — code → Figma

Heuristics the `ds-code-to-figma` skill uses when proposing a variant grouping in Phase 2 and
building Phase 3/4. This file (and its `conventions/*.md` topic files) are only ever changed by
the skill _proposing_ an addition and the user _approving_ it — never auto-appended.

**Current rules only.** Superseded approaches, reverted experiments, and "caught a bug and fixed
it" narratives live in [`CHANGELOG.md`](CHANGELOG.md) — read that file for the _why_ behind a
rule, not this one.

## Index

- **Baseline rules** (below) — seeded, not learned: free-text/state/enum prop mapping, the
  500-variant threshold, category pages, "never lock a node", "no attribute is ever assumed".
- [`conventions/tokens-and-props.md`](conventions/tokens-and-props.md) — resolving design tokens
  (Phase 1), and verifying a claimed value/behavior before trusting it (Phase 1/5).
- [`conventions/variant-grouping.md`](conventions/variant-grouping.md) — prop-to-variant mapping,
  the wrapper + Instance Swap pattern for open-ended content props, the 500-variant threshold's
  mitigations (Phase 2).
- [`conventions/page-structure.md`](conventions/page-structure.md) — category pages, the
  one-documentation-frame-per-component invariant, the `inverted`-axis handling (Phase 3/4).
- [`conventions/component-set-rendering.md`](conventions/component-set-rendering.md) — Component
  Set axis labeling, sizing/grid mechanics, screenshot reliability for this section (Phase 4 §6).
- [`conventions/build-mechanics.md`](conventions/build-mechanics.md) — general Figma Plugin API
  gotchas that apply across any phase: platform limits, variant-set mechanics, auto-layout
  sizing, vector import, color/paint, focus states.

## Baseline rules (seeded, not learned)

- **Free-text props never become Figma variant properties.** A prop like `label` maps to an
  instance text override, not a variant option — the set of possible strings is unbounded.
- **Pseudo-class states and state-ish props collapse into one `state` Figma variant property.**
  `:hover`, `:focus`, `:active` (from SCSS) plus `disabled` / `readonly` / `loading`-style props
  all become options on a single `state` property (`default` / `hover` / `focus` / `active` /
  `disabled` / `readonly` / `loading`, limited to whichever apply) — never separate axes, never
  separate booleans.
- **Enum props (`@OneOf([...])`) map 1:1** to a Figma variant property of the same name with the
  same options — no renaming or collapsing unless a later rule says otherwise.
- **An enum prop only maps to a variant property when its options share the same layer
  structure — same shape, different token.** If the options instead require different
  layers/structure (e.g. a button `color`/`type` prop where `primary` is a solid fill, `ghost` is
  a transparent fill + border, `link` is text-only with an underline), it is **not** a variant
  property — split it into separate top-level components instead, swapped via Figma's native
  Instance Swap, same treatment as the `inverted` axis and open-ended content-selection props.
  Confirmed against the TapTap Design System's own Button, which models
  `Primary`/`Ghost`/`Link`/`Outline` this way, never as a crossed "style" variant. **The test is
  never the prop's name or whether it's an enum — it's: same layers, different token → variant;
  different layers/structure → top-level split via instance swap.** For the current rule on
  open-ended content-selection props and the wrapper + Instance Swap pattern, see
  [`conventions/variant-grouping.md`](conventions/variant-grouping.md).

- **Total variant count is checked against a hard-stop ceiling of 500 before any grouping is
  presented for approval** — this skill's own conservative limit, not a number Figma enforces.
  Count = sum, across every top-level split, of the product of that split's own crossed
  variant-property option counts (every property, including `state`). Lightweight Instance Swap
  library members are excluded from the count. See
  [`conventions/variant-grouping.md`](conventions/variant-grouping.md) for the full threshold
  check and its mitigations (token-swap variable override, structural wrapper+swap split).

- **Components are grouped onto one shared Figma page per code category, not one page per
  component — `Core / <Category>`, Title Case, plural, matching the code folder name exactly, no
  `⏳`/`✅` emoji prefix.** The seven categories and their fixed title/lead copy for the shared
  category-page header (see `PHASE-4-DOCUMENT.md`'s "Page-level structure" section) — **never
  invent category copy on the fly, this table is the source of truth**:

  | Category (folder) | Page name           | Title      | Lead                                                                                   |
  | ----------------- | ------------------- | ---------- | -------------------------------------------------------------------------------------- |
  | `indicators`      | `Core / Indicators` | Indicators | Indicators communicate status, progress, or emphasis to the user.                      |
  | `actions`         | `Core / Actions`    | Actions    | Actions let users trigger a task, submission, or navigation with a single interaction. |
  | `forms`           | `Core / Forms`      | Forms      | Forms collect, validate, and submit user input across a range of field types.          |
  | `media`           | `Core / Media`      | Media      | Media displays brand, imagery, and iconography consistently across the product.        |
  | `navigation`      | `Core / Navigation` | Navigation | Navigation helps users move between and orient themselves within views.                |
  | `overlays`        | `Core / Overlays`   | Overlays   | Overlays surface contextual content above the page without losing the user's place.    |
  | `structure`       | `Core / Structure`  | Structure  | Structure organizes and arranges content into a clear, consistent layout.              |

  If a category is ever missing from this table (e.g. a new category folder is added to
  `packages/core/CONTEXT.md`'s Usage-Category Taxonomy), stop and ask the user for title/lead
  copy before building that category's page — same hard-stop discipline as a missing design
  token, never guessed. See [`conventions/page-structure.md`](conventions/page-structure.md) for
  the "applies to new components only" migration rule and the one-documentation-frame-per-component
  invariant (including the `inverted`-axis handling).

- **Never lock any Figma node this skill builds** — no master `COMPONENT_SET`, no display clone,
  no documentation-frame content, nothing. The current template has no table geometry for a human
  to accidentally misalign, so locking only gets in the way of inspecting, selecting, or
  rearranging content directly in the Figma UI.

- **No visual attribute is ever assumed — every value on every Figma node needs an explicit,
  resolved design token, even if the component's own SCSS never sets that attribute at all.** A
  CSS-var binding is the common case, not the only case that counts: an attribute a component
  inherits (e.g. `color`/`font-size` on a text part that relies on Shadow DOM inheritance) still
  needs a token bound to it in Figma. Treat a missing token for _any_ attribute (inherited,
  hardcoded in `.tsx`, or CSS-var-bound) as the same hard stop: ask the user to pick an existing
  token or explicitly accept a one-off hardcode, never silently build with an assumed value. See
  [`conventions/tokens-and-props.md`](conventions/tokens-and-props.md) for resolution mechanics
  and verification techniques.
