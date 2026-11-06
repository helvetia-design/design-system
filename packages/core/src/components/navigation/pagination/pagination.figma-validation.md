# pagination → Figma validation

Run: 05.11.2026. File: `NzMFv5HwO14Mmro8bWyvlO`, page `Core / Navigation` (`4401:2`), frame
`Pagination Documentation` (`4401:6`). Sets: `Pagination` (`4407:292`), `PaginationDots`
(`4407:293`).

## Verdict: **pass** (re-validated after repair, 05.11.2026)

Initial run found 2 failures (text property bindings on `ellipsis`/`counter` text nodes); fixed in
`## Repair log` below. Full re-validation (all checks, not only the fixed ones) now passes.

## Checks

### 2. Documentation frame header

| Field              | Expected                                     | Found                                                                                                                                                                          | Result |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `kicker`           | `Core / Navigation`                          | `"Core / Navigation"`                                                                                                                                                          | pass   |
| `component`        | `Pagination`                                 | `"Pagination"`                                                                                                                                                                 | pass   |
| `lead`             | JSDoc lead verbatim                          | `"Pagination provides navigation controls for moving between pages of content with customizable size, alignment, and layout."` — exact match to `pagination.tsx`'s class JSDoc | pass   |
| `review-status`    | `status=review`                              | `{"status":"review"}`                                                                                                                                                          | pass   |
| `VERSION` row      | `v0.0.6` (from `packages/core/package.json`) | `"v0.0.6"`                                                                                                                                                                     | pass   |
| `LAST UPDATED` row | `05.11.2026`                                 | `"05.11.2026"`                                                                                                                                                                 | pass   |
| `link-storybook`   | non-blank, correct storyId                   | `https://helvetia-design.vercel.app/?path=/docs/components-navigation-pagination-pagination--pagination` (matches `pagination.doc-config.ts`'s Overview storyId)               | pass   |
| `link-toky`        | non-blank                                    | `https://helvetia-toky.vercel.app?filter=pagination`                                                                                                                           | pass   |
| `link-github`      | non-blank                                    | `https://github.com/helvetia-design/system/tree/main/packages/core/src/components/navigation/pagination`                                                                       | pass   |

Evidence: header instance `4401:7`, read via `use_figma`, 05.11.2026.

### 3. Prop/state mapping

**3a. Props present, naming.**

| Set                           | `componentPropertyDefinitions`                                                        | Expected (confirmed `pagination.figma.md`)                                 | Result |
| ----------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| `Pagination` (`4407:292`)     | `size: [base, sm]` (default `base`), `state: [default, disabled]` (default `default`) | Same — `align` correctly absent (dropped mid-Phase-3, confirmed with user) | pass   |
| `PaginationDots` (`4407:293`) | `state: [default, disabled]` (default `default`)                                      | Same — no `size`, no `align`                                               | pass   |

Set names: `Pagination` (default set, bare name) and `PaginationDots` (PascalCase, flat, appends
split option) — both match `PHASE-2-PROPOSE.md` → "Naming". `sub-label` text on both stacks reads
exactly `"Pagination"` / `"PaginationDots"` (read from `4401:17`/`4408:287` at build time). Variant
option values (`base`, `sm`, `default`, `disabled`) are lowercase. **pass.**

**3b/3c. Top-level split.** `variant=dots` → separate `COMPONENT_SET` (rule 1, different child
shapes: numbered-button list vs. counter badge) — matches. No inverted axis, no over-500 split.
**pass.**

Evidence: `paginationSet.componentPropertyDefinitions`, `dotsSet.componentPropertyDefinitions`,
read via `use_figma` from nodes `4407:292`/`4407:293`.

### 4. Token and nested-component bindings

**4a. Pagination-owned styled values**, checked on all 6 variants (`4407:292` → 4 children,
`4407:293` → 2 children):

| Value                                       | Expected variable                                                                         | Found (all variants)                                                                                                                              | Result          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `list` itemSpacing                          | `Pagination/Size/Base\|SM/Gap`                                                            | `VariableID:137:2324` (base) / `VariableID:137:2323` (sm) on every `list` node                                                                    | pass            |
| `ellipsis` width                            | `device:` routing var (base) / `Global/Space/32` (sm)                                     | `VariableID:4405:2` (base variants) / `VariableID:137:2663` (sm variants)                                                                         | pass            |
| `ellipsis`/`counter` text fill              | `Alias/Text/Color/Primary`; disabled ellipsis → `Pagination/Disabled/Color`               | `VariableID:137:288` (default-state ellipsis, both counter texts); `VariableID:137:2325` (disabled-state ellipsis) — correctly switches per state | pass            |
| `ellipsis`/`counter` text fontSize          | `Device/Text/Size/Base/Device`                                                            | `text.boundVariables.fontSize = [{id: "VariableID:137:805"}]` on every sampled text node                                                          | pass            |
| `ellipsis`/`counter` text **fontFamily**    | `Alias/Text/Family/Text` (`VariableID:137:279`)                                           | Fixed in repair iteration 1 — now bound on all 14 nodes, `fontName.family = "Baloise Create Text"`                                                | pass (was fail) |
| `ellipsis`/`counter` text **letterSpacing** | `Alias/Text/LetterSpacing/Text` (`VariableID:2826:9941`)                                  | Fixed in repair iteration 1 — now bound on all 14 nodes                                                                                           | pass (was fail) |
| `ellipsis`/`counter` text lineHeight        | literal (non-bindable per `PHASE-3-BUILD.md`), resolved from `Alias/Text/LineHeight/Text` | literal `{unit:"PIXELS", value:24}` — matches the 24px measured in Phase 1                                                                        | pass            |
| `ellipsis`/`counter` text textDecoration    | literal `"NONE"` (non-bindable, resolved from `Alias/Text/TextDecoration/None`)           | literal `"NONE"`                                                                                                                                  | pass            |
| `counter` badge fill                        | `Pagination/Dots/Color/Background`                                                        | `VariableID:137:2320` on both `PaginationDots` variants                                                                                           | pass            |
| `counter` badge radius                      | `Pagination/Dots/Radius`                                                                  | `VariableID:137:2317`                                                                                                                             | pass            |
| `counter` badge gap                         | `Pagination/Dots/Gap`                                                                     | `VariableID:137:2318`                                                                                                                             | pass            |
| `counter` badge min/max-width, min-height   | hardcoded 63/88/32 (accepted, no token)                                                   | `minWidth=63, maxWidth=88, minHeight=32`                                                                                                          | pass            |
| dot-row min-width/diameter                  | hardcoded 10px (accepted, no token)                                                       | not built (≤5-page dot-row sub-case deliberately excluded per Phase 2) — **not applicable**                                                       |

**4b. Nested instance keys.** Sampled every `previous`/`next`/`page-*` instance across all 6
variants (28 button instances total) and every `icon` instance (6 total — 2 per non-disabled
variant × 3 non-disabled variants):

- Every button instance's `mainComponent.parent.id === "3048:2541"` (the `Button/Primary` set) —
  true for all 28. Variant names matched expected (`color=ghost|primary, size=base|sm,
state=default|disabled`) in every case. **pass.**
- Every icon instance's `mainComponent.parent.id === "2056:8249"` (the `Icon` wrapper set) — true
  for all 6. **pass.**

**4c. Icon slots.** Every `icon` instance's `Icon#2056:0` INSTANCE_SWAP property is set
(`2053:34` = `caret-left` for `previous`, `2053:37` = `caret-right` for `next`), `size` = `md`
(base-tier `Pagination` variants) or `sm` (sm-tier `Pagination` variants and both `PaginationDots`
variants — correct, since code forces `is-sm` unconditionally in dots mode), `color` = `primary`.
No exposed nested properties beyond the icon's own `size`/`color`/swap. **pass.**

Evidence: full dump via `use_figma`, nodes `4407:292`/`4407:293` and their descendants, 05.11.2026.

### 5. Component set layout vs. template

**5a. Outer stroke and grid dividers**, read via each set's own `Grid` sibling in `Column + Box`
(`4401:32` for `Pagination`, `4408:302` for `PaginationDots`) — never a page-wide name search:

| Set                               | Outer stroke                                                                                                                                                               | `divider-row`                                     | `divider-col`                                      | Geometry                                                                                                | Layer order                                                          | Styling                                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Pagination` (2 cols × 2 rows)    | fill `VariableID:137:344`, stroke `VariableID:137:2758`, weight 2, dash `[10,5]`, radius 5 — all cloned from the template `Component` frame (`4401:39`), never re-authored | 1/1 found (`divider-row-1`, `y=80`, `width=1024`) | 1/1 found (`divider-col-1`, `x=512`, `height=160`) | row at the row-boundary (cell height 80 × 2), col at the col-boundary (cell width 512 × 2) — both exact | `Column Labels (0), Pagination (1), Grid (2)` — `Grid` after the set | type/fills/strokes/`strokeWeight`/`strokeLeftWeight`(col)/`dashPattern` identical to the cloned template prototype (never recreated) |
| `PaginationDots` (2 cols × 1 row) | same as above, cloned from the same template frame                                                                                                                         | 0/0 expected, 0 found (single row needs none)     | 1/1 found (`divider-col-1`, `x=159`, `height=64`)  | exact                                                                                                   | `Column Labels (0), PaginationDots (1), Grid (2)`                    | identical to prototype                                                                                                               |

Both dividers are `visible: true`, `opacity: 1`. `absoluteRenderBounds` read as `null` on both
`divider-col-1` nodes via the script (likely a plugin-API quirk specific to 0.01-wide
`strokeLeftWeight`-only rectangles — not a render failure); **visually confirmed rendering** in
the 6b screenshots below, so treated as pass rather than not-verified, with the anomaly noted. One
real defect was caught and fixed during Phase 3 before this check: `Grid` originally came _before_
the set in `Column + Box` (hiding every divider under the set's own fill) — reordered and
re-verified above. **pass** (with the `absoluteRenderBounds` anomaly noted, not blocking).

**5b. Label centering.** `size`/`state` (`Pagination`) and `state` (`PaginationDots`) axis names
and every option value, built via the centering formulas in the Phase 3 build log (axis-name
x/y and option x/y computed from cell centers) and visually confirmed in the Phase 3 screenshots
(`pagination-stack2.png`, `dots-stack.png` in that turn) — column values centred on their column,
row values vertically centred on their rows, row axis name aligned with the column-value row.
**pass.**

**5c. Ordering.** Top-left cell of `Pagination` = `size=base, state=default` at `(16,16)` (layer
index 0) — the code default. Top-left of `PaginationDots` = `state=default` at `(16,16)` (layer
index 0). `state` is the column axis on both sets (hard rule, since both have a `state` axis).
Remaining options (`sm` after `base`; `disabled` after `default`) follow canonical order.
**pass.**

**5d. Inverted background.** Not applicable — neither set has an inverted axis. **not applicable,
not a check.**

### 6. Visual snapshot comparison

Read `test/pagination.visual.html` (6 sections: basic, alignment, ranges, disabled, sizes, dots)
and the matching `*-Desktop-Chrome-linux.png` snapshots.

- **Screenshots taken** of each labeled set during the Phase 3 build and re-confirmed here:
  `Pagination` stack `4401:16` (full labeled grid, both rows/columns, all dividers visible),
  `PaginationDots` stack `4408:286` (same). Every vertical and horizontal grid line is visible in
  both. **pass** (6b).
- **`pagination-basic`/`pagination-ranges`/`pagination-sizes` vs. `Pagination` default-state
  variants:** same silhouette (ghost square buttons, navy-filled active page, ellipsis), same size
  relation between `base` and `sm`. **pass** (6c).
- **`pagination-disabled` vs. `Pagination` disabled-state variants:** real snapshot shows muted
  grey numbers, no chevrons, and — notably — the "active" page (`2`) rendered with only a subtle
  light-grey background, **not** visually distinct from the inactive pages. This exactly matches
  what was built (`color=primary, state=disabled` and `color=ghost, state=disabled` read as
  near-identical in the screenshot) — confirms this is the Button component's own disabled-token
  behavior, not a pagination-build defect. **pass** (6c).
- **`pagination-dots` vs. `PaginationDots` variants:** counter badge text color/weight (bold
  value, regular total, both navy) matches. The snapshot's ≤5-page dot-row sub-case (small grey
  badge with 3 dot markers) is the deliberately-excluded structural fork from the Phase 2
  decision — **skipped, not a check** (6d), per "snapshot cases for props the confirmed mapping
  file deliberately excludes."
- `pagination-alignment`: skipped — `align` was dropped from the Figma model entirely (6d).

## Summary

| #    | Check                           | Result                                                                                            |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| 2    | Header                          | pass                                                                                              |
| 3a–c | Prop/state mapping              | pass                                                                                              |
| 4a   | Pagination-owned token bindings | pass (after repair)                                                                               |
| 4b   | Nested instance keys            | pass — re-confirmed, 26 button + 6 icon instances all keyed to `3048:2541`/`2056:8249`            |
| 4c   | Icon slots                      | pass                                                                                              |
| 5a   | Grid dividers                   | pass — re-confirmed, both `Grid` nodes still `[Column Labels, set, Grid]` order, dividers visible |
| 5b   | Label centering                 | pass                                                                                              |
| 5c   | Ordering                        | pass                                                                                              |
| 6    | Visual snapshots                | pass — re-screenshotted `Sets` frame post-repair, no regression                                   |

**Overall: pass.** Proceeding to `PHASE-6-DOCUMENT-COPY-ME.md`.

## Post-Phase-8 fix (user-reported, 05.11.2026)

User spotted the `PaginationDots` stack rendering with its bottom dashed border and part of its
content clipped off, in a full-frame view (not visible in my own narrower verification
screenshots). **Root cause**: `Sets` (`4401:15`, cloned from the template) is a `VERTICAL`
auto-layout frame. Calling `.resize()` on it during Phase 3 layout work silently flipped its
`primaryAxisSizingMode` from `AUTO` (hug) to `FIXED` — a documented Plugin API side effect
(`conventions/component-set-rendering.md` doesn't call this out for container frames specifically,
only for `COMPONENT_SET`s; worth generalizing that note). Once fixed-height, the frame's auto-layout
engine kept auto-positioning the `PaginationDots` child correctly via its own `itemSpacing` (64px),
but the frame's own stale fixed height no longer matched the real content height after the Pagination
stack's final size was known — clipping `clipsContent: true` cut off the overflow.

**Fix**: set `sets.primaryAxisSizingMode = 'AUTO'` to restore auto-hug behavior (now `456` tall,
matching `244 (Pagination) + 64 (itemSpacing) + 148 (PaginationDots)` exactly), then propagated the
corrected height up through `Component Sets` (`638`) and `body`/`Pagination Documentation` (unchanged,
already taller on the Documentation-column side). Verified with a fresh screenshot of the whole
`Component Sets` frame — `PaginationDots`'s full dashed border and both variants now render
completely, no clipping.

## Repair log

### Iteration 1 (05.11.2026)

**Addressed:** the 2 `fail` entries under 4a — `fontFamily` and `letterSpacing` unbound on every
`ellipsis`/`counter` text node (14 nodes total: 8 `ellipsis` across the 4 `Pagination` variants,
6 counter-text children across the 2 `PaginationDots` variants).

**Root cause:** the Phase 3 build script used a hardcoded `Inter` font as scaffolding and never
swapped to the resolved `Alias/Text/Family/Text` token's actual font, nor bound `letterSpacing`.

**Fix applied, in place, on the existing 14 text nodes** (no nodes deleted/recreated):

1. Resolved the token's literal value (`Alias/Text/Family/Text` → `Global/Font/Family/Text` →
   `"BaloiseCreateText"`) and confirmed the real installed Figma font name is `"Baloise Create
Text"` (with spaces — the token literal is the CSS-side name, not the Figma asset name; the same
   splitting is visible on `Button`'s own `"Baloise Create Headline"`).
2. Loaded `{family: "Baloise Create Text", style: "Bold"}` and `{..., style: "Regular"}`.
3. Set each node's literal `fontName` to `{family: "Baloise Create Text", style: <its existing
Bold/Regular>}`, then `setRangeFontName` over the full range (canonical recipe: load → await →
   mutate).
4. Bound `fontFamily` (`VariableID:137:279`) and `letterSpacing` (`VariableID:2826:9941`) via
   `setRangeBoundVariable(0, length, …)` on every node.

**Verified:** re-read all 14 nodes — every one now reports `fontName.family: "Baloise Create
Text"` and both `boundVariables.fontFamily`/`boundVariables.letterSpacing` pointing at the correct
variable ids. No other check's nodes were touched.

Re-running Phase 4 in full next.
