# badge — Figma validation report

Validated 09.11.2026 against `badge.figma.md`. Frame `4541:1319`, set `Badge` `4543:370`, page
`Core / Indicators`.

## 2. Documentation frame header

| Check           | Expected                                | Found                                                                                               | Result |
| --------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ |
| `kicker`        | `Core / Indicators`                     | `Core / Indicators`                                                                                 | pass   |
| `component`     | `Badge`                                 | `Badge`                                                                                             | pass   |
| `lead`          | JSDoc lead, verbatim                    | Identical to `badge.tsx`                                                                            | pass   |
| `review-status` | `status=review`                         | `status=review`                                                                                     | pass   |
| `VERSION`       | `v0.0.6` (`packages/core/package.json`) | `v0.0.6`                                                                                            | pass   |
| `LAST UPDATED`  | last write to the frame                 | `09.11.2026`                                                                                        | pass   |
| Storybook link  | story id from `badge.doc-config.ts`     | `https://helvetia-design.vercel.app/?path=/docs/components-indicators-badge-badge--badge`           | pass   |
| Toky link       | `?filter=badge`                         | `https://helvetia-toky.vercel.app?filter=badge`                                                     | pass   |
| GitHub link     | component folder                        | `https://github.com/helvetia-design/system/tree/main/packages/core/src/components/indicators/badge` | pass   |

## 3. Prop and state mapping

| Check            | Expected                                                          | Found                                                                                      | Result |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| Properties       | `size`, `color`, `icon`, `label`, `show label`, `show icon`       | Same six on `4543:370`, nothing extra                                                      | pass   |
| `size` options   | `base · sm · lg`                                                  | `base`, `sm`, `lg`                                                                         | pass   |
| `color` options  | `default · disabled · info · danger · warning · success`          | Same, same order                                                                           | pass   |
| Defaults         | `label` = `1`, `show label` on, `show icon` off, `icon` = `check` | `1`, `true`, `false`, `2053:46` (`check`)                                                  | pass   |
| Excluded props   | `position`, `pulse` not modeled                                   | Not present                                                                                | pass   |
| Names            | Lowercase properties and options, PascalCase set                  | All lowercase; set `Badge`                                                                 | pass   |
| Top-level splits | None (no rule 1, 2 or 3 applies)                                  | One set, one stack (`Primary`), 18 children; `sub-label` removed (family of one, no split) | pass   |

## 4. Token and nested bindings

Every check ran over all 18 variants; the script reported 0 issues.

| Check                 | Expected                                                                                      | Found                                                                                                                                                                                                                                                          | Result |
| --------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Box bindings          | height, min width, 4 paddings, gap, 4 radii → the cell's `Size/*` tokens; `sm` also max width | All match the expected variable ids                                                                                                                                                                                                                            | pass   |
| Fill                  | `Badge/<color>/Color/Background`, stored paint = resolved value                               | All match, including stored color and opacity                                                                                                                                                                                                                  | pass   |
| Text binding          | family `137:968`, style `137:969`, size per option, letter spacing `2826:9941`                | All match; `base` `137:961`, `lg` `137:966`                                                                                                                                                                                                                    | pass   |
| Text fill             | `Badge/<color>/Color/Text`, stored paint = resolved value                                     | All match                                                                                                                                                                                                                                                      | pass   |
| Intentionally unbound | `lineHeight` from `2826:10050`, `textDecoration` from `2826:9943` (STRING variables)          | `100%`, `NONE`                                                                                                                                                                                                                                                 | pass   |
| `sm` hidden layers    | label and icon always hidden                                                                  | Hardcoded hidden, `visible` not bound. Their font and icon sizes stay on the `base` tokens, because the `sm` tokens are 0 and those layers never show                                                                                                          | pass   |
| Icon slot             | `icon` swap on the glyph on every variant, 79 preferred values                                | `mainComponent` bound on all 18; 79 preferred; `isExposedInstance` false on all 18                                                                                                                                                                             | pass   |
| Icon library          | Glyph library, no Icon wrapper (user decision)                                                | All 18 are instances of `check` (`2053:46`)                                                                                                                                                                                                                    | pass   |
| Icon size and color   | `colorSource`: `Badge/<color>/Color/Text`; size `Size/Base/Icon` / `Size/LG/Icon`             | Re-checked 10.11.2026 per step 4c on temporary instances (`show icon` on; created 12, removed 12). All 12 non-`sm` variants match by variable id; glyph 12 × 10.25 (base), 16 × 13.66 (lg), 1px fixed padding = code. 6 `sm` skipped: hidden without a boolean | pass   |

## 5. Set layout

| Check               | Expected                                      | Found                                                                                                                                                                 | Result |
| ------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Outer stroke        | Same as the template set                      | Stroke `137:2758`, weight 2, dash `[10,5]`, radius 5, fill `137:344`; identical to the template                                                                       | pass   |
| Divider count       | `divider-col` 2, `divider-row` 5              | 2 / 2, 5 / 5, read from this set's own `Grid`                                                                                                                         | pass   |
| Divider geometry    | On cell boundaries, full span                 | Columns at x 64, 128, height 384; rows at y 64–320, width 192                                                                                                         | pass   |
| Layer order         | `Column Labels`, set, `Grid`                  | `Column Labels`, `Badge`, `Grid`                                                                                                                                      | pass   |
| Divider styling     | Same as the template prototypes               | Column: `RECTANGLE`, 0.01 wide, left weight 2, dash `[10,5]`; row: `LINE`, weight 2, dash `[10,5]`; same stroke variable as the prototypes                            | pass   |
| Dividers render     | Visible, opacity > 0, non-empty render bounds | Rows have render bounds. Columns report none, and so does the template's own column prototype (a 0.01-wide rectangle). All 7 are visible in screenshot of `4541:1328` | pass   |
| Column labels       | Centered within ±1px                          | `size` at 96 (set center); `base` 32, `sm` 96, `lg` 160 (column centers)                                                                                              | pass   |
| Row labels          | Centered on rows, axis on the value line      | `color` at x 0, on the column value line; options centered at y 88–408                                                                                                | pass   |
| Ordering            | Default variant top-left and first layer      | First layer `size=base, color=default`; last `size=lg, color=success`                                                                                                 | pass   |
| Inverted background | n/a                                           | No inverted stack                                                                                                                                                     | pass   |

## 6. Visual snapshot comparison

Figma screenshot of the labeled set: node `4541:1328`, all grid lines visible.

| Case     | Snapshot shows                                                                    | Figma                                                                      | Result       |
| -------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| `basic`  | Salmon pill, `1`, `99`, `Urgent`                                                  | `default`, same fill, shape and text color                                 | pass         |
| `sizes`  | Dot, then two circles of rising size                                              | `sm` 12, `base` 24, `lg` 32                                                | pass         |
| `list`   | `lg` success with check, info `2`, disabled `3`, disabled icon                    | Same colors and size relation in the matching variants                     | pass         |
| `colors` | 8 colored pairs (`R G Y P G S W D`), several in pale tints, including a lilac one | Differs. Snapshot is older than `badge.visual.html`, which now has 6 pairs | not verified |
| `icon`   | Pale teal circle with check                                                       | `success` is a stronger teal, matching the current code                    | not verified |

The snapshot files date from 23.09.2026; `badge.visual.html` changed on 26.10.2026. The `colors` and
`icon` images no longer show what the current test page renders. As a substitute, all six colors
measured on the dev server (09.11.2026) match the Figma fills and text colors. States aren't in
scope: the component has none.

## Overall verdict: **blocked**

No check failed. Two snapshot cases are `not verified` because the snapshots are out of date.

**Accepted by the user (09.11.2026):** the dev-server comparison stands in for the `colors` and
`icon` snapshots, and the run continues to Phase 6. The snapshots still need re-baselining.
