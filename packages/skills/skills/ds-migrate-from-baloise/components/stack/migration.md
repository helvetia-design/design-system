# stack

Migrate every `bal-stack` usage to `ds-stack`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The legacy folder has no child elements. Rewrite `bal-stack` only. Both components render the default slot.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-stack.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

The scan finds the tag and the `BalStack` binding. It does not find type references such as `BalProps.BalStackLayout`. Those types have no `ds-*` equivalent and are not rewritten.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-stack` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line. This step is finished when every finding matches the mapping.

### Direction

The default changed. `bal-stack` lays out as a row when it has no `layout` and no `direction`. `ds-stack` lays out as a column. `layout` is gone and `direction` replaces it with different values.

| old (`bal-stack`) | new (`ds-stack`) | handling |
| --- | --- | --- |
| _(neither `layout` nor `direction`)_, `layout=""` | `direction="row"` | Add it, so the layout does not flip to a column. Skip it when a dynamic `layout` or `direction` binding is on the element, and list that usage for review. |
| `layout="horizontal"` | `direction="row"` | Rename the attribute and the value. Also handle the single-quoted and `{"…"}` / `{'…'}` forms. |
| `layout="vertical"` | `direction="column"` | Same. |
| `layout="horizontal-reverse"` | `direction="row-reverse"` | Same. |
| `layout="vertical-reverse"` | `direction="column-reverse"` | Same. |
| `direction="row"` / `"column"` (deprecated) | same | Copy as-is. Both values are valid on `ds-stack`. |
| `[layout]="x"`, `[attr.layout]="x"`, `layout={x}`, `:layout="x"`, `v-bind:layout="x"`, and the same forms for `direction` | `direction` | Dynamic value. Do not guess the mapping. Rename `layout` to `direction` in the binding and keep the expression: `[layout]="x"` becomes `[direction]="x"` and `layout={x}` becomes `direction={x}`. A `direction` binding keeps its name. HTML: write the binding and list the file and line for manual review, so the consumer maps `horizontal` to `row`, `vertical` to `column`, `horizontal-reverse` to `row-reverse` and `vertical-reverse` to `column-reverse`. React and Angular: write it when the expression's type only admits `row`, `column`, `row-reverse` or `column-reverse`. Otherwise apply Unmapped props and handlers (`SKILL.md`). The element also gets no added `direction`. |

### Sizes

`space`, `space-row` (React / Angular: `spaceRow`), `space-column` (`spaceColumn`), `px` and `py` keep their names. The values changed to short names.

| old value | new value |
| --- | --- |
| `xx-small` | `2xs` |
| `x-small` | `xs` |
| `small` | `sm` |
| `normal` | `base` |
| `medium` | `md` |
| `large` | `lg` |
| `x-large` | `xl` |
| `xx-large` | `2xl` |
| `auto`, `none` | same (`auto` is valid for the `space*` props only) |

Rewrite static values only, in every quoting form. Map `xx-large` to `2xl` and `xx-small` to `2xs` yourself. `ds-stack` does map the old names at runtime with a deprecation warning, but rewriting them avoids the warning.

Dynamic bindings (`[space]="x"`, `space={x}`, `:space="x"`, and the same for the other props) keep their names. HTML: copy them unchanged and list them for manual review. React and Angular: copy a binding when the expression's type only admits the new values. `space`, `spaceRow` and `spaceColumn` take `auto`, `none`, `2xs`, `xs`, `sm`, `base`, `md`, `lg`, `xl` and `2xl`. `px` and `py` take the same values without `auto`. Otherwise apply Unmapped props and handlers (`SKILL.md`).

`space-column` needs extra care. In `bal-stack` it is a legacy bug: the prop sets the row gap, the same as `space-row`. `ds-stack` applies a real column gap. Rename the value as above, keep the attribute, and list every `space-column` usage, static or dynamic, so the consumer can check the spacing.

### Other props

`align`, `fit-content` (`fitContent`) and `use-wrap` (`useWrap`) are copied as-is. The internal `alignment` prop is also copied. `ds-stack` adds a `p` prop for padding on all sides. It has no legacy equivalent, so nothing is added.

### Tags and imports

- **HTML**: `<bal-stack>` becomes `<ds-stack>`, including the closing tag.
- **Angular**: `<bal-stack>` becomes `<ds-stack>` in `.html` templates and in inline `template:` strings, including the closing tag. When a file imports `BalStack` from `@baloise/ds-angular`, move only `BalStack` to `import { DsStack } from '@helvetia-design/angular'` and leave the other symbols on the `@baloise` import. Replace `BalStack` with `DsStack` in `imports:` lists too.
- **React**: `<BalStack>` becomes `<DsStack>` and `</BalStack>` becomes `</DsStack>`. Import `DsStack` from `@helvetia-design/react`. When the existing `@baloise/ds-react` import also binds other symbols, move only `BalStack` to `import { DsStack } from '@helvetia-design/react'` and leave the other symbols on the `@baloise` import.

### Events

There are no event changes. Neither `bal-stack` nor `ds-stack` emits a custom event.

### Methods

Neither component has a public method a consumer calls. There is no sibling-file rule for this component.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every dynamic `layout`, `direction`, `space*`, `px` or `py` binding, with the framework outcome (renamed or copied in HTML, renamed, copied or removed (Unmapped) in React and Angular). Name the value mapping for each renamed `layout`.
2. Every `space-column` usage, static ones included. Legacy `bal-stack` applied it as a row gap, `ds-stack` applies a column gap, so the spacing can change.
3. Every type reference that the scan cannot see, such as `BalProps.BalStackLayout`.
4. One-time note, when at least one stack was migrated, one line and not one per usage: the scan cannot see `.bal-stack` and `.bal-stack--*` selectors, and they do not carry over to `ds-stack`, which renders in shadow DOM.

Coverage only, written to the file:

5. Every `direction="row"` that was added.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
