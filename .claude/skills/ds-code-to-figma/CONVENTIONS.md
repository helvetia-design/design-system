# Cross-phase conventions — code → Figma

Rules and topic files that apply across several phases of the `ds-code-to-figma` skill. Prop-to-
variant mapping and the 500-variant check are **not** here — they live in
[`PHASE-2-PROPOSE.md`](PHASE-2-PROPOSE.md) (step 1 table, step 3). This file (and its
`conventions/*.md` topic files) are only ever changed by the skill _proposing_ an addition and the
user _approving_ it — never auto-appended.

## Index

- **Cross-phase rules** (below) — category pages and fixed category copy, "never lock a node",
  "no attribute is ever assumed".
- [`conventions/tokens-and-props.md`](conventions/tokens-and-props.md) — resolving design tokens
  (Phase 1), and verifying a claimed value/behavior before trusting it (Phase 1/5).
- [`conventions/content-selection-and-mitigations.md`](conventions/content-selection-and-mitigations.md)
  — the wrapper + Instance Swap pattern for open-ended content props and the 500-variant
  threshold's mitigations (Phase 2, conditional; Phase 8).
- [`conventions/page-structure.md`](conventions/page-structure.md) — category pages, the
  one-documentation-frame-per-component invariant, the `inverted`-axis handling (Phase 3 / Phase 4
  / Phase 8).
- [`conventions/component-set-rendering.md`](conventions/component-set-rendering.md) — Component
  Set axis labeling, sizing/grid mechanics, screenshot reliability for this section (Phase 8).
- [`conventions/build-mechanics.md`](conventions/build-mechanics.md) — general Figma Plugin API
  gotchas that apply across any phase: platform limits, variant-set mechanics, auto-layout
  sizing, vector import, color/paint, focus states.

## Cross-phase rules (seeded, not learned)

- **Components are grouped onto one shared Figma page per code category, not one page per
  component — `Core / <Category>`, Title Case, plural, matching the code folder name exactly.**
  The seven categories and their fixed title/lead copy for the shared
  category-page header (see `PHASE-4-DOCUMENT-LAYOUT.md`'s "Page-level structure" section) — **never
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
  the one-documentation-frame-per-component invariant (including the `inverted`-axis handling).

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
