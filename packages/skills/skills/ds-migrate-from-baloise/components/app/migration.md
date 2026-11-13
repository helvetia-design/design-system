# app → root

Migrate every `bal-app` usage to `ds-root`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The legacy folder has no child elements. Rewrite `bal-app` only. Leave slotted content in place, including legacy tags such as `bal-navbar` and `bal-footer`. Those belong to their own migrations.

There is normally one `bal-app` per project, so expect one or two findings rather than a list.

Read the Config section before rewriting. `bal-app` never configured anything, but `ds-root` does, and a rewrite that only changes the tag leaves the app running on default brand, region, and language without any error.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-app.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

The scan also lists the legacy config calls `initializeBaloiseDesignSystem`, `useBaloiseDesignSystem`, `provideBaloiseDesignSystem` and `BaloiseDesignSystemModule.forRoot`, which usually live in a startup file that never mentions `bal-app`. Those are not tags to rewrite. They are the source values for the Config section.

The scan also lists every `updateBalLanguage` call and import. It usually sits in a component class that never mentions `bal-app`. Handle every such finding with the Language switch section.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-app` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line. This step is finished when every finding matches the mapping.

### Config

`bal-app` held no configuration. The app set it once at startup:

```ts
initializeBaloiseDesignSystem({ language: 'fr', region: 'BE', allowedLanguages: ['fr', 'nl'], icons })
```

`ds-root` does hold configuration, and it reads a different global. When it finds none it configures itself with the defaults: brand `helvetia`, region `CH`, language `de`. Nothing throws. A rewrite that only changes the tag therefore switches a French Belgian app to German Swiss silently. The legacy default brand was `baloise`, so an app that never set a brand also switches brand silently.

Copy the values from the legacy call onto `ds-root`. In React and Angular they sit under `defaults`, as in `useBaloiseDesignSystem({ defaults: { language: 'fr' } })`. In Angular, `forms` is a top-level key next to `defaults`, as in `provideBaloiseDesignSystem({ defaults: { language: 'fr' }, forms: { setInvalid: true } })`. An NgModule app passes the same config to `BaloiseDesignSystemModule.forRoot(config)` from `@baloise/ds-angular-legacy`. Copy its values the same way.

| legacy config key | new home | handling |
| --- | --- | --- |
| `brand` | `brand` attribute | Copy the value. `baloise` and `helvetia` both still exist. |
| _(no `brand` key)_ | `brand` attribute | Write `brand="baloise"` (React: `brand="baloise"` on `DsRootProvider`), unless `ds-root`, `DsRootProvider` or an existing `initializeDesignSystem` call already sets `brand`. The legacy default was `baloise`, and the `ds-root` default is `helvetia`. Mention it in the report. |
| `region` | `region` attribute | Copy the value. The legacy set was `CH`, `DE`, `BE`, `LU`; all four still exist. |
| `language` | `language` attribute | Copy the value. |
| `fallbackLanguage` | `fallback-language` attribute | Copy the value. |
| `allowedLanguages` | `allowed-languages` attribute | The legacy value is an array. The attribute is one comma separated string: `['fr', 'nl']` becomes `allowed-languages="fr,nl"`. In React use `DsRootProvider`, which takes the array unchanged. |
| `animated` | `animated` attribute | Copy as-is. `bal-app` also had this prop; keep whichever value was set. |
| `icons` | `initializeDesignSystem({ icons })`, or the React prop | Do not copy it onto `ds-root`. The Registration rules in `shared/icons.md` handle it: they drop the standard set, which `@helvetia-design/core` already registers, and carry over only custom icons. |
| `logger` | _(no equivalent)_ | Do not carry it over. `ds-root` has a `logger` prop but it is `@internal` and takes component names, not a logger function. Mention each `logger` in the report. |
| `httpFormSubmit` | _(no equivalent)_ | Do not carry it over. The option no longer exists. Mention each one in the report. |
| `forms.*` | _(no equivalent)_ | Do not carry it over, and leave it in the legacy call. The new config has no `forms` key. `@helvetia-design/angular` marks a touched and invalid bound control as `invalid` by itself, so `setInvalid: true, invalidateOn: 'touched'` needs no replacement. Any other value needs a check by hand. Mention each key in the report. |

Leave the legacy `initializeBaloiseDesignSystem`, `useBaloiseDesignSystem`, `provideBaloiseDesignSystem` or `BaloiseDesignSystemModule.forRoot` call unchanged, in every framework. The `bal-*` components still in the app read `language`, `region`, `allowedLanguages` and `fallbackLanguage` only from the global config that this call fills. `ds-root` configures only the `ds-*` components. Without the call, every remaining `bal-*` component falls back to German Swiss without any error. `shared/legacy-config.md` deletes the call once no `bal-*` component is left.

When the scan found no legacy config call, the legacy defaults applied. Write only `brand="baloise"` (React: on `DsRootProvider`), unless `ds-root`, `DsRootProvider` or an existing `initializeDesignSystem` call already sets `brand`. Say in the report that `ds-root` will use region `CH` and language `de`, so the consumer can confirm that is right.

### Language switch

`updateBalLanguage(language)` changes the language of the `bal-*` components only. The `ds-*` components read a different config, so they keep the old language without any error. Add the new call directly after every `updateBalLanguage` call, with the same argument. Skip an `updateBalLanguage` call that already has a `setLanguage(` or `updateDsLanguage(` call with the same argument directly after it. A re-run of `app` would otherwise add a second call. Keep the `updateBalLanguage` call and its import, because the remaining `bal-*` components still need it. `shared/legacy-config.md` deletes it together with the legacy config call.

- **Angular**: call `setLanguage(language)` on an injected `DsConfigService` from `@helvetia-design/angular`. Follow the injection style of the class: `private readonly dsConfig = inject(DsConfigService)`, or a constructor parameter. `DsConfigService` needs `provideDesignSystem()` from `@helvetia-design/angular`. Without it, Angular throws `NullInjectorError` when the class is created. When no `provideDesignSystem()` call exists in the app yet, add `provideDesignSystem()` with no arguments to the providers array that holds `provideBaloiseDesignSystem`: the standalone `app.config.ts`, or the NgModule `providers`. With `BaloiseDesignSystemModule.forRoot`, add it to the `providers` of the NgModule whose `imports` hold that call. Mention it in the report. `ds-root` still applies its own attributes, so both together are safe.
- **Angular without an injection context**: when the `updateBalLanguage` call sits outside an injection context, such as a plain function or a util module instead of a DI class, call `updateDsLanguage(language)` from `@helvetia-design/core` instead of `DsConfigService`. Do the same when the app has no providers array to add `provideDesignSystem()` to, such as a legacy `initializeBaloiseDesignSystem` call in `main.ts`. `DsConfigService.setLanguage` only forwards to `updateDsLanguage`, and `inject()` outside an injection context throws `NG0203`.
- **React and plain HTML or JS**: call `updateDsLanguage(language)` from `@helvetia-design/core`.

The new call takes a `DsLanguage` from `@helvetia-design/core`. Keep a `BalLanguage` type import while `updateBalLanguage` still uses it. When the type checker rejects a `BalLanguage` argument for the new call, type the value as `DsLanguage` and check that `updateBalLanguage` still accepts it.

```ts
// before (Angular)
changeLanguage(language: BalLanguage) {
  updateBalLanguage(language)
}

// after (Angular)
private readonly dsConfig = inject(DsConfigService)

changeLanguage(language: BalLanguage) {
  updateBalLanguage(language)
  this.dsConfig.setLanguage(language)
}
```

### Props

| old (`bal-app`) | new (`ds-root`) | handling |
| --- | --- | --- |
| `animated` | `animated` | Copy as-is, including `animated="false"` and `animated={false}`. |
| `ready` | `ready` | Drop it. It was `@internal` on both and is set by the component. |
| _(none)_ | `brand`, `region`, `language`, `allowed-languages`, `fallback-language` | New props. Fill them from the Config section, not from the old element. |
| _(none)_ | `icons`, `legalLinks`, `legalText`, `socialLinks` | New, and property only. They have no attribute. See the Config section. |

### Tags and imports

- **HTML**: `<bal-app>` becomes `<ds-root>`, including the closing tag. Keep the `class` attribute; `has-sticky-footer` still works.
- **Angular**: `<bal-app>` becomes `<ds-root>` in `.html` templates and in inline `template:` strings, including the closing tag. Add `DsRoot` from `@helvetia-design/angular` to the module or standalone component `imports`. Leave `BalLayoutBundle` and `BalComponentBundle` where they are: `BalApp` is only one entry in them and the other components are still in use. Mention in the report that the bundle still registers `BalApp`.
- **React**: `<BalApp>` becomes `<DsRootProvider>` and `</BalApp>` becomes `</DsRootProvider>`, imported from `@helvetia-design/react`. Copy the config values from `defaults` in the `useBaloiseDesignSystem()` call onto it as props, keeping `allowedLanguages` as an array. Keep the `useBaloiseDesignSystem()` call and its import specifier unchanged. Remove only `BalApp` from the `@baloise/ds-react` import, and leave the other symbols on it.

```tsx
// before
import { useBaloiseDesignSystem, BalApp } from '@baloise/ds-react'
useBaloiseDesignSystem({ defaults: { language: 'fr', region: 'BE', allowedLanguages: ['fr', 'nl'] } })
return <BalApp>{children}</BalApp>

// after
import { useBaloiseDesignSystem } from '@baloise/ds-react'
import { DsRootProvider } from '@helvetia-design/react'
useBaloiseDesignSystem({ defaults: { language: 'fr', region: 'BE', allowedLanguages: ['fr', 'nl'] } })
return (
  <DsRootProvider language="fr" region="BE" allowedLanguages={['fr', 'nl']}>
    {children}
  </DsRootProvider>
)
```

### Events

| old | new | handling |
| --- | --- | --- |
| `balAppReady` | `dsAppReady` | Rewrite `addEventListener('balAppReady'` to `addEventListener('dsAppReady'`. Angular: `(balAppReady)` becomes `(dsAppReady)`. React: `onBalAppReady` becomes `onDsAppReady`. The payload is empty in both. |
| _(none)_ | `dsAnimatedChange`, `dsBrandChange`, `dsRegionChange`, `dsLanguageChange`, `dsAllowedLanguagesChange`, `dsFallbackLanguageChange` | New events. Nothing to migrate from. |

### Methods

`setFocus(elements)` keeps that name and signature.

### Other renames

Rewrite these wherever they appear in a file that has a finding:

| old | new |
| --- | --- |
| `getAppRoot(document)` | `getRootElement(document)` |
| `--bal-app-height` | `--ds-root-height` |
| `.bal-app`, `.bal-app--safari`, `.bal-app--touch` | `.ds-root`, `.ds-root--safari`, `.ds-root--touch` |
| `bal-focusable` / `bal-focused` | `ds-focusable` / `ds-focused` |
| `BalAppCustomEvent<T>` | `RootCustomEvent<T>` from `@helvetia-design/core` |

Class and custom property renames also occur in `.css` and `.scss` files, which this scan does not read. Say so in the report.

### Files to edit beyond the scan

In each file that has a finding, also rewrite `balAppReady` listeners and the renames above when they are not on the element itself, including `addEventListener`.

For every finding in a `.html` file, also open the file with the same name and a `.ts` extension in the same folder, and apply the Events and Other renames rules there. That is the Angular case where the template holds the tag and the class file holds the listener or a `getAppRoot` call, and the class file never names `bal-app`.

Every `updateBalLanguage` finding gets the Language switch rule, in whichever file it sits.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. When the scan found no legacy config call, the note that `ds-root` now uses region `CH` and language `de`. The consumer confirms that these values are right.
2. Every `ds-root` or `DsRootProvider` that got `brand="baloise"` because the legacy call set no `brand` key or no legacy call exists.
3. What the Registration rules in `shared/icons.md` did with the legacy `icons` value.
4. Every `logger` that was not carried over.
5. Every `httpFormSubmit` that was not carried over.
6. Every `forms` key left in the legacy call without a target, with the note from the `forms.*` row of the Config table in `components/app/migration.md`.
7. Every `provideDesignSystem()` added for `DsConfigService`, with its file.
8. One-time note: this scan does not read `.css` and `.scss` files, so they may still use `.bal-app` or `--bal-app-height`.

Coverage only, written to the file:

9. Every config value carried from the legacy call onto `ds-root`.
10. Every `allowedLanguages` array turned into a comma separated attribute.
11. One-time note: in Angular, `BalLayoutBundle` still registers `BalApp`.
12. Every rename from Other renames that this run applied.
13. Every `updateBalLanguage` call and the new call added after it (`DsConfigService.setLanguage()` or `updateDsLanguage()`), or skipped because it was already there.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
