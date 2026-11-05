# Batch: several component migrations on one set of files

A batch migrates every `bal-*` component in a set of files in one run, with one confirmation. **Scope** and the cascade question in **Manual** and **Detect** start it. Both hand over a file set and the `scan-migratable.mjs` JSON for it.

A batch exists because a parent and its children must change together. `ds-button-group` styles `::slotted(ds-button)` and `ds-checkbox-group` queries `ds-checkbox`. A migrated parent around a legacy child loses layout or wiring without an error.

`<project-root>` is the consumer project root that contains the app lockfile. Every path in this file is relative to it.

## 1. Collect

1. For every `.html` in the file set, add the `.ts` with the same basename in the same folder, when it exists. For every `.ts`, add the `.html` the same way. Angular splits one component across both files, and the class file often names a legacy symbol that the template does not.
2. Run the migratable scan on the file set:

   ```bash
   node <this-skill-directory>/scripts/scan-migratable.mjs <project-root> <path> [<path> ...]
   ```

   When the JSON has an `unmatched` list, those paths are not source files or folders under `<project-root>`. Fix the paths and run the scan again before you continue.

3. The migration list is every entry in `suggested`. `files` lists, per file, every component it uses. Keep only files that use at least one component from `suggested` as the file set.

If `suggested` is empty, report that the files use no component with an available migration, show `notYet`, and stop.

Done when the file set and the migration list are fixed.

## 2. Shared files

For each file in the set, search the project outside the set for imports of it. Search for the path without its extension, as it appears in an import specifier, and for the Angular selector when the file is a component class. For each hit, note the importing file.

A file imported from outside the set is shared. Migrating it changes those other pages too. Do not drop it. The user decides in the next step.

Done when every file in the set has been checked.

## 3. Show and confirm

Show, in this order:

1. The file set, grouped by folder.
2. The migration list in rewrite order (see Order below), each with its `total`.
3. `notYet` with each `total`. These stay `bal-*`.
4. The shared files, each with its importers.

When the migration list has more than eight entries, say that the batch is large, suggest splitting the scope into smaller folders, and continue only on an explicit yes.

Then ask for one yes/no: migrate every listed component in every listed file? Before the answer, the user may exclude files or components. Remove them from the file set or the migration list. On no, stop with the files unchanged.

Editing starts only after the yes. Done when the user has answered.

## 4. Rewrite

### Order

Run the migrations in this order. Structural parents first, because their `migration.md` rules restructure the children. Leaves last.

1. `card`, `modal`, `list`, `accordion`, `tabs`, `steps`, `navbar`, `sheet`, `popup`
2. every other migration in the list, alphabetical
3. `button`, `close`, `icon`, `text`, `heading`, `badge`, `tag`, `divider`

Skip every name the migration list does not contain.

### Per migration

For each migration, in order:

1. Read `components/<name>/migration.md`. Read one at a time. Do not keep the earlier ones open.
2. Run its scanner on the file set:

   ```bash
   node <this-skill-directory>/scripts/scan-bal-<name>.mjs <project-root> <file> [<file> ...]
   ```

3. Apply its **Rewrite** step to those findings only. Skip its **Scan** display, its **Confirm** step and its stop.
4. Skip the icon import and Registration rules from `shared/icons.md`. Step 6 runs them once for the whole batch. Keep applying the icon name rule to icon props that the migration file copies.
5. Note the items its **Report** step lists, per file, before moving to the next migration.

A rule in a `migration.md` that names a sibling or child by its `bal-*` tag also matches the `ds-*` tag an earlier migration in this batch already wrote. The card rule "wrap the `bal-close` next to the title in `ds-card-header`" also wraps a `ds-close`.

When a migration fails or the user interrupts, stop the loop. Go to step 8 and list the migrations that did not run.

Done when every migration in the list has run.

## 5. Imports

Each migration moves only its own symbols and leaves the others on the `@baloise/ds-angular` or `@baloise/ds-react` import. In every file the batch touched, delete each `@baloise/ds-angular` and `@baloise/ds-react` import that has no specifier left. Leave an import that still binds a symbol.

Done when no touched file has an empty legacy import.

## 6. Icons

Follow `shared/icons.md` once for the union of every file the batch touched:

- Run its **Scan** with those files as arguments.
- Run its `scan-migratable.mjs` call without path arguments, so it covers the whole project. The batch rewrite has already happened, so ignore no component.
- Apply every rule, including Registration. The legacy registration usually sits in a startup file outside the file set. Edit it there.
- Note the items from its **Report** section.

Skip this step when the icon scan reports `total` 0.

Done when every icon rule has been applied to the touched files.

## 7. Legacy component check

Run the migratable scan without path arguments:

```bash
node <this-skill-directory>/scripts/scan-migratable.mjs <project-root>
```

When `suggested` or `notYet` is not empty, `bal-*` components remain in the project. The legacy config call and every `@baloise/*` package stay. Name the remaining components with their `total` in the report.

Done when the report has the answer.

## 8. Report

Print, per file, the Report items of every migration in the order they ran, then the icon items. Then three blocks:

1. `notYet` components left in the file set, with the files that use them. A `notYet` child inside a migrated parent is listed here by name, because the parent may now style or query it by its `ds-*` tag.
2. The shared files, with their importers outside the set.
3. The migrations that did not run, when the batch stopped early.

End with the result of step 7.

Leave every change unstaged for the consumer to review. Stop. Do not run `git add` or `git commit`.

Done when the report is printed and the working tree is still unstaged.
