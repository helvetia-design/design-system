# Figma attachments: host-positioned nested components

Package: `.claude/skills/ds-code-to-figma` (plus `packages/core`, `.claude/skills/ds-create-component`,
`.claude/skills/ds-lint-component`)

Status: Phase 1 steps 1–2 done (sweep + `@attachment` tags). Steps 3–5 and Phases 2–4 open.

## Goal

A host component's Figma set includes its **attachments**: optional nested components the host
positions out of flow on its own box (e.g. `ds-badge` top-right on `ds-button`, `ds-tab`, `ds-card`).
In Figma the designer toggles an attachment with a boolean and edits its own properties (size, color,
content), while the placement stays owned by the host and always matches code.

Term defined in [`packages/core/CONTEXT.md`](../../packages/core/CONTEXT.md) → "Component
Relationships — Language" → **Attachment**.

## Decisions

| #   | Decision |
| --- | --- |
| 1   | General concept, not badge-only. Any optional nested component the host positions out of flow is an attachment. |
| 2   | Detection: the host's `@attachment` JSDoc tag is the source of truth. Phase 1 also scans the host SCSS (`::slotted(ds-*)` / `ds-*` selectors setting `position: absolute` or `--<x>-position: absolute`) as a cross-check. Any mismatch (tag without style, style without tag) → hard stop. |
| 3   | Format, one line per attachment on the host class JSDoc: `@attachment <tag> <placement> [<prop>=<value> …] - <description>`. Placement ∈ `top-right`, `top-left`, `bottom-right`, `bottom-left`, `top-center` (extend only for a real case). `<prop>=<value>` lists constraints / pre-sets (decisions 8, 9). Stencil keeps the unknown tag in `components.json` `docsTags`. |
| 4   | Only **optional** nested components are attachments (slotted by the consumer, or rendered by the host behind a prop). An always-present nested component at a fixed place stays a plain nested instance. |
| 5   | Figma structure: an **anchor frame** per attachment — a 0×0 frame `<name> anchor`, `layoutPositioning = 'ABSOLUTE'`, constraints pinned to the placement corner, `clipsContent = false`, holding the attachment instance in auto-layout. Alignment mirrors the code transform: edge-pinned (button: badge's top-right edge at the offset) → `MAX`/`MIN`; center-pinned (tab, card: `translate(50%, -50%)`) → `CENTER`/`CENTER`. Used for every attachment, even where a plain constrained instance would do. |
| 6   | Offsets must be tokens in code; a literal offset is a token gap → hard stop (fix in code first). Figma can't bind variables to `x`/`y`, so the anchor's position is set to the **resolved** token value and recorded in the mapping file; Phase 4 checks the numbers. Documented exception: position is token-derived, not token-bound. |
| 7   | Host set properties per attachment: one `show <name>` BOOLEAN (default `false`) bound to the anchor frame's `visible`, plus the attachment instance **exposed** (`isExposedInstance = true`) so its own properties appear on the host instance. No `INSTANCE_SWAP`. Name suffix (`show badge top right`) only when one host has two attachments of the same tag. |
| 8   | Constraints from code (tab only positions `ds-badge size="sm"`) are written in the `@attachment` tag, pre-set on the instance, stated in the host set's component description, and checked by Phase 4. A designer picking another value is an accepted risk (same as `drivenBy`, `conventions/families.md` §3). |
| 9   | Placement chosen by the attachment's own prop (card + `ds-tag position="left|center|right"`) → one attachment per placement value (three `@attachment` lines, three anchors, three booleans), each instance pre-set to its value. Mutual exclusivity is an accepted risk, noted in the description. A placement-only prop (`ds-tag` / `ds-badge` `position`) is **excluded** from the attachment's own Figma set (no visual effect on it). |
| 10  | Attachments are hidden in every documentation section: Copy me, Anatomy and Measurements all keep `show <name> = false`. No anatomy entry, no measurements row. |
| 11  | A missing attachment set in Figma is a hard stop, like any nested component: build the attachment's family first. |
| 12  | Booleans don't add variants: the 500-variant count is unchanged. The Phase 2 proposal still lists every attachment for sign-off. |

## Sweep result (tags added)

| Host | Attachment | Source | Placement / pin | Offset today |
| --- | --- | --- | --- | --- |
| `ds-button` | `ds-badge` | slotted | top-right, edge-pinned outside the corner | literal `-0.5rem` → needs token |
| `ds-tab` | `ds-badge` (`size=sm`) | slotted | top-right of label, Y center-pinned | `--_tabs-tab-badge-size` (token) |
| `ds-card` | `ds-badge` | slotted, first child | top-right, center-pinned on the corner (`translate(50% + gap, -50%)`) | `--_card-gap` (token) |
| `ds-card` | `ds-tag` × 3 (`position=left\|center\|right`) | slotted, first child | top edge, Y center-pinned; X at the padding edge (left/right) or centered | `0` (none) |
| `ds-modal` | `ds-close` | rendered behind `closable` | top-right, inset | `--_modal-p` (token) |
| `ds-drawer` | `ds-close` | rendered behind `closable` | top-right, inset | literal `1rem` → needs token |

Not attachments: `ds-accordion`'s `summary.ds-button.at-end` (CSS-only class, not a nested component),
alert-container toast/snackbar transforms (animations), counter keyframes.

### Open point: host-prop-gated attachments

Modal and drawer render `ds-close` behind the host prop `closable`. Their Figma boolean should be
that host prop (`closable`), not a separate `show close`. The tag grammar has no field for this yet;
today it lives in the description. Decide in Phase 2 of this plan whether to add e.g.
`when=closable` to the grammar.

## Phase 1 — Code sweep (`packages/core`)

1. Scan every component's SCSS with the decision-2 heuristic; list hosts, attachments, placements,
   constraints, offsets. Review the list with the user.
2. Add the `@attachment` lines to each host's `.tsx` class JSDoc.
3. Replace literal offsets with Component tokens (button's `-0.5rem`); run `ds-token-check` on each
   host family to confirm no gap remains.
4. Confirm `@attachment` survives into `components.json` `docsTags` and doesn't break the Storybook
   blocks.
5. Changeset (docs + token, no API change).

Done when: every host from step 1 declares its attachments, and their offsets are tokens.

## Phase 2 — Skill docs (`.claude/skills/ds-code-to-figma`)

1. New `conventions/attachments.md`: definition, detection + cross-check, tag format, anchor frame,
   offsets, properties, constraints, placement-by-prop, hidden in docs. Add it to the
   [`CONVENTIONS.md`](../../.claude/skills/ds-code-to-figma/CONVENTIONS.md) index.
2. `CONVENTIONS.md` glossary: rows **attachment** and **anchor frame** (avoid: anchor, overlay,
   badge slot, positioned slot).
3. `PHASE-1-ANALYZE.md`: parse `@attachment`, run the SCSS cross-check, resolve offset tokens, hard
   stop on mismatch / literal offset / missing attachment set. Print attachments with the family.
4. `PHASE-2-PROPOSE.md`: mapping-table row "Attachment (`@attachment`)" → `show <name>` boolean +
   exposed instance; row for placement-only props → excluded. Proposal lists attachments.
5. `PHASE-3-BUILD.md`: build the anchor frame in the default variant (first-variant checkpoint
   covers it), then in every variant; set the component description for constraints.
6. `PHASE-4-VALIDATE.md`: checks — anchor per attachment per variant, constraints, alignment,
   `x`/`y` = resolved offset, boolean bound + default `false`, instance exposed, pre-sets.
7. `PHASE-6/7/8`: one line each — attachments stay hidden.
8. [`DECISIONS.md`](../../.claude/skills/ds-code-to-figma/DECISIONS.md): new hard stops (tag/style
   mismatch, literal offset, missing attachment set).
9. `examples/mapping-file-format.md`: `attachments:` field — tag, placement, pin (`edge` | `center`),
   offset token + resolved px per size variant, pre-sets, `figmaComponentKey` of the attachment set.
10. `SKILL.md`: prerequisite and validation bullets mention attachments.

## Phase 3 — Other skills

1. `ds-create-component`: document `@attachment` when a new host positions a nested component.
2. `ds-lint-component`: check — SCSS positions a `ds-*` absolutely ⇔ an `@attachment` exists.

## Phase 4 — Proof run

Order: `badge` → `button` (edge-pinned) → `tabs` (center-pinned + `size=sm` constraint) → `tag` →
`card` (multi-placement).

1. Prove once that a 0×0 auto-layout frame centers an overflowing child on both axes and that
   corner constraints hold when the host resizes; record the mechanics in
   `conventions/build-mechanics.md`.
2. Verify in Figma: toggling `show badge`, changing badge size/content on the host instance, and
   resizing the host all keep the placement matching code.
3. Fold findings back into `conventions/attachments.md`.

## Follow-ups (TODO.md, not this plan)

- `ds-badge`'s `position` prop (`card|button|tabs`) is read by no style — remove or wire up.
- `ds-tab` only positions `size="sm"` badges — consider supporting every size in code (would drop
  decision 8's constraint for tab).
