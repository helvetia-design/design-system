# notification

Migrate every `bal-notification` usage to `ds-notification`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The legacy folder has no child elements. Rewrite `bal-notification` only. Leave slotted content in place, including `<h2>`, `<strong>`, and `<p>` children. Do not move a slotted title into `heading`; the report step flags the styling change instead.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-notification.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-notification` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line. This step is finished when every finding matches the mapping.

### Props

| old (`bal-notification`)                                               | new (`ds-notification`)   | handling                                                                                                                                                       |
| ---------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color="info"` / `"success"` / `"warning"` / `"danger"`                | same                      | Copy as-is, including the `'...'`, `{"..."}`, and `{'...'}` forms.                                                                                             |
| `color="primary"`                                                      | `color="info"`            | `ds-notification` marks `primary` as deprecated in favour of `info`. Also rewrite the `'...'`, `{"..."}`, and `{'...'}` forms.                                 |
| `color=""` / no `color`                                                | omit `color`              | Drop an empty `color`. Leave a missing `color` unset.                                                                                                          |
| `light` (no `color`, or `color=""`)                                    | `color="outline-default"` | Drop `light`. Also rewrite `light="true"` and `light={true}`.                                                                                                  |
| `light` with `color="danger"`                                          | `color="outline-red"`     | Drop `light`.                                                                                                                                                  |
| `light` with `color="success"`                                         | `color="outline-green"`   | Drop `light`.                                                                                                                                                  |
| `light` with `color="warning"`                                         | `color="outline-yellow"`  | Drop `light`.                                                                                                                                                  |
| `light` with `color="info"` / `"primary"`                              | _(no equivalent)_         | `ds-notification` has no `outline-info`. Do not guess. Rewrite the tag and import only, leave `light` and `color` unchanged, and list the usage in the report. |
| `light="false"`, `light={false}`                                       | omit `light`              | Drop `light`. Apply the `color` rows above.                                                                                                                    |
| `[color]`, `[light]`, `color={...}`, `light={...}`, `:color`, `:light` | leave the expression      | The mapping cannot be resolved statically. Rewrite the tag and import only, leave the binding unchanged, and list the usage in the report as "check manually". |
| `noIcon` / `no-icon`                                                   | same                      | Copy as-is.                                                                                                                                                    |
| _(none)_                                                               | `heading`                 | New prop. Nothing to migrate from. Leave it unset.                                                                                                             |
| _(none)_                                                               | `closable`                | New prop. Nothing to migrate from. Leave it unset.                                                                                                             |
| _(none)_                                                               | `alert`                   | New prop. Nothing to migrate from. Leave it unset.                                                                                                             |
| _(none)_                                                               | `size="sm"`               | New prop. Nothing to migrate from. Leave `size` unset.                                                                                                         |

### Tags and imports

- **HTML**: `<bal-notification>` becomes `<ds-notification>`, including the closing tag.
- **Angular**: `<bal-notification>` becomes `<ds-notification>` in `.html` templates and in inline `template:` strings, including the closing tag. When a file imports `BalNotification` from `@baloise/ds-angular`, move only `BalNotification` to `import { DsNotification } from '@helvetia-design/angular'` and leave the other symbols on the `@baloise` import.
- **React**: `<BalNotification>` becomes `<DsNotification>` and `</BalNotification>` becomes `</DsNotification>`. Import `DsNotification` from `@helvetia-design/react`. When the existing `@baloise/ds-react` import also binds other symbols, move only `BalNotification` to `import { DsNotification } from '@helvetia-design/react'` and leave the other symbols on the `@baloise` import.

### Events

There are no event changes. `bal-notification` emits no custom event. Leave existing event bindings unchanged. `ds-notification` adds `dsCloseClick` and `dsDidLoad`. Nothing to migrate from.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every `light` with `info` or `primary` left unchanged.
2. Every usage with a dynamic `color` or `light` binding that needs a manual check.
3. Every ambient type reference `BalProps.BalNotificationColor`. The scan cannot see them. Grep for them and rename by hand.
4. Every slotted `<h2>`, `<strong>`, `<b>`, `<span>` and `<p>` child. These children lose the title and body styling that legacy applied to direct children, because `ds-notification` uses shadow DOM and wraps the slot in a `<span>`. Tell the user to check the result visually. `heading` is the intended replacement for a title, but moving it is a manual choice.
5. Every legacy `bal-notification*` class and `data-testid="bal-notification-content"` selector. They no longer match.
6. One-time note: the element now has `role="status"` with `aria-live="polite"`. Legacy had no role.

Coverage only, written to the file:

7. Every `light` that became an `outline-*` colour.
8. Every `primary` that became `info`.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
