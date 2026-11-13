# data

Migrate every `bal-data` usage to `ds-data`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The legacy folder has three child elements. `bal-data-item` becomes `ds-data-item`, `bal-data-label` becomes `ds-data-label`, and `bal-data-value` becomes `ds-data-value`. The edit button and the `editable` and `multiline` props moved from the value to the item, so the rewrite touches two elements, described under Props below.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-data.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-data` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line, and read the whole `bal-data-item` (not just the scanned tag) before moving props between its children. This step is finished when every finding matches the mapping.

### Props (`bal-data`)

| old (`bal-data`) | new (`ds-data`) | handling |
| --- | --- | --- |
| `horizontal` | `horizontal` | Copy as-is, including `horizontal="true"` and `horizontal={true}`. |
| `border` | _(no equivalent)_ | Drop it in every form (bare, `="true"`, `{true}`, `[border]="x"`, `border={x}`). `ds-data` always shows dividers in the vertical layout. Report each dropped `border` as a rendering difference. |

### Props (`bal-data-item`)

| old (`bal-data-item`) | new (`ds-data-item`) | handling |
| --- | --- | --- |
| `disabled` | `disabled` | Copy as-is. |
| `border` | _(no equivalent)_ | Drop it in every form. Report each dropped `border` as a rendering difference. |
| _(none)_ | `editLabel` | New prop. The label is localised from the language config when omitted. Nothing to migrate from. Leave it unset. |

### Props (`bal-data-label`)

| old (`bal-data-label`) | new (`ds-data-label`) | handling |
| --- | --- | --- |
| `required` | `required` | Copy as-is. |

### Props (`bal-data-value`)

`ds-data-value` has no props. The legacy props are handled as follows:

| old (`bal-data-value`) | new | handling |
| --- | --- | --- |
| `editable`, `editable="true"`, `editable={true}` | `editable` on the enclosing `ds-data-item` | Hoist. Remove it from the value and add it to the `bal-data-item` that contains the value. If the item already has `editable`, do not duplicate it. |
| `multiline`, `multiline="true"`, `multiline={true}` | `multiline` on the enclosing `ds-data-item` | Hoist the same way. |
| `[editable]="x"`, `editable={x}`, `[multiline]="x"`, `multiline={x}` | see handling | Dynamic value. Do not guess. Both props now belong on `ds-data-item`, and `ds-data-value` has neither. HTML: leave the binding unchanged and list the file and line in the report for manual review. React and Angular: apply Unmapped props and handlers (`SKILL.md`). The report says that the consumer moves the expression onto `ds-data-item` by hand. |
| `disabled` | _(no equivalent)_ | Drop it. The legacy prop only disabled the edit button. `ds-data-item` `disabled` greys out the whole item and means something else, so do not map it. Report each dropped `disabled`. |

### Tags and imports

- **HTML**: `<bal-data>`, `<bal-data-item>`, `<bal-data-label>`, and `<bal-data-value>` become `<ds-data>`, `<ds-data-item>`, `<ds-data-label>`, and `<ds-data-value>`, including the closing tags.
- **Angular**: rename the same four tags in `.html` templates and in inline `template:` strings, including the closing tags. When a file imports `BalData`, `BalDataItem`, `BalDataLabel`, or `BalDataValue` from `@baloise/ds-angular`, move only those symbols to `import { DsData, DsDataItem, DsDataLabel, DsDataValue } from '@helvetia-design/angular'` (only the ones the file used) and leave the other symbols on the `@baloise` import. Replace the `Bal*` names with the `Ds*` names in `imports:` lists too.
- **React**: `<BalData>`, `<BalDataItem>`, `<BalDataLabel>`, and `<BalDataValue>` become `<DsData>`, `<DsDataItem>`, `<DsDataLabel>`, and `<DsDataValue>`, including the closing tags. Import them from `@helvetia-design/react`. When the existing `@baloise/ds-react` import also binds other symbols, move only the `BalData*` symbols and leave the others on the `@baloise` import.

### Events

`bal-data-value` emitted `balClick`, `balFocus`, and `balBlur` from its edit button. `ds-data-item` emits none of them, and its inner `ds-button` is not exposed. Apply Unmapped props and handlers (`SKILL.md`) to each handler (`(balClick)="x()"`, `onBalClick={x}`, `addEventListener('balClick', ...)`).

### Methods

Neither component has a public method a consumer calls. There is no sibling-file rule for this component.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every dropped `disabled`. The legacy prop only disabled the edit button.
2. Every dynamic `editable` or `multiline` binding, with the framework outcome (left in HTML, removed (Unmapped) in React and Angular). Both props now belong on `ds-data-item`.
3. Every `balClick`, `balFocus` and `balBlur` handler, which no longer fires, with its Unmapped props and handlers outcome.
4. Every file where `border` was dropped. `ds-data` always shows dividers in the vertical layout and has no `border` prop. Do not add attributes to compensate.
5. Every `horizontal` data list, since the horizontal layout may look different.
6. Every selector that targets the legacy elements and that the scan cannot see. The legacy components set the classes `bal-data`, `bal-data--is-horizontal`, `bal-data--has-border`, `bal-data-item`, `bal-data-label`, `bal-data-value`, and `bal-data-value__button` on their hosts, and the edit button carried `data-testid="bal-data-value-button"`. Tests and styles that query them break. Do not rewrite those selectors yourself. Report them.

Coverage only, written to the file:

7. Every `editable` or `multiline` hoisted to a `ds-data-item`.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
