# Conventions — documentation sections: `Section` / `Preview` / `Title` (Phases 6–8)

How to fill the documentation frame's left-column sections (Copy me, Anatomy, Measurements). The frame
itself, its header and the 2-column body come from the `🗂️ Template / Category` clone in
`../PHASE-3-BUILD.md`; the `Documentation` column already holds placeholder `Section` instances.
See `../CONVENTIONS.md` for the index.

## The shared components

All three live on the `🧰 Annotations` page. Find them by name; the node ids are hints only.

- **`Title`** (`COMPONENT_SET`, `2199:13`) — one `kind` variant per section: `copy-me`, `anatomy`,
  `measurements`, `component-set`. Don't use `kind=variants` (retired).
- **`Preview`** (`COMPONENT_SET`, `2192:7497`) — the bordered content box. Contains a real `SLOT`
  node with a hidden `Placeholder` inside. Get a variant via
  `previewSet.children.find(v => v.name === 'Variant=Default')`; `2182:2` is only its `Flat`
  child. `Default` insets the slot; `Flat` doesn't (an outer container for further nested
  `Preview`s).
- **`Section`** (`COMPONENT_SET`, `2192:5987`) — a `Title` + a `Preview`, with the same
  `Default`/`Flat` property as `Preview`. The building block for every left-column section.

**Never fork a one-off copy, and never `detachInstance()`** any of the three — that severs the link
to future master edits. If the chrome must change, edit the master once on the Annotations page.

## Inserting content into a slot

`appendChild` works on a `SLOT` node (unlike an `INSTANCE` root):

```js
const previewInstance = sectionInstance.findOne(n => n.name === 'Preview')
const slot = previewInstance.findOne(n => n.type === 'SLOT')
const placeholder = slot.findOne(n => n.name === 'Placeholder')
// Already hidden in the master; delete it so no invisible layers stay in the instance.
if (placeholder) placeholder.remove()
slot.appendChild(realContentNode)
```

## Sizing

Only `resize()` an axis that is Fixed. `resize()` switches both axes to Fixed and overwrites any
Hug/Fill cloned from the template — check `layoutSizingHorizontal`/`Vertical` first, and if one
axis must stay Hug/Fill, set it back after the resize. Fixed sizes come from the formula in the step
that creates the frame (e.g. variant cells, `diagram-area`). Every `Preview` and its slot hug, so a
`Preview` grows with the content you size inside it — never resize the `Preview` itself.

A nested `Preview` you create (rather than clone) starts at the master's fixed width: set
`layoutSizingHorizontal = 'FILL'` after appending it to the parent slot.

## Nesting per section

- **Copy me**: `Section` `Default`; the single default-variant instance goes directly into the
  `Preview` slot.
- **Anatomy**: `Section` `Flat`; one nested `Default` `Preview` inside the outer slot holds the
  diagram and legend.
- **Measurements**: `Section` `Flat`; up to three nested `Default` `Preview`s, stacked — drawing,
  sizes table, behavior. See `measurements.md` → "Section layout".
- **Component Set**: not a `Section`/`Preview` — see `../PHASE-3-BUILD.md`'s "Labeled component
  set". The labeled set never sits inside another bordered `Preview`.
