# modal

Migrate every `bal-modal` usage to `ds-modal`. Init has already added the `@helvetia-design/*` packages. This task rewrites usages only.

The legacy folder has three elements. `bal-modal` becomes `ds-modal`, `bal-modal-header` becomes `ds-modal-header`, and `bal-modal-body` becomes `ds-modal-body`. Leave slotted content in place, including legacy tags such as `bal-button`, `bal-stack`, and `bal-text`. Those belong to their own migrations. `bal-close` is drawn inside the legacy header and is not a consumer tag.

The scan also lists the imperative API: `balModalController`, `BalModalController`, `BalModalOptions` and, in Angular, `BalModalService`. It lists the ambient element types `HTMLBalModalElement`, `HTMLBalModalHeaderElement` and `HTMLBalModalBodyElement` too. They type refs, and they stop compiling once `@baloise/ds-core` is removed. It does not match the ambient `BalProps.BalModalSpace` type. That type resolves from the ambient namespaces and stops compiling once `@baloise/ds-core` is removed, so it is a Report item, not a rewrite.

In a file that already has one of those findings, the scan also lists three more kinds. They are `open(` and `close(` calls on a receiver whose name contains `modal`, one finding per `componentProps` object (the line where the word appears), and `present(` calls on a variable that the file assigned from a modal `create(`. A modal `create` is a call whose receiver name contains `modal`, such as `balModalController.create(` or `this.modalService.create(`. A `present()` on the result of any other `create` stays out.

## 1. Scan

`<project-root>` is the consumer project root that contains the app lockfile. When the skill is invoked from that root, use the current directory.

```bash
node <this-skill-directory>/scripts/scan-bal-modal.mjs <project-root>
```

The script prints one JSON object. `total` is the number of findings. `files` groups them by path. Each finding has `line` and `snippet`.

Show that list to the user grouped by file (path, line, snippet) and end with the total count.

The extra kinds only appear in files with another modal finding, so a `window.open()` elsewhere stays out. They are candidates, not proof. Check the receiver of each `open(`/`close(` before you rewrite it.

Done when the user has seen every finding and the total. If `total` is 0, say there are no `bal-modal` usages to migrate and stop.

## 2. Confirm

Ask for one yes/no: rewrite every listed usage?

On no, stop with the files unchanged.

On yes, continue. Editing starts only after that answer.

Done when the user has answered.

## 3. Rewrite

Edit each finding yourself, using the mapping below. Read the whole element when attributes continue past the snippet's first line. Angular splits a component across `x.component.html` and `x.component.ts`, and the class file often calls `present()`, `dismiss()` or handles an event without ever naming the tag. Open the same-basename `.ts` beside every `.html` finding and apply the mapping there too. The sibling-file rule covers `open()` and `close()` in that `.ts` file even when the scan did not list it. For each `create` with `component`, open the file of that component class and apply the `DS_MODAL_DATA` and `DsModalRef` rules there, again even when the scan did not list it. This step is finished when every finding matches the mapping.

### Props

| old (`bal-modal`) | new (`ds-modal`) | handling |
| --- | --- | --- |
| `isClosable` | `closable` | Rename the attribute and keep the value, including `[isClosable]` to `[closable]` and `isClosable={x}` to `closable={x}`. Both defaults are `true`. |
| `modalWidth` | `modalWidth` | Copy as-is, including bindings. Both defaults are `640`. |
| `space` | _(no equivalent)_ | Drop the attribute or binding. Mention each one. Legacy values were `small`, `medium` and `large`. |
| `hasBackdrop` | _(no equivalent)_ | Drop it. `ds-modal` always renders its backdrop. Mention each one, especially `hasBackdrop="false"` and `hasBackdrop={false}`. |
| `backdropDismiss` | _(no equivalent)_ | Drop it. In `ds-modal`, `closable` covers Escape, the close button and the backdrop click together. Mention each one, especially `backdropDismiss="false"`, which now closes on backdrop click when `closable` is `true`. |
| `focusTrap` | _(no equivalent)_ | Drop it. The native `dialog` element handles focus. Mention each one. |
| `cssClass` | _(no equivalent)_ | Drop it. `ds-modal` renders in shadow DOM, so a class on the host cannot reach the dialog. Mention each one. |
| `component`, `componentProps`, `delegate`, `dataTestId` | _(none on the tag)_ | These are controller options and internal props, not tag attributes. Handle them in the controller table. Leave them if they appear on a tag, and mention each one. |
| _(none)_ | `open` | New prop. Legacy opened through `present()` or the controller. Do not add `open` to a declarative tag, except in the React effect rule under Methods. Otherwise leave it unset. |
| _(none)_ | `fullscreen` | New prop. Nothing to migrate from. Leave it unset. |
| _(none)_ | `label` | New prop for the dialog's accessible name. Legacy had no `label`. Do not invent text. Leave it unset and apply the controller rule below. |

`ds-modal-header` and `ds-modal-body` take no props. Copy any attribute on a legacy child as-is and mention it.

### Tags and imports

- **HTML**: `<bal-modal>`, `<bal-modal-header>` and `<bal-modal-body>` become `<ds-modal>`, `<ds-modal-header>` and `<ds-modal-body>`, including the closing tags.
- **Angular**: the same tags rewrite in `.html` templates and in inline `template:` strings. When a file imports `BalModal`, `BalModalHeader`, `BalModalBody`, or `BalModalBundle` from `@baloise/ds-angular`, replace them with `import { DsModal, DsModalHeader, DsModalBody } from '@helvetia-design/angular'` and leave the other symbols on the `@baloise` import. Import only the symbols the file uses. `BalModalBundle` was an array of the three legacy classes. In an `imports:` list it becomes `DsModal, DsModalHeader, DsModalBody`. Rename the symbols in `imports: [...]` as well.
- **Element types**: in every framework, `HTMLBalModalElement`, `HTMLBalModalHeaderElement` and `HTMLBalModalBodyElement` become `HTMLDsModalElement`, `HTMLDsModalHeaderElement` and `HTMLDsModalBodyElement`. They are ambient globals, so no import changes. Rename them in `ElementRef<...>`, `useRef<...>` and `querySelector<...>` generics too.
- **React**: `<BalModal>`, `<BalModalHeader>` and `<BalModalBody>` become `<DsModal>`, `<DsModalHeader>` and `<DsModalBody>`, and the closing tags follow. Import them from `@helvetia-design/react`. When the existing `@baloise/ds-react` import also binds other symbols, move only the modal symbols to `import { DsModal } from '@helvetia-design/react'` and leave the other symbols on the `@baloise` import. The generated `DsModal` wrapper is deprecated: it does not keep React `open` state in sync when the modal dismisses itself. JSX still rewrites to `DsModal`. Say in the report that `Modal` from `@helvetia-design/react` is the preferred wrapper, with `onOpenChange`. Do not rewrite JSX into `Modal`, and do not rewrite it into the `useModal` hook — that hook replaces imperative `balModalController` calls only, which the controller row below covers.

### Controller and service

`bal-modal.controller.ts` exports `balModalController`, `BalModalController` and `BalModalOptions`. Angular exports `BalModalService`. `scripts/scan-bal-modal.mjs` lists those identifiers even when the file has no `<bal-modal>` tag. Detect does not. It counts `bal-modal` and `BalModal` as `modal`. `BalModalController` is a different slug, and `balModalController` is not a tag, so a controller-only project is not suggested. Choose modal from Manual, then rewrite every listed file.

| old | new | handling |
| --- | --- | --- |
| `balModalController` | `useModal()` (React) / `dsModalController` | **React**: rewrite to the `useModal` hook from `@helvetia-design/react` — `const [presentModal, dismissModal] = useModal()`. It mounts React content for you, so a `create({ component })` call becomes `presentModal(<YourContent />)`. Do not import `dsModalController` directly in React components or custom hooks: `create()` builds the element with `document.createElement('ds-modal')`, and a bare controller import never registers `ds-modal`, so the modal does not upgrade unless the app happens to render a `<Modal>` or `<DsModal>` elsewhere. The hook registers it. `present(content, options)` returns `Promise<void>`, not the element. Code that kept the element from `create` for `dismiss()` or for listeners must call the hook's `dismiss` instead, or be reported. **React, outside components** (interceptors, services, plain modules, class components): hooks cannot run there, so import `dsModalController` from `@helvetia-design/core`. Also import `defineCustomElement as defineDsModal` from `@helvetia-design/core/components/ds-modal.js` and call `defineDsModal()` once at module scope, before the first `create`. A bare controller import does not register `ds-modal`. Mention each rewritten call and each module that got `defineDsModal()`. **HTML and Angular**: import `dsModalController` from `@helvetia-design/core`. When the `@baloise/ds-core` import binds other symbols, move only the modal symbols. |
| `BalModalController` | `ModalController` | Type only. Import `ModalController` from `@helvetia-design/core`. |
| `BalModalOptions` | `ModalOptions` | Import `ModalOptions` from `@helvetia-design/core`. Apply the option rows below. |
| `create(options)` | `await dsModalController.create(options)` | Both return the `ds-modal` element, and `create` has already started presenting when it returns. Delete a `present()` call on the result only when it directly follows the `create` in the same function. Report a `present()` on that variable anywhere else, such as another method or a re-open after dismiss, because `create` already opened the modal and a deferred `present()` means the code pre-created it. `dsWillPresent` is emitted in a microtask right after `present()` and may already have fired. `dsDidPresent` fires about 300 ms later when animation is on, and without delay when animation is off. A `dsWillPresent` listener added to the returned element can miss its event, and a `dsDidPresent` listener can miss it when animation is off. Report each such listener. Rename `isClosable` to `closable`. Drop `space`, `hasBackdrop`, `backdropDismiss`, `focusTrap`, `cssClass`, `presentingElement`, `dataTestId` and `id` from an object literal, and mention each drop. `component`, `componentProps`, `delegate` and `modalWidth` stay. `ModalOptions` has no `id`, and `create` never sets `el.id`. When the legacy `create` had an `id` and the new call is `dsModalController.create` (HTML, Angular with the controller, React outside components), keep the element and set `<el>.id = <id>` on the line right after the awaited `create`. When the code did not assign the result, assign it to a `const` first. `DsModalService` (Angular) and `useModal` (React) give no access to the element, so the id cannot be set there. |
| `dismiss(data, role, id)` | `dismiss(id, data, role)` | The parameter order changed. Reorder the arguments, and mention each call. A call without `id` targets the first open `ds-modal`. Legacy rejected with `'overlay does not exist'` when no modal was open. `dismiss` now resolves quietly, and its result is `void`, not `boolean`. A call with `id` queries `ds-modal#<id>` and ignores a miss. When the id came from a `create` with `DsModalService` or `useModal`, no modal has that id, so the call closes nothing. Report it. |
| `dismissAll(data, role)` | `dismissAll()` | `dsModalController.dismissAll()` takes no arguments and dismisses without `data` or `role`. Drop the arguments, and mention each call that passed them. |
| `getTop()` | _(no equivalent)_ | Apply Unmapped props and handlers (`SKILL.md`). There is no top-modal lookup. The placeholder type is `HTMLDsModalElement \| undefined`, the legacy `HTMLBalModalElement \| undefined` after the Element types rule. |
| `BalModalService` | `DsModalService` | Angular only. Import `DsModalService` from `@helvetia-design/angular` and rename the injected type. When the file's `@baloise/ds-angular` import binds other symbols, move only `BalModalService`. |

#### Angular service calls

`DsModalService.create(component, componentProps, options)` takes positional arguments and returns a `DsModalRef`, not the element. Rewrite a `create` call only when its argument is an object literal.

The legacy service set `componentProps` as `@Input()`s on the mounted component. `DsModalService` does not set inputs. It provides `componentProps` (or `{}`) through the `DS_MODAL_DATA` token and provides the `DsModalRef` of the modal. Rewrite these rules, do not only report them:

- `componentProps: { a, b }` becomes the second argument of `create`. In the modal component, declare an interface for the data and read it with `inject(DS_MODAL_DATA)`. Import `DS_MODAL_DATA` from `@helvetia-design/angular`.
- Replace an `@Input()` that only received `componentProps` with a field initialized from the data. Keep the old default as a fallback, for example `readonly contract = this.data.contract ?? ''`. An `@Input()` that a template also binds stays as it is. Report it.
- Delete `await ref.present()` and `ref.present()` only when `ref` is assigned from `create` and the call directly follows that `create` in the same function. Report a `present()` on `ref` anywhere else, such as another method or a re-open after dismiss. `create` already opened the modal, so a deferred `present()` means the code pre-created it.
- Leave `ref.onWillDismiss()` and `ref.onDidDismiss()` on that variable as they are. `ref.dismiss(data, role)` also stays.
- Inside a component opened by `create`, `modalService.dismiss(data, role)` becomes `this.modalRef.dismiss(data, role)` with `private readonly modalRef = inject(DsModalRef)`. The argument order is the same. Import `DsModalRef` from `@helvetia-design/angular`. Remove the `BalModalService` injection when nothing else in the class uses it.

```ts
// before: caller
const modal = await this.modalService.create({
  component: ClaimConfirmModal,
  componentProps: { contract: this.contract, fileCount: this.files.length },
  isClosable: false,
  modalWidth: 480,
})
await modal.present()
const { data } = await modal.onDidDismiss()

// after: caller
const ref = await this.modalService.create(
  ClaimConfirmModal,
  { contract: this.contract, fileCount: this.files.length },
  { closable: false, modalWidth: 480 },
)
const { data } = await ref.onDidDismiss()
```

```ts
// before: modal component
export class ClaimConfirmModal {
  @Input() contract = ''
  @Input() fileCount = 0
  constructor(private modalService: BalModalService) {}
  confirm() {
    this.modalService.dismiss({ confirmed: true }, 'confirm')
  }
}

// after: modal component
interface ClaimConfirmModalData {
  contract: string
  fileCount: number
}

export class ClaimConfirmModal {
  private readonly data = inject<ClaimConfirmModalData>(DS_MODAL_DATA)
  private readonly modalRef = inject(DsModalRef)
  readonly contract = this.data.contract ?? ''
  readonly fileCount = this.data.fileCount ?? 0
  confirm() {
    this.modalRef.dismiss({ confirmed: true }, 'confirm')
  }
}
```

Apply the option rows above to the third argument. Omit `componentProps` as `undefined` when only options follow. Do not rewrite a `create` whose argument is a variable, a spread, or a call. Leave it and report it with file and line.

Report every other use of the returned value that these rules do not cover, such as reading a property or passing it on. A `modalService.dismiss(data, role)` call outside a component opened by `create` has no target, because `DsModalService` has no `dismiss`. When the `DsModalRef` that `create` returned is in scope, as a field or a variable, rewrite the call to `<ref>.dismiss(data, role)`. The argument order is the same. The ref closes only its own modal, so report the call. Otherwise apply Unmapped props and handlers (`SKILL.md`). The placeholder type of a used result is `boolean`, because the legacy `dismiss` returned `Promise<boolean>`.

#### Component modals

A `create` with `component` mounts that component into the `body` slot of `ds-modal`. Two things cannot be rewritten and must be reported for each such `create`:

- **No accessible name.** The `header` slot stays empty, and `ds-modal` has a `label` prop for exactly this case. Leave `label` unset and report the call. Suggest setting `label` in the options.
- **Header slot.** `ds-modal-header` sets `slot="header"` on itself, which only works as a direct child of `ds-modal`. A `bal-modal-header` inside the mounted component's template still becomes `ds-modal-header`, but it will not reach the header slot. Report each file with a `bal-modal-header` that belongs to a component opened by `create`.

### Events

| old | new | handling |
| --- | --- | --- |
| `balModalWillPresent` | `dsWillPresent` | Rewrite `addEventListener('balModalWillPresent'` to `addEventListener('dsWillPresent'`. Angular: `(balModalWillPresent)` becomes `(dsWillPresent)`. React: `onBalModalWillPresent` becomes `onDsWillPresent`. |
| `balModalDidPresent` | `dsDidPresent` | Same rewrite. React: `onBalModalDidPresent` becomes `onDsDidPresent`. |
| `balModalWillDismiss` | `dsWillDismiss` | Same rewrite. React: `onBalModalWillDismiss` becomes `onDsWillDismiss`. |
| `balModalDidDismiss` | `dsDidDismiss` | Same rewrite. React: `onBalModalDidDismiss` becomes `onDsDidDismiss`. |
| event `detail` of the two dismiss events | `{ data, role }` | The shape is the same. Nothing to rewrite. The dismiss events bubble, so a listener on an ancestor also receives the events of overlays nested inside the modal. Mention each ancestor listener you come across. |

In each file that has a finding, also rewrite `balModal*` listeners that are not on the element, including `addEventListener`. The scan does not list a file that only listens and never uses `bal-modal`, `BalModal`, `balModalController`, `BalModalController`, `BalModalOptions`, or `BalModalService`.

### Methods

Report each call below with file and line.

- `dismiss(data, role)` on an element returned `Promise<boolean>`. `ds-modal` returns `Promise<void>`. Report every call whose result is read, such as `const ok = await modal.dismiss()` or `if (await modal.dismiss())`. HTML: leave the call unchanged. React and Angular: keep the call as its own statement right before the read, so the modal still closes. Replace the read with `undefined as unknown as boolean`, and put `// TODO(ds-migrate): dismiss() no longer returns a result: <call>` on the line above. Say in the report that the code now receives `undefined` at runtime.
- `onDidDismiss()` and `onWillDismiss()` do not exist on `ds-modal`. In Angular they exist on `DsModalRef` only, so a call on a `DsModalRef` stays. On an element, apply Unmapped props and handlers (`SKILL.md`). The placeholder type is `ModalDismissDetail` from `@helvetia-design/core`, which has the same `{ data, role }` shape as the legacy `OverlayEventDetail`. The report says to listen for `dsDidDismiss` and `dsWillDismiss` instead. In plain HTML, leave the call and report it.
- `present()` keeps its name. `ds-modal` has no `open()` or `close()` method, so a call throws a `TypeError` at runtime. Rewrite them by where they sit:
  - In an event handler or method, on a ref (React `modalRef.current?.open()`, Angular `this.showcaseModal?.nativeElement.open()`), rewrite `open()` to `present()` and `close()` to `dismiss()`. Keep the receiver and the optional chaining.
  - In a React `useEffect` that calls `ref.open()` or `ref.close()` depending on a boolean (a prop or state), remove the effect and the ref, and pass the boolean as `open={thatBoolean}` on `DsModal`. This is the only case where `open` goes on a declarative tag. The boolean must go back to `false` when the modal dismisses itself through the close button, Escape or the backdrop. `dsDidDismiss` bubbles from nested overlays (popup, drawer, hint, another modal inside the modal), so the reset handler must check the target. Keep an existing `onBalModalDidDismiss`, now `onDsDidDismiss`, handler that already resets it, for example by calling the parent's `onDismiss`, and wrap it as `onDsDidDismiss={e => { if (e.target === e.currentTarget) onDismiss() }}`. Keep the call signature of the existing handler, and pass the event on when it took one. Otherwise add `onDsDidDismiss={e => { if (e.target === e.currentTarget) setX(false) }}` for local state. When the boolean is a prop without a callback, leave the wiring out and report it. Remove the `useEffect` and `useRef` imports when nothing else uses them.
  - Anywhere else, report the call.
- `role` values: legacy set `'model-close'` on the close button, a `modal-close` button and the backdrop click, and `'model-escape'` on Escape. `ds-modal` sets `'close'` for the close button, `'backdrop'` for the backdrop click and `'escape'` for Escape, so a comparison against the old strings never matches. Report every comparison against `detail.role` and name the new values. Do not rewrite them: `'model-close'` splits into two values.

### Buttons inside a modal

A legacy `bal-button` with the `modal-close` attribute closed the surrounding modal. `ds-button` has no such hook. In every file with a finding, search for `modal-close` and report each match with file and line. Do not rewrite it. The replacement is a click handler that calls `dismiss()`, and the actions belong in the `actions` slot.

## 4. Report

Write the report as `shared/report.md` describes, with the per-file summary under Files changed. Every item below gets its own line in the coverage checklist, found or none found.

Needs your attention when found:

1. Every dropped `backdropDismiss="false"`, whose backdrop click now closes the modal.
2. Every dropped `hasBackdrop`, especially `hasBackdrop="false"` and `hasBackdrop={false}`. `ds-modal` always renders its backdrop.
3. Every dropped `cssClass`. `ds-modal` renders in shadow DOM, so a class on the host cannot reach the dialog.
4. Every dropped `space`.
5. Every `create` with `component`, with the missing `label` and the header-slot caveat.
6. Every `create` that was not rewritten because its argument is not an object literal.
7. Every use of the value `create` returned that no rule above covers, including a `present()` that does not directly follow the `create`.
8. Every `modalService.dismiss(` call that was not inside a component opened by `create`, with its outcome: rewritten to `<ref>.dismiss(data, role)`, or removed (Unmapped).
9. Every `getTop()` call, with its Unmapped props and handlers outcome.
10. Every `dismiss` call with reordered arguments.
11. Every `dismissAll` call that lost its arguments.
12. Every read of the `dismiss` result, with its outcome: left (HTML), or replaced by the `boolean` placeholder (React, Angular).
13. Every `onDidDismiss()` and `onWillDismiss()` call on an element, with its Unmapped props and handlers outcome.
14. Every `detail.role` comparison.
15. Every `modal-close` attribute.
16. Every `BalProps.BalModal*` type reference that needs a manual check.
17. Every legacy selector that no longer applies, such as `.bal-modal__header`, `.bal-modal__body`, `.bal-modal__content`, `.bal-modal__container`, `.bal-modal__background`, `.data-test-modal-close` and the `aria-presented` attribute. `ds-modal` renders in shadow DOM, so these are lost. The dialog is styleable through `part="dialog"`, `part="close"`, `part="title"`, `part="body"` and `part="actions"`.
18. Every `DsModal` in React, with the note that `Modal` is the preferred wrapper.
19. Every `componentProps` carried into `DS_MODAL_DATA`, naming the `@Input()`s that were replaced and the inputs that stayed because a template binds them.
20. Every effect-driven open and close replaced by `open={…}` where the dismiss reset could not be wired.
21. Every module outside React components that got the `defineCustomElement` call for `ds-modal`.
22. Every `dsWillPresent` listener on an element returned by `create`, and every `dsDidPresent` listener that can miss its event when animation is off.
23. Every `useModal` `present` whose result was used.
24. Every `dismiss` call that passes the id of a `create` with `DsModalService` or `useModal`, flagged "closes nothing".

Coverage only, written to the file:

25. Every dropped `focusTrap`. The native `dialog` element handles focus.
26. Every other dropped `backdropDismiss`.
27. In React, every `balModalController` call rewritten to `useModal`, naming the hook as the reason `ds-modal` is registered.
28. Every `present()` removed directly after `create`.
29. Every `open()` and `close()` in a handler or method rewritten to `present()` and `dismiss()`.
30. Every effect-driven open and close pair rewritten to `open={…}`.
31. Every `create` `id` set as `<el>.id` right after the `create`.

Leave every change unstaged for the consumer to review, including `ds-migration-report.md`. Stop. Do not run `git add` or `git commit`.

Done when every numbered item has its line in `ds-migration-report.md`, the chat shows only the attention items and the pointer line, and the working tree is still unstaged.
