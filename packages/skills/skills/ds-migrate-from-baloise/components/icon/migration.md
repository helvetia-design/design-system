# icon

Migrate every `bal-icon` usage to `ds-icon`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The legacy folder has no child elements. Rewrite `bal-icon` only. The old `.icon-text` class is a stylesheet utility, not a tag, and is out of scope here.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-icon.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-icon` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line. This step is finished when every finding matches the mapping.

### Props

| old (`bal-icon`) | new (`ds-icon`) | handling |
| --- | --- | --- |
| `name` | `name` | Copy the value, then apply the icon name rule from `shared/icons.md`. It covers the legacy `alert` / `info` lookup shim and the name map. |
| `svg` | `svg` | Copy as-is. |
| _(none)_ | `src` | New prop. Nothing to migrate from. Leave `src` unset. |
| `size` omitted or `size=""` | omit `size` | Leave `size` unset. Legacy default is 18px and the unset `ds-icon` size is 16px. There is no closer public size. |
| `size="xsmall"`, `size="x-small"` | `size="sm"` | Nearest public size. Legacy `xsmall` / `x-small` is 12px. `ds-icon` has no `xs`; `sm` is 14px. An unmapped size paints at the 16px base, which is farther away. Also rewrite `size='xsmall'`, `size='x-small'`, `size={"xsmall"}`, `size={"x-small"}`, `size={'xsmall'}`, and `size={'x-small'}`. |
| `size="small"` | `size="sm"` | 14px on both sides. Also rewrite `size='small'`, `size={"small"}`, and `size={'small'}`. |
| `size="medium"` | `size="md"` | Nearest public size. Legacy `medium` is 26px and `md` is 24px. Also rewrite `size='medium'`, `size={"medium"}`, and `size={'medium'}`. |
| `size="large"` | `size="xl"` | Legacy `large` is 40px, which is `xl`. `lg` is 32px. Also rewrite `size='large'`, `size={"large"}`, and `size={'large'}`. |
| `size="x-large"` | `size="xl"` | Largest public size. Legacy `x-large` is 80px and `xl` is 40px. Mention each clamp in the report. Also rewrite `size='x-large'`, `size={"x-large"}`, and `size={'x-large'}`. |
| `size="xx-large"` | `size="xl"` | Largest public size. Legacy `xx-large` is 176px and `xl` is 40px. `ds-icon` has no `2xl`. Mention each clamp in the report. Also rewrite `size='xx-large'`, `size={"xx-large"}`, and `size={'xx-large'}`. |
| `size="sm"` / `size="md"` / `size="lg"` / `size="xl"` | same | Copy as-is. |
| `inline` | `inline` | Copy as-is, including `inline="false"` and `inline={false}`. |
| `inverted` | `inverted` | Copy as-is, including `inverted="false"` and `inverted={false}`. |
| `turn` | `turn` | Copy as-is, including `turn="false"` and `turn={false}`. |
| `shadow` | `shadow` | Copy as-is, including `shadow="false"` and `shadow={false}`. |
| `disabled` | `disabled` | Copy as-is, including `disabled="false"` and `disabled={false}`. |
| `invalid` | `invalid` | Copy as-is, including `invalid="false"` and `invalid={false}`. |
| `color` omitted, `color=""`, `color="primary"`, `color="blue"`, `color="primary-light"`, `color="primary-dark"`, `color="auto"` | omit `color` | Drop `color`. Default rendering is primary. `blue` used the primary token. The primary shades and `auto` have no public equivalent. Also drop `color='blue'`, `color={"blue"}`, and `color={'blue'}`, and the same quote forms for the other dropped values. |
| `color="white"` | `inverted` | HTML and Angular: write `inverted="true"`. React: write `inverted`. Also rewrite `color='white'`, `color={"white"}`, and `color={'white'}`. When `inverted` is already true (`inverted`, `inverted="true"`, `inverted={true}`), drop `color` and keep that `inverted`. When `inverted` is false (`inverted="false"`, `inverted={false}`), replace that false value with the true form above and drop `color`. White is the legacy white token; a false `inverted` is not white. |
| `color="grey"` / `color="success"` / `color="danger"` / `color="warning"` / `color="info"` | same | Copy as-is. |
| `color="grey-light"`, `color="grey-dark"` | `color="grey"` | Shade dropped. Also rewrite the `'...'`, `{"..."}`, and `{'...'}` forms. |
| `color="success-dark"`, `color="success-darker"` | `color="success"` | Shade dropped. Also rewrite the `'...'`, `{"..."}`, and `{'...'}` forms. |
| `color="warning-dark"`, `color="warning-darker"` | `color="warning"` | Shade dropped. Also rewrite the `'...'`, `{"..."}`, and `{'...'}` forms. |
| `color="danger-dark"`, `color="danger-darker"` | `color="danger"` | Shade dropped. Also rewrite the `'...'`, `{"..."}`, and `{'...'}` forms. |
| `color="light-blue"` | omit `color` | No public equivalent. Drop `color`. Do not invent a substitute. Mention each dropped `light-blue` in the report. Also drop `color='light-blue'`, `color={"light-blue"}`, and `color={'light-blue'}`. |
| `tile`, `tileColor` | _(no equivalent prop)_ | Drop `tile` and `tileColor`, including `tile="false"`, `tile={false}`, and every `tileColor` value (`purple`, `red`, `yellow`, `green`). `ds-icon` does not render a tile. Mention each dropped tile in the report. |
| `colorHovered`, `colorPressed` | _(no equivalent prop)_ | Drop both, including every value. Mention each drop in the report. |
| `hovered`, `pressed` | _(no equivalent prop)_ | Internal legacy props. Drop both. |

When `size` or `color` is an expression whose branches are all string literals, such as `size={cond ? 'large' : 'medium'}` or `[size]="x ? 'small' : 'large'"`, map each branch with the rows above: `'large'` becomes `'xl'` and `'medium'` becomes `'md'`. A branch that the rows drop, such as a `color` of `'blue'`, becomes `undefined`, because a ternary needs a value in every branch. A `color` branch of `'white'` has no single prop form here. Every other `size` or `color` expression is handled by framework. HTML keeps it and reports it. React and Angular keep it when the expression's type only admits `sm`, `md`, `lg` or `xl` (`size`) or `primary`, `info`, `grey`, `success`, `danger` or `warning` (`color`). Otherwise apply Unmapped props and handlers (`SKILL.md`). This covers the expression with a `'white'` branch too.

### Tags and imports

- **HTML**: `<bal-icon>` becomes `<ds-icon>`, including the closing tag.
- **Angular**: `<bal-icon>` becomes `<ds-icon>` in `.html` templates and in inline `template:` strings, including the closing tag. When a file imports `BalIcon` from `@baloise/ds-angular`, move only `BalIcon` to `import { DsIcon } from '@helvetia-design/angular'` and leave the other symbols on the `@baloise` import.
- **React**: `<BalIcon>` becomes `<DsIcon>` and `</BalIcon>` becomes `</DsIcon>`. Import `DsIcon` from `@helvetia-design/react`. When the existing `@baloise/ds-react` import also binds other symbols, move only `BalIcon` to `import { DsIcon } from '@helvetia-design/react'` and leave the other symbols on the `@baloise` import.

Leave any child content in place. Neither component projects children.

### Events

There are no event changes. Neither `bal-icon` nor `ds-icon` emits a custom event. Leave existing event bindings unchanged.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every dropped `tile`.
2. Every dropped `tileColor`.
3. Every dropped `colorHovered`.
4. Every dropped `colorPressed`.
5. Every dropped `light-blue`.
6. Every `x-large` or `xx-large` clamped to `xl`.
7. Every `size` or `color` expression, kept or removed (Unmapped), including a ternary with a `'white'` branch.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
