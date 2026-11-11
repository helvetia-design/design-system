---
name: ds-migrate-from-baloise
description: Migrate a consuming app from the Baloise Design System (bal-*) to the Helvetia Design System (ds-*). Use when bootstrapping Helvetia packages alongside Baloise, when migrating components, CSS utilities, or assets, or when removing the legacy Baloise imports and dependencies once the migration is complete.
---

# ds-migrate-from-baloise

This skill edits files in the consumer's repository and leaves every change unstaged, including the report file `ds-migration-report.md` that `shared/report.md` describes. Reviewing and committing is the consumer's job. This skill never runs `git add` or `git commit`.

## Menu

On invocation, present this menu and wait for one choice:

1. **Init** — bootstrap Helvetia packages alongside the existing Baloise install
2. **Components** — migrate a specific `bal-*` component to `ds-*`
3. **CSS utils** — rewrite legacy Baloise utility classes and delete the Baloise utilities line once none is left
4. **Assets** — migrate legacy icons in files that no component migration touches, move fonts and favicons to `@helvetia-design/assets`, and delete the legacy config call once no `bal-*` component is left
5. **Cleanup** — once every `bal-*` component is migrated, delete the legacy `structure` and `core` imports and the legacy `@baloise/ds-*` dependencies

Then follow only the matching section below. Stop when that section says to stop.

### Init

Bootstrap the Helvetia packages alongside the existing Baloise install. Do not remove or edit existing `@baloise/*` dependencies or imports.

Scan `<project-root>`, the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/detect-baloise.mjs <project-root>
```

The script prints one JSON object. It resolves the current `latest` dist-tag with `npm view @helvetia-design/core dist-tags`. Use `version` and `aliases` from that JSON. Do not hardcode a version.

For an Angular project the script also runs `npm view @helvetia-design/angular@<version> peerDependencies --json` with the resolved `version`. It compares the lowest major that the app's `@angular/core` spec allows with the lower bound of the `@angular/core` peer range. It adds `angular: { installed, required, compatible }`, where `installed` and `required` are the raw spec and range. It returns `status: error` when `compatible` is false. It also returns `status: error` when it cannot decide. That happens when the lookup fails, when the peer data has no `@angular/core` range, or when a value such as `*`, `latest`, a `||` range, `workspace:*` or `catalog:` has no readable major. The check runs for every package manager.

The walk skips `node_modules`, `dist`, `build`, `out`, `.next`, `.angular`, `.git`, `.claude`, `coverage`, `.nx`, `.nuxt`, `.output` and `storybook-static` at any depth.

If `status` is `nothing-to-migrate`, tell the user: no Baloise Design System installation detected, nothing to migrate. Stop. Do not edit files and do not install.

If `status` is `error`, tell the user `message` and stop. Do not edit files and do not install. For an Angular app below the required major, `message` says to upgrade Angular first. Never work around it with `--legacy-peer-deps` or `--force`.

If `status` is `ready`, show the detected framework, package manager, version, aliases, the `angular` field for an Angular app, and bootstrap files, then ask for one yes/no. On no, stop without editing. On yes:

1. Add each entry in `aliases` to the `dependencies` object of `packageJsonPath` (relative to `<project-root>`). Create `dependencies` if it is missing. Do not change or remove existing keys. If an `@helvetia-design/*` key is already present, leave its value unchanged and report both the existing value and the value from the JSON.
2. From `<project-root>`, run `installCommand` exactly (`pnpm install`, `yarn install`, or `npm install`). Do not add extra package arguments.
3. Insert the new CSS/JS import next to the existing `@baloise/*` one:
   - When inserting or replacing a SCSS line, match the at-rule of the line it sits beside or replaces (`@import` or `@use`) — never hardcode `@import` for a project wired with `@use`.
   - First handle these `@baloise/ds-styles/css/*` forms (with or without the `.css` extension), per the rules below. Then apply the generic bootstrap rule to every remaining `bootstrap` import. The real top-level files in the v19 line are `normalize`, `font`, `structure`, `core`, `basic`, `mixins`, `baloise-design-system`, and `all` — there is no top-level `utilities` file.
     - `normalize`
     - `font`, `structure`, `core`
     - The Baloise **utilities** line, in any of its real forms: `css/utilities/all`, one of the nine category files under `css/utilities/` (`background`, `border`, `elevation`, `flex`, `grid`, `interaction`, `layout`, `sizing`, `spacing`, `typography`), or the bundled `css/all` (see below)
   - `normalize`: comment out the original line in place (wrap it as `/* @import '@baloise/ds-styles/css/normalize.css'; */`, or the equivalent for its syntax). Immediately below the commented line, insert both, using the matching at-rule:

     ```scss
     @import '@helvetia-design/tokens/css/base';
     @import '@helvetia-design/styles/css/design-system';
     ```

   - `font`, `structure`, `core`: leave these three lines unchanged and keep them. Immediately above the first of the three (or, if `normalize` was on the line directly above, immediately below the two new imports), insert one comment noting they must be removed manually once the migration is verified, e.g. `/* TODO: remove these legacy Baloise imports once the Helvetia migration is verified */`. Insert that comment once, not once per line.
   - Baloise **utilities** line (`css/utilities/all`, any of the nine category files, or `css/utilities/<name>`): leave the line unchanged and keep it. The app markup still uses the legacy utility classes, and many of them have no Helvetia equivalent. Insert the `@helvetia-design/styles/css/utilities` equivalent once, immediately below the last Baloise utilities line, using the matching at-rule or the equivalent local form for the project's `framework`. The Helvetia line must load after the Baloise one, so Helvetia wins where both define the same class. Immediately above the first Baloise utilities line, insert one comment noting it must be removed manually once the migration is verified, e.g. `/* TODO: remove the legacy Baloise utilities once no legacy utility class is left */`.
   - Bundled `css/all`: this one file contains normalize + font + structure + core + utilities together. Its normalize clashes with the Helvetia design system, so comment out the original line in place. Immediately below it, insert the Helvetia base imports, then the legacy parts without normalize, then the Helvetia utilities, using the matching at-rule:

     ```scss
     @import '@helvetia-design/tokens/css/base';
     @import '@helvetia-design/styles/css/design-system';
     /* TODO: remove these legacy Baloise imports once the Helvetia migration is verified */
     @import '@baloise/ds-styles/css/font';
     @import '@baloise/ds-styles/css/structure';
     @import '@baloise/ds-styles/css/core';
     @import '@baloise/ds-styles/css/utilities/all';
     @import '@helvetia-design/styles/css/utilities';
     ```

     The inserted `css/font` line keeps the `@font-face` rules of `css/all`, which load the fonts from www.baloise.ch. Do not insert `design-system.local` here. **Assets** replaces that line with self-hosted fonts.

   - For every other `imports` entry with `kind` `bootstrap`, add the `@helvetia-design` equivalent immediately below that line. Leave the original line unchanged.
   - When the line is HTML, CSS, or a side-effect import, duplicate the line. In the duplicate only, apply this package map: `@baloise/ds-core` → `@helvetia-design/core`, `@baloise/ds-react` → `@helvetia-design/react`, `@baloise/ds-angular` → `@helvetia-design/angular`, and `@baloise/ds-styles` → `@helvetia-design/styles`.
   - When the line is JSON, such as an `angular.json` styles entry, insert a sibling string with that same package replacement. Keep the file valid JSON. Do not copy surrounding keys, and do not duplicate the whole file when the match is only one string.
   - If that duplicate would still be an `http://` or `https://` URL, do not write the URL. Insert the local form below instead.
   - Do not duplicate `kind` `reference` lines. Those are component and icon imports; **Components** migrates them.
   - If there is no `bootstrap` import, insert the local form immediately after the first `reference` line, without editing that line.
   - Skip the insert when the same `@helvetia-design` line is already the next line.
   - Local form when `framework` is `html`:

     ```html
     <link rel="stylesheet" href="node_modules/@helvetia-design/styles/dist/css/design-system.css" />
     <script type="module" src="node_modules/@helvetia-design/core/dist/design-system/design-system.esm.js"></script>
     ```

   - Local form when `framework` is `react` or `angular`, inserted into a `.ts`/`.tsx`/`.js`/`.jsx` file:

     ```ts
     import '@helvetia-design/styles/css/design-system'
     ```

   - Local form when the target file is `.scss`/`.sass` instead (regardless of `framework`): use `@import '@helvetia-design/styles/css/design-system';`, or `@use` if that is the at-rule already used by Baloise lines in that same file.

4. Write the Init section of `ds-migration-report.md` as `shared/report.md` describes. Create the file when it is missing, so this section is its first entry. Under `### Setup`, list the resolved `version`, the aliases written, and the install command. Under `### Files changed`, list every file touched. Every existing `@helvetia-design/*` value that step 1 left unchanged goes under **Needs your attention**, with both values. So does every `css/all` line that step 3 commented out, with file and line and the note that the inserted `css/font` line loads the fonts from www.baloise.ch until **Assets** runs. In chat, show the whole section (attention lines, Setup, and Files changed) and end with the line `Report written to ds-migration-report.md.`
5. Stop. Do not run `git add` or `git commit`. Leave every change unstaged for the consumer to review.

### Components

Present this menu and wait for one choice:

1. **Manual** — choose from every available component migration
2. **Detect** — scan the project and suggest applicable component migrations
3. **Scope** — migrate every `bal-*` component in the files and folders you name

Every component migration also migrates the legacy icons in the files it touches. Outside a batch, follow `shared/icons.md` alongside the chosen file:

- After the file's Scan step, run the icon scan from `shared/icons.md` for every file with a finding, and show its findings with the component findings. The file's single confirmation covers both.
- In the Rewrite step, apply the icon rules to those files as well.
- In the Report step, append the `I1.`, `I2.`, ... items from the Report section of `shared/icons.md` to the checklist, after the component items.

Every Report step writes to `ds-migration-report.md` as `shared/report.md` describes, and shows only the items that need attention in chat.

Every form component migration also removes the legacy field wrapper around the controls it migrates. Follow `shared/field.md` alongside the chosen file:

- In the Rewrite step, apply its rules to every migrated control that sits inside `bal-field` or `bal-field-control`, or that a `bal-field-message` directly follows, in the same pass. Apply its Angular form binding row to every migrated Angular control bound with `formControlName`, `[formControl]` or `ngModel`, also outside a `bal-field`.
- In the Report step, append the `F1.`, `F2.`, ... items from the Report section of `shared/field.md` to the checklist, after the component items and before the icon items.

Every migrated form control whose `required` default is `true` and reaches the native control follows the required default rule. The legacy controls defaulted `required` to false, and `ds-*` forwards `required` to the native control, so native validation would apply to a control that was optional before.

- **Covered controls** — `ds-input`, `ds-textarea`, `ds-datepicker`, `ds-number-input` and `ds-select`. When the legacy control omitted `required` and no `required` sits on the enclosing `bal-field` or `bal-field-label`, the migrated control gets an explicit `required="false"` (HTML), `[required]="false"` (Angular) or `required={false}` (React). A `required` that the control sets itself is copied as-is.
- **Excluded controls** — `ds-counter`, `ds-radio-group`, `ds-checkbox-group`, `ds-segment` and `ds-slider`. Their `required` default is `true`, but it only drives the "(optional)" suffix of the component's own `label`. No native control receives it. The control migration adds no `required="false"` there, and `shared/field.md` decides `required` for them.
- **Order** — read the enclosing field first. When `shared/field.md` unwraps a field whose level sets `required`, it decides and the control never gets the added `false`. The control rule adds `false` when neither level carries `required`, and also when `shared/field.md` leaves the `bal-field` in place, because then nothing copies the field level onto the control.
- **Batch and report** — the rule applies inside a batch too. Each component file reports every added `false` as a coverage item.

Every component migration also decides about the legacy config call. Follow `shared/legacy-config.md` after the icon rules:

- After the file's Scan step, run its Scan section. When no `bal-*` component will be left, show each legacy config call with the component findings as a call to delete. The file's single confirmation covers it.
- In the Rewrite step, after the icon and field rules, apply its Decide section.
- In the Report step, append the `L1.`, `L2.`, ... items from the Report section of `shared/legacy-config.md` to the checklist, after the icon items.

Inside a batch (see `shared/batch.md`), a `migration.md` runs only its Rewrite step, on the batch file list. It skips its Scan display, its Confirm step and its stop. It still applies `shared/field.md`. It skips the icon import and Registration rules and `shared/legacy-config.md`, which the batch runs once at the end. It hands the outcome of its Report items back to the batch instead of writing its own report section.

Vue is not a supported target. The scanners read `.vue` files only so that `shared/legacy-config.md` and **Cleanup** see every `bal-*` tag that is left. A component migration or a batch never rewrites a `.vue` file. Show its findings with the others, marked as not migrated, and leave the file unchanged. In the Report step, list each such file under "Needs your attention" as a Vue file that this skill does not migrate, with its findings. The legacy config call and the legacy imports stay until the consumer migrates those files by hand.

#### Unmapped props and handlers

A `migration.md` row that says "Apply Unmapped props and handlers" names a prop, attribute, binding, event handler or method call with no `ds-*` counterpart. This rule covers only those rows. It does not cover structural rules, such as groups or items left in place, loops in tabs or steps, field wrappers or divider children.

Decide the framework per file. A `.tsx` or `.jsx` file is React, and so is a `.ts` or `.js` file that holds JSX. An Angular template (`.component.html` or an inline `template:`) and its class file are Angular. A `.ts` or `.js` file without JSX follows the project framework, the `framework` value from `scripts/detect-baloise.mjs`: `react` or `angular` takes that branch. A `.vue` file, every other `.html` file and any other file type count as HTML.

The rule depends on the framework. The React `Ds*` wrappers are typed, so an unknown prop fails `tsc` with TS2322 or TS2551. Angular with `strictTemplates` fails with NG8002. Plain HTML ignores unknown attributes.

- HTML: leave the attribute, the `addEventListener` call or the method call unchanged. Report it.
- React and Angular, prop or attribute: remove it from the element. When the value is not a literal (a binding, a variable or an expression), keep it in a comment on the line above. In React, put `// TODO(ds-migrate): <name> had no ds-* target: <expression>` between the JSX attributes, where a `//` comment is valid. In an Angular template, put `<!-- TODO(ds-migrate): <name> had no ds-* target: <expression> -->` on the line above the element. Remove a literal value (`textAlign="right"`, `scrollable`, `filter="starts-with"`) without a comment. The report still names it.
- React and Angular, event handler: remove the binding (`onBalInput={...}`, `(balInput)="..."`). Keep the whole handler expression in the same TODO comment, so no logic is lost. Copy an inline arrow body into the comment verbatim. A multi-line body gets one `//` per line in React and one multi-line `<!-- -->` in Angular. When the handler calls a class method (`(balInput)="onInput($event)"`), keep the method in the class and name the call in the comment.
- React, unused declarations: when the removed expression was the only use of a local function, variable or import, move that declaration into the same TODO comment and drop the import binding. This keeps `noUnusedLocals` and lint green. Angular keeps the class method, because a use in the template only does not trigger unused checks.
- React and Angular, method call that is a standalone statement (`await ref.current?.getOptionByValue(v);`): replace the statement with `// TODO(ds-migrate): <method>() had no ds-* target: <statement>`. When the code uses the call's result (assigns, returns or passes it on), leave the call unchanged and report it as "will not compile, needs manual rework".

Never invent a replacement. When the `migration.md` row gives a mapping, use it.

Report every item this rule handles under Needs your attention. Name the file, the line, the name, and the removed expression or "literal `<value>`". Say whether it was left in place (HTML), removed (React, Angular), or left because its result is used. The `migration.md` checklist item that covers it gets one outcome line per occurrence.

Inside a batch the rule applies the same way, because it is part of the Rewrite step.

#### Legacy types and bundles

Every component migration applies these rules in its Rewrite step. They cover each file with a finding and the same-basename `.ts` beside every `.html` finding. The event type and element type rules also apply to React `.tsx` and `.ts` files. Inside a batch the rules apply the same way, because they are part of the Rewrite step.

**Event types.** A handler parameter typed with a legacy event type no longer type-checks once its binding becomes `ds*`. Angular with `strictTemplates` fails with TS2345. Take the new type from the tag the handler is bound to after the rewrite, not from the old name. `ds-<tag>` gives `Ds<Tag>CustomEvent` in PascalCase. A former `BalInputStepperCustomEvent` on a `ds-counter` becomes `DsCounterCustomEvent`, and a former `BalDateCustomEvent` becomes `DsDatepickerCustomEvent`.

- `BalEvents.Bal<X>CustomEvent<T>` and the bare `Bal<X>CustomEvent<T>` become `Ds<Y>CustomEvent<T>`, where `ds-<y>` is the new tag. Use the detail type that the Events table of that component's `migration.md` names for the event as the new `T`. Keep the legacy `T` only when that table names no detail, and report it. A legacy `T` that allows `undefined` where the new detail has `null` always becomes the new type.
- An event alias such as `BalEvents.BalInputChange` becomes `Ds<Y>CustomEvent<detail>`, with the detail from that table.
- A detail alias such as `BalEvents.BalInputChangeDetail` has no `Ds*` counterpart. Write the detail type out from that table.
- `BalProps.*` types have no `Ds*` counterpart for form controls. Leave them unchanged.
- A handler that stays bound to a legacy `bal-*` element keeps its legacy type.
- Import the new types with `import type { … } from '@helvetia-design/core'`. Merge them into an existing import from that module.
- A component `migration.md` that gives its own type rule wins. Tabs, steps and carousel use `CustomEvent<{ value: string }>`.

**Element types.** Every `HTMLBal<X>Element` that names an element migrated in this run becomes `HTMLDs<Y>Element` of the new tag. This covers `ElementRef<HTMLBal<X>Element>`, `@ViewChild(...) x?: HTMLBal<X>Element`, `viewChild<...>` and every other use. These types are global, so they need no import. Then apply the Methods rules of that `migration.md` to the calls on the ref. The new type makes `tsc` show every call to a removed method.

**Angular bundles.** In `imports: [...]` of a standalone component or an NgModule, replace a `...Bal<X>Bundle` spread with the `Ds*` standalone symbols that the migrated template uses. Import them from `@helvetia-design/angular`. The template is the `.html` beside the class or the inline `template:`. Without these symbols Angular fails with NG8001 on the `ds-*` tag, and `formControlName` finds no ControlValueAccessor. The "Tags and imports" section of each `migration.md` names its bundle and its symbols.

- Keep the spread and its import while the template still uses a legacy tag from that bundle. Examples are `bal-check` and `bal-switch` (checkbox), a `bal-radio-icon` outside a radio, a group left in place, or a `bal-field` left in place. Add the `Ds*` symbols next to the spread.
- Delete the bundle symbol from the `@baloise/ds-angular` import once its last spread is gone.
- A component migration never removes a multi-family bundle: `BalFormBundle`, `BalLayoutBundle`, `BalTypographyBundle` or `BalComponentBundle`. Add the `Ds*` symbols next to it.
- `BalFieldBundle` and `BalFormGridBundle` have no `Ds*` symbols. Remove them once no tag of the bundle is left in that template. Add nothing.
- When `shared/field.md` removes the last `bal-field*` tag of a template, the control migration also removes the `...BalFieldBundle` spread of that template.

Report each `BalProps.*` left in place, each legacy `T` kept because the Events table names no detail, each detail alias written out, each multi-family bundle kept and each spread kept because a legacy tag is left. Name the file and the line. They go under Needs your attention. The `migration.md` checklist item that covers types or bundles gets one outcome line per occurrence.

#### Manual

List every file matching `components/*.md` or `components/*/migration.md` in this skill folder. Build a picker from each file's title (the first Markdown heading). Wait for one choice, then ask the cascade question below.

If that list is empty, report that no component migrations are available yet, then stop.

#### Detect

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-migratable.mjs <project-root>
```

The script prints one JSON object. `suggested` contains used `bal-*` components that have a migration, with their usage total. `notYet` contains used components for which this skill has no migration. A total counts usages: opening tags, JSX elements and `Bal*` symbols, not closing tags. A component scanner's `total` also counts closing tags, so it is usually higher than the Detect total for the same component. Do not compare the two. `types` contains legacy type namespaces such as `BalEvents`, `BalProps` and `BalLanguage`. A member such as `BalEvents.BalSegmentCustomEvent` also counts for its component when that component has a migration. They are not components, are never offered, and do not count as left.

Show `notYet`, if it is not empty, as used components that cannot be migrated by this version of the skill. Do not offer them as choices.

If `types` is not empty, show it as a note: a component migration rewrites the legacy types of the components it migrates (see Legacy types and bundles), and the other legacy types stay until their code is rewritten by hand.

If `suggested` is empty, report that none of the used components has an available migration, then stop.

Build a picker from every entry in `suggested`, showing its `name` and `total`. Wait for one choice, then ask the cascade question below.

#### Cascade question

After Manual or Detect, run the chosen component's scanner, `scripts/scan-bal-<name>.mjs`, as its `migration.md` Scan step describes. When `total` is 0, dispatch to `components/<name>/migration.md`, which reports that there is nothing to migrate.

Otherwise run the migratable scan on the files it found:

```bash
node <this-skill-directory>/scripts/scan-migratable.mjs <project-root> <file> [<file> ...]
```

When `suggested` lists no component besides the chosen one, dispatch to `components/<name>/migration.md`.

Otherwise ask one yes/no, naming the other components with their `total`: also migrate the other `bal-*` components in these files? On yes, follow `shared/batch.md` with those files and that JSON. On no, dispatch to `components/<name>/migration.md`, as without the question.

#### Scope

Ask for one or more paths relative to `<project-root>`, such as a feature folder or a page. Folders include every source file below them.

```bash
node <this-skill-directory>/scripts/scan-migratable.mjs <project-root> <path> [<path> ...]
```

When the JSON has an `unmatched` list, show it, ask for corrected paths, and run the scan again.

Then follow `shared/batch.md` with those paths and that JSON.

Scope does not follow imports. A child component in another folder stays `bal-*` until you add that folder to the paths.

### CSS utils

Rewrite the legacy Baloise utility classes in the project to their Helvetia names, following `shared/css-utils.md`, and delete the Baloise utilities line once no legacy class is left. Component migrations do not rewrite utility classes. This step covers them for the whole project or for a path list.

1. Ask whether to scan the whole project or a list of paths. Run the Scan section of `shared/css-utils.md`, with the paths when the user gave any. Show the findings grouped by file (path, line, snippet, and each class move), the total per group, and the `dynamic` list. Then decide whether the Baloise utilities line can go: it can when a whole-project scan (the same one, when no paths were given) reports no `lost` move, no `dynamic` place and no move outside the scanned files. In that case, list each Baloise utilities line that the Legacy utilities line section of `shared/css-utils.md` would delete after the findings.
2. When step 1 listed class moves with a `to`, ask one yes/no: rewrite every listed class and delete every listed line? When it listed only lines to delete, ask one yes/no: delete every listed line? On no, stop with the files unchanged. When it listed neither, say that nothing can be rewritten or deleted, naming the `lost` moves and `dynamic` places, and skip to step 5.
3. Apply the Rewrite section of `shared/css-utils.md` to every listed move.
4. Apply the Legacy utilities line section of `shared/css-utils.md`. It scans the whole project again and deletes only the lines that step 2 confirmed.
5. Append a `css-utils` section to `ds-migration-report.md` as `shared/report.md` describes. Its checklist holds the `U1.`, `U2.`, ... items from the Report section of `shared/css-utils.md`.
6. Stop. Do not run `git add` or `git commit`. Leave every change unstaged for the consumer to review.

### Assets

Migrate every legacy icon left in the project, following `shared/icons.md`. Component migrations already handle the icons in the files they touch. This step covers the rest, such as a constants file that imports `balBrandIcon*` symbols but has no `bal-*` tag. It also moves the fonts and favicons to `@helvetia-design/assets`, following `shared/fonts-favicons.md`, and deletes the legacy config call once no `bal-*` component is left, following `shared/legacy-config.md`.

1. Run the icon scan from `shared/icons.md` without file arguments, so it covers the whole project. Show the findings grouped by file (path, line, snippet) and end with the total count. Then run `scan-assets.mjs` from the Scan section of `shared/fonts-favicons.md`, and show its findings grouped by file the same way, with its total count and the `project` values. Then run the Scan section of `shared/legacy-config.md`. No component is being migrated here, so every `bal-*` component that `scan-migratable.mjs` reports counts as left. List each call it marks for deletion after the icon and asset findings. Then read the Vite config section of `shared/fonts-favicons.md` without editing anything, and list its lines last.
2. When step 1 listed icon or asset findings, ask one yes/no: rewrite every listed usage and delete every listed call? This one answer covers the icons, the fonts and favicons, and the legacy config calls. When it listed only calls to delete, ask one yes/no: delete every listed call? On no, stop with the files unchanged. When it listed neither, say there are no legacy icons, fonts or favicons left to migrate and skip steps 3 and 4. The Vite config lines need no confirmation, because this step never edits a Vite config. They go into the report in every case, also when step 1 listed nothing else.
3. When the icon scan found anything, apply every rule in `shared/icons.md` to the listed files.
4. When `scan-assets.mjs` found anything, apply the sections of `shared/fonts-favicons.md` in this order: Dependencies, then Fonts, then Favicons.
5. Apply the Vite config section of `shared/fonts-favicons.md` in every case. It only lists lines and edits no file.
6. Apply the Decide section of `shared/legacy-config.md`.
7. Append an `assets` section to `ds-migration-report.md` as `shared/report.md` describes. Its checklist holds the `I1.`, `I2.`, ... items from the Report section of `shared/icons.md`, then the `A1.`, `A2.`, ... items from the Report section of `shared/fonts-favicons.md`, then the `L1.`, `L2.`, ... items from the Report section of `shared/legacy-config.md`. Skip the final whole-project scan of `shared/icons.md`, which this step already is.
8. Stop. Do not run `git add` or `git commit`. Leave every change unstaged for the consumer to review.

### Cleanup

Delete what Init kept for the transition, once the migration is complete, following `shared/cleanup.md`. Run this step last, after **Components**, **CSS utils** and **Assets**.

1. Run `scan-cleanup.mjs` from the Scan section of `shared/cleanup.md`. It runs `scan-migratable.mjs` first.
   - When `status` is `incomplete`, do not edit files. List every entry in `outstanding.suggested` with its `total` and say to migrate it with **Components** first. List every entry in `outstanding.notYet` with its `total` as a component that this version of the skill cannot migrate, which the consumer must replace by hand. List every entry in `outstanding.types` with its `total` as legacy types that the consumer must replace by hand, because removing the `@baloise/ds-*` dependency breaks every file that still imports them. List every line in `outstanding.hidden` (path, line, snippet) as a `bal-*` tag that the scan cannot attribute to a component, which the consumer must migrate by hand. Stop.
   - When `status` is `nothing-to-clean-up`, do not edit files. Say there is nothing to clean up. List every line in `keep.lines`, every entry in `keep.dependencies` and every file in `unreadable` as in step 2. Stop.
2. When `status` is `ready`, show what the step deletes: every line in `remove.lines` (path, line, snippet) and every entry in `remove.dependencies` (manifest, field, name). Then show what stays: every line in `keep.lines` and every entry in `keep.dependencies` with the pointer that the Scan section of `shared/cleanup.md` gives for its `reason`, and every file in `unreadable`. Say that the scan skips build output such as `dist` and `build`, and ask the consumer to check build tooling outside the scanned files for legacy references. Ask one yes/no: delete every listed line and dependency? On no, stop with the files unchanged.
3. Apply the Lines section of `shared/cleanup.md`.
4. Apply the Dependencies section of `shared/cleanup.md`. It runs `installCommand` only when it deleted a dependency.
5. Append a `cleanup` section to `ds-migration-report.md` as `shared/report.md` describes. Its checklist holds the `C1.`, `C2.`, ... items from the Report section of `shared/cleanup.md`. Under `### Files changed`, list every file this step edited.
6. Stop. Do not run `git add` or `git commit`. Leave every change unstaged for the consumer to review.
