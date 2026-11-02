# Changelog — superseded approaches and corrections

This file is the historical record for `ds-code-to-figma`: every approach that was tried, then
reverted or replaced, plus the "caught a bug, fixed it" narratives that produced today's rules.
**Nothing here is current instruction.** If you're building a component, you don't need this file
— read `CONVENTIONS.md` (and its `conventions/*.md` topic files) for the current rule, and
`PHASE-1..9` for the current workflow. Read this file only when you need the _why_ behind a rule,
or when deciding whether an old pattern on an existing Figma page should be migrated.

Entries are grouped by the area they affected, each roughly chronological within its group.

## Documentation page template (Phases 4–8)

- **Original template (superseded on `ds-badge`'s request → superseded again 2026-10-29):** the
  very first Phase 4 template was a single-column stack — bordered outer frame → Header → "Copy
  me" → "Variants" (compact single-axis) → "Main components" (full cross-product **table**, with
  header row, row-label column, grid-line rectangles, and the real master `COMPONENT_SET`
  `ABSOLUTE`-overlaid on top of that table chrome) → "Specs". Referenced the TapTap Design
  System's own Figma community file. `ds-close`, `ds-spinner`, `ds-icon`, and `ds-badge`'s
  original build all shipped this layout before it was replaced.
- **2026-10-29, first replacement:** a user-built `ComponentTemplate` reference frame
  (`⏳ Core / Indicator / Badge`, node `2160:3652`) introduced the layout that (with further
  revisions below) became current: full-width header over a 2-column body, "Main components"
  simplified to table-chrome-free "🔒 Component Set". The header became a real shared `Header`
  master component on the `🧰 Annotations` page (node `2180:17`) instead of hand-built text per
  page. The master `COMPONENT_SET` placed in "🔒 Component Set" was unlocked (the old template had
  locked it to stop a human dragging the grid out of alignment against the table it no longer
  has).
- **2026-10-29, second pass:** dark page (`#1e1e1e`), `Grey/0` body fill, and the old
  "`Preview` has no slot, fake it with an absolute-positioned background" workaround replaced by
  real Figma `SLOT` nodes via the new shared `Section`/`Preview`/`Title` components. Before this,
  the Copy me / Anatomy / Specs / Variants panels each used their own drifted-apart chrome (Copy
  me: borderless 4px radius; Anatomy: 2px border + 6px radius; Variants: 2px border, no radius).
  - First build attempt of the slot pattern tried `preview.createInstance()` then
    `instance.appendChild(contentFrame)` — **throws**: `"Cannot move node. New parent is an
instance or is inside of an instance"`, since an `INSTANCE`'s root only accepts overrides of
    structure the master already defines, not arbitrary new children. The next attempt
    `detachInstance()`'d the preview to work around this — **wrong fix**: it produces a
    look-alike frame severed from the master (invisible as `Preview` in the layers panel). Correct
    pattern (now in `PHASE-4-DOCUMENT-LAYOUT.md`'s section 0) was adopted the same day: insert real
    content directly into the master's actual `SLOT` node.
- **2026-10-29, third pass:** components grouped onto a shared `Core / <Category>` page instead of
  one page per component, with a `Category Header` instance and a `Documentation Frames` row —
  confirmed via a `Core / Indicators` dry run.
- **2026-10-29, fourth pass (reverted after testing):** the dry run's first attempt tried a
  reusable, slot-based `Category Frame` master component (mirroring `Section`/`Preview`) plus a
  separate "Masters" overview row (one dashed master `COMPONENT_SET` per component, parked above
  the documentation frames). Both were reverted:
  - Figma hard-rejects moving a subtree that itself contains `SLOT` instances into _another_
    slot's contents (`Cannot move node. Node is not allowed SLOT node`) — a documentation frame is
    already 2 slot-levels deep internally (Anatomy/Specs each nest a `Preview` inside a `Preview`)
    before it ever reaches a category-level slot. This is a real, current platform constraint —
    see `conventions/build-mechanics.md`'s "Platform limits" section.
  - The "Masters" row was dropped as redundant with each documentation frame's own "🔒 Component
    Set" panel, independent of the slot-nesting finding.
  - Only `Category Header` (plain text, no slot) survived as a shared master; the gradient
    `Category Frame` wrapper and `Documentation Frames` row are hand-built fresh per category page.
- **2026-10-29, fifth pass (reverted after testing):** the first `inverted` component built under
  the category-page scheme (`ds-spinner`) initially built **two** full side-by-side documentation
  frames (Primary + Inverted), wrapped together so the `Documentation Frames` row still only saw
  one appended item. The user caught that this still broke the real invariant — one component
  must have exactly one documentation frame, full stop, not just one row-append. Corrected the
  same day to the current approach: `inverted` only affects the "🔒 Component Set" panel, which
  stacks both sets vertically under sub-labels inside the one frame every other component also
  gets.
- **2026-10-30, header color drift:** the shared `Header` master's fill had silently drifted to
  the older navy `🔗 Alias/🎨 Surface/Primary` binding while every real built page (`ds-spinner`'s,
  then `ds-logo`'s) had already moved to `🌐 Global/🌈 Color/Purple/3` via undocumented
  per-instance overrides. Re-bound the master to purple so a fresh `createInstance()` matches
  what's actually live.

## Variant grouping (Phase 2)

- **Open-ended content-selection props (e.g. `ds-icon`'s `name`) originally became one crossed
  Figma variant property on a single shared set.** For `ds-icon`, after splitting `name` into 79
  top-level components, the user initially required `size`/`color` to be real crossed variant
  _properties_ on each of the 79 — 2,370 components total. Flagged as unmanageable; replaced with
  the current wrapper-`COMPONENT_SET` + Instance Swap library pattern (see
  `conventions/variant-grouping.md`), reducing `ds-icon` to 109 components (30 + 79) with no loss
  of capability.
- **Before that, pure content-selection props (no sub-props) were modeled as one crossed variant
  property too** — this made Figma's native cross-product explode for a large content set (tens
  of thousands of unbuildable components for an 80-icon × size × color example). Replaced with "N
  standalone top-level components, swapped via Instance Swap" — the conclusion that's now current
  rule in `conventions/variant-grouping.md`.
- **`ds-icon`'s "Main components" originally became N separate titled sub-grids** (one full
  variant cross-product table per split entity, each with the real per-entity `COMPONENT_SET`
  anchored onto its own table) once `size`/`color` became real crossed variants on each of the 79
  split entities. This was itself built on top of the old table-chrome template and is obsolete
  now that "🔒 Component Set" shows the wrapper set's native arrangement directly with no table
  chrome at all.

## Component Set labeling and rendering (Phase 8)

- **A 3+-axis `COMPONENT_SET` shipped once on `ds-spinner` with no row/column labels**, even
  though the labeling mechanism was already documented — the axis-count check was simply skipped.
  Caught by the user comparing the live panel against the `🧰 Annotations` page's own `github
example` reference. Fixed, and `PHASE-8-DOCUMENT-COMPONENT-SET.md` now opens its labeling section with an
  explicit "count axes first, this is required" line because of this miss.
- **2026-10-30, labeling exemption removed:** an earlier rule exempted "2-axis or fewer" sets from
  labeling, reasoning that Figma's own variant-property picker already made a simple axis legible.
  `ds-logo` (one axis, `size`) shipped with no labels at all and the user flagged it — the picker
  only shows axis names during an active selection in the Figma editor, not in a passive
  screenshot/read of the documentation page. The exemption was removed; every Component Set
  display is labeled now, including a single-axis set (current rule, see
  `conventions/component-set-rendering.md`). The same fix switched each `ds-logo` display clone
  from `layoutSizingHorizontal: 'FILL'` to a `resize()`-computed hug width, and moved the grid
  overlay's dashed dividers from `ABSOLUTE`-positioned children of an auto-layout parent to plain
  `x`/`y` children of a `layoutMode: 'NONE'` wrapper frame — the current preferred technique.
- **`ds-spinner`'s Component Set labels originally lived as an overlay inside the box**, forced
  there because the box itself used `FILL` sizing with no room outside it within the panel's fixed
  `minWidth` column. Once the box reverted to `HUG` (matching the `github example` reference more
  closely), labels moved outside into a real auto-layout wrapper — the current structure.

## Old table-overlay mechanics (fully retired)

These entries describe the pre-2026-10-29 "Main components" table-chrome template, where the real
master `COMPONENT_SET` was `ABSOLUTE`-overlaid on top of hand-built table chrome (header row,
row-label column, grid-line rectangles). **None of this applies to the current template** — there
is no table to overlay against anymore. Kept only because an already-pushed component's
not-yet-migrated page might still use this structure.

- A master `COMPONENT_SET` overlaid on a documentation frame had to be the page's _last_ child, or
  it rendered invisibly behind the frame's opaque fill (page-level z-order follows child array
  order).
- A master variant overlaid on a table with one-time absolute coordinates didn't move if anything
  above it in the same auto-layout stack changed size (e.g. a heading's font size changing the
  table's position) — required an explicit realignment pass after any such edit. A better fix,
  adopted for `ds-icon`'s 79-icon tables, was to `table.appendChild(set)` and reparent the set as a
  real child of the table frame, with `x`/`y` relative to the table instead of the page, so it
  moved automatically whenever the table did.
- This template locked the overlaid master set to stop a human dragging it out of alignment —
  dropped along with the table itself; the current template never locks any node it builds.

## Token resolution (Phase 1 / Phase 3)

- **2026-10-30 — token resolution moved from live Figma enumeration to a local lookup.** Phase 1
  originally resolved every `--ds-*` CSS var by having `use_figma` enumerate the entire `Design
Tokens`/`Design Responsive Tokens` collections (1,900+ variables combined) and loosely
  name-matching against the repo's `path.join('/')` convention — slow, expensive on context, and
  prone to truncated results on a large read (surfaced directly: a real run had to re-filter down
  to "just logo-related variables" after an initial read came back too large to use). Replaced
  with `scripts/figma-sync/lib/css-token-lookup.mjs`, which reads the same answer straight out of
  `packages/tokens/tokens/Base.tokens.json` — every synced token already carries its real Figma
  variable id in `$extensions["com.figma.variableId"]`, written there by `scripts/figma-sync`
  itself on push (`docs/adr/0017-direct-commit-variableid-backfill.md`). Phase 1 now resolves
  with zero Figma calls, and Phase 3 binds directly by id
  (`getVariableByIdAsync(figmaVariableId)`) instead of re-searching by name at build time. Live
  Figma search is still used for the one case the local JSON can't answer: finding an existing
  token for a value with no CSS-var binding at all.
- The lookup script also resolves a responsive-dimension token's `-mobile`/`-tablet`/`-desktop`
  breakpoint-suffixed CSS vars to each sibling's own id directly, and — for a token that's
  already "Device-eligible" (MVP-scoped in `scripts/figma-sync`) — surfaces its real routing
  variable id too, letting Phase 3 skip hand-creating a duplicate routing variable in that case.
  As of 2026-10-30 no `Component.*`-layer token is Device-eligible yet (only `Device.*`-layer
  tokens are), so every component-level responsive binding pushed so far still goes through
  Phase 3's hand-built routing variable — this is forward-looking, not yet exercised for a real
  component.

## Retired sections

- **2026-10-30 — the "🛠 Variants" left-column section is retired.** Every `CONVENTIONS.md` entry
  that described building it (the TapTap-layout note, `ds-badge`'s sidebar-height clipping fix,
  the `Section`/`Preview` box-treatment history) is obsolete. The left column is now Copy me →
  Anatomy → Specs only. The right column's `Title` component set still carries an unused
  `kind=variants` option from before this change — don't instance it. No replacement is defined
  yet; the user plans to redesign this later.
