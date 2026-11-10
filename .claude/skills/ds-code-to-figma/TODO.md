# Todos

- [x] Letter-spacing: now a token — `Alias.Text.LetterSpacing.{Text,Heading}` (0rem), and a `letterSpacing` field on every typography token. Bind the Figma `LetterSpacing` variable instead of using the default.
- [x] Text-decoration: now a token — `Alias.Text.TextDecoration.None`, and a `textDecoration` field on every typography token (Figma variable holds `"NONE"`). Text-transform follows the same pattern (`Alias.Text.TextTransform.None`).
- [] Top-level split onyl when working with inverted. We need to ask the A-Team
- [] Phase 2 table conflict, found in the `ds-button` run (04.11.2026): the row "Enum, options need different layers/structure" uses button `type` (primary / ghost / link) as its example of a top-level split, but in code all `ds-button` colors re-skin the same layers, so the deciding test ("same layers, different token → variant") says variant. For button we went with a `color` variant. Decide which wins and fix the example; ties into the inverted-split question above.
- [x] Copy me content (05.11.2026): Phase 6 now places the plain default variant with no overrides (no more "✓ Button ✓"). The button's Copy me in Figma still has both icons on until its next run.
- [] Anatomy with mutually exclusive parts, found in the `ds-button` run (04.11.2026): `loading` shows the spinner and hides both icons, so no single instance shows every part. The user approved two instances in `diagram-area` (default with icons + loading). Phase 5 currently says one instance; decide whether to add this as a rule.
- [] Recreate or improvet the review process (when too many, inverted, strukturell stark verändert)
- [] fix anatomy markers and legends
- [x] Measurements rework (04.11.2026): Phase 1 step 6 measures sizes on the dev server and triages them (`conventions/measurements.md`); Phase 6 renders a drawn spec, a sizes table and a behavior card. The `ds-tag`/`ds-spinner` review rules (no radius on pills, padding both sides, one color per kind, cards hug, long token names) are folded in. Typography uses a numbered marker + table row instead of the `Spec/Callout` geometry; `icon` merged into `size`, `radius` renamed `shape`.
- [x] Annotation library for the new Measurements (04.11.2026): `Spec/Dimension` got `style=solid|dashed` and `kind=shape` (32 variants); new `Spec/Gap` (hatched) and `Spec/Marker` (numbered, per kind). `Spec/Radius` (blue) and `Spec/Outline` (dashed) already fit. Legacy, kept for existing frames: `Spec/Dimension` `kind=icon`, `Spec/Legend item`, `Spec/Callout` — delete once no documentation frame uses them.
- [x] Re-triage `button.figma.md` measurements (05.11.2026): first full run of the new Measurements flow; findings folded into Phase 6 (numbering, border offset, type marker position, wrap demo, table footnote).
- [x] Measurements markers v2 (05.11.2026, from the `ds-button` review against TapTap): radius circle sized to the radius in the corner (`Spec/Corner radius`), labels = value + number bubble, leaders point away from the center, padding/gap get dimension lines, every table row is drawn (extra `min-content` / `focus` instances), type/border/focus use `Spec/Leader`, icons get `Spec/Icon size` overlays. Legacy now also: `Spec/Radius`.
- [x] Measurements markers v3 (05.11.2026, second `ds-button` review): "Specs" renamed to "Measurements" (Figma `Title` `kind=measurements`, `measurements:` key, `conventions/measurements.md`, Phase 8 file); one pill label style for every marker; dashed `Spec/Dimension` lines rebuilt as 1px one-side-dashed rectangles (were off-center between the ticks); `drawnColor` (first color option whose border ≠ fill — `secondary` for the button); padding tints inset by the border with `radius − border` corners; limits only shown when they bind (button min width skipped); option columns code default first. `Spec/*` component names kept.
- [x] Measurements markers v4 (05.11.2026): soft pills (tint + outline, dark value text for AA — kind color table in `conventions/measurements.md`); gaps measured from the tick ends; `Spec/Dimension` `label` variants (`center`/`start`/`end`/`callout`/`callout-start`/`callout-end`, 92 variants) and the pill-placement order; button padding pills shifted outward, gap pills on callouts.
- [x] Measurements v5 (05.11.2026): card renamed "Drawing"; type row named `Text (<part>)`; new `Spec/Text box` (dashed outline on the text's line box, type leader starts on it); leader dots 3px without outline, centered on their edge; callout leaders exactly centered; table columns sized from content (no wrapping).
- [x] Measurements v6 (05.11.2026): bubble numbers centered (fixed circle, cap-height trim); `Spec/Icon size` text-free (25% fill + outline); focus ring pill `2 + 3px ring`; rules for callouts-as-exception, units (pills yes, table no), and no fill on shape markers.
- [x] Measurements v7 (06.11.2026): template Measurements placeholder rebuilt with the new layout (both copies); general "Overlaps" rule with a fallback order; "Placement" table covers vertical padding and column gaps (`side=right`), radius on a free corner, leaders on any side with space (right preferred).
- [x] `Spec/Leader` `side=top` / `bottom` (06.11.2026): 8 vertical variants (line + pill beyond the end, height = length). The template's type marker now goes below the component, so nothing crosses the pill-shaped radius ring.
- [x] `ds-close` documentation (06.11.2026): Copy me, Anatomy and Measurements built; new `drawnState` field ("Shape visibility": transparent default → drawn in `hover`).
- [x] `ds-close` focus variants (06.11.2026): rebuilt like `ds-button` — own size, 2px `Focus/Color/Border` + 3px focus color outside. Phase 4 missed it (snapshots don't show focus); consider a Phase 4 check comparing the focus ring with the `focus-shadow` mixin.
- [] Families (09.11.2026, `conventions/families.md`, ADR-0036): first run on `ds-tabs` to prove the flow (native `SLOT` + preferred instances, `drivenBy` pre-set, inverted mirror). Then regenerate `card` (sub-components missing) and `button` (`ButtonGroup` missing) — no migration.
- [] Re-triage `spinner.figma.md` measurements (still the old flat per-option list) on its next run.
- [] Build vs. clone review (do together with the Measurements rework). Go through all phases and `conventions/*` and list every spot where the skill builds something from scratch that already exists in the template or on `🧰 Annotations` (e.g. Measurements cards, `Spec/*` annotations, Copy me content, the "🖼️ names" section for asset components). For each: would cloning a prototype and changing only text and positions be simpler and keep the look in one place? Keep in the skill only what can't be cloned (calculated positions and sizes, per-component counts, text formatting that resets on text change).

# Components to test

| Status | Component    | Category   | Nested                                | Gap | Figma |
| ------ | ------------ | ---------- | ------------------------------------- | --- | ----- |
| ⬜     | Icon         | Media      | -                                     | ✅  | ⬜    |
| ⬜     | Brand Icon   | Media      | -                                     | ✅  | ⬜    |
| ⬜     | Logo         | Media      | -                                     | ✅  | ⬜    |
| ⛔     | Shape        | Media      | -                                     | ⛔  | ⛔    |
| ⬜     | Spinner      | Indicators | -                                     | ✅  | ⬜    |
| ⬜     | Progress Bar | Indicators | -                                     | ✅  | ⬜    |
| ⬜     | Label        | Forms      | -                                     | ✅  | ⬜    |
| ⬜     | Input        | Forms      | -                                     | ✅  | ⬜    |
| ⬜     | Textarea     | Forms      | -                                     | ⬜  | ⬜    |
| ⬜     | Toggle       | Forms      | -                                     | ⬜  | ⬜    |
| ⬜     | Radio        | Forms      | -                                     | ⬜  | ⬜    |
| ⬜     | Checkbox     | Forms      | -                                     | ⬜  | ⬜    |
| ⬜     | Slider       | Forms      | -                                     | ⬜  | ⬜    |
| ⬜     | Select       | Forms      | -                                     | ⬜  | ⬜    |
| ⬜     | Number Input | Forms      | -                                     | ⬜  | ⬜    |
| ⬜     | Phone Input  | Forms      | -                                     | ⬜  | ⬜    |
| ⬜     | Steps        | Navigation | -                                     | ⬜  | ⬜    |
| ⬜     | Tooltip      | Overlays   | -                                     | ⬜  | ⬜    |
| ⬜     | Sheet        | Overlays   | -                                     | ⬜  | ⬜    |
| ⬜     | Divider      | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | Text         | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | Heading      | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | Stack        | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | Content      | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | Data         | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | List         | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | Root         | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | Card         | Structure  | -                                     | ⬜  | ⬜    |
| ⬜     | Button       | Actions    | Brand Icon, Icon, Spinner             | ⬜  | ⬜    |
| ⬜     | Badge        | Indicators | Icon                                  | ✅  | ⬜    |
| ⬜     | Segment      | Forms      | Icon                                  | ⬜  | ⬜    |
| ⬜     | Datepicker   | Forms      | Icon                                  | ⬜  | ⬜    |
| ⬜     | App Navbar   | Navigation | Icon                                  | ⬜  | ⬜    |
| ⬜     | Tabs         | Navigation | Icon                                  | ⬜  | ⬜    |
| ⬜     | Accordion    | Structure  | Icon                                  | ⬜  | ⬜    |
| ⬜     | App Footer   | Structure  | Divider, Icon, Logo                   | ⬜  | ⬜    |
| ⬜     | Close        | Actions    | Button                                | ✅  | ⬜    |
| ⬜     | Counter      | Forms      | Button                                | ⬜  | ⬜    |
| ⬜     | File Upload  | Forms      | Button, Content, Icon, Spinner, Stack | ⬜  | ⬜    |
| ⬜     | Pagination   | Navigation | Icon, Button                          | ⬜  | ⬜    |
| ⬜     | Modal        | Overlays   | Close                                 | ⬜  | ⬜    |
| ⬜     | Drawer       | Overlays   | Close                                 | ⬜  | ⬜    |
| ⬜     | Popup        | Overlays   | Close                                 | ⬜  | ⬜    |
| ⬜     | Notification | Overlays   | Close                                 | ⬜  | ⬜    |
| ⬜     | Tag          | Indicators | Close                                 | ⬜  | ⬜    |
| ⬜     | Toast        | Overlays   | Button, Close, Icon                   | ⬜  | ⬜    |
| ⬜     | Snackbar     | Overlays   | Brand Icon, Button, Close, Icon       | ⬜  | ⬜    |
| ⬜     | Carousel     | Structure  | Icon, Pagination                      | ⬜  | ⬜    |
| ⬜     | Hint         | Indicators | Icon, Button, Close, Drawer, Popup    | ⬜  | ⬜    |
| ⬜     | Alert        | Overlays   | Snackbar, Toast                       | ⬜  | ⬜    |
