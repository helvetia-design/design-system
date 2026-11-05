# Phase 4 — Validate

## Objective

Verify the built Figma component set against the confirmed mapping file `<name>.figma.md` and the template.

## Inputs

- The confirmed `<name>.figma.md` — variant grouping and grid sketch from Phase 2.
- `figma.config.json`'s `componentLibraryFileKey`.
- The component's name, category folder, JSDoc lead, and `packages/core/package.json` `version`.
- Every resolved Figma variable id from Phase 1 (`tokens:` list) and every nested DS component's
  Figma component key (Phase 1, step 4).

## References

- The Figma page **`🗂️ Template / Category`** in the library file — the only source of page and
  documentation-frame styling (see [Category pages](PHASE-3-BUILD.md#category-pages)). This skill holds no layout,
  spacing, colour or font values for it.

## Instructions

1. Load `figma-use` (mandatory before any `use_figma` call; all calls in this phase are read-only)
   and create a session against `figma.config.json`'s `componentLibraryFileKey`. **Locate the
   nodes** by the mapping-file fields Phase 3 wrote (`figmaMasterNodeId`,
   `figmaDocFrameNodeId`, `figmaPage`). If a node is missing, mark every check on it
   `fail` (`node not found`).
2. **Check the documentation frame header** against `PHASE-3-BUILD.md` → "Documentation frame
   header": `kicker` reads `Core / <Category>` (breadcrumb only, no component name), `component`
   matches the component's real name, `lead` matches the component's JSDoc lead paragraph verbatim,
   `review-status` is `status=review` (never `status=approved`), the `VERSION` row reads
   `v<packages/core/package.json version>`, the `LAST UPDATED` row is a `DD.MM.YYYY` date equal to
   the last Phase 3/5 run that wrote the frame, and all three links (`link-storybook`, `link-toky`,
   `link-github`) carry the correct, non-blank hyperlink per that section's URL rules.
3. **Check the prop/state mapping against the confirmed `<name>.figma.md`** from Phase 2:
   a. Every prop and state listed there is present on the built component set(s) — nothing
   dropped, nothing extra. Every name in `componentPropertyDefinitions`, every variant option
   value and `sub-label` is lowercase with spaces, and every set name is flat PascalCase with the
   default set bare, per `PHASE-2-PROPOSE.md` → "Naming"
   (list each wrong name). Same layers/different token → a variant property on the
   `COMPONENT_SET`, never a shared "style" variant.
   b. **Top-level splits** — walk `PHASE-2-PROPOSE.md` → "Top-level splits" in order, per prop:
   1. Different layers/structure per option → one `COMPONENT_SET` per option, not a variant
      property.
   2. Inverted axis → separate `<Component>` and `<Component>Inverted` sets.
   3. Over-500 split → the split axis and set names match the mitigation recorded in
      `<name>.figma.md`, and every set has ≤500 variants (count the real children).
      c. No set exists without one of these three rules behind it, and the number and names of the
      sets match `<name>.figma.md`. Flag any prop/state that was merged, split, or skipped
      differently than the confirmed mapping file.
4. **Check token and nested-component bindings** on every variant:
   a. Every fill, stroke, spacing, radius, size and text style is bound to a variable from the
   Phase 1 `tokens:` list — no hardcoded value, no variable outside that list.
   b. Every nested instance's main component key matches the Phase 1 key for that DS component —
   no detached instance, no local copy.
   c. Every icon slot from the mapping file has its `INSTANCE_SWAP` property (lowercase name,
   bound on every variant), the right `preferredValues` (icon library, plus brand-icon library
   where applicable), and no exposed nested instance properties; nested icon `size`/color match
   code per variant.
5. **Check the component set's layout against the template** (`🗂️ Template / Category` →
   `Labeled component set` in `PHASE-3-BUILD.md`):
   a. The set has both the outer dashed stroke around the whole grid and the inner dashed divider
   lines at every cell boundary (`divider-row-<n>` / `divider-col-<n>`), cloned from the template —
   stroke colour, `dashPattern` and weight identical to the template node, never redrawn or
   missing.
   b. Every column and row label is present and centred within ±1px: column values centred on
   their column, the column axis name centred on the set, row values vertically centred on the
   rows they cover, and the row axis name on the lane's left edge, on the same line as the column
   values.
   c. **Ordering** per `conventions/component-set-rendering.md` → "Option and axis ordering": the
   top-left cell and the first variant layer is the default variant (every axis at its code
   default), `state` is the column axis when the component has one (without `state`, either placement
   of `size` passes), and every
   axis's remaining options follow canonical order.
6. **Write the validation report** (see [Output](#output)).

## Rules

- MUST validate actual Figma nodes — never assume a tool operation succeeded.
- MUST NOT modify Figma during validation.

## Output

`<name>.figma-validation.md` next to `<name>.figma.md`: one entry per check from steps 2–5 with its
result (`pass` / `fail` / `not verified`), the affected node name/id, and for each failure what was
expected vs. found. End with an overall verdict:

- `pass` — every check passed.
- `fail` — at least one check failed.
- `blocked` — no failures, but at least one check is `not verified`.

On a re-run, overwrite the check results but keep any existing `## Repair log` section unchanged.

## Completion Criteria

All checks pass.

## Next Phase

- `pass` → [`PHASE-6-DOCUMENT-COPY-ME.md`](PHASE-6-DOCUMENT-COPY-ME.md)
- `fail` → [`PHASE-5-REPAIR.md`](PHASE-5-REPAIR.md)
- `blocked` → stop, list the `not verified` checks and why, and ask the user how to proceed.
