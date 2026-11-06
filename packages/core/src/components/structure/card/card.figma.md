# card → Figma mapping

```yaml
sets: # filled in by Phase 3
  - name: Card
    figmaComponentKey: '3bd1c2a270998d421c69959fa168172d7ed0c86c'
    figmaMasterNodeId: '4388:167'
  - name: CardInverted # top-level split — rule 2 (inverted axis always splits)
    figmaComponentKey: '50021587e09520fed3344a1ee47afa3b15522c03'
    figmaMasterNodeId: '4392:191'
figmaPage: Core / Structure
figmaDocFrameNodeId: '4384:6'

grouping: # Phase 2 proposal
  topLevelSplit:
    axis: inverted
    sets: [Card, CardInverted]
    reason: 'Hard rule 2 — inverted always splits, even same-layers/different-token.'
  crossedAxes: # per set — column axis last (hard rule: no state axis present, so size-like scale goes to columns)
    - { name: flat, options: [false, true], role: row, nestLevel: outermost }
    - { name: dense, options: [false, true], role: row, nestLevel: 2 }
    - { name: align, options: [none, center], role: row, nestLevel: innermost }
    - { name: space, options: [base, sm, lg], role: column }
  variantCount:
    fullCrossNoMitigation: 6912 # flat2 * tile2 * dense2 * imageTeaser4 * fullheight2 * align3 * space3 * color12
    mitigations:
      - { axis: color, mitigation: variable-override, factorRemoved: 12 }
      - { axis: tile, mitigation: excluded, factorRemoved: 2 }
      - { axis: fullheight, mitigation: excluded, factorRemoved: 2 }
      - { axis: align, mitigation: 'option dropped (left, dead per .align-left gap)', factorRemoved: '3→2' }
      - { axis: imageTeaser, mitigation: 'excluded (not representable on an isolated component)', factorRemoved: 4 }
    perSetCount: 24 # flat2 * dense2 * align2 (space3 is the column axis, already included: 2*2*2*3=24)
    totalCount: 48 # perSetCount * 2 sets (Card, CardInverted)
    threshold: 500
    status: under-threshold

anatomy:
  - letter: A
    part: card
    description: 'The card container element (<article id="card" part="card">).'
    # part="card" attribute was added to render() in this session — the component's own
    # @part JSDoc tag had no matching attribute until now (hard stop resolved with the user).

props:
  - name: flat
    type: boolean
    figmaProperty: flat
    figmaPropertyType: variant
    figmaOptions: [false, true]
  - name: tile
    type: boolean
    excluded: true
    reason: "Zero visible effect on ds-card alone — only changes the nested ds-card-header's grid-template-columns/areas. Reversed from the earlier 'map it anyway' call once its budget cost (2x multiplier for no pixel difference) was weighed against the 500-variant cap. Will map properly when ds-card-header is pushed."
  - name: dense
    type: boolean
    figmaProperty: dense
    figmaPropertyType: variant
    figmaOptions: [false, true]
  - name: imageTeaser
    type: enum
    options: [wide-left, wide-center, wide-right]
    excluded: true
    reason: "Effect (negative margin, max-width: fit-content) is only meaningful relative to a parent context — a standalone Figma COMPONENT has no parent to collapse margin against, and max-width: fit-content is a no-op once width is already fixed. All 4 options would render pixel-identical in isolation. Same precedent as tile/fullheight. Tablet/desktop width changes (75%/50%) under wide-* are additionally hardcoded percentages, not --ds-* token bound — pure layout per PHASE-1 step 5a's exemption, not a responsive device: binding, and a second reason this axis isn't representable as a static Figma variant."
  - name: inverted
    type: boolean
    figmaPropertyType: top-level-split
    note: "Hard rule 2 (always split) applies regardless of same-layers/different-token. Sets: Card (default) / CardInverted. Since color is now a variable-override (not crossed, see below), CardInverted doesn't need to carry a redundant crossed color axis — it ships with the primary-forced look (colorTypeClass always resolves to 'primary' when inverted+color are both set in code) and consumers override the color variables per instance same as the default set."
  - name: clickable
    type: boolean
    excluded: true
    reason: 'Dead prop — no class binding in render(), no selector anywhere in card.style.scss/card.host.scss. Nothing to represent in Figma. Dropped from scope per user decision; flagged as a code-side gap for a follow-up outside this skill run.'
  - name: selected
    type: boolean
    excluded: true
    reason: 'Dead prop — same as clickable: declared, never read in render() or SCSS.'
  - name: fullheight
    type: boolean
    excluded: true
    reason: 'Effect (height: 100%) only shows inside a height-constrained ancestor — renders identically to false in an unconstrained Figma frame. Excluded from the crossed grid to stay under the 500-variant cap; documented as code-only behavior.'
  - name: align
    type: enum
    options: [center, left]
    figmaProperty: align
    figmaPropertyType: variant
    figmaOptions: [none, center]
    note: "left dropped — CARD_ALIGNMENTS allows 'left' but card.style.scss has no .align-left rule (only .align-center and an unreachable .align-right, since 'right' isn't a valid prop value). align=left renders identically to unset. Excluded per the same dead-prop precedent as tile/fullheight."
  - name: space
    type: enum
    options: [sm, lg]
    figmaProperty: space
    figmaPropertyType: variant
    figmaOptions: [base, sm, lg] # implicit unset default named `base`, canonical order after
  - name: color
    type: enum
    options: [primary, grey, dashed, red, yellow, purple, green, red-dark, yellow-dark, purple-dark, green-dark]
    figmaPropertyType: variable-override
    note: "Token-swap axis (same layers, only background/text/border tokens differ) — 12 options would have been the dominant factor pushing the full cross to 6,912. Bound to a Figma Variable per token (background/text/border) instead of crossed; consumers override per instance. Also resolves the inverted+color interaction (inverted forcing 'primary' regardless of the chosen color) since color is no longer a crossed axis for it to collide with."

tokens:
  - cssVar: --ds-card-color-default-background
    figmaVariable: 🧩 Component/Card/Color/Default/Background
    figmaVariableId: 'VariableID:137:1363'
    resolved: true
  - cssVar: --ds-card-color-default-text
    figmaVariable: 🧩 Component/Card/Color/Default/Text
    figmaVariableId: 'VariableID:137:1362'
    resolved: true
  - cssVar: --ds-card-color-default-border
    figmaVariable: 🧩 Component/Card/Color/Default/Border
    figmaVariableId:
      color: 'VariableID:137:1364'
      width: 'VariableID:137:1365'
      style: 'VariableID:137:1366'
    resolved: true
  - cssVar: --ds-card-radius
    figmaVariable: 🧩 Component/Card/Radius
    figmaVariableId: 'VariableID:137:1291'
    resolved: true
  - cssVar: --ds-card-shadow-base
    figmaVariable: 🧩 Component/Card/Shadow/Base
    figmaVariableId:
      offsetX: 'VariableID:137:1297'
      offsetY: 'VariableID:137:1298'
      blur: 'VariableID:137:1299'
      spread: 'VariableID:137:1300'
      color: 'VariableID:137:1301'
    resolved: true
  - cssVar: --ds-card-shadow-flat
    figmaVariable: 🧩 Component/Card/Shadow/Flat
    figmaVariableId:
      offsetX: 'VariableID:137:1292'
      offsetY: 'VariableID:137:1293'
      blur: 'VariableID:137:1294'
      spread: 'VariableID:137:1295'
      color: 'VariableID:137:1296'
    resolved: true
    note: "Measured boxShadow renders as literal 'none' on both the flat and dense variants — the token's assembled values compose to a no-op shadow."
  - cssVar: --ds-card-gap-base
    figmaVariable: 🧩 Component/Card/Gap/Base
    figmaVariableId: 'VariableID:137:1368'
    resolved: true
  - cssVar: --ds-card-gap-sm
    figmaVariable: 🧩 Component/Card/Gap/SM
    figmaVariableId: 'VariableID:137:1367'
    resolved: true
  - cssVar: --ds-card-gap-lg
    figmaVariable: 🧩 Component/Card/Gap/LG
    figmaVariableId: 'VariableID:137:1370'
    resolved: true
  - cssVar: --ds-card-padding-base
    figmaVariable: 🧩 Component/Card/Padding/Base
    figmaVariableId: 'VariableID:137:1372'
    resolved: true
  - cssVar: --ds-card-padding-sm
    figmaVariable: 🧩 Component/Card/Padding/SM
    figmaVariableId: 'VariableID:137:1371'
    resolved: true
  - cssVar: --ds-card-padding-lg
    figmaVariable: 🧩 Component/Card/Padding/LG
    figmaVariableId: 'VariableID:137:1373'
    resolved: true
  - cssVar: --ds-card-color-primary-background
    figmaVariable: 🧩 Component/Card/Color/Primary/Background
    figmaVariableId: 'VariableID:137:1308'
    resolved: true
  - cssVar: --ds-card-color-primary-text
    figmaVariable: 🧩 Component/Card/Color/Primary/Text
    figmaVariableId: 'VariableID:137:1307'
    resolved: true
  - cssVar: --ds-card-color-primary-border
    figmaVariable: 🧩 Component/Card/Color/Primary/Border
    figmaVariableId:
      color: 'VariableID:137:1309'
      width: 'VariableID:137:1310'
      style: 'VariableID:137:1311'
    resolved: true
  - cssVar: --ds-card-color-grey-background
    figmaVariable: 🧩 Component/Card/Color/Grey/Background
    figmaVariableId: 'VariableID:137:1316'
    resolved: true
  - cssVar: --ds-card-color-grey-text
    figmaVariable: 🧩 Component/Card/Color/Grey/Text
    figmaVariableId: 'VariableID:137:1312'
    resolved: true
  - cssVar: --ds-card-color-grey-border
    figmaVariable: 🧩 Component/Card/Color/Grey/Border
    figmaVariableId:
      color: 'VariableID:137:1313'
      width: 'VariableID:137:1314'
      style: 'VariableID:137:1315'
    resolved: true
  - cssVar: --ds-card-color-dashed-background
    figmaVariable: 🧩 Component/Card/Color/Dashed/Background
    figmaVariableId: 'VariableID:137:1358'
    resolved: true
  - cssVar: --ds-card-color-dashed-text
    figmaVariable: 🧩 Component/Card/Color/Dashed/Text
    figmaVariableId: 'VariableID:137:1357'
    resolved: true
  - cssVar: --ds-card-color-dashed-border
    figmaVariable: 🧩 Component/Card/Color/Dashed/Border
    figmaVariableId:
      color: 'VariableID:137:1359'
      width: 'VariableID:137:1360'
      style: 'VariableID:137:1361'
    resolved: true
  - cssVar: --ds-card-color-red-background
    figmaVariable: 🧩 Component/Card/Color/Red/Background
    figmaVariableId: 'VariableID:137:1343'
    resolved: true
  - cssVar: --ds-card-color-red-text
    figmaVariable: 🧩 Component/Card/Color/Red/Text
    figmaVariableId: 'VariableID:137:1342'
    resolved: true
  - cssVar: --ds-card-color-red-border
    figmaVariable: 🧩 Component/Card/Color/Red/Border
    figmaVariableId:
      color: 'VariableID:137:1344'
      width: 'VariableID:137:1345'
      style: 'VariableID:137:1346'
    resolved: true
  - cssVar: --ds-card-color-red-dark-background
    figmaVariable: 🧩 Component/Card/Color/RedDark/Background
    figmaVariableId: 'VariableID:137:1338'
    resolved: true
  - cssVar: --ds-card-color-red-dark-text
    figmaVariable: 🧩 Component/Card/Color/RedDark/Text
    figmaVariableId: 'VariableID:137:1337'
    resolved: true
  - cssVar: --ds-card-color-red-dark-border
    figmaVariable: 🧩 Component/Card/Color/RedDark/Border
    figmaVariableId:
      color: 'VariableID:137:1339'
      width: 'VariableID:137:1340'
      style: 'VariableID:137:1341'
    resolved: true
  - cssVar: --ds-card-color-green-background
    figmaVariable: 🧩 Component/Card/Color/Green/Background
    figmaVariableId: 'VariableID:137:1323'
    resolved: true
  - cssVar: --ds-card-color-green-text
    figmaVariable: 🧩 Component/Card/Color/Green/Text
    figmaVariableId: 'VariableID:137:1322'
    resolved: true
  - cssVar: --ds-card-color-green-border
    figmaVariable: 🧩 Component/Card/Color/Green/Border
    figmaVariableId:
      color: 'VariableID:137:1324'
      width: 'VariableID:137:1325'
      style: 'VariableID:137:1326'
    resolved: true
  - cssVar: --ds-card-color-green-dark-background
    figmaVariable: 🧩 Component/Card/Color/GreenDark/Background
    figmaVariableId: 'VariableID:137:1318'
    resolved: true
  - cssVar: --ds-card-color-green-dark-text
    figmaVariable: 🧩 Component/Card/Color/GreenDark/Text
    figmaVariableId: 'VariableID:137:1317'
    resolved: true
  - cssVar: --ds-card-color-green-dark-border
    figmaVariable: 🧩 Component/Card/Color/GreenDark/Border
    figmaVariableId:
      color: 'VariableID:137:1319'
      width: 'VariableID:137:1320'
      style: 'VariableID:137:1321'
    resolved: true
  - cssVar: --ds-card-color-purple-background
    figmaVariable: 🧩 Component/Card/Color/Purple/Background
    figmaVariableId: 'VariableID:137:1353'
    resolved: true
  - cssVar: --ds-card-color-purple-text
    figmaVariable: 🧩 Component/Card/Color/Purple/Text
    figmaVariableId: 'VariableID:137:1352'
    resolved: true
  - cssVar: --ds-card-color-purple-border
    figmaVariable: 🧩 Component/Card/Color/Purple/Border
    figmaVariableId:
      color: 'VariableID:137:1354'
      width: 'VariableID:137:1355'
      style: 'VariableID:137:1356'
    resolved: true
  - cssVar: --ds-card-color-purple-dark-background
    figmaVariable: 🧩 Component/Card/Color/PurpleDark/Background
    figmaVariableId: 'VariableID:137:1348'
    resolved: true
  - cssVar: --ds-card-color-purple-dark-text
    figmaVariable: 🧩 Component/Card/Color/PurpleDark/Text
    figmaVariableId: 'VariableID:137:1347'
    resolved: true
  - cssVar: --ds-card-color-purple-dark-border
    figmaVariable: 🧩 Component/Card/Color/PurpleDark/Border
    figmaVariableId:
      color: 'VariableID:137:1349'
      width: 'VariableID:137:1350'
      style: 'VariableID:137:1351'
    resolved: true
  - cssVar: --ds-card-color-yellow-background
    figmaVariable: 🧩 Component/Card/Color/Yellow/Background
    figmaVariableId: 'VariableID:137:1333'
    resolved: true
  - cssVar: --ds-card-color-yellow-text
    figmaVariable: 🧩 Component/Card/Color/Yellow/Text
    figmaVariableId: 'VariableID:137:1332'
    resolved: true
  - cssVar: --ds-card-color-yellow-border
    figmaVariable: 🧩 Component/Card/Color/Yellow/Border
    figmaVariableId:
      color: 'VariableID:137:1334'
      width: 'VariableID:137:1335'
      style: 'VariableID:137:1336'
    resolved: true
  - cssVar: --ds-card-color-yellow-dark-background
    figmaVariable: 🧩 Component/Card/Color/YellowDark/Background
    figmaVariableId: 'VariableID:137:1328'
    resolved: true
  - cssVar: --ds-card-color-yellow-dark-text
    figmaVariable: 🧩 Component/Card/Color/YellowDark/Text
    figmaVariableId: 'VariableID:137:1327'
    resolved: true
  - cssVar: --ds-card-color-yellow-dark-border
    figmaVariable: 🧩 Component/Card/Color/YellowDark/Border
    figmaVariableId:
      color: 'VariableID:137:1329'
      width: 'VariableID:137:1330'
      style: 'VariableID:137:1331'
    resolved: true

specs:
  drawnOption: base
  options: [base, sm, lg]
  behavior:
    width: fill # :host { width: 100% } — card.host.scss:26, unconditional, not measured via probe
  rows:
    - property: Padding
      kind: spacing
      group: inner spacing
      show: drawn
      instance: main
      source: 'card.style.scss:27-30 (base); :319-325 (space variants)'
      values:
        sm: { px: 16, token: 🧩 Component/Card/Padding/SM }
        base: { px: 24, token: 🧩 Component/Card/Padding/Base }
        lg: { px: 48, token: 🧩 Component/Card/Padding/LG }
    - property: Gap
      kind: spacing
      group: inner spacing
      show: table
      reason: "Not drawn — the built instance (Copy me/Anatomy/Specs all use it) has no second child for gap to visibly separate; ds-card is a pure empty container in this skill's scope. Token is still correct and bound (Phase 3); numbered table row only, per user decision."
      source: 'card.style.scss:26 (base); :319 (space variants)'
      values:
        sm: { px: 16, token: 🧩 Component/Card/Gap/SM }
        base: { px: 24, token: 🧩 Component/Card/Gap/Base }
        lg: { px: 48, token: 🧩 Component/Card/Gap/LG }
    - property: Border width
      kind: shape
      group: fixed
      show: drawn
      instance: main
      source: 'card.style.scss:57'
      values:
        base: { px: 2, token: 🧩 Component/Card/Color/Default/Border (width) }
    - property: Radius
      kind: shape
      group: fixed
      show: drawn
      instance: main
      source: 'card.style.scss:56'
      values:
        base: { px: 12, token: 🧩 Component/Card/Radius }
    - property: Height
      kind: size
      group: derived
      show: skip
      reason: 'No height/min-height set by card.style.scss — box height is content + padding + gap.'
      values:
        base: { px: 227 }
        sm: { px: 131 }
        lg: { px: 227 }
```

## Notes

- **Hard stop resolved**: `card.tsx`'s class-level `@part card` JSDoc had no matching `part="..."`
  attribute in `render()`. Added `part="card"` to the `<article id="card">` element (user-approved
  fix) before measuring.
- **Scope**: this run covers `ds-card` only. `ds-card-header`, `ds-card-content`, `ds-card-title`,
  `ds-card-subtitle`, `ds-card-actions` are separate Stencil components under the same
  `structure/card/` directory and need their own runs of this skill.
- **`clickable`/`selected` dropped**: both are declared `@Prop()`s with no effect anywhere in
  `card.tsx` or its SCSS — a code-side gap, not something this skill can represent. Flagged for a
  follow-up outside this run.
- **`inverted`/`tile` conditional**: both are mapped as Figma variant properties per the user's
  decision, but each one's visible effect depends on something outside `ds-card` alone (`inverted`
  needs `color` set; `tile` only changes the nested `ds-card-header`'s grid). Phase 2 should decide
  how the variant grid represents that dependency (e.g. pairing `inverted` only with non-`none`
  `color` options, or a note on the tile row that the drawn instance looks identical to non-tile
  until `ds-card-header` is nested).
- **Stale test fixture**: `test/card.visual.html` contains attributes that don't exist on the
  current prop API — `color="yellow-light"`/`color="purple-light"` (not in `CARD_COLORS`),
  `image-teaser="wide"` (not in `CARD_IMAGE_TEASERS`), and `outlined` (not a declared prop at all).
  Those sections were skipped during measurement per the user's decision; the fixture itself is
  unchanged (not this skill's job to fix) and should be cleaned up separately.
- **Shadow is not a specs row**: `box-shadow` changes with `flat`/`dense` but it's a color/elevation
  style, not geometry — consistent with "states don't get specs" from `conventions/specs.md`. Both
  `--ds-card-shadow-base` and `--ds-card-shadow-flat` are captured in `tokens:` for Phase 3 binding,
  just not drawn as a specs row.
- **Color variants don't get specs rows**: per `conventions/specs.md` ("an inverted split changes
  colors, never geometry"), the 11 `color` options plus `inverted` only swap
  background/text/border-color tokens — no geometry differs, so no additional specs rows beyond
  the base/sm/lg set above.
- **No responsive (`device:`) bindings**: the only breakpoint mixins in `card.style.scss`
  (`@include tablet()`/`@include desktop()`) live entirely inside the `.is-image-teaser-wide*`
  rules, and set hardcoded percentage widths/margins, not a `--ds-*` token that differs per
  breakpoint — so step 5a's responsive-binding case doesn't apply here.
- **No pseudo-class states**: `card.host.scss` sets only `display`/`width`; `card.style.scss` has
  no `:hover`/`:focus`/`:active`/`:disabled` selector on the card itself (the only `:hover` in the
  file targets `.ds-image-link img`, an internal image-zoom effect unrelated to card-level state).
- **No text-bearing parts**: part A (`card`) is a layout container (`<article>`) with no text node
  of its own — all text comes from slotted light-DOM children (`ds-card-title`, `ds-card-content`,
  etc.), out of scope for this component's own token/text-attribute resolution.
