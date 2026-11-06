# close → Figma mapping

```yaml
sets: # filled in by Phase 3 — one entry per component set (top-level split), default set first.
  - name: Close # default set — inverted=false
    figmaComponentKey: '934457a462929ecea0d493a517d7eba6395558cc'
    figmaMasterNodeId: '3917:1055'
  - name: CloseInverted # inverted=true — always a top-level split per the `inverted` rule
    figmaComponentKey: '1089ce96cab695396116693ae110dd7850380f1e'
    figmaMasterNodeId: '3917:1119'
figmaPage: Core / Actions # shared category page — NOT this component's own name

figmaDocFrameNodeId: '3909:1130' # "Close Documentation" frame on Core / Actions

anatomy:
  - letter: A
    part: button
    description: 'The close button element.'
  # Only one @part tag (`button`), used on both the native <button> (non-button mode) and the
  # ds-button part="button" wrapper (button mode). Since the `button` variant is skipped per user
  # instruction (see Notes), only the native <button>'s part="button" is in scope for this build.

props:
  - name: size
    type: enum
    options: [sm, md] # CLOSE_SIZES; unset is the real code default, rendering as 24px (see tokens)
    default: '(unset — falls back to Component/Close/Size/Base, same implicit-default pattern as badge/spinner/icon)'
    figmaProperty: size
    figmaPropertyType: variant
    figmaOptions: [base, sm, md] # code default first, then canonical order

  - name: inverted
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: top-level split (rule 2 — inverted axis is always split, exception to the
      same-layers test) → Close / CloseInverted sets, see `sets:` above

  - name: disabled
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: 'folded into `state` below as its 5th option — pseudo-class/state-ish prop,
      never a separate boolean axis (Phase 2 mapping table)'

  - name: button
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: EXCLUDED (per user instruction — "ignore/skip the button variant")
    note: >
      When true, close.tsx renders a <ds-button> instead of its own native <button> (see
      close.tsx render()). User explicitly asked to skip this variant for this push. Not modeled
      in Figma at all — no top-level split, no instance. `buttonColor` and `buttonSize` below are
      excluded for the same reason (both are only-applicable-if-button=true).

  - name: buttonColor
    type: enum
    options: [BUTTON_COLORS — see button.interfaces.ts]
    figmaProperty: null
    figmaPropertyType: EXCLUDED (only applicable if button=true, which is itself excluded)

  - name: buttonSize
    type: enum
    options: [sm, lg] # CLOSE_BUTTON_SIZES
    figmaProperty: null
    figmaPropertyType: EXCLUDED (only applicable if button=true, which is itself excluded)

states:
  figmaProperty: state
  options: [default, hover, focus, active, disabled] # code default first, disabled last per
  # canonical order; disabled folds in here rather than being its own boolean (Phase 2 table)
  sources:
    hover: '&:hover, gated by :not(:disabled) (close.mixin.scss)'
    focus: '&:focus-visible / &.is-focused, gated by :not(:disabled) (close.mixin.scss)'
    active: '&:active, gated by :not(:disabled) (close.mixin.scss)'
    disabled: 'disabled prop → :disabled attribute (close.tsx / close.mixin.scss)'

nested: [] # ds-close has no nested DS components. The "X" glyph is a hardcoded inline SVG
# data-URI mask-image baked directly into close.mixin.scss (not a <ds-icon> usage, no icon prop
# to swap) — see tokens: entry `close-icon` below for how this resolves to a Figma vector.

tokens:
  - cssVar: --ds-close-primary-color-background-base
    figmaVariable: 🧩 Component/Close/Primary/Color/Background/Base
    figmaVariableId: 'VariableID:137:1383'
    resolved: true
  - cssVar: --ds-close-primary-color-background-hover
    figmaVariable: 🧩 Component/Close/Primary/Color/Background/Hover
    figmaVariableId: 'VariableID:137:1381'
    resolved: true
  - cssVar: --ds-close-primary-color-background-active
    figmaVariable: 🧩 Component/Close/Primary/Color/Background/Active
    figmaVariableId: 'VariableID:137:1382'
    resolved: true
  - cssVar: --ds-close-primary-color-icon-base
    figmaVariable: 🧩 Component/Close/Primary/Color/Icon/Base
    figmaVariableId: 'VariableID:137:1385'
    resolved: true
  - cssVar: --ds-alias-interaction-focus-color-base
    figmaVariable: 🔗 Alias/✨ Interaction/Focus/Color/Base
    figmaVariableId: 'VariableID:137:247'
    resolved: true
  - cssVar: --ds-close-radius
    figmaVariable: 🧩 Component/Close/Radius
    figmaVariableId: 'VariableID:137:1374'
    resolved: true
  - cssVar: --ds-close-size-base
    figmaVariable: 🧩 Component/Close/Size/Base
    figmaVariableId: 'VariableID:137:1387'
    resolved: true
  - cssVar: --ds-close-padding-base
    figmaVariable: 🧩 Component/Close/Padding/Base
    figmaVariableId: 'VariableID:137:1390'
    resolved: true
  - cssVar: --ds-close-size-sm
    figmaVariable: 🧩 Component/Close/Size/SM
    figmaVariableId: 'VariableID:137:1389'
    resolved: true
  - cssVar: --ds-close-padding-sm
    figmaVariable: 🧩 Component/Close/Padding/SM
    figmaVariableId: 'VariableID:137:1392'
    resolved: true
  - cssVar: --ds-close-size-md
    figmaVariable: 🧩 Component/Close/Size/MD
    figmaVariableId: 'VariableID:137:1388'
    resolved: true
  - cssVar: --ds-close-padding-md
    figmaVariable: 🧩 Component/Close/Padding/MD
    figmaVariableId: 'VariableID:137:1391'
    resolved: true
  - cssVar: --ds-close-inverted-color-icon-base
    figmaVariable: 🧩 Component/Close/Inverted/Color/Icon/Base
    figmaVariableId: 'VariableID:137:1379'
    resolved: true
  - cssVar: --ds-close-inverted-color-background-hover
    figmaVariable: 🧩 Component/Close/Inverted/Color/Background/Hover
    figmaVariableId: 'VariableID:137:1375'
    resolved: true
  - cssVar: --ds-close-inverted-color-background-active
    figmaVariable: 🧩 Component/Close/Inverted/Color/Background/Active
    figmaVariableId: 'VariableID:137:1376'
    resolved: true
  - cssVar: --ds-alias-interaction-focus-color-inverted
    figmaVariable: 🔗 Alias/✨ Interaction/Focus/Color/Inverted
    figmaVariableId: 'VariableID:137:248'
    resolved: true
  - cssVar: --ds-close-primary-color-icon-disabled
    figmaVariable: 🧩 Component/Close/Primary/Color/Icon/Disabled
    figmaVariableId: 'VariableID:137:1386'
    resolved: true
  - cssVar: --ds-close-primary-color-background-disabled
    figmaVariable: 🧩 Component/Close/Primary/Color/Background/Disabled
    figmaVariableId: 'VariableID:137:1384'
    resolved: true
  - cssVar: --ds-close-inverted-color-icon-disabled
    figmaVariable: 🧩 Component/Close/Inverted/Color/Icon/Disabled
    figmaVariableId: 'VariableID:137:1380'
    resolved: true
  - cssVar: --ds-close-inverted-color-background-disabled
    figmaVariable: 🧩 Component/Close/Inverted/Color/Background/Disabled
    figmaVariableId: 'VariableID:137:1378'
    resolved: true
  - cssVar: close-icon (hardcoded inline SVG data-URI mask-image, close.mixin.scss line 29)
    figmaVariable: null (not a design-token value — a fixed vector shape, the "X" glyph)
    figmaVariableId: null
    resolved: true
    resolution: >
      Not a CSS-var token — the glyph is a literal inline SVG baked into the component's own
      SCSS (14×14 viewbox "X" path), not a <ds-icon> instance, so there's no instance-swap prop
      to bind. Visually identical shape already exists as a standalone asset at
      packages/assets/src/icons/svg/close.svg (different path data, same rendered "X", 16×16
      viewbox). Build as a static vector matching the inline mask path (not the standalone
      asset's path, to stay faithful to what this component actually renders), with its fill
      bound to whichever of the color tokens above applies per state/inverted/disabled — not an
      Instance Swap, since code offers no way to swap this glyph.

specs:
  base:
    - kind: size
      label: Size
      px: 24
      token: 🧩 Component/Close/Size/Base
    - kind: spacing
      label: Padding
      px: 10
      token: 🧩 Component/Close/Padding/Base
    - kind: size
      label: Icon size
      px: 14
      token: 'derived: Size/Base (24) − Padding/Base (10)'
      calc: '24px − 10px'
  sm:
    - kind: size
      label: Size
      px: 14
      token: 🧩 Component/Close/Size/SM
    - kind: spacing
      label: Padding
      px: 6
      token: 🧩 Component/Close/Padding/SM
    - kind: size
      label: Icon size
      px: 8
      token: 'derived: Size/SM (14) − Padding/SM (6)'
      calc: '14px − 6px'
  md:
    - kind: size
      label: Size
      px: 32
      token: 🧩 Component/Close/Size/MD
    - kind: spacing
      label: Padding
      px: 14
      token: 🧩 Component/Close/Padding/MD
    - kind: size
      label: Icon size
      px: 18
      token: 'derived: Size/MD (32) − Padding/MD (14)'
      calc: '32px − 14px'
  # Radius omitted per PHASE-8 rule: --ds-close-radius resolves to Alias/Radius/Rounded
  # (Global/Dimension/Radius/9999) — a fully-rounded/circular shape, radius not shown for circles.
```

## Notes

- **`button` variant explicitly skipped**, per user instruction for this push. `ds-close`'s
  `button`/`buttonColor`/`buttonSize` props are extracted above for completeness but marked
  `EXCLUDED` — not modeled in Figma, no top-level split for it. Only the native-`<button>`
  rendering path (size / inverted / state) is in scope.
- All CSS-var tokens resolved locally via `css-token-lookup.mjs` — zero hard stops, zero missing
  tokens.
- The "X" glyph has no CSS-var binding (it's a literal inline SVG in the component's own SCSS,
  not a token or a nested `ds-icon`) — flagged and resolved above as a static vector, not an
  Instance Swap.

## Phase 2 — variant grouping proposal

Applying the mapping table:

| Prop                                | Test                               | Figma mapping                                     |
| ----------------------------------- | ---------------------------------- | ------------------------------------------------- |
| `size`                              | Enum, same layers, different token | Variant property `size`, options `[base, sm, md]` |
| `inverted`                          | Inverted axis (rule 2 exception)   | Top-level split → `Close` / `CloseInverted` sets  |
| `disabled`                          | Pseudo-class/state-ish prop        | Folded into `state`, not a separate boolean       |
| hover/focus/active                  | Pseudo-class states                | Folded into `state`                               |
| `button`/`buttonColor`/`buttonSize` | Excluded per user instruction      | Not modeled                                       |

**Two top-level sets** (`inverted` split), each crossing `size` (3) × `state` (5):

**Set: Close** (`inverted=false`)

```
        default  hover   focus   active  disabled
base    [cell]   [cell]  [cell]  [cell]  [cell]
sm      [cell]   [cell]  [cell]  [cell]  [cell]
md      [cell]   [cell]  [cell]  [cell]  [cell]
```

**Set: CloseInverted** (`inverted=true`) — same grid shape:

```
        default  hover   focus   active  disabled
base    [cell]   [cell]  [cell]  [cell]  [cell]
sm      [cell]   [cell]  [cell]  [cell]  [cell]
md      [cell]   [cell]  [cell]  [cell]  [cell]
```

`state` is the column axis (hard rule), `size` on rows, both ordered code-default-first.

**Variant count**: 2 sets × (3 size × 5 state) = **30 variants total** — well under the 500
hard-stop threshold. No mitigation needed.

Note: within each set, the `disabled` column renders hover/focus/active-identical visuals since
those pseudo-states are unreachable when `disabled` is true in real code (gated by
`:not(:disabled)`) — this is expected, not a defect; `disabled` only ever shows its own static
look, same as every other component's `state` axis in this system.

**Confirmed by user — proceeding to Phase 3 build (2 sets × 15 variants each = 30 total).**
