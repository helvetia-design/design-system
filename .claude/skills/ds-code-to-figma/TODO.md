# Todos

- [x] Letter-spacing: now a token — `Alias.Text.LetterSpacing.{Text,Heading}` (0rem), and a `letterSpacing` field on every typography token. Bind the Figma `LetterSpacing` variable instead of using the default.
- [x] Text-decoration: now a token — `Alias.Text.TextDecoration.None`, and a `textDecoration` field on every typography token (Figma variable holds `"NONE"`). Text-transform follows the same pattern (`Alias.Text.TextTransform.None`).
- [] Top-level split onyl when working with inverted. We need to ask the A-Team
- [] Phase 2 table conflict, found in the `ds-button` run (04.11.2026): the row "Enum, options need different layers/structure" uses button `type` (primary / ghost / link) as its example of a top-level split, but in code all `ds-button` colors re-skin the same layers, so the deciding test ("same layers, different token → variant") says variant. For button we went with a `color` variant. Decide which wins and fix the example; ties into the inverted-split question above.
- [x] Copy me content (05.11.2026): Phase 6 now places the plain default variant with no overrides (no more "✓ Button ✓"). The button's Copy me in Figma still has both icons on until its next run.
- [] Anatomy with mutually exclusive parts, found in the `ds-button` run (04.11.2026): `loading` shows the spinner and hides both icons, so no single instance shows every part. The user approved two instances in `diagram-area` (default with icons + loading). Phase 5 currently says one instance; decide whether to add this as a rule.
- [] Recreate or improvet the review process (when too many, inverted, strukturell stark verändert)
- [] fix anatomy markers and legends
- [x] Specs rework (04.11.2026): Phase 1 step 6 measures sizes on the dev server and triages them (`conventions/specs.md`); Phase 6 renders a drawn spec, a sizes table and a behavior card. The `ds-tag`/`ds-spinner` review rules (no radius on pills, padding both sides, one color per kind, cards hug, long token names) are folded in. Typography uses a numbered marker + table row instead of the `Spec/Callout` geometry; `icon` merged into `size`, `radius` renamed `shape`.
- [x] Annotation library for the new Specs (04.11.2026): `Spec/Dimension` got `style=solid|dashed` and `kind=shape` (32 variants); new `Spec/Gap` (hatched) and `Spec/Marker` (numbered, per kind). `Spec/Radius` (blue) and `Spec/Outline` (dashed) already fit. Legacy, kept for existing frames: `Spec/Dimension` `kind=icon`, `Spec/Legend item`, `Spec/Callout` — delete once no documentation frame uses them.
- [x] Re-triage `button.figma.md` specs (05.11.2026): first full run of the new Specs flow; findings folded into Phase 6 (numbering, border offset, type marker position, wrap demo, table footnote).
- [x] Specs markers v2 (05.11.2026, from the `ds-button` review against TapTap): radius circle sized to the radius in the corner (`Spec/Corner radius`), labels = value + number bubble, leaders point away from the center, padding/gap get dimension lines, every table row is drawn (extra `min-content` / `focus` instances), type/border/focus use `Spec/Leader`, icons get `Spec/Icon size` overlays. Legacy now also: `Spec/Radius`.
- [] Families (09.11.2026, `conventions/families.md`, ADR-0036): first run on `ds-tabs` to prove the flow (native `SLOT` + preferred instances, `drivenBy` pre-set, inverted mirror). Then regenerate `card` (sub-components missing) and `button` (`ButtonGroup` missing) — no migration.
- [] Re-triage `spinner.figma.md` specs (still the old flat per-option list) on its next run.
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
