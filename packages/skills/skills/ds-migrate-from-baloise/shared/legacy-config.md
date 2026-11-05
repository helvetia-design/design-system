# Legacy config call

Every component migration applies these rules at its end, and so does the **Assets** menu item. They decide when the legacy config call goes. `SKILL.md` says when each part runs.

The legacy config call is `initializeBaloiseDesignSystem`, `useBaloiseDesignSystem` or `provideBaloiseDesignSystem`. It fills the global config that every `bal-*` component reads. The `bal-*` components read `language`, `region`, `allowedLanguages` and `fallbackLanguage` only from there. `ds-root` and `DsRootProvider` configure only the `ds-*` components. So the call stays as long as one `bal-*` component is left. This file is the only place that deletes it.

## Scan

Find the legacy config calls:

```bash
node <this-skill-directory>/scripts/scan-bal-app.mjs <project-root>
```

The `app` migration already ran this script in its Scan step. Reuse those findings instead of running it again.

Keep only the call sites of the three calls, not the import lines. The other findings are `bal-app` usages, which the `app` migration handles. When no call site is listed, there is nothing to delete. Skip the rest of this file and report nothing.

Then answer one question: is a `bal-*` component left? Run:

```bash
node <this-skill-directory>/scripts/scan-migratable.mjs <project-root>
```

When **Detect** already ran this script and no file has changed since, reuse its JSON instead.

Every component that `suggested` or `notYet` lists counts as left, with one exception. In a component migration, the component being migrated does not count when this migration rewrites every usage of it. A usage that its migration file leaves in place or reports as not migrated, such as a `bal-navbar` with `interface="simple"`, counts as a `bal-*` component left. Judge that from the component findings and the migration file's rules.

When no `bal-*` component is left, show each legacy config call (path, line, snippet) as a call to delete, before the confirmation that covers the edits.

## Decide

Check the answer again after the Rewrite step. When the Rewrite left a usage of the migrated component in place or reported it as not migrated, a `bal-*` component is left, even if the Scan said otherwise.

**A `bal-*` component is left**: leave every legacy config call and its import unchanged. Report that the call stays until the last `bal-*` component is migrated.

**No `bal-*` component is left**: delete the call, in this order:

1. Make sure every config value in the call is already on `ds-root` or `DsRootProvider`. Carry each missing value over by the Config table in `components/app/migration.md`. React and Angular calls hold the values under `defaults`.
2. When the project has no `ds-root` and no `DsRootProvider`, carry the values into `initializeDesignSystem({ … })` from `@helvetia-design/core` at startup instead. Merge into an existing `initializeDesignSystem` call. Report each value and where it went. Never drop a value without reporting it.
3. Let the Registration rules in `shared/icons.md` carry over the custom icons from the `icons` value.
4. Delete the whole call. Delete every import specifier that only the deleted call used. That includes the call's own specifier and named `balIcon*` imports from `@baloise/ds-icons` that only its `icons` value used. Delete an import when no specifier is left on it. Delete a namespace import such as `import * as balIcons from '@baloise/ds-icons'` when nothing else in the file uses it.

`logger` and `httpFormSubmit` have no new home. Report each one that goes with the call.

## Report

Add to the summary, per call: whether it stayed or was deleted, every value carried over and where, and every `logger` and `httpFormSubmit` deleted with it. The `icons` value stays or goes with the call.
