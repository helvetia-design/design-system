# Phase 8 — Document: Measurements

## Objective

Fill in the last section of the `Documentation` column: "📏 Measurements". It renders the measurements
triage confirmed in Phase 1 step 6 — no new analysis happens here.

Build this right after Anatomy (or right after Copy me, if the Anatomy placeholder was deleted). This
is the last phase of the skill.

## Inputs

- "🏗️ Anatomy" (or "👉 Copy me", if the Anatomy placeholder was deleted), built and confirmed in
  [`PHASE-7-DOCUMENT-ANATOMY.md`](PHASE-7-DOCUMENT-ANATOMY.md).
- `<name>.figma.md`'s `measurements:` (`drawnOption`, `options`, `behavior`, `rows`) — the confirmed
  triage from Phase 1 step 6. **If `measurements:` still uses the old flat per-option list** (`base:` /
  `sm:` lists of `{ kind, label, px, token }`), re-run Phase 1 step 6 for this component first.

## References

- `conventions/measurements.md` — kinds, colors, line styles, placement, section layout. The source of
  truth for how every row looks.
- `conventions/document-sections.md` — `Section` / `Preview` mechanics and "Sizing".
- `conventions/build-mechanics.md` — especially "Color and paint".
- `🧰 Annotations` page, node `2046:5` — the `Spec/*` annotation components.

## Instructions

### 0. Check the annotation components

Find these on the `🧰 Annotations` page by name (node ids are hints only). **Any one missing is a
🛑 hard stop**: list what's missing and ask the user to add it to the page — never draw a one-off
marker by hand instead.

| Component            | Needs                                                                                                                                                                                                                                                             | Used for                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `Spec/Dimension`     | (`2046:36`) `side` (`top`/`bottom`/`left`/`right`) × `kind` (`size`/`spacing`/`shape`) × `style` (`solid`/`dashed`) × `label` (`center`/`start`/`end`/`callout`/`callout-start`/`callout-end`; only `center` on `left`/`right`), `Value`, `Number`, `Show number` | widths, heights, padding, gap, limits |
| `Spec/Inset`         | (`2046:37`) `spacing` tint, stretches in both axes                                                                                                                                                                                                                | padding tint                          |
| `Spec/Gap`           | (`3064:1397`) hatched `spacing` fill, stretches in both axes                                                                                                                                                                                                      | gap hatch                             |
| `Spec/Icon size`     | (`3282:1362`) overlay box: 25% `size` fill + 1px outline, no text                                                                                                                                                                                                 | icon / glyph size                     |
| `Spec/Corner radius` | (`3282:1361`) `corner` (`top-right`/`top-left`/`bottom-right`/`bottom-left`), resize = circle size, `Value`, `Number`, `Show number`                                                                                                                              | radius                                |
| `Spec/Leader`        | (`3282:1424`) `kind` × `side` (`right`/`left`/`top`/`bottom`), `Value`, `Number`, `Show number`; `top`/`bottom` are vertical (the instance's height sets the length)                                                                                              | type, border width, focus ring        |
| `Spec/Text box`      | (`4243:1353`) dashed `type` outline, resize = text box                                                                                                                                                                                                            | text part's line box                  |
| `Spec/Outline`       | (`2046:38`) dashed orange outline, stretches in both axes                                                                                                                                                                                                         | hit area                              |
| `Spec/Marker`        | (`3064:1541`) `kind` (`size`/`spacing`/`shape`/`type`), `Number`                                                                                                                                                                                                  | table row numbers                     |

`Value` is the value only (`48px`, `min 48px`, `4px`); the row number goes into `Number` with
`Show number` on (the default). Every label is the same soft pill (tint fill, kind-colored
outline, solid number bubble first, dark value text — colors in `conventions/measurements.md` →
"Labels"), and `Spec/Dimension` puts it on the outer side of its line, 4px from the tick ends
(above a `top` line, left of a `left` line, …), so it never covers the ticks. Dashed and solid lines are the same
1px rectangle (dashed = one-side dashed stroke), so both sit centered between the end ticks. Legacy, don't
use for new Measurements: `Spec/Dimension` `kind=icon`, `Spec/Radius`, `Spec/Legend item`, `Spec/Callout`.

After changing an annotation component, instances already placed can keep a stale layout or
even a stale render (seen on `ds-button`: the radius pill showed a leftover rectangle of its old
label, although the node tree was clean). Replace each affected instance with a fresh one from
its main component — same component properties, size, position and layer index — rather than
patching it; never edit the layers inside an instance.

Verify on a screenshot of the real section node. A copy re-renders cleanly and hides such
glitches, so never verify on a clone; anything odd on the real screenshot is real until the node
tree explains it.

### 1. Structure

Fill the `Section` placeholder whose `Title` is `kind=measurements` (`Flat`; 🛑 hard stop if missing) —
don't create a new one. Inside its slot, stack up to three nested `Default` `Preview`s, in the
order from `conventions/measurements.md` → "Section layout": **Drawing**, **Sizes table**,
**Behavior** (only when `measurements.behavior` exists).

Every nested `Preview` gets `layoutSizingHorizontal = 'FILL'` after it's appended, and ends up
`layoutSizingVertical = 'HUG'` (see "Sizing" in `conventions/document-sections.md`). Content you
put into a `Preview` slot is an auto-layout frame that is `FILL` wide and `HUG` high — never a
literal width: a frame wider than the slot gets centered and clips its left edge. The one fixed
height is the drawing's `stage`, which is calculated (step 2). Each card has a
short title text (`Drawing — base · secondary`, `Sizes`, `Behavior`) bound to
`🔗 Alias/🔤 Text/Color/Primary` (`VariableID:137:288`), per `conventions/build-mechanics.md` →
"Color and paint".

Use the default set's instances only, never an `…Inverted` set — an inverted split changes
colors, not geometry, so its numbers would only repeat.

**Family** (`conventions/families.md` §6): Measurements is built once, on the owner, from the owner's
`measurements:` — which holds every member's rows, each with `set:`. The drawing uses the owner's
default instance; contained sub-component rows are drawn on the sub-component instances inside it.
Rows with `show: table` from a wrapping sub-component appear only in the Sizes table. In the
table, prefix each sub-component row's property with its set name (`Tab · Padding X`).

### 2. Drawing

1. A `stage` frame (no auto-layout, so markers can sit at calculated positions). Row 1: the
   **main** instance — the default set's `drawnOption` variant in the `drawnColor` option (see
   `conventions/measurements.md` → "Border visibility"), in the `drawnState` if set (else default
   state; see "Shape visibility"), with the same content as Copy me — centered. Row 2: one **extra** instance per distinct `instance` value in `measurements.rows`
   (`focus`: the `focus` state; `min-content`: shortest realistic label, e.g. `OK`), same
   `drawnColor`, side by side with 120px between them, centered under the main instance, each with
   a caption under it (`Focus`, `Min content`). The card title names the option and color
   (`Drawing — base · secondary`).
   Leave enough room around each instance for its markers and resize the stage to fit everything,
   so nothing is clipped.
2. Number every shown row in `measurements.rows` order (`size → spacing → shape → type`): the Sizes table
   reads 1, 2, 3, … top to bottom, and every number appears exactly once on the drawing.
3. Place each row's marker on its `instance`, per `conventions/measurements.md` → "Kinds and visual
   vocabulary". Every marker gets `Value` = the value and `Number` = the row number:
   - **width / height** → `Spec/Dimension` outside the instance (`side=top` for widths,
     `side=left` for heights), its ticks 4px from the instance (`side=top`: instance
     `y = top − 4 − 17`; `side=left`: `x = left − 4 − 24`), `style=dashed` and `Value`
     `min 48px` for `Min`/`Max` rows.
   - **padding** → `Spec/Inset` on every side the token applies to, plus a `Spec/Dimension`
     (`kind=spacing`) per tinted side: left/right padding gets `side=bottom` under it, its ticks
     4px under the instance (`y = bottom + 4`); top/bottom padding gets `side=right` beside it,
     its ticks 4px right of the instance (`x = right + 4`). The padding starts inside the border
     (CSS `border-box`), so inset the tint by the border width on every side it touches
     (`ds-button`: 2px border → `x = 2`, `y = 2`, `height − 4`), and round its outer corners to
     `radius − border` (`4 − 2 = 2`) so it follows the component's inner edge without gaps. When
     the radius is wider than the tint (a pill), rounding can't follow the edge: put the tints in a
     frame the size of the instance, `clipsContent` on, radius bound to the component's radius.
   - **gap** → `Spec/Gap` over each gap the token applies to, plus a `Spec/Dimension`
     (`kind=spacing`) per gap, on the same row as the padding lines of that side: a row gap gets
     `side=bottom` under it, a column gap (vertical layout) `side=right` beside it. Inset
     the hatch vertically by the border like the padding tint. Gap pills usually collide with the
     padding pills: use `label=callout` and resize the instance's height so its pill sits one pill
     row below the padding pills (4px between the rows) — see step 5.
   - **icon / glyph size** → `Spec/Icon size` resized to the nested part's absolute bounds and
     placed exactly on it — it carries no text, so the icon stays visible through it — plus a
     `Spec/Dimension` (`side=top`, `kind=size`) above the instance with the part's width and the
     number.
   - **radius** → `Spec/Corner radius` on a free corner, `corner=top-right` preferred. The
     instance _is_ the circle: resize it to `2r × 2r` and place it with its corner on the
     component's matching corner (top-right: `x = right − 2r`, `y = top`). The leader starts on the arc, ends on the near end of the pill (vertically centered), and the label follows by
     constraints. Figma ignores moving or resizing a layer inside an instance, so never try to
     adjust the `Circle` itself.
   - **border width / focus ring** → `Spec/Leader` (`kind=shape`) with the `Dot` on the border
     (or on the ring, for the focus instance; a two-color ring reads `2 + 3px ring`) — its center exactly on the middle of the border
     or ring, so the 3px dot never covers the edge it measures — and the pill outside the
     instance. The radius marker is never shrunk like the dots: its circle always has the radius
     it marks (`2r × 2r`). On the main
     instance it shares the right side with the type leader: put the border dot low on the right
     border and the type dot above the label's center, so the two pills stack with 4px between.
   - **type** → `Spec/Text box` resized to the text node's absolute bounds (its line box: width ×
     font-size × line-height) and placed exactly on it, plus `Spec/Leader` (`kind=type`,
     `side=right` preferred) with the `Dot` on the box's edge on that side, the pill clear of the
     instance's edge by 24px. `side=bottom`: center the leader on the box (`x = box center −
width / 2`), `y = box bottom − 3.5` (2px padding + half the dot), height up to 24px below the
     instance plus the pill (`side=top` mirrored). `Value` is
     `<size> / <weight> / <line-height>` (`16 / 700 / 1.3`).
   - **hit area** → `Spec/Outline` around the hit area.
   - **context-dependent** rows draw the `drawnOption`'s Desktop value; the table carries all modes.
4. Layer order on the stage: the instance, then every padding tint and gap hatch, then all
   other markers — a tint drawn later covers bubbles and labels.
5. Leaders point away from the center; markers should not overlap each other or another
   instance — resolve overlaps per `conventions/measurements.md` → "Overlaps". Sides follow
   the "Placement" table there: widths on top, heights on the left, horizontal padding and row
   gaps below, vertical padding and column gaps on the right, radius on a free corner (top-right
   preferred), leaders on the right when it has space, otherwise any side that has — outside
   that side's dimension lines. When pills collide, walk `conventions/measurements.md` → "Dimension pill placement"
   (`center` → `start`/`end` outward → `callout` → `callout-start`/`callout-end`) — move the
   pill, never the line. A callout's leader sits exactly on the middle of its line (`x = width / 2 − 0.5`
   for a 1px leader, also on even widths) (`ds-button`: padding `end` / `start`, gaps `callout-end` /
   `callout-start`). Swapping the `label` variant resets the instance's `Value` and `Number`:
   set them again right after.

### 3. Sizes table

An auto-layout frame (vertical, `FILL` wide, `HUG` high) of row frames (horizontal, `FILL` wide).
Bind every text fill to `🔗 Alias/🔤 Text/Color/Primary`, and use the documentation text style the
other cards use.

- **Header row**: empty number cell, `Property`, then one cell per entry in `measurements.options`, in
  that order — the code default first, like the component set (`base · sm · lg`) — or the
  component name when `options` is empty.
- **One row per `rows` entry with `show` `drawn` or `table`**, in `rows` order: `Spec/Marker`
  (number from step 2 + kind color),
  the `property`, then one cell per option with the token's last two path segments and px
  (`Size/Base · 48`). The full token name goes into the cell's text node name, so it's visible on
  selection without widening the table.
- **Same value for every option** → one cell spanning the option columns (a single `FILL` text).
  When the token differs per option but the px doesn't (`Size/SM/Gap`, `Size/Base/Gap`, …), write
  the shared part with `*` (`*/Gap · 8`).
- **A row with no token** shows `no token` in place of the token (`no token · 2 + 3`).
- Under the table, one footnote line with what the type cells abbreviate (font family, `size /
weight / line-height`) and the unit (`Values in px.`).
- **Context-dependent** cells list each mode: `M 16 · T 16 · D 24`.
- **Type** rows show size, then weight and line-height: `Size/Base · 16 / 700 / 1.3`.
- Column widths come from the content: the number column is fixed (20), the property column is
  as wide as its longest entry + 12, and the option columns share the rest equally (`FILL`). Equal
  option columns keep the values comparable; a cell only wraps when even that isn't enough —
  then widen only the column that wraps.

### 4. Behavior

Only when `measurements.behavior` exists. One **stretched** instance of the `drawnOption` variant with a
label text under it (the min-content case lives in the drawing):

- 2–3× the default text. For `width: fill`, set the instance to `FILL` inside a frame that is wider
  than its hug width. For `overflow: wrap`, set the instance's label text node to
  `textAutoResize = 'HEIGHT'` and `layoutSizingHorizontal = 'FILL'`, then resize the instance to a
  fixed width below its content width (`220`) and set its height back to `HUG` — without the label
  changes the text is clipped instead of wrapped. For `overflow: truncate`, give it a fixed width
  below its content width so the ellipsis shows (only when the Figma component's text node
  supports truncation; otherwise show `wrap` content and note it in the label).
- Label: `Hug ↔` / `Fill ↔` and `Truncates` / `Wraps`, from `measurements.behavior`. When a prop switches
  the behavior, add it in brackets: `Hug ↔ (wide: Fill)`, `Wraps (no-wrap: Truncates)`.

### 5. Confirm

Iterate on the section with the user in Figma before moving on. Changes to _what_ is shown go back
into `<name>.figma.md`'s `measurements:` (`show`, `reason`), so a re-run produces the same section.

## Output

- The cloned frame's `kind=measurements` `Section` placeholder filled as "📏 Measurements": a drawing card, a
  sizes table and, when the component has behavior rows, a behavior card.

## Completion Criteria

- Every `rows` entry with `show: drawn` has its number on exactly one instance of the drawn card
  (a symmetric padding or a repeated gap may repeat the same number) and one numbered table row;
  nothing with `show: skip` appears.
- Every marker label is number bubble + value; every leader points away from the component center.
- Marker colors and line styles follow `conventions/measurements.md`; no marker overlaps another or the
  instance's content (padding tint, gap hatch and icon overlay excepted). An overlap left after
  every step of "Overlaps" is a line crossing a line only — never covering a pill or its number —
  and was mentioned to the user.
- Every nested `Preview` is `FILL` wide and `HUG` high; nothing is clipped.
- Measurements shows the default set's instances only, never an `…Inverted` set.
- The section has been iterated on and confirmed with the user in Figma.

## Next Phase

None — this is the last phase. Once Measurements is built and confirmed, the documentation frame is
complete and the component is done.
