# Phase 7 — Document: Anatomy

## Objective

Fill in the second section of the `Documentation` column: "🏗️ Anatomy". When the
component's `<name>.figma.md` has no `anatomy:` list (no `@part` tags found in Phase 1), **delete
the cloned frame's Anatomy `Section` placeholder** (the one with `Title` `kind=anatomy` in
`body` › `Documentation`) so no empty Anatomy frame is left behind, then go straight to
[`PHASE-8-DOCUMENT-SPECS.md`](PHASE-8-DOCUMENT-SPECS.md).

Build this right after "Copy me" is confirmed, before
[`PHASE-8-DOCUMENT-SPECS.md`](PHASE-8-DOCUMENT-SPECS.md) — unless there are no parts, in which case this phase only deletes the placeholder.

## Inputs

- "👉 Copy me", built and confirmed as the first child of the `Documentation` column in
  [`PHASE-6-DOCUMENT-COPY-ME.md`](PHASE-6-DOCUMENT-COPY-ME.md).
- `<name>.figma.md`'s `anatomy:` list (letter, part name, description) from Phase 1 — absence of
  this list is the no-parts condition above.
- The default variant of the finished component set (Phase 3).

## References

- `conventions/document-sections.md` — especially "Sizing".
- `PHASE-3-BUILD.md`'s cloned frame (`body` › `Documentation` / `Component Sets` columns).
- `conventions/build-mechanics.md`.

## Instructions

**Edit the template's worked example in place — clone, never build.** The cloned frame's
`Section` whose `Title` is `kind=anatomy` already holds it: `Section` (`Flat`) › one nested
`Preview` (`Default`) › slot › `diagram-area` (component instance + one `marker-<letter>` group per
part, each with `leader`, `dot`, `letter`) and `legend` (one `Anatomy/Legend item` instance per part). Sizing, layer
names, fonts and colors come from that clone; this skill writes no fill, stroke, font or spacing
value here. **Hard stop** if the `kind=anatomy` placeholder, `diagram-area`, `marker-A`, `legend` or
the `Anatomy/Legend item` component is missing.

1. **Component.** Swap the template instance in `diagram-area` to the real component's default
   variant (`swapComponent`) and centre it horizontally in `diagram-area`.
2. **Markers — one per `anatomy:` entry.** Clone `marker-A` for each part, delete the unused ones,
   rename each to `marker-<letter>` and keep the groups in letter order. Set each `letter` text.
   - Dots at `y = 16`; the component keeps its cloned `y`.
   - Each dot is centred horizontally on the part it labels; move the whole `marker-<letter>` group,
     never its children one by one. A part that encloses others (e.g. the container) gets its
     marker on the straight part of its top edge (between the corner radii), as far from the other
     markers as possible.
   - Each `leader` runs from the bottom of its dot to **4px above the part's visible top**
     (`absoluteRenderBounds` — for text that's the glyphs, not the text box). Same 4px for every
     part. A part with no fill or stroke of its own (e.g. a bare wrapper frame) has no visible
     edge — its `absoluteRenderBounds` is just the frame box. Measure the topmost visible
     descendant instead (e.g. the glyph vector inside the wrapper).
   - `diagram-area` height = component bottom, nothing added (see "Sizing" — its width stays
     `FILL`). The slot's own gap separates it from the legend, and the template's `legend` frame
     carries the bottom padding, so the section reads about 30 / 24 / 30 (top / gap / bottom).
3. **Legend — one `Anatomy/Legend item` instance per part.** The component lives on
   `🧰 Annotations` (find it by name; `3008:1677` is a hint only) and renders
   `"<letter> · <part> — <description>"`, letter and part Bold, the rest Regular. Clone the first instance in `legend` for each part and
   delete the unused ones. Set only its three text properties with `setProperties` — `Letter`,
   `Part`, `Description` (look the keys up by prefix; they carry a `#<id>` suffix). Never detach
   or restyle an instance. Name each instance `<letter> · <part>`.

The `kind=anatomy` placeholder already sits between Copy me and Specs in the cloned frame, so
nothing is appended or moved. Iterate on it with the user in Figma before moving on.

## Output

- The cloned frame's `kind=anatomy` `Section` placeholder filled as "🏗️ Anatomy" — or, when the component
  has no `anatomy:` list, that placeholder deleted (no Anatomy frame at all).

## Completion Criteria

- `diagram-area` holds an instance of the real component and exactly one `marker-<letter>` per
  `anatomy:` entry, in letter order, positioned per the rules above.
- `legend` holds exactly one `Anatomy/Legend item` instance per part, in letter order, with only
  its text properties set.
- The section has been iterated on and confirmed with the user in Figma (unless the placeholder was deleted).

## Next Phase

Proceed to [`PHASE-8-DOCUMENT-SPECS.md`](PHASE-8-DOCUMENT-SPECS.md) once Anatomy is built and
confirmed (or immediately, once the placeholder is deleted).
