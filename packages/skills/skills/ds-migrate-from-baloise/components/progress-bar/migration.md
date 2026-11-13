# progress-bar

Migrate every `bal-progress-bar` usage to `ds-progress-bar`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The scan lists the `bal-progress-bar` tag and the React and Angular symbol `BalProgressBar`. It does not match the ambient `BalProps.BalProgressBarBackground` or `BalProps.BalProgressBarColor` types. Those resolve from the ambient `BalProps` namespace rather than an import, and `@helvetia-design/core` does not export the matching `ProgressBarBackground` or `ProgressBarColor` types yet, so there is nothing to rewrite them to. Leave them and check them by hand.

The legacy folder has no child tags, and `bal-progress-bar` renders only a plain `div` inside its own tree. No other legacy component renders it. The component keeps its name. The old tag is `bal-progress-bar`, the new tag is `ds-progress-bar`.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-progress-bar.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-progress-bar` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line. This step is finished when every finding matches the mapping.

### Props

| old (`bal-progress-bar`) | new (`ds-progress-bar`) | handling |
| --- | --- | --- |
| `value` | `value` | Copy as-is, in every form (`value="50"`, `[value]="x"`, `value={x}`). Both clamp the rendered bar to 0–100. |
| `color="primary"`, `"purple"`, `"yellow"`, `"red"`, `"green"` | same | Copy as-is, including the `'…'`, `{"…"}`, and `{'…'}` forms. Both components accept exactly these five values and both default to `primary`. Nothing is lost. |
| `background="white"` | `background="light"` | Rename the value. Also rewrite `background='white'`, `background={"white"}`, and `background={'white'}`. |
| `background="grey"` | `background="dark"` | Rename the value. Also rewrite the other quote forms. |
| `background` omitted | `background="light"` | The default flipped. `bal-progress-bar` defaulted to `white` and `ds-progress-bar` defaults to `dark`, so an element without the attribute changes from a white track to a grey one. Write `background="light"` (HTML), `[background]="'light'"` (Angular), or `background="light"` (React) to keep the legacy rendering. Report each file where this was added. |
| `[background]="x"`, `[attr.background]="x"`, `background={x}` | same | Dynamic value. Do not guess the mapping. HTML: copy the binding unchanged and list the file and line in the report, saying that `white` must now be passed as `light` and `grey` as `dark`. React and Angular: copy it when the expression's type only admits `light` or `dark`. Otherwise apply Unmapped props and handlers (`SKILL.md`). |

### Tags and imports

- **HTML**: `<bal-progress-bar>` becomes `<ds-progress-bar>`, including the closing tag.
- **Angular**: the same tag rename in `.html` templates and in inline `template:` strings, including the closing tag. When a file imports `BalProgressBar` from `@baloise/ds-angular`, move only that symbol to `import { DsProgressBar } from '@helvetia-design/angular'` and leave the other symbols on the `@baloise` import. Rename it in `imports: [...]` as well.
- **React**: `<BalProgressBar>` becomes `<DsProgressBar>`, including the closing tag. Import `DsProgressBar` from `@helvetia-design/react`. When the existing `@baloise/ds-react` import also binds other symbols, move only `BalProgressBar` and leave the others on the `@baloise` import. If the file already imports from `@helvetia-design/react`, add to that import instead of creating a second one.

### Events

Neither `bal-progress-bar` nor `ds-progress-bar` emits an event. Nothing to rewrite.

### Methods

Neither component has a public method a consumer calls. `configChanged()` is `@internal` on both sides and is config plumbing, not a consumer API. There is no sibling-file rule for this component.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every file with a finding, because the bar is now announced. `bal-progress-bar` set `aria-hidden="true"` on its host and had no `role`, so screen readers skipped it entirely. `ds-progress-bar` sets `role="progressbar"`, a translated `aria-label` such as `Fortschritt: 50%`, and `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. Any consumer that added its own visually hidden text or live region beside the legacy bar now has the progress announced twice. The consumer checks for a duplicate announcement and removes its own wrapper if needed.
2. Every dynamic `background` binding, with the framework outcome (copied in HTML, copied or removed (Unmapped) in React and Angular). `white` is now `light` and `grey` is now `dark`.
3. Every binding whose value is not guaranteed to be within range. The rendered bar is clamped to 0 to 100, but `aria-valuenow` and the `aria-label` percentage use the raw value. A `value` above 100 or below 0 now announces that raw number against a maximum of 100.
4. Every lost selector. `ds-progress-bar` uses shadow DOM and exposes `part="line"` on the filled element. The legacy classes `bal-progress-bar`, `bal-progress-bar__line`, `bal-progress-bar__line--color-*`, `bal-progress-bar__line--animated`, `bal-progress-bar__line--full` and the ten host modifiers `bal-progress-bar--background-{white,grey}-of-{primary,purple,yellow,red,green}` are gone. The new host carries `is-light` or `is-dark` and one of `is-primary`, `is-purple`, `is-yellow`, `is-red` and `is-green` instead. Tests and styles that query any of them break. Do not rewrite those selectors yourself. Report them.
5. Every stylesheet that sets a `--bal-progress-bar-*` variable. The legacy `--bal-progress-bar-background-white`, `--bal-progress-bar-background-grey`, `--bal-progress-bar-line-color-*` and `--bal-progress-bar-line-radius` are replaced by `--ds-progress-bar-*` tokens with a different shape. The background is now per colour and per theme, such as `--ds-progress-bar-primary-background-dark` and `--ds-progress-bar-primary-background-light`.
6. Every use of the ambient `BalProps.BalProgressBarBackground` and `BalProps.BalProgressBarColor`. They resolve from the global namespace, not an import, so the scan cannot see them. They stop compiling once `@baloise/ds-core` is removed, and `@helvetia-design/core` does not export the matching types yet. List each use and leave it.

Coverage only, written to the file:

7. Every `background="light"` that was added because the default flipped.
8. Every `white` renamed to `light`.
9. Every `grey` renamed to `dark`.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
