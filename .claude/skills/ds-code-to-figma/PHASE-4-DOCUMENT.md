# Phase 4 — Document (documentation presentation)

**You are here:** assumes [`PHASE-3-BUILD.md`](PHASE-3-BUILD.md) has built and confirmed the full
variant matrix as a real Figma `COMPONENT_SET`, with its key written back to `<name>.figma.md`.
This phase builds the per-component **documentation page** — build it after Phase 3 confirms the
variant matrix looks right, before [`PHASE-5-REVIEW.md`](PHASE-5-REVIEW.md)'s review, so that
review covers the documentation page too, not just the raw component set.

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
[Handling an `inverted` axis](#handling-an-inverted-axis-one-frame-stacked-component-sets)).

This template went through five revisions on 2026-10-29–30 to reach this state (single-column →
blue-header-2-column → dark page + real slots → shared category pages → dropping a redundant
Masters row → collapsing `inverted` to one frame). **None of those intermediate states are current
instruction** — see [`CHANGELOG.md`](CHANGELOG.md) if you need the history (e.g. deciding whether
an existing not-yet-migrated page should be brought up to date). `ds-close`, `ds-spinner`,
`ds-icon`, and `ds-badge`'s original pages still use an older layout and are not yet migrated —
see `CONVENTIONS.md`/`CHANGELOG.md` for which.

## Table of contents

- [Canonical reference — inspect before you build](#canonical-reference--inspect-before-you-build)
- [When to use this](#when-to-use-this)
- [What to do](#what-to-do)
- [Document structure](#document-structure)
  - [Page-level structure (once per category)](#page-level-structure-once-per-category)
  - [Page and outer frame](#page-and-outer-frame)
  - [0. Shared `Section`/`Preview`/`Title` components](#0-shared-sectionpreviewtitle-components)
  - [1. Header](#1-header)
  - [2. Body — 2-column layout and column sizing](#2-body--2-column-layout-and-column-sizing)
  - [3. "👉 Copy me"](#3--copy-me)
  - [4. "🏗️ Anatomy"](#4--anatomy)
  - [5. "📐 Specs"](#5--specs)
  - [6. "🔒 Component Set"](#6--component-set)
- [Handling an `inverted` axis (one frame, stacked component sets)](#handling-an-inverted-axis-one-frame-stacked-component-sets)
- [Handling an open-ended content-selection prop (wrapper + Instance Swap library)](#handling-an-open-ended-content-selection-prop-wrapper--instance-swap-library)
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
or partially-built component set. Finish it before Phase 5's visual-regression review, so that
review covers the documentation page too, not just the raw component set.

## What to do

At a high level, in order:

0. Confirm the component's category page (`Core / <Category>`) already exists with its shell
   built — Phase 3 creates it if this is the first component in that category (see
   `PHASE-3-BUILD.md`'s "Category pages" section). Don't rebuild the category header or the two
   rows if they already exist; see
   [Page-level structure](#page-level-structure-once-per-category) below.
1. Build the outer bordered frame for this component's own documentation frame (see
   [Page and outer frame](#page-and-outer-frame)) — this is the "<Component> Documentation" frame
   that gets appended into the category page's `Documentation Frames` row at the very end (step 9
   below), not a page of its own.
2. Build the [Header](#1-header) — instance the shared `Header` component (`🧰 Annotations` page,
   node `2180:17`) and override its text, don't rebuild it from scratch.
3. Build the [body's 2-column shell](#2-body--2-column-layout-and-column-sizing) — a left
   "documentation" column and a right "component" column, each independently sized.
4. In the left column, in order: build [Copy me](#3--copy-me), build
   [Anatomy](#4--anatomy) (skip entirely if the component's `<name>.figma.md` has no `anatomy:`
   list — no `@part` tags found in Phase 1), build [Specs](#5--specs).
5. In the right column, build [🔒 Component Set](#6--component-set) — **count the real crossed
   axes first** and add row/column labels for any 3+-axis set (never skip this check).
6. If the component has a true `inverted`/dark-context axis, build the normal single frame above
   from the `Primary` set's instances, then apply
   [the stacked-component-sets handling](#handling-an-inverted-axis-one-frame-stacked-component-sets)
   to "🔒 Component Set" only — never build a second frame.
7. If the component has an open-ended content-selection prop (many options, e.g. an icon `name`),
   apply the [wrapper + Instance Swap library handling](#handling-an-open-ended-content-selection-prop-wrapper--instance-swap-library)
   instead of a single plain component set.
8. Iterate on the layout with the user before considering this phase done — the exact structure is
   something to confirm visually (screenshot checkpoints), same as the variant matrix itself in
   Phase 3.
9. **Append the finished frame into the category page's `Documentation Frames` row**
   (`framesRow.appendChild(outerFrame)`), always at the end — never inserted at an
   alphabetically-correct position, never repositioning a sibling component's already-built frame.
   Write the frame's node id back into `<name>.figma.md` (`figmaDocFrameNodeId`).

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
  [6. "🔒 Component Set"](#6--component-set) below. Just a bare `Title` instance
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
A shared `Header` master lives on the `🧰 Annotations` page as a `COMPONENT_SET` (node `2389:15007`)
with **two variants that must be kept in sync**: `Eigenschaft 1=Standard` (`2180:17`, dark navy
surface, white text/icons) and `Eigenschaft 1=Variante2` (`2389:15008`, light purple surface, dark
navy text/icons via a different bound color variable). Any structural change to one — e.g. the
`links` row addition below — must be applied to both; per-component instances only ever use one
variant at a time, but a future documentation build could pick either. Create an `INSTANCE` of
whichever variant the page needs (`headerComponent.createInstance()`), `appendChild` it as the outer
frame's first child, set `layoutSizingHorizontal = 'FILL'`, then override its text nodes directly
(same
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
  - **Storybook** (`link-storybook`) → the story URL, same as before.
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

The rest of this section documents the header's internal structure for reference (e.g. when editing
the shared master itself) — confirmed live on the `Header` master component's own node tree:

- **Fill**: bind to `🌐 Global/🌈 Color/Purple/3` (`VariableID:137:2756`) — **not**
  `🔗 Alias/🎨 Surface/Primary` (the navy token still used elsewhere in this template as the "dark
  preview surface," e.g. the `inverted`-axis section below, which is unrelated and unaffected by
  this). A fresh `createInstance()` now correctly starts purple with no override needed — don't
  reintroduce navy here (see `CHANGELOG.md` for the drift this corrected).
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
    - **On `Eigenschaft 1=Variante2`** (the light purple variant), all of the above is identical
      except the color: both icon types' vector fills bind to `VariableID:137:288` (the same dark
      navy variable `link`'s own text already uses on that variant) instead of
      `🔗 Alias/🔤 Text/Color/White` — don't reuse the white variable there, it'd be invisible on
      the light surface. Only recolor the leaf `VECTOR` nodes inside each icon instance, never the
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
`layoutSizingHorizontal: 'FILL'`, see [6. "🔒 Component Set"](#6--component-set) below) flush
against the right/bottom edges; add the missing `paddingRight`/`paddingBottom` to match. The outer
frame and header both `HUG`/stay `FIXED` to whatever total width the two columns produce, so a
wide right column widens the whole page, including the header band.

### 3. "👉 Copy me"

**Instance the shared `Section` component in `Default` variant** (see
[0. Shared `Section`/`Preview`/`Title` components](#0-shared-sectionpreviewtitle-components)) with
its `Title` set to `kind=copy-me`. Insert one real, representative **instance** (the default/base
combination) **directly into the `Preview`'s slot** — no further nesting — the single "drag this
into your design" example. Use a Figma `INSTANCE` (`variant.createInstance()`) of the finished
component-set variant — never the variant node itself. If the component has any boolean "Show X"
property (per Phase 2's conditional-render rule), override it to `true` on this instance for
readability, while the component set's own default stays whatever matches code.

### 4. "🏗️ Anatomy"

Mostly unchanged in diagram/legend content from the prior template — only its position in the page
moved (now second in the left column, still skipped entirely when the component's
`<name>.figma.md` has no `anatomy:` list). **Structure: a `Section` instance in `Flat` variant**
(`Title` set to `kind=anatomy`) **as the outer zero-inset container, with one nested `Preview`
instance in `Default` variant inside that outer slot** — the real diagram/circle/leader-line/legend
content goes into the _nested_ `Preview`'s own slot, not the outer `Section`'s slot directly.
Confirmed live on `Documentaion`: the Anatomy `Section`'s `Preview` slot has zero inset and
contains exactly one nested `Preview` instance, which itself has the usual 14px inset holding the
real `Anatomy box` content. See the prior revision of this document (or `ds-close`) for the full
diagram/circle/leader-line construction rules — those didn't change.

**Two content fixes (per explicit user correction, not yet reflected on the `Documentaion`
reference — treat these as this document's own specification going forward):**

- **Both `diagram-area` and `legend` are `layoutSizingHorizontal: 'FILL'`, not a fixed width.**
  They're children of the nested `Default`-variant `Preview`'s auto-layout slot — set `FILL` on
  each (after appending, per the usual append-before-FILL ordering) so they stretch to the slot's
  real width instead of staying at a hardcoded `608`/`293`px.
- **In each legend line (`"A · badge — The badge element itself."`), the letter and the part name
  are Bold — the rest of the sentence stays Regular.** Use `setRangeFontName` on two sub-ranges of
  the same text node: the single letter (`0` to `1`), and the part-name word located via
  `characters.indexOf(partName, 1)` (e.g. `"badge"` in `"A · badge — ..."`) — both to `Baloise
Create Text` **Bold**, leaving the `" · "`, `" — "`, and trailing description in Regular. Don't
  build the letter/part-name as separate text nodes to bold them — the whole line stays one text
  node with mixed-range formatting, same technique as any other partial-bold text in this file.
- **The legend line's fill binds to `🔗 Alias/🔤 Text/Color/Primary` (`VariableID:137:288`)** —
  same rule as every other skill-authored label, see `conventions/build-mechanics.md`'s
  "Color and paint" section; don't hardcode a near-black literal even if it looks indistinguishable.

### 5. "📐 Specs"

**Moved from its old end-of-page position to directly after Anatomy, now the last left-column
section (the "🛠 Variants" section that used to follow it has been retired), per explicit
request (2026-10-29).** The developer-handoff reference content itself (dimensions, padding/gaps,
radius, typography annotations) is otherwise unchanged from the prior template — one card per
Variants-axis option, using the shared `Spec/*` annotation components on the `🧰 Annotations` page
(node `2046:5`).

**Structure: a `Section` instance in `Flat` variant** (`Title` set to `kind=specs`) **as the outer
zero-inset container, with one nested `Preview` instance in `Default` variant per Variants-axis
option**, stacked vertically inside that outer slot (confirmed live on `Documentaion`: three
nested `Preview`s for `ds-badge`'s `base`/`lg`/`sm`). Each nested `Preview`'s own slot holds that
option's `preview`/`stage`/`legend` card — same annotation-component table, marker-order rule, and
legend-row rules as before, just nested one level deeper than Anatomy's single nested panel. **Each
card's own title text (`"base"`/`"sm"`/`"lg"`) binds its fill to `🔗 Alias/🔤 Text/Color/Primary`
(`VariableID:137:288`)** — same rule as every other skill-authored label, see
`conventions/build-mechanics.md`'s "Color and paint" section.

**Every nested `Preview` here uses `layoutSizingHorizontal = 'FILL'`** (per the standing rule in
[0. Shared `Section`/`Preview`/`Title` components](#0-shared-sectionpreviewtitle-components)), and
**the card frame built inside each nested `Preview`'s own slot must be resized to match that
slot's real width (`resize(656, ...)`, `x = 0`) — don't leave it at a wider literal width from an
earlier fixed-size workaround.** A wider card frame gets auto-centered by the slot, pushing its
`x` negative and clipping the card's own label text (`"base"`/`"lg"`/`"sm"`) off the left edge —
confirmed as a real regression during this template's dry run, caused by exactly this mismatch
after switching the nested `Preview` from a fixed `resize()` to `FILL`. **Each nested `Preview`'s
own height must end up `layoutSizingVertical: 'HUG'`, not `FIXED`** — see the flexible-height
sequence (`resize()` then `primaryAxisSizingMode = 'AUTO'; layoutSizingVertical = 'HUG'`) in
[0. Shared `Section`/`Preview`/`Title` components](#0-shared-sectionpreviewtitle-components) above;
apply it to every one of the per-option nested `Preview`s here, not just the first.

**Specs always uses the `Primary` set's instances/values**, even on an `inverted`-split component
— an `inverted` split changes colors, not geometry, so showing `Inverted`-set numbers here would
just repeat identical figures. There's only one frame/one Specs section per component now either
way (see [the stacked-component-sets handling](#handling-an-inverted-axis-one-frame-stacked-component-sets)).

**The "last child of the outer frame" positioning rule from the old spec no longer applies** — since
Specs now sits inside the left `documentation` column as a normal stacked child (same as every other
left-column section), not as the final child of the whole outer frame.

### 6. "🔒 Component Set"

**Replaces "🔒 Main components" — renamed, and radically simplified: no table chrome at all. Not a
`Section`/`Preview` instance either** — just a bare `Title` instance (`kind=component-set`) plus
the real set. Confirmed live on `Documentaion`'s right column (`Component Sets` →
`Badge`, node `2129:84`):

- **Before building this section, count the real axes on the set being displayed** (every crossed
  variant property — `size`, `state`, `variation`, whatever Phase 2 settled on — not counting a
  structural `inverted`/`brand`/etc. split, which doesn't live on the set itself). **This is a
  required check, not an optional judgment call** — skipping it is a real, confirmed mistake,
  twice over: `ds-spinner`'s Component Set panel (3 real axes: `variation` × `size` ×
  `labelPosition`) first shipped with no labels at all because this check was skipped, caught when
  the user compared it against the `🧰 Annotations` page's own `github example` reference; then
  `ds-logo` (a single `size` axis, one row of 3 variants per top-level set) shipped the same way a
  second time, caught again by the user pointing at the `ds-spinner` precedent. **If the component
  has an `inverted`/`brand`/etc. split (see
  [the stacked-component-sets handling](#handling-an-inverted-axis-one-frame-stacked-component-sets)
  below), count axes and decide on labels independently for each display clone — every clone needs
  the same labels since every clone has the same axis count.**
- **Every `COMPONENT_SET` display in this section gets row/column labels and dashed internal grid
  dividers — no axis count is ever exempt, not even a single-axis set.** An earlier revision of this
  rule skipped labeling entirely for a "2-axis or fewer" set, reasoning that Figma's own native
  variant grid plus its selection-inspector property picker already made the axes legible without
  manual chrome. **This was reversed after `ds-logo` (one axis, `size`) shipped with no labels and
  the user flagged it, pointing back at `ds-spinner`'s labeled panel as the standard every
  component should match** — the inspector's property picker only shows axis names when a variant
  is actively selected in the Figma UI, not in a passive screenshot/read of the documentation page,
  so an unlabeled set is illegible outside an editing session. **Always build the labeled structure
  below, for 1, 2, or 3+ axes alike** — the only thing that changes by axis count is which sides
  get labels (see "Row Labels"/"Column Labels" below: a lone column axis like `ds-logo`'s `size`
  gets Column Labels only, no Row Labels, since there's nothing varying across rows).
- **For a 3+-axis component (the Primer-style nested-matrix case from `PHASE-2-PROPOSE.md`), the
  same labeled structure gets real row/column labels and a dashed internal grid around the
  `COMPONENT_SET`** — nesting is illegible without it. Originally modeled on this file's own
  `github example` reference frame (Badge page, a rebuild of Primer's own Button variant grid),
  then substantially revised after a full build-and-review pass on `ds-spinner`'s real 3-axis set
  (`variation` × `size` × `labelPosition`) surfaced several corrections — **this is the current,
  confirmed mechanism; the `github example` frame is background/inspiration only, not a literal
  structural template anymore.**

  **Overall structure — labels live outside the box, in a real auto-layout wrapper, not overlaid
  on top of it:**

  ```
  Labeled Set              (HORIZONTAL auto-layout, itemSpacing 16, counterAxisAlignItems MIN, HUG)
  ├─ Row Labels            (FIXED 140w × [40 + box height]h, plain frame, manual child x/y)
  └─ Column + Box          (VERTICAL auto-layout, itemSpacing 0, HUG both axes)
     ├─ Column Labels      (FIXED width = box's own width, 40h, plain frame, manual child x/y)
     ├─ <the COMPONENT_SET itself>   (HUG width — see sizing note below)
     └─ Grid               (ABSOLUTE-positioned overlay, same w/h as the box, clipsContent: false)
  ```

  `Labeled Set` is what gets appended in place of a bare `COMPONENT_SET` wherever this section
  would otherwise just drop the set in directly (e.g. inside `main-component`, or inside each
  display clone's position in the stacked-sets panel below) — **always**, regardless of axis count,
  per the "every display gets labels" rule above. For a lone column axis (no row axis at all, e.g.
  `ds-logo`'s single `size` row), the `Row Labels` child is simply omitted — `Labeled Set` then has
  just one child, `Column + Box`.

  **The `COMPONENT_SET` itself hugs its real content width — never `FILL`.** An earlier revision of
  this section set `layoutSizingHorizontal = 'FILL'` on labeled sets (stretching them to fill the
  panel's `minWidth` column), which left a large empty strip to the right of the real content once
  labels moved outside the box — explicitly reversed per user correction. **This "hug, don't
  stretch" rule applies to every labeled set now, at any axis count** — since every `COMPONENT_SET`
  display is labeled (see above), there is no remaining case that still uses `FILL`. Since a
  `COMPONENT_SET` can't genuinely auto-hug (`layoutMode: 'NONE'`, see
  `conventions/component-set-rendering.md`'s stale-bounding-box note), compute the real content
  width/height from its variant children's
  `x`/`y`/`width`/`height` and `resize()` it explicitly, with `layoutSizingHorizontal = 'FIXED'`
  (not `'HUG'`, which only auto-layout frames or their text children can take) — don't leave it at
  whatever default width `combineAsVariants()` or the panel's own `FILL` happened to produce.

  **Build the `Grid` overlay as real sibling children of a plain `layoutMode: 'NONE'` wrapper frame
  around the `COMPONENT_SET`, not as an `ABSOLUTE`-positioned child of an auto-layout parent.**
  Wrap the real `COMPONENT_SET` and the divider rectangles together in one small `Box` frame
  (`figma.createFrame()`, `layoutMode: 'NONE'`, resized to the set's own real content
  width/height, `fills: []`, `clipsContent: false`); append the `COMPONENT_SET` first, then each
  divider rectangle (so dividers render on top), both using plain `x`/`y` — a `NONE`-mode frame's
  children position freely without needing `layoutPositioning = 'ABSOLUTE'` at all, sidestepping
  every pitfall `conventions/component-set-rendering.md` documents for that property (the
  same-script-rollback-on-later-error gotcha, the "must be an auto-layout frame or child of one"
  structural requirement). This is
  simpler and more robust than the older `ABSOLUTE`-overlay-inside-auto-layout technique the ASCII
  sketch above still names (`Grid` as a sibling of `COMPONENT_SET` inside `Column + Box`) — prefer
  the plain-`NONE`-wrapper approach for any new build. (From: `ds-logo`'s Component Set panel,
  2026-10-30 — built this way from the start, no `ABSOLUTE`-overlay issues hit.)

  **Getting the real grid positions — prefer Figma's native `GRID` auto-layout mode, with a manual
  fallback:**
  - Setting `set.layoutMode = 'GRID'` on an already-built, `NONE`-mode variant set can trigger a
    one-time "smart conversion" that auto-arranges the existing variant children into a clean,
    evenly-spaced grid (uniform padding, uniform row/column gap) — confirmed live: converting
    `ds-spinner`'s `Primary` set this way produced `padding: 24` all sides, `gridRowGap: 91`,
    `gridColumnGap: 180`, `gridRowCount: 4`, `gridColumnCount: 2`, with every child repositioned
    onto clean column x-anchors (`26`, `270`) and row y-anchors (`26`, `181`, `336`, `451`) — far
    more reliable than manually computing a packing layout by hand.
  - **This conversion is not reliable — confirmed non-deterministic in the same session.** It
    worked once on `ds-spinner`'s `Primary` set, then failed to reflow on the structurally-identical
    `Inverted` set across many retries (toggling `NONE`→`GRID`, explicitly setting
    `gridRowCount`/`gridColumnCount`, even a freshly-cloned copy) — `layoutMode` reported `'GRID'`
    with no thrown error each time, but children stayed at their old `NONE`-mode positions. **Don't
    burn more than a couple of retries on this.** Fallback: manually set each remaining set's
    children to the exact same `x`/`y` values the first, successfully-converted set ended up with
    (same variant names → same relative position, since both sets share the same variant property
    structure) — then set that set's own `layoutMode` back to `NONE` (manual positions) and
    `resize()` it to the same final `width`/`height` the converted one reported. Visually identical
    result either way; native `GRID` mode is a nice-to-have for ease of computation, not a
    requirement for correctness. (From: `ds-spinner`'s Component Set panel, 2026-10-29.)
  - Whichever path is used, treat the resulting real child `x`/`y`/`width`/`height` values (not a
    hand-sketched idealized spacing) as the source of truth for every label/grid-line position
    computed below.

  **Column/row label positions — symmetric midpoint of each region, not the raw content bounding
  box.** Compute each divider's position first (see Grid below), then center each label within the
  region its divider boundaries define — e.g. column 1's label centers between the box's own left
  padding edge and the column divider; column 2's label centers between that divider and the box's
  right padding edge. Same for row groups. This reads as evenly spaced even when the real content
  in different columns/rows has different widths/heights (as `ds-spinner`'s `size=base`/`size=sm`
  content does).

  **A component with only one axis total (e.g. `ds-logo`'s lone `size` axis) has no row axis at
  all — omit `Row Labels` entirely** (don't build an empty/placeholder bracket column) and lay the
  variants out in a single row, with just `Column Labels` above it and dashed vertical dividers
  between cells; no horizontal divider is needed since there's only one row.

  **Row Labels** (`Baloise`-free — this label system intentionally uses `Inter Medium`, `12px`,
  matching the `github example` reference's own typography, not this file's usual Baloise
  families): for each outer-axis value (e.g. `Logo`, `Circle`), one text label plus one `Bracket`
  — a `FRAME`, no fill, `strokeAlign: 'INSIDE'`, **`top`/`bottom`/`left` strokes at weight `2`**
  (matching the `COMPONENT_SET`'s own 2px dashed outer border — not `1`, corrected per explicit
  request), `right` at `0` (opens toward the content). For each inner-axis value (e.g. `Right`,
  `Bottom`), text only, no bracket, positioned at that row's own center. **Where two adjacent outer
  brackets meet at a shared boundary (e.g. `Logo`'s bottom edge and `Circle`'s top edge), leave a
  4px gap instead of letting them touch or form one continuous line** — shorten each bracket by 2px
  on its facing edge. All label/bracket colors: `{r: 0.592, g: 0.278, b: 1}` literal purple (Primary
  display), `{r: 0.745, g: 0.51, b: 0.98}` literal lighter purple (Inverted display, for contrast
  against the dark fill) — not yet bound Figma Variables; bind one if/when this label system gets a
  token owner.

  **Column Labels**: one text label per column value (e.g. `Base`, `SM`), no bracket (a single-level
  column axis never gets one — see the standing rule below), centered per the symmetric-midpoint
  rule above, in a `40`px-tall strip directly above the box.

  **Grid — dashed internal separators only, stretched edge-to-edge with the box, no separate outer
  perimeter.** The `COMPONENT_SET`'s own existing 2px dashed border already frames the whole grid —
  don't draw a second perimeter around the internal cells. Build only the internal dividers (one
  per boundary between adjacent rows/columns), each stretched to **meet the box's own edges with
  zero gap** (full box width for horizontal dividers, full box height for the vertical divider) —
  not inset by any margin. All dividers: **2px** weight (matching the outer border and the row
  brackets — not `1`), `dashPattern: [10, 5]`, same literal purple as the labels.
  - **Build the vertical divider as a thin stroked `RECTANGLE`, never a rotated `LINE`.** A rotated
    `LINE` node (`resize()` to its length, then `rotation = -90`) can silently fail to render inside
    this overlay even when its `absoluteTransform` is independently verified mathematically correct
    (confirmed: checked start/end coordinates matched the intended vertical segment exactly, yet
    the line was invisible across five identical re-screenshots) — suspected pre-rotation
    bounding-box clip-testing bug. **Working alternative**: a `RECTANGLE` with `fills: []`, a near-
    zero `width` (e.g. `0.01`), the divider's real height, and only `strokeLeftWeight` set (others
    `0`) — draws identically to a vertical dashed line with none of the rotated-`LINE` rendering
    risk. Horizontal dividers render fine as plain (non-rotated) `LINE` nodes — this issue is
    specific to rotation. (From: `ds-spinner`'s Component Set panel, 2026-10-29.)
  - The `Grid` overlay frame itself needs `clipsContent: false` — its own bounding box is sized to
    match the box exactly, so anything drawn right at its edges (per the "meet the box's own edges
    with zero gap" rule above) sits exactly on the clip boundary and can get inconsistently
    clipped otherwise.
  - **Inner axes never get a bracket** — text only, positioned at that axis value's row/column
    center. Only the single outermost axis per side (the one Phase 2 placed furthest out in the
    nesting order) gets the bracket treatment, sized to span its whole group's row/column extent
    (with the 4px meeting-gap rule above applied between adjacent outer groups).
  - **A 2-axis component's single row axis and single column axis don't get brackets either** —
    a bracket signals "these rows/columns are grouped under me," which only means something once
    there's an inner axis nested beneath it. One axis per side still gets a plain text label (no
    bracket) if its value isn't otherwise obvious from the cells themselves, same visual weight as
    an inner axis label in the 3+-axis case.
  - **Labelling individual cells (not just axis rows/columns) remains out of scope** — this is
    row/column-header labelling only, not a return to full per-cell table chrome.
  - **For a stacked `inverted` panel** (see
    [the stacked-component-sets handling](#handling-an-inverted-axis-one-frame-stacked-component-sets)
    below), build the full `Labeled Set` wrapper independently for both the `Primary` and
    `Inverted` display clones — both need identical labels/grid geometry, since `inverted` only
    changes color, never which axes exist or where variants sit.

- **The section wrapper (`main-component`)**: `VERTICAL` auto-layout, padding `40` on all sides,
  `itemSpacing: 16`, `primaryAxisSizingMode: 'AUTO'` (hug height), two children: the section heading
  (`"🔒 Component Set"`, 28px Bold `Baloise Create Headline`, `Alias/Text/Color/Primary` — same
  heading style as every other section) and the real `COMPONENT_SET` directly below it.
- **The real master `COMPONENT_SET` is placed as a normal, non-absolute auto-layout child** —
  confirmed live: `layoutPositioning: 'AUTO'`, `layoutSizingHorizontal: 'FILL'`,
  `layoutSizingVertical: 'FIXED'` (resized to its real content height, `540` on `ds-badge`). This is
  a major simplification over the old template's `ABSOLUTE`-auto-layout-child-overlaid-on-table-
  chrome mechanism (see `CHANGELOG.md`'s "Old table-overlay mechanics" section for that history) —
  there is no table to align against anymore, so the set just flows normally as the wrapper's second
  child. `appendChild` the real set into `main-component`, then `set.layoutSizingHorizontal =
'FILL'` and `set.resize(set.width, set.height)` (or a deliberately chosen height) as needed.
- **Visual chrome lives on the set itself, not a separate wrapper box**: fill white, **2px dashed**
  stroke (`dashPattern: [10, 5]`) bound to `🌐 Global/🌈 Color/Purple/4`, `cornerRadius: 5`. Set these
  directly on the `COMPONENT_SET` node — there is no separate dashed-border frame wrapping it.
- **Internal arrangement of the set's variant children is whatever `combineAsVariants()` produced
  natively** (Figma's own default variant grid — one axis stepping across x, the other stepping down
  y, in property-definition order) — don't compute or bake any custom cell-centering math for this
  section anymore, unlike the old template's one-time-baked local positions. If the set's children
  need repositioning for readability, treat it as adjusting the real master set's own layout, not as
  a documentation-page concern.
- **The `COMPONENT_SET` stays unlocked** — this is a change from the old template, which locked
  the set once to stop a human dragging the whole grid out of alignment inside hand-built table
  chrome. That protection no longer applies: there's no table geometry to misalign, the set is
  just a normal auto-layout child of its section wrapper, and leaving it unlocked lets a human
  select, inspect, or rearrange individual variants directly in the Figma UI. Don't set
  `locked: true` on it when building or editing this section.
- **Still apply the standing rules that don't depend on table chrome**: never move a variant out
  of its own set (`figma.combineAsVariants()` + manual `key=value` renaming if a round-trip is
  ever needed), and re-verify the set's own `width`/`height` explicitly after any repositioning of
  its children (a `COMPONENT_SET` never auto-rehugs — see `conventions/component-set-rendering.md`).
- **The set's `FILL` width (step above) is what the `Component Sets` column's own `minWidth=1000`
  sizing (see "2. Body — 2-column layout and column sizing") exists to support** — the column
  `HUG`s to its content with a 1000px floor and symmetric 40px padding on all sides, so the set's
  `FILL` width always has real room to flow into (`920` at the floor, `1000 - 40 - 40`) and grows
  automatically alongside the column if the real set ever needs more than 1000px. Don't hardcode a
  width on the set itself to "make room" — that's the column's job, not this section's. **This
  `FILL` rule is for the plain, unlabeled (2-axis) case only** — a labeled 3+-axis set uses `HUG`
  instead, per the "hug, don't stretch" rule above; the two cases intentionally size differently.
- **If the component has an open-ended content-selection prop** (see
  [wrapper + Instance Swap library](#handling-an-open-ended-content-selection-prop-wrapper--instance-swap-library)),
  this section shows the real wrapper set's own native arrangement the same way — not N separate
  per-option tables, same as before, just without any table chrome now either.

## Handling an `inverted` axis (one frame, stacked component sets)

**SUPERSEDED, 2026-10-29, same day as the category-page rebuild — a component with a true
`inverted`/dark-context axis still gets exactly ONE documentation frame, never two.** An earlier
revision of this section (built once, live on `ds-spinner`, then explicitly reversed per user
correction) tried a two-frame side-by-side split, each frame independently getting the full
header + 2-column body. **This is wrong and must not be repeated**: under the category-page
scheme, "one documentation frame per component" is a hard invariant — a second full frame for
`inverted` broke it, showing up as two separate cards in the `Documentation Frames` row for what
is still conceptually one component. Confirmed corrected live on `ds-spinner`.

**`inverted` still must not be a Figma variant property on one shared component set** — split any
component with a true `inverted`/dark-context axis into **two separate top-level component sets**
(`<Component>/Primary` and `<Component>/Inverted`), same reasoning as always (different token
values across every text/fill layer, not just one swappable paint). What changed is **where those
two sets are shown**: both live inside the **same single documentation frame's "🔒 Component Set"
panel**, stacked vertically, each under its own small sub-label — not two separate frames.

- Build the documentation frame exactly like any other component — **once** — using the `Primary`
  set's real instances for Copy me/Anatomy/Specs (the `Inverted` set's instances don't get
  their own copies of these sections; geometry and content are identical, only Component Set colors
  differ).
- In "🔒 Component Set", after the `Title` instance, append: a plain text sub-label **`Primary`**
  (`Baloise Create Text` Bold, 14px, fill bound to `🔗 Alias/🔤 Text/Color/Primary` —
  `VariableID:137:288`, never a hardcoded black/navy literal, see `conventions/build-mechanics.md`'s
  "Color and paint" section) directly above the `Primary` display clone (white fill,
  dashed-purple chrome, same as the plain case), then a second sub-label **`Inverted`** directly
  above the `Inverted` display clone — **the only element that uses the dark
  `Alias/Surface/Primary` (`VariableID:137:2764`) background in this whole scheme**, swapped
  directly onto the cloned `COMPONENT_SET`'s own `fills` (dashed-purple stroke unchanged). Both
  sub-labels get `layoutSizingHorizontal = 'HUG'`. **Every display clone, at any axis count
  (including a single `size`-only axis), is wrapped in its own full `Labeled Set` structure**
  (row/column labels as applicable, dashed internal grid — see
  [6. "🔒 Component Set"](#6--component-set) above), and that wrapper `HUG`s its own real content
  width rather than `FILL`ing the panel. `Primary` and `Inverted` (or any other structural split,
  e.g. `ds-logo`'s `brand` × `color`) use identical sizing mode and identical label/grid geometry
  across every clone — only color differs between them.
- **No other section gets a dark-preview-surface treatment anymore** — Copy me, Anatomy, and Specs
  all stay on their normal light `Preview` chrome, showing only `Primary`-variant
  instances. The old "minimal-dark-theming" rule (swap the Copy me box to
  dark too) is dropped along with the two-frame split it was built for.
- The frame's header `kicker` stays the plain `"Core / <Category>"` — no `" · Inverted"` suffix,
  since there's no second frame to disambiguate from anymore.

This also surfaces the same real bug worth checking for every time: does the master component's own
`inverted=true` variant actually have every text element recolored for dark-context contrast? Fix
any such gap in the master component, not with a per-instance override.

## Handling an open-ended content-selection prop (wrapper + Instance Swap library)

Unchanged by the 2026-10-29 restructure — see `conventions/variant-grouping.md`'s
"Open-ended content-selection props" section for the full wrapper-`COMPONENT_SET` + Instance Swap library
pattern, its fallback (N separate top-level sets), and every build pitfall (multi-vector glyph
flattening, `<clipPath>` stripping, per-row dark-preview backgrounds for invisible token-swap
options). The only change under the new template: "🔒 Component Set" (ⁿée "Main components") shows
the real wrapper set's own native arrangement with no table chrome, same as the plain case above —
and the separate "🖼️ \<Plural noun\> names" browsing section for the content axis itself still gets
built, in the right column below "🔒 Component Set", same mechanism as before.

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

**Next: [`PHASE-5-REVIEW.md`](PHASE-5-REVIEW.md)** — once the documentation page is built and
iterated on with the user (step 8 above).
