# Conventions — category pages & documentation-frame structure (Phase 3 / Phases 4–8)

Relevant to Phase 3's category-page setup and Phases 4–8's documentation frame. See
`../CONVENTIONS.md` for the index, baseline rules, and the seeded category copy table. See
`../CHANGELOG.md` for every reverted approach to this page's structure (slotted Category Frame
master, separate Masters row, two-frame `inverted` split).

- **Components are grouped onto one shared Figma page per code category, not one page per
  component** — `Core / <Category>`, Title Case, plural, matching the code folder name exactly. See
  `../CONVENTIONS.md`'s baseline rules for the full seven-category copy table.
- **Grouping multiple components onto one shared category page is built from nested
  `HORIZONTAL`/`VERTICAL` auto-layout, never manual x/y position math** — "append a new component"
  is then just one `row.appendChild(outerFrame)` call. The row's children are positioned entirely
  by the auto-layout engine. New components always append at the end of the row — never inserted
  alphabetically, never repositioning an existing sibling's frame.
- **A `COMPONENT_SET` can be freely `clone()`d into a different page without disturbing the
  original** — useful any time a master needs to be referenced or displayed from more than one
  page.
- **One documentation frame per component, always — a hard invariant, with no exception for a
  true `inverted`/dark-context axis.** A true `inverted` axis only affects the "🔒 Component Set"
  section: both the `Primary` and `Inverted` component sets are shown stacked vertically inside
  the _same_ single frame's Component Set panel, each under its own plain text sub-label, with
  only the `Inverted` display clone's `fills` swapped to the dark `Alias/Surface/Primary`
  background. Every other section (Copy me, Anatomy, Specs) is built once, from the `Primary`
  set's instances only. See `PHASE-8-DOCUMENT-COMPONENT-SET.md`'s "Handling an `inverted` axis"
  section for the full mechanism.
- **Never lock any Figma node this skill builds** — no master `COMPONENT_SET`, no display clone,
  no documentation-frame content, nothing. The current template has no table geometry for a human
  to accidentally misalign, so locking only gets in the way of inspecting/selecting/rearranging
  content directly in the Figma UI.
