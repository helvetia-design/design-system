# Phase 5 — Document: Anatomy

## Objective

Fill in the second section of the left `documentation` column: "🏗️ Anatomy". When the
component's `<name>.figma.md` has no `anatomy:` list (no `@part` tags found in Phase 1), **delete
the cloned frame's Anatomy `Section` placeholder** (the one with `Title` `kind=anatomy` in
`body` › `Documentation`) so no empty Anatomy frame is left behind, then go straight to
[`PHASE-6-DOCUMENT-SPECS.md`](PHASE-6-DOCUMENT-SPECS.md).

Build this right after "Copy me" is confirmed, before
[`PHASE-6-DOCUMENT-SPECS.md`](PHASE-6-DOCUMENT-SPECS.md) — unless there are no parts, in which case this phase only deletes the placeholder.

## Inputs

- "👉 Copy me", built and confirmed as the first child of the left `documentation` column in
  [`PHASE-4-DOCUMENT-COPY-ME.md`](PHASE-4-DOCUMENT-COPY-ME.md).
- `<name>.figma.md`'s `anatomy:` list (letter, part name, description) from Phase 1 — absence of
  this list is the no-parts condition above.
- The finished component-set variant for the default/base combination (Phase 3).

## References

- `conventions/document-sections.md` — especially "Sizing".
- `PHASE-3-BUILD.md`'s cloned frame (`body` › `Documentation` / `Component Sets` columns).
- `conventions/build-mechanics.md`.

## Instructions

**Edit the template's worked example in place — clone, never build.** The cloned frame's
`Section` whose `Title` is `kind=anatomy` already holds it: `Section` (`Flat`) › one nested
`Preview` (`Default`) › slot › `diagram-area` (component instance + one `marker-<letter>` group per
part, each with `leader`, `dot`, `letter`) and `legend` (one text line per part). Sizing, layer
names, fonts and colors come from that clone; this skill writes no fill, stroke, font or spacing
value here. **Hard stop** if the `kind=anatomy` placeholder, `diagram-area`, `marker-A` or `legend`
is missing.

1. **Component.** Swap the template instance in `diagram-area` to the real component's default/base
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
     part.
   - `diagram-area` height = component bottom + 16 (see "Sizing" — its width stays `FILL`).
3. **Legend — one line per part:** `"<letter> · <part> — <description>"`. Clone the first line for
   each part and delete the unused ones. Setting `characters` resets the line's mixed formatting,
   so read the template's Bold font (letter) and Regular font (description) from the line first;
   after setting the text, apply Regular to the whole line, then Bold to the letter (`0` to `1`)
   and the part name (`characters.indexOf(partName, 1)`) with `setRangeFontName`. Keep each line
   one text node, and set its layer name to its text (`name = characters`) — `autoRename` can't be
   switched on for layers inside the `Section` instance's slot.

The `kind=anatomy` placeholder already sits between Copy me and Specs in the cloned frame, so
nothing is appended or moved. Iterate on it with the user in Figma before moving on.

## Output

- The cloned frame's `kind=anatomy` `Section` placeholder filled as "🏗️ Anatomy" — or, when the component
  has no `anatomy:` list, that placeholder deleted (no Anatomy frame at all).

## Completion Criteria

- `diagram-area` holds an instance of the real component and exactly one `marker-<letter>` per
  `anatomy:` entry, in letter order, positioned per the rules above.
- `legend` holds exactly one line per part, with the letter and part name Bold and the rest
  Regular.
- The section has been iterated on and confirmed with the user in Figma (unless the placeholder was deleted).

## Next Phase

Proceed to [`PHASE-6-DOCUMENT-SPECS.md`](PHASE-6-DOCUMENT-SPECS.md) once Anatomy is built and
confirmed (or immediately, once the placeholder is deleted).
