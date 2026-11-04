---
name: ds-code-to-figma
description: Push a Helvetia Design System component from code into the Figma component library — resolving props/variants/states to Figma variant properties bound to existing Figma variables (tokens), reusing existing Figma components for nested children.
---

# ds-code-to-figma

## Goal

Generate Figma components that accurately represent the existing Web Components and reuse existing design system resources.

## Workflow

Each phase lives in its own file — read the current phase's file when you reach it, don't load
all seven up front. Each file opens with a "you are here" line naming what the prior phase must
have produced, and closes with an explicit `Next:` pointer to the following file.

1. [`PHASE-1-ANALYZE.md`](PHASE-1-ANALYZE.md) — read the component's code (props, anatomy,
   pseudo-states, text attributes) and resolve every value to a Figma design token, hard-stopping
   on anything that can't be resolved. Writes the draft `<name>.figma.md`.
2. [`PHASE-2-PROPOSE.md`](PHASE-2-PROPOSE.md) — turn the draft into a concrete Figma
   variant-grouping proposal (variant vs. instance-swap vs. top-level split, grid sketch, 500-variant
   budget check) and get the user's explicit sign-off before anything is built.
3. [`PHASE-3-BUILD.md`](PHASE-3-BUILD.md) — clone the component's category page (or just its documentation
   frame) from the `🗂️ Template / Category` Figma page and fill its header, then build the real
   Figma `COMPONENT_SET` inside that frame incrementally (one confirmed variant combination first,
   then the rest as a labeled, fixed-grid set the user approves).
4. [`PHASE-4-DOCUMENT-COPY-ME.md`](PHASE-4-DOCUMENT-COPY-ME.md) — build "👉 Copy me", the first
   section of the left column.
5. [`PHASE-5-DOCUMENT-ANATOMY.md`](PHASE-5-DOCUMENT-ANATOMY.md) — build "🏗️ Anatomy", the second
   section of the left column (the placeholder is deleted when the component has no `@part` tags).
6. [`PHASE-6-DOCUMENT-SPECS.md`](PHASE-6-DOCUMENT-SPECS.md) — build "📐 Specs", the last section of
   the left column.
7. [`PHASE-7-REVIEW.md`](PHASE-7-REVIEW.md) — compare the Figma-bound token values against the live
   component's computed CSS on the dev server and report findings; this is the last phase in this
   skill's v1 scope.

### Graph

```mermaid
flowchart TD
    classDef code fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef figma fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef human fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef phase fill:#f8fafc,stroke:#64748b,color:#0f172a,font-weight:bold

    Start(["Start: user names a component"]):::phase --> P1G

    subgraph P1G["Phase 1 — Analyze"]
        direction LR
        P1a["Read component code<br/>.tsx / .host.scss"]:::code --> P1anat["Extract anatomy from<br/>@part tags"]:::code
        P1anat --> P1anatC{{"User reviews<br/>anatomy list"}}:::human
        P1anatC --> P1b["Resolve design tokens<br/>(read-only Figma variables)"]:::figma
        P1b --> P1c["Write draft<br/>name.figma.md"]:::code
    end

    P1G --> P2G

    subgraph P2G["Phase 2 — Propose grouping"]
        direction LR
        P2a["Apply inline rules<br/>(conventions/content-selection-and-mitigations.md<br/>only if needed)"]:::code --> P2b["Draft variant grid sketch<br/>in name.figma.md"]:::code
        P2b --> P2v["Compute total variant count"]:::code
        P2v --> P2check{{"Count ≤500?"}}:::human
        P2check -->|over threshold| P2w["Hard stop: recommend<br/>mitigation by axis type"]:::code
        P2w --> P2x{{"User picks<br/>mitigation"}}:::human
        P2x --> P2v
        P2check -->|under threshold| P2c{{"User confirms<br/>the mapping"}}:::human
        P2c -->|approved| P2d["Optional: add a new<br/>rule to the Phase 2 table"]:::code
    end

    P2G --> P3G

    subgraph P3G["Phase 3 — Build"]
        direction LR
        P3a["Clone category page / frame<br/>from template + fill header"]:::figma -->|template layer, category copy<br/>or story ID missing| P3h(["Hard stop: ask user"]):::human
        P3a --> P3b["Build ONE variant<br/>combination"]:::figma
        P3b --> P3c{{"User confirms first variant<br/>in Figma"}}:::human
        P3c -->|approved| P3d["Fan out + build labeled<br/>component set(s)"]:::figma
        P3d --> P3f{{"User approves header +<br/>component set in Figma"}}:::human
        P3f -->|approved| P3e["Write the component key<br/>back to name.figma.md"]:::code
    end

    P3G --> P4G

    subgraph P4G["Phase 4 — Copy me"]
        direction LR
        P4a["Instance Section (Default),<br/>insert one representative<br/>instance into the slot"]:::figma --> P4b{{"User confirms<br/>Copy me"}}:::human
    end

    P4G --> P5G

    subgraph P5G["Phase 5 — Anatomy"]
        direction LR
        P5a{{"Component has<br/>@part tags?"}}:::human -->|no| P5s(["Delete Anatomy<br/>placeholder"]):::figma
        P5a -->|yes| P5b["Build diagram +<br/>legend items"]:::figma
        P5b --> P5c{{"User confirms<br/>Anatomy"}}:::human
    end

    P5G --> P6G

    subgraph P6G["Phase 6 — Specs"]
        direction LR
        P6a["Build one spec card<br/>per Variants-axis option"]:::figma --> P6b{{"User confirms<br/>Specs"}}:::human
    end

    P6G --> P7G

    subgraph P7G["Phase 7 — Review"]
        direction LR
        P7a["Start dev server,<br/>read Figma get_variable_defs"]:::figma --> P7b["Diff live getComputedStyle<br/>against resolved token values"]:::code
        P7b --> P7c{{"User judges<br/>the findings"}}:::human
        P7c -->|real bug found| P7d["Fix code / code docs"]:::code
    end

    P7G --> Done(["Done: component live in Figma"]):::phase
```

🔵 **code** — reads or writes a file in this repo (`.tsx`/`.scss`, `name.figma.md`, `CONVENTIONS.md`, test snapshots).
🟣 **figma** — a `use_figma`/`get_screenshot` call against the live Figma file.
🟡 **human** — a required stop-and-wait checkpoint; never assume approval and keep going.

The human checkpoints (Phase 1's anatomy review, Phase 2's mapping confirmation, Phase 3's
first-variant and documentation-frame approvals in Figma, and the Copy me / Anatomy / Specs
confirmations in Phases 4–6) are the only _required_ stops — everything else is read/write work it
does on its own between them. For the full list of every checkpoint and hard-stop condition across
all seven phases in one place, see [`DECISIONS.md`](DECISIONS.md).

## Rules

- NEVER generate Code Connect mappings
- NEVER invent a hardcoded value — always resolve to a Figma variable (design token)
- NEVER commit — leave changes unstaged for the user to review
- MUST treat a hard stop (missing token, missing nested child mapping) as a checkpoint, not a failure to work around — surface it and wait for the user's decision

## Instructions

Load `figma-use` alongside this skill before any `use_figma` call (mandatory per that skill's own
rule). Load `figma-generate-library` for its guidance on binding values to Figma variables and
reusing existing components, since the same discipline applies here.

## Prerequisites

- `figma.config.json` at the repo root must have a real `componentLibraryFileKey` (not the
  `REPLACE_WITH_FIGMA_FILE_KEY` placeholder). If it's still the placeholder, stop and ask the
  user for the file key before doing anything else.
- The target component must already exist in code (`packages/core/src/components/<category>/<name>/`).
- If the component nests another DS component (e.g. a button using an icon), the nested
  component's own `<child>.figma.md` must already exist and record a Figma component key. If it
  doesn't, stop and tell the user to run this skill on the child component first — do not
  recreate the child or fall back to a plain shape.

## References

Read only the documentation needed for the task:

- [`CONVENTIONS.md`](CONVENTIONS.md) — cross-phase rules (category copy, no-lock, no assumed attributes), indexed by topic into
  [`conventions/`](conventions/) (tokens & props, content-selection & mitigations, page structure, Component Set
  rendering, general build mechanics).
- [`DECISIONS.md`](DECISIONS.md) — every checkpoint and hard-stop condition across all seven
  phases, in one place.
- `PHASE-1-ANALYZE.md` / `PHASE-2-PROPOSE.md` / `PHASE-3-BUILD.md` /
  `PHASE-4-DOCUMENT-COPY-ME.md` / `PHASE-5-DOCUMENT-ANATOMY.md` / `PHASE-6-DOCUMENT-SPECS.md` /
  `PHASE-7-REVIEW.md` — the full workflow, one file per
  phase (see "## Workflow" above).
- [`packages/tokens/CONTEXT.md`](../../../packages/tokens/CONTEXT.md) — token layers and naming.
- [`packages/core/CONTEXT.md`](../../../packages/core/CONTEXT.md) — component categories and
  structure.
- [`examples/mapping-file-format.md`](examples/mapping-file-format.md) — code to figma mapping format.

## Validation

- All applicable styles must use design tokens.
- Nested components must use existing instances.
- Report unresolved mappings.
- All Figma component keys must be written back to `<name>.figma.md` for future reference.

## Output

Provide:

- `<name>.figma.md` lives at `packages/core/src/components/<category>/<name>/<name>.figma.md`.
- `PHASE-2-PROPOSE.md`'s mapping table, `CONVENTIONS.md` and `conventions/*.md` are updated only when the user approves a new rule addition.
- Created Figma component — documentation frames and component set
- Validation results
- Unresolved issues
