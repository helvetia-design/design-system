# spinner → Figma mapping

```yaml
figmaComponentKey: null # split into two top-level sets, see figmaComponentKeys (same pattern as
# ds-close) — inverted is structural, not a variant property
figmaComponentKeys:
  primary:
    '2423:174' # Spinner/Primary component set node id, 8 variants (size x labelPosition x
    # variation), cloned from the pre-category-page build's already-validated visual construction
  inverted: '2423:215' # Spinner/Inverted component set node id, 8 variants, same axes
figmaPage: Core / Indicators # the shared category page — spinner lands alongside badge, hint,
# progress-bar, tag; NOT a page of its own
figmaMasterNodeId: null # see figmaComponentKeys above — split into two, same reason
figmaDocFrameNodeId: '2424:172' # single "Spinner Documentation" frame — the Primary and Inverted
# sets are both shown stacked inside this one frame's "🔒 Component Set" panel, not as two frames;
# this is the single item appended into Core / Indicators' Documentation Frames row

anatomy:
  - letter: A
    part: inner
    description: 'The spinner animation container element.'
  - letter: B
    part: label
    description: 'The visible label rendered next to the spinner.'

props:
  - name: deactivated
    type: boolean
    figmaProperty: null
    figmaPropertyType: excluded
    reason: 'Only toggles animation playback (freezes/unfreezes the Lottie animation) — no static
      visual effect, excluded per the standing boolean-prop-with-no-visual-effect rule.'
  - name: inverted
    type: boolean
    figmaProperty: null
    figmaPropertyType: top-level-split
    reason: 'True dark-context axis — structural, not a token swap on identical layers (circle
      border colors AND logo fill color both change). Split into two top-level component sets,
      Spinner/Primary and Spinner/Inverted, same treatment as every other inverted axis in this
      library.'
  - name: size
    type: enum
    options: [base, sm]
    figmaProperty: size
    figmaPropertyType: variant
    note: "Code's own @OneOf array is SPINNER_SIZES = ['sm'] only — size is an optional prop and
      unset means the default/'base' look (no .is-sm class). 'base' here is this skill's own
      naming convention for 'prop unset', matching every other sized component in this library,
      not a literal second array entry in code."
  - name: label
    type: string
    figmaProperty: null
    figmaPropertyType: instance-text-override
    showProperty: 'Show label' # paired boolean — render() guards the label span with
    # hasValue(this.label), so this needs a BOOLEAN component property wired to the label layer's
    # visible via componentPropertyReferences, default false (matches code's '' default)
  - name: labelPosition
    type: enum
    options: [right, bottom]
    figmaProperty: labelPosition
    figmaPropertyType: variant
    note: 'Only has a visible effect when label is non-empty, but still gets its own independent
      variant axis per the standing rule (simplicity over eliminating visually-redundant
      combinations).'
  - name: variation
    type: enum
    options: [logo, circle]
    figmaProperty: variation
    figmaPropertyType: variant
    note: 'Same-layers test: both variations render the same #inner div, just styled differently
      (Lottie animation vs. CSS border-ring) — stays a variant property, not a top-level split.'

states: null # spinner has no :hover/:focus/:active/:disabled/:readonly/loading-related selectors
# anywhere in spinner.host.scss — no `state` variant property for this component.

nested: null # no nested ds-* component usage (plain Lottie animation + CSS, no ds-icon etc.)

tokens:
  - cssVar: --ds-spinner-logo-size-md
    figmaVariable: 🧩 Component/Spinner/Logo/Size/MD
    resolved: true
  - cssVar: --ds-spinner-logo-size-sm
    figmaVariable: 🧩 Component/Spinner/Logo/Size/SM
    resolved: true
  - cssVar: --ds-spinner-circle-size-md
    figmaVariable: 🧩 Component/Spinner/Circle/Size/MD
    resolved: true
  - cssVar: --ds-spinner-circle-size-sm
    figmaVariable: 🧩 Component/Spinner/Circle/Size/SM
    resolved: true
  - cssVar: --ds-spinner-circle-thickness-md
    figmaVariable: 🧩 Component/Spinner/Circle/Thickness/MD
    resolved: true
  - cssVar: --ds-spinner-circle-thickness-sm
    figmaVariable: 🧩 Component/Spinner/Circle/Thickness/SM
    resolved: true
  - cssVar: --ds-spinner-circle-primary-background
    figmaVariable: 🧩 Component/Spinner/Circle/Primary/Background
    resolved: true
  - cssVar: --ds-spinner-circle-primary-progress
    figmaVariable: 🧩 Component/Spinner/Circle/Primary/Progress
    resolved: true
  - cssVar: --ds-spinner-circle-inverted-background
    figmaVariable: 🧩 Component/Spinner/Circle/Inverted/Background
    resolved: true
  - cssVar: --ds-spinner-circle-inverted-progress
    figmaVariable: 🧩 Component/Spinner/Circle/Inverted/Progress
    resolved: true
  - cssVar: --ds-alias-text-family-text
    figmaVariable: 🔗 Alias/🔤 Text/Family/Text
    resolved: true
    appliesTo: 'label part (::part(label) font-family)'
  - cssVar: --ds-alias-text-line-height-text
    figmaVariable: 🔗 Alias/🔤 Text/LineHeight/Text
    resolved: true
    appliesTo: 'label part (::part(label) line-height)'
  - cssVar: null
    figmaVariable: 🧩 Component/Spinner/Logo/Primary/Color
    resolved: true
    note: "Not a CSS-var binding — getColor()'s JS fallback hardcodes '#000d6e' for the non-inverted
      case, read via getComputedStyle(--spinner-color) with this as the fallback. Token resolves to
      the exact same hex (confirmed: rgb(0, 0.051, 0.431) = #000d6e) — no drift currently, bind to
      it for the Figma visual."
  - cssVar: null
    figmaVariable: 🧩 Component/Spinner/Logo/Inverted/Color
    resolved: true
    note: "Same JS-fallback situation as above, inverted case — getColor() hardcodes '#ffffff',
      token resolves to exact white, no drift."
  - cssVar: null
    figmaVariable: 🔗 Alias/🔤 Text/Color/Primary
    resolved: true
    note: "Inherited-context binding — label part sets no explicit color in SCSS, relies on
      Shadow DOM inheritance in real usage. Bind to this system's default text color."
  - cssVar: null
    figmaVariable: 📱 Device/🔤 Text/Size/Base/Device
    resolved: true
    note: "Inherited-context binding — label part sets no explicit font-size in SCSS. Bind to this
      system's default responsive text size."
  - cssVar: null
    figmaVariable: 🔗 Alias/↔️ Space/Gap/XS
    resolved: true
    note: "is-label-right's gap: 0.5rem (8px) — hardcoded literal in SCSS, no CSS var. XS resolves
      to exactly 8px."
  - cssVar: null
    figmaVariable: 🔗 Alias/↔️ Space/Gap/2XS
    resolved: true
    note: "is-label-bottom's gap: 0.25rem (4px) — hardcoded literal in SCSS, no CSS var. 2XS
      resolves to exactly 4px."

specs: # one entry per `size` option (base/sm), shown against the default variation=logo preview
  base:
    - kind: size
      label: Logo size
      px: 64
      token: 🧩 Component/Spinner/Logo/Size/MD
    - kind: size
      label: Circle size
      px: 24
      token: 🧩 Component/Spinner/Circle/Size/MD
    - kind: spacing
      label: Circle thickness
      px: 4
      token: 🧩 Component/Spinner/Circle/Thickness/MD
  sm:
    - kind: size
      label: Logo size
      px: 32
      token: 🧩 Component/Spinner/Logo/Size/SM
    - kind: size
      label: Circle size
      px: 16
      token: 🧩 Component/Spinner/Circle/Size/SM
    - kind: spacing
      label: Circle thickness
      px: 2
      token: 🧩 Component/Spinner/Circle/Thickness/SM
```

## Notes

- **Full rebuild under the current Phase 4 template, per explicit user confirmation.** `ds-spinner`
  had a live Figma page (`⏳ Core / Indicator / Spinner`) from earlier work predating this
  mapping-file convention and the current blue-header/2-column/category-page template; that old
  page was removed from the file during this run (outside this skill's own actions) before this
  run reached Phase 4 — the real master `COMPONENT_SET`s had already been cloned onto
  `Core / Indicators` by that point, so the rebuild was unaffected. This run builds spinner fresh
  onto `Core / Indicators`, alongside `ds-badge`.
- **`inverted` is one frame with two stacked component sets, not two frames.** A first pass built
  two full side-by-side documentation frames (Primary/Inverted); corrected same-day to a single
  frame whose "🔒 Component Set" panel stacks both sets under `Primary`/`Inverted` sub-labels — see
  `CONVENTIONS.md`'s baseline rule on this and `PHASE-4-DOCUMENT.md`'s "Handling an `inverted` axis"
  section. `figmaDocFrameNodeId` above points at the single corrected frame.
- **Circle border-radius (50%) is exempt from token resolution** — it's pure "make it a circle"
  geometry, not a design decision, per `PHASE-1-ANALYZE.md` step 6's explicit exemption (same
  treatment as any circular shape in this library).
- **4 variant axes total** (`size`, `labelPosition`, `variation`, plus the structural `inverted`
  split) — same shape as this skill's own worked example in `PHASE-2-PROPOSE.md` (originally
  developed for this exact component). Phase 2 will re-confirm the grid sketch/layout fresh in this
  run, consistent with the skill's confirm-every-time checkpoint discipline, even though the shape
  is already documented precedent.
- **`size`'s `base` option is a naming convention, not a literal code enum value** — see the
  `props` entry above. Worth a second look if the component's own `@OneOf` array is ever expanded
  to include a real `'base'` entry; nothing here would need to change, but it would no longer be
  purely this skill's convention.
