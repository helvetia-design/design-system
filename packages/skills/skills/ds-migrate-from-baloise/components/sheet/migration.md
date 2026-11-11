# sheet

Migrate every `bal-sheet` usage to `ds-sheet`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The legacy folder has no child elements. Rewrite `bal-sheet` only. Both components render the default slot.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-sheet.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

The scan finds the tag and the `BalSheet` binding. It does not find type references such as `BalProps.BalSheetContainer`. That type has no `ds-*` equivalent and is not rewritten.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-sheet` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line. This step is finished when every finding matches the mapping.

### Props

| old (`bal-sheet`)                                                                                                           | new (`ds-sheet`)  | handling                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `container-size="fluid"` / `"compact"` (React / Angular: `containerSize`)                                                   | same              | Copy as-is. Also keep the single-quoted and `{"…"}` / `{'…'}` forms.                                                                                                                                                                                                                                                                                               |
| _(no `container-size`)_, `container-size=""`                                                                                | same              | Copy as-is. Both components use the default width, so nothing is added.                                                                                                                                                                                                                                                                                            |
| `container-size="detail-page"` / `"blog-page"`                                                                              | _(no equivalent)_ | Apply Unmapped props and handlers (`SKILL.md`). `ds-sheet` only accepts `fluid` and `compact`, and `@OneOf` logs a warning for any other value.                                                                                                                                                                                                                    |
| `[containerSize]="x"`, `[attr.container-size]="x"`, `containerSize={x}`, `:container-size="x"`, `v-bind:container-size="x"` | same              | Dynamic value. Do not guess the mapping. HTML: copy the binding unchanged and list the file and line for manual review, because the value may be `detail-page` or `blog-page` at runtime. React and Angular: copy it when the expression's type only admits `fluid` or `compact` (`SheetContainerSize`). Otherwise apply Unmapped props and handlers (`SKILL.md`). |

### Tags and imports

- **HTML**: `<bal-sheet>` becomes `<ds-sheet>`, including the closing tag.
- **Angular**: `<bal-sheet>` becomes `<ds-sheet>` in `.html` templates and in inline `template:` strings, including the closing tag. When a file imports `BalSheet` from `@baloise/ds-angular`, move only `BalSheet` to `import { DsSheet } from '@helvetia-design/angular'` and leave the other symbols on the `@baloise` import. Replace `BalSheet` with `DsSheet` in `imports:` lists too.
- **React**: `<BalSheet>` becomes `<DsSheet>` and `</BalSheet>` becomes `</DsSheet>`. Import `DsSheet` from `@helvetia-design/react`. When the existing `@baloise/ds-react` import also binds other symbols, move only `BalSheet` to `import { DsSheet } from '@helvetia-design/react'` and leave the other symbols on the `@baloise` import.

### Events

There are no event changes. Neither `bal-sheet` nor `ds-sheet` emits a custom event.

### Methods

Neither component has a public method a consumer calls. There is no sibling-file rule for this component.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every dynamic `containerSize` binding, with the framework outcome (copied in HTML, copied or removed in React and Angular).
2. Every `container-size="detail-page"` and `"blog-page"`, because `ds-sheet` has no such width. Name file, line and old value, with its Unmapped props and handlers outcome.
3. Every type reference that the scan cannot see, such as `BalProps.BalSheetContainer`.
4. One-time note, when at least one sheet was migrated: the scan cannot see custom `--bal-sheet-background`, `--bal-sheet-radius`, `--bal-sheet-shadow` and `--bal-sheet-position-bottom` overrides, and they do not carry over to `ds-sheet`. The variables are renamed to `--sheet-background`, `--sheet-radius`, `--sheet-shadow` and `--sheet-position-bottom`.
5. One-time note, when at least one sheet was migrated: the scan cannot see `.bal-sheet` and `.bal-sheet__container` selectors, and they do not carry over to `ds-sheet`, which renders in shadow DOM.
6. One-time note, when at least one sheet was migrated: the host no longer sets font family, weight and size, so content inherits them from its surroundings.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
