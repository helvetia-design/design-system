# Mapping file format

`<name>.figma.md` lives at `packages/core/src/components/<category>/<name>/<name>.figma.md`,
co-located with the component's other files. It's both the input spec you confirm in Phases 1–2
and the output record Phase 3 writes back into.

```markdown
# <name> → Figma mapping

\`\`\`yaml
figmaComponentKey: null # filled in by Phase 3 on success
figmaPage: Core / <Category> # the shared category page, e.g. "Core / Indicators" — NOT this

# component's own name; multiple components share one page (see CONVENTIONS.md's category table)

figmaMasterNodeId: null # this component's component set node id (referenced from inside

# its own documentation frame's `Component Sets` column — there's no separate masters row)

figmaDocFrameNodeId: null # this component's "<Component> Documentation" frame id within the

# documentation-frames row — filled in by Phase 3, since the page itself

# no longer uniquely identifies a single component's content

anatomy:

- letter: A
  part: label
  description: "The text label wrapper (<span>)."
- letter: B
  part: icon
  description: "The leading icon wrapper (or the brand icon wrapper when brandIcon is set)."

# Omit this whole `anatomy:` key if the component has no @part tags at all.

props:

- name: size
  type: enum
  options: [sm, base]
  figmaProperty: size
  figmaPropertyType: variant
  figmaOptions: [base, sm] # canonical order: code default first (implicit default `base`), then scale order
- name: label
  type: string
  figmaProperty: null
  figmaPropertyType: instance-text-override
  states:
  figmaProperty: state
  options: [default, hover, focus, active, disabled]
  sources:
  hover: ":hover (spinner.host.scss)"
  disabled: "disabled prop"
  nested:
- childTag: ds-icon
  childMappingFile: ../icon/icon.figma.md
  figmaComponentKey: <resolved from icon.figma.md>
  iconSlot: # only for nested ds-icon / ds-brand-icon — always instance swap
  codeProp: icon # → INSTANCE_SWAP property `icon`
  acceptsBrandIcon: true # brandIcon replaces icon in part="icon" → brand-icon library in preferredValues
  size: follows parent size # icon right: fixed sm
  color: follows inverted
  device: # omit entirely if Phase 1 step 5a found no breakpoint-driven token differences.
  # One entry per responsive binding — the single place that owns the mechanism detail (which
  # routing variable, its per-mode aliases, why this component needed it). tokens:/specs: entries
  # for the same binding just reference the routing variable by name, no restating the breakdown.
  responsiveBindings:
  - cssVar: [--ds-logo-size-base-mobile, --ds-logo-size-base-desktop] # every real --ds-* token
    # involved across the component's breakpoints, in mobile→desktop order
    routingVariable: 🧩 Component/Logo/Size/Base/Device # created/reused by Phase 3 in the file's
    # `Design Responsive Tokens` collection; deterministic name, see PHASE-3-BUILD.md
    modes:
    mobile: 🧩 Component/Logo/Size/Base/Mobile # real scripts/figma-sync-managed variable this
    # mode's alias points at
    tablet: 🧩 Component/Logo/Size/Base/Mobile # falls through to Mobile's token — code has no
    # @include tablet override for this property, so Tablet renders the same as Mobile
    desktop: 🧩 Component/Logo/Size/Base/Desktop
    risk: "Hand-created by this skill, not emitted by scripts/figma-sync — if the underlying
    per-breakpoint variables are ever renamed/removed, this alias goes stale with no automatic
    fix. Feeding this pattern into the sync pipeline itself is real follow-up work, not yet done."
    tokens:
- cssVar: --ds-alias-background-color-sky
  figmaVariable: Alias/Background Color/Sky
  figmaVariableId: VariableID:137:83 # from css-token-lookup.mjs — see PHASE-1-ANALYZE.md step 5.
  # Phase 3 binds directly against this id (getVariableByIdAsync), never a name search.
  resolved: true
- cssVar: --ds-spinner-color-one-off
  figmaVariable: null
  figmaVariableId: null
  resolved: false
  resolution: "<decision made with the user — pick a token or accept hardcoded>"
- cssVar: [--ds-logo-size-base-mobile, --ds-logo-size-base-desktop]
  figmaVariable: 🧩 Component/Logo/Size/Base/Device # see device: above — responsive, not a
  # single static token
  figmaVariableId: null # the routing/Device variable is hand-created by Phase 3, not resolved by
  # css-token-lookup.mjs — see device: above and PHASE-3-BUILD.md step 3
  resolved: true
  specs: # confirmed specs triage (PHASE-1-ANALYZE.md step 6), rendered by Phase 8. Rules:
  # conventions/specs.md
  drawnOption: base # the Variants-axis option shown on the drawn card
  options: [base, sm, lg] # table columns, canonical order; [] when there is no Variants axis
  behavior: # triage rows proposed as `behavior` land here, not in rows:. Omit when the size
  # never changes with content/container (icon, spinner)
  width: hug # hug | fill — from the behavior probe
  overflow: truncate # truncate | wrap | overflow (flag overflow in the triage)
  rows: # numbered in this order on the drawn card and in the table: size → spacing → shape → type
  - property: Min height # Width | Height | Size (w = h) | Min/Max width/height | Padding X/Y/L/R | Gap | Radius | Border width | Focus ring | Type (<part>)
    kind: size # size | spacing | shape | type
    group: limit # fixed | inner spacing | limit | behavior | derived | outer margin | hit area | context-dependent | typography
    show: drawn # drawn (marker + table row) | table (table row only, rare) | skip
    instance: main # drawn rows only: main | min-content | focus | … — see conventions/specs.md → "Section layout"
    source: button.host.scss:42 # the SCSS declaration that sets it
    values: # one per option; measured px + its token (exact Figma variable name)
    sm: { px: 32, token: 🧩 Component/Button/Size/SM/MinHeight }
    base: { px: 48, token: 🧩 Component/Button/Size/Base/MinHeight }
    lg: { px: 56, token: 🧩 Component/Button/Size/LG/MinHeight }
  - property: Padding X
    kind: spacing
    group: context-dependent
    show: drawn
    source: logo.host.scss:12
    values:
    base: { px: { mobile: 16, tablet: 16, desktop: 24 }, token: 🧩 Component/Logo/Padding/Device } # routing variable — see device: above
  - property: Type (label)
    kind: type
    group: typography
    show: drawn
    source: button.host.scss:60
    values:
    base: { px: 16, token: 🔤 Text/Size/Base, weight: 700, lineHeight: 1.3, family: BaloiseCreateHeadline }
  - property: Height
    kind: size
    group: derived
    show: skip
    reason: "padding + line-height; min height already covers it" # required when show is skip, or when the user changed the default proposal
    values:
    base: { px: 48 }
  - property: Margin
    kind: spacing
    group: outer margin
    show: skip
    reason: "margin-block on :host — layout's job; reported as a code smell"
    values:
    base: { px: 8 }
  # A measured ≠ token mismatch the user resolved keeps both: { px: 15, token: …, tokenPx: 16, note: "…" }
  \`\`\`

Notes on this mapping, open questions, and rationale for any non-obvious grouping decision go
here as prose, below the YAML block.
```
