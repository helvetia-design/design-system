# spinner → Figma mapping

> **Status: Phase 2 confirmed. Phase 3 built — awaiting user approval of the documentation frame in Figma.**

```yaml
figmaComponentKey: null # four top-level sets, see figmaSets below
figmaPage: Core / Indicators # page node 2804:322
figmaMasterNodeId: null # see figmaSets
figmaDocFrameNodeId: '2804:326' # "Spinner Documentation"
figmaSets:
  logoPrimary: { nodeId: '2807:168', key: '3aeb67a5db77eba2d7990a1dd37a59f068877cd8' }
  logoInverted: { nodeId: '2807:185', key: '2bb4a4afd740de515aff1bfc6a7843bb6fbfe370' }
  circlePrimary: { nodeId: '2807:206', key: 'ba714b46d3051c410c474caabef131aef89849ed' }
  circleInverted: { nodeId: '2807:227', key: '54634663f44bd730b82f0ec6c4e869d0674096ca' }

anatomy:
  - letter: A
    part: inner
    description: 'The spinner animation container element.'
  - letter: B
    part: label
    description: 'The visible label rendered next to the spinner.'

props:
  - name: variation
    type: enum
    options: [logo, circle]
    default: logo
    figmaProperty: variation
    figmaPropertyType: variant
    figmaOptions: [logo, circle]
  - name: size
    type: enum
    options: [sm]
    default: '(unset — implicit `base`, md tier tokens)'
    figmaProperty: size
    figmaPropertyType: variant
    figmaOptions: [sm, base]
  - name: inverted
    type: boolean
    default: false
    figmaProperty: inverted
    figmaPropertyType: variant
    figmaOptions: ['false', 'true']
  - name: label
    type: string
    default: ''
    figmaProperty: null
    figmaPropertyType: instance-text-override (+ show/hide boolean)
  - name: labelPosition
    type: enum
    options: [right, bottom]
    default: right
    figmaProperty: labelPosition
    figmaPropertyType: variant (only meaningful when a label is shown)
    figmaOptions: [right, bottom]
  - name: deactivated
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: EXCLUDED (proposed — only stops the Lottie animation; no static visual difference)

states: omitted — no pseudo-class states. The CSS `animation` (is-animated) is not a Figma state.

nested: none

tokens:
  # variation=circle
  - {
      cssVar: --ds-spinner-circle-size-md,
      figmaVariable: 🧩 Component/Spinner/Circle/Size/MD,
      figmaVariableId: 'VariableID:137:2098',
      resolved: true,
    }
  - {
      cssVar: --ds-spinner-circle-size-sm,
      figmaVariable: 🧩 Component/Spinner/Circle/Size/SM,
      figmaVariableId: 'VariableID:137:2097',
      resolved: true,
    }
  - {
      cssVar: --ds-spinner-circle-thickness-md,
      figmaVariable: 🧩 Component/Spinner/Circle/Thickness/MD,
      figmaVariableId: 'VariableID:137:2100',
      resolved: true,
    }
  - {
      cssVar: --ds-spinner-circle-thickness-sm,
      figmaVariable: 🧩 Component/Spinner/Circle/Thickness/SM,
      figmaVariableId: 'VariableID:137:2099',
      resolved: true,
    }
  - {
      cssVar: --ds-spinner-circle-primary-background,
      figmaVariable: 🧩 Component/Spinner/Circle/Primary/Background,
      figmaVariableId: 'VariableID:137:2093',
      resolved: true,
    }
  - {
      cssVar: --ds-spinner-circle-primary-progress,
      figmaVariable: 🧩 Component/Spinner/Circle/Primary/Progress,
      figmaVariableId: 'VariableID:137:2094',
      resolved: true,
    }
  - {
      cssVar: --ds-spinner-circle-inverted-background,
      figmaVariable: 🧩 Component/Spinner/Circle/Inverted/Background,
      figmaVariableId: 'VariableID:137:2095',
      resolved: true,
    }
  - {
      cssVar: --ds-spinner-circle-inverted-progress,
      figmaVariable: 🧩 Component/Spinner/Circle/Inverted/Progress,
      figmaVariableId: 'VariableID:137:2096',
      resolved: true,
    }
  # variation=logo
  - {
      cssVar: --ds-spinner-logo-size-md,
      figmaVariable: 🧩 Component/Spinner/Logo/Size/MD,
      figmaVariableId: 'VariableID:137:2101',
      resolved: true,
    }
  - {
      cssVar: --ds-spinner-logo-size-sm,
      figmaVariable: 🧩 Component/Spinner/Logo/Size/SM,
      figmaVariableId: 'VariableID:137:2102',
      resolved: true,
    }
  - cssVar: --ds-spinner-logo-primary-color
    figmaVariable: 🧩 Component/Spinner/Logo/Primary/Color
    figmaVariableId: 'VariableID:137:2104'
    resolved: true
    note: 'Not bound in SCSS — spinner.tsx getColor() hardcodes #000d6e. Token bound for the Figma visual; code drift is a separate follow-up.'
  - cssVar: --ds-spinner-logo-inverted-color
    figmaVariable: 🧩 Component/Spinner/Logo/Inverted/Color
    figmaVariableId: 'VariableID:137:2103'
    resolved: true
    note: 'Not bound in SCSS — spinner.tsx getColor() hardcodes #ffffff. Same drift note.'
  # label spacing (hardcoded rem literals in SCSS)
  - cssVar: '(literal 0.5rem, label-right gap)'
    figmaVariable: 🔗 Alias/↔️ Space/Gap/XS
    figmaVariableId: 'VariableID:137:262'
    resolved: true
    note: 'Hardcoded in spinner.host.scss; matching token bound, code drift is a follow-up.'
  - cssVar: '(literal 0.25rem, label-bottom gap)'
    figmaVariable: 🔗 Alias/↔️ Space/Gap/2XS
    figmaVariableId: 'VariableID:137:261'
    resolved: true
    note: 'Same drift note.'
  # label text
  - {
      cssVar: --ds-alias-text-family-text,
      figmaVariable: 🔗 Alias/🔤 Text/Family/Text,
      figmaVariableId: 'VariableID:137:279',
      resolved: true,
    }
  - {
      cssVar: --ds-alias-text-line-height-text,
      figmaVariable: 🔗 Alias/🔤 Text/LineHeight/Text,
      figmaVariableId: 'VariableID:137:283',
      resolved: true,
    }
  - {
      cssVar: '(inherited) font-size',
      figmaVariable: 📱 Device/🔤 Text/Size/Base/Device,
      figmaVariableId: 'VariableID:137:805',
      resolved: true,
      note: 'inherited-context binding',
    }
  - {
      cssVar: '(inherited) font-weight',
      figmaVariable: 🔗 Alias/🔤 Text/Weight/Regular,
      figmaVariableId: 'VariableID:137:285',
      resolved: true,
      note: 'inherited-context binding',
    }
  - {
      cssVar: '(inherited) color',
      figmaVariable: 🔗 Alias/🔤 Text/Color/Primary,
      figmaVariableId: 'VariableID:137:288',
      resolved: true,
      note: 'inherited-context binding; inverted uses Alias/Text/Color/InvertedPrimary (137:289)',
    }
  - cssVar: '(inherited) letter-spacing'
    figmaVariable: null
    figmaVariableId: null
    resolved: true
    resolution: 'No letter-spacing token exists. User accepted Figma default (0%) as a one-off.'
  - cssVar: '(inherited) text-decoration'
    figmaVariable: null
    figmaVariableId: null
    resolved: true
    resolution: 'No decoration token exists; label uses none. User accepted "none" as a one-off.'

specs: # per option of the Variants axis (size)
  base:
    - { kind: size, label: Logo size, px: 64, token: 🧩 Component/Spinner/Logo/Size/MD }
    - { kind: size, label: Circle size, px: 24, token: 🧩 Component/Spinner/Circle/Size/MD }
    - { kind: size, label: Circle thickness, px: 4, token: 🧩 Component/Spinner/Circle/Thickness/MD }
    - { kind: spacing, label: Gap (label right), px: 8, token: 🔗 Alias/↔️ Space/Gap/XS }
    - { kind: spacing, label: Gap (label bottom), px: 4, token: 🔗 Alias/↔️ Space/Gap/2XS }
  sm:
    - { kind: size, label: Logo size, px: 32, token: 🧩 Component/Spinner/Logo/Size/SM }
    - { kind: size, label: Circle size, px: 16, token: 🧩 Component/Spinner/Circle/Size/SM }
    - { kind: size, label: Circle thickness, px: 2, token: 🧩 Component/Spinner/Circle/Thickness/SM }
    - { kind: spacing, label: Gap (label right), px: 8, token: 🔗 Alias/↔️ Space/Gap/XS }
    - { kind: spacing, label: Gap (label bottom), px: 4, token: 🔗 Alias/↔️ Space/Gap/2XS }
```

## Notes

- The logo glyph renders at ~86.3% of its container (`logo-size`), measured per `conventions/tokens-and-props.md`; Phase 3 must account for this rather than assuming 100%.
- Circle radius is a full circle (50%) and is left out of `specs:`.
- Label position/gap only applies when `label` is set; `labelPosition` is irrelevant without a label (Phase 2 must handle this to avoid redundant variants).
- No `device:` section: the SCSS has no breakpoint mixins.
- Completeness checklist: every node (inner logo, inner circle, label text, gap) has all attributes bound or explicitly accepted; no unresolved gaps.

## Phase 2 — Proposed grouping

**Mapping applied** (PHASE-2-PROPOSE.md step 1):

| Prop                                        | Mapping                                                                    | Why                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `variation` (logo/circle)                   | **Top-level split**                                                        | Different layers: logo = vector glyph, circle = ring (ellipse + progress arc stroke).                     |
| `inverted`                                  | **Top-level split**                                                        | Same treatment as any true inverted axis; `Primary` + `Inverted` sets shown stacked in the one doc frame. |
| `size` (sm/base)                            | Variant property, columns                                                  | Same layers, different tokens.                                                                            |
| `labelPosition` (right/bottom)              | Variant property, rows                                                     | Independent axis (only visible when label shown).                                                         |
| `label`                                     | Text override, placeholder `Label` on every member                         | Free text.                                                                                                |
| `label` guard (`hasValue(label) && <span>`) | Boolean `Show label` bound to the label layer's `visible`, default `false` | Code default is `''` → hidden.                                                                            |
| `deactivated`                               | Excluded                                                                   | No static visual effect.                                                                                  |

**Top-level components / sets** (each its own labeled `COMPONENT_SET`):

1. `Spinner/Logo` (Primary) — 4 variants
2. `Spinner/Logo` (Inverted) — 4 variants
3. `Spinner/Circle` (Primary) — 4 variants
4. `Spinner/Circle` (Inverted) — 4 variants

**Case:** 2 axes (normal case) per set. Grid sketch (identical for all four sets):

```
               sm       base
right        [cell]   [cell]
bottom       [cell]   [cell]
```

Axis order checked: `size` = sm · base (scale); `labelPosition` = right · bottom (source order).

**Variant count:** 4 sets × (2 size × 2 labelPosition) = **16** (≤ 500 ✔). No mitigation needed.

**Open question:** `variation` as top-level split (above) vs. a `variation` variant property (would give
2 sets × 8 = 16 variants, same count, but mixes different layer structures in one set). Proposed: split.

## Phase 3 — Build notes

- 4 component sets × 4 variants (`labelPosition` × `size`), each with set-level properties `Show label` (boolean, default false) and `Label` (text, "Label"). Variants are named `labelPosition=<…>, size=<…>`.
- Logo glyph: hand-traced polygon of the Helvetia mark (from a fully formed Lottie frame), 86.3% of the `inner` container, corner radius scaled with glyph size. Fill bound to `Spinner/Logo/{Primary|Inverted}/Color`.
- Circle: `ring` ellipse (stroke bound to circle background token, stroke weight bound to thickness) plus `progress` arc ellipse (top 90°, fill bound to progress token). The arc's `innerRadius` ratio is calculated from size/thickness — the Plugin API cannot bind it, so it is a derived literal.
- Label line-height: resolved 150% applied as an unbound literal (percent-semantic token cannot be bound via the Plugin API).
- Label weight variable is a STRING → bound to `fontStyle`, not `fontWeight`.
- Circle inverted background (`Alias/Surface/White`) and progress (`Alias/Text/Color/InvertedPrimary`) resolve to the same white, so the arc is not visible against the ring there. This follows the tokens; flag for design review.
- With `Show label` defaulting to `false`, the `right` and `bottom` rows of each set look identical (no label shown). Set instance property to `true` to see the difference.
