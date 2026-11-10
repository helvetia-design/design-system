# Fonts and favicons

The **Assets** menu item applies these rules. They move the BaloiseCreate fonts and the favicons from `@baloise/ds-styles`, `@baloise/ds-fonts` and `@baloise/ds-favicons` to `@helvetia-design/assets`, and they make the app host the font files itself. `SKILL.md` says when each part runs.

`@helvetia-design/styles/css/design-system` has no `@font-face` rules. Without a font source the app renders the fallback font Arial. `@helvetia-design/styles/css/design-system.local` is the same file plus `@font-face` rules that load the eight BaloiseCreate `.woff` and `.woff2` files from `/assets/fonts`. The app must serve those files from that path.

Never write an import of `@helvetia-design/assets/src/fonts/css/fonts.css` or `@helvetia-design/assets/src/fonts/css/fonts.cdn.css`. `fonts.css` loads the fonts from www.baloise.ch, and `fonts.cdn.css` loads them from cdn.jsdelivr.net. Both send the IP address of every visitor to a third-party host, which is a disclosure of personal data under the Swiss nDSG. Never point `$font-path` at an `http://` or `https://` URL either, and never keep the default `$font-path` of the SCSS fonts file, which is a www.baloise.ch URL.

## Scan

```bash
node <this-skill-directory>/scripts/scan-assets.mjs <project-root>
```

The script prints one JSON object and does not edit files. `files` has the same shape as the component scans, with one finding per line:

- legacy `@baloise/ds-styles` font-bearing stylesheets: `css/font`, `css/all`, `css/basic` and `css/baloise-design-system`, with or without `dist/`, `.min` and `.css`, and the Sass entry points `sass/font`, `sass/all`, `sass/basic` and `sass/baloise-design-system`, with or without `.sass` or `.scss`, also when the line is commented out
- `@helvetia-design/styles` design-system imports: `css/design-system`, `.min`, `.local`, `dist/css/design-system.css` and `scss/design-system`
- every reference to `@baloise/ds-fonts` or `@baloise/ds-favicons`, including `node_modules/...` paths in `angular.json` and `package.json` scripts
- favicon tags: `<link>` with `rel` `icon`, `shortcut icon`, `apple-touch-icon` or `manifest`, and `<meta name="msapplication-config">`

`project` describes where the font files go:

- `framework`: `react`, `angular` or `html`, read from the root `package.json`.
- `publicDir`: `"public"` when a `public/` folder sits at `<project-root>`, or when `<project-root>` has a Vite config (`vite.config.{js,mjs,cjs,ts,mts,cts}`) or a Next config (`next.config.{js,mjs,cjs,ts}`), because Vite and Next serve `public/` even before the folder exists. Else `null`. The folder and these config files decide, not the framework name.
- `angularAssets`: every `assets` entry in `angular.json` that names `src/assets`, per project and target. An `assets` array under `configurations` gets its own item with a `configuration` field, because the Angular CLI replaces the `options` array with it in that configuration. `null` when there is no `angular.json`.

## Dependencies

Apply this section before Fonts and Favicons.

1. When `package.json` does not declare `@helvetia-design/assets`, add it to `dependencies` with the same version string as `@helvetia-design/styles`, and run the install command for the project's lockfile. pnpm does not link transitive dependencies, so the copy source `node_modules/@helvetia-design/assets` exists only when the app declares the package.
2. `@baloise/ds-fonts` and `@baloise/ds-favicons` in `package.json` stay. Report each one as removable once nothing references it. This step does not remove dependencies.

## Fonts

1. When `files` has no `@helvetia-design/styles` design-system finding, do not touch fonts. Report that **Init** must run first.
2. Switch every `@helvetia-design/styles/css/design-system` import to `@helvetia-design/styles/css/design-system.local`, in the syntax of its file. Keep `.min` when it is there: `design-system.min` becomes `design-system.local.min`.
   - A JS or TS side-effect import: `import '@helvetia-design/styles/css/design-system.local'`.
   - A SCSS or CSS line: keep the at-rule of the line (`@import` or `@use`) and change only the path.
   - An HTML `<link>`: keep the existing `href` prefix and change only the file name. `design-system.css` becomes `design-system.local.css`, and `design-system.min.css` becomes `design-system.local.min.css`.
   - An `angular.json` `styles` string: keep the existing prefix and change only the file name, as for an HTML `<link>`. Keep the file valid JSON.
   - A line that already names `design-system.local` stays unchanged.
3. Exception: when the project loads fonts through `@baloise/ds-fonts/scss`, rewrite that line instead and do not switch any import to `design-system.local`. The app must have one `@font-face` source, not two.
   - With `@use`: `@use '@helvetia-design/assets/fonts/scss' with ($font-path: <x>);`.
   - With `@import`: `@import` cannot take `with`. Set `$font-path: <x>;` on the line above `@import '@helvetia-design/assets/fonts/scss';`.
   - `<x>` is the local `$font-path` the line already set, such as `'/assets/fonts'` or `'./assets/fonts'`. When it set none, or set an `http://` or `https://` URL, use `'/assets/fonts'` and report the old value.
4. A SCSS `@use` or `@import` of `@helvetia-design/styles/scss/design-system` has no local variant. Add `@use '@helvetia-design/assets/fonts/scss' with ($font-path: '/assets/fonts');` beside it, matching the at-rule of the file as in rule 3. Skip this when rule 3 already rewrote a fonts line in the project.
5. Delete every active `@baloise/ds-styles/css/font` line, with or without `dist/`, `.min` and `.css`, and every active `@baloise/ds-styles/sass/font` line. The new font source replaces it.
6. Init inserted the comment `TODO: remove these legacy Baloise imports once the Helvetia migration is verified` above the legacy `font`, `structure` and `core` lines. Keep it while a legacy `@baloise/ds-styles` line is still below it. Delete it only when no legacy line is left below it. **Cleanup** deletes it once only `structure` and `core` lines are left below it.
7. Leave every active `css/all`, `css/basic` and `css/baloise-design-system` line in place, and every active `sass/all`, `sass/basic` and `sass/baloise-design-system` line. Each one also carries legacy structure and core styles that the remaining `bal-*` components need. Report that the line still loads `@font-face` from www.baloise.ch until the last `bal-*` component is gone. Leave every commented-out legacy line untouched.
8. Put the font files where the app serves `/assets/fonts`:
   - **`publicDir` is `public`** (a `public/` folder, a Vite config or a Next config at `<project-root>`): copy the eight `.woff` and `.woff2` files once into `public/assets/fonts`, from `<project-root>`. The copy creates `public/` when it does not exist yet:

     ```bash
     node -e "require('node:fs').cpSync('node_modules/@helvetia-design/assets/src/fonts','public/assets/fonts',{recursive:true,filter:s=>!s.endsWith('css')})"
     ```

     Report this script as the way to keep the files in sync after an update. Never write it into `package.json`. When the consumer adds it there, the value is `"node -e \"require('node:fs').cpSync('node_modules/@helvetia-design/assets/src/fonts','public/assets/fonts',{recursive:true,filter:s=>!s.endsWith('css')})\""`.

   - **`angularAssets` lists an entry and `publicDir` is `null`**: add one entry to the same `assets` array of each listed project, target and configuration. Write no copy script.

     ```json
     { "glob": "*.{woff,woff2}", "input": "node_modules/@helvetia-design/assets/src/fonts", "output": "assets/fonts" }
     ```

   - **`framework` is `html`**: copy nothing. Report the target folder: the folder the web server serves as `/assets/fonts`.
   - When none of these cases applies, copy nothing and report the target folder `/assets/fonts` with the copy script.

9. Rewrite every `node_modules/@baloise/ds-fonts/...` input in the `angular.json` `assets` to `node_modules/@helvetia-design/assets/src/fonts`. Keep its `glob` and `output`. When it now duplicates the entry from rule 8, keep only one.
10. Never edit a `package.json` script that copies from `@baloise/ds-fonts` or `@baloise/ds-favicons`. Report it with the replacement script from rule 8 or from Favicons.

## Favicons

`@helvetia-design/assets/src/favicons` holds the same six colours as `@baloise/ds-favicons/assets`: `green`, `primary`, `purple`, `red`, `white` and `yellow`. The files are byte-identical.

1. Rewrite every `node_modules/@baloise/ds-favicons/assets/<colour>/...` path to `node_modules/@helvetia-design/assets/src/favicons/<colour>/...`, in `angular.json` `assets` inputs and in HTML tags. Keep the `output` of an `angular.json` entry, such as `assets/favicons/<colour>`.
2. A tag that points at a copied folder, such as `/assets/favicons/favicon.ico`, keeps its `href`. Only the copy source changes.
3. When `publicDir` is `public` and the legacy copy step put the favicons into a folder that the tags point at under `/assets/favicons`, copy the same colour folder once into `public/<folder the tags point at>`. Tags that point at `/assets/favicons/primary/...` get the files in `public/assets/favicons/primary`:

   ```bash
   node -e "require('node:fs').cpSync('node_modules/@helvetia-design/assets/src/favicons/<colour>','public/<folder the tags point at>',{recursive:true})"
   ```

   Otherwise copy nothing and report the folder and this script.

## Report

These items follow the `I` items of `shared/icons.md` and come before the `L` items of `shared/legacy-config.md`. Each one gets its own line in `ds-migration-report.md`, as `shared/report.md` describes.

Needs your attention when found:

- A1. **Init** has not run: no `@helvetia-design/styles` design-system import found, fonts left unchanged.
- A2. Every active `css/all`, `css/basic`, `css/baloise-design-system`, `sass/all`, `sass/basic` or `sass/baloise-design-system` line left in place, with the note that it still loads `@font-face` from www.baloise.ch until the last `bal-*` component is gone.
- A3. Every SCSS fonts line rewritten to `@helvetia-design/assets/fonts/scss`, with the old and the new `$font-path`.
- A4. Every copy script proposed, with its target folder, and the note that it is not written into `package.json`.
- A5. Every `package.json` script that still copies from `@baloise/ds-fonts` or `@baloise/ds-favicons`, with its replacement.
- A6. The target folder to serve as `/assets/fonts` when nothing was copied.
- A7. Every favicon path rewritten, and where.
- A8. `@helvetia-design/assets` added to `package.json`, with its version and the install command.

Coverage only, written to the file:

- A9. Every design-system import switched to `design-system.local`, and where.
- A10. Every legacy `css/font` or `sass/font` line deleted.
- A11. The Init TODO comment kept or deleted, and why.
- A12. Every font file copied or `angular.json` glob entry added, with its path.
- A13. Every favicon tag found, and where.
- A14. Every `@baloise/ds-fonts` or `@baloise/ds-favicons` dependency that is removable once nothing references it.
