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
  figmaOptions: [base, sm] # code default first (top-left = default variant), then canonical order
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
  specs: # one entry per option of the Variants axis, shown in Phase 8's "📐 Specs" section
  base:
  - kind: size # size | icon | spacing | radius (| type, once added)
    label: Size # Size (width = height, same variable) | Width | Height | Min width | Min height | Padding | Gap | Radius | …
    px: 24
    token: 🧩 Component/Close/Size/Base # exact Figma variable name
  - kind: spacing
    label: Padding
    px: 5 # actual value used (marker + legend Value)
    token: 🧩 Component/Close/Padding/Base
    calc: '(10px) ÷ 2' # only when px is calculated from the variable; shown in the legend
  - kind: size
    label: Height
    px: 32 # Desktop-mode value, shown as the reference figure — see device: above for the
    # full mobile/tablet/desktop breakdown
    token: 🧩 Component/Logo/Size/Base/Device # the routing variable, not a static token — see
    # device: above
    \`\`\`

Notes on this mapping, open questions, and rationale for any non-obvious grouping decision go
here as prose, below the YAML block.
```
