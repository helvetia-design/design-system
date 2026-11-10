# checkbox

Migrate every `bal-checkbox` usage to `ds-checkbox`, and every `bal-checkbox-group` usage to `ds-checkbox-group`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

Both legacy tags are migrated together, not separately. `bal-checkbox-group` drives its children with `this.el.querySelectorAll('bal-checkbox')`; rewriting the children to `ds-checkbox` while leaving a `bal-checkbox-group` parent untouched would silently break that cascade, because the old group would stop finding its own children. `ds-checkbox-group` has the matching `querySelectorAll('ds-checkbox')` wiring, so the parent and its children are always rewritten in the same pass.

Apply `shared/field.md` in the Rewrite step to every migrated `ds-checkbox`, `ds-checkbox-group` or `ds-toggle` (a `bal-checkbox` with `interface="switch"` becomes `ds-toggle`) that sits inside a `bal-field`, in the same pass. It moves the label, description and message of the wrapper onto the control and removes the wrapper tags. A `bal-field` around a control that is still a legacy `bal-*` tag stays unchanged. `components/field/migration.md` migrates `bal-form-grid`, `bal-form-col` and every `bal-field` that is left.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-checkbox.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`. The scan also matches bare `newBalCheckboxOption` calls, since a file can build the dropped `options` array (see Props below) without ever naming a tag.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-checkbox` or `bal-checkbox-group` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line, and read the whole `bal-checkbox-group` (not just a scanned child tag) before deciding how to rewrite it, since `interface` cascades from the group down to its children. This step is finished when every finding matches the mapping.

### Shape: `interface` no longer exists — it splits three ways

Legacy `interface` (`'checkbox' | 'switch' | 'button' | 'tile'`) lived on `bal-checkbox` and, when set on `bal-checkbox-group`, cascaded to every child. Neither `ds-checkbox` nor `ds-checkbox-group` has an `interface` prop. Each value becomes a different change:

| old `interface`       | new                     | handling                                                                                                                          |
| --------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| omitted, `"checkbox"` | omit `tile`             | Default on both sides. Copy every other prop as-is.                                                                               |
| `"tile"`              | `tile`                  | Boolean attribute, same meaning: a bordered card layout. The group's `color` cascades to children; see the `tileColor` row below. |
| `"switch"`            | tag becomes `ds-toggle` | See Shape: switch below. This is a tag change, not a prop rewrite.                                                                |
| `"button"`            | `tile` + `hideTrigger`  | See Shape: button below. This is a visual approximation, not an exact match.                                                      |

### Shape: `interface="switch"` becomes a `ds-toggle`

`ds-toggle` is a separate, real, form-associated component — it renders a genuine `<input type="checkbox">` under the hood, with the same event contract as `ds-checkbox` (`dsChange` with a boolean detail, `dsFocus`/`dsBlur` with `FocusEvent`). Rewrite the tag itself, not just a prop:

```html
<!-- before -->
<bal-checkbox-group>
  <bal-checkbox interface="switch" name="notify" checked>Notifications</bal-checkbox>
</bal-checkbox-group>

<!-- after -->
<ds-checkbox-group>
  <ds-toggle name="notify" checked>Notifications</ds-toggle>
</ds-checkbox-group>
```

Carry over `name`, `value`, `checked`, `disabled`, `readonly`, `required`, `invalid`, `autoInvalidOff`, and the label content unchanged — `ds-toggle` has all of them. Drop `interface`, `tile`, `tileColor`, `flat`, `labelHidden`, and `nonSubmit`: `ds-toggle` has no concept of any of them (it is never a tile, and it is always submitted with the form).

**Flag, do not silently rewrite, when the switch sits inside a `control`-mode group** — a `bal-checkbox-group control [value]="..."` (or `control value="..."`) whose `value` array actually drives or reads this checkbox's checked state. `ds-checkbox-group`'s cascade (`getCheckboxes()`) is hardcoded to `this.el.querySelectorAll('ds-checkbox')`; it will never find a `ds-toggle` sibling, in either direction. Still rewrite the tag to `ds-toggle` (the switch still works standalone), but add exactly this note to the report for that occurrence: **"visual benefit persists, but value binding breaks"** — the group's `value` array will no longer include or update this toggle.

A switch inside a plain `bal-checkbox-group` with no `control` (used only for shared layout, label, or fieldset — the common case, including the legacy `Switch` story) needs no flag: nothing was reading its state through the group to begin with.

### Shape: `interface="button"` becomes `tile` + `hideTrigger`

The legacy `button` look (set on `bal-checkbox-group`, cascading to children) is an auto-width, inline-flowing row of bordered buttons, with the selected one filled solid dark-navy with white text. Neither `tile` nor `hideTrigger` reproduces that: `ds-checkbox-group`'s tile mode is always a block-level card, either full width (no `cols`) or an equal-width grid cell (`cols` set) — never auto-width to its own label text — and its selected state is a border plus a soft color tint, never a solid fill.

Rewrite anyway, as the closest available approximation: add `tile` and `hideTrigger` to the group and to every child. Carry over `color` on the group or on individual children as `tileColor` (see Props below). Flag every occurrence with a **"slight design deviation"** note: sizing behavior changed from auto-width/inline to fixed/grid-width block, and the selected-state fill changed from solid to border-plus-tint.

### Props: `bal-checkbox` → `ds-checkbox`

| old                                                                                         | new (`ds-checkbox`)                                | handling                                                                                                               |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `name`, `value`, `checked`, `disabled`, `readonly`, `required`, `autoInvalidOff`, `invalid` | same                                               | Copy as-is.                                                                                                            |
| `color`                                                                                     | `tileColor`                                        | Rename. Only meaningful when `tile` is set.                                                                            |
| `colSize` / `colSizeTablet` / `colSizeMobile` (`@internal`)                                 | `cols` / `colsTablet` / `colsMobile` (`@internal`) | Rename. Internal layout props set by a parent group; rewrite if found directly on a child.                             |
| `labelHidden`                                                                               | _(no equivalent)_                                  | Drop it. `ds-checkbox` always renders its label slot. Mention each dropped occurrence.                                 |
| `flat`                                                                                      | _(no equivalent)_                                  | Drop it. Mention each dropped occurrence.                                                                              |
| `nonSubmit`                                                                                 | _(no equivalent)_                                  | Drop it. `ds-checkbox` is always `formAssociated` and always submitted with the form. Mention each dropped occurrence. |
| `hovered`, `pressed` (`@internal`)                                                          | _(no equivalent)_                                  | Drop silently. These were never public API.                                                                            |

### Props: `bal-checkbox-group` → `ds-checkbox-group`

| old                                                                                         | new (`ds-checkbox-group`)                                 | handling                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `control`, `name`, `vertical`, `disabled`, `readonly`, `invalid`, `value`, `autoInvalidOff` | same                                                      | Copy as-is.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `columns` / `columnsTablet` / `columnsMobile`                                               | `cols` / `colsTablet` / `colsMobile`                      | Rename.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `options` (array of `newBalCheckboxOption(...)`)                                            | _(no equivalent)_                                         | Drop it. `ds-checkbox-group` only supports slotted `ds-checkbox`/`ds-toggle` children, not a declarative array. This cannot be auto-generated from an arbitrary JS array at scan time — flag every `options`/`newBalCheckboxOption` occurrence for manual conversion into slotted children.                                                                                                                                                   |
| `verticalOnMobile`                                                                          | _(no equivalent)_                                         | Drop it. Mention each dropped occurrence.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `expanded`                                                                                  | _(no equivalent)_                                         | Drop it. Mention each dropped occurrence.                                                                                                                                                                                                                                                                                                                                                                                                     |
| _(none — new prop)_                                                                         | `required` (defaults `true`)                              | Do not set this on a group without a label. Its only effect is an "(optional)" suffix next to the group's own `label` prop. When the group sits inside a `bal-field` with a label, `shared/field.md` sets `label` and `required` on the group. Outside a `bal-field`, leave the new default alone. `ds-checkbox-group` is excluded from the required default rule in `SKILL.md`. Mention once, not per-occurrence, that this new prop exists. |
| _(none — new props)_                                                                        | `label`, `description`, `invalidText`, `loading`, `color` | New capabilities, nothing to migrate from legacy. Leave unset; do not break them.                                                                                                                                                                                                                                                                                                                                                             |

### Tags and imports

- **HTML**: `<bal-checkbox>` becomes `<ds-checkbox>` (or `<ds-toggle>` per the Shape section above), including the closing tag. `<bal-checkbox-group>` becomes `<ds-checkbox-group>`, including the closing tag.
- **Angular**: the same tag rewrites in `.html` templates and in inline `template:` strings. When a file imports `BalCheckbox` and/or `BalCheckboxGroup` from `@baloise/ds-angular` (there is no bundle export for checkbox, unlike carousel or card — each is its own symbol), replace only the ones used with `DsCheckbox`/`DsCheckboxGroup` from `@helvetia-design/angular`, keeping the rest on the `@baloise` import. A checkbox rewritten to `ds-toggle` instead imports `DsToggle`.
- **React**: `<BalCheckbox>`/`</BalCheckbox>` becomes `<DsCheckbox>`/`</DsCheckbox>` (or `<DsToggle>`/`</DsToggle>` per Shape), `<BalCheckboxGroup>`/`</BalCheckboxGroup>` becomes `<DsCheckboxGroup>`/`</DsCheckboxGroup>`. Import the renamed symbols from `@helvetia-design/react`, keeping only the ones actually used; when the existing `@baloise/ds-react` import also binds other symbols, move only the checkbox ones and leave the rest on the `@baloise` import.

### Events

| old         | new        | handling                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `balChange` | `dsChange` | Rewrite `addEventListener('balChange'` to `addEventListener('dsChange'`. Angular: `(balChange)` becomes `(dsChange)`. React: `onBalChange` becomes `onDsChange`. Same detail shape on both sides: boolean for `bal-checkbox`/`ds-checkbox`/`ds-toggle`, `any[]` for `bal-checkbox-group`/`ds-checkbox-group`. No handler rewrite needed beyond the name. |
| `balFocus`  | `dsFocus`  | Same shapes as `balChange`: `addEventListener`, `(balFocus)`, `onBalFocus` become `dsFocus`, `(dsFocus)`, `onDsFocus`. Detail stays `FocusEvent`.                                                                                                                                                                                                        |
| `balBlur`   | `dsBlur`   | Same shapes as `balFocus`, targeting `blur`.                                                                                                                                                                                                                                                                                                             |

In each file that has a finding, also rewrite `balChange`, `balFocus`, and `balBlur` listeners that are not on the element itself, including `addEventListener`. For every finding in a `.html` file, also open the same-basename `.ts` file beside it and apply these rules there — the Angular case where the template holds the tag and the class file handles the event without ever naming `bal-checkbox`.

The scan does not list a file that only listens and never uses `bal-checkbox`/`bal-checkbox-group`/`BalCheckbox`/`BalCheckboxGroup`/`newBalCheckboxOption`, and that has no scanned `.html` of the same name beside it. Say so in the report.

### Methods

`setFocus()`, `setBlur()`, `getInputElement()`, and `getOption()` do not exist on `ds-checkbox`. Flag every call site for manual review; there is no replacement.

`getOptionByValue()` does not exist on `ds-checkbox-group`. It is tied to the dropped `options` array — flag every call site alongside the `options` occurrence it belongs to.

`updateState()` and `setAriaForm()` on `bal-checkbox`, and `setValue()` on `bal-checkbox-group`, were all `@internal` and never part of the public API. Drop any reference silently, without a mention in the report.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every `interface="switch"` inside a `control`-mode group, flagged "visual benefit persists, but value binding breaks".
2. Every `interface="button"` rewritten to `tile` + `hideTrigger`, with its "slight design deviation" note.
3. Every dropped `labelHidden`. The label is now visible.
4. Every dropped `flat`.
5. Every dropped `nonSubmit`. The checkbox is now always submitted with the form.
6. Every dropped `verticalOnMobile`.
7. Every dropped `expanded`.
8. Every dropped `options` or `newBalCheckboxOption`, flagged for manual conversion to slotted children, together with every `getOptionByValue()` call tied to it.
9. Every `setFocus()`, `setBlur()`, `getInputElement()` or `getOption()` call, flagged as having no replacement.
10. One-time note: files which only listen or only call a method, and have no scanned `.html` of the same name beside them, were not scanned.

Coverage only, written to the file:

11. Every `interface="switch"` rewritten to `ds-toggle`.
12. One-time note, for groups outside a `bal-field` only: `ds-checkbox-group` defaults its new `required` prop to `true`, and the migration left it alone. It only shows once the group gets a `label`.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
