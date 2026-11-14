# badge → Figma mapping

```yaml
sets: # filled in by Phase 3 — one entry per component set, default set first.
  - name: Badge
    figmaComponentKey: 'e3f8c043ca9721e18ebe9abd7bb9c50d6f100246'
    figmaMasterNodeId: '4543:370'
figmaPage: Core / Indicators # shared category page

figmaDocFrameNodeId: '4541:1319' # "Badge Documentation" frame on Core / Indicators

anatomy:
  - letter: A
    part: badge
    description: 'The badge element itself.'
  - letter: B
    part: icon
    description: 'The icon element, if an icon is used.'

props:
  - name: size
    type: enum
    options: [sm, lg] # BADGE_SIZES; unset is the real code default
    default: '(unset — Component/Badge/Size/Base)'
    figmaProperty: size
    figmaPropertyType: variant
    figmaOptions: [base, sm, lg] # code default first, then smallest → largest
    note: >
      `sm` is a 12px dot: code hides the slot content and never renders the icon. Same layers, so
      a variant, with the label and icon layers hidden on the `sm` members.

  - name: color
    type: enum
    options: [disabled, info, danger, warning, success] # BADGE_COLORS; unset is the real code default
    default: '(unset — Component/Badge/Default/Color/*)'
    figmaProperty: color
    figmaPropertyType: variant
    figmaOptions: [default, disabled, info, danger, warning, success] # code default first, then code order

  - name: icon
    type: string
    default: "''"
    figmaProperty: 'show icon (BOOLEAN, default false) + icon (INSTANCE_SWAP)'
    figmaPropertyType: boolean + instance-swap
    note: 'render() guards on hasValue(icon) and size !== sm, so the paired show boolean is required. Placeholder glyph: check (visual test).'

  - name: position
    type: enum
    options: [card, button, tabs]
    figmaProperty: null
    figmaPropertyType: EXCLUDED (no static visual effect on the badge itself)
    note: 'Not styled in badge.host.scss; the placement comes from the parent components (--badge-position in card, button, tabs).'

  - name: pulse
    type: boolean
    default: false
    figmaProperty: null
    figmaPropertyType: EXCLUDED (no static visual effect — animation only)

slots:
  - name: default
    content: free text
    figmaProperty: 'label (TEXT) + show label (BOOLEAN, default true)'
    placeholder: '1' # visual test's first case
    note: 'show label models the icon-only badge: code has an empty slot there, and an empty Figma text would keep its gap and width.'

states: [] # no pseudo-classes in badge.host.scss

nested:
  - childTag: ds-icon
    childMappingFile: ../../media/icon/icon.figma.md
    figmaComponentKey: '2056:8249'
    usedFor: [icon]
    sizing: 'size from Component/Badge/Size/*/Icon (14 base, 18 lg), not rendered on sm; color from the badge text token'
    note: 'Nested as the glyph library component directly, no Icon wrapper: the Plugin API refuses a parent swap two levels down. Confirmed by the user 09.11.2026.'
    colorSource:
      # no states; one entry per color option (badge.style.scss: --icon-color = --ds-badge-<color>-color-text)
      default: 'Badge/<color>/Color/Text (--icon-color)'

tokens:
  # typography
  - {
      cssVar: --ds-badge-typo-font-family,
      figmaVariable: 🧩 Component/Badge/Typo/FontFamily,
      figmaVariableId: 'VariableID:137:968',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-typo-font-weight,
      figmaVariable: 🧩 Component/Badge/Typo/FontWeight,
      figmaVariableId: 'VariableID:137:969',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-typo-line-height,
      figmaVariable: 🧩 Component/Badge/Typo/LineHeight,
      figmaVariableId: 'VariableID:2826:10050',
      resolved: true,
    }
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
      note: 'Inherited-context binding.',
    }
  # size: base
  - {
      cssVar: --ds-badge-size-base-font,
      figmaVariable: 🧩 Component/Badge/Size/Base/Font,
      figmaVariableId: 'VariableID:137:961',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-base-height,
      figmaVariable: 🧩 Component/Badge/Size/Base/Height,
      figmaVariableId: 'VariableID:137:960',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-base-radius,
      figmaVariable: 🧩 Component/Badge/Size/Base/Radius,
      figmaVariableId: 'VariableID:137:956',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-base-icon,
      figmaVariable: 🧩 Component/Badge/Size/Base/Icon,
      figmaVariableId: 'VariableID:137:957',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-base-gap,
      figmaVariable: 🧩 Component/Badge/Size/Base/Gap,
      figmaVariableId: 'VariableID:137:958',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-base-padding,
      figmaVariable: 🧩 Component/Badge/Size/Base/Padding,
      figmaVariableId: 'VariableID:137:959',
      resolved: true,
    }
  # size: sm
  - {
      cssVar: --ds-badge-size-sm-font,
      figmaVariable: 🧩 Component/Badge/Size/SM/Font,
      figmaVariableId: 'VariableID:137:953',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-sm-height,
      figmaVariable: 🧩 Component/Badge/Size/SM/Height,
      figmaVariableId: 'VariableID:137:950',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-sm-radius,
      figmaVariable: 🧩 Component/Badge/Size/SM/Radius,
      figmaVariableId: 'VariableID:137:951',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-sm-icon,
      figmaVariable: 🧩 Component/Badge/Size/SM/Icon,
      figmaVariableId: 'VariableID:137:952',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-sm-gap,
      figmaVariable: 🧩 Component/Badge/Size/SM/Gap,
      figmaVariableId: 'VariableID:137:955',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-sm-padding,
      figmaVariable: 🧩 Component/Badge/Size/SM/Padding,
      figmaVariableId: 'VariableID:137:954',
      resolved: true,
    }
  # size: lg
  - {
      cssVar: --ds-badge-size-lg-font,
      figmaVariable: 🧩 Component/Badge/Size/LG/Font,
      figmaVariableId: 'VariableID:137:966',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-lg-height,
      figmaVariable: 🧩 Component/Badge/Size/LG/Height,
      figmaVariableId: 'VariableID:137:965',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-lg-radius,
      figmaVariable: 🧩 Component/Badge/Size/LG/Radius,
      figmaVariableId: 'VariableID:137:962',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-lg-icon,
      figmaVariable: 🧩 Component/Badge/Size/LG/Icon,
      figmaVariableId: 'VariableID:137:967',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-lg-gap,
      figmaVariable: 🧩 Component/Badge/Size/LG/Gap,
      figmaVariableId: 'VariableID:137:963',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-size-lg-padding,
      figmaVariable: 🧩 Component/Badge/Size/LG/Padding,
      figmaVariableId: 'VariableID:137:964',
      resolved: true,
    }
  # colors
  - {
      cssVar: --ds-badge-default-color-text,
      figmaVariable: 🧩 Component/Badge/Default/Color/Text,
      figmaVariableId: 'VariableID:137:940',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-default-color-background,
      figmaVariable: 🧩 Component/Badge/Default/Color/Background,
      figmaVariableId: 'VariableID:137:941',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-disabled-color-text,
      figmaVariable: 🧩 Component/Badge/Disabled/Color/Text,
      figmaVariableId: 'VariableID:137:948',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-disabled-color-background,
      figmaVariable: 🧩 Component/Badge/Disabled/Color/Background,
      figmaVariableId: 'VariableID:137:949',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-info-color-text,
      figmaVariable: 🧩 Component/Badge/Info/Color/Text,
      figmaVariableId: 'VariableID:137:971',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-info-color-background,
      figmaVariable: 🧩 Component/Badge/Info/Color/Background,
      figmaVariableId: 'VariableID:137:972',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-danger-color-text,
      figmaVariable: 🧩 Component/Badge/Danger/Color/Text,
      figmaVariableId: 'VariableID:137:946',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-danger-color-background,
      figmaVariable: 🧩 Component/Badge/Danger/Color/Background,
      figmaVariableId: 'VariableID:137:947',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-warning-color-text,
      figmaVariable: 🧩 Component/Badge/Warning/Color/Text,
      figmaVariableId: 'VariableID:137:944',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-warning-color-background,
      figmaVariable: 🧩 Component/Badge/Warning/Color/Background,
      figmaVariableId: 'VariableID:137:945',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-success-color-text,
      figmaVariable: 🧩 Component/Badge/Success/Color/Text,
      figmaVariableId: 'VariableID:137:942',
      resolved: true,
    }
  - {
      cssVar: --ds-badge-success-color-background,
      figmaVariable: 🧩 Component/Badge/Success/Color/Background,
      figmaVariableId: 'VariableID:137:943',
      resolved: true,
    }

measurements: # confirmed measurements triage (09.11.2026, measured on the dev server)
  drawnOption: base
  mainLabel: Urgent # the main drawing's text override: with the placeholder "1" the min width decides the width and padding can't be seen
  options: [base, sm, lg]
  behavior:
    width: hug
    overflow: overflow # white-space: nowrap, no truncation — flagged in the findings below
  rows:
    - property: Height
      kind: size
      group: fixed
      show: drawn
      instance: main
      source: badge.host.scss:70
      values:
        base: { px: 24, token: 🧩 Component/Badge/Size/Base/Height }
        sm: { px: 12, token: 🧩 Component/Badge/Size/SM/Height }
        lg: { px: 32, token: 🧩 Component/Badge/Size/LG/Height }
    - property: Min width
      kind: size
      group: limit
      show: drawn
      instance: min-content
      source: badge.host.scss:69
      values:
        base: { px: 24, token: 🧩 Component/Badge/Size/Base/Height }
        sm: { px: 12, token: 🧩 Component/Badge/Size/SM/Height }
        lg: { px: 32, token: 🧩 Component/Badge/Size/LG/Height }
    - property: Icon size
      kind: size
      group: fixed
      show: drawn
      instance: icon
      source: badge.host.scss:81
      values:
        base: { px: 14, token: 🧩 Component/Badge/Size/Base/Icon }
        lg: { px: 18, token: 🧩 Component/Badge/Size/LG/Icon }
    - property: Padding X
      kind: spacing
      group: inner spacing
      show: drawn
      instance: main
      source: badge.host.scss:77
      values:
        base: { px: 4, token: 🧩 Component/Badge/Size/Base/Padding }
        lg: { px: 4, token: 🧩 Component/Badge/Size/LG/Padding }
    - property: Text (label)
      kind: type
      group: typography
      show: drawn
      instance: main
      source: badge.host.scss:64
      values:
        base:
          {
            px: 14,
            token: 🧩 Component/Badge/Size/Base/Font,
            weight: 700,
            lineHeight: 1,
            family: BaloiseCreateHeadline,
          }
        lg:
          { px: 18, token: 🧩 Component/Badge/Size/LG/Font, weight: 700, lineHeight: 1, family: BaloiseCreateHeadline }
    - property: Gap
      kind: spacing
      group: inner spacing
      show: skip
      reason: 'only visible with an icon and text together, which the icon prop JSDoc rules out and the visual tests never show'
      values:
        base: { px: 4, token: 🧩 Component/Badge/Size/Base/Gap }
        sm: { px: 0, token: 🧩 Component/Badge/Size/SM/Gap }
        lg: { px: 4, token: 🧩 Component/Badge/Size/LG/Gap }
    - property: Padding Y
      kind: spacing
      group: inner spacing
      show: skip
      reason: 'height is fixed, so padding-block never binds — the real vertical offset is 5 / 7'
      values:
        base: { px: 4, token: 🧩 Component/Badge/Size/Base/Padding }
        lg: { px: 4, token: 🧩 Component/Badge/Size/LG/Padding }
    - property: Radius
      kind: shape
      group: fixed
      show: skip
      reason: 'pill (9999) — no radius on a circle or pill'
      values:
        base: { px: 9999, token: 🧩 Component/Badge/Size/Base/Radius }
    - property: Max width
      kind: size
      group: limit
      show: skip
      reason: 'sm only, same value as Height — sm is a fixed dot'
      values:
        sm: { px: 12, token: 🧩 Component/Badge/Size/SM/Height }
```

## Notes

- **`sm` is a dot.** Its font and icon tokens are 0 and its padding has no effect, so the Sizes
  table shows `—` for Padding X, Icon size and Text.
- **Findings (09.11.2026, reported only):**
  - Long text overflows: `white-space: nowrap` with no truncation (163px wide in a 40px parent).
  - `default` and `danger` use the same colors (`#ffaca6`), so they look identical. Both stay in
    Figma, because they're separate options and tokens in code.
  - The `pulse` prop's JSDoc is copied from another prop ("added to the top right corner of the
    card").
  - The visual test uses `size="md"`, which isn't in `BADGE_SIZES`.

## Phase 2 — variant grouping proposal

| Prop / slot  | Test                             | Figma mapping                                                             |
| ------------ | -------------------------------- | ------------------------------------------------------------------------- |
| `size`       | Enum, same layers, other tokens  | Variant `size`: `base · sm · lg`                                          |
| `color`      | Enum, same layers, other tokens  | Variant `color`: `default · disabled · info · danger · warning · success` |
| `icon`       | Nested `ds-icon`, guarded        | `icon` instance swap + `show icon` (default false)                        |
| default slot | Free text, can be empty          | `label` text + `show label` (default true), placeholder `1`               |
| `position`   | No static visual effect on badge | Excluded                                                                  |
| `pulse`      | Animation only                   | Excluded                                                                  |

**Two axes, no `state` axis:** `size` on the columns, `color` on the rows. One set, `Badge`.

```
          base    sm      lg
default   [cell]  [cell]  [cell]
disabled  [cell]  [cell]  [cell]
info      [cell]  [cell]  [cell]
danger    [cell]  [cell]  [cell]
warning   [cell]  [cell]  [cell]
success   [cell]  [cell]  [cell]
```

**Variant count:** 3 × 6 = **18**, well under the 500 limit.
