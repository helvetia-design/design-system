# Todos

- [x] Letter-spacing: now a token — `Alias.Text.LetterSpacing.{Text,Heading}` (0rem), and a `letterSpacing` field on every typography token. Bind the Figma `LetterSpacing` variable instead of using the default.
- [x] Text-decoration: now a token — `Alias.Text.TextDecoration.None`, and a `textDecoration` field on every typography token (Figma variable holds `"NONE"`). Text-transform follows the same pattern (`Alias.Text.TextTransform.None`).
- [] Top-level split onyl when working with inverted. We need to ask the A-Team
- [] Recreate or improvet the review process

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
