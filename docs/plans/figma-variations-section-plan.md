# Figma Variations section: verify show/hide layers against code

Package: `.claude/skills/ds-code-to-figma`

Status: Decisions agreed (grilling session 10.11.2026). Implementation open.

## Goal

A component set only shows each `show <name>` boolean at its default, usually `false`. That means
optional layers like the spinner's label or a button's badge never appear in the set, and nobody
checks them against code. A new **Variations** section at the bottom of the `Documentation`
column shows every hidden layer turned on. Phase 4 compares each entry with the component's visual
test snapshots.

## Decisions

| #   | Decision |
| --- | --- |
| 1   | **Scope:** only `BOOLEAN` `show <name>` component properties. Not instance swaps, slot fills or text overrides. |
| 2   | **Entries per boolean:** one per option of every **dependent axis**, i.e. a variant axis that only makes a visible difference while that boolean is `true` (spinner: `show label` × `label position` right / bottom). All other axes stay at the default variant. Plus **one "all on" entry per set**: every `show` boolean `true`, default variant otherwise. |
| 3   | **Sets covered:** the default set and every structural top-level split (rule 1: spinner `Logo`, `Circle`). **No `…Inverted` sets**: colour is already covered by Phase 4 step 4 (token bindings). |
| 4   | **Families:** owner and sub-component sets alike (e.g. `Tab` with `show badge`), in build order. A set with no `show` boolean gets no entry. |
| 5   | **Built in Phase 3, validated in Phase 4**, and repaired in Phase 5 like any other `fail`. No separate validator. |
| 6   | **Reference = visual test snapshots only** (`test/<name>.visual.play.ts-snapshots/*-Desktop-Chrome-linux.png`). No live dev-server render. |
| 7   | **Missing snapshot cases:** Phase 1 finds them, and Phase 2 lists them in the proposal. After sign-off the skill adds them to `test/<name>.visual.html` (left unstaged). Snapshots are baselined in CI, so **hard stop before Phase 4** until the user has run `/update-screenshots` and the new `*-linux.png` files exist. If one is still missing in Phase 4, the entry is `not verified` and the verdict is `blocked`. |
| 8   | **Naming:** section title "Variations", `Title kind=variations`. Glossary term **variation**. Code props in backticks (`variation` on spinner is unrelated). Measurements' "Variants axis" is renamed **table axis** so "variant" and "variation" never appear side by side. |
| 9   | **Figma structure:** `Section` `Flat`, with one nested `Default` `Preview` per covered set (heading = set name) holding a row of instances (`variant.createInstance()` + `setProperties`), each with a one-line caption: `show label · bottom`, `all on`. Same pattern as Measurements. |
| 10  | **Position:** last section of the `Documentation` column (Copy me → Anatomy → Measurements → Variations). Phase 3 fills it, and Phases 6–8 later fill the placeholders above it. |
| 11  | **Template change: one-off**, done by the agent via `use_figma` with user approval in Figma. Adds a `kind=variations` option to `Title` (`🧰 Annotations`) and a 4th placeholder `Section` (`Flat`, `kind=variations`) at the bottom of the `Documentation` column in `🗂️ Template / Category`. After that the skill only fills it, and **hard stops** if the placeholder is missing. It never creates chrome itself. |
| 12  | **No `show` boolean in the whole family:** delete the placeholder, the same as Anatomy without `@part` tags. |
| 13  | **Mapping file:** new `variations:` field, drafted in Phase 1 and confirmed in Phase 2. Phase 3 writes the node ids back. |
| 14  | **No migration:** built components (spinner, button, input, close, pagination, icon, logo) get the section when they're regenerated (POC phase). No ADR, because it's cheap to reverse. |

## Implementation steps

All skill edits go in `.claude/skills/ds-code-to-figma/`. Step 1 is the only Figma write.

### 1. Template (one-off, Figma)

- Load `figma-use`, then create a session on `componentLibraryFileKey`.
- `🧰 Annotations` → `Title` set (`2199:13`): add variant `kind=variations`, cloned from
  `kind=measurements`, with the title text "🔀 Variations" (emoji to be confirmed with the user).
- `🗂️ Template / Category` → `Documentation` column: append a placeholder `Section` (`Flat`)
  whose `Title` is `kind=variations`, after the Measurements placeholder.
- Stop and have the user approve it in Figma. Record the new node ids in
  `conventions/document-sections.md` (as hints only, like the existing ones).

### 2. Glossary: `CONVENTIONS.md`

- Add **variation**: "One entry in the Variations section: a variant with one `show <name>`
  boolean (or all of them, "all on") set to `true`, at one option of each dependent axis." Don't
  say: _variant_ (for an entry), _hidden-layer example_, _toggle example_.
- Add **dependent axis**: "A variant axis that only makes a visible difference while a `show`
  boolean is `true` (spinner `label position` depends on `show label`)."
- Add **table axis**: "The axis whose options are the Measurements table's columns." Don't say:
  _Variants axis_.
- Rename "Variants axis" → "table axis" in `conventions/measurements.md`, `PHASE-1-ANALYZE.md`
  step 6a, and `examples/mapping-file-format.md`.

### 3. Phase 1: `PHASE-1-ANALYZE.md`

- New step (after the prop analysis): for every render-guarded part (`hasValue(x) && …`,
  `show*` booleans), record its `show <name>` boolean and its dependent axes. A dependent axis is
  an axis whose CSS only applies when the part exists (e.g. `.label-bottom` selectors).
- Derive the variation list (decisions 2–4) per set.
- **Snapshot coverage:** for each variation, look in `test/<name>.visual.html` for a case with the
  same props (default state). List the uncovered ones in the draft mapping file.

### 4. Phase 2: `PHASE-2-PROPOSE.md`

- Step 4 (write and present): add a **Variations** block. List each set, its variations with
  captions, and the snapshot cases still missing.
- Step 5 (sign-off) covers the variation list **and** the `visual.html` additions.
- After sign-off: add the missing cases to `test/<name>.visual.html` and follow its existing
  structure (one labelled block per case). Tell the user to run `/update-screenshots` on the PR.
  Leave the files unstaged.

### 5. Phase 3: `PHASE-3-BUILD.md`

- New step after the labeled sets (between steps 5 and 6): **fill the Variations placeholder**.
  - Hard stop if no `kind=variations` placeholder exists in the cloned frame.
  - No `show` boolean in the family: delete the placeholder.
  - Otherwise, one nested `Default` `Preview` per covered set (set `layoutSizingHorizontal =
    'FILL'`, per `conventions/document-sections.md`), each holding a horizontal auto-layout row
    of instance + caption pairs. Use instances of the finished variants, never the variant
    nodes, and never `detachInstance()`.
- Step 6 (documentation frame approval) now includes the Variations section.
- Step 7: write the `variations:` node ids back into the mapping file.
- Before handing over to Phase 4: **hard stop** until every variation has its `*-linux.png`
  snapshot (decision 7).

### 6. Phase 4: `PHASE-4-VALIDATE.md`

- Step 1: locate the Variations `Section` via `variations:` node ids.
- New step **5e, Variations structure:** one `Preview` per covered set (none for `…Inverted`), one
  instance per expected variation, and each instance's `componentProperties` match its
  caption (booleans and dependent-axis options). Everything else stays at the default. Count
  found vs. expected.
- Step 6 (snapshots): extend 6c to every variation. Compare the instance with its snapshot case
  (part present, position relative to its neighbour (right/bottom), gap, size relation,
  colour), and take one `get_screenshot` per variations `Preview`. Remove the "states the
  snapshots don't show" skip for variations. A variation without a snapshot is `not verified`.
- Output: one check entry per variation.

### 7. Phase 5: `PHASE-5-REPAIR.md`

- A variation `fail` is usually a component-set bug (gap, alignment, missing token on the hidden
  layer). Fix it on the **master variant**, not on the instance, and never override instance
  properties to make a check pass.

### 8. Schema and topic files

- `examples/mapping-file-format.md`: new field

  ```yaml
  variations:
    figmaSectionNodeId: '…'
    sets:
      - set: SpinnerLogo
        previewNodeId: '…'
        entries:
          - { caption: 'show label · right', props: { show label: true, label position: right }, snapshot: 'spinner-label-right', nodeId: '…' }
          - { caption: 'all on', props: { show label: true }, snapshot: '…', nodeId: '…' }
  ```

- `conventions/document-sections.md`: `Title` gets `kind=variations` back. Remove the "Don't use
  `kind=variants` (retired)" line and replace it with the new kind. Add a "Variations" bullet
  under "Nesting per section".
- `conventions/page-structure.md`: the left column has four sections.
- `conventions/families.md` §2: Variations covers owner and sub-component sets and is built in
  Phase 3.
- `PHASE-6-DOCUMENT-COPY-ME.md`, `PHASE-7-…`, `PHASE-8-…`: their placeholders now sit above an
  already-filled Variations section, so don't append anything after it.
- `DECISIONS.md`: add the new hard stops (template placeholder missing, snapshots not yet
  baselined) and the Phase 2 sign-off scope.
- `SKILL.md`: update the workflow list and the mermaid graph (Phase 3 fills Variations, Phase 3 →
  4 snapshot hard stop).

### 9. Verify on a real run

- Re-run `ds-spinner` (dependent axis `label position`, structural split `Logo`/`Circle`,
  inverted sets excluded) and `ds-button` (several booleans → "all on") on a throwaway branch of
  the Figma file.
- Confirm that the missing `visual.html` cases were added, Phase 4 stops `blocked` before
  baselining and passes after, and the section reads correctly in Figma.
- Feed any Plugin API surprise back into `conventions/build-mechanics.md`.

## Open questions

- Section emoji for the `Title` (`🔀` proposed). Confirm during step 1.
