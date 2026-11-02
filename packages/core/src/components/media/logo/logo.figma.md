# logo → Figma mapping

```yaml
figmaComponentKey: null # split into 4 top-level sets, see figmaComponentKeys — brand AND
# inverted are both structural, not variant properties (same pattern as ds-close/ds-spinner's
# Primary/Inverted split, crossed with ds-logo's own brand split)
figmaComponentKeys:
  baloise_primary: '2c80ffff2bb724f70043a89530d71fe06750f9cb' # Logo/Baloise/Primary, node 2597:11
  baloise_inverted: 'd31a8a76837f826a9ace1c62b3ffe3000850fc7a' # Logo/Baloise/Inverted, node 2597:21
  helvetia_primary: '5189209d86d2e590cd32cc774248ebd790c32d16' # Logo/Helvetia/Primary, node 2597:31
  helvetia_inverted: '76ab949e5e6036653a9656becfda8bc8545aaeb8' # Logo/Helvetia/Inverted, node 2597:41
figmaPage: Core / Media
figmaMasterNodeId: null # see figmaComponentKeys above — split into 4, same reason
figmaDocFrameNodeId: '2708:6' # "Logo Documentation" frame, appended into Core / Media's
# Documentation Frames row (node 2580:1395)
# Note: all 4 sets above were discovered already fully built (found on the "Toky" page, node
# 0:1) from a prior, incomplete run of this skill — verified correct in this session (3 size
# variants each, height bound to the correct 🧩 Component/Logo/Size/*/Device routing variable,
# fill bound to the correct Color/Primary or Color/Inverted variable, widths unbound/calculated
# per each brand's real aspect ratio). Reused as-is, not rebuilt. Moved (not cloned) out of the
# "Toky" page into this component's documentation frame's "🔒 Component Set" panel in Phase 4 —
# node ids above are unchanged by the move (Figma preserves node ids across reparenting).

# anatomy: omitted — logo.tsx's only @part (`animated`) exists purely to host the runtime Lottie
# animation (see logo.animation.ts). Per user direction, this skill never models the animated
# state at all (see `animated` prop below), so there is no static anatomy to enumerate.

props:
  - name: animated
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: excluded
    note: >
      Excluded from the Figma mapping entirely, per user direction and the baseline
      "boolean prop with no static visual effect" exclusion rule (ds-spinner's `deactivated`
      precedent). When true, code plays a Lottie animation inside the `animated` part and crops
      the brand SVG's viewBox to text-only — neither is representative as a static Figma node
      once the animation itself is out of scope, so the Figma component always models the
      non-animated (animated=false) rendering.

  - name: brand
    type: enum
    options: [baloise, helvetia] # LOGO_BRANDS
    default: "(unset — falls back to DsConfigState.brand, code default 'baloise')"
    figmaProperty: null
    figmaPropertyType: top-level-split
    figmaOptions: [helvetia, baloise] # Helvetia listed/ordered first — see note
    note: >
      Different layer structure per option (entirely different vector geometry/aspect ratio per
      brand — logo.icons.tsx's LogoHelvetia vs LogoBaloise), not a same-shape/different-token
      case, so per CONVENTIONS.md's baseline rule this is a top-level split
      (Logo/Helvetia, Logo/Baloise) rather than a crossed variant property — same treatment as
      the `inverted` axis. Per explicit user decision for this run, Helvetia is treated as the
      primary/lead brand in the Figma library (listed first, used as the representative
      thumbnail/default), even though code's own runtime default when `brand` is unset is
      'baloise' (via DsConfigState) — a Figma-side presentation choice, not a code change.

  - name: color
    type: enum
    options: [primary, inverted] # LOGO_COLORS
    default: primary
    figmaProperty: null
    figmaPropertyType: top-level-split
    figmaOptions: [primary, inverted]
    note: >
      Corrected from an initial Phase 2 draft that modeled this as a crossed `color` variant
      property. CONVENTIONS.md's standing rule (confirmed in PHASE-4-DOCUMENT.md's "Handling an
      `inverted` axis" section) is that `inverted`/dark-context always gets its own top-level
      component set — `<Component>/Primary` and `<Component>/Inverted` — never a crossed variant
      property on a shared set, regardless of whether it would otherwise pass the
      same-layers/different-token test. Combined with `brand`'s own top-level split, this yields
      4 top-level sets total (not 2): `Logo/Baloise/Primary`, `Logo/Baloise/Inverted`,
      `Logo/Helvetia/Primary`, `Logo/Helvetia/Inverted` — all shown stacked inside the one
      documentation frame's "🔒 Component Set" panel per that same section.

  - name: size
    type: enum
    options: [lg, sm] # LOGO_SIZES — 'base' is the unset default, not a literal option
    default: '(unset — falls back to Component/Logo/Size/Base)'
    figmaProperty: size
    figmaPropertyType: variant
    figmaOptions: [base, sm, lg]
    note: 'Size axes are never eligible for variable-swap mitigation — always a crossed variant.'

device: # one entry per size option — each has its own routing variable since the real tokens
  # differ per size, not just by breakpoint. All three routing variables already exist in
  # "Design Responsive Tokens" (VariableID:2566:2/3/4) — reused as-is, not recreated; verified in
  # Phase 3 that every mode still resolves to the exact ids below.
  base:
    cssVar: [--ds-logo-size-base-mobile, --ds-logo-size-base-tablet, --ds-logo-size-base-desktop]
    routingVariable: 🧩 Component/Logo/Size/Base/Device # VariableID:2566:2
    modes:
      mobile: 🧩 Component/Logo/Size/Base/Mobile # VariableID:137:2626
      tablet:
        🧩 Component/Logo/Size/Base/Tablet # VariableID:137:2627 — a real, distinct tablet
        # token (not an alias to Mobile); its resolved px value happens to equal Mobile's (24px)
        # since logo.host.scss has no @include tablet override
      desktop: 🧩 Component/Logo/Size/Base/Desktop # VariableID:137:2628
    risk: 'Hand-created by this skill (not emitted by scripts/figma-sync) — already existed from
      a prior session, reused rather than recreated. See SKILL.md schema note.'
  sm:
    cssVar: [--ds-logo-size-sm-mobile, --ds-logo-size-sm-tablet, --ds-logo-size-sm-desktop]
    routingVariable: 🧩 Component/Logo/Size/SM/Device # VariableID:2566:3
    modes:
      mobile: 🧩 Component/Logo/Size/SM/Mobile # VariableID:137:2629
      tablet: 🧩 Component/Logo/Size/SM/Tablet # VariableID:137:2630
      desktop: 🧩 Component/Logo/Size/SM/Desktop # VariableID:137:2631
    risk: 'Hand-created by this skill (not emitted by scripts/figma-sync) — already existed from
      a prior session, reused rather than recreated. See SKILL.md schema note.'
  lg:
    cssVar: [--ds-logo-size-lg-mobile, --ds-logo-size-lg-tablet, --ds-logo-size-lg-desktop]
    routingVariable: 🧩 Component/Logo/Size/LG/Device # VariableID:2566:4
    modes:
      mobile: 🧩 Component/Logo/Size/LG/Mobile # VariableID:137:2632
      tablet: 🧩 Component/Logo/Size/LG/Tablet # VariableID:137:2633
      desktop: 🧩 Component/Logo/Size/LG/Desktop # VariableID:137:2634
    risk: 'Hand-created by this skill, not emitted by scripts/figma-sync — see SKILL.md schema note.'

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
    figmaVariable: 🧩 Component/Logo/Size/Base/Device # see device.base above
    figmaVariableId:
      null # routing variable is hand-created by Phase 3, not resolved by
      # css-token-lookup.mjs
    resolved: true
  - cssVar: [--ds-logo-size-sm-mobile, --ds-logo-size-sm-desktop]
    figmaVariable: 🧩 Component/Logo/Size/SM/Device # see device.sm above
    figmaVariableId: null
    resolved: true
  - cssVar: [--ds-logo-size-lg-mobile, --ds-logo-size-lg-desktop]
    figmaVariable: 🧩 Component/Logo/Size/LG/Device # see device.lg above
    figmaVariableId: null
    resolved: true

specs: # one entry per option of the `size` Variants axis — color has no dimensional effect, so
  # it isn't a specs axis (it only rebinds the fill token)
  base:
    - kind: size
      label: Height
      px: 32 # Desktop-mode reference value — see device.base above for the full breakdown
      token: 🧩 Component/Logo/Size/Base/Device
  sm:
    - kind: size
      label: Height
      px: 24
      token: 🧩 Component/Logo/Size/SM/Device
  lg:
    - kind: size
      label: Height
      px: 48
      token: 🧩 Component/Logo/Size/LG/Device
```

## Notes

- **No pseudo-class states.** `logo.host.scss` has no `:hover`/`:focus`/`:active`/`:disabled`
  selectors — this is a static media component, not interactive. No `state` property.
- **No nested DS components.** `render()` only uses the internal, non-registered
  `LogoHelvetia`/`LogoBaloise` functional helpers from `logo.icons.tsx` — not actual `ds-*`
  custom elements, so there's no child `.figma.md` to look up.
- **No text-bearing parts.** The whole visible surface is one filled vector path per brand; no
  Figma text node attributes to resolve.
- **Hardcoded SVG fill (`#000D6E`) is not a gap.** `logo.icons.tsx`'s inline path `fill` is always
  overridden at runtime by `logo.host.scss`'s `@include fillSvg(var(--_logo-color))` (confirmed
  in `packages/styles/src/scss/mixins/svg.mixin.scss`), which resolves to
  `--ds-logo-color-primary`/`--ds-logo-color-inverted` — both already resolved above. The literal
  hex never reaches the DOM unless the SCSS fails to load, so it isn't modeled as a one-off
  hardcode case in Figma.
- **Completeness checklist:** 4 top-level splits (Baloise/Primary, Baloise/Inverted,
  Helvetia/Primary, Helvetia/Inverted) × 3 `size` options = 1 filled vector node per combination,
  12 variant combinations total — well under the 500-variant threshold, no mitigation needed. Each combination
  needs exactly one attribute resolved (vector fill color) plus one device-routed dimension
  (height; width is calculated from height via each brand's fixed aspect ratio —
  `1084/204` for Helvetia, `158/32` for Baloise — and is left out of `specs:` per
  `PHASE-4-DOCUMENT.md`'s "leave out calculated inner content sizes" rule).
- **Brand ordering is a Figma-only presentation decision for this run**, per the user's explicit
  "Helvetia is the primary brand, not Baloise" instruction — it does not change
  `logo.tsx`'s/`DsConfigState`'s actual code-level default of `'baloise'`.

## Phase 2 — confirmed grouping

**Case: top-level-split, two axes crossed structurally, not as variants.** `brand` is structural
(different vector geometry/aspect ratio per option) and `color`/`inverted` is _always_ a
top-level split under this repo's standing `inverted` rule (CONVENTIONS.md /
PHASE-4-DOCUMENT.md's "Handling an `inverted` axis" section), never a crossed variant property —
corrected from this file's original Phase 2 draft, which had modeled `color` as a crossed
variant. The two structural axes combine into **4 top-level component sets**:
`Logo/Baloise/Primary`, `Logo/Baloise/Inverted`, `Logo/Helvetia/Primary`,
`Logo/Helvetia/Inverted`. Each set crosses exactly one remaining same-layer axis, `size`
(base/sm/lg), as a single-row grid:

```
Logo/Baloise/Primary          Logo/Baloise/Inverted
  base   sm   lg                base   sm   lg
 [cell][cell][cell]             [cell][cell][cell]

Logo/Helvetia/Primary         Logo/Helvetia/Inverted
  base   sm   lg                base   sm   lg
 [cell][cell][cell]             [cell][cell][cell]
```

All 4 sets are shown stacked inside the **one** documentation frame's "🔒 Component Set" panel
(not 4 separate frames), per the standing one-frame rule — Helvetia's pair listed/shown first per
the user's "Helvetia is primary" direction.

**Variant count:** 4 top-level splits × 3 `size` options = **12 total** — well under the
500-variant hard-stop threshold, no mitigation needed (same total as the original draft's count,
just organized as 4 single-axis sets instead of 2 two-axis sets).

`animated` contributes no axis (excluded, see `props:` above) and there is no `state` property
(no pseudo-class states in `logo.host.scss`).

**Confirmed by the user ("yes continue").** All 4 sets were then discovered already built and
verified correct in Phase 3 (see `figmaComponentKeys` above) — no new component-set construction
was needed, only moving them into place in Phase 4.

## Phase 4 — documentation frame (built)

Built on `Core / Media` (node `2580:1390`), following the fixed template in
`PHASE-4-DOCUMENT.md`. No Anatomy section (anatomy omitted — see `props:` note above).

- **Header**: `component`="Logo", `kicker`="Core / Media", `lead` verbatim from `logo.tsx`'s
  JSDoc, `status=review`, version `v0.0.6` (`packages/core/package.json`), last updated
  30.10.2026. Toky (`?filter=logo`), GitHub, and Storybook
  (`https://helvetia-design.vercel.app/?path=/docs/components-media-logo-logo--logo`, from the
  user, added 2026-10-30) links all hyperlinked. The Storybook base URL/formula is now recorded in
  `PHASE-4-DOCUMENT.md`'s Header section for future components.
- **Copy me**: one `Logo/Helvetia/Primary` `size=base` instance (Helvetia as the lead brand).
- **Specs**: 3 nested cards (base/sm/lg), each a Helvetia/Primary instance + a `Spec/Dimension`
  height marker + one `Spec/Legend item` (kind=size, Label="Height", Token=the routing device
  variable name, Value=the desktop reference px).
- **Component Set**: single `Title` (kind=component-set) + 4 stacked labeled sets in order
  Helvetia · Primary, Helvetia · Inverted, Baloise · Primary, Baloise · Inverted — each with
  Column Labels only (Base/SM/LG, no Row Labels, single axis) and 2 simple filled divider bars
  (not the dashed-stroke recipe from `conventions/build-mechanics.md`, which rendered invisible
  on a near-zero-width rectangle in this session — see Notes below). The two `Inverted` sets sit
  on a 16px-padded dark `Alias/Surface/Primary` background (`VariableID:137:419`) so their white
  fill is visible, per the stacked-`inverted`-panel convention.

Frame appended into `Core / Media`'s `Documentation Frames` row (node `2580:1395`) as its first
(only) child.

**New gotcha found this run (worth folding into `conventions/build-mechanics.md`):** the
documented dashed-divider recipe (`RECTANGLE`, `fills: []`, near-zero width `0.01`, only
`strokeLeftWeight` set, `strokeAlign: 'INSIDE'`) rendered **invisible** here, unlike its claimed
prior success on `ds-spinner`. Worked around with a simple 2px-wide filled rectangle (solid
purple, 60% opacity, no dash) instead — visually equivalent for a single-row grid, just not
dashed. Not yet proposed as a `CONVENTIONS.md` addition — flagging here for the user to decide
whether to investigate the root cause or accept the simpler fallback as the new standard.
