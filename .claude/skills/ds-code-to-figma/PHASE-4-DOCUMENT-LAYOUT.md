# Phase 4 — Document: Layout (header, page shell, body columns)

**You are here:** assumes [`PHASE-3-BUILD.md`](PHASE-3-BUILD.md) has built and confirmed the full
variant matrix as a real Figma `COMPONENT_SET`, with its key written back to `<name>.figma.md`.
This phase is the first of five documentation sub-phases that together build the per-component
**documentation page**: this phase lays the foundation — the category page shell, the outer frame,
the purple header, and the 2-column body skeleton — that
[`PHASE-5-DOCUMENT-COPY-ME.md`](PHASE-5-DOCUMENT-COPY-ME.md),
[`PHASE-6-DOCUMENT-ANATOMY.md`](PHASE-6-DOCUMENT-ANATOMY.md),
[`PHASE-7-DOCUMENT-SPECS.md`](PHASE-7-DOCUMENT-SPECS.md), and
[`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md) then fill in. Build this
after Phase 3 confirms the variant matrix looks right — don't start it on an unconfirmed or
partially-built component set. The full five-sub-phase sequence must finish before
[`PHASE-9-REVIEW.md`](PHASE-9-REVIEW.md)'s review, so that review covers the documentation page
too, not just the raw component set.

## What this is, and why we have it

The raw component set that Phase 3 produces is not the deliverable on its own. Every component
pushed into Figma also gets a readable **documentation page** — a single Figma frame that shows a
human how to find, copy, and understand every variant of the component, built from real instances
and the real component set, not redrawn approximations.

This document is a **fixed template, not a per-component judgment call** — deviating from its
_structure_ is wrong. Adapt _content_ (which props, which tokens, which axis) to the component at
hand; never improvise a different layout.

**Current structure:** a full-width purple header over a 2-column body (left: Copy me / Anatomy /
Specs stacked; right: a single "🔒 Component Set" panel), on a dark (`#1e1e1e`) page, with every
section built from two shared Annotations components — `Section` and a real-slotted `Preview` —
and grouped with every other component in its category onto one shared `Core / <Category>` page
(see [Page-level structure](#page-level-structure-once-per-category) below). A true
`inverted`/dark-context axis gets exactly **one** documentation frame, never two (see
[`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md)'s "Handling an `inverted`
axis" section).

This template went through five revisions on 2026-10-29–30 to reach this state (single-column →
blue-header-2-column → dark page + real slots → shared category pages → dropping a redundant
Masters row → collapsing `inverted` to one frame). **None of those intermediate states are current
instruction** — see [`CHANGELOG.md`](CHANGELOG.md) if you need the history (e.g. deciding whether
an existing not-yet-migrated page should be brought up to date). `ds-close`, `ds-spinner`,
`ds-icon`, and `ds-badge`'s original pages still use an older layout and are not yet migrated —
see `CONVENTIONS.md`/`CHANGELOG.md` for which.

This phase, and the four that follow it, share one canonical live reference and one page-level
grouping mechanism — both described below, once, since every sub-phase builds against the same
nodes.

## Table of contents

- [Canonical reference — inspect before you build](#canonical-reference--inspect-before-you-build)
- [When to use this](#when-to-use-this)
- [What to do](#what-to-do)
- [Page-level structure (once per category)](#page-level-structure-once-per-category)
- [Page and outer frame](#page-and-outer-frame)
- [0. Shared `Section`/`Preview`/`Title` components](#0-shared-sectionpreviewtitle-components)
- [1. Header](#1-header)
- [2. Body — 2-column layout and column sizing](#2-body--2-column-layout-and-column-sizing)
- [Cross-cutting build pitfalls](#cross-cutting-build-pitfalls)

## Canonical reference — inspect before you build

**For the per-component documentation frame's own internal structure** (header, 2-column body,
every section's real `Section`/`Preview`/`Title` nesting, the Component Set panel) — **don't
rebuild it from the prose below alone.** The **`Documentaion`** frame on the
`⏳ Core / Indicator / Badge` page (node `2204:8190` — yes, that's the real node name, typo and
all; don't "fix" it when referencing it) is the **sole primary canonical live reference** for this
internal structure. Inspect it (`get_metadata` + targeted property reads) before building. **This
supersedes the older `ComponentTemplate` frame (node `2160:3652`) entirely** — `ComponentTemplate`
was always "a structural mockup, not a fully-populated reference" (it has no Anatomy/Specs section
and uses the pre-slot `Preview` workaround); don't inspect it when building a new component's page.
It's left in the file as historical context only.

**For the page-level grouping mechanism** (category header, masters row, documentation-frames
row — everything a component's own frame sits _inside_ now) — the **`Core / Indicators`** page
(node `2412:1250`, root content frame `2412:1251`) is the canonical live reference, built
2026-10-29 as this mechanism's own dry run (see [Page-level structure](#page-level-structure-once-per-category)
below). `Documentaion`/`Badge Documentation`'s frame-internal structure is unaffected by this —
only where that frame now lives (as a child of a shared page's `Documentation Frames` row, not the
page's sole top-level content) changed.

**`ds-close`'s reference pages (`Close Documentation`, node `1993:2`, and `Inverted Close
Documentation`, node `1993:5904`) are still the canonical reference for everything this template
doesn't change**: the diagram/table construction inside each section, focus-state construction, and
the overall token-binding discipline. **Their two-frame `inverted` split is NOT a reference for
how to handle `inverted` under the current scheme** — see
[Handling an `inverted` axis](#handling-an-inverted-axis-one-frame-stacked-component-sets) below
for the current one-frame/stacked-component-sets approach; `ds-close`'s own pages predate that
correction and are not migrated. Read `Documentaion` and `ds-close` together — `Documentaion` for
layout/header/Section-nesting/Component Set, `ds-close` for everything else — rather than assuming
one alone is complete. `ds-close`'s own Copy me box /
Anatomy box panels predate the shared `Section`/`Preview` components and each still
use their own (inconsistent) hand-built chrome — don't copy their individual fills/strokes/radii
for the panel wrapper itself; use `Section`/`Preview` instances there instead, per section 0 below.

**Don't use `ds-badge`'s own pre-2026-10-29 live pages, or `ds-spinner`/`ds-icon`'s current live
pages, as a structural reference** — they use the superseded single-column white-header layout (or,
for `ds-badge`, the intermediate blue-header-but-pre-slot layout). Only `Documentaion` reflects the
current template.

Before building a new component's Phase 4 page, run a read-only `get_metadata` / targeted property
reads against `Documentaion`'s node IDs (and `ds-close`'s, for the parts it still covers) to see
the real current hierarchy, fills, fonts, bound variables, and auto-layout settings — then mirror
that structure, rather than reconstructing positions/alignment from this document's words each
time. If you change the template's structure during a future run, update this reference pointer if
the canonical node IDs change.

## When to use this

Build this after Phase 3 confirms the variant matrix looks right — don't start it on an unconfirmed
or partially-built component set. This phase (and the four sub-phases that follow it) must finish
before Phase 9's visual-regression review, so that review covers the documentation page too, not
just the raw component set.

## What to do

At a high level, in order:

0. Confirm the component's category page (`Core / <Category>`) already exists with its shell
   built — Phase 3 creates it if this is the first component in that category (see
   `PHASE-3-BUILD.md`'s "Category pages" section). Don't rebuild the category header or the two
   rows if they already exist; see
   [Page-level structure](#page-level-structure-once-per-category) below.
1. Build the outer bordered frame for this component's own documentation frame (see
   [Page and outer frame](#page-and-outer-frame)) — this is the "<Component> Documentation" frame
   that gets appended into the category page's `Documentation Frames` row at the very end of
   [`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md), not a page of its own.
2. Build the [Header](#1-header) — instance the shared `Header` component (`🧰 Annotations` page,
   node `2180:17`) and override its text, don't rebuild it from scratch.
3. Build the [body's 2-column shell](#2-body--2-column-layout-and-column-sizing) — a left
   "documentation" column and a right "component" column, each independently sized.
4. Iterate on the header/shell layout with the user (screenshot checkpoint) before moving on —
   the exact structure is something to confirm visually, same as the variant matrix itself in
   Phase 3. The remaining content (Copy me, Anatomy, Specs, Component Set) is filled in by the
   next four phases, in order.

## Document structure

### Page-level structure (once per category)

**Confirmed live via the `Core / Indicators` dry run (2026-10-29, two passes — see the note at the
end of this section on why the first pass's "Masters row" and single-slotted master component were
dropped).** This section describes content that exists **once per category page**, built by
whichever component is first pushed into that category (see `PHASE-3-BUILD.md`'s "Category pages"
section for the full find-or-create logic) — every subsequent component in the same category only
_appends_ into the `Documentation Frames` row this section describes, it never rebuilds the rest.

- **Page**: named `Core / <Category>` (Title Case, plural, no `⏳`/`✅` emoji), `page.backgrounds`
  literal solid `#1e1e1e` — same dark-page convention the per-component template already used,
  just set once at the category-page level now instead of once per component page.
- **One top-level frame, `Category Frame`** (hand-built fresh on each category page — **not** an
  instance of a shared master; see the note below on why): `VERTICAL` auto-layout, `HUG` both
  axes, `400`px padding on all sides, `itemSpacing: 200`, `cornerRadius: 24`, `clipsContent:
false`, fill a two-stop `GRADIENT_LINEAR` (stop 0 `{r:0, g:0.051, b:0.431}`, stop 1 `{r:0,
g:0.027, b:0.224}`, transform `[[0.701, 0.299, 0], [-0.299, 0.299, 0.5]]` — a literal gradient,
  not a bound token; same "deliberate literal" treatment as the page's own `#1e1e1e` background).
  This is the page's _only_ top-level child — the category header and the documentation-frames row
  both nest inside it. Confirmed live: `2412:1251`.
- **Category Header** (first child of `Category Frame`): an `INSTANCE` of the shared `Category
Header` master component (`🧰 Annotations` page, node `2412:1247`) — a lightweight sibling of
  `Header`/`Title`/`Section`/`Preview`, **not** the full per-component `Header` (no kicker,
  version, review-status, or Storybook link, since none of that is category-scoped). Just two text
  nodes in a `VERTICAL` auto-layout (`itemSpacing: 24`, no fill), `FILL` width: `component`
  (`Baloise Create Headline` Bold, **176px**, white) and `lead` (`Baloise Create Text` Regular,
  **80px**, white). Override both from the fixed category-copy table in `CONVENTIONS.md` — **never
  invent category copy on the fly**; every one of the 7 categories (`actions`, `forms`,
  `indicators`, `media`, `navigation`, `overlays`, `structure`) already has a seeded title/lead
  there.
- **Documentation-frames row** (second child of `Category Frame`, name `Documentation Frames`):
  `HORIZONTAL` auto-layout, `HUG` both axes, `itemSpacing: 200`, no fill, `FILL` width (matches
  the gradient card's content width). Holds one full `"<Component> Documentation"` outer frame per
  component — everything described in [Page and outer frame](#page-and-outer-frame) onward is what
  goes inside _one_ of these frames, unchanged from the single-page-per-component version of this
  template. Confirmed live: `2412:1256`. **Append-only** — a new component's frame always goes at
  the end via `framesRow.appendChild(outerFrame)`; never insert at an alphabetically-correct
  position or reposition an existing sibling's frame, even if that leaves the row out of strict
  alphabetical order over time.

**Why there's no shared, slotted "Category Frame" master component, and no separate "Masters"
overview row** (both tried and reverted during the `Core / Indicators` dry run): a `COMPONENT_SET`
or documentation frame already uses `Preview`/`Section`'s real `SLOT` mechanism internally (Anatomy
and Specs each nest a `Preview` inside another `Preview`'s slot already). Figma hard-rejects moving
a subtree that itself contains `SLOT` instances into _another_ slot's contents
(`Cannot move node. Node is not allowed SLOT node`, confirmed via isolated testing: a plain
rectangle drops into a slot fine, a full documentation frame does not) — there's an undocumented
slot-nesting-depth limit, and a fully-built documentation frame is already at or past it internally
before it ever reaches a category-level slot. This rules out wrapping the whole category page (or
even just the row of real documentation frames) in one more slotted master. **Only the `Category
Header` itself is a shared master** — plain text, no slot, no nesting-depth conflict — everything
around it (the gradient `Category Frame`, the `Documentation Frames` row) is hand-built fresh per
category page, same discipline as the gradient/padding values themselves (deliberate literals, not
tokens). The earlier "Masters" overview row (one dashed-bordered master `COMPONENT_SET` per
component, parked above the documentation frames) was also dropped in the same revision — it
duplicated what the "🔒 Component Set" panel already shows inside each component's own
documentation frame, so keeping both was redundant once the row-of-full-frames layout was built
and reviewed. (From: `Core / Indicators` dry run, second pass, 2026-10-29 — see `conventions/build-mechanics.md`'s
"Platform limits" section on the slot-nesting-depth limit.)

### Page and outer frame

This section describes **one component's own outer frame** — the thing that gets appended into
the category page's `Documentation Frames` row, per
[Page-level structure](#page-level-structure-once-per-category) above. The page-level background,
top-level layout, and category header are handled once per category, not per component; don't
repeat that setup here.

- **Page background: literal solid `#1e1e1e`**
  (`page.backgrounds = [{ type: 'SOLID', color: { r: 0.1176, g: 0.1176, b: 0.1176 } }]`) — not a
  design token, no token resolves to this exact value. Set once, when the category page itself is
  first created (see [Page-level structure](#page-level-structure-once-per-category) above) — not
  something a later component sharing the page needs to (re-)set. Confirmed live on `Documentaion`'s
  original page (`⏳ Core / Indicator / Badge`) and, under the new scheme, on `Core / Indicators`
  (`page.backgrounds[0].color` byte-identical to `#1e1e1e` in both cases).
- **The small "Documentation" label floating above the card in a screenshot is not a built
  element at all** — it's Figma's own canvas chrome displaying the outer frame's **name**, the same
  way Figma always labels a frame above itself on the canvas, whether or not it's a direct child of
  the page. Confirmed by searching for an actual `TEXT` node containing "Documentation" on the live
  reference page — none exists. **Give the outer frame a descriptive name** (the live reference
  uses the literal frame name `Documentaion` — note the typo; new builds should use a corrected,
  descriptive name like `"<Component> Documentation"`, there is no requirement to reproduce the
  typo) so the same label
  effect appears naturally; don't construct a separate text node to fake it.
- **One outer frame, no border.** Fill bound to `🔗 Alias/🎨 Surface/White` (`VariableID:137:344`,
  the same "white" alias token as before). **Corner radius**: all four corners bound to
  `🌐 Global/📏 Dimension/Radius/12` (`VariableID:137:2640`), unchanged. **No stroke** (`strokes:
[]`) — correcting an earlier revision of this document, which added a 2px `GreyLight` border
  here on the assumption that it should stay for consistency with the other bordered panels. Per
  explicit user correction, the outer frame stays borderless, matching what the live `Documentaion`
  reference always had. The card's strong contrast against the dark `#1e1e1e` page background is
  sufficient on its own — don't re-add a stroke here. No label above the frame (the new page-level
  "Documentation" label above is a different, separate element — see above).
- **No vertical auto-layout padding on the outer frame itself** — the header spans edge-to-edge
  (its own 40px padding provides the visual margin), and the body below it also spans edge-to-edge.
  The outer frame is `VERTICAL` auto-layout, `itemSpacing: 0`, `HUG` on both axes, `clipsContent:
true` (so the header's square top corners are clipped to the outer frame's rounded corners).
- **The `body` frame (the 2-column wrapper directly below the header — see
  [2. Body](#2-body--2-column-layout-and-column-sizing) below) has its own fill (changed
  2026-10-29): bound to `🌐 Global/🌈 Color/Grey/0` (`VariableID:137:2729`, resolves to
  ≈`#FAFAFA`)** — not plain white, and not the outer frame's own `Alias/Surface/White` token. This
  is a different token from the outer frame's fill, confirmed live and deliberate: the body reads as
  a very slightly warmer/softer off-white against the header's purple and the page's near-black,
  rather than a flat pure white.
- **No inter-section divider lines anymore.** The prior template separated every section with a 2px
  `Alias/Border/Color/GreyLight` divider rule; this is dropped. The header's own purple fill is now
  the only hard visual break; every other section-to-section gap in the left column comes from each
  section's own **40px top padding**, not a parent `itemSpacing` or a drawn divider (confirmed live:
  the left `documentation` column itself has `itemSpacing: 0`). Still use 2px for every stroke that
  _does_ exist (outer frame border, panel borders, the Component Set's dashed border, grid-line
  rectangles inside the Anatomy/Specs diagrams) — only the dedicated divider-rectangle convention
  is gone.

### 0. Shared `Section`/`Preview`/`Title` components

**Same-day revision (2026-10-29, second pass): `Preview` now has a real Figma `SLOT` node, and a
new `Section` component bundles a `Title` + a `Preview` together.** This replaces the
absolute-positioned-background workaround entirely — confirmed by direct inspection of both the
`🧰 Annotations` page and the live `Documentaion` reference, where real content sits as genuine
children of the slot, not an overlay. **Don't use the old workaround on a fresh build** — the
rest of this section describes the current, real mechanism.

**The three components, all on the `🧰 Annotations` page:**

- **`Title`** (`COMPONENT_SET`, node `2199:13`) — one `kind` variant per section:
  `kind=copy-me` (👉 Copy me), `kind=anatomy` (📐 Anatomy), `kind=specs` (📏 Specs),
  `kind=component-set` (🔒 Component Set). Each variant is just the
  emoji + bold 28px `Baloise Create Headline` heading text, nothing else — same visual spec every
  section heading has always used, now as a reusable instance instead of hand-built text per
  component. (The set also still has an unused `kind=variants` option left over from a retired
  "🛠 Variants" section this template no longer builds — don't use it.)
- **`Preview`** (`COMPONENT_SET`, node `2192:7497` — **not** `2182:2`, which is only its `Flat`
  variant child; get the `Default` variant via
  `previewSet.children.find(v => v.name === 'Variant=Default')`) — the bordered/rounded content
  box: white fill, 2px stroke bound to `🔗 Alias/▭ Border/Color/GreyLight` (`VariableID:137:80`),
  all four corner radii bound to `🌐 Global/📏 Dimension/Radius/6` (`VariableID:137:2639`, 6px —
  this file has no 8px radius token). **Contains a real `SLOT` node** (confirmed via
  `node.findOne(n => n.type === 'SLOT')`) with a hidden `Placeholder` frame inside it by default.
  Two variants control the slot's inset:
  - **`Default`**: slot inset 14px on all sides (content sits inside visible padding).
  - **`Flat`**: slot inset 0 (content fills the box edge-to-edge) — used when the box is itself
    just an outer container for one or more further nested `Default`-variant `Preview`s (see the
    per-section nesting rules below), not a panel with its own visible content directly.
- **`Section`** (`COMPONENT_SET`, node `2192:5987`) — a `Title` + a `Preview` stacked vertically
  (`itemSpacing: ~24`, `40px` top/left padding matching every section's established padding), with
  the same `Default`/`Flat` variant property as `Preview` (controls the nested `Preview`'s own
  variant). This is the **primary building block for every left-column section** (Copy me,
  Anatomy, Specs) — instance `Section`, pick the right `Title` kind via
  `instance.swapComponent`/`setProperties` if needed (or just trust the matching default per
  section), and insert real content into the slot.

**How to insert content into a real slot** (confirmed working, not the old `appendChild`-throws
limitation — that limitation is specific to an `INSTANCE`'s own root, not a `SLOT` node inside
one):

```js
const sectionInstance = sectionComponent.createInstance()
const previewInstance = sectionInstance.findOne(n => n.name === 'Preview')
const slot = previewInstance.findOne(n => n.type === 'SLOT')
// Remove or hide the placeholder, then append real content directly into the slot:
const placeholder = slot.findOne(n => n.name === 'Placeholder')
if (placeholder) placeholder.visible = false // matches the master's own default state
slot.appendChild(realContentNode) // works — SLOT accepts children, unlike an INSTANCE root
```

**A nested `Preview` instance (the `Flat`-outer + `Default`-inner pattern below) should be set to
`layoutSizingHorizontal = 'FILL'` once appended into its parent slot — not left at the master's
small default width, and not pinned to a hardcoded literal width via `resize()` either.** An
earlier pass in this same revision used `nestedPreview.resize(656, 297)` as a workaround (see
`conventions/build-mechanics.md`'s note on nested `Preview`s not auto-resizing); per explicit user
correction, prefer `FILL` sizing instead, since the outer slot is itself auto-layout (`VERTICAL`)
and `FILL` lets the nested `Preview` track the real slot width dynamically rather than a number
baked in at build time. **Height stays flexible too, never a baked-in fixed number**: call
`resize(w, h)` once to correct the master's wrong default height, then immediately set
`node.primaryAxisSizingMode = 'AUTO'; node.layoutSizingVertical = 'HUG'` so the node goes back to
genuinely hugging its real content — `resize()` alone leaves `layoutSizingVertical: 'FIXED'`
("Feste Höhe"/"Fixed height" in the inspector), which silently clips or under-fills if the slot's
content ever changes later. See `conventions/build-mechanics.md`'s note on this (caught on `ds-logo`'s
Anatomy section). Verify `layoutSizingVertical` reads back `'HUG'` before moving on — don't assume
a later sibling append will re-trigger the hug for you.

**Per-section nesting pattern — confirmed against the live `Documentaion` reference, not
assumed:**

- **Copy me**: `Section` in `Default` variant. The single representative instance (e.g. one
  `Badge` instance) goes **directly** into the `Preview`'s slot — no further nesting.
- **Anatomy**: `Section` in `Flat` variant (zero-inset outer container) — then **one** nested
  `Preview` instance in `Default` variant goes inside that outer slot, and the real
  diagram/legend content goes inside the nested `Preview`'s own slot. Two layers of `Preview`
  total: outer `Flat` (structural), inner `Default` (the actual bordered panel holding content).
- **Specs**: `Section` in `Flat` variant, same outer-container role as Anatomy — but with
  **one nested `Default`-variant `Preview` per Variants-axis option** (e.g. `base`/`lg`/`sm`, one
  stacked below the next), each nested `Preview`'s slot holding that option's own
  preview+legend card.
- **Component Set**: **not** a `Section`/`Preview` at all — see
  [`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md). Just a bare `Title` instance
  (`kind=component-set`) directly in the right column, followed by the real `COMPONENT_SET` with
  its own dashed border — the real variant grid should never sit inside another bordered `Preview`
  box.

**Never fork a one-off copy of `Title`/`Preview`/`Section` for a single component** — if the
chrome itself needs to change, edit the shared master once on the Annotations page and every
instance across every component's page picks it up automatically, exactly like `Header`. **Never
`detachInstance()`** any of these three just to get a more "editable" copy — that severs the link
entirely and stops picking up future master edits.

This supersedes the different box treatments the pre-2026-10-29 template had drifted into —
Copy me's 4px `Alias/Radius/Base` radius with no border vs. Anatomy's correct 2px border + 6px
radius. All sections now share one chrome via `Preview`, composed through `Section`.

### 1. Header

**Don't build the header from scratch per component — it's a real, reusable Figma component now.**
It's called the **component documentation header** (not "navy header" — that name is stale, see
below) and lives on the `🧰 Annotations` page as a `COMPONENT_SET` (node `2389:15007`) with **two
variants that must be kept in sync**: `Variant=Purple` (`2180:17`, purple surface, white
text/icons — **this is the one to use for building doc frames**; formerly named
`Eigenschaft 1=Standard`, renamed from the old German property name) and `Variant=Primary`
(`2389:15008`, navy surface; formerly `Eigenschaft 1=Variante2`). Any structural change to one —
e.g. the `links` row addition below — must be applied to both; per-component instances only ever
use one variant at a time, but **default to `Variant=Purple`** for every new/rebuilt documentation
page. Create an `INSTANCE` of the `Variant=Purple` variant (`headerComponent.createInstance()`),
`appendChild` it as the outer frame's first child, set `layoutSizingHorizontal = 'FILL'`, then
override its text nodes directly (same
instance-text-override technique used everywhere else in this template — find each node by name
via `instance.findOne`/`findAll` and set `.characters`, no component properties involved):

- `component` → the component name (e.g. `"Badge"`).
- `kicker` → **`"Core / Category"` only — no component name, and no `⏳`/`✅` emoji prefix**
  (changed 2026-10-29; see the review-marker note below).
- `review-status` (an `INSTANCE` sibling of `component` inside the `title` frame) → the review
  marker, now a dedicated pill component instead of text. **Always build with
  `status=review`** (`instance.swapComponent()` to the `status=review` variant, or confirm it's
  already the default) **— never `status=approved`.** This is the same standing rule as before
  (this skill never marks a page as human-approved on its own), just moved from an emoji text
  prefix onto this component's variant choice.
- `lead` → the component's JSDoc lead paragraph.
- `wordmark` (4 instances: label/value × version/last-updated rows, in that order — index them via
  `findAll`, not by assuming a single node) → `"version"` / `"v<x>"` / `"last updated"` /
  `"<DD.MM.YYYY>"`. The two label wordmarks (`"version"`, `"last updated"`) never change; only the
  two value wordmarks need overriding per build.
- `links` (a `links` wrapper frame holding 3 `link-row-*` frames, each an icon instance + a
  `link-*` text node — see the `status` frame's structural description below) → all three rows'
  text stays as-is (`"View in Storybook ↗"` / `"View in Toky ↗"` / `"View on GitHub ↗"`); set the
  real hyperlink per component on each row's text node via `linkText.setRangeHyperlink(0,
linkText.characters.length, { type: 'URL', value: <url> })` — the master has no hyperlinks set,
  since all three are component-specific and every one of them is mechanically derivable from
  inputs this skill already has (component name, category, Storybook story ID), so there's no
  reason any of the three should ever ship blank:
  - **Storybook** (`link-storybook`) →
    `https://helvetia-design.vercel.app/?path=/docs/<storyId>` — base URL confirmed live
    2026-10-30 (`ds-logo`'s build; previously unknown, left blank on `ds-spinner`'s page as a
    result). `<storyId>` is the `Overview` tab's `storyId` in the component's own
    `apps/storybook/src/components/<category>/<name>/<name>.doc-config.ts`
    (`<NAME>_DOC_CONFIG.tabs[0].storyId`, e.g. `components-media-logo-logo--logo` for Logo) — read
    it from that file, never guess/derive it from the component name alone (the kebab-cased
    `<category>-<name>-<name>--<name>` pattern happens to hold for Logo but isn't guaranteed for
    every component). If `doc-config.ts` doesn't exist yet for this component, this is the one
    case still allowed to stop and ask per the standing rule above.
  - **Toky** (`link-toky`) → `https://helvetia-toky.vercel.app?filter=<component name, lowercase>`
    — e.g. `?filter=badge` for Badge. Matches the component name exactly as it appears in token
    names (`🧩 Component.Badge...`); Toky's search already normalizes case/separators, so the exact
    casing passed here doesn't matter, but lowercase matches the convention used elsewhere in this
    doc.
  - **GitHub** (`link-github`) →
    `https://github.com/helvetia-design/system/tree/main/packages/core/src/components/<category>/<name>`
    — the component's real source folder, `<category>`/`<name>` matching the path under
    `packages/core/src/components/`.

**Standing rule: every time this skill writes to a component's documentation page — not just on
first creation — it must reset `review-status` to `status=review`, refresh both the version and
last-updated values, and re-set all three `links` hyperlinks, unconditionally, even if they look
already correct.** A human may have manually flipped `review-status` to `status=approved` after
reviewing an earlier version of the page; any further skill-driven edit to that same page
invalidates that approval, since the content just changed again — swap it back to `status=review`
every time, never leave (or re-apply) `status=approved` on this skill's own authority. Likewise,
don't skip the version/timestamp/link overrides just because a prior run already set them — re-read
`packages/core/package.json`'s `version` field, the real current date, and recompute all three link
URLs fresh on every write, since any of them may have drifted since the page was last touched (a
renamed/recategorized component changes its GitHub and Toky URLs; a new Storybook build can change
the story ID). **Never leave a `link-*` text node with no hyperlink or a stale one** — if a build
can't resolve one of the three URLs (e.g. no `doc-config.ts`/story ID yet for Storybook), stop and
ask rather than silently shipping that row dead. This applies to any write to this component's
page, not only the first-ever Phase 4 build — e.g. a later Phase 4 re-run prompted by a code change,
even though this skill's v1 scope doesn't otherwise define an update/reconcile flow.

**Never edit the master component's own structure/styling per build** — if the header's design
needs to change, edit the shared `Header` master once (on the Annotations page) and every existing
instance across every component's page picks it up automatically; don't fork a one-off copy for a
single component. If you do need to change the master, update this document's description of its
structure below to match, same discipline as every other shared annotation component.

The rest of this section documents the `Variant=Purple` component documentation header's internal
structure for reference (e.g. when editing the shared master itself) — confirmed live on the
`Header` master component's own node tree:

- **Fill**: bind to `🌐 Global/🌈 Color/Purple/3` (`VariableID:137:2756`) — **not**
  `🔗 Alias/🎨 Surface/Primary` (the navy token used on `Variant=Primary`, and elsewhere in this
  template as the "dark preview surface," e.g. the `inverted`-axis section below, which is
  unrelated and unaffected by this). A fresh `createInstance()` of `Variant=Purple` now correctly
  starts purple with no override needed — don't reintroduce navy here (see `CHANGELOG.md` for the
  drift this corrected).
- **Layout**: `HORIZONTAL`, padding `40` on all four sides, `itemSpacing: 16`,
  `primaryAxisAlignItems: 'SPACE_BETWEEN'` (pushes the title block left and the info block right),
  `counterAxisAlignItems: 'MIN'` (top-aligned), `primaryAxisSizingMode: 'FIXED'` (spans the full
  outer-frame width), square corners (`cornerRadius: 0` on all four) — the outer frame's own
  rounded corners clip this via `clipsContent`.
- **Left side — `heading` frame** (`VERTICAL`, `itemSpacing: 24`), two children:
  - **Title block** (`VERTICAL`, `itemSpacing: 0`, title and kicker touch with no gap):
    - `component`: the component name, e.g. `"Badge"`. `Baloise Create Headline` **Bold**, 48px,
      fill bound to `🔗 Alias/🔤 Text/Color/White`.
    - `kicker`: **just the breadcrumb, `"Core / Category"`** — no component name, no `⏳`/`✅`
      emoji prefix. `Baloise Create Headline` **Light**, 18px, fill bound to
      `🔗 Alias/🔤 Text/Color/White`. On `Documentaion` (`ds-badge`'s original, pre-category-page
      build) this reads `"Core / Indicator"` (singular, matching that era's per-component page
      name). **For any component built under the new shared category-page scheme, match the
      category page's own name exactly — plural, e.g. `"Core / Indicators"`** — don't reintroduce
      the old singular form; the two should read identically since the kicker is literally
      restating which page the component lives on.
    - **The `⏳`/`✅` review-marker mechanism lives entirely on the `review-status` pill instance**
      (see above), not on any text, emoji, or page name. The older per-component pages still carry
      a `⏳` prefix in their own page name (e.g. `⏳ Core / Indicator / Badge`) from before this
      convention existed — that's legacy and is not retroactively cleaned up (see "new components
      only" in `PHASE-3-BUILD.md`'s "Category pages" section). **New category pages never get an
      `⏳`/`✅` prefix at all** — the page name is just `Core / <Category>`, full stop; the emoji
      convention is fully retired going forward, not replaced with an always-`⏳` version.
    - **No second `instance` qualifier line is visible in this header** (unlike the prior
      template's two-line `heading`). **An `inverted` axis no longer needs a kicker qualifier at
      all** — per [the stacked-component-sets handling](#handling-an-inverted-axis-one-frame-stacked-component-sets),
      there's only ever one frame/one header per component now, so `kicker` always stays the plain
      `"Core / <Category>"` with no `" · Inverted"` suffix. (An earlier revision of this note
      suggested appending `" · Inverted"` for a second, dark-themed frame — that two-frame approach
      was built once on `ds-spinner` then explicitly reversed; this note is corrected accordingly.)
  - **`body` frame** (`VERTICAL`): the lead paragraph (`lead`), same hug-height discipline as
    before (never `resize()` the frame directly — see the original gotcha, still applies). Sourced
    verbatim from the component's JSDoc comment, 16px `Baloise Create Text` Regular, fill bound to
    `🔗 Alias/🔤 Text/Color/White`.
- **Right side — `status` frame** (`VERTICAL`, `itemSpacing: 16`, `counterAxisAlignItems: 'MIN'`,
  `layoutSizingVertical: 'HUG'`, `layoutSizingHorizontal: 'HUG'`, padding `24`/`20` — see live node
  for exact values) — three children in order: `meta`, `divider`, `links`.
  - **`meta` frame** (`VERTICAL`, `itemSpacing: 10`, `layoutSizingHorizontal: 'FILL'`) — two rows:
    1. **Version row** (`HORIZONTAL`, `itemSpacing: 16`): label `"version"` (`Baloise Create Text`
       Regular 16px white) + value `"v<core package version>"` (`Baloise Create Text` **Bold** 16px
       white, e.g. `"v0.0.6"`, from `packages/core/package.json`'s `version` field at build time).
    2. **Last-updated row** (`HORIZONTAL`, `itemSpacing: 16`): label `"last updated"` (Regular 16px
       white) + value `"<DD.MM.YYYY>"` (Bold 16px white, the actual current date at build/edit
       time).
  - **`divider`**: a 2px rounded-rectangle, fill bound to `🔗 Alias/🎨 Surface/Primary`'s divider
    token (`VariableID:137:2762`).
  - **`links` frame** (added 2026-10-30; `VERTICAL`, `itemSpacing: 10`, `counterAxisAlignItems:
'MIN'`, hug/hug) — 3 `link-row-*` children, each `HORIZONTAL` auto-layout (`itemSpacing: 8`,
    `counterAxisAlignItems: 'CENTER'`) holding one 16×16 icon `INSTANCE` + one `link-*` text node
    (Bold, 16px `Baloise Create Text`, white, `UNDERLINE` decoration, real Figma hyperlink via
    `setRangeHyperlink` — see the `links` bullet above for each row's text/URL). **Give every
    `link-row-*`/`links` frame an explicit empty `fills = []`** — `figma.createAutoLayout()`
    defaults new frames to a solid white fill, which (being the same color as the white icon/text
    on top) silently renders as a solid white block instead of the icon+link content; this bit us
    once when building this structure and is easy to reintroduce when adding a 4th link later.
    - **Storybook / Toky rows**: icon is an `INSTANCE` of the shared `Icon / helvetia-ds` component
      (also lives on the `🧰 Annotations` page, next to `Header`) — the generic Helvetia DS mark,
      since neither Storybook nor Toky has a distinct brand icon anywhere in this file or the repo.
      Reused as-is for both; don't fork a second copy.
    - **GitHub row**: icon is an `INSTANCE` of `🔎 Iconography`'s `Icon / github` library component.
      Its vector fill ships as a flat library color, not white — override the instance's vector
      fill to `🔗 Alias/🔤 Text/Color/White` (same variable the link text uses) per instance, since
      imported library instances don't auto-match the dark header surface.
    - **On `Variant=Primary`** (the navy variant, formerly `Eigenschaft 1=Variante2`), all of the
      above is identical except the color: both icon types' vector fills bind to
      `VariableID:137:288` (the same variable `link`'s own text already uses on that variant)
      instead of `🔗 Alias/🔤 Text/Color/White` — this is **not** the variant this skill builds
      against by default (see section 1's header note — always use `Variant=Purple`), so re-verify
      this variable live against the master before relying on it. Only recolor the leaf `VECTOR`
      nodes inside each icon instance, never the
      instance/frame container itself — same `fills = []` gotcha as the row/wrapper frames above,
      just one level deeper: a blanket recursive recolor that also paints the instance's own
      bounding-box fill turns the whole icon into a flat colored square instead of the logo/mark
      silhouette.
- **Section headings below the header** ("🏗️ Anatomy", "👉 Copy me", "📐 Specs",
  "🔒 Component Set") are built from the shared `Title` component (see
  [0. Shared `Section`/`Preview`/`Title` components](#0-shared-sectionpreviewtitle-components)
  above) — same style as before (bold, 28px `Baloise Create Headline`, `Alias/Text/Color/Primary`),
  now as a real instance per section rather than hand-built text.

### 2. Body — 2-column layout and column sizing

A `HORIZONTAL` auto-layout frame (`body`, confirmed `itemSpacing: 0`, no fill, no padding) directly
below the header, full outer-frame width. Two children:

- **Left — `documentation` column**: `VERTICAL` auto-layout, holds Copy me / Anatomy / Specs
  stacked in that order. `itemSpacing: 0` — vertical separation between sections comes
  from each section's own 40px top padding (see [Page and outer frame](#page-and-outer-frame)
  above), not a column-level gap.
- **Right — `component` column**: `VERTICAL` auto-layout, holds the single "🔒 Component Set"
  section.

**Column sizing: each column gets its own independent minimum width, `HUG` beyond that — the two
columns are not locked to equal widths, and neither is the outer frame.** `Documentaion`'s live
columns are currently both built at a fixed `764px`; per explicit user correction (confirmed via
this template's dry run, not yet reflected on `Documentaion` itself), **the right `Component Sets`
column uses `layoutSizingHorizontal = 'HUG'` with `minWidth = 1000`** (set directly on the
auto-layout frame — Figma's Plugin API supports `minWidth`/`maxWidth`/`minHeight`/`maxHeight` on
auto-layout frames natively, no manual spacer-node workaround needed), so it never renders
narrower than 1000px but grows automatically if a larger `COMPONENT_SET` genuinely needs more
room. The left `Documentation` column keeps the original 764px floor. **Give the `Component Sets`
column symmetric 40px padding on all four sides** (top/left/right/bottom) — an earlier pass in
this revision only set top/left, leaving the real `COMPONENT_SET` (which itself uses
`layoutSizingHorizontal: 'FILL'`, see [`PHASE-8-DOCUMENT-COMPONENT-SET.md`](PHASE-8-DOCUMENT-COMPONENT-SET.md)) flush
against the right/bottom edges; add the missing `paddingRight`/`paddingBottom` to match. The outer
frame and header both `HUG`/stay `FIXED` to whatever total width the two columns produce, so a
wide right column widens the whole page, including the header band.

## Cross-cutting build pitfalls

These apply to building any frame/section in this template, not one specific section:

- **`figma.createAutoLayout()` defaults to a solid white fill.** Clear it explicitly (`fills = []`)
  on every purely-structural wrapper frame — only intentionally-chromed frames (e.g. the header, the
  "Copy me" box, the "🔒 Component Set" panel) should keep a fill. A blanket fill-clear across a
  frame's children can also hit sibling **text** layers that need their own color kept intact (e.g.
  row/column header labels) — clear wrapper frames specifically, not every child indiscriminately.
- **Awaited promises**: text-fill fixes on instance children (e.g. recoloring a label) must be
  `await`ed in a loop, never fire-and-forget (`promise.then(...)` without awaiting it before the
  script returns or before `screenshot()` is called) — it may or may not land in time,
  non-deterministically. Confirmed by observing this fail silently on one build and succeed by luck
  on another with the exact same fire-and-forget pattern.

**Next: [`PHASE-5-DOCUMENT-COPY-ME.md`](PHASE-5-DOCUMENT-COPY-ME.md)** — once the header and
2-column body shell are built and iterated on with the user (step 4 above).
