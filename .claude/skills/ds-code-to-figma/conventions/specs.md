# Conventions — Specs: what to show and how (Phases 1 and 8)

Which sizes go into the "📐 Specs" section, and how each one is drawn. Phase 1 step 6 uses the
first half (measure, classify, triage) to write `<name>.figma.md`'s `specs:`; Phase 8 uses the
second half (visual vocabulary, layout) to render it. See `../CONVENTIONS.md` for the index.

## Principle

**Specs document what the code decides, not what the layout produces.** A value is worth showing
when a designer has to respect it while building a screen: a fixed size, an inner spacing, a limit,
a behavior. A value that falls out of other values (a height that is just padding + line-height)
is noise, and goes stale the moment one of its inputs changes.

Code and Figma variables already give developers every exact value in Dev Mode. The main reader of
Specs is a designer, so behavior and limits matter more than exhaustive numbers.

**Numbers come from the browser, groups come from the SCSS.** Phase 1 measures every value on the
rendered component (computed styles and box model), so derived and inherited values are exact. It
reads the SCSS only to decide _why_ a value exists — which group it belongs to. Every measured
value is then matched back to its token from Phase 1 step 5.

## 1. Groups

Every measured value falls into exactly one group. The group decides the default proposal; the
user only decides the rows marked "ask".

| Group                 | How to recognize it                                                                                                                          | Examples                                             | Default proposal                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **fixed**             | SCSS sets `width`/`height`/`block-size`/`inline-size`/`border-width`/`border-radius` (or a part's size) to a token                           | icon size, spinner circle size, border width, radius | **show** — drawn marker + table row                                                                               |
| **inner spacing**     | SCSS sets `padding*` or `gap` on the component or one of its parts                                                                           | padding, gap between icon and label                  | **show** — drawn marker + table row                                                                               |
| **limit**             | SCSS sets `min-*`/`max-*`                                                                                                                    | min-height, min-width, max-width                     | **show** — dashed marker + table row, label starts with `Min` / `Max`                                             |
| **behavior**          | Width/height not set by SCSS, measured by stretching (see "Behavior probe")                                                                  | hug vs. fill, truncation, wrapping                   | **show** — behavior demo, never as a number                                                                       |
| **derived**           | Measured, but no SCSS declaration sets it (the box size comes from content + padding)                                                        | button height without min-height, tag width          | **skip** — ask only if it's the one number people would look for (e.g. the real height of a fixed-height control) |
| **outer margin**      | SCSS sets `margin*` on the host or the outermost part                                                                                        | spacing around the component                         | **skip** — report it as a code smell in the triage; margins belong to the layout                                  |
| **hit area**          | The interactive area is bigger than the visible box (pseudo-element, padding on a transparent wrapper) — or is below 24 × 24 px (WCAG 2.5.8) | icon button with a 24px hit area around a 16px glyph | **show** only when it differs from the visible box — dashed outline; **ask** when it is below 24 × 24 px          |
| **context-dependent** | Token differs per `device:` mode (Phase 1 step 5a) or per theme                                                                              | responsive padding, logo height                      | **show** — one table cell per mode (`M / T / D`); **ask** whether an extra drawn card is worth it                 |
| **typography**        | Every text part                                                                                                                              | label font size, weight, line-height                 | **show** — table row; a numbered marker on the drawn card                                                         |

Rules that apply on top of the groups:

- **No radius on a circle or pill.** Skip the radius row when the radius is at least half of the
  component's height (and width, if smaller), e.g. `9999` or `50%`. The shape says it all.
- **States don't get specs.** Hover/active/disabled change color, not geometry. The one exception
  is the focus ring: show its width once, on an extra `focus` instance, as a `shape` row.
- **Every shown row is drawn.** `show: table` is only for a value that has no place on any instance
  (rare — say why in `reason`). A table row without a marker confuses more than it helps.
- **Only the default set.** An `inverted` split changes colors, never geometry.
- **Symmetric padding is one row.** `Padding X` when left = right; `Padding L` / `Padding R` as two
  rows when they differ. Never mix an axis label with a side label on one component.
- **Measured ≠ token is a finding, not a value.** When the measured px doesn't match the resolved
  token's px, flag the row in the triage (code drift or wrong token) — never silently pick one.

## 2. Kinds and visual vocabulary

Two independent channels: **color says what kind of value it is, line style says what type of
value it is.** Never encode meaning in color alone — every marker also has a number and a label.

**Kind → color** (literal documentation colors, not tokens; one color per kind, even when a card
has several rows of it):

| Kind      | Covers                                        | Color   |
| --------- | --------------------------------------------- | ------- |
| `size`    | width, height, icon/glyph size (incl. limits) | green   |
| `spacing` | padding, gap                                  | magenta |
| `shape`   | radius, border width, focus ring              | blue    |
| `type`    | font size/weight/line-height                  | purple  |

**What → marker** (component names in `../PHASE-8-DOCUMENT-SPECS.md` step 0):

| What                     | Marker                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| width / height           | dimension line with end ticks, outside the component — solid for a fixed value, dashed for `Min` / `Max` |
| padding                  | 20% tint on every side the token applies to **plus** a `spacing` dimension line below each tinted side   |
| gap                      | hatched overlay between the two children **plus** a `spacing` dimension line below each gap              |
| icon / glyph size        | overlay box exactly on the nested part, plus a width line above the component                            |
| radius                   | circle with the radius's own size, sitting in the corner; leader diagonally outward                      |
| border width, focus ring | leader: dot on the edge or ring, line outward, pill with the value                                       |
| typography               | leader: dot on the text, line outward, pill with size / weight / line-height                             |
| hit area                 | dashed orange outline around the hit area (its own color, not a kind)                                    |
| behavior                 | no line — text label (`Hug ↔`, `Fill ↔`, `Truncates`, `Wraps`)                                           |

**Labels**: every marker label is the **value** (`48px`, `min 48px`, `4px`) followed by a number
bubble in the kind color. The bubble's number is the row's number in the Sizes table — never put
the number into the value text.

**Leaders point away from the center.** A marker starts at the measured spot and its line runs
outward, away from the component's center: corner markers diagonally out of their corner, leaders
horizontally to the side the target is on (or to the side with free space when the target is
centered). A leader never crosses the component towards its center.

**Placement**: dimension lines sit **outside** the component — widths on top, heights on the left,
padding and gap below. Radius goes on the top-right corner (the left side carries the height line),
leaders to the right. Never draw on top of content except the padding tint, the gap hatch and the
icon overlay. When two markers on the same side collide, offset the second by its own height + 4px.

## 3. Section layout

The Specs `Section` (`Flat`) holds up to three nested `Default` `Preview`s, in this order:

1. **Drawn spec** — **every numbered table row is drawn here exactly once.** One **main** instance
   of the default Variants-axis option (`base`, or the implicit default), default state, every
   optional part on. Add an **extra** instance only for a row that can't be drawn on the main one
   — a limit that only binds with other content (`min width` on a short label), or a value that
   only exists in a state (the focus ring on `focus`). An extra instance may also take a marker
   that doesn't fit on the main instance (`ds-button`: the border width on the short-label
   instance). Extra instances sit in a row below the main one, each with a one-word caption
   (`Min content`, `Focus`) and only its own markers. Never one instance per Variants-axis option —
   the table compares options; the only exception is an option that changes the structure (other
   parts or layout), not just values.
2. **Sizes table** — rows = properties, columns = the Variants-axis options in canonical order
   (`base · sm · md · lg`). Each cell shows the token's short name and px (`Gap/XS · 8`). A row whose
   value is the same for every option shows it once, spanning the columns. Rows are grouped by kind
   in the order `size → spacing → shape → type`, each row starting with its number bubble. Numbers
   run 1, 2, 3, … top to bottom. Context-dependent cells list one value per mode
   (`M 16 · T 16 · D 24`).
3. **Behavior** — only when the component has a `behavior` row: one **stretched** instance (long
   content, fixed width below its content width) labelled with its behavior (`Hug ↔` / `Fill ↔`,
   `Wraps` / `Truncates`; a prop that switches it goes in brackets: `Hug ↔ (wide: Fill)`). The
   min-content case lives in the drawn spec. Skip this card for components whose size never changes
   with content or container (icon, spinner, close).

A component with no Variants axis has one column in the table, headed with its name.

## 4. Behavior probe (Phase 1)

Run on a clone of the default instance in a test wrapper, so the page under test isn't changed:

1. Wrapper `600px` wide → measured width `≈ 600` means **fill**, smaller means **hug**.
2. Wrapper `0px` wide → the measured width is the effective **min width** (compare against the
   `min-width` token; a mismatch is a finding).
3. Long content (2–3× the default text, via the prop or slot that carries text) in a `160px`
   wrapper → `scrollWidth > clientWidth` on the text part with `text-overflow: ellipsis` means
   **truncates**; a taller box means **wraps**; neither means it **overflows** (flag it).

Only the outcome goes into `specs:` (`width: hug`, `overflow: truncate`); the probe's raw numbers
don't.
