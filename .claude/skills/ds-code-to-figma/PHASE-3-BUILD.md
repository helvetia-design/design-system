# Phase 3 — Build incrementally

**You are here:** assumes [`PHASE-2-PROPOSE.md`](PHASE-2-PROPOSE.md) got an explicit user
confirmation on the variant grouping and grid sketch in `<name>.figma.md`. This phase builds the
real Figma component set from that confirmed mapping.

1. Load `figma-use` (mandatory before any `use_figma` call) and create a session against
   `figma.config.json`'s `componentLibraryFileKey`.
2. **Find or create the component's shared category page**, per
   [Category pages](#category-pages) below — never create a page named after the component
   itself. This applies to new components only; an already-pushed component's existing
   per-component page (e.g. `⏳ Core / Indicator / Badge`) is never migrated as a side effect of
   pushing a sibling component — see `CONVENTIONS.md` for which pages are still pending migration.
3. Build **one full variant combination first** — pick the default/base combination (every
   variant property at its default value, state at `default`). Wire up:
   - The component's shape/layout.
   - Every styled value bound to its resolved Figma variable from Phase 1 (never a literal).
   - Every nested component as an **instance of the existing Figma component** resolved in
     Phase 1, step 4 — never redrawn from scratch.
4. Take a screenshot of this first combination (`get_screenshot`) and show it to the user as a
   checkpoint before continuing. This catches a structural mistake (wrong variable bound, wrong
   nested instance) once, before it's replicated across the full variant matrix.
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
   - **Responsive (`device:`) bindings — create or reuse the routing variable, then bind once.**
     For every entry in `<name>.figma.md`'s `device:` section (from Phase 1 step 5a):
     1. Look up the routing variable by its exact deterministic name (e.g.
        `🧩 Component/Logo/Size/Base/Device`) in the file's `Design Responsive Tokens` collection
        first — **reuse it if it already exists** rather than creating a duplicate (this makes a
        later rebuild of the same component idempotent). If reusing, verify its Mobile/Tablet/
        Desktop mode values still resolve (via `getVariableByIdAsync`, walking any
        `VARIABLE_ALIAS` chain) to the exact real per-breakpoint variables recorded in `device:` —
        if they've drifted, fix the alias rather than trusting the name match alone.
     2. If it doesn't exist, create it in `Design Responsive Tokens` (same collection, so it
        inherits the Mobile/Tablet/Desktop modes already defined there) and set each mode's value
        to a `VARIABLE_ALIAS` pointing at the real, `scripts/figma-sync`-managed variable recorded
        for that mode in `device:` — including the fall-through case (e.g. Tablet aliasing to the
        same real variable as Mobile when code has no distinct tablet override).
     3. Bind the node's property (height/width/padding/gap/whatever `device:` recorded) to this
        routing variable **once**, via `setBoundVariable`/`setRangeBoundVariable` as normal —
        never bind directly to one of the three real per-breakpoint variables. The file's own
        Mobile/Tablet/Desktop mode switcher then changes the rendered value natively; don't create
        a `device` crossed variant property or separate instances per breakpoint.
     4. Flag the risk noted in `device:` (hand-created, not sync-managed) in `<name>.figma.md` if
        it isn't already recorded there from Phase 1.
5. On confirmation, fan out: build the remaining variant/state combinations as a Figma component
   set, reusing the same bindings and nested instances.
6. **Ensure the component's category page exists** (see [Category pages](#category-pages) below)
   — the master set itself doesn't park anywhere on this page; it's referenced from inside the
   component's own documentation frame (Phase 4's "🔒 Component Set" section), same as the
   single-page-per-component template. There is no separate masters-overview row to append into
   (dropped — see `PHASE-4-DOCUMENT.md`'s page-level structure section for why).
7. Write the resulting Figma component key/node-id and the category page name back into
   `<name>.figma.md`.

## Category pages

**Components are grouped onto one shared Figma page per code category, not one page per
component** (2026-10-29, confirmed via a `Core / Indicators` dry run — see
`conventions/page-structure.md`). A component's category is the folder it lives in under
`packages/core/src/components/<category>/` (see `packages/core/CONTEXT.md`'s Usage-Category
Taxonomy — seven categories: `actions`, `forms`, `indicators`, `media`, `navigation`, `overlays`,
`structure`). The target Figma page name is **`Core / <Category>`** — Title Case, **plural**,
matching the code folder name exactly (e.g. `indicators` → `Core / Indicators`) — **no `⏳`/`✅`
emoji prefix**, unlike the older per-component page names, which still carry it on pages that
predate this change and are not retroactively renamed.

**This applies to new components only.** An already-pushed component's existing per-component
page (`ds-badge`, `ds-spinner`, `ds-icon`, `ds-close`, `ds-tag` — all still on their own
`⏳ Core / <Category singular> / <Component>` pages) is never migrated into the new shared page as
a side effect of pushing an unrelated sibling component. Migrating them is its own, separate,
deliberate piece of work — don't do it opportunistically.

**Finding or creating the page:**

1. Search `figma.root.children` for a page named exactly `Core / <Category>`. If found, reuse it
   — don't create a duplicate.
2. **If it doesn't exist yet, this is the first component in that category being pushed under the
   new scheme — build the whole page shell before appending anything component-specific:**
   - Create the page, name it `Core / <Category>`, set `page.backgrounds` to literal solid
     `#1e1e1e` (same dark-page convention as the per-component template — see
     `PHASE-4-DOCUMENT.md`'s "Page and outer frame" section).
   - Build one top-level `VERTICAL` auto-layout frame (`Category Frame`, hand-built fresh — **not**
     an instance of a shared master, see `PHASE-4-DOCUMENT.md`'s page-level structure section for
     why), `HUG` both axes, `400`px padding on all sides, `itemSpacing: 200`, `cornerRadius: 24`,
     `clipsContent: false`, fill a two-stop navy `GRADIENT_LINEAR` (literal values, not a bound
     token — see `PHASE-4-DOCUMENT.md` for the exact stops/transform). This is the only top-level
     frame on the page — everything else nests inside it.
   - **Category Header** (first child): instance the shared `Category Header` master component
     (`🧰 Annotations` page, node `2412:1247` — a lightweight sibling of `Header`/`Title`/
     `Section`/`Preview`: just a `component` text node, `Baloise Create Headline` Bold 176px,
     white, and a `lead` text node, `Baloise Create Text` Regular 80px, white, `VERTICAL`
     auto-layout, `itemSpacing: 24`, no fill, `FILL` width). Override `component`/`lead` from the
     fixed category-copy table in `CONVENTIONS.md` (seeded for all 7 categories) — **never invent
     category copy**; if a category is somehow missing from that table, stop and ask the user for
     title/lead text before continuing, same hard-stop discipline as a missing design token.
   - **Documentation-frames row** (second child): a `HORIZONTAL` auto-layout frame
     (`Documentation Frames`), `HUG` both axes, `itemSpacing: 200`, no fill, `FILL` width. Starts
     empty — the first component's documentation frame (built in Phase 4) is the first thing
     appended into it. **There is no separate "Masters" overview row** — an earlier revision of
     this scheme had one (one dashed master `COMPONENT_SET` per component, parked above this row);
     it was dropped as redundant with each documentation frame's own "🔒 Component Set" panel, and
     also because Figma disallows moving a slot-bearing subtree (which every documentation frame
     is) into another component's slot, ruling out a shared slotted master for this row anyway.
3. **Appending a component's documentation frame** happens in Phase 4, same append-only rule,
   into the `Documentation Frames` row — see `PHASE-4-DOCUMENT.md`'s page-level structure section.

**Next: [`PHASE-4-DOCUMENT.md`](PHASE-4-DOCUMENT.md)** — once the full variant matrix is built,
the category page exists, and the component key is written back. Build the documentation page
before Phase 5's review, so that review covers the documentation page too, not just the raw
component set.
