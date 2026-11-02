# Phase 3 — Build incrementally

## Objective

Build the real Figma component set from the variant grouping and grid sketch that Phase 2 got
explicit user confirmation on.

## Inputs

- The confirmed `<name>.figma.md` — variant grouping and grid sketch from Phase 2.
- `figma.config.json`'s `componentLibraryFileKey`.
- The component's name, category folder, JSDoc lead, and `packages/core/package.json` `version`.
- Every resolved Figma variable id from Phase 1 (`tokens:` list) and every nested DS component's
  Figma component key (Phase 1, step 4).

## References

- `figma-use` skill — mandatory before any `use_figma` call.
- `CONVENTIONS.md` — for the seeded category-copy table.
- The Figma page **`🗂️ Template / Category`** in the library file — the only source of page and
  documentation-frame styling (see [Category pages](#category-pages)). This skill holds no layout,
  spacing, colour or font values for it.

## Instructions

1. Load `figma-use` (mandatory before any `use_figma` call) and create a session against
   `figma.config.json`'s `componentLibraryFileKey`.
2. **Find or create the component's shared category page and its documentation frame**, per
   [Category pages](#category-pages) and [Documentation frame header](#documentation-frame-header)
   below — never create a page named after the component itself.
3. Build **one full variant combination first** — pick the default/base combination (every
   variant property at its default value, state at `default`). **Create it directly inside this
   component's own documentation frame on the category page:** the parent is
   `<Component> Documentation` › `body` › `Component Sets` › `Sets` (from step 2). Never build it
   on a scratch page, at the page root, or off-canvas and move it in later. Wire up:
   - The component's shape/layout.
   - Every styled value bound to its resolved Figma variable from Phase 1 (never a literal).
     **Bind directly by id** — `figma.variables.getVariableByIdAsync(figmaVariableId)` using the
     id `<name>.figma.md`'s `tokens:` list already recorded from `css-token-lookup.mjs` — never
     re-resolve a token by searching Figma's variable collections by name at build time; that
     search was already done once, locally, in Phase 1.
   - Every nested component as an **instance of the existing Figma component** resolved in
     Phase 1, step 4 — never redrawn from scratch.
   - **Line-height variables cannot be true-bound — API limitation, not a missing token.** This
     repo's line-height tokens are percent-semantic FLOAT values (e.g. `150` meaning 150%, per
     `LINE_HEIGHT_PERCENT_MULTIPLIER` in `apps/toky/src/tokens/figma-map.ts`). Confirmed by
     testing: binding a FLOAT variable to a text node's `lineHeight` via `setBoundVariable` /
     `setRangeBoundVariable` **always** applies it as `PIXELS`, regardless of what unit was set
     on the node immediately before the bind call — there is no way to bind a percent-semantic
     FLOAT token to `lineHeight` through the Plugin API. Workaround: resolve the variable's
     numeric value yourself (walk its `VARIABLE_ALIAS` chain via `getVariableByIdAsync` until you
     hit a literal number), then set `node.lineHeight = { unit: 'PERCENT', value: resolvedValue }`
     as a **literal, unbound** value — do not call `setBoundVariable`/`setRangeBoundVariable` for
     `lineHeight` on a percent-semantic token. Record this in `<name>.figma.md`'s tokens list as
     an exception (resolved but intentionally unbound, with the reason), not as a hard stop —
     the token exists and its correct value is applied, it's just not a live binding.
   - **Binding `fontFamily`/`lineHeight` on an empty text node doesn't survive setting
     `characters` afterward** — text styling is per character-range, so writing new characters
     resets any binding applied while the node was empty. Set `characters` (and load whatever
     font that content needs) **before** calling `setRangeBoundVariable` for text properties, not
     after.
   - **Font-loading gotcha:** binding `fontFamily` to an Alias text-family variable (e.g.
     resolving to `Baloise Create Text`) changes the node's effective font. Any further text
     property write on that node then requires that exact font to be loaded first
     (`figma.loadFontAsync`), even if a different font (e.g. Inter) was loaded earlier in the
     same script — load the _resolved_ font family, not just a default.
   - **Responsive (`device:`) bindings — check for an already-synced routing variable before
     hand-creating one.** For every entry in `<name>.figma.md`'s `device:` section (from Phase 1
     step 5a):
     1. Re-run the _bare_ (non-breakpoint-suffixed) CSS var through `css-token-lookup.mjs` (same
        tool as Phase 1 step 5). **If its `variableId` object already has a `device` key**, the
        token is already "Device-eligible" (MVP-scoped) and `scripts/figma-sync` already manages
        a real routing variable for it in `Design Responsive Tokens` — fetch it directly via
        `getVariableByIdAsync(variableId.device)` and bind to that. Don't hand-create a duplicate.
        As of this writing no `Component.*` token is Device-eligible yet (only `Device.*` layer
        tokens are, e.g. `Device.Space.*`) — this case is a check for future-proofing, not
        something to assume absent.
     2. **Otherwise** (today's common case for a component-level responsive binding, e.g.
        `ds-logo`'s `Component.Logo.Size.Base`), look up a hand-built routing variable by its
        exact deterministic name (e.g. `🧩 Component/Logo/Size/Base/Device`) in `Design
Responsive Tokens` first — **reuse it if it already exists** rather than creating a
        duplicate (this makes a later rebuild of the same component idempotent). If reusing,
        verify its Mobile/Tablet/Desktop mode values still resolve (via `getVariableByIdAsync`,
        walking any `VARIABLE_ALIAS` chain) to the exact real per-breakpoint ids recorded in
        `device:` — if they've drifted, fix the alias rather than trusting the name match alone.
     3. If no routing variable exists yet (neither the Device-eligible id nor a hand-built one),
        create it in `Design Responsive Tokens` (same collection, so it inherits the
        Mobile/Tablet/Desktop modes already defined there) and set each mode's value to a
        `VARIABLE_ALIAS` pointing at the real per-breakpoint id Phase 1 resolved for that mode
        (via the breakpoint-suffixed CSS var lookup, e.g. `--ds-logo-size-base-mobile`) —
        including the fall-through case (e.g. Tablet aliasing to the same id as Mobile when code
        has no distinct tablet override).
     4. Bind the node's property (height/width/padding/gap/whatever `device:` recorded) to this
        routing variable **once**, via `setBoundVariable`/`setRangeBoundVariable` as normal —
        never bind directly to one of the three real per-breakpoint variables. The file's own
        Mobile/Tablet/Desktop mode switcher then changes the rendered value natively; don't create
        a `device` crossed variant property or separate instances per breakpoint.
     5. Flag the risk noted in `device:` (hand-created, not sync-managed) in `<name>.figma.md` if
        it isn't already recorded there from Phase 1 — skip this for the Device-eligible case in
        step 1, which carries no such risk.
4. **Stop and have the user confirm this one variant directly in Figma** — give them the node link
   (`https://www.figma.com/design/<fileKey>?node-id=<id>`) and wait. Don't send a screenshot as
   the checkpoint. This catches a structural mistake (wrong variable bound, wrong nested
   instance) once, before it's replicated across the full variant matrix.
5. On confirmation, fan out: build the remaining variant/state combinations, reusing the same
   bindings and nested instances, and present them as a labeled set per
   [Labeled component set](#labeled-component-set) below — inside the same `Sets` frame.
6. **Stop and have the user approve the documentation frame directly in Figma** — the filled
   `Header` and the finished component set(s) — give them the link to the frame and wait. Any change loops back to step 5. Don't continue to Phase 4 on an
   assumed approval.
7. Write the resulting Figma component key/node-id, the category page name and the documentation
   frame's node id (`figmaDocFrameNodeId`) back into `<name>.figma.md`.

### Category pages

Components are grouped onto one shared Figma page per code category, not one page per component.
The category is the folder under `packages/core/src/components/<category>/` (see
`packages/core/CONTEXT.md`'s Usage-Category Taxonomy). The target page name is
**`Core / <Category>`** — Title Case, plural, matching the folder name (`indicators` →
`Core / Indicators`).

**All styling comes from the template page `🗂️ Template / Category`.** Never hand-build the shell
and never write layout, spacing, colour or font values in this skill — clone, then change only
what's listed below.

1. Find the template page by exact name. **Hard stop** if it's missing.
2. Search `figma.root.children` for a page named exactly `Core / <Category>`.
   - **Not found → clone the whole template page** (`templatePage.clone()`), rename it
     `Core / <Category>`, and override `Category Header`'s `component` and `lead` text from the
     fixed category-copy table in `CONVENTIONS.md`. Never invent copy; if the category is missing
     from the table, **hard stop** and ask for title/lead text.
   - **Found → reuse it.** Clone only the template's `Component A Documentation` frame and move it
     into the existing page's `Documentation Frames` row, **appended last** (`framesRow.appendChild`) — never inserted at a sorted position, never repositioning a sibling component's frame (clone from the template every time,
     never from a sibling component, so styling can't drift).
3. In the cloned page/frame, keep `Component A Documentation` as this component's frame: rename it
   `<Component> Documentation`, delete `Component B Documentation` if it came along, and leave
   `body`'s placeholder content for Phases 4–6.
4. Fill the header, per [Documentation frame header](#documentation-frame-header).

**Layer-name contract.** This skill addresses the template by these layer names only. If any is
missing, **hard stop** and report which — never fall back to hand-building.

| Where               | Layer names touched                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page                | `Category Frame` › `Category Header` (`component`, `lead`) › `Documentation Frames`                                                                                              |
| Documentation frame | `Component A Documentation` › `Header`, `body` › `Documentation` › 3 `Section` placeholders (`Title` `kind` = `copy-me`, `anatomy`, `specs`), `body` › `Component Sets` › `Sets` |
| Sets stack          | `Sets` › `Primary` (`sub-label`, `Labeled Set` › `Row Labels` › `Bracket`, `Column + Box` › `Column Labels`, set, `Grid` › `Line`)                                               |
| `Header`            | `kicker`, `title` › `component`, `review-status`, `body` › `lead`, `meta` › `row` (`label`/`value`)                                                                              |
| `Header` links      | `links` › `link-row-storybook` / `link-row-toky` / `link-row-github` › `link-storybook`, `link-toky`, `link-github`                                                              |

### Labeled component set

The template's `Sets` frame is a worked example: one stack per split, each a `Labeled Set` of
`Row Labels` + `Column + Box` (`Column Labels`, the `COMPONENT_SET`, a dashed `Grid` overlay). Build
the real set by cloning from it — **this skill writes no fill, stroke, font, dash or spacing
values**; clone a prototype and change only text and positions.

1. **Stacks — one per top-level split from Phase 2.** No split → one stack, `sub-label` removed,
   set named `<Component>`. `inverted` axis → `Primary` and `Inverted`. A structural split → one
   stack per split, `sub-label` and set named `<Component>/<split>`. Source each stack from
   the matching template stack — `Primary` from the template's `Primary`, `Inverted` from the
   template's `Inverted` (it carries the dark `Alias/Surface/Primary` fill and its lighter label
   colours), any other split cloned from `Primary`. Delete template stacks that aren't needed.
2. **Combine** the stack's variants into a `COMPONENT_SET` with `combineAsVariants()`. Clone the
   template set's fill, stroke (dashed, purple, variable-bound) and corner radius onto it by
   copying them from the template set — never recreate them.
3. **Axes → grid.** Per `PHASE-2-PROPOSE.md` step 2: `size` is the innermost column axis; every
   other axis is a row, nested outer→inner by ascending option count (ties: prop declaration order).
   Order the options within each axis per `conventions/component-set-rendering.md` → "Option and
   axis ordering" — smallest left/top, largest right/bottom.
4. **Fixed cell grid, not Figma's native arrangement.** Cell = the largest variant's width/height
   in the whole set **plus the template's padding** (measure it: template cell minus its largest
   variant). One uniform cell size. Centre each variant in its cell by computed x/y, then resize the
   set to cols × rows cells.
5. **Every set is labeled — no axis count is exempt, not even a single-axis set.** With no row axis
   (e.g. a lone `size` axis) there are just `Column Labels` and no `Row Labels`.
6. **Labels and grid lines, cloned from template prototypes** — one `Column Labels` text, one
   `Row Labels` text, one `Bracket`, one `Grid` `Line`. Name every column/row axis and option
   outside the set, bracket nested row groups, and draw the inner dashed grid lines at the cell
   boundaries.

**Special case — asset components** (open-ended content prop such as icon `name`, later brand
icons): build the wrapper `COMPONENT_SET` + Instance Swap library per
`conventions/content-selection-and-mitigations.md`, and show the wrapper set in the labeled `Sets`
stack as usual. These components also get a separate "🖼️ \<Plural noun\> names" browsing section
for the content axis, below `Component Sets` in the documentation frame. Its layout isn't defined
in the template yet: on the first asset component, **stop and ask the user** how it should look
before building it, then record the answer here.

**Hard rules (check before asking for approval):** options ordered per convention · fixed uniform cell grid · dashed outer stroke
**and** inner dashed grid lines · outside labels naming every axis and option · no styling literal
written by this skill.

### Documentation frame header

Override text on the cloned `Header` instance by finding each node by name and setting
`.characters` (load the node's current fonts first). Never edit the `Header` master or detach the
instance.

| Layer           | Value                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `kicker`        | `Core / <Category>` — breadcrumb only, no component name                                                                               |
| `component`     | Component name (e.g. `Badge`)                                                                                                          |
| `review-status` | **Always `status=review`**, swapped via `swapComponent()` — never `status=approved`                                                    |
| `lead`          | The component's JSDoc lead paragraph                                                                                                   |
| `meta` rows     | Value of the `VERSION` row → `v<core package version>`; `LAST UPDATED` row → `DD.MM.YYYY` today. Labels never change.                  |
| `link-*` text   | Text stays (`View in Storybook ↗` etc.); set a hyperlink on each via `setRangeHyperlink(0, characters.length, { type: 'URL', value })` |

Link URLs (all mechanically derivable — none may ship blank):

- **Storybook** → `https://helvetia-design.vercel.app/?path=/docs/<storyId>`, where `<storyId>` is
  `<NAME>_DOC_CONFIG.tabs[0].storyId` from
  `apps/storybook/src/components/<category>/<name>/<name>.doc-config.ts` — read it, never derive
  it from the name. If `doc-config.ts` doesn't exist, **hard stop** and ask.
- **Toky** → `https://helvetia-toky.vercel.app?filter=<component name, lowercase>`
- **GitHub** → `https://github.com/helvetia-design/system/tree/main/packages/core/src/components/<category>/<name>`

**Standing rule — applies to every write to a component's frame, not only the first build:**
reset `review-status` to `status=review`, re-read the version and today's date, and recompute and
re-set all three hyperlinks, unconditionally, even if they look correct. A human may have set
`status=approved` on an earlier version; any further skill edit invalidates that approval.

## Output

- A full Figma variant matrix built as a real `COMPONENT_SET`, inside the component's own
  documentation frame (`body` › `Component Sets` › `Sets`)
- The component's shared category page (`Core / <Category>`) with its documentation frame
  (`<Component> Documentation`) cloned from the template and its `Header` filled
- The resulting Figma component

## Completion Criteria

- The first full variant combination was confirmed by the user in Figma before the
  rest of the matrix was fanned out.
- The finished labeled component set(s) satisfy the hard rules above and were approved by the user
  in Figma before Phase 4.
- Every styled value is bound to a real Figma variable id — never a literal — except the
  documented line-height exception (resolved value, intentionally unbound).
- Every `device:` responsive binding resolved to a routing variable (reused or newly created, per
  the steps above), never bound directly to one of the three per-breakpoint variables.
- The category page and the component's documentation frame exist, cloned from
  `🗂️ Template / Category` (no styling values written by this skill), with the header filled,
  `review-status` at `status=review` and all three links hyperlinked.
- The component key/node-id/category page name are written back into `<name>.figma.md`.

## Next Phase

Proceed to [`PHASE-4-DOCUMENT-COPY-ME.md`](PHASE-4-DOCUMENT-COPY-ME.md) once the full variant
matrix is built, the category page exists, and the component key is written back. Build the
documentation page (Phases 4–6) before Phase 7's review, so that review covers the documentation
page too, not just the raw component set.
