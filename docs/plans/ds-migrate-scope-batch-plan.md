# Plan: scope and cascade migration in `ds-migrate-from-baloise`

## Context

Today the skill migrates one component at a time. Each migration is a pair: a whole-project
scanner `scripts/scan-bal-<x>.mjs` and a `components/<x>/migration.md` with the steps Scan,
Confirm, Rewrite, Report and a hard "Stop" at the end. Only `scan-icon-imports.mjs` accepts a
file list. `CHILD_SLUGS` in `scan-migratable.mjs` covers children of the same family
(`bal-card-title` belongs to `card`), but not foreign tags nested inside a migrated component.

Two gaps follow from that:

1. A migrated component keeps its nested legacy children. After the card migration a
   `bal-button` inside `ds-card-actions` and a `bal-close` inside the synthesized
   `ds-card-header` stay legacy. `ds-button-group` styles `::slotted(ds-button)` and
   `ds-checkbox-group` queries `ds-checkbox`, so a mixed parent and child silently loses layout
   or wiring across families.
2. A page cannot be chosen as a unit. Migrating one feature folder means one menu round per
   component, one confirmation each, and a mixed state between rounds.

Most of the conflicts listed below exist today and are carried by the user. The change moves
them into the skill, where they are reported once. Only three are new: the order in which
migrations run, the agent context size per batch, and the deferred legacy config decision.

Reference material: `packages/skills/CONTEXT.md`, `skills/ds-migrate-from-baloise/SKILL.md`,
`scripts/source-scan.mjs`, `scripts/scan-migratable.mjs`, `scripts/scan-icon-imports.mjs`
(file-argument pattern with `unmatched`), `components/card/migration.md` (sibling rules written
in `bal-*` terms), `components/button/migration.md` (parent styles children by tag),
`shared/icons.md` and `shared/legacy-config.md` (run once per migration today).

## Decisions

- **One batch, two entry points.** A batch is a set of files plus the list of migrations that
  occur in them. **Scope** derives the file set from user-given paths. **Cascade** derives it
  from the files a single component scan found. Both run the same orchestrator.
- **Scope is a third item under Components**, next to Manual and Detect. Manual and Detect stay
  unchanged except for one extra question after the component choice: "also migrate the other
  `bal-*` components in the files this scan found?" That question is Cascade.
- **Scanners accept files and directories, output stays flat.** Every `scan-bal-*.mjs` takes
  `process.argv.slice(3)` as paths relative to `<project-root>` and limits the walk to them.
  The JSON shape `{ total, files }` does not change. Unknown paths come back as `unmatched`,
  exactly like `scan-icon-imports.mjs` does today.
- **`scan-migratable.mjs` gains a per-file breakdown.** With path arguments it limits the walk
  and adds `files: [{ file, components: [{ name, total }] }]` next to `suggested` and `notYet`.
- **Angular sibling files travel in pairs.** For every `.html` in the file set the skill adds
  the `.ts` with the same basename, and the other way round, before the batch starts.
- **Fixed rewrite order.** Structural migrations first, leaves last, everything else in
  alphabetical order in between:
  1. `card`, `modal`, `list`, `accordion`, `tabs`, `steps`, `navbar`, `sheet`, `popup`
  2. every other migration, alphabetical
  3. `field`, `button`, `close`, `icon`, `text`, `heading`, `badge`, `tag`, `divider`
  Sibling rules in a `migration.md` are written in `bal-*` terms ("wrap the `bal-close` next to
  the title"). Running close before card would leave that rule without a match. The batch text
  states that sibling rules match both the `bal-` form and the already rewritten `ds-` form.
- **One confirmation per batch.** The user sees the full list (files, migrations with counts,
  `notYet`, files shared outside the scope) and answers once. The user can exclude files or
  components before answering. Per-component Confirm and Stop are skipped in batch mode.
- **Batch mode is one clause in `SKILL.md`**, not an edit in every `migration.md`. The clause
  says: inside a batch, run only the Rewrite step with the batch file list, collect the Report
  items, do not ask and do not stop.
- **Icons and the legacy config call run once per batch**, after the last component, on the
  union of touched files (icons) and with a whole-project `scan-migratable.mjs` run (legacy
  config). Per-component runs of `shared/icons.md` and `shared/legacy-config.md` are skipped
  inside a batch.
- **Import cleanup is a batch step.** Each migration moves only its own symbols and leaves the
  rest on the `@baloise/ds-angular` or `@baloise/ds-react` import. After the last component the
  batch removes every legacy import that has no specifier left, per file.
- **Shared files are reported, not blocked.** Before the confirmation the batch greps the project
  for imports of every file in the set. Files imported from outside the scope are listed with
  their importers. Migrating them changes other pages; that is the user's call.
- **Tree resolution is out of scope.** Following imports or Angular selectors from a page into
  child components in other folders is a later phase. Until then the user names those folders
  in the scope.

## Work items

### 1. File filter in the scanners

- `scripts/source-scan.mjs`: `scanSourceFiles(rootDir, collect, extensions, only)`. `only` is a
  list of root-relative paths. A directory limits the walk to its subtree, a file limits it to
  that file. Return the set of scanned files so callers can compute `unmatched`.
- Every `scripts/scan-bal-*.mjs`: pass `process.argv.slice(3)` through `run(root, stdout, files)`
  into the scan function. Add `unmatched` to the output only when it is non-empty.
- `scripts/scan-icon-imports.mjs`: switch to the shared filter, keep its behaviour.
- `scripts/scan-migratable.mjs`: accept paths, add `files` with the per-file component counts.
- Tests: one filter case per `test/scan-bal-<x>.spec.ts` (a directory argument, a file argument,
  an unknown path producing `unmatched`), new cases in `test/scan-migratable.spec.ts` for
  `files` and for path arguments. Fixtures stay inline with the local `write()` helper.

This item is mechanical and can be delegated. It changes nothing for Manual, Detect and Assets.

### 2. Batch orchestrator

- New `shared/batch.md` with the steps:
  1. **Collect**: take the file set and migration list from the entry point, add sibling `.ts`
     and `.html` files, run `scan-migratable.mjs` on the set to confirm the migration list.
  2. **Shared files**: grep the project outside the set for imports of each file, list hits.
  3. **Show**: files, migrations with counts in rewrite order, `notYet` with counts, shared
     files with their importers. One yes/no. Allow exclusions before the answer.
  4. **Rewrite**: for each migration in the fixed order, read its `migration.md`, run its
     scanner with the file list, apply its Rewrite step, note its Report items, then move on.
     Read one `migration.md` at a time.
  5. **Imports**: per touched file, delete every legacy import with no specifier left.
  6. **Icons**: `shared/icons.md` on the union of touched files.
  7. **Legacy config**: `shared/legacy-config.md` with a whole-project scan.
  8. **Report**: per file, the items of every migration in processing order. Then three blocks:
     `notYet` left in the scope, files shared outside the scope, and migrations not run if the
     batch stopped early. Leave everything unstaged, never `git add` or `git commit`.
- Guard: when the batch has more than eight migrations, suggest splitting the scope before the
  confirmation and continue only on an explicit yes.

### 3. Menu changes in `SKILL.md`

- Components menu gets a third item **Scope**: ask for one or more paths relative to
  `<project-root>`, run `scan-migratable.mjs` with them, hand the result to `shared/batch.md`.
- Manual and Detect: after the component choice, run its scanner, then `scan-migratable.mjs` on
  the files it found. When other migratable components occur in those files, ask once whether to
  migrate them too. On yes hand the file set and the full list to `shared/batch.md`. On no
  continue with the single `migration.md` as today.
- Add the batch-mode clause: inside a batch a `migration.md` runs only its Rewrite step on the
  batch file list, skips Confirm, Stop, the icon rules and the legacy config rules, and returns
  its Report items to the batch.

### 4. Docs

- `packages/skills/CONTEXT.md`: new section "Batch: scope and cascade", the rule "scanners accept
  paths, the output stays flat", the fixed rewrite order and why it exists, and the menu check in
  "Menu (Claude)" extended by Scope and the cascade question.
- `docs/SKILLS.md`: mention Scope in the consumer-facing description if it lists menu items.

### 5. Changeset

Minor bump for `@helvetia-design/skills`: new Scope entry, cascade question, path arguments on
every scanner.

## Verification

- `pnpm --filter @helvetia-design/skills test` and `lint` green.
- Scratch CLI per `packages/skills/CONTEXT.md`, then in the scratch project:
  - Scope on a folder with `bal-card`, `bal-button` and `bal-close` nested in one template.
    Done when card runs first, the `bal-close` ends up inside `ds-card-header` as `ds-close`,
    the `bal-button` inside `ds-card-actions` becomes `ds-button`, and no empty
    `@baloise/ds-angular` import is left.
  - Scope on a folder that imports a component from `shared/`. Done when the shared file is
    listed with its outside importers before the confirmation.
  - Detect, choose card, answer the cascade question with no. Done when only card is rewritten,
    as today.
  - Scope with a `bal-select` inside a `bal-field`. Done when `select` removes the `bal-field`
    around its control, `field` runs after it, and no `bal-field` is left in the file set.
- `harness/inventory.mjs` before and after on the scoped folder. Done when `introduced` is
  empty and every `remaining` entry is named in the report.

## Conflicts and how the plan handles them

- Shared app components used by pages outside the scope: reported with importers before the
  confirmation, user decides.
- Parents that style or query children by tag across families: solved by migrating the whole
  file set in one batch; a `notYet` child inside a migrated parent is its own report block.
- Sibling rules written in `bal-*` terms: fixed rewrite order plus the "matches both forms"
  clause in `shared/batch.md`.
- Imports touched by several migrations: import cleanup as a batch step after the last one.
- Angular class file beside the template: sibling pairing in the Collect step.
- One confirmation versus control: one confirmation with the full list and exclusions.
- Agent context size: one `migration.md` at a time, report items noted immediately, split
  suggestion above eight migrations.
- Partial run: the report names the migrations that did not run; everything is unstaged anyway.
- Legacy config decision timing: runs once after the last component with a whole-project scan.

## Out of scope

- Tree resolution from a page into child components in other folders (React imports, Angular
  selectors). Revisit when a real consumer app shows children spread across many folders.
- Any change to the per-component `migration.md` files beyond what the batch clause in
  `SKILL.md` covers.
- CSS utils.
