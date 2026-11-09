# button → Figma mapping

> **Status: Phases 3–6 done (04.11.2026); Phase 7 review reported; spinner size fixed, `padding-block` finding open (see below). `brandIcon` deferred — `ds-brand-icon` has no Figma mapping yet; see Notes.**

```yaml
figmaComponentKey: null # two top-level sets, see figmaSets below
figmaPage: Core / Actions # page node 3022:2
figmaMasterNodeId: null # see figmaSets
figmaDocFrameNodeId: '3044:458' # "Button Documentation"

anatomy:
  - letter: A
    part: native
    description: 'The native `<button>` or `<a>` element.'
  - letter: B
    part: spinner
    description: 'The loading spinner shown when `loading` is true.'
  - letter: C
    part: icon
    description: 'The leading icon wrapper (or the brand icon wrapper when `brandIcon` is set).'
    note: 'Drawn as a ds-icon instance only — the brand-icon form is deferred.'
  - letter: D
    part: label
    description: 'The text label wrapper (`<span>`).'
  - letter: E
    part: icon-right
    description: 'The trailing icon wrapper.'

props:
  # crossed variant properties (Phase 2, approved 04.11.2026)
  - name: color
    type: enum
    options:
      [
        primary,
        secondary,
        tertiary,
        ghost,
        brand-purple,
        brand-red,
        brand-yellow,
        brand-green,
        info,
        success,
        warning,
        danger,
        link,
      ]
    default: primary
    figmaProperty: color
    figmaPropertyType: variant
    figmaOptions: [
        primary,
        secondary,
        tertiary,
        ghost,
        brand-purple,
        brand-red,
        brand-yellow,
        brand-green,
        info,
        success,
        warning,
        danger,
        link,
      ] # source order
    figmaOptionsInverted: [primary, secondary, tertiary, ghost, link] # Button/Inverted only — see figmaSets
  - name: size
    type: enum
    options: [sm, lg]
    default: '(unset — implicit `base`)'
    figmaProperty: size
    figmaPropertyType: variant
    figmaOptions: [sm, base, lg]
  - name: inverted
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: top-level split (Button/Primary / Button/Inverted)
  - {
      name: disabled,
      type: boolean,
      default: false,
      figmaProperty: state,
      figmaPropertyType: 'variant (state=disabled)',
    }
  - name: loading
    type: boolean
    default: false
    figmaProperty: state
    figmaPropertyType: 'variant (state=loading)'
    note: 'Disabled colors plus a visible ds-spinner (size sm); icons hidden.'
  # non-variant component properties (no variant cost)
  - name: label
    type: slot
    figmaProperty: Label
    figmaPropertyType: instance-text-override
    placeholder: Button
  - name: icon
    type: string
    default: "''"
    figmaProperty: 'Show icon (BOOLEAN, default false) + Icon (INSTANCE_SWAP)'
    figmaPropertyType: boolean + instance-swap
    note: 'render() guards on hasValue(icon), so the paired Show boolean is required.'
  - name: iconRight
    type: string
    default: "''"
    figmaProperty: 'Show icon right (BOOLEAN, default false) + Icon right (INSTANCE_SWAP)'
    figmaPropertyType: boolean + instance-swap
  # instance-level overrides — 500-variant mitigation, approved 04.11.2026
  - name: square
    type: boolean
    default: false
    figmaPropertyType: instance override (mitigation)
    howTo: 'Show label off, Show icon on; padding-x and gap → Global/Dimension/Space/0; min width/height → Space/48 (sm: Space/32); icon → size=md (sm: size=sm).'
  - name: flat
    type: boolean
    default: false
    figmaPropertyType: instance override (mitigation)
    howTo: 'padding-x → Global/Dimension/Space/0; min height → 28px (hardcoded, no token).'
  - name: shadow
    type: boolean
    default: false
    figmaPropertyType: instance override (mitigation)
    howTo: 'Apply the Alias/Shadow/Box/Base effect (ghost and link: Alias/Shadow/Text instead).'
  - name: iconTurn
    type: boolean
    default: false
    figmaPropertyType: instance override
    howTo: 'Rotate the nested icon instance 180°.'
  # deferred
  - { name: brandIcon, type: string, default: "''", figmaPropertyType: DEFERRED (no ds-brand-icon Figma mapping) }
  - { name: brandSize, type: enum, options: [sm, lg], figmaPropertyType: DEFERRED (with brandIcon) }
  # excluded — no static visual difference in a Figma frame (approved 04.11.2026)
  - {
      name: outlined,
      type: boolean,
      default: false,
      figmaPropertyType: EXCLUDED,
      note: 'No styles in button.style.scss.',
    }
  - { name: elementType, type: enum, options: [button, reset, submit], default: button, figmaPropertyType: EXCLUDED }
  - { name: href, type: string, figmaPropertyType: EXCLUDED }
  - { name: target, type: enum, options: [_blank, _parent, _self, _top], default: _self, figmaPropertyType: EXCLUDED }
  - { name: rel, type: string, figmaPropertyType: EXCLUDED }
  - { name: download, type: string, figmaPropertyType: EXCLUDED }
  - { name: name, type: string, figmaPropertyType: EXCLUDED }
  - { name: value, type: string, figmaPropertyType: EXCLUDED }
  - { name: noWrap, type: boolean, default: false, figmaPropertyType: EXCLUDED }
  - {
      name: wide,
      type: boolean,
      default: false,
      figmaPropertyType: EXCLUDED,
      note: 'Width is set on the instance (fill container).',
    }
  - { name: a11yControls / a11yTitle / a11yLabel / a11yHaspopup, type: string, figmaPropertyType: EXCLUDED }

states:
  figmaProperty: state
  options: [default, hover, focus, active, disabled, loading]
  sources:
    hover: ':hover / .is-hovered (button.style.scss) → *-hover-* tokens'
    focus: ':focus-visible / .is-focused → focus ring (--ds-alias-interaction-focus-color-base; inverted set: -inverted)'
    active: ':active / .is-pressed → *-active-* tokens (+ translate 0 0.5px, not represented)'
    disabled: 'disabled prop / [disabled] → --ds-button-color-disabled-base-*'
    loading: 'loading prop → disabled colors + ds-spinner (sm)'

figmaSets:
  # Phase 2 grouping, approved 04.11.2026. Total 324 variants (≤500).
  button:
    {
      name: Button/Primary,
      axes: 'color 13 × size 3 × state 6',
      variants: 234,
      nodeId: '3048:2541',
      key: 'c2100dbfe5316a49d985bb57ff23d93595bbc1b3',
    }
  buttonInverted:
    name: Button/Inverted
    axes: 'color 5 × size 3 × state 6'
    variants: 90
    nodeId: '3049:1550'
    key: 'f9ac1db7260726a3b69ba26216fc88fde552dd48'
    note: 'In code, primary, brand-*, info, success, warning and danger all use the shared `inverted` tokens, so they look identical when inverted. The `primary` option stands for all of them; secondary/tertiary/ghost/link use their own inverted-* tokens.'

nested:
  - childTag: ds-icon
    childMappingFile: ../../media/icon/icon.figma.md
    figmaComponentKey: '2056:8249'
    usedFor: [icon, iconRight]
    sizing: 'icon size follows button size (sm / base / lg); iconRight is always sm; square (non-sm) forces 1.5rem → Icon size=md'
  - childTag: ds-spinner
    childMappingFile: ../../indicators/spinner/spinner.figma.md
    figmaComponentKey: null # four top-level sets, see spinner.figma.md figmaSets
    usedFor: [loading]
    sizing: 'size=sm; logo size overridden to 1.5rem (--spinner-logo-size)'
  - childTag: ds-brand-icon
    childMappingFile: null
    figmaComponentKey: null
    usedFor: [brandIcon]
    status: DEFERRED — run /ds-code-to-figma brand-icon first

# no device: section — the only breakpoint-driven value is the brand-icon padding, which is deferred

tokens:
  # size tiers (sm / base / lg)
  - {
      cssVar: --ds-button-size-base-font-family,
      figmaVariable: 🧩 Component/Button/Size/Base/FontFamily,
      figmaVariableId: 'VariableID:137:1261',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-base-font-size,
      figmaVariable: 🧩 Component/Button/Size/Base/FontSize,
      figmaVariableId: 'VariableID:137:1262',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-base-font-weight,
      figmaVariable: 🧩 Component/Button/Size/Base/FontWeight,
      figmaVariableId: 'VariableID:137:1259',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-base-gap,
      figmaVariable: 🧩 Component/Button/Size/Base/Gap,
      figmaVariableId: 'VariableID:137:1263',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-base-line-height,
      figmaVariable: 🧩 Component/Button/Size/Base/LineHeight,
      figmaVariableId: 'VariableID:2826:10051',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-base-min-height,
      figmaVariable: 🧩 Component/Button/Size/Base/MinHeight,
      figmaVariableId: 'VariableID:137:1264',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-base-min-width,
      figmaVariable: 🧩 Component/Button/Size/Base/MinWidth,
      figmaVariableId: 'VariableID:137:1265',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-base-padding-x,
      figmaVariable: 🧩 Component/Button/Size/Base/PaddingX,
      figmaVariableId: 'VariableID:137:1266',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-base-radius,
      figmaVariable: 🧩 Component/Button/Size/Base/Radius,
      figmaVariableId: 'VariableID:137:1260',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-font-family,
      figmaVariable: 🧩 Component/Button/Size/LG/FontFamily,
      figmaVariableId: 'VariableID:137:1279',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-font-size,
      figmaVariable: 🧩 Component/Button/Size/LG/FontSize,
      figmaVariableId: 'VariableID:137:1280',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-font-weight,
      figmaVariable: 🧩 Component/Button/Size/LG/FontWeight,
      figmaVariableId: 'VariableID:137:1277',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-gap,
      figmaVariable: 🧩 Component/Button/Size/LG/Gap,
      figmaVariableId: 'VariableID:137:1281',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-line-height,
      figmaVariable: 🧩 Component/Button/Size/LG/LineHeight,
      figmaVariableId: 'VariableID:2826:10053',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-min-height,
      figmaVariable: 🧩 Component/Button/Size/LG/MinHeight,
      figmaVariableId: 'VariableID:137:1282',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-min-width,
      figmaVariable: 🧩 Component/Button/Size/LG/MinWidth,
      figmaVariableId: 'VariableID:137:1283',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-padding-x,
      figmaVariable: 🧩 Component/Button/Size/LG/PaddingX,
      figmaVariableId: 'VariableID:137:1284',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-lg-radius,
      figmaVariable: 🧩 Component/Button/Size/LG/Radius,
      figmaVariableId: 'VariableID:137:1278',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-font-family,
      figmaVariable: 🧩 Component/Button/Size/SM/FontFamily,
      figmaVariableId: 'VariableID:137:1270',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-font-size,
      figmaVariable: 🧩 Component/Button/Size/SM/FontSize,
      figmaVariableId: 'VariableID:137:1271',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-font-weight,
      figmaVariable: 🧩 Component/Button/Size/SM/FontWeight,
      figmaVariableId: 'VariableID:137:1268',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-gap,
      figmaVariable: 🧩 Component/Button/Size/SM/Gap,
      figmaVariableId: 'VariableID:137:1272',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-line-height,
      figmaVariable: 🧩 Component/Button/Size/SM/LineHeight,
      figmaVariableId: 'VariableID:2826:10052',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-min-height,
      figmaVariable: 🧩 Component/Button/Size/SM/MinHeight,
      figmaVariableId: 'VariableID:137:1273',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-min-width,
      figmaVariable: 🧩 Component/Button/Size/SM/MinWidth,
      figmaVariableId: 'VariableID:137:1274',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-padding-x,
      figmaVariable: 🧩 Component/Button/Size/SM/PaddingX,
      figmaVariableId: 'VariableID:137:1275',
      resolved: true,
    }
  - {
      cssVar: --ds-button-size-sm-radius,
      figmaVariable: 🧩 Component/Button/Size/SM/Radius,
      figmaVariableId: 'VariableID:137:1269',
      resolved: true,
    }
  # color=primary (base / hover / active)
  - {
      cssVar: --ds-button-color-primary-active-background,
      figmaVariable: 🧩 Component/Button/Color/Primary/Active/Background,
      figmaVariableId: 'VariableID:137:987',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-primary-active-border,
      figmaVariable: 🧩 Component/Button/Color/Primary/Active/Border,
      figmaVariableId: { color: 'VariableID:137:984', width: 'VariableID:137:985', style: 'VariableID:137:986' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-primary-active-text,
      figmaVariable: 🧩 Component/Button/Color/Primary/Active/Text,
      figmaVariableId: 'VariableID:137:983',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-primary-base-background,
      figmaVariable: 🧩 Component/Button/Color/Primary/Base/Background,
      figmaVariableId: 'VariableID:137:977',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-primary-base-border,
      figmaVariable: 🧩 Component/Button/Color/Primary/Base/Border,
      figmaVariableId: { color: 'VariableID:137:974', width: 'VariableID:137:975', style: 'VariableID:137:976' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-primary-base-text,
      figmaVariable: 🧩 Component/Button/Color/Primary/Base/Text,
      figmaVariableId: 'VariableID:137:973',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-primary-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Primary/Hover/Background,
      figmaVariableId: 'VariableID:137:982',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-primary-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Primary/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:979', width: 'VariableID:137:980', style: 'VariableID:137:981' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-primary-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Primary/Hover/Text,
      figmaVariableId: 'VariableID:137:978',
      resolved: true,
    }
  # color=secondary (base / hover / active)
  - {
      cssVar: --ds-button-color-secondary-active-background,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Active/Background,
      figmaVariableId: 'VariableID:137:1002',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-secondary-active-border,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Active/Border,
      figmaVariableId: { color: 'VariableID:137:999', width: 'VariableID:137:1000', style: 'VariableID:137:1001' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-secondary-active-text,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Active/Text,
      figmaVariableId: 'VariableID:137:998',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-secondary-base-background,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Base/Background,
      figmaVariableId: 'VariableID:137:992',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-secondary-base-border,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Base/Border,
      figmaVariableId: { color: 'VariableID:137:988', width: 'VariableID:137:989', style: 'VariableID:137:990' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-secondary-base-text,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Base/Text,
      figmaVariableId: 'VariableID:137:991',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-secondary-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Hover/Background,
      figmaVariableId: 'VariableID:137:997',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-secondary-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:994', width: 'VariableID:137:995', style: 'VariableID:137:996' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-secondary-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Secondary/Hover/Text,
      figmaVariableId: 'VariableID:137:993',
      resolved: true,
    }
  # color=tertiary (base / hover / active)
  - {
      cssVar: --ds-button-color-tertiary-active-background,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Active/Background,
      figmaVariableId: 'VariableID:137:1014',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-tertiary-active-border,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1015', width: 'VariableID:137:1016', style: 'VariableID:137:1017' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-tertiary-active-text,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Active/Text,
      figmaVariableId: 'VariableID:137:1013',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-tertiary-base-background,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Base/Background,
      figmaVariableId: 'VariableID:137:1004',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-tertiary-base-border,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1005', width: 'VariableID:137:1006', style: 'VariableID:137:1007' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-tertiary-base-text,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Base/Text,
      figmaVariableId: 'VariableID:137:1003',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-tertiary-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Hover/Background,
      figmaVariableId: 'VariableID:137:1009',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-tertiary-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1010', width: 'VariableID:137:1011', style: 'VariableID:137:1012' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-tertiary-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Tertiary/Hover/Text,
      figmaVariableId: 'VariableID:137:1008',
      resolved: true,
    }
  # color=ghost (base / hover / active)
  - {
      cssVar: --ds-button-color-ghost-active-background,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Active/Background,
      figmaVariableId: 'VariableID:137:1029',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-ghost-active-border,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1030', width: 'VariableID:137:1031', style: 'VariableID:137:1032' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-ghost-active-text,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Active/Text,
      figmaVariableId: 'VariableID:137:1028',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-ghost-base-background,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Base/Background,
      figmaVariableId: 'VariableID:137:1019',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-ghost-base-border,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1020', width: 'VariableID:137:1021', style: 'VariableID:137:1022' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-ghost-base-text,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Base/Text,
      figmaVariableId: 'VariableID:137:1018',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-ghost-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Hover/Background,
      figmaVariableId: 'VariableID:137:1024',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-ghost-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1025', width: 'VariableID:137:1026', style: 'VariableID:137:1027' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-ghost-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Ghost/Hover/Text,
      figmaVariableId: 'VariableID:137:1023',
      resolved: true,
    }
  # color=brand-purple (base / hover / active)
  - {
      cssVar: --ds-button-color-brand-purple-active-background,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Active/Background,
      figmaVariableId: 'VariableID:137:1044',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-purple-active-border,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1045', width: 'VariableID:137:1046', style: 'VariableID:137:1047' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-purple-active-text,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Active/Text,
      figmaVariableId: 'VariableID:137:1043',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-purple-base-background,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Base/Background,
      figmaVariableId: 'VariableID:137:1034',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-purple-base-border,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1035', width: 'VariableID:137:1036', style: 'VariableID:137:1037' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-purple-base-text,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Base/Text,
      figmaVariableId: 'VariableID:137:1033',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-purple-hover-background,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Hover/Background,
      figmaVariableId: 'VariableID:137:1039',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-purple-hover-border,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1040', width: 'VariableID:137:1041', style: 'VariableID:137:1042' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-purple-hover-text,
      figmaVariable: 🧩 Component/Button/Color/BrandPurple/Hover/Text,
      figmaVariableId: 'VariableID:137:1038',
      resolved: true,
    }
  # color=brand-red (base / hover / active)
  - {
      cssVar: --ds-button-color-brand-red-active-background,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Active/Background,
      figmaVariableId: 'VariableID:137:1059',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-red-active-border,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1060', width: 'VariableID:137:1061', style: 'VariableID:137:1062' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-red-active-text,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Active/Text,
      figmaVariableId: 'VariableID:137:1058',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-red-base-background,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Base/Background,
      figmaVariableId: 'VariableID:137:1049',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-red-base-border,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1050', width: 'VariableID:137:1051', style: 'VariableID:137:1052' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-red-base-text,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Base/Text,
      figmaVariableId: 'VariableID:137:1048',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-red-hover-background,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Hover/Background,
      figmaVariableId: 'VariableID:137:1054',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-red-hover-border,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1055', width: 'VariableID:137:1056', style: 'VariableID:137:1057' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-red-hover-text,
      figmaVariable: 🧩 Component/Button/Color/BrandRed/Hover/Text,
      figmaVariableId: 'VariableID:137:1053',
      resolved: true,
    }
  # color=brand-yellow (base / hover / active)
  - {
      cssVar: --ds-button-color-brand-yellow-active-background,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Active/Background,
      figmaVariableId: 'VariableID:137:1074',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-yellow-active-border,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1075', width: 'VariableID:137:1076', style: 'VariableID:137:1077' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-yellow-active-text,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Active/Text,
      figmaVariableId: 'VariableID:137:1073',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-yellow-base-background,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Base/Background,
      figmaVariableId: 'VariableID:137:1064',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-yellow-base-border,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1065', width: 'VariableID:137:1066', style: 'VariableID:137:1067' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-yellow-base-text,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Base/Text,
      figmaVariableId: 'VariableID:137:1063',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-yellow-hover-background,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Hover/Background,
      figmaVariableId: 'VariableID:137:1069',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-yellow-hover-border,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1070', width: 'VariableID:137:1071', style: 'VariableID:137:1072' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-yellow-hover-text,
      figmaVariable: 🧩 Component/Button/Color/BrandYellow/Hover/Text,
      figmaVariableId: 'VariableID:137:1068',
      resolved: true,
    }
  # color=brand-green (base / hover / active)
  - {
      cssVar: --ds-button-color-brand-green-active-background,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Active/Background,
      figmaVariableId: 'VariableID:137:1089',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-green-active-border,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1090', width: 'VariableID:137:1091', style: 'VariableID:137:1092' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-green-active-text,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Active/Text,
      figmaVariableId: 'VariableID:137:1088',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-green-base-background,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Base/Background,
      figmaVariableId: 'VariableID:137:1079',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-green-base-border,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1080', width: 'VariableID:137:1081', style: 'VariableID:137:1082' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-green-base-text,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Base/Text,
      figmaVariableId: 'VariableID:137:1078',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-green-hover-background,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Hover/Background,
      figmaVariableId: 'VariableID:137:1084',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-green-hover-border,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1085', width: 'VariableID:137:1086', style: 'VariableID:137:1087' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-brand-green-hover-text,
      figmaVariable: 🧩 Component/Button/Color/BrandGreen/Hover/Text,
      figmaVariableId: 'VariableID:137:1083',
      resolved: true,
    }
  # color=info (base / hover / active)
  - {
      cssVar: --ds-button-color-info-active-background,
      figmaVariable: 🧩 Component/Button/Color/Info/Active/Background,
      figmaVariableId: 'VariableID:137:1107',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-info-active-border,
      figmaVariable: 🧩 Component/Button/Color/Info/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1104', width: 'VariableID:137:1105', style: 'VariableID:137:1106' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-info-active-text,
      figmaVariable: 🧩 Component/Button/Color/Info/Active/Text,
      figmaVariableId: 'VariableID:137:1103',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-info-base-background,
      figmaVariable: 🧩 Component/Button/Color/Info/Base/Background,
      figmaVariableId: 'VariableID:137:1097',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-info-base-border,
      figmaVariable: 🧩 Component/Button/Color/Info/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1094', width: 'VariableID:137:1095', style: 'VariableID:137:1096' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-info-base-text,
      figmaVariable: 🧩 Component/Button/Color/Info/Base/Text,
      figmaVariableId: 'VariableID:137:1093',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-info-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Info/Hover/Background,
      figmaVariableId: 'VariableID:137:1102',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-info-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Info/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1099', width: 'VariableID:137:1100', style: 'VariableID:137:1101' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-info-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Info/Hover/Text,
      figmaVariableId: 'VariableID:137:1098',
      resolved: true,
    }
  # color=success (base / hover / active)
  - {
      cssVar: --ds-button-color-success-active-background,
      figmaVariable: 🧩 Component/Button/Color/Success/Active/Background,
      figmaVariableId: 'VariableID:137:1122',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-success-active-border,
      figmaVariable: 🧩 Component/Button/Color/Success/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1119', width: 'VariableID:137:1120', style: 'VariableID:137:1121' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-success-active-text,
      figmaVariable: 🧩 Component/Button/Color/Success/Active/Text,
      figmaVariableId: 'VariableID:137:1118',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-success-base-background,
      figmaVariable: 🧩 Component/Button/Color/Success/Base/Background,
      figmaVariableId: 'VariableID:137:1112',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-success-base-border,
      figmaVariable: 🧩 Component/Button/Color/Success/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1109', width: 'VariableID:137:1110', style: 'VariableID:137:1111' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-success-base-text,
      figmaVariable: 🧩 Component/Button/Color/Success/Base/Text,
      figmaVariableId: 'VariableID:137:1108',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-success-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Success/Hover/Background,
      figmaVariableId: 'VariableID:137:1117',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-success-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Success/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1114', width: 'VariableID:137:1115', style: 'VariableID:137:1116' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-success-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Success/Hover/Text,
      figmaVariableId: 'VariableID:137:1113',
      resolved: true,
    }
  # color=warning (base / hover / active)
  - {
      cssVar: --ds-button-color-warning-active-background,
      figmaVariable: 🧩 Component/Button/Color/Warning/Active/Background,
      figmaVariableId: 'VariableID:137:1137',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-warning-active-border,
      figmaVariable: 🧩 Component/Button/Color/Warning/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1134', width: 'VariableID:137:1135', style: 'VariableID:137:1136' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-warning-active-text,
      figmaVariable: 🧩 Component/Button/Color/Warning/Active/Text,
      figmaVariableId: 'VariableID:137:1133',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-warning-base-background,
      figmaVariable: 🧩 Component/Button/Color/Warning/Base/Background,
      figmaVariableId: 'VariableID:137:1127',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-warning-base-border,
      figmaVariable: 🧩 Component/Button/Color/Warning/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1124', width: 'VariableID:137:1125', style: 'VariableID:137:1126' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-warning-base-text,
      figmaVariable: 🧩 Component/Button/Color/Warning/Base/Text,
      figmaVariableId: 'VariableID:137:1123',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-warning-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Warning/Hover/Background,
      figmaVariableId: 'VariableID:137:1132',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-warning-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Warning/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1129', width: 'VariableID:137:1130', style: 'VariableID:137:1131' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-warning-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Warning/Hover/Text,
      figmaVariableId: 'VariableID:137:1128',
      resolved: true,
    }
  # color=danger (base / hover / active)
  - {
      cssVar: --ds-button-color-danger-active-background,
      figmaVariable: 🧩 Component/Button/Color/Danger/Active/Background,
      figmaVariableId: 'VariableID:137:1152',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-danger-active-border,
      figmaVariable: 🧩 Component/Button/Color/Danger/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1149', width: 'VariableID:137:1150', style: 'VariableID:137:1151' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-danger-active-text,
      figmaVariable: 🧩 Component/Button/Color/Danger/Active/Text,
      figmaVariableId: 'VariableID:137:1148',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-danger-base-background,
      figmaVariable: 🧩 Component/Button/Color/Danger/Base/Background,
      figmaVariableId: 'VariableID:137:1142',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-danger-base-border,
      figmaVariable: 🧩 Component/Button/Color/Danger/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1139', width: 'VariableID:137:1140', style: 'VariableID:137:1141' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-danger-base-text,
      figmaVariable: 🧩 Component/Button/Color/Danger/Base/Text,
      figmaVariableId: 'VariableID:137:1138',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-danger-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Danger/Hover/Background,
      figmaVariableId: 'VariableID:137:1147',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-danger-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Danger/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1144', width: 'VariableID:137:1145', style: 'VariableID:137:1146' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-danger-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Danger/Hover/Text,
      figmaVariableId: 'VariableID:137:1143',
      resolved: true,
    }
  # color=link (base / hover / active)
  - {
      cssVar: --ds-button-color-link-active-background,
      figmaVariable: 🧩 Component/Button/Color/Link/Active/Background,
      figmaVariableId: 'VariableID:137:1174',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-link-active-border,
      figmaVariable: 🧩 Component/Button/Color/Link/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1175', width: 'VariableID:137:1176', style: 'VariableID:137:1177' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-link-active-text,
      figmaVariable: 🧩 Component/Button/Color/Link/Active/Text,
      figmaVariableId: 'VariableID:137:1173',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-link-base-background,
      figmaVariable: 🧩 Component/Button/Color/Link/Base/Background,
      figmaVariableId: 'VariableID:137:1179',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-link-base-border,
      figmaVariable: 🧩 Component/Button/Color/Link/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1180', width: 'VariableID:137:1181', style: 'VariableID:137:1182' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-link-base-text,
      figmaVariable: 🧩 Component/Button/Color/Link/Base/Text,
      figmaVariableId: 'VariableID:137:1178',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-link-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Link/Hover/Background,
      figmaVariableId: 'VariableID:137:1169',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-link-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Link/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1170', width: 'VariableID:137:1171', style: 'VariableID:137:1172' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-link-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Link/Hover/Text,
      figmaVariableId: 'VariableID:137:1168',
      resolved: true,
    }
  # color=inverted (base / hover / active)
  - {
      cssVar: --ds-button-color-inverted-active-background,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Active/Background,
      figmaVariableId: 'VariableID:137:1184',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-active-border,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1185', width: 'VariableID:137:1186', style: 'VariableID:137:1187' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-active-text,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Active/Text,
      figmaVariableId: 'VariableID:137:1183',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-base-background,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Base/Background,
      figmaVariableId: 'VariableID:137:1189',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-base-border,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1190', width: 'VariableID:137:1191', style: 'VariableID:137:1192' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-base-text,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Base/Text,
      figmaVariableId: 'VariableID:137:1188',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Hover/Background,
      figmaVariableId: 'VariableID:137:1194',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1195', width: 'VariableID:137:1196', style: 'VariableID:137:1197' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Inverted/Hover/Text,
      figmaVariableId: 'VariableID:137:1193',
      resolved: true,
    }
  # color=inverted-secondary (base / hover / active)
  - {
      cssVar: --ds-button-color-inverted-secondary-active-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Active/Background,
      figmaVariableId: 'VariableID:137:1209',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-secondary-active-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1210', width: 'VariableID:137:1211', style: 'VariableID:137:1212' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-secondary-active-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Active/Text,
      figmaVariableId: 'VariableID:137:1208',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-secondary-base-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Base/Background,
      figmaVariableId: 'VariableID:137:1199',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-secondary-base-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1200', width: 'VariableID:137:1201', style: 'VariableID:137:1202' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-secondary-base-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Base/Text,
      figmaVariableId: 'VariableID:137:1198',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-secondary-hover-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Hover/Background,
      figmaVariableId: 'VariableID:137:1204',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-secondary-hover-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1205', width: 'VariableID:137:1206', style: 'VariableID:137:1207' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-secondary-hover-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedSecondary/Hover/Text,
      figmaVariableId: 'VariableID:137:1203',
      resolved: true,
    }
  # color=inverted-tertiary (base / hover / active)
  - {
      cssVar: --ds-button-color-inverted-tertiary-active-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Active/Background,
      figmaVariableId: 'VariableID:137:1224',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-tertiary-active-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1225', width: 'VariableID:137:1226', style: 'VariableID:137:1227' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-tertiary-active-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Active/Text,
      figmaVariableId: 'VariableID:137:1223',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-tertiary-base-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Base/Background,
      figmaVariableId: 'VariableID:137:1214',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-tertiary-base-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1215', width: 'VariableID:137:1216', style: 'VariableID:137:1217' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-tertiary-base-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Base/Text,
      figmaVariableId: 'VariableID:137:1213',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-tertiary-hover-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Hover/Background,
      figmaVariableId: 'VariableID:137:1219',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-tertiary-hover-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1220', width: 'VariableID:137:1221', style: 'VariableID:137:1222' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-tertiary-hover-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedTertiary/Hover/Text,
      figmaVariableId: 'VariableID:137:1218',
      resolved: true,
    }
  # color=inverted-ghost (base / hover / active)
  - {
      cssVar: --ds-button-color-inverted-ghost-active-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Active/Background,
      figmaVariableId: 'VariableID:137:1239',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-ghost-active-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1240', width: 'VariableID:137:1241', style: 'VariableID:137:1242' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-ghost-active-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Active/Text,
      figmaVariableId: 'VariableID:137:1238',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-ghost-base-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Base/Background,
      figmaVariableId: 'VariableID:137:1229',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-ghost-base-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1230', width: 'VariableID:137:1231', style: 'VariableID:137:1232' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-ghost-base-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Base/Text,
      figmaVariableId: 'VariableID:137:1228',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-ghost-hover-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Hover/Background,
      figmaVariableId: 'VariableID:137:1234',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-ghost-hover-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1235', width: 'VariableID:137:1236', style: 'VariableID:137:1237' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-ghost-hover-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedGhost/Hover/Text,
      figmaVariableId: 'VariableID:137:1233',
      resolved: true,
    }
  # color=inverted-link (base / hover / active)
  - {
      cssVar: --ds-button-color-inverted-link-active-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Active/Background,
      figmaVariableId: 'VariableID:137:1254',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-link-active-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1255', width: 'VariableID:137:1256', style: 'VariableID:137:1257' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-link-active-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Active/Text,
      figmaVariableId: 'VariableID:137:1253',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-link-base-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Base/Background,
      figmaVariableId: 'VariableID:137:1244',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-link-base-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1245', width: 'VariableID:137:1246', style: 'VariableID:137:1247' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-link-base-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Base/Text,
      figmaVariableId: 'VariableID:137:1243',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-link-hover-background,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Hover/Background,
      figmaVariableId: 'VariableID:137:1249',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-link-hover-border,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1250', width: 'VariableID:137:1251', style: 'VariableID:137:1252' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-inverted-link-hover-text,
      figmaVariable: 🧩 Component/Button/Color/InvertedLink/Hover/Text,
      figmaVariableId: 'VariableID:137:1248',
      resolved: true,
    }
  # color=disabled (base / hover / active)
  - {
      cssVar: --ds-button-color-disabled-active-background,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Active/Background,
      figmaVariableId: 'VariableID:137:1164',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-disabled-active-border,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Active/Border,
      figmaVariableId: { color: 'VariableID:137:1165', width: 'VariableID:137:1166', style: 'VariableID:137:1167' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-disabled-active-text,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Active/Text,
      figmaVariableId: 'VariableID:137:1163',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-disabled-base-background,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Base/Background,
      figmaVariableId: 'VariableID:137:1154',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-disabled-base-border,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Base/Border,
      figmaVariableId: { color: 'VariableID:137:1155', width: 'VariableID:137:1156', style: 'VariableID:137:1157' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-disabled-base-text,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Base/Text,
      figmaVariableId: 'VariableID:137:1153',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-disabled-hover-background,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Hover/Background,
      figmaVariableId: 'VariableID:137:1159',
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-disabled-hover-border,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Hover/Border,
      figmaVariableId: { color: 'VariableID:137:1160', width: 'VariableID:137:1161', style: 'VariableID:137:1162' },
      resolved: true,
    }
  - {
      cssVar: --ds-button-color-disabled-hover-text,
      figmaVariable: 🧩 Component/Button/Color/Disabled/Hover/Text,
      figmaVariableId: 'VariableID:137:1158',
      resolved: true,
    }
  # focus ring
  - {
      cssVar: --ds-alias-interaction-focus-color-base,
      figmaVariable: 🔗 Alias/✨ Interaction/Focus/Color/Base,
      figmaVariableId: 'VariableID:137:247',
      resolved: true,
    }
  - {
      cssVar: --ds-alias-interaction-focus-color-inverted,
      figmaVariable: 🔗 Alias/✨ Interaction/Focus/Color/Inverted,
      figmaVariableId: 'VariableID:137:248',
      resolved: true,
    }
  # shadow prop
  - {
      cssVar: --ds-alias-shadow-box-base,
      figmaVariable: 🔗 Alias/🌓 Shadow/Box/Base,
      figmaVariableId:
        {
          offsetX: 'VariableID:137:325',
          offsetY: 'VariableID:137:326',
          blur: 'VariableID:137:327',
          spread: 'VariableID:137:328',
          color: 'VariableID:137:329',
        },
      resolved: true,
    }
  - {
      cssVar: --ds-alias-shadow-text,
      figmaVariable: 🔗 Alias/🌓 Shadow/Text,
      figmaVariableId:
        {
          offsetX: 'VariableID:137:310',
          offsetY: 'VariableID:137:311',
          blur: 'VariableID:137:312',
          spread: 'VariableID:137:313',
          color: 'VariableID:137:314',
        },
      resolved: true,
    }
  # disabled / loading spinner circle track
  - {
      cssVar: --ds-global-color-grey-4,
      figmaVariable: 🌐 Global/🌈 Color/Grey/4,
      figmaVariableId: 'VariableID:137:2733',
      resolved: true,
    }
  # link underline width
  - {
      cssVar: --ds-link-underline-width,
      figmaVariable: 🧩 Component/Link/UnderlineWidth,
      figmaVariableId: 'VariableID:137:2585',
      resolved: true,
    }
  # square + sm icon size
  - {
      cssVar: --ds-icon-size-sm,
      figmaVariable: 🧩 Component/Icon/Size/SM,
      figmaVariableId: 'VariableID:137:1456',
      resolved: true,
    }
  # hardcoded literals in button.style.scss — bindings approved by the user 04.11.2026
  - {
      cssVar: '(literal 1.75rem, flat min-height)',
      figmaVariable: null,
      figmaVariableId: null,
      resolved: false,
      resolution: 'Accepted one-off hardcoded 28px — no dimension token; Global/Font/Size/28 rejected as semantically wrong.',
    }
  - {
      cssVar: '(literal 0, flat/square padding-x, square gap)',
      figmaVariable: 🌐 Global/📏 Dimension/Space/0,
      figmaVariableId: 'VariableID:137:2653',
      resolved: true,
      note: 'Literal in SCSS; token bound, code drift is a follow-up.',
    }
  - {
      cssVar: '(literal 3rem, square min-width/height)',
      figmaVariable: 🌐 Global/📏 Dimension/Space/48,
      figmaVariableId: 'VariableID:137:2665',
      resolved: true,
      note: 'Same drift note. Equals Button/Size/Base/MinHeight (48px).',
    }
  - {
      cssVar: '(literal 2rem, square sm min-width/height)',
      figmaVariable: 🌐 Global/📏 Dimension/Space/32,
      figmaVariableId: 'VariableID:137:2663',
      resolved: true,
      note: 'Same drift note. Equals Button/Size/SM/MinHeight (32px).',
    }
  - {
      cssVar: '(literal 1.5rem, square icon size)',
      figmaVariable: 🧩 Component/Icon/Size/MD,
      figmaVariableId: 'VariableID:137:1458',
      resolved: true,
      note: 'Realised as the nested Icon instance size=md (24px).',
    }
  - {
      cssVar: '(literal 1.5rem, --spinner-logo-size)',
      figmaVariable: 🌐 Global/📏 Dimension/Space/24,
      figmaVariableId: 'VariableID:137:2662',
      resolved: true,
      note: 'Same drift note.',
    }
  - {
      cssVar: '(literal underline, color=link)',
      figmaVariable: 🌐 Global/🔤 Font/TextDecoration/Underline,
      figmaVariableId: 'VariableID:2826:10497',
      resolved: true,
      note: 'No alias token exists for underline.',
    }
  - {
      cssVar: '(literal 0.25rem, link underline offset)',
      figmaVariable: 🌐 Global/📏 Dimension/Space/4,
      figmaVariableId: 'VariableID:137:2656',
      resolved: true,
      note: 'Bind if the Plugin API allows it for text decoration offset; otherwise static 4px, noted in Phase 3.',
    }
  # label text attributes inherited, not set by the button itself
  - {
      cssVar: '(inherited letter-spacing)',
      figmaVariable: 🔗 Alias/🔤 Text/LetterSpacing/Text,
      figmaVariableId: 'VariableID:2826:9941',
      resolved: true,
      note: 'Inherited-context binding.',
    }
  - {
      cssVar: '(inherited text-decoration)',
      figmaVariable: 🔗 Alias/🔤 Text/TextDecoration/None,
      figmaVariableId: 'VariableID:2826:9943',
      resolved: true,
      note: 'Inherited-context binding; color=link uses Underline instead.',
    }

completenessChecklist:
  native (frame):
    fill: color × state background tokens
    stroke: color × state border tokens (color + width 2px + style)
    radius: Button/Size/<tier>/Radius
    minHeight / minWidth: Button/Size/<tier>/MinHeight, MinWidth (flat 28px hardcoded; square Space/48 or Space/32)
    paddingX: Button/Size/<tier>/PaddingX (flat/square Space/0)
    gap: Button/Size/<tier>/Gap (square Space/0)
    effects: focus ring (alias focus color base / inverted), shadow prop (Alias/Shadow/Box/Base, ghost/link → Alias/Shadow/Text)
  label (text):
    family / weight / size / lineHeight: Button/Size/<tier>/*
    color: color × state text tokens
    letterSpacing: Alias/Text/LetterSpacing/Text
    decoration: Alias/Text/TextDecoration/None (link → Global/Font/TextDecoration/Underline, offset Space/4)
  icon / icon-right: ds-icon instances, color bound to the state text token
  spinner: ds-spinner instance (sm), logo size Space/24, disabled colors from disabled-base-text + Global/Color/Grey/4
  gaps: none

measurements: # measurements triage confirmed 05.11.2026 (PHASE-1-ANALYZE.md step 6), re-triaged 05.11.2026; measured on the dev server
  drawnColor: secondary
  drawnColorReason: 'primary and every status color draw the border in the fill color, so the 2px border and the padding inside it cannot be seen — secondary is the first option where border ≠ fill; confirmed by the user 05.11.2026'
  drawnOption: base
  options: [base, sm, lg] # code default first, like the component set
  behavior:
    width: hug # `wide` prop: fill
    overflow: wrap # `no-wrap` prop: truncate
  rows:
    - property: Min height
      kind: size
      group: limit
      show: drawn
      instance: main
      source: button.style.scss:95
      values:
        base: { px: 48, token: 🧩 Component/Button/Size/Base/MinHeight }
        sm: { px: 32, token: 🧩 Component/Button/Size/SM/MinHeight }
        lg: { px: 56, token: 🧩 Component/Button/Size/LG/MinHeight }
    - property: Icon size (left)
      kind: size
      group: fixed
      show: drawn
      instance: main
      source: button.tsx:486 (ds-icon size follows the button size)
      reason: 'lg renders a 32px icon in a 56px button — documented as the code does it'
      values:
        base: { px: 16, token: 🧩 Component/Icon/Size/Base }
        sm: { px: 14, token: 🧩 Component/Icon/Size/SM }
        lg: { px: 32, token: 🧩 Component/Icon/Size/LG }
    - property: Icon size (right)
      kind: size
      group: fixed
      show: drawn
      instance: main
      source: button.tsx:502 (size="sm" in every size)
      values:
        base: { px: 14, token: 🧩 Component/Icon/Size/SM }
        sm: { px: 14, token: 🧩 Component/Icon/Size/SM }
        lg: { px: 14, token: 🧩 Component/Icon/Size/SM }
    - property: Padding X
      kind: spacing
      group: inner spacing
      show: drawn
      instance: main
      source: button.style.scss:97
      values:
        base: { px: 24, token: 🧩 Component/Button/Size/Base/PaddingX }
        sm: { px: 12, token: 🧩 Component/Button/Size/SM/PaddingX }
        lg: { px: 24, token: 🧩 Component/Button/Size/LG/PaddingX }
    - property: Gap
      kind: spacing
      group: inner spacing
      show: drawn
      instance: main
      source: button.style.scss:96
      values:
        base: { px: 8, token: 🧩 Component/Button/Size/Base/Gap }
        sm: { px: 8, token: 🧩 Component/Button/Size/SM/Gap }
        lg: { px: 8, token: 🧩 Component/Button/Size/LG/Gap }
    - property: Radius
      kind: shape
      group: fixed
      show: drawn
      instance: main
      source: button.style.scss:91
      values:
        base: { px: 4, token: 🧩 Component/Button/Size/Base/Radius }
        sm: { px: 4, token: 🧩 Component/Button/Size/SM/Radius }
        lg: { px: 4, token: 🧩 Component/Button/Size/LG/Radius }
    - property: Border width
      kind: shape
      group: fixed
      show: drawn
      instance: main
      reason: 'drawn on the secondary main instance — invisible on primary (border = fill)'
      source: button.style.scss:101
      values:
        base: { px: 2, token: 🧩 Component/Button/Color/Secondary/Base/Border/BorderWidth }
        sm: { px: 2, token: 🧩 Component/Button/Color/Secondary/Base/Border/BorderWidth }
        lg: { px: 2, token: 🧩 Component/Button/Color/Secondary/Base/Border/BorderWidth }
    - property: Focus ring
      kind: shape
      group: fixed
      show: drawn
      instance: focus
      reason: '2px white + 3px focus color; widths are literals, no token. Drawn on a focus-state instance'
      source: packages/styles/src/scss/mixins/general.mixin.scss:37 (focus-shadow)
      values:
        base: { px: '2 + 3', token: null }
    - property: Text (label)
      kind: type
      group: typography
      show: drawn
      instance: main
      source: button.style.scss:86
      values:
        base:
          {
            px: 16,
            token: 🧩 Component/Button/Size/Base/FontSize,
            weight: 700,
            lineHeight: 1.3,
            family: BaloiseCreateHeadline,
          }
        sm:
          {
            px: 14,
            token: 🧩 Component/Button/Size/SM/FontSize,
            weight: 700,
            lineHeight: 1.3,
            family: BaloiseCreateHeadline,
          }
        lg:
          {
            px: 18,
            token: 🧩 Component/Button/Size/LG/FontSize,
            weight: 700,
            lineHeight: 1.3,
            family: BaloiseCreateHeadline,
          }
    - property: Height
      kind: size
      group: derived
      show: skip
      reason: 'equals min height for single-line labels'
      values:
        base: { px: 48 }
        sm: { px: 32 }
        lg: { px: 56 }
    - property: Padding Y
      kind: spacing
      group: derived
      show: skip
      reason: 'browser default padding-block on <button>, not a token — open code finding (Phase 7)'
      values:
        base: { px: 1 }
    - property: Min width
      kind: size
      group: limit
      show: skip
      reason: 'never binds — border + padding alone are 52px (base) / 28px (sm), above the 48 / 32 min width; only an empty label would hit it'
      source: button.style.scss:94
      values:
        base: { px: 48, token: 🧩 Component/Button/Size/Base/MinWidth }
        sm: { px: 32, token: 🧩 Component/Button/Size/SM/MinWidth }
        lg: { px: 56, token: 🧩 Component/Button/Size/LG/MinWidth }
```

## Notes

- **brandIcon deferred (04.11.2026).** `ds-brand-icon` has no `brand-icon.figma.md` yet, so the
  `brandIcon` / `brandSize` props and the `has-brand-icon` layout (column direction, responsive
  padding `--ds-button-size-base-padding-x` ÷ 2 → full from tablet) are not built. Run
  `/ds-code-to-figma brand-icon`, then add them to the button component set; that will also add a
  `device:` section for the padding.
- `button.style.scss` styles a `text` color (and `inverted-text`), but `text` is not in
  `BUTTON_COLORS`, so it isn't a prop option and is left out.
- `outlined` is a public prop with no styles in `button.style.scss` — no visual effect today.
- Font family, weight and line-height are identical across sm / base / lg (BaloiseCreateHeadline,
  700, 1.3); only font size differs (14 / 16 / 18px).
- Code-side drift (follow-up, not fixed here): the square sizes, spinner logo size and flat
  min-height are rem literals in SCSS rather than tokens.

## Phase 2 — variant grouping (approved 04.11.2026)

Full cross of every visual prop was 3,744 variants (color 13 × size 3 × state 6 × inverted 2 ×
flat 2 × square 2 × shadow 2). Approved mitigation, 324 variants in total:

- `inverted` → top-level split into `Button/Primary` and `Button/Inverted`; the inverted set only has the
  5 colors that look different when inverted.
- `square`, `flat`, `shadow`, `iconTurn` → instance-level overrides (steps in `props:` → `howTo`).
- `color` stays a variant dropdown (same layers, different tokens), not a top-level split per
  color — chosen over the Phase 2 table's "button type" example, which conflicts with its own
  deciding test for this component.

Nested matrix (3 axes): `size` on columns, rows nested by ascending option count — `state` (6)
outermost, `color` (13) inside.

**`Button/Primary`** — 13 × 3 × 6 = 234

```
                          sm      base    lg
default   primary        [cell]  [cell]  [cell]
          secondary      [cell]  [cell]  [cell]
          tertiary       [cell]  [cell]  [cell]
          ghost          [cell]  [cell]  [cell]
          brand-purple   [cell]  [cell]  [cell]
          brand-red      [cell]  [cell]  [cell]
          brand-yellow   [cell]  [cell]  [cell]
          brand-green    [cell]  [cell]  [cell]
          info           [cell]  [cell]  [cell]
          success        [cell]  [cell]  [cell]
          warning        [cell]  [cell]  [cell]
          danger         [cell]  [cell]  [cell]
          link           [cell]  [cell]  [cell]
hover     primary        [cell]  [cell]  [cell]
          …              …       …       …
focus     …
active    …
disabled  …
loading   …
```

**`Button/Inverted`** — 5 × 3 × 6 = 90

```
                       sm      base    lg
default   primary     [cell]  [cell]  [cell]
          secondary   [cell]  [cell]  [cell]
          tertiary    [cell]  [cell]  [cell]
          ghost       [cell]  [cell]  [cell]
          link        [cell]  [cell]  [cell]
hover     …
focus     …
active    …
disabled  …
loading   …
```

Ordering checked: `size` sm · base · lg (scale), `state` default / hover / focus / active /
disabled / loading (rule 2), `color` in `BUTTON_COLORS` source order (rule 4).

## Phase 3 — build log

- 04.11.2026: `Button Documentation` frame (`3044:458`) cloned from the template into the existing
  `Core / Actions` page (`3022:2`), appended after `Close Documentation`; header filled
  (`status=review`, v0.0.6, 04.11.2026, three links).
- First variant `color=primary, size=base, state=default` (`3044:825`), confirmed by the user.
  - All frame values bound by variable id: padding-x, gap, min width/height, 4 corner radii, fill,
    stroke colour, 4 stroke weights (`…/Border/BorderWidth`). Stroke align `INSIDE` (CSS border is
    inside the border-box).
  - Label: fontFamily, fontStyle (`…/FontWeight` = "Bold"), fontSize, letterSpacing and fill bound.
    Exceptions (resolved, intentionally unbound — STRING variables the Plugin API can't bind):
    lineHeight `130%` from `…/Button/Size/Base/LineHeight` (`VariableID:2826:10051`) and
    textDecoration `NONE` from `Alias/Text/TextDecoration/None` (`VariableID:2826:9943`).
  - Nested: `spinner` = `Spinner/Logo/Primary` `labelPosition=right, size=sm` instance, width/height
    bound to `Space/24`, hidden (shown only in `state=loading`). `icon` = Icon `size=base` and
    `icon-right` = Icon `size=sm` instances, vector fill overridden to the button text token,
    hidden behind `Show icon` / `Show icon right` booleans.
  - Icon swap: binding a button-level `INSTANCE_SWAP` to the glyph nested inside the Icon
    instance failed (the glyph belongs to the Icon component, not the button). Instead both icon
    instances are **exposed nested instances**, so the Icon's own `Icon` swap (and size/color)
    shows in the button's properties panel. Replaces the planned `Icon` / `Icon right` swap
    properties.
- Fan-out (04.11.2026): `Button/Primary` (`3048:2541`, 234 variants) and `Button/Inverted`
  (`3049:1550`, 90 variants) built in the `Primary` / `Inverted` stacks, replacing the template
  sets. Fixed cell grid 183 × 88 (largest variant 151 × 56 + 16px each side), 3 columns (`size`),
  rows `state` (outer) × `color` (inner); row/column labels, brackets and dashed dividers cloned
  from the template prototypes. Frame approved by the user 04.11.2026.
  - `iconRight` stays `size=sm` in every size, as in `render()`; `icon` follows the button size
    (sm / base / lg).
  - `state=loading`: spinner shown, both icons hidden and unlinked from `Show icon` /
    `Show icon right` (code hides icons while loading); label kept; disabled colours.
  - Link underline: `UNDERLINE` literal, offset 4px (`Space/4`), thickness 2px from
    `--ds-link-underline-width` (`VariableID:137:2585`) — offset and thickness are not bindable
    text fields, so both are resolved literals. Disabled/loading link: no underline (as in code).
  - **Focus ring is a layer, not an effect.** Figma doesn't render spread drop shadows on frames
    whose fill is transparent (secondary, tertiary, ghost, link and most inverted colours), so
    the CSS `box-shadow` pair is drawn as a `focus-ring` frame (absolute, inset −5px, stroke
    `Alias/Interaction/Focus/Color/Base`, or `…/Inverted` in the inverted set) containing
    `focus-ring-inner` (inset −2px, stroke `Alias/Interaction/Focus/Color/Border`, weight bound to
    `Alias/Interaction/Focus/Size/Inner`). Derived literals: outer ring weight 3px (Outer 5 −
    Inner 2) and the ring radii (button radius + 5 / + 2). The mixin's literal `5px` / `2px`
    match `Focus/Size/Outer` / `Focus/Size/Inner` exactly.
  - Variable-bound paints are created with their resolved colour (a bound paint created with a
    placeholder colour rendered black until refreshed).
  - `Button/Inverted` variants were cloned from `Button/Primary` and lost the set-level `Label` /
    `Show icon` / `Show icon right` properties; they were re-added on the inverted set and re-wired.

## Phase 4–5 — document sections

- **Copy me** (`Section` 3044:462): one `Button/Primary` instance (`primary` / `base` / `default`, node 3051:482) with both `Show icon` toggles on, per the Phase 4 rule. Kept as is; see the skill TODO about using the plain default instead.
- **Anatomy** (`Section` 3044:463), approved deviation (04.11.2026): **two instances** instead of the template's one, because no single state shows all five parts (`loading` shows the spinner and hides both icons). Left: `primary` / `base` / `loading` (markers A and B; A sits on the container's top edge just left of B, so the markers read A–E left to right). Right: `primary` / `base` / `default` with both icons on (markers C, D, E). Markers sit above the instances in the layer order.
- **Measurements** (`Section` 3044:464), rebuilt 05.11.2026 (markers v3, v4: soft pills, padding pills `end`/`start`, gap pills on callouts; text box on the label, `Text (label)`, content-sized table columns): drawing on `secondary` (the border is invisible on primary) with two instances — main `base` with icons (markers 1–7, 9) and `Focus` (8 focus ring); pill labels; padding tints inside the border; sizes table rows 1–9, `base` first; min width skipped (never binds); behavior card with one wrapping long label (`Hug ↔ (wide: Fill) · Wraps (no-wrap: Truncates)`). The left icon at `lg` is 32px (ds-icon `size` follows the button size) — documented as the code does it. The focus ring (2px + 3px) has no token.

## Phase 7 — review (04.11.2026)

Checked against `button.visual.html` on the dev server: 18 `Button/Primary` and 5 `Button/Inverted`
combinations (colors, sizes, radius, padding, gap, min sizes, border, label color and typography,
link underline). Everything else matched exactly.

**Fixed 04.11.2026 — spinner size.** Figma drew the loading spinner at 32×32 (the nested `ds-spinner` `sm` size; the `Space/24` binding on the Hug wrapper had no effect), code draws it at 24px (`--spinner-logo-size: 1.5rem`). All 54 `loading` variants (both sets) now have the spinner instance rescaled to 24×24, logo 20.71 (the spinner's 86.3% glyph ratio). Known leftover: the nested `inner` frame still shows its own `Spinner/Logo/Size/SM` binding (32) in Inspect, because Figma ignores a variable override on that instance sublayer; the rendered size is 24. Anatomy markers re-aligned after the change.

| Property        | Variant / state               | Figma (expected) | Live (actual) | Issue                                                                                                         |
| --------------- | ----------------------------- | ---------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `padding-block` | every `<button>` (not `href`) | 0                | 1px           | Code: browser default `padding-block` on `<button>` isn't reset (only `padding-inline` is set); `<a>` gets 0. |

Uncovered (not statically rendered in `button.visual.html`): `hover`, `focus` and `active` (interaction
only, out of scope); `disabled` and `loading` beyond `primary`/`secondary` at `base`; every color at
`sm`/`lg`; the `Inverted` brand/status colors are rendered but have no Figma variants (by design, they
look the same as inverted `primary`).
