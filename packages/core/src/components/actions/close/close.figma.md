# close → Figma mapping

```yaml
figmaComponentKey: null # two top-level sets (inverted split), see figmaSets below
figmaPage: Core / Actions # page node 3022:2, built fresh per user instruction (ignored any pre-existing ds-close node in Figma)
figmaMasterNodeId: null # see figmaSets
figmaDocFrameNodeId: '3022:6' # "Close Documentation" frame, inside Core / Actions
figmaSets:
  primary: { nodeId: '3028:251', key: 'f19b8bb79f950b5c050190dbd5382ce0914e243b' }
  inverted: { nodeId: '3028:342', key: '05d501adfeb0b8175ffeb83c6e8676b0db478cc9' }

scope: >
  User-confirmed: only the default (non-`button`) render path is modeled. `button`,
  `buttonColor`, `buttonSize` are EXCLUDED entirely — when `button=true`, ds-close renders a
  nested <ds-button> and is out of scope for this push.

anatomy:
  - letter: A
    part: button
    description: 'The close button element.'
    note: >
      Single @part tag, cross-checked against render()'s part="button" attribute — matches
      exactly (the component's JSDoc comment was corrected from `@part close` to `@part button`
      in an uncommitted local change, now consistent). The X icon is NOT a separate part — it's a
      `::after` pseudo-element mask-image inside this same part, not its own shadow-DOM node.

props:
  - name: size
    type: enum
    options: [sm, md] # CLOSE_SIZES
    default: '(unset — falls back to close-size-base / close-padding-base)'
    figmaProperty: size
    figmaPropertyType: variant
    figmaOptions: [sm, base, md] # canonical t-shirt order, implicit default slotted in the middle

  - name: inverted
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: top-level-split
    note: 'User decision (Phase 2): separate COMPONENT_SETs (Close/Primary, Close/Inverted), not a crossed boolean variant.'

  - name: disabled
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: 'folded into `state` below as one of its options — not a separate boolean axis'
    note: "Per PHASE-2-PROPOSE.md's table: pseudo-class/state-ish prop → one `state` variant property, never a separate boolean."

  - name: button
    figmaPropertyType: EXCLUDED (confirmed)
    note: 'User confirmed: button-variant render path (nested ds-button) out of scope.'
  - name: buttonColor
    figmaPropertyType: EXCLUDED (confirmed)
    note: 'Only applicable when button=true — excluded with it.'
  - name: buttonSize
    figmaPropertyType: EXCLUDED (confirmed)
    note: 'Only applicable when button=true — excluded with it.'

states:
  figmaProperty: state
  options: [default, hover, focus, active, disabled] # canonical order per PHASE-2-PROPOSE.md's table
  sources:
    hover: '&:not(:disabled):hover (close.mixin.scss, via close-mx.style())'
    focus: '&:focus-visible, &.is-focused (close.mixin.scss, focus-shadow mixin)'
    active: '&:not(:disabled):active (close.mixin.scss)'
    disabled: 'disabled prop / native :disabled attribute — folded in as a state option, not a separate boolean'

nested:
  - childTag: null
    note: >
      ds-close does not nest a <ds-icon> in code (the X is an inline mask-image, not a
      <ds-icon> element). Per user decision, the Figma build reuses the existing `x` icon
      instance from ds-icon's Instance Swap library (wrapper COMPONENT_SET key 2056:8249) for
      the visual glyph, mask-colored via the close-color-icon token — this is a Figma-side
      visual decision, not a reflection of a code-level nested-component relationship.

tokens:
  - cssVar: --ds-close-primary-color-background-base
    figmaVariable: 🧩 Component/Close/Primary/Color/Background/Base
    figmaVariableId: VariableID:137:1383
    resolved: true
  - cssVar: --ds-close-primary-color-background-hover
    figmaVariable: 🧩 Component/Close/Primary/Color/Background/Hover
    figmaVariableId: VariableID:137:1381
    resolved: true
  - cssVar: --ds-close-primary-color-background-active
    figmaVariable: 🧩 Component/Close/Primary/Color/Background/Active
    figmaVariableId: VariableID:137:1382
    resolved: true
  - cssVar: --ds-close-primary-color-icon-base
    figmaVariable: 🧩 Component/Close/Primary/Color/Icon/Base
    figmaVariableId: VariableID:137:1385
    resolved: true
  - cssVar: --ds-alias-interaction-focus-color-base
    figmaVariable: 🔗 Alias/✨ Interaction/Focus/Color/Base
    figmaVariableId: VariableID:137:247
    resolved: true
  - cssVar: --ds-close-radius
    figmaVariable: 🧩 Component/Close/Radius
    figmaVariableId: VariableID:137:1374
    resolved: true
  - cssVar: --ds-close-size-base
    figmaVariable: 🧩 Component/Close/Size/Base
    figmaVariableId: VariableID:137:1387
    resolved: true
  - cssVar: --ds-close-padding-base
    figmaVariable: 🧩 Component/Close/Padding/Base
    figmaVariableId: VariableID:137:1390
    resolved: true
  - cssVar: --ds-close-padding-sm
    figmaVariable: 🧩 Component/Close/Padding/SM
    figmaVariableId: VariableID:137:1392
    resolved: true
  - cssVar: --ds-close-size-sm
    figmaVariable: 🧩 Component/Close/Size/SM
    figmaVariableId: VariableID:137:1389
    resolved: true
  - cssVar: --ds-close-padding-md
    figmaVariable: 🧩 Component/Close/Padding/MD
    figmaVariableId: VariableID:137:1391
    resolved: true
  - cssVar: --ds-close-size-md
    figmaVariable: 🧩 Component/Close/Size/MD
    figmaVariableId: VariableID:137:1388
    resolved: true
  - cssVar: --ds-close-inverted-color-icon-base
    figmaVariable: 🧩 Component/Close/Inverted/Color/Icon/Base
    figmaVariableId: VariableID:137:1379
    resolved: true
  - cssVar: --ds-close-inverted-color-background-hover
    figmaVariable: 🧩 Component/Close/Inverted/Color/Background/Hover
    figmaVariableId: VariableID:137:1375
    resolved: true
  - cssVar: --ds-close-inverted-color-background-active
    figmaVariable: 🧩 Component/Close/Inverted/Color/Background/Active
    figmaVariableId: VariableID:137:1376
    resolved: true
  - cssVar: --ds-alias-interaction-focus-color-inverted
    figmaVariable: 🔗 Alias/✨ Interaction/Focus/Color/Inverted
    figmaVariableId: VariableID:137:248
    resolved: true
  - cssVar: --ds-alias-interaction-focus-color-border
    figmaVariable: 🔗 Alias/✨ Interaction/Focus/Color/Border
    figmaVariableId: VariableID:137:253
    resolved: true
    note: >
      Found in Phase 3 (not visible from close.host.scss directly — comes from the shared
      focus-shadow() mixin in packages/styles/src/scss/mixins/general.mixin.scss, used via
      close.mixin.scss). The real focus state is a two-ring box-shadow: a 2px inner ring in this
      border color, plus a 5px outer ring in close-color-focus (Base/Inverted per split). Modeled
      in Figma as two stacked DROP_SHADOW effects (spread 2 + spread 5, both offset 0/blur 0).
  - cssVar: --ds-close-primary-color-icon-disabled
    figmaVariable: 🧩 Component/Close/Primary/Color/Icon/Disabled
    figmaVariableId: VariableID:137:1386
    resolved: true
  - cssVar: --ds-close-primary-color-background-disabled
    figmaVariable: 🧩 Component/Close/Primary/Color/Background/Disabled
    figmaVariableId: VariableID:137:1384
    resolved: true
  - cssVar: --ds-close-inverted-color-icon-disabled
    figmaVariable: 🧩 Component/Close/Inverted/Color/Icon/Disabled
    figmaVariableId: VariableID:137:1380
    resolved: true
  - cssVar: --ds-close-inverted-color-background-disabled
    figmaVariable: 🧩 Component/Close/Inverted/Color/Background/Disabled
    figmaVariableId: VariableID:137:1378
    resolved: true
  - iconGlyph: 'X mask (close.mixin.scss hardcoded inline SVG data URI)'
    figmaVariable: null
    figmaVariableId: null
    resolved: true
    resolution: >
      USER DECISION: no Figma variable involved — reuse the existing `x` icon COMPONENT instance
      from ds-icon's Instance Swap library (wrapper set key 2056:8249) for the visual glyph
      instead of drawing a new one-off vector. The glyph's color still binds to
      close-color-icon (see color tokens above) via the icon instance's vector fill.

specs:
  sm:
    - kind: size
      label: Size
      px: null # from --ds-close-size-sm, resolve exact px in Phase 3/6 from Base.tokens.json
      token: 🧩 Component/Close/Size/SM
    - kind: spacing
      label: Padding
      px: null
      token: 🧩 Component/Close/Padding/SM
    - kind: radius
      label: Radius
      px: null
      token: 🧩 Component/Close/Radius
  base:
    - kind: size
      label: Size
      px: null
      token: 🧩 Component/Close/Size/Base
    - kind: spacing
      label: Padding
      px: null
      token: 🧩 Component/Close/Padding/Base
    - kind: radius
      label: Radius
      px: null
      token: 🧩 Component/Close/Radius
  md:
    - kind: size
      label: Size
      px: null
      token: 🧩 Component/Close/Size/MD
    - kind: spacing
      label: Padding
      px: null
      token: 🧩 Component/Close/Padding/MD
    - kind: radius
      label: Radius
      px: null
      token: 🧩 Component/Close/Radius
```

## Notes

- **Scope**: per user instruction ("ignore the button variant"), `button`/`buttonColor`/
  `buttonSize` and the nested `<ds-button>` render path are excluded entirely from this push.
  Only the native `<button part="button">` render path (size/inverted/disabled) is modeled.
- **Anatomy**: single `@part` (`button`), confirmed against `render()` — no mismatch (the
  component's JSDoc was just corrected from `@part close` to `@part button` in an uncommitted
  local diff, consistent with the actual attribute).
- **Icon glyph**: the X shape is a hardcoded inline SVG mask in `close.mixin.scss`, not a
  `--ds-*` token. User confirmed reusing the existing `x` icon instance from `ds-icon`'s
  Instance Swap library (component key `2056:8249`) rather than drawing a new one-off vector —
  see `tokens:` → `iconGlyph` entry above.
- **Pre-existing Figma reference — ignored per user instruction.** `icon.figma.md`'s Phase 3b
  notes mention "the live `ds-close` reference (`1993:2`)" was inspected as a
  documentation-structure template. User confirmed: disregard any existing `ds-close`
  node/frame/component in Figma — Phase 3 builds fresh from the category template, no reuse, no
  diffing against `1993:2`.
- All 20 color/dimension CSS-var tokens resolved cleanly via `css-token-lookup.mjs` against
  `Base.tokens.json` — no missing tokens, no hard stops on the token side.
- `specs:` `px` values left `null` — Phase 6 (or an earlier spot-check) should pull the resolved
  pixel values from `Base.tokens.json`/`base.tokens.css` when building the Specs section.

## Phase 2 — variant grouping (proposed, revised per user: `inverted` is a top-level split)

**Axes mapped, per the Phase 2 table:**

| Prop/state                                                        | Test applied                                                                                                                                                                                                  | Figma mapping                                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `inverted`                                                        | **User decision: top-level split**, not a crossed boolean — produces two separate `COMPONENT_SET`s, same treatment as `ds-spinner`'s `Primary`/`Inverted` stacks (`PHASE-3-BUILD.md`'s "`inverted` only" row) | top-level split: `Close/Primary`, `Close/Inverted`                                                              |
| `size`                                                            | enum, same layers, different token                                                                                                                                                                            | variant property `size`: `sm`/`base`/`md` (crossed inside each split)                                           |
| `disabled` + pseudo-classes (`:hover`/`:focus-visible`/`:active`) | pseudo-class/state-ish prop                                                                                                                                                                                   | **folded into one `state` property**: `default`/`hover`/`focus`/`active`/`disabled` (crossed inside each split) |
| `button`, `buttonColor`, `buttonSize`                             | —                                                                                                                                                                                                             | EXCLUDED (your instruction — nested `<ds-button>` render path out of scope)                                     |

**No open-ended content prop, no free-text prop** — nothing else to classify.

**Variant count**: 2 top-level splits (`Close/Primary`, `Close/Inverted`), each crossing
3 (`size`) × 5 (`state`) = 15 variants → **30 variants total** (15 + 15). Well under the 500
hard stop — no mitigation needed.

**Grid — top-level split, each split is the normal 2-axis case** (`state` rows × `size`
columns, same grid shape for both splits):

`Close/Primary`:

```
            sm       base     md
default   [cell]   [cell]   [cell]
hover     [cell]   [cell]   [cell]
focus     [cell]   [cell]   [cell]
active    [cell]   [cell]   [cell]
disabled  [cell]   [cell]   [cell]
```

`Close/Inverted`:

```
            sm       base     md
default   [cell]   [cell]   [cell]
hover     [cell]   [cell]   [cell]
focus     [cell]   [cell]   [cell]
active    [cell]   [cell]   [cell]
disabled  [cell]   [cell]   [cell]
```

Two `COMPONENT_SET`s (`Close/Primary`, `Close/Inverted`), each 15 variants, both shown stacked
vertically inside the "🔒 Component Set" section per `conventions/page-structure.md`'s true
`inverted`-axis display rule. `button`'s structural axis is excluded, not built as a third split.
The `x` icon library instance (per your earlier decision) is nested identically inside every one
of the 30 variants across both sets, re-colored per cell via the `close-color-icon`-family
tokens (`...-inverted-...` tokens inside `Close/Inverted`, `...-primary-...` tokens inside
`Close/Primary`).

**Awaiting your confirmation on this revised grouping before Phase 3 build starts.** — Confirmed by user.

## Phase 3 — build progress (complete)

- **Category page**: `Core / Actions` created fresh (page id `3022:2`), cloned from `🗂️ Template / Category`
  per user instruction to ignore any pre-existing `ds-close` node in Figma. `Category Header` filled
  (`component` = "Actions", `lead` = the fixed category-copy text).
- **Documentation frame**: cloned from the template's `Component A Documentation`, renamed
  `Close Documentation` (node `3022:6`); `Component B Documentation` deleted (not needed — only one
  component on this page so far). `Header` filled: kicker `Core / Actions`, component `Close`,
  `status=review` (template default, unchanged), lead = `close.tsx`'s JSDoc, `VERSION` = `v0.0.6`,
  `LAST UPDATED` = `04.11.2026`, all three links hyperlinked (Storybook storyId read from
  `close.doc-config.ts`).
- **Icon rebuild (mid-build correction)**: the first confirmed variant initially reused the
  existing `x` icon instance from `ds-icon`'s library (per the Phase 1 decision), but the user
  flagged it "looks a bit wrong" on review — its path data doesn't actually match
  `close.mixin.scss`'s own inline SVG closely enough (different viewBox/weight). Replaced with a
  hand-drawn vector built directly from `close.mixin.scss`'s exact path
  (`figma.createNodeFromSvg` + `figma.flatten`), still bound to the same `close-color-icon`-family
  tokens — now pixel-faithful to the real component. This supersedes the Phase 1 icon-glyph
  decision; `ds-icon`'s library is no longer referenced by this component.
- **Focus state**: not visible from `close.host.scss` alone — traced to the shared
  `focus-shadow()` mixin (`packages/styles/src/scss/mixins/general.mixin.scss`), a two-ring
  `box-shadow` (2px border-color ring + 5px focus-color ring). Initially modeled as two stacked
  `DROP_SHADOW` effects; corrected mid-build after discovering
  `conventions/build-mechanics.md`'s "Focus states" rule (never `DROP_SHADOW` — use absolutely
  positioned ring frames with outside strokes, since a drop shadow can fail to render on a
  transparent-background layer). Rebuilt as two concentric ellipses with `strokeAlign: 'OUTSIDE'`
  — `focus-ring-border` (2px weight, bound to `alias-interaction-focus-color-border`) and
  `focus-ring-color` (3px weight, +4px diameter, bound to `close-color-focus` Base/Inverted per
  split) — reproducing the same 0–2px / 2–5px two-tone band as the real CSS. Verified visually
  against both light and dark previews on all 6 focus variants.
- **Grid**: built as a genuine fixed-cell grid (64×64 cells, uniform across all 15 variants per
  set) — `state` as the single row lane (no bracket, per the one-row-axis rule), `size` as the 3
  columns, cloned label/divider nodes from the template's prototype lanes and resized/reduced
  (4 columns → 3, 2 lanes → 1, 3 row dividers → 4, 3 col dividers → 2). `Close/Primary` (node
  `3028:251`) and `Close/Inverted` (node `3028:342`) component sets replace the template's
  placeholder `Component A/Primary`/`Component A/Inverted` sets entirely.
- **Inverted dark preview**: the pale/white inverted-state icons were illegible on the page's
  default background — found that the template itself binds a dark fill directly onto the
  `COMPONENT_SET`'s own `fills` (not a separate backdrop rectangle, not per-cell) via
  `VariableID:137:419`; applied the same binding to `Close/Inverted`'s own fill. Matches the
  precedent in `icon.figma.md`'s Phase 3b notes (there applied per-row instead, since that
  component's architecture differs).
- **Bug fixed during build**: the row-label lane initially kept its old template `y=32.5` offset
  after being resized for 5 rows, pushing the `disabled` label off the bottom of the frame —
  fixed by zeroing the lane's `y` so its local coordinate space matches `Row Labels`/`Column
Labels`.
- User approved the finished documentation frame (header + both component sets) directly in
  Figma.

**Figma link**: https://www.figma.com/design/NzMFv5HwO14Mmro8bWyvlO?node-id=3022-6
