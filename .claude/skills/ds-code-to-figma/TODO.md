# Todos

- [] Letter-spacing: Base.tokens.json has no letter-spacing token. Either accept Figma's default of 0%, or pick a different token. => use default
- [] Text-decoration: There is no decoration token. The label uses no decoration, so I'd accept "none" as a one-off. I need you to confirm that. use default
- [] Top-level split onyl when working with inverted. We need to ask the A-Team
- [] Recreate or improvet the review process
- [] fix anatomy markers and legends
- [] Specs rework. Decide first: clone the template's `spec-<size>` cards (like Phase 3 and Anatomy) or keep building them. Rules from the `ds-tag` review (2026-10-29, checked against TapTap's Tag specs) to carry over:
  - No radius on a circle or pill: skip marker and legend row when the radius is at least half the component's height (and width, if smaller), e.g. `9999`. The `Spec/Radius` dot would float off the curved edge.
  - Padding on both sides gets a highlight on both sides: a symmetric token gets `Spec/Inset` top **and** bottom (or left **and** right), one `Spec/Dimension` marker. Different sides get one marker and legend row each, labelled `Padding L` / `Padding R`, never mixed with an axis label (`Padding X`).
  - One fixed colour per `kind`: `size` green, `icon` orange, `spacing` magenta, `radius` blue, `type` purple, even with several rows of a kind. Don't adopt TapTap's orange dashed `Interval` marker.
  - Every text part gets a `Spec/Callout` (`🧰 Annotations`, node `2157:2`) and a `kind=type` legend row (`Spec/Legend item`, node `2154:776`). Centre the callout on the text, pill fully above the component (8px clear), ring bottom on the top of the glyphs: text box top + `(lineHeight − 1) × fontSize ÷ 2`. Keep spacing markers below the component. Legend row: `Value` = font size, `Label` = `Type`, `Token` = font-size token plus weight/family/line-height, abbreviated with `…/`.
- [] Build vs. clone review (do together with the Specs rework). Go through all phases and `conventions/*` and list every spot where the skill builds something from scratch that already exists in the template or on `🧰 Annotations` (e.g. Specs cards, `Spec/*` annotations, Copy me content, the "🖼️ names" section for asset components). For each: would cloning a prototype and changing only text and positions be simpler and keep the look in one place? Keep in the skill only what can't be cloned (calculated positions and sizes, per-component counts, text formatting that resets on text change).

# Components to test

- spinner
- close
- logo (responsive)
- button (variants + nested)
- pagination (top layer split)
- input
- card
