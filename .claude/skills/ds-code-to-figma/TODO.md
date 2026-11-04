# Todos

- [x] Letter-spacing: now a token — `Alias.Text.LetterSpacing.{Text,Heading}` (0rem), and a `letterSpacing` field on every typography token. Bind the Figma `LetterSpacing` variable instead of using the default.
- [x] Text-decoration: now a token — `Alias.Text.TextDecoration.None`, and a `textDecoration` field on every typography token (Figma variable holds `"NONE"`). Text-transform follows the same pattern (`Alias.Text.TextTransform.None`).
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

Still open

Run the sync in dry-run first. Use TOKENS_DIR_OVERRIDE against a sandbox file. Two paths are only tested with fixtures: the partial-id completion on existing typography tokens, and Pass 0 from the line-height work.
Text-decoration and text-transform primitives in Toky are plain text cells, validated against the allowed keywords rather than dropdowns. A Select would be a small follow-up.
Not done: Storybook pages that list typography properties, and component SCSS adoption (deliberately out of scope).
Pulling a letter-spacing change from Figma is reported as unsupported, not written, because a percentage can't be mapped back to a reference without guessing.
Two files I didn't touch showed up in the working tree: packages/tokens/docs/adr/0006-figma-breakpoint-display-order.md (untracked) and packages/tokens/docs/figma-token-sync-plugin-plan.md (modified). They look like they come from another session, so check them before committing.
