# Decision path — every stop-and-wait point in this skill

A single index of every place this skill must pause for a human decision, across all nine phases.
Check this file when you're unsure whether you're at a checkpoint — it exists so that doesn't
require re-reading full phase prose to confirm.

Two kinds of pause, treated differently:

- 🟡 **Checkpoint** — present something and wait for explicit approval/choice before continuing.
  Never assume approval and keep going.
- 🛑 **Hard stop** — something is missing or ambiguous that this skill must never guess, invent,
  or silently work around. Report it and ask; don't continue until resolved.

## Phase 1 — Analyze

- 🟡 **Anatomy review** (step 2): print the extracted `@part` list (letter, part name,
  description) in the conversation before writing anything to `<name>.figma.md`.
- 🛑 **`@part` tag ↔ `part="..."` attribute mismatch** (step 2): a JSDoc tag with no matching
  render attribute, or vice versa — ask the user to fix the component or explicitly accept the
  mismatch.
- 🛑 **Missing nested-child mapping** (step 4): a nested DS component (e.g. `<ds-icon>`) whose own
  `<child>.figma.md` doesn't exist or has no recorded component key — stop per `SKILL.md`'s
  Prerequisites; don't recreate the child or fall back to a plain shape.
- 🛑 **Unresolvable CSS-var token** (step 5): any value bound to `var(--ds-...)` with no matching
  Figma variable — ask the user to pick an existing token or explicitly accept a one-off
  hardcode. Never guess, never invent a new token.
- 🛑 **Unresolvable attribute with no CSS-var binding at all** (step 5): a hardcoded literal or an
  inherited attribute the component's own code never sets — same hard stop as above, no exemption
  for "the code doesn't mention it."
- 🛑 **Non-mobile/tablet/desktop breakpoint mixin** (step 5a): any mixin other than
  `mobile`/`tablet`/`desktop` driving a real token difference — ask the user to collapse it into
  one of the three real Figma modes, accept a static value, or extend the collection; never guess.
- 🛑 **Completeness-checklist gap** (step 5b): any node/attribute combination in the explicit
  completeness checklist with no resolved token — surface every gap as a batch before Phase 2, not
  discovered piecemeal mid-build.

## Phase 2 — Propose grouping

- 🛑 **Ambiguous prop-to-variant mapping** (step 2): anything that doesn't cleanly fit the
  enum/boolean/free-text/state rules — flagged explicitly, never guessed.
- 🟡 **Variant-grid-layout confirmation** (step 3): state which case applies (2-axis / nested-matrix
  / top-level-split) before asking for approval, so the user confirms an actual layout, not just a
  property list.
- 🛑 **500-variant threshold exceeded** (step 4): stop before presenting the grouping for approval;
  present the count, the dominant-axis breakdown, and the recommended mitigation(s); loop until
  the count is ≤500 after the user picks.
- 🟡 **Grouping sign-off** (step 6): stop and wait for the user to confirm or edit the mapping
  directly in `<name>.figma.md` before Phase 3 starts. Never proceed on assumed approval.
- 🟡 **New `CONVENTIONS.md` heuristic** (step 7): show the user the exact diff and get approval
  before writing it — never auto-append.

## Phase 3 — Build

- 🟡 **First-variant screenshot checkpoint** (step 4): show the user a screenshot of the single
  default/base combination before fanning out the rest of the matrix — catches a structural
  mistake once, before it's replicated across every variant.

## Phase 4 — Document: Layout

- 🟡 **Layout iteration before moving on**: iterate on the header/2-column shell with the user
  (screenshot checkpoint) before starting Phase 5 — same discipline as Phase 3's variant-matrix
  checkpoint.
- 🛑 **Unresolvable link URL** (Header section): if a build can't resolve one of the three header
  links (Storybook/Toky/GitHub) — stop and ask rather than silently shipping that row dead.
- 🛑 **Missing category copy** (page-level structure): a category folder with no seeded
  title/lead in `CONVENTIONS.md`'s table — stop and ask before building that category's page.

## Phase 5 — Document: Copy me

- 🟡 **Iteration before moving on**: confirm "Copy me" with the user before starting Phase 6.

## Phase 6 — Document: Anatomy

- No checkpoints beyond the standing iteration discipline. **Skip condition**: the component's
  `<name>.figma.md` has no `anatomy:` list (no `@part` tags) — skip this phase entirely, go
  straight to Phase 7.

## Phase 7 — Document: Specs

- 🟡 **Iteration before moving on**: confirm Specs with the user before starting Phase 8.

## Phase 8 — Document: Component Set

- 🟡 **Axis-count check** (required, not optional): count the real crossed axes on the set before
  deciding on row/column labels — skipping this has shipped unlabeled sets twice (`ds-spinner`,
  `ds-logo`).
- 🟡 **Final layout iteration before done**: iterate on the finished documentation frame with the
  user (screenshot checkpoints) before considering the whole documentation page finished and
  moving on to Phase 9 — same discipline as Phase 3's variant-matrix checkpoint.

## Phase 9 — Review

- No checkpoints or hard stops — this phase only reports. Findings (token mismatches, uncovered
  gaps, a wrong code-doc comment) are advisory; the user decides what, if anything, gets fixed.
  See `PHASE-9-REVIEW.md` §3 for the one exception where this skill fixes something on its own
  authority: a confirmed-wrong _code doc comment_ gets corrected in the same pass, since code is
  this system's own source of truth for documentation copy.

## Cross-cutting

- 🟡 **`figma.config.json` placeholder file key**: if `componentLibraryFileKey` is still
  `REPLACE_WITH_FIGMA_FILE_KEY`, stop before doing anything else and ask for the real key
  (`SKILL.md`'s Prerequisites).
