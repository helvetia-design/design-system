# close → Figma validation

Run date: 05.11.2026. Validates the build recorded in `close.figma.md` (`sets:` → `Close`
`3917:1055`, `CloseInverted` `3917:1119`; `figmaDocFrameNodeId: 3909:1130`; `figmaPage: Core /
Actions`).

## 2. Documentation frame header

| Check              | Expected                                                 | Found                                                                                                      | Result |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| `kicker`           | `Core / Actions`                                         | `Core / Actions`                                                                                           | pass   |
| `component`        | `Close`                                                  | `Close`                                                                                                    | pass   |
| `lead`             | JSDoc lead verbatim                                      | "Close renders a button element for closing or dismissing UI components with customizable size and color." | pass   |
| `review-status`    | `status=review`                                          | `status=review`                                                                                            | pass   |
| `VERSION` row      | `v0.0.6` (packages/core/package.json)                    | `v0.0.6`                                                                                                   | pass   |
| `LAST UPDATED` row | `05.11.2026`                                             | `05.11.2026`                                                                                               | pass   |
| `link-storybook`   | `…/?path=/docs/components-actions-close-close--close`    | hyperlink set to that URL                                                                                  | pass   |
| `link-toky`        | `https://helvetia-toky.vercel.app?filter=close`          | hyperlink set to that URL                                                                                  | pass   |
| `link-github`      | `…/tree/main/packages/core/src/components/actions/close` | hyperlink set to that URL                                                                                  | pass   |

## 3. Prop/state mapping

| Check                                        | Expected (confirmed `close.figma.md`)                          | Found                                                                                       | Result |
| -------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------ |
| `size` variant property                      | `[base, sm, md]`, default `base`                               | `componentPropertyDefinitions.size = {default: base, options: [base, sm, md]}` on both sets | pass   |
| `state` variant property                     | `[default, hover, focus, active, disabled]`, default `default` | `componentPropertyDefinitions.state` matches exactly on both sets                           | pass   |
| `inverted` → top-level split                 | `Close` / `CloseInverted` sets                                 | Both sets exist, named exactly `Close` and `CloseInverted`                                  | pass   |
| `disabled` folded into `state`               | No separate boolean property                                   | No `disabled` boolean property on either set — confirmed only `size`/`state` exist          | pass   |
| `button`/`buttonColor`/`buttonSize` excluded | Not modeled                                                    | No trace in either set's properties or layers                                               | pass   |
| Set/property naming                          | lowercase properties, flat PascalCase set names, default bare  | `size`/`state` lowercase; `Close` bare, `CloseInverted` PascalCase                          | pass   |
| Variant count                                | 2 sets × 15 = 30                                               | `Close`: 15 children, `CloseInverted`: 15 children                                          | pass   |

## 4. Token and nested-component bindings

Spot-checked 5 variants across both sets (`Close` default/hover/disabled-md, `CloseInverted`
default/disabled) — every fill's `boundVariables.color` id resolves (`resolveForConsumer`) to a
color/opacity that exactly matches the paint actually stored on the node:

| Variant                                   | Background token                                                                 | Icon token                   | Match |
| ----------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------- | ----- |
| Close / size=base, state=default          | Primary/Color/Background/Base (transparent)                                      | Primary/Color/Icon/Base      | pass  |
| Close / size=base, state=hover            | Primary/Color/Background/Hover                                                   | Primary/Color/Icon/Base      | pass  |
| Close / size=md, state=disabled           | Primary/Color/Background/Disabled                                                | Primary/Color/Icon/Disabled  | pass  |
| CloseInverted / size=base, state=default  | Primary/Color/Background/Base (shared transparent, no inverted override in code) | Inverted/Color/Icon/Base     | pass  |
| CloseInverted / size=base, state=disabled | Inverted/Color/Background/Disabled                                               | Inverted/Color/Icon/Disabled | pass  |

Focus-ring stroke on both sets bound to `Alias/Interaction/Focus/Color/Base` (Close) and
`Alias/Interaction/Focus/Color/Inverted` (CloseInverted) — both resolved and applied at build
time (Phase 3), consistent with `close.figma.md`'s `tokens:` list.

Nested components / icon slots: **N/A** — `close.figma.md`'s `nested: []` confirms no nested DS
component. The "X" glyph is a static vector (not an instance-swap), per the Phase 1 resolution —
no binding to check beyond its fill color, already covered above.

## 5. Component set layout vs. template

| Check                               | Expected                                                                                                                                      | Found                                                             | Result |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------ |
| Outer stroke/fill — `Close`         | Fill bound to `VariableID:137:344` (white), stroke `VariableID:137:2758`, weight 2, dash `[10,5]`, radius 5 — identical to template `Primary` | Exact match                                                       | pass   |
| Outer stroke/fill — `CloseInverted` | Fill bound to `VariableID:137:419` (dark navy), same stroke/weight/dash/radius as template `Inverted`                                         | Exact match                                                       | pass   |
| Divider count — `Close`             | `cols−1=4` col dividers, `rows−1=2` row dividers                                                                                              | 4 `divider-col-*`, 2 `divider-row-*`                              | pass   |
| Divider count — `CloseInverted`     | Same (4 col, 2 row) = 6 total                                                                                                                 | 6 dividers found                                                  | pass   |
| Divider geometry                    | On cell boundaries (72/144 rows; 71/143/215/287 cols, 2px-centered), full span                                                                | Matches exactly                                                   | pass   |
| Divider rendering                   | `visible`, `opacity>0`, non-empty `absoluteRenderBounds`                                                                                      | All 6 (Close) + 6 (Inverted) pass                                 | pass   |
| Column label centering              | `state` axis name centered on set (x=180 of 360); each value centered on its column (e.g. `focus` at x=180, col 3 of 5)                       | Exact match                                                       | pass   |
| Row label centering                 | `size` axis name + values vertically centered per row (e.g. `sm` centered at y=164)                                                           | Exact match                                                       | pass   |
| Default variant / layer order       | `size=base, state=default` top-left, first in layer order                                                                                     | Confirmed first in `set.children` grid-reading order on both sets | pass   |
| Column axis                         | `state` is the column axis (hard rule)                                                                                                        | Confirmed                                                         | pass   |
| Inverted background                 | `CloseInverted` sits on dark `Alias/Surface/Primary`-family background, cloned from template `Inverted`                                       | Fill bound to `VariableID:137:419`, same as template              | pass   |

## 6. Visual snapshot comparison

Compared against `test/close.visual.html` + `test/close.visual.play.ts-snapshots/*-Desktop-Chrome-linux.png`:

| Case                               | Snapshot shows                                                          | Figma shows (matching variant)                                                                                                      | Result                                       |
| ---------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `close-basic`                      | Navy "X", no visible background (transparent)                           | `size=base, state=default`: transparent bg, navy X                                                                                  | pass                                         |
| `close-sizes`                      | 3 X's ascending sm → base → md                                          | Row order `base, sm, md` (base=code default first per hard rule A) with sm(14) < base(24) < md(32) — same relative size progression | pass                                         |
| `close-inverted`                   | White X's on dark navy background                                       | `CloseInverted` set: white/pale X's on dark navy card                                                                               | pass                                         |
| `close-button`                     | Out of scope — `button` variant explicitly skipped per user instruction | N/A (not modeled)                                                                                                                   | not verified (expected exclusion, not a gap) |
| `close-themeing`                   | Out of scope — custom CSS var override demo, not a prop                 | N/A                                                                                                                                 | not verified (expected exclusion)            |
| hover/focus/active/disabled states | Not shown in static snapshots                                           | Out of scope per Phase 4 step 6d                                                                                                    | not verified (expected)                      |

Grid lines (step 6b): confirmed visible in both sets' screenshots — 4 vertical + 2 horizontal
dividers rendering cleanly in `Close`, same in `CloseInverted` against the dark backdrop.

## Overall verdict: **pass**

Every check in scope passed. The `not verified` entries in step 6 are expected exclusions
(`button`/`buttonColor`/`buttonSize` skipped per explicit user instruction; CSS-var theming demo;
pseudo-states not present in static snapshots) — none represent an unresolved gap.

## Repair log

### 06.11.2026 — focus ring (found while building Measurements, not by a Phase 4 check)

- **Fail:** the 6 `state=focus` variants (`Close` `3917:1000`, `3917:1021`, `3917:1042`;
  `CloseInverted` `3917:1064`, `3917:1085`, `3917:1106`) grew the variant by 8px and drew a 4px
  gap + 2px outside stroke. Code (`focus-shadow` mixin): 2px `Focus/Color/Border` + 3px focus
  color directly on the edge, no size change.
- **Change:** each variant back to its own size (24 / 14 / 32, re-centered in its cell, clipping
  off); `focus-ring` = ellipse at −5 with a 3px inside stroke bound to `Focus/Color/Base`
  (`Inverted` on `CloseInverted`); new `focus-ring-inner` = ellipse at −2 with a 2px inside stroke
  bound to `Focus/Color/Border`; both behind `button` and `icon`, paints set from the resolved
  variable values. Icon restored to the default variant's size (14 / 8 / 18) after the resize.
- **Evidence:** screenshots of `3917:1055` and `3917:1119` show the white + purple / white + yellow
  ring on all three sizes; the Measurements focus marker (`3909:1136`) was re-placed on the new
  24px instance.

## Re-check: component states + interactions (11.11.2026)

Read-only after migrating both sets in place on main (`Close` `3917:1055`, `CloseInverted` `3917:1119`):
every `state=disabled` variant renamed to `state=default, disabled=true`, every other one got
`disabled=false`. Node ids, keys and instances kept.

| #   | Check                          | Result | Evidence                                                                                                                                                                                                 |
| --- | ------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2   | Header                         | pass   | `status=review`, `v0.0.6`, `11.11.2026`; links `components-actions-close-close--close` (doc-config), Toky `filter=close`, GitHub `actions/close`.                                                        |
| 3a  | Interaction / component states | pass   | Both sets: `state` = default · hover · focus · active; `disabled` = false · true; `true` only with `state=default` (3 / 3 per set). 15 variants per set, unchanged.                                      |
| 4e  | Interactions                   | pass   | 9 reactions per set: per size, `default` → `ON_HOVER` → hover and `ON_PRESS` → active, `hover` → `ON_PRESS` → active; `CHANGE_TO`, transition `null`, same size. 0 on focus, active and `disabled=true`. |
| 5b  | Column labels                  | pass   | `state` centred on columns 1–4 (centre 144.5 of 4 × 72px); `disabled` labels column 5.                                                                                                                   |
| 5c  | Ordering                       | pass   | First layer and top-left cell `size=base, state=default, disabled=false`.                                                                                                                                |
| 6b  | Screenshot                     | pass   | `3909:1139`: both stacks, labels and dividers as expected.                                                                                                                                               |
| —   | Instances                      | pass   | 8 / 8 instances (Close doc sections) keep their main component; none was on the old `state=disabled`.                                                                                                    |
