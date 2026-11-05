# Phase 1 — Analyze

## Objective

Read the component's code and produce the draft mapping that Phase 2 proposes a grouping against.

## Inputs

- Component source: `packages/core/src/components/<category>/<name>/<name>.tsx`
- Component styles: `<name>.host.scss`
- Design tokens: `packages/tokens/tokens/Base.tokens.json`
- Figma Variables: `.claude/skills/ds-code-to-figma/references/figma-tokens/Base.tokens.json`
- Any nested DS components' already-written `<child>.figma.md` files

## References

- [`examples/mapping-file-format.md`](examples/mapping-file-format.md) — mapping-file schema
- `SKILL.md` — Prerequisites section
- `scripts/figma-sync/lib/css-token-lookup.mjs` — local CSS-var → Figma variable id resolver
- `docs/adr/0017-direct-commit-variableid-backfill.md` — why variable ids already live in
  `Base.tokens.json`
- `packages/styles/src/scss/mixins/breakpoint.mixin.scss` — full breakpoint mixin set, for detecting responsive bindings

## Instructions

1. Read `packages/core/src/components/<category>/<name>/<name>.tsx` and extract every **public
   `@Prop()`** — ignore `@Method`, `@Event`, and private `@State`. Note each prop's type
   (`@OneOf([...])` enum, boolean, string, number) and default. Write every enum's
   `figmaOptions:` in canonical order per `conventions/component-set-rendering.md` → "Option and
   axis ordering": code default first (hard rule A), then canonical order (hard rule B) — e.g.
   `base · sm · md · lg`. The implicit unset default is named `base`.
2. Extract the component's **anatomy** — its named visual parts — from the class-level `@part`
   JSDoc tags (e.g. `ds-button`: `@part native`, `@part spinner`, `@part icon`, `@part label`,
   `@part icon-right`). Cross-check every `@part` tag against a real `part="..."` attribute in
   `render()`: a tag with no matching attribute, or an attribute with no matching tag, is a **hard
   stop** — same treatment as a missing token (see step 5 below) — report it and ask the user to
   fix the component's code/JSDoc, or explicitly accept the mismatch, before continuing. Assign
   each part a sequential letter (A, B, C, …) in the order its `part="..."` attribute appears in
   `render()`'s JSX (DOM order, not JSDoc comment order). **Print the extracted list in the
   conversation for the user to review before writing anything** — letter, part name, and its
   one-line description taken verbatim from the `@part` JSDoc line. If the component has no
   `@part` tags at all, skip the anatomy section entirely (note why in the draft; this is not a
   gap to flag).
3. Read the component's `<name>.host.scss` and scan for **pseudo-class states** —
   `:hover`, `:focus`, `:active`, `:disabled`, and any loading-related
   class/attribute selector. These don't show up as props but still need a Figma
   representation (see `PHASE-2-PROPOSE.md` → mapping table, `state` row).
   - Also scan **every text-bearing part for every attribute a Figma text node needs**: font
     family, font size, font weight, line-height, letter-spacing, color, text-decoration. A
     component's own SCSS commonly sets only some of these explicitly (e.g. a `::part(label)`
     that sets `font-family`/`line-height` but not `color`/`font-size`, as in `ds-spinner`) and
     relies on Shadow DOM inheritance from the light-DOM ancestor for the rest in real usage —
     that's expected, not a gap, in the component's own code. But it means the Figma text node
     has nothing to naturally fall back to, and will otherwise render with Figma's own
     stale/leftover default styling (observed: black, 12px) instead of anything representative.
     **Every one of these attributes still needs an explicit resolved token in `<name>.figma.md`'s
     tokens list — treat a missing one exactly like a missing CSS-var token in step 5, not as an
     exemption.** For attributes inherited from this system's own default text treatment (not set
     by the component's own code), bind to the matching system-default token — e.g.
     `🔗 Alias/🔤 Text/Color/Primary` for color, `📱 Device/🔤 Text/Size/Base/Device` for size (from
     the `Design Responsive Tokens` collection, mode-based), `🔗 Alias/🔤 Text/LetterSpacing/Text`
     for letter-spacing, `🔗 Alias/🔤 Text/TextDecoration/None` for decoration (which of these the
     Plugin API can bind: `PHASE-3-BUILD.md` → "Text property bindings") — and flag these as inherited-context
     bindings, not literal bindings to something the component's own code sets. Never leave an
     attribute unbound/assumed because the component's SCSS doesn't mention it.
4. Identify any **nested DS component** usage (e.g. `<ds-icon>` inside `ds-button`'s render). For
   each one, read its `<child>.figma.md` and pull the default set's `figmaComponentKey` (first
   entry of `sets:`). If missing,
   stop per `SKILL.md`'s Prerequisites section above. Mark every nested `ds-icon` /
   `ds-brand-icon` as an **icon slot** (see `conventions/content-selection-and-mitigations.md` →
   "Icon slots in a parent component"): record the code prop driving it, whether `ds-brand-icon`
   can fill the same slot, and how code sets its `size` and color.
5. For every value the component's SCSS binds to a CSS custom property (`var(--ds-...)`),
   resolve it to the matching Figma variable **id** — resolve this entirely locally, no Figma
   call needed for the common case.
   - **Every token this repo has already pushed to Figma carries its real Figma variable id
     right in `packages/tokens/tokens/Base.tokens.json`**, under
     `$extensions["com.figma.variableId"]` — that's what `scripts/figma-sync` writes back after
     a push (`docs/adr/0017-direct-commit-variableid-backfill.md`). There is no need to
     enumerate Figma's `Design Tokens`/`Design Responsive Tokens` collections (1,900+ variables)
     through `use_figma` to answer "does a variable exist for this CSS var" — the answer is
     already sitting in this repo's own JSON, and a live enumeration is slow, burns a large
     amount of context on a big collection, and risks a truncated/partial result on a large read.
   - **Resolve with `scripts/figma-sync/lib/css-token-lookup.mjs`** (pure Node, no Figma call):
     ```bash
     node scripts/figma-sync/lib/css-token-lookup.mjs packages/tokens/tokens/Base.tokens.json \
       --var --ds-spinner-circle-primary-background \
       --var --ds-spinner-logo-size-md
     ```
     Pass every `--ds-*` var found in the component's SCSS as its own `--var`. Each result is
     `null` (no token exists under that name — see the hard-stop rule below) or
     `{ path, cssVar, variableId, figmaScopes, type, description }`, where `variableId` is the
     real `VariableID:...` string to bind against in Phase 3 — write it straight into
     `<name>.figma.md`'s `tokens:` list (see [`examples/mapping-file-format.md`](examples/mapping-file-format.md)), no further lookup
     needed. A breakpoint-suffixed var (`--ds-logo-size-base-mobile`/`-tablet`/`-desktop`)
     resolves to that one breakpoint's own id directly; the bare, un-suffixed var resolves to the
     full `{ mobile, tablet, desktop[, device] }` object — see `PHASE-3-BUILD.md` step 3's
     responsive-binding mechanics for what `device` is and when it's present.
   - **This still requires `search_design_system`/`get_variable_defs`/live enumeration for
     exactly one case: a value with no CSS-var binding at all** (a hardcoded literal in the
     component's `.tsx`, or an inherited attribute the component's own code never sets — see step 3) that you need to find an _existing_ token for by browsing, since there's no `--ds-*` name
     to look up. Even then, remember those two tools only search/read **published libraries** —
     the real token variables are **local** to the component-library file, pushed directly by
     `scripts/figma-sync`, so a live Figma search can return misleading look-alike results from
     an unrelated published library (e.g. old sandbox files with similar naming). Prefer browsing
     `Base.tokens.json` itself (it's just JSON) for a token with the right semantic value before
     reaching for a Figma-side search.
   - **Any CSS var that resolves to `null`** (a real `--ds-*` var in the component's SCSS with no
     matching entry in `Base.tokens.json` at all — a token that was renamed, or never
     synced) **is a hard stop.** Report it immediately — do not guess, do not push a hardcoded
     value, do not invent a new token. Ask the user whether to use a different existing token or
     explicitly accept a one-off hardcoded value for this specific case. Resolve this now, before
     Phase 2, not mid-build in Phase 3.
   - A value with no CSS-var binding in the component's own SCSS (e.g. a hardcoded literal in
     the component's `.tsx`, or an attribute the component's code never sets at all and instead
     inherits — see step 3's text-attribute scan) is **not exempt from token resolution — it
     still needs an explicit decision, same hard-stop rule as above.** If a matching Figma
     variable exists anyway (as found for `spinner.tsx`'s `getColor()` fallback, or for an
     inherited text attribute per step 3), bind to it for the Figma visual and note it in
     `<name>.figma.md` (flagging any code-side drift as a separate follow-up, not fixed here). If
     no matching variable exists, treat it exactly like a missing CSS-var token: stop, report it,
     and ask the user to pick an existing token or explicitly accept a one-off hardcoded value —
     never silently build it with an assumed or Figma-default value.
   - 5a. **Detect responsive (device-mode) bindings.** Scan `<name>.host.scss` for breakpoint
     mixins — `@include mobile`, `tablet`, `desktop`, `touch`, `from(...)`, `until(...)`,
     `between(...)`, `desktop-only`, etc. (the full set lives in
     `packages/styles/src/scss/mixins/breakpoint.mixin.scss`). For each one found, check whether it
     reassigns a custom property (`--mod-*`, `--_*`, or a bare `--ds-*`) that is **also set to a
     different `--ds-*` token outside the block** (its unconditional/base value, or another
     breakpoint's value) — e.g. `logo.host.scss`'s `:host { @include vars.local(logo-height,
var(--ds-logo-size-base-mobile)); @include desktop { --mod-logo-height:
var(--ds-logo-size-base-desktop); } }`. **Only flag this when the token genuinely differs
     across the breakpoint** — a breakpoint block that doesn't touch a `--ds-*`-bound value (pure
     layout: grid columns, flex direction, etc.) is not a responsiveness case, skip it. This check
     applies to **any** property kind, not just size — width, height, padding, gap, radius, color,
     whatever the breakpoint actually overrides.
     - **Only `mobile`/`tablet`/`desktop` map onto real Figma modes** — the `Design Responsive
Tokens` collection has exactly those three. Any other mixin (`desktop-lg`, `desktop-xl`,
       `touch`, `from`/`until`/`between` at an arbitrary breakpoint, etc.) is a **hard stop**, same
       as a missing token above: report it and ask the user to collapse it into the nearest of the
       3 modes, accept a static value for that breakpoint, or extend the Figma collection with a
       4th mode — never guess or silently collapse it yourself.
     - If code only overrides one breakpoint (e.g. `logo.host.scss` only has `@include desktop` —
       no `@include tablet`), the token for the mode that was never explicitly overridden falls
       through to the next-lower breakpoint's real value (here, Tablet uses the same token as
       Mobile) — record it as such, matching actual rendered behavior; don't invent a distinct
       Tablet-specific token that doesn't exist in code.
     - Record every responsive binding found in the draft's `device:` section — see
       [`examples/mapping-file-format.md`](examples/mapping-file-format.md). A component with no breakpoint-driven token differences has no
       `device:` section at all, same as `anatomy:`/`states:` being omitted when not applicable.
       Resolve each mode's real variable id by running the breakpoint-suffixed CSS var (e.g.
       `--ds-logo-size-base-mobile`) through `css-token-lookup.mjs` from step 5 above — same one
       call, no separate lookup mechanism for this case.
     - Phase 3 is what actually creates/reuses the Figma routing variable and binds nodes to it —
       this step only needs to identify and record which bindings are responsive and what each
       mode's real token is.
   - 5b. Before writing the draft file, build an explicit **completeness checklist**: list every
     node the Figma build will need (every text-bearing part, every filled/stroked shape, every
     spacing gap) and, for each one, every visual attribute it needs (text: family, size, weight,
     line-height, letter-spacing, color, decoration; shape: fill, stroke color/width, corner
     radius, dimensions, spacing). Cross-check each attribute against the tokens resolved in steps
     3, 5, and 5a — any attribute with no corresponding entry is a gap, not an assumption to fill in
     during Phase 3. For an attribute flagged responsive in step 5a, the checklist entry points at
     its `device:` binding rather than a single static token. Surface every gap now, as a batch,
     using the same hard-stop flow as step 5, rather than discovering missing tokens one at a time
     mid-build.
6. Write all of the above into `<name>.figma.md` (create it if it doesn't exist) as a draft, per
   [`examples/mapping-file-format.md`](examples/mapping-file-format.md). Include the `specs:` list —
   the values (fixed or min width/height, padding/gaps, fixed sizes of nested elements, radius,
   border width, typography) per option of the Variants axis that Phase 8's "📐 Specs" section
   will show, each pointing at its Figma variable. It's a view onto the completeness checklist
   from step 5b, not new analysis. Leave out calculated inner content sizes and the radius of a
   circle (see `PHASE-8-DOCUMENT-SPECS.md`).

## Output

A draft mapping file `<name>.figma.md`, written per
[`examples/mapping-file-format.md`](examples/mapping-file-format.md), containing:

- Extracted public props (type, default)
- Lettered anatomy (`@part` tags cross-checked against `render()`)
- Pseudo-class states from `<name>.host.scss`
- Resolved token/variable id for every CSS-var binding, including responsive `device:` bindings
- Nested DS component references (their Figma component keys)
- The completeness checklist and the `specs:` list

## Completion Criteria

- Every public prop is extracted and typed.
- Every `@part` tag matches a real `part="..."` attribute in `render()` (or the mismatch was
  resolved with the user).
- Every CSS-var token resolves to a real Figma variable id, or was explicitly flagged as a hard
  stop and resolved with the user — none left as a guess or silent default.
- Responsive (device-mode) bindings are identified and recorded under `device:`.
- The completeness checklist has no unresolved gaps.

## Next Phase

Proceed to [`PHASE-2-PROPOSE.md`](PHASE-2-PROPOSE.md) only once the draft `<name>.figma.md`
(props, anatomy, states, resolved tokens, completeness checklist) exists.
