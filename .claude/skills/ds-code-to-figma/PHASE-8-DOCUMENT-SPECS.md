# Phase 8 — Document: Specs

## Objective

Fill in the last section of the `Documentation` column: "📐 Specs". It renders the specs
triage confirmed in Phase 1 step 6 — no new analysis happens here.

Build this right after Anatomy (or right after Copy me, if the Anatomy placeholder was deleted). This
is the last phase of the skill.

## Inputs

- "🏗️ Anatomy" (or "👉 Copy me", if the Anatomy placeholder was deleted), built and confirmed in
  [`PHASE-7-DOCUMENT-ANATOMY.md`](PHASE-7-DOCUMENT-ANATOMY.md).
- `<name>.figma.md`'s `specs:` (`drawnOption`, `options`, `behavior`, `rows`) — the confirmed
  triage from Phase 1 step 6. **If `specs:` still uses the old flat per-option list** (`base:` /
  `sm:` lists of `{ kind, label, px, token }`), re-run Phase 1 step 6 for this component first.

## References

- `conventions/specs.md` — kinds, colors, line styles, placement, section layout. The source of
  truth for how every row looks.
- `conventions/document-sections.md` — `Section` / `Preview` mechanics and "Sizing".
- `conventions/build-mechanics.md` — especially "Color and paint".
- `🧰 Annotations` page, node `2046:5` — the `Spec/*` annotation components.

## Instructions

### 0. Check the annotation components

Find these on the `🧰 Annotations` page by name (node ids are hints only). **Any one missing is a
🛑 hard stop**: list what's missing and ask the user to add it to the page — never draw a one-off
marker by hand instead.

| Component            | Needs                                                                                                                                                 | Used for                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `Spec/Dimension`     | (`2046:36`) `side` (`top`/`bottom`/`left`/`right`) × `kind` (`size`/`spacing`/`shape`) × `style` (`solid`/`dashed`), `Value`, `Number`, `Show number` | widths, heights, padding, gap, limits |
| `Spec/Inset`         | (`2046:37`) `spacing` tint, stretches in both axes                                                                                                    | padding tint                          |
| `Spec/Gap`           | (`3064:1397`) hatched `spacing` fill, stretches in both axes                                                                                          | gap hatch                             |
| `Spec/Icon size`     | (`3282:1362`) overlay box, `Value`, `Number`, `Show number`                                                                                           | icon / glyph size                     |
| `Spec/Corner radius` | (`3282:1361`) `corner` (`top-right`/`top-left`/`bottom-right`/`bottom-left`), resize = circle size, `Value`, `Number`, `Show number`                  | radius                                |
| `Spec/Leader`        | (`3282:1424`) `kind` × `side` (`right`/`left`), `Value`, `Number`, `Show number`                                                                      | type, border width, focus ring        |
| `Spec/Outline`       | (`2046:38`) dashed orange outline, stretches in both axes                                                                                             | hit area                              |
| `Spec/Marker`        | (`3064:1541`) `kind` (`size`/`spacing`/`shape`/`type`), `Number`                                                                                      | table row numbers                     |

`Value` is the value only (`48px`, `min 48px`, `4px`); the row number goes into `Number` with
`Show number` on (`Spec/Dimension` defaults to off, so older frames don't change). Legacy, don't
use for new Specs: `Spec/Dimension` `kind=icon`, `Spec/Radius`, `Spec/Legend item`, `Spec/Callout`.

### 1. Structure

Fill the `Section` placeholder whose `Title` is `kind=specs` (`Flat`; 🛑 hard stop if missing) —
don't create a new one. Inside its slot, stack up to three nested `Default` `Preview`s, in the
order from `conventions/specs.md` → "Section layout": **Drawn spec**, **Sizes table**,
**Behavior** (only when `specs.behavior` exists).

Every nested `Preview` gets `layoutSizingHorizontal = 'FILL'` after it's appended, and ends up
`layoutSizingVertical = 'HUG'` (see "Sizing" in `conventions/document-sections.md`). Content you
put into a `Preview` slot is an auto-layout frame that is `FILL` wide and `HUG` high — never a
literal width: a frame wider than the slot gets centered and clips its left edge. The one fixed
height is the drawn spec's `stage`, which is calculated (step 2). Each card has a
short title text (`Drawn spec — base`, `Sizes`, `Behavior`) bound to
`🔗 Alias/🔤 Text/Color/Primary` (`VariableID:137:288`), per `conventions/build-mechanics.md` →
"Color and paint".

Use the default set's instances only, never an `…Inverted` set — an inverted split changes
colors, not geometry, so its numbers would only repeat.

**Family** (`conventions/families.md` §6): Specs is built once, on the owner, from the owner's
`specs:` — which holds every member's rows, each with `set:`. The drawn spec uses the owner's
default instance; contained sub-component rows are drawn on the sub-component instances inside it.
Rows with `show: table` from a wrapping sub-component appear only in the Sizes table. In the
table, prefix each sub-component row's property with its set name (`Tab · Padding X`).

### 2. Drawn spec

1. A `stage` frame (no auto-layout, so markers can sit at calculated positions). Row 1: the
   **main** instance — the default set's `drawnOption` variant in its default state, with the
   same content as Copy me — centered. Row 2: one **extra** instance per distinct `instance` value
   in `specs.rows` (`min-content`: shortest realistic label, e.g. `OK`; `focus`: the `focus` state),
   side by side with 120px between them, each with a caption under it (`Min content`, `Focus`).
   Leave enough room around each instance for its markers and resize the stage to fit everything,
   so nothing is clipped.
2. Number every shown row in `specs.rows` order (`size → spacing → shape → type`): the Sizes table
   reads 1, 2, 3, … top to bottom, and every number appears exactly once on the drawing.
3. Place each row's marker on its `instance`, per `conventions/specs.md` → "Kinds and visual
   vocabulary". Every marker gets `Value` = the value and `Number` = the row number:
   - **width / height** → `Spec/Dimension` outside the instance (`side=top` for widths,
     `side=left` for heights), `style=dashed` and `Value` `min 48px` for `Min`/`Max` rows.
   - **padding** → `Spec/Inset` on every side the token applies to, plus a `Spec/Dimension`
     (`side=bottom`, `kind=spacing`) under each tinted side. The padding starts inside the border
     (CSS `border-box`): offset both by the border width (`ds-button`: 2px border → `x = 2` and
     `width − 26`).
   - **gap** → `Spec/Gap` over each gap the token applies to, plus a `Spec/Dimension`
     (`side=bottom`, `kind=spacing`) under each one. Gap labels usually collide with the padding
     labels: put the gap dimensions one row lower (step 4).
   - **icon / glyph size** → `Spec/Icon size` (`Show number` off) resized to the nested part's
     absolute bounds and placed exactly on it, plus a `Spec/Dimension` (`side=top`, `kind=size`)
     above the instance with the part's width — the number bubble inside the instance would sit
     on the padding tint and the label.
   - **radius** → `Spec/Corner radius` `corner=top-right`. The instance _is_ the circle: resize it
     to `2r × 2r` and place it with its top-right corner on the component's top-right corner
     (`x = right − 2r`, `y = top`). The leader starts on the arc and the label follows by
     constraints. Figma ignores moving or resizing a layer inside an instance, so never try to
     adjust the `Circle` itself.
   - **border width / focus ring** → `Spec/Leader` (`kind=shape`) with the `Dot` on the border
     (or on the ring, for the focus instance) and the pill outside the instance.
   - **type** → `Spec/Leader` (`kind=type`, `side=right`) with the `Dot` on the text part's right
     end (vertically centered), the pill clear of the instance's right edge by 24px. `Value` is
     `<size> / <weight> / <line-height>` (`16 / 700 / 1.3`).
   - **hit area** → `Spec/Outline` around the hit area.
   - **context-dependent** rows draw the `drawnOption`'s Desktop value; the table carries all modes.
4. Layer order on the stage: the instance, then every padding tint and gap hatch, then all
   other markers — a tint drawn later covers bubbles and labels.
5. Leaders point away from the center; markers never overlap each other or another instance:
   widths on top, heights on the left, padding and gap below, radius on the top-right, leaders to
   the right. When two markers on the same side collide, offset the second by its own height + 4px.

### 3. Sizes table

An auto-layout frame (vertical, `FILL` wide, `HUG` high) of row frames (horizontal, `FILL` wide).
Bind every text fill to `🔗 Alias/🔤 Text/Color/Primary`, and use the documentation text style the
other cards use.

- **Header row**: empty number cell, `Property`, then one cell per entry in `specs.options` (or the
  component name when `options` is empty).
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
- Option cells share the remaining width equally (`FILL`) and wrap text; the number and property
  columns are fixed widths.

### 4. Behavior

Only when `specs.behavior` exists. One **stretched** instance of the `drawnOption` variant with a
label text under it (the min-content case lives in the drawn spec):

- 2–3× the default text. For `width: fill`, set the instance to `FILL` inside a frame that is wider
  than its hug width. For `overflow: wrap`, set the instance's label text node to
  `textAutoResize = 'HEIGHT'` and `layoutSizingHorizontal = 'FILL'`, then resize the instance to a
  fixed width below its content width (`220`) and set its height back to `HUG` — without the label
  changes the text is clipped instead of wrapped. For `overflow: truncate`, give it a fixed width
  below its content width so the ellipsis shows (only when the Figma component's text node
  supports truncation; otherwise show `wrap` content and note it in the label).
- Label: `Hug ↔` / `Fill ↔` and `Truncates` / `Wraps`, from `specs.behavior`. When a prop switches
  the behavior, add it in brackets: `Hug ↔ (wide: Fill)`, `Wraps (no-wrap: Truncates)`.

### 5. Confirm

Iterate on the section with the user in Figma before moving on. Changes to _what_ is shown go back
into `<name>.figma.md`'s `specs:` (`show`, `reason`), so a re-run produces the same section.

## Output

- The cloned frame's `kind=specs` `Section` placeholder filled as "📐 Specs": a drawn spec card, a
  sizes table and, when the component has behavior rows, a behavior card.

## Completion Criteria

- Every `rows` entry with `show: drawn` has its number on exactly one instance of the drawn card
  (a symmetric padding or a repeated gap may repeat the same number) and one numbered table row;
  nothing with `show: skip` appears.
- Every marker label is value + number bubble; every leader points away from the component center.
- Marker colors and line styles follow `conventions/specs.md`; no marker overlaps another or the
  instance's content (padding tint, gap hatch and icon overlay excepted).
- Every nested `Preview` is `FILL` wide and `HUG` high; nothing is clipped.
- Specs shows the default set's instances only, never an `…Inverted` set.
- The section has been iterated on and confirmed with the user in Figma.

## Next Phase

None — this is the last phase. Once Specs is built and confirmed, the documentation frame is
complete and the component is done.
