# Conventions — documentation sections: `Section` / `Preview` / `Title` (Phases 4–7)

How to fill the documentation frame's left-column sections (Copy me, Anatomy, Specs). The frame
itself, its header and the 2-column body come from the `🗂️ Template / Category` clone in
`../PHASE-3-BUILD.md`; the `Documentation` column already holds placeholder `Section` instances.
See `../CONVENTIONS.md` for the index.

## The shared components

All three live on the `🧰 Annotations` page. Find them by name; the node ids are hints only.

- **`Title`** (`COMPONENT_SET`, `2199:13`) — one `kind` variant per section: `copy-me`, `anatomy`,
  `specs`, `component-set`. Don't use `kind=variants` (retired).
- **`Preview`** (`COMPONENT_SET`, `2192:7497`) — the bordered content box. Contains a real `SLOT`
  node with a hidden `Placeholder` inside. Get a variant via
  `previewSet.children.find(v => v.name === 'Variant=Default')`; `2182:2` is only its `Flat`
  child. `Default` insets the slot 14px; `Flat` insets it 0 (an outer container for further nested
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
if (placeholder) placeholder.visible = false // the master's own default state
slot.appendChild(realContentNode)
```

## Nested `Preview` sizing

After appending a nested `Preview` into a parent slot:

- Set `layoutSizingHorizontal = 'FILL'` so it tracks the slot width. Don't pin a literal width with
  `resize()`.
- If you must `resize(w, h)` to correct the master's default height, immediately set
  `primaryAxisSizingMode = 'AUTO'` and `layoutSizingVertical = 'HUG'`, because `resize()` alone
  leaves a fixed height that clips or under-fills when content changes. Read `layoutSizingVertical`
  back and confirm it is `'HUG'` before moving on.

## Nesting per section

- **Copy me**: `Section` `Default`; the single representative instance goes directly into the
  `Preview` slot.
- **Anatomy**: `Section` `Flat`; one nested `Default` `Preview` inside the outer slot holds the
  diagram and legend.
- **Specs**: `Section` `Flat`; one nested `Default` `Preview` per Variants-axis option (e.g.
  `base`/`lg`/`sm`), stacked, each holding that option's preview and legend card.
- **Component Set**: not a `Section`/`Preview` — see `../PHASE-3-BUILD.md`'s "Labeled component
  set". The variant grid never sits inside another bordered `Preview`.
