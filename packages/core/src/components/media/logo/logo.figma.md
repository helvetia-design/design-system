# logo → Figma mapping

```yaml
figmaComponentKey: null # filled in by Phase 3 on success
figmaPage: Core / Media
figmaMasterNodeId: null
figmaDocFrameNodeId: null

anatomy:
  - letter: A
    part: animated
    description: 'The animated logo container element.'
    # Only @part tag on this component. The brand SVGs (LogoHelvetia/LogoBaloise) render as plain
    # inline <svg>, not parted elements — not part of anatomy.

props:
  - name: brand
    type: enum
    options: [baloise, helvetia]
    figmaProperty: brand
    figmaPropertyType: variant
    figmaOptions: [helvetia, baloise] # Figma order/default per user decision: helvetia = primary,
    # listed/selected first. Code's own runtime default when unset is `baloise` (via global
    # config state `configBrand`) — recorded here, not changed in code.
  - name: color
    type: enum
    options: [primary, inverted]
    figmaProperty: color
    figmaPropertyType: variant
    figmaOptions: [primary, inverted] # default: primary
  - name: size
    type: enum
    options: [sm, base, lg]
    figmaProperty: size
    figmaPropertyType: variant
    figmaOptions: [sm, base, lg] # canonical t-shirt order; implicit default `base` sits in the scale
  - name: animated
    type: boolean
    figmaProperty: animated
    figmaPropertyType: variant
    figmaOptions: [false, true] # default: false. Animation itself (Lottie) is out of this skill's
    # v1 static-component scope — represented as a boolean state, not an actual animation.

# No `states:` section — logo.host.scss has no :hover/:focus/:active/:disabled selectors.
# No `nested:` section — brand SVGs are inline <svg>, not <ds-*> custom elements.

device:
  responsiveBindings:
    - cssVar: [--ds-logo-size-base-mobile, --ds-logo-size-base-desktop]
      routingVariable: 🧩 Component/Logo/Size/Base/Device
      modes:
        mobile: 🧩 Component/Logo/Size/Base/Mobile
        tablet: 🧩 Component/Logo/Size/Base/Mobile # no @include tablet override in code; falls
        # through to Mobile's value
        desktop: 🧩 Component/Logo/Size/Base/Desktop
      risk: 'Hand-created by this skill, not emitted by scripts/figma-sync — if the underlying
        per-breakpoint variables are ever renamed/removed, this alias goes stale with no automatic
        fix.'
    - cssVar: [--ds-logo-size-sm-mobile, --ds-logo-size-sm-desktop]
      routingVariable: 🧩 Component/Logo/Size/SM/Device
      modes:
        mobile: 🧩 Component/Logo/Size/SM/Mobile
        tablet: 🧩 Component/Logo/Size/SM/Mobile
        desktop: 🧩 Component/Logo/Size/SM/Desktop
      risk: 'Same as above.'
    - cssVar: [--ds-logo-size-lg-mobile, --ds-logo-size-lg-desktop]
      routingVariable: 🧩 Component/Logo/Size/LG/Device
      modes:
        mobile: 🧩 Component/Logo/Size/LG/Mobile
        tablet: 🧩 Component/Logo/Size/LG/Mobile
        desktop: 🧩 Component/Logo/Size/LG/Desktop
      risk: 'Same as above.'

tokens:
  - cssVar: --ds-logo-color-primary
    figmaVariable: 🧩 Component/Logo/Color/Primary
    figmaVariableId: VariableID:137:2624
    resolved: true
  - cssVar: --ds-logo-color-inverted
    figmaVariable: 🧩 Component/Logo/Color/Inverted
    figmaVariableId: VariableID:137:2625
    resolved: true
  - cssVar: [--ds-logo-size-base-mobile, --ds-logo-size-base-desktop]
    figmaVariable: 🧩 Component/Logo/Size/Base/Device
    figmaVariableId: null # routing/Device variable is hand-created by Phase 3, see device: above
    resolved: true
  - cssVar: [--ds-logo-size-sm-mobile, --ds-logo-size-sm-desktop]
    figmaVariable: 🧩 Component/Logo/Size/SM/Device
    figmaVariableId: null
    resolved: true
  - cssVar: [--ds-logo-size-lg-mobile, --ds-logo-size-lg-desktop]
    figmaVariable: 🧩 Component/Logo/Size/LG/Device
    figmaVariableId: null
    resolved: true

measurements:
  base:
    - kind: size
      label: Height
      px: 32 # Desktop-mode value (mobile/tablet: 24px), reference figure — see device: above
      token: 🧩 Component/Logo/Size/Base/Device
  sm:
    - kind: size
      label: Height
      px: 24 # constant across all three modes (mobile/tablet/desktop all 24px)
      token: 🧩 Component/Logo/Size/SM/Device
  lg:
    - kind: size
      label: Height
      px: 48 # Desktop-mode value (mobile/tablet: 32px), reference figure — see device: above
      token: 🧩 Component/Logo/Size/LG/Device
```

## Phase 2 — Proposed grouping

### Mapping decision per prop

| Prop       | Table row applied                                                                                                                       | Figma mapping                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `brand`    | Enum, options need **different layers/structure** (Helvetia and Baloise are entirely different vector artwork, different aspect ratios) | **Top-level split**: `Logo/Helvetia`, `Logo/Baloise` (separate component sets, swapped via Instance Swap) |
| `color`    | Enum, same layers, different token (fill)                                                                                               | Variant property `color`: `[primary, inverted]`                                                           |
| `size`     | Enum, same layers, different token                                                                                                      | Variant property `size`: `[sm, base, lg]`                                                                 |
| `animated` | Boolean with a static visual effect (adds the icon-mark box, 2-column layout, text-only wordmark)                                       | Variant property `animated`: `[false, true]`                                                              |

No `states:` axis (no pseudo-classes). No nested Instance Swap library (no open-ended content
prop). `brand` ordering within the top-level split is `Helvetia` first (primary), `Baloise`
second (secondary) — per explicit user decision in Phase 1, overriding code's own declaration/
runtime-default order.

### Grid sketch

3 crossed same-layer axes (`animated`, `color`, `size`) → nested matrix. `size` is the innermost
column axis. Remaining axes `animated` (2 options) and `color` (2 options) tie on count; tie
broken by declaration order in `logo.tsx` (`animated` declared before `color`) → `animated`
outermost, `color` nested inside it.

Identical matrix shape for **both** top-level splits (`Logo/Helvetia` and `Logo/Baloise`):

```
                     sm       base      lg
false   primary   [cell]    [cell]    [cell]
        inverted  [cell]    [cell]    [cell]
true    primary   [cell]    [cell]    [cell]
        inverted  [cell]    [cell]    [cell]
```

### Variant count

- Per top-level split: `animated` (2) × `color` (2) × `size` (3) = **12**
- Two top-level splits (`Helvetia`, `Baloise`): 12 × 2 = **24 total**
- **24 ≤ 500** → no mitigation needed.

## Notes

- **Brand axis ordering**: per explicit user decision, Figma lists/defaults to `helvetia` as the
  primary brand, `baloise` as secondary. This is a presentation decision only — the component's
  actual runtime default when `brand` is unset remains `baloise` (via the global `configBrand`
  state, defaulting to `'baloise'` in `logo.tsx`). Flag this drift if it ever causes confusion for
  someone comparing Figma to the live default.
- **Width is calculated, not a token**: each brand SVG's width is derived from height via a fixed
  aspect ratio in code (`(1084/204) * height` for Helvetia, `(158/32) * height` for Baloise) — this
  is calculated inner content, left out of `measurements:` per `PHASE-8-DOCUMENT-MEASUREMENTS.md`.
- **Animation (Lottie) is out of v1 scope**: `animated=true` is still represented as a boolean
  variant (per `logo.tsx`'s own prop), but the Figma component will show the animated container's
  static/idle visual, not a Lottie-driven animation.
- **SVG fill is token-bound at render, not hardcoded**: both `LogoHelvetia`/`LogoBaloise` set an
  inline `fill="#000D6E"` on their path, but `logo.host.scss`'s `svg { @include fillSvg(var(--_logo-color)); }`
  overrides it — the real rendered color comes from `--ds-logo-color-primary`/`-inverted`, already
  resolved above. No hardcoded-value gap.
- `measurements:` height px values are the real resolved token values, confirmed against
  `packages/tokens/tokens/Base.tokens.json` directly (sm: 24/24/24 mobile/tablet/desktop constant;
  base: 24/24/32; lg: 32/32/48) — not placeholders.
