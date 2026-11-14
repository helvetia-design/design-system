# Typography: letter-spacing, text-decoration, text-transform

Package: `packages/tokens` (plus `packages/styles`, `scripts/figma-sync`, `apps/toky`)

Status: Implemented (Phases 1–6), not yet synced to Figma or reviewed — see the verification notes below.

Deviations from the plan as written: `textTransform` is its own third field (added during review), and Toky shows
text-decoration/text-transform primitives as plain text cells validated against the allowed keywords, not as dropdowns.

## Goal

Every `$type: "typography"` token gains three **required** sub-values: `letterSpacing`, `textDecoration`
and `textTransform`. All 44 literal typography tokens get the same defaults (`0`, `none`, `none`). The 32
typography tokens that are whole-value references inherit them.

## Decisions

| # | Decision |
| --- | --- |
| 1 | `letterSpacing` is a DTCG `dimension` in `rem` ([spec](https://www.designtokens.org/tr/2025.10/format/#typography)): `{ "value": 0, "unit": "rem" }`. It is free literal-or-reference, like `fontSize`. |
| 2 | In Figma, a typography token's `letterSpacing` sub-variable is a `STRING` percentage (`"0%"`, `"20%"`), like line-height. A non-zero value is `letterSpacingPx ÷ fontSizePx × 100`, using the same token's resolved **desktop** `fontSize`; pull does the inverse. Exact at desktop only (the font size is responsive). `0` is `"0%"` at every size. |
| 3 | Letter-spacing uses a primitive chain, not an inline literal: `Global.Font.LetterSpacing.0` (`{0, rem}`) plus `Alias.Text.LetterSpacing.Text` and `Alias.Text.LetterSpacing.Heading`, both referencing the Global value. Heading typography tokens reference `Heading`; all others reference `Text`. |
| 4 | `textDecoration` has its own `$type: "textDecoration"`, handled like `fontWeight`: always a reference to a primitive. Allowed values `none \| underline \| line-through` (no overline). Figma `STRING` uses Figma's names: `"NONE"`, `"UNDERLINE"`, `"STRIKETHROUGH"`. |
| 5 | Primitives: `Global.Font.TextDecoration.{None, Underline, LineThrough}`; `Alias.Text.TextDecoration.None` only. Typography tokens reference the Alias `None`. |
| 6 | `textTransform` has its own `$type: "textTransform"`, same pattern. Values `none \| uppercase \| lowercase \| capitalize`; Figma `STRING` `"ORIGINAL" \| "UPPER" \| "LOWER" \| "TITLE"`. Primitives `Global.Font.TextTransform.{None, Uppercase, Lowercase, Capitalize}`; `Alias.Text.TextTransform.None` only. |
| 7 | CSS: three more longhand custom properties per typography token (`…-letter-spacing`, `…-text-decoration`, `…-text-transform`) plus `letter-spacing-*`, `text-decoration-*`, `text-transform-*` utility classes from the Alias tokens. Component SCSS is **not** changed; the defaults equal the browser defaults. |
| 8 | Toky's typography popup edits all three: letter-spacing like `fontSize` (value, unit, reference toggle), text-decoration and text-transform like `fontWeight` (reference picker). |

## Phase 1 — Token data (`packages/tokens/tokens/Base.tokens.json`)

1. Add the primitives from decisions 3, 5 and 6 (Global and Alias layers).
2. Add the three fields to every literal typography token (44): `letterSpacing` → `Heading` for
   `Component.Heading.*`, `Text` for the rest; `textDecoration` and `textTransform` → the Alias `None`.
3. Check `OrangeVacations.tokens.json` for typography overrides that now need the fields.
4. Leave `variableId`s alone; the sync backfills them (Phase 4).

Done when: the token files validate and `pnpm tokens` builds with the old pipeline ignoring the new keys.

## Phase 2 — Build output (`packages/tokens/src`)

1. Register the `textDecoration` and `textTransform` types wherever `fontWeight` is registered
   (`transformers.ts`, `css-value.ts`, the DTCG type checks). Reject values outside the allowed sets.
2. `typographyValueToCss`, `TypographyCssValue`, `TYPOGRAPHY_CSS_SUFFIXES` and `formatter.ts`'s fan-out grow from 4 to 7
   longhands. `letterSpacing` goes through `dimensionValueToCss`.
3. Update `config.base.ts` / `config.brand.ts` where the 4-field shape is assumed.
4. Tests for the transforms and the formatter fan-out; refresh affected build snapshots.

Done when: built CSS contains the 7 longhands for every typography token, and brand CSS is unchanged apart from them.

## Phase 3 — Utility classes (`packages/styles`)

1. `rules/typography.ts` adds `letter-spacing-*`, `text-decoration-*`, `text-transform-*` from the Alias tokens
   (`ds-alias-text-letter-spacing-*` and so on), mirroring the `line-height-*` section.
2. Update the rule list in the file header and in `packages/styles/CONTEXT.md`.

Done when: the classes appear in the generated stylesheet and its tests.

## Phase 4 — Figma sync (`scripts/figma-sync`)

1. `figma-value.mjs`: add the three sub-properties to the typography tables (suffixes, resolved types,
   `STRING` for all three). Add the shared percentage helper and a `letterSpacingPercentFor(token, fontSize)`
   that resolves the desktop `fontSize` from the responsive extension; add the keyword maps to Figma's names.
2. Standalone primitives: letter-spacing primitives stay plain `dimension` → px `FLOAT`; `textDecoration` and
   `textTransform` primitives are `STRING` with the Figma names.
3. **Existing composite variableIds** have 4 keys and now need 7. Teach `assignVariableIds` to fill missing
   sub-properties with temp ids, and `collectNewlyCreatedIds` / `applyVariableIdPatch` to backfill only the new keys.
4. `conflict.mjs`: keep comparing in the Figma shape for the new sub-values.
5. Tests for write payloads, partial-id completion, and the percentage maths (including the font-size dependency).

Done when: a dry run against a sandbox file (`TOKENS_DIR_OVERRIDE`) creates exactly 3 new variables per typography
token, leaves the other 4 untouched, and backfills the new ids.

## Phase 5 — Toky (`apps/toky`)

1. `figma-map.ts` / `figma-pull.ts`: read the three sub-values back (percent → rem against the desktop font size;
   Figma names → CSS keywords), strict like line-height: anything unrecognised is reported as unsupported.
2. Types and validation: add the two new `$type`s and make the three typography fields required (`types.ts`, `validate.ts`).
3. `token-editor.tsx`: extend `TypographyValue`, `isTypographyValue`, the empty value, the summary text and
   `TypographyEditor` (letter-spacing field with reference toggle; two reference pickers).
4. `css-preview.ts`: render the 7 longhands.
5. Tests for each.

Done when: opening a typography token's popup shows and edits all 7 fields, and a pull round-trips with no spurious diff.

## Phase 6 — Docs, skills, release

1. `packages/tokens/CONTEXT.md` glossary and token lists; `docs/ARCHITECTURE.md` if it names the 4 fields.
2. `.claude/skills/ds-code-to-figma` (`TODO.md` currently says "use default" for letter-spacing and text-decoration)
   and `ds-token-lint` references.
3. Storybook token pages that list typography properties.
4. An ADR for the two new types and the desktop-font-size percentage rule.
5. Changeset (minor) for the tokens and styles packages.

## Risks

- **Desktop-only percentage:** a future non-zero letter-spacing is exact only at the desktop font size. Documented in the ADR.
- **Partial composite ids:** the first sync after Phase 1 adds variables to tokens that already have a `variableId`; this is the
  riskiest sync change and gets its own tests plus a sandbox dry run before the real workflow.
- **Required fields:** Toky validation will flag any typography token in a branch that predates this change.
- **Figma bindings:** none are broken (new variables only), unlike the line-height migration.
