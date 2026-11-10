# input

Migrate every `bal-input` usage to `ds-input`, and every `bal-input-date` usage to `ds-datepicker`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The legacy folder has one consumer child tag, `bal-input-date`. It is a text field with a date mask and no calendar. The closest new component is `ds-datepicker`, so the two tags map to different components. `ds-input` has no date mask and `type="date"` renders the native browser widget, so do not map `bal-input-date` to `ds-input`.

Other legacy tags that start with `bal-input` are different components and are not part of this migration: `bal-input-group`, `bal-input-slider` (see `components/input-slider/migration.md`), `bal-input-stepper` (see `components/input-stepper/migration.md`). `bal-number-input` is a separate component too. The scan does not list them.

A surrounding `bal-field`, `bal-field-label`, `bal-field-control` and `bal-field-message` wrapper is handled by `shared/field.md` in the Rewrite step, in the same pass. `components/field/migration.md` migrates `bal-form-grid` and `bal-form-col`.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-input.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-input` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line. This step is finished when every finding matches the mapping.

### Props of `bal-input` → `ds-input`

| old (`bal-input`)                                                                                                                                                                                                                                                                                              | new (`ds-input`)                                          | handling                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`, `invalid`, `type`, `accept`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `debounce`, `placeholder`, `max`, `maxLength`, `min`, `minLength`, `multiple`, `pattern`, `allowedKeyPress`, `spellcheck`, `disabled`, `readonly`, `suffix`, `inputmode`, `mask`, `value`, `autoInvalidOff` | same                                                      | Copy as-is, in every form (`disabled`, `disabled="true"`, `[disabled]="x"`, `disabled={x}`). Keep form bindings such as `[(ngModel)]`, `formControlName`, and `[formControl]` unchanged. The `mask` values are the same seven names. |
| `required` set                                                                                                                                                                                                                                                                                                 | `required`                                                | Copy as-is.                                                                                                                                                                                                                          |
| `required` omitted                                                                                                                                                                                                                                                                                             | `required` set to false                                   | Follow the required default rule in `SKILL.md`. Report each file where this was added.                                                                                                                                               |
| `textAlign`, `hasIconRight`                                                                                                                                                                                                                                                                                    | _(no equivalent prop)_                                    | Apply Unmapped props and handlers (`SKILL.md`). It has no effect after the migration.                                                                                                                                                |
| `clickable`                                                                                                                                                                                                                                                                                                    | _(no equivalent prop)_                                    | Apply Unmapped props and handlers (`SKILL.md`). The click is now reported by the new `dsClick` event, so the consumer can replace the pattern, but do not do it yourself.                                                            |
| _(none)_                                                                                                                                                                                                                                                                                                       | `label`, `description`, `color`, `loading`, `invalidText` | New props. Nothing to migrate from. Leave them unset.                                                                                                                                                                                |

### Props of `bal-input-date` → `ds-datepicker`

Same rules as `components/date/migration.md`, which documents `ds-datepicker` in full.

| old (`bal-input-date`)                                                                                            | new (`ds-datepicker`)                | handling                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `invalid`, `disabled`, `readonly`, `placeholder`, `autocomplete`, `min`, `max`, `value`, `autoInvalidOff` | same                                 | Copy as-is. Keep form bindings unchanged.                                                                                                      |
| `required` set / omitted                                                                                          | `required` / `required` set to false | Same as for `ds-input`. Follow the required default rule in `SKILL.md`. Report each file where this was added.                                 |
| `clickable`, `hasIconRight`                                                                                       | _(no equivalent prop)_               | Apply Unmapped props and handlers (`SKILL.md`).                                                                                                |
| `allowInvalidValue`                                                                                               | _(no equivalent)_                    | Drop it in every form and report it as a logic change: legacy emitted the string `INVALID_VALUE` from `balChange`, `ds-datepicker` never does. |

### Tags and imports

- **HTML**: `<bal-input>` becomes `<ds-input>` and `<bal-input-date>` becomes `<ds-datepicker>`, including the closing tags.
- **Angular**: the same tag renames in `.html` templates and in inline `template:` strings, including the closing tags. When a file imports `BalInput` or `BalInputDate` from `@baloise/ds-angular`, move only those symbols to `import { DsInput, DsDatepicker } from '@helvetia-design/angular'` (only the ones the file used) and leave the other symbols on the `@baloise` import. Rename them in `imports: [...]` as well. `DsInput` and `DsDatepicker` bring their own `ControlValueAccessor`, so `ngModel` and reactive forms keep working.
- **React**: `<BalInput>` becomes `<DsInput>` and `<BalInputDate>` becomes `<DsDatepicker>`, including the closing tags. Import them from `@helvetia-design/react`. When the existing `@baloise/ds-react` import also binds other symbols, move only `BalInput` and `BalInputDate` and leave the others on the `@baloise` import. If the file already imports `DsDatepicker` from `@helvetia-design/react`, add to that import instead of creating a second one.

### Events

Both tags emit the same five events, and both new components add `dsClick`.

| old           | new          | handling                                                                                                                                                            |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `balChange`   | `dsChange`   | HTML: `addEventListener('balChange'` becomes `addEventListener('dsChange'`. Angular: `(balChange)` becomes `(dsChange)`. React: `onBalChange` becomes `onDsChange`. |
| `balInput`    | `dsInput`    | Same shapes: `(balInput)`, `onBalInput`, and `addEventListener('balInput'` become the `ds` forms.                                                                   |
| `balBlur`     | `dsBlur`     | Same shapes.                                                                                                                                                        |
| `balFocus`    | `dsFocus`    | Same shapes.                                                                                                                                                        |
| `balKeyPress` | `dsKeyPress` | Same shapes.                                                                                                                                                        |

Rewrite only handlers that are attached to the element being migrated. `balChange`, `balInput`, `balBlur`, and `balFocus` are emitted by many other legacy components, so never rewrite a handler on another element, and never rename them by search and replace across the file.

The detail types `BalEvents.BalInput*Detail` and `BalEvents.BalInputDate*Detail` are not rewritten. List each use as "type needs manual rework".

When the value in `balChange` or `balInput` is read, note that it is `string | undefined` in legacy and `string | null` in the new components. A cleared field now yields `null`. Do not edit the handler, report it.

### Methods

`setFocus()` and `getInputElement()` keep their names, and so does `setBlur()` (it was `@internal` in legacy). `setAriaForm()` does not exist on the new components. Apply Unmapped props and handlers (`SKILL.md`).

Angular splits a component across `x.component.html` and `x.component.ts`, and the class file often calls these methods through `@ViewChild` or `viewChild` without naming the tag, so the scan cannot see it. For every `.html` finding, open the same-basename `.ts` file beside it and check it for `setAriaForm` calls and for `balChange`, `balInput`, and `INVALID_VALUE`. React and plain HTML callers hold the element in a ref or a query result, so look for calls on that variable in the same file.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every dropped `allowInvalidValue`.
2. Every event handler that needs manual rework.
3. Every `setAriaForm()` call, with its Unmapped props and handlers outcome.
4. Every unsupported `textAlign`, with its Unmapped props and handlers outcome.
5. Every unsupported `clickable`, with its Unmapped props and handlers outcome. The new `dsClick` event reports the click, so the consumer can replace the pattern.
6. Every unsupported `hasIconRight`, with its Unmapped props and handlers outcome.
7. Every use of a `BalEvents.BalInput*Detail` or `BalEvents.BalInputDate*Detail` type, listed as "type needs manual rework".
8. Every handler or form binding that reads the value. A cleared field now yields `null` where legacy yielded `undefined`, so code that checks `=== undefined` needs review.
9. Every place that compares against the string `INVALID_VALUE`. Search the consumer code for it.
10. Every file where `allowInvalidValue` was dropped, reviewed for logic that relies on `INVALID_VALUE`.
11. Every `bal-input-date` rewritten to `ds-datepicker`. `bal-input-date` was a plain text field with a date mask, and `ds-datepicker` adds a calendar popup opened from a button. Do not add attributes to compensate.
12. One-time note: `ds-input` and `ds-datepicker` have `label`, `description`, and `color`. Fields may need a `label` now. Do not add one yourself.
13. Every selector that targets the legacy elements and that the scan cannot see, such as classes starting with `bal-input` and the `bal-input-date` internals. Tests and styles that query them break. Do not rewrite those selectors yourself. Report them.

Coverage only, written to the file:

14. Every `required` that was set to false.
15. Every event handler that was renamed.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
