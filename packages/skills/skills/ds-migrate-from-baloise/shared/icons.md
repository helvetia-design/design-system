# Icons inside a component migration

Every component migration applies these rules to the files it migrates, and the **Assets** menu item applies them to every other file that still uses legacy icons. They move legacy icons from `@baloise/ds-icons` and `@baloise/ds-brand-icons` to `@helvetia-design/assets` and translate legacy icon names. `SKILL.md` says when each part runs.

The two icon kinds resolve differently:

- **UI icons** are looked up by name. Legacy `bal-icon` resolved `name="star-full"` to the config key `balIconStarFull`. `ds-icon` resolves it to `IconStarFull`. The standard UI set is already registered by `@helvetia-design/core`, so the app does not register it any more. A wrong name fails silently at runtime with `Icon "<name>" not found`.
- **Brand icons** have no registry. Each one is imported on its own and passed as an SVG string to `svg`. A wrong symbol fails at build time.

## Scan

In a component migration, pass every file that has a finding of the component scan, as a path relative to `<project-root>`. The **Assets** step passes no files and scans the whole project.

```bash
node <this-skill-directory>/scripts/scan-icon-imports.mjs <project-root> <file> [<file> ...]
```

The script prints the same JSON shape as the component scan, limited to those files. It lists imports from both legacy icon packages, every `balIcon*` and `balBrandIcon*` symbol, and every use of a namespace bound by `import * as`. It also lists those symbols in template binding values, which the source scan masks: `[svg]="balBrandIconCar"`, `[attr.x]`, `bind-x`, `*ngX` and Vue `:x`, in `.html` and `.vue` files and in inline `template:` strings. A symbol inside a quoted string in a binding value, and `balIconClick`, which is the `bal-date` event, are not findings.

When a `.ts`, `.mts`, `.cts`, `.js`, `.mjs` or `.cjs` file that is not minified (`*.min.js`) holds a string literal that is a name in `icon-name-map.json`, or that starts with `alert` or `info` and has `icon` before it on the same line, the JSON has a `candidates` list next to `total` and `files`. Its shape is `{ total, files: [{ file, findings: [{ line, snippet, name, group }] }] }`. `group` is `renamed`, `approximated`, `lost`, `changed` or `shim`. A `changed` name that an earlier rename can have produced also has `renameTarget: true`. Candidates are not counted in the top-level `total`. The list is absent when there are none. Pass paths relative to `<project-root>`. When the JSON has an `unmatched` list, those arguments are not source files under `<project-root>`. Fix the paths and run the scan again before you continue.

If `package.json` declares `@baloise/ds-icons` or `@baloise/ds-brand-icons` but not `@helvetia-design/assets`, add `@helvetia-design/assets` with the version of the other `@helvetia-design/*` entries and run the install command for the project's lockfile.

## Icon names

`icon-name-map.json` in this folder lists the legacy UI icon names that differ in the new set. Every name not listed stays unchanged.

| group          | meaning                                                         | handling                                            |
| -------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| `renamed`      | same glyph, new name (`nav-go-down` is now `caret-down`)        | Write the mapped name.                              |
| `approximated` | closest glyph, visibly different (`arrow-down` to `caret-down`) | Write the mapped name. Report it.                   |
| `lost`         | no counterpart                                                  | Leave the name. Report it.                          |
| `changed`      | same name, different meaning (`message` was an envelope)        | Leave the name. Report every use for manual review. |

Apply the name rule to `name` on `ds-icon` and to every prop that holds an icon name and that the component's migration file copies, such as `icon`, `iconRight` and `buttonIconOpen`:

1. Apply the legacy lookup shim first. Legacy `bal-icon` rewrote every name that starts with `alert` to `alert-triangle`, and every name that starts with `info` to `info-circle`. `ds-icon` does not. Rewrite such a literal the same way. Leave `alert-triangle` and `info-circle` unchanged.
2. Then look the result up in `icon-name-map.json` and handle it by the table above.

Rewrite the literal forms `"…"`, `'…'`, `{"…"}` and `{'…'}`. Rewrite an expression whose branches are all string literals branch by branch, such as `cond ? 'nav-go-right' : ''`, `[iconRight]="x ? '' : 'nav-go-right'"` or `open ? 'nav-go-up' : 'nav-go-down'`. Apply the name rule to each literal and keep an empty-string branch. When the value is any other expression, leave it and report that a runtime value starting with `alert` or `info` must be passed as `alert-triangle` or `info-circle`, and that runtime values must follow `icon-name-map.json`.

The rule is idempotent for names under `renamed`, `approximated` and `lost`: no mapped value is a key under those groups, so running it twice changes nothing. A mapped value can be a `changed` name, because `contact` becomes `message`. The map marks such a name in `renameTargets`. See Candidates for how the report treats it.

## Candidates

An icon name can sit in a data module and reach `ds-icon` through a variable, such as `icon: 'account'` in a constants file that feeds `name={item.icon}`. No component scan sees it. The `candidates` list of the scan covers these literals. Only the **Assets** step acts on it. A component migration ignores `candidates`. I1 says how its final scan reports them.

In the **Assets** step, show the candidates with the icon findings: file, line, snippet, name and group. They are covered by the one confirmation. After yes, apply the name rule to each listed literal: the shim first, then the map. Report a rewritten `approximated` literal under I2, and leave a `lost` or `changed` literal and report it under I3 or I4. A string that is not an icon name stays and is reported under I13. That is the case when the user says so, or when the code around it uses it for something else, such as a route, a label or a log level.

A `changed` candidate or name with `renameTarget` can be the output of an earlier rename, such as `message` from `contact`. Report it under I4 only when `ds-migration-report.md` does not already report the same file and snippet in an earlier section.

## UI icon imports

For each named import from `@baloise/ds-icons` in a scanned file:

1. Take the part after `balIcon` and turn it into the icon name: `balIconNavGoDown` gives `nav-go-down`.
2. Look the name up in `icon-name-map.json`. Under `renamed` or `approximated`, the new name is the mapped value. Under `lost`, there is no new icon. Otherwise the name stays.
3. When there is a new icon, import `Icon<Name>` from `@helvetia-design/assets` instead (`nav-go-down` maps to `caret-down`, so `IconCaretDown`). Rename every use of the symbol in the file. With an alias (`balIconPlus as plus`), rename the imported name and keep the alias.
4. For a `lost` name, leave the specifier on an `@baloise/ds-icons` import, unchanged, and report it. The legacy package stays installed.
5. For a `changed` name, rename as in step 3 and report every use.

Merge the new specifiers into an existing `@helvetia-design/assets` import in the same file. When two legacy specifiers map to the same `Icon<Name>`, such as `balIconDelete` and `balIconTrash`, import `Icon<Name>` once and rename the uses of both symbols to it. Keep each alias the source used. Delete the `@baloise/ds-icons` import when no specifier is left on it.

Never write `import * as` from `@helvetia-design/assets`. One named import per symbol keeps the bundle to the icons the app uses.

## Namespace imports

For each `import * as <ns> from '@baloise/ds-icons'` in a scanned file:

- Member access such as `<ns>.balIconStarFull` becomes a named import of `IconStarFull`, following the UI icon import rules, and the expression becomes `IconStarFull`.
- A use as the registration value follows the Registration rules below.
- Any other use, such as passing `<ns>` to a function, stays unchanged. Report it.

Delete the namespace import when the file no longer uses `<ns>`.

## Brand icon imports

Only symbols imported from `@baloise/ds-brand-icons` are rewritten. The set is identical, so the rename is mechanical: `balBrandIcon<Name>` becomes `BrandIcon<Name>` from `@helvetia-design/assets`, with no name mapping. Rename every use in the file, keep aliases, and merge into an existing `@helvetia-design/assets` import.

Leave every `svg` or `src` binding alone whose value does not come from `@baloise/ds-brand-icons`. Apps that pass their own artwork depend on that.

For `import * as <ns> from '@baloise/ds-brand-icons'`, turn each `<ns>.balBrandIcon<Name>` into a named import of `BrandIcon<Name>`. Any other use of `<ns>` stays unchanged. Report it. Never replace it with `import * as` from `@helvetia-design/assets`, which would ship every brand icon.

## Registration

The legacy registration is the `icons` value in the legacy config call, such as `initializeBaloiseDesignSystem({ icons })`, `useBaloiseDesignSystem({ defaults: { icons: balIcons } })`, or `provideBaloiseDesignSystem({ defaults: { icons } })`. It usually sits in the startup file that the `app` migration scans. The **Assets** step reads it even when the icon scan does not list that file. The legacy-config scan finds the call. When the value is an identifier, such as `icons: portalIcons`, follow it to its declaration, also in another file, and sort the parts of that object. Sort every part of that value into one of four cases:

| part of the legacy `icons` value                                                                                                                   | case          | handling                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the namespace itself: `icons: balIcons`, `{ icons }` bound to the namespace, or `...balIcons`                                                      | standard set  | Already registered by `@helvetia-design/core`. Nothing to carry over.                                                                                      |
| a key equal to its own symbol, when the symbol is imported from `@baloise/ds-icons`                                                                | standard icon | Already registered. Nothing to carry over. When the name is `lost` in `icon-name-map.json`, report it.                                                     |
| a `balIcon<Name>` key with any other value, such as `balIconMyLogo: logoSvg`, or a shorthand or `key: key` whose symbol is declared in the project | custom icon   | Carry it over as `Icon<Name>: <value>`. When the value is a `balIcon*` symbol from `@baloise/ds-icons`, rewrite it by the UI icon import rules. Report it. |
| a key without the `balIcon` prefix, such as `myLogo: logoSvg`                                                                                      | unreachable   | Legacy never resolved it by name. Do not carry it over. Report it.                                                                                         |

A shorthand key such as `balIconStarFull` or `balIconStarFull: balIconStarFull` is a standard icon only when the symbol is a named import from `@baloise/ds-icons`, or a member of a namespace imported from it. Check where the symbol comes from. A symbol declared in the project or imported from any other module is a custom icon. Keep its own import or declaration. For example, `balIconPortalShield` declared in `data/icons.ts` as an SVG string becomes `IconPortalShield: balIconPortalShield`.

Before carrying a custom icon over, apply the name rule from Icon names to the key: turn `<Name>` into the icon name, apply the legacy lookup shim and `icon-name-map.json`, and use the result. `balIconDelete: mySvg` becomes `IconTrash: mySvg`, because every migrated `name="delete"` now asks for `trash`. When the result names a standard icon, report that the custom icon replaces the pre-registered glyph.

Carry custom icons over now, also while the legacy config call stays. `ds-icon` looks names up only in the new config, so a custom icon that is only in the legacy registration is `not found` in every migrated `ds-icon`:

- **HTML and Angular**: call `initializeDesignSystem({ icons: { … } })` from `@helvetia-design/core` at startup, next to the legacy call. Merge into an existing `initializeDesignSystem` call instead of adding a second one.
- **React**: pass `icons={{ … }}` to `DsRootProvider`. When the app has no `DsRootProvider` yet, use `initializeDesignSystem` as above.

The new config merges `icons` into the pre-registered set, so pass only the custom icons.

Never edit the legacy `icons` value or the imports it needs here. The remaining `bal-icon` tags and the legacy components that draw icons still look names up in it. A symbol that the registration uses keeps its legacy import, even when you add the new import for its other uses. `shared/legacy-config.md` decides about the whole call. It deletes the call, with its `icons` value and the imports that only it uses, once no `bal-*` component is left.

## Angular templates

When a `.ts` symbol from the legacy icon packages is renamed, rename its uses in the bindings of the component's template too. The template is the `.html` file beside the component, or its inline `template:` string. The scan lists these bindings, such as `[svg]="balBrandIconCar"`. Rename a binding only together with the symbol it names. When the scan lists a binding but not the `.ts` file that declares the symbol, add that `.ts` file to the migration, or leave the binding and report it under I1.

## Report

In a component migration, run the icon scan once more without file arguments:

```bash
node <this-skill-directory>/scripts/scan-icon-imports.mjs <project-root>
```

The **Assets** step skips this scan, because it already scanned the whole project.

These items follow the component's own checklist items and the `F` items of `shared/field.md`, in this order. Each one gets its own line in `ds-migration-report.md`, as `shared/report.md` describes.

Needs your attention when found:

- I1. Every file the final icon scan reports that this migration did not touch, and every file with `candidates` that `ds-migration-report.md` does not already report under I2, I3, I4, I12 or I13, also one this migration touched. Those files still use legacy icons. Say that the **Assets** menu item migrates them. In the **Assets** step, write `noted, this step scanned the whole project`.
- I2. Every icon name rewritten from `approximated`, and where.
- I3. Every name under `lost` left unchanged, and where.
- I4. Every name under `changed` left unchanged, and where.
- I5. Every non-literal icon name, with the note that a runtime value starting with `alert` or `info` must be passed as `alert-triangle` or `info-circle`, and that runtime values must follow `icon-name-map.json`.
- I6. Every `lost` icon left on `@baloise/ds-icons`, and where.
- I7. Every custom icon carried over, and where.
- I8. Every custom icon that replaces a pre-registered standard glyph.
- I9. Every unreachable registration key dropped.
- I10. Every namespace use left unchanged.
- I11. When imports from `@baloise/ds-icons` or `@baloise/ds-brand-icons` remain, the note that those packages must stay installed.
- I12. Every candidate rewritten from `renamed` or the shim, and where.
- I13. Every candidate left because it is not an icon name, with the reason and where.

Coverage only, written to the file:

- I14. Every symbol renamed.
  The legacy registration is reported with the legacy config call by `shared/legacy-config.md`.
