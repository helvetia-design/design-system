---
name: ds-token-check
description: Audit a component family's SCSS/TSX for design-token layer violations (raw Global/Alias/Device usage instead of a Component token), cross-component token borrows, Figma-readiness gaps (hardcoded literals, missing/typo tokens), naming-anatomy drift in the Component-layer tokens it actually uses, and an explicit Figma Property Checklist (Border/Background/Radius/Typography/Text-Color/Opacity/Padding/Gap/Margin, crossed per @Prop() variant×state) proving every Figma-bindable property has a Component token behind it. Writes a single persisted Markdown report (<family>.token-check.md) for a later agent/session to fix from — never edits Base.tokens.json or any component source file itself. Use when the user asks to check/audit/review/lint a component's tokens, or before running ds-code-to-figma to make sure there's no token gap.
---

# ds-token-check

## Objective

Every component must style itself through its **own** Component-layer tokens
(`--ds-<component>-*`) — never by reaching directly into the Global, Alias, or Device
layers, never by leaning on a hardcoded literal where a token belongs, and the tokens it
does own must follow the canonical naming anatomy
(`packages/tokens/CONTEXT.md`). This skill reads a component family's code, finds every
place one of those rules is broken, and writes the findings to a single persisted
Markdown report. It is **diagnostic only** — it never edits `Base.tokens.json`, never
rewrites a `.scss`/`.tsx` file, and never runs `pnpm tokens`. The report is the
deliverable: a standalone artifact a later agent (possibly a different session) reads
to go fix the issues, and something to work from before running `ds-code-to-figma`
(which needs one correctly-named token per Figma-bindable value to avoid exactly the
gaps this skill surfaces).

This skill absorbs what used to be a separate `ds-token-lint` skill (naming-anatomy
checks against `Base.tokens.json`) — that skill is retired; its five naming rules now
run here, scoped to whichever Component-layer keys the family's code actually touches.

## Workflow

```mermaid
flowchart TD
    classDef code fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef human fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef phase fill:#f8fafc,stroke:#64748b,color:#0f172a,font-weight:bold

    Start(["Start: user names a component<br/>or sub-component"]):::phase --> R1

    R1["Resolve to the family dir<br/>(scan.js locates the parent folder;<br/>a sub-component name resolves up)"]:::code --> R2

    R2["Run scan.js:<br/>extract every var(--ds-*) from the<br/>family's .scss/.tsx (excl. test/),<br/>classify layer, check existence"]:::code --> R3

    R3["scan.js: derive which 🧩 Component<br/>JSON key(s) the component-own tokens<br/>belong to (longest-kebab-prefix match,<br/>not folder-name guessing)"]:::code --> R4

    R4["scan.js: run the 5 ported naming rules<br/>against each derived key's subtree"]:::code --> R5

    R5["Agent reads the same files directly<br/>for hardcoded literals scan.js can't see<br/>(colors, rem/px sizes, bare radii, etc.)"]:::code --> R5b

    R5b["scan.js: parse @Prop() enums (.tsx),<br/>generate the Figma Property Checklist<br/>matrix (9 categories × variant × state),<br/>and run the postcss-scss hardcoded-<br/>declaration pass"]:::code --> R6

    R6{"Classify each finding"}:::code
    R6 -->|global / alias / device,<br/>used raw| V["VIOLATION —<br/>needs own Component token"]:::code
    R6 -->|component-foreign<br/>(another component's own token)| G["REVIEW —<br/>confirm intentional reuse"]:::code
    R6 -->|hardcoded literal,<br/>or missing/typo token| P["GAP —<br/>blocks a clean Figma bind"]:::code
    R6 -->|existing Component token,<br/>anatomy rule failed| N["NAMING —<br/>wrong segment order, casing,<br/>typo, abbreviation, font- prefix"]:::code
    R6 -->|transition/animation property,<br/>or brand-invariant constant<br/>already marked in source| E["EXEMPT —<br/>not a token candidate,<br/>informational only"]:::code

    V --> L["For each VIOLATION/GAP:<br/>reverse-lookup the value against<br/>Base.tokens.json's Alias layer"]:::code
    L -->|match found| M1["Propose that Alias as the<br/>new Component token's resolution"]:::code
    L -->|no match| M2["Propose creating a new Alias<br/>token — never default to Global"]:::code

    M1 --> T
    M2 --> T
    G --> T
    P --> T
    N --> T
    E --> T

    T["Assemble report: a ToC table<br/>(Severity/Location/short Issue),<br/>a Figma Property Checklist matrix,<br/>then one detailed section per finding<br/>with a stated Fix"]:::code --> W["Write <family>.token-check.md<br/>next to the family owner's file"]:::code

    W --> H{{"Present summary to user"}}:::human

    H --> Done(["Done: report file on disk,<br/>unstaged, ready for a fixing agent"]):::phase
```

🔵 **code** — reads files or writes the one report file.
🟡 **human** — the only checkpoint: a brief summary once the report lands. No apply step
exists anywhere in this skill.

## Rules

- NEVER use a Global token directly in a component's own SCSS/TSX.
- NEVER use an Alias or Device token directly in a component's own SCSS/TSX — Alias and
  Device values are legitimate _resolution targets_ for a Component token, but the
  component's code must reference `--ds-<component>-*`, not the Alias/Device var itself.
- NEVER treat prevalence as correctness — e.g. Device tokens are used raw in 14+
  components today; that is the drift this skill exists to surface, not a precedent to
  defer to.
- NEVER propose a Component token resolving straight to Global unless the reverse Alias
  lookup genuinely finds nothing — per `packages/tokens/CONTEXT.md`, Global consumer
  access is "rarely; only when no Alias/Device fits," not a default.
- NEVER write to `Base.tokens.json`, any `.scss`/`.tsx` file, or run `pnpm tokens`. The
  **only** file this skill ever writes is the one report, `<family>.token-check.md`.
  Fixing the findings is a separate, deliberate step a later agent/session takes.
- NEVER flag `component-foreign` usage (a token that genuinely belongs to a different,
  real component) as a VIOLATION — it is informational (`REVIEW`) only, since it is
  often deliberate reuse (e.g. `card-header` mirroring `button`'s small-size scale), and
  it is not itself a Figma gap (it already resolves to a real token).
- NEVER derive which `🧩 Component` JSON key a sub-component's tokens live under by
  guessing `PascalCase(folder name)` — some sub-components (e.g. `tab`) have no own
  top-level key at all; their tokens nest inside the family owner's key (`Tabs`).
  Always derive it from the actual `--ds-*` tokens the code uses (longest-kebab-prefix
  match against every real top-level key).
- MUST run on the whole component **family** (the named component plus every sibling
  sub-component folder under the same parent directory) — never a single sub-component
  in isolation. Naming a sub-component resolves up to its family automatically.
- MUST check both `.host.scss` and `.tsx` files for every family member, not just the
  component the user named.
- MUST run the naming-anatomy rules only against Component-layer keys the family's code
  actually references — not every key that happens to share a name fragment, and not a
  blind walk of the entire `🧩 Component` tree.
- NEVER flag a `transition`/`animation` property (duration, easing/timing function,
  `@keyframes`, delay) as VIOLATION or GAP, even when fully hardcoded (e.g.
  `transition: transform 0.2s ease-in-out;`). Motion timing is out of scope for this
  skill — there is no Alias/Device motion-token layer in `Base.tokens.json` today, and
  proposing one is a design-system-wide decision, not a per-component fix. Report these
  as `EXEMPT` (informational) if mentioned at all, never as a blocker.
- NEVER flag a hardcoded literal as GAP if it represents a **brand-invariant constant**
  — a value that is identical across every brand/theme by construction and will never
  come from a design token (e.g. a fixed rotation angle for a "turn" modifier, a
  decorative drop-shadow that isn't part of the Alias elevation scale, a structural
  ratio that is really a layout decision, not a themeable one). The tell: ask "would
  this value ever need to differ per brand?" — if genuinely no, it isn't a token gap.
  - If the source already carries a marker comment of the form
    `// ds-token-check: intentional — <reason>` on or directly above the value, treat it
    as `EXEMPT` and don't re-report it as a gap in future runs.
  - If no marker exists yet but the agent judges the value brand-invariant, the
    **Fix** for that finding is to add the marker comment in the component's own file
    (not to invent a Component/Alias token for it) — state this explicitly rather than
    proposing a token. This still needs a human to add the comment, since the skill
    itself never edits source files.
  - This judgment call belongs in the report, not silence: still list the finding (as
    `EXEMPT` once marked, or as a `GAP` with a "mark as intentional" fix before it's
    marked) so the family's full hardcoded-literal inventory stays visible — don't just
    drop it.

## Figma Property Checklist

Beyond the layer/naming findings above, every report also includes a **Figma Property
Checklist** — an explicit, enumerated pass over the 9 property categories a Figma
designer needs bound as variables, so nothing is left to "the agent happened to notice
it while reading the file":

**Border · Background · Radius · Typography (font-family, font-weight, font-size,
line-height) · Text-Color · Opacity · Padding · Gap · Margin**

- Each category is crossed only against the `@Prop()` variant dimension(s) that
  actually gate it for this component (e.g. button's Border/Background/Text-Color vary
  by `color`×state; its Typography/Radius/Gap/Padding vary by `size` only) — never a
  blind full cross-product of every category against every prop.
- Variant/state axes come from `@Prop()` enum options in the family's `.tsx` (via the
  repo-wide `@OneOf(SOME_CONST)` / `@Type('boolean')` decorator convention), not from
  guessing at SCSS selector class names.
- Every category gets a row in every report — a found token, a `GAP` cross-referenced
  to a numbered finding, or an explicit `N/A — <reason>` when the property genuinely
  doesn't apply to this component. Nothing is silently omitted.

`scan.js` does the mechanical half of this in two different ways, because they're
genuinely different problems:

1. **Found-token cells** (`buildFigmaChecklist`) are resolved by generating candidate
   token names from the naming convention
   (`--ds-<family>-<dimension>-<value>-<state>-<suffix>`) and checking each against the
   already-compiled token set — **not** by parsing SCSS source. This matters: components
   like `button` build their per-variant tokens via `@each $color in $colors { @include
color($color) }` with `#{$color}` interpolation, so a string like
   `--ds-button-color-secondary-hover-background` never appears literally anywhere in
   the `.scss` source for a text scan to find — it only exists in the compiled CSS.
   Generate-and-check is the only reliable way to catch a gap in that pattern (e.g. one
   color variant missing its hover token while every other color has one).
2. **Hardcoded-literal cells** (`findHardcodedDeclarations`) — properties with no token
   at all, so there's no name to generate — are found by walking a real SCSS AST
   (`postcss-scss`), not line regex. A declaration is reported only if its value
   contains **no** `var(--...)` of any kind (including the component's own private
   `--_<component>-*` indirection layer, which is already covered by the existing
   `--ds-*` usage extraction one hop downstream) and isn't a generic reset keyword
   (`none`, `auto`, `0`, …) or a `transition`/`animation` property (already `EXEMPT` per
   the Rules above).

**Known limitation — read before trusting a row's `states` list as exhaustive:** the
generator discovers which state words a dimension uses by checking whether they're
glued to the _value_ segment (`color-primary-hover-background`). Some components put
`disabled`/`loading` in the **value** position instead, shared across every other
variant value (e.g. button's `--ds-button-color-disabled-base-background`, not
per-color). The generator won't report a false `GAP` for this — it just won't discover
it as part of the crossed dimension either, so that state quietly doesn't appear in the
row at all. Before writing the report, manually check whether the family has a
shared/uncrossed disabled or loading token namespace like this and call it out
separately — don't let its absence from the generated `states` array read as "not
styled."

## Prerequisites

- `packages/tokens/dist/css/base.tokens.css` must exist and be current — run `pnpm
tokens` first if it's missing or `Base.tokens.json` changed since the last build.
  `scan.js` checks token existence against this compiled file, not the JSON source.
- The target component must already exist under `packages/core/src/components/`.

## References

Read only what the current step needs:

- [`scan.js`](scan.js) — the mechanical extraction/classification/key-derivation script,
  plus the Figma Property Checklist generator (`buildFigmaChecklist`) and the
  `postcss-scss`-based hardcoded-declaration pass (`findHardcodedDeclarations`) (see
  "Inputs" below for usage). Read its top-of-file and per-function comments for exactly
  what each pass does and does not cover — in particular the "Known limitation" note on
  `disabled`/`loading` states living in the value position for some components (see
  "Figma Property Checklist" above).
- [`naming-rules.js`](naming-rules.js) — the five ported naming-anatomy rules (font-
  prefix, state-word typos, PascalCase casing, segment order, `Bg`→`Background`), each
  with a comment on why a sixth rule from the original skill (`color-variant-order`) was
  dropped as redundant with the general segment-order check.
- [`packages/tokens/CONTEXT.md`](../../../packages/tokens/CONTEXT.md) — the four-layer
  architecture (Global → Alias → Device → Component), the "Token Naming Anatomy"
  section the naming rules enforce, and why Global access is "rarely" not "never" for a
  Component token's _resolution value_ (as opposed to a component's own code, which
  must never reference Global directly).
- [`packages/core/CONTEXT.md`](../../../packages/core/CONTEXT.md) — the
  `<category>/<family>/<sub-component>/` folder layout `scan.js`'s family resolution
  depends on.
- [`ds-code-to-figma`'s `conventions/tokens-and-props.md`](../ds-code-to-figma/conventions/tokens-and-props.md)
  — the token-resolution discipline this skill is a pre-flight check for ("no visual
  attribute is ever assumed — every value needs an explicit, resolved design token").

## Inputs

A single component or sub-component name, e.g.:

```bash
node .claude/skills/ds-token-check/scan.js tabs
node .claude/skills/ds-token-check/scan.js tab    # resolves up to the tabs family too
```

Output is JSON: the classified usage list, the derived `componentKeys`, the `naming`
violations per key, the parsed `propEnums` (the family's `@Prop()` variant dimensions),
the `figmaChecklist` matrix (found/missing per category×variant×state), and
`hardcodedDeclarations` (literal values with no token at all). The agent reads this,
then reads the same family's files directly to sanity-check the checklist (especially
the disabled/loading limitation above) and add anything the mechanical passes can't see,
before assembling and writing the report.

## Validation

Before writing the report, confirm:

- Every `.host.scss` and `.tsx` file under the family dir (excluding `test/`) was
  scanned — cross-check `scan.js`'s `files` list against a manual `find` if the family
  has an unusual layout.
- Every `VIOLATION`/`GAP` finding's section has an attempted Alias reverse-lookup result
  (a found match, or an explicit "no match — propose new Alias `X`") — never a section
  without a stated **Fix**.
- Every `component-foreign` finding names the real owning component (not "unknown") —
  if `scan.js` reports `unknown` instead of `component-foreign`, treat that as a
  possible typo/missing token and verify against the compiled CSS by hand, don't silently
  reclassify it as foreign.
- No finding recommends resolving straight to a Global token unless its section also
  states the Alias lookup was attempted and found nothing.
- Every derived `componentKeys` entry actually corresponds to a top-level `🧩 Component`
  key that the family's own `--ds-*` usages resolved to — not a key that merely shares a
  text fragment with the family name.
- `NAMING` findings against the `state-typo` rule are sanity-checked against the actual
  sibling group before reporting — the rule has a known false-positive on legitimate
  antonym pairs like `Unselected`/`Selected` (both read as a 2-member "state group" by
  the rule's sibling-majority heuristic); don't drop a real `Unselected`/`Selected` pair
  from the report, but note in that finding's section that this specific pairing is a
  known rule limitation, not a confirmed naming bug, so the fixing agent doesn't blindly
  rename it.
- Every ToC row's `#` matches the heading number of its detail section below, and the
  ToC `Issue` text is a short title, not a restatement of the full recommendation.
- No `transition`/`animation` property was reported as `VIOLATION` or `GAP` — motion
  timing is always `EXEMPT` or omitted entirely, per the rule above.
- Every hardcoded literal judged brand-invariant (and therefore `EXEMPT` or a
  "mark as intentional" `GAP`) is one the agent can actually justify as never differing
  per brand/theme — don't wave through a real theming gap (e.g. a color, a spacing
  value tied to density) under this exemption just because it's convenient.
- Every one of the 9 Figma Property Checklist categories (Border, Background, Radius,
  Typography, Text-Color, Opacity, Padding, Gap, Margin) appears as a row in the report
  for this family — a found token, a `GAP` cross-referenced to a numbered finding, or an
  explicit `N/A — <reason>` — never silently dropped because `scan.js` reported
  `notFoundAnywhere`. `notFoundAnywhere` means "the generator's naming guesses didn't
  find it," not "this component has no such property" — confirm which one it actually
  is before writing N/A.
- The disabled/loading value-position limitation (see "Figma Property Checklist") was
  checked by hand for this family, not just left to whatever `figmaChecklist.states`
  happened to discover.
- Every `hardcodedDeclarations` finding from `scan.js` was triaged into VIOLATION/GAP/
  EXEMPT like any other finding — not left out of the report just because it came from
  the mechanical pass instead of a manual read.

## Completion Criteria

- Every `--ds-*` usage across the family's SCSS/TSX has been classified.
- Every Component-layer key the family's code touches has been run through the naming
  rules.
- Every hardcoded literal that represents a real design value (not structural CSS like
  `flex: 1` or `display: flex`) has been identified by reading the files.
- Every one of the 9 Figma Property Checklist categories has a row for this family —
  found token, GAP, or explicit N/A.
- `<family>.token-check.md` has been written next to the family owner's file, left
  unstaged.
- No other file was modified. There is no further action from this skill — fixing is a
  separate, later step.

## Output

A single Markdown file, `<family>.token-check.md`, next to the family owner's own file
(e.g. `packages/core/src/components/navigation/tabs/tabs/tabs.token-check.md`), left
unstaged for the user to review/commit.

The report has two parts: a compact **table of contents** up top (so the whole family's
health is scannable in one glance), then one **detailed section per finding** below it
(so each issue reads on its own — what's wrong, why it matters, exactly how to fix it —
without needing to decode a cramped table cell). Write every section in plain, direct
language: say what's broken and what to do about it, skip the hedging.

- The ToC table's `Issue` column is a short title only (≤ ~8 words) — the full
  explanation lives in that finding's section, not squeezed into the cell.
- Number findings sequentially across all severities in the order they appear in the
  file(s) (top to bottom), not grouped by severity — the ToC `#` is what the detail
  section headings anchor back to.
- Every detail section MUST end with a **Fix** line: the concrete change (new token
  name, its resolution, or the specific edit) — never leave a finding without a stated
  next step, even a GAP that needs design input first (state what input is needed).
- `EXEMPT` findings get a **Fix** line too, but it's either "none — already marked
  intentional" or "add a `// ds-token-check: intentional — …` comment at this line" —
  never a proposed token.

```markdown
# Token Check — tabs family

Scanned: tabs/, tab/, tab-panel/ · Component-layer keys checked: Tabs, TabPanel

## Table of contents

| #   | Severity  | Location           | Issue                                    |
| --- | --------- | ------------------ | ---------------------------------------- |
| 1   | VIOLATION | tab.host.scss:19   | Raw Global dimension used for min-height |
| 2   | VIOLATION | tab.host.scss:20   | Raw Alias gap token used directly        |
| 3   | REVIEW    | tabs.host.scss:55  | Borrows ds-button's text-color token     |
| 4   | GAP       | tabs.host.scss:124 | Hardcoded hover background color         |
| 5   | GAP       | tabs.host.scss:61  | Reference to a token that doesn't exist  |
| 6   | NAMING    | Base.tokens.json   | "Unselected" flagged as a typo           |

Severity counts: 2 VIOLATION · 1 REVIEW · 2 GAP · 1 NAMING

## Figma Property Checklist

Variant dimensions: `color` (13 options) · `size` (sm, lg) — from `tab.tsx` `@Prop()`.

| Category   | Crossed by    | Status                                                                        |
| ---------- | ------------- | ----------------------------------------------------------------------------- |
| Border     | color × state | ✅ all 39 cells resolved                                                      |
| Background | color × state | ⚠️ 1 missing — see finding #4                                                 |
| Radius     | size          | ✅ all 2 cells resolved                                                       |
| Typography | size          | ✅ all 8 cells resolved (family/weight/size/line-height)                      |
| Text-Color | color × state | ✅ all 39 cells resolved                                                      |
| Opacity    | —             | N/A — tab has no opacity-based state, disabled uses dedicated color tokens    |
| Padding    | size          | ✅ all 2 cells resolved                                                       |
| Gap        | size          | ✅ all 2 cells resolved                                                       |
| Margin     | —             | N/A — tab sets no margin; layout is owned by the parent `tabs` flex container |

`disabled`/`loading` check: tab's disabled styling uses a shared, uncrossed
`--ds-tab-color-disabled-*` namespace (not crossed per-color) — confirmed by hand, not
by the generator (see "Known limitation" in SKILL.md).

## Findings

### 1. VIOLATION — Raw Global dimension used for min-height

**Where:** `tab.host.scss:19`
**Current:** `min-height: var(--ds-global-dimension-size-40);`

This reaches straight into the Global layer. `ds-tab` doesn't own a token for its
min-height, so the component has no single place to override or theme this value, and
nothing here is Figma-bindable.

No existing Alias token matches `size-40` closely enough to reuse.

**Fix:** create `--ds-tab-min-height`, resolving to a new Alias token (propose one —
don't resolve a new Component token straight to Global). Swap line 19 to
`var(--ds-tab-min-height)`.

### 2. VIOLATION — Raw Alias gap token used directly

**Where:** `tab.host.scss:20`
**Current:** `gap: var(--ds-alias-space-gap-xs);`

Alias tokens are resolution targets, not something a component references directly —
`ds-tab` needs its own token name in front of this value.

**Fix:** create `--ds-tab-gap`, keep it resolving to `--ds-alias-space-gap-xs` (the
existing value is fine, it just needs a Component-layer name in front of it). Swap
line 20 to `var(--ds-tab-gap)`.

### 3. REVIEW — Borrows ds-button's text-color token

**Where:** `tabs.host.scss:55`
**Current:** `color: var(--ds-button-color-tertiary-base-text);`

`tabs` is reaching into a real token owned by `ds-button`. This isn't necessarily wrong
— reusing another component's scale is sometimes deliberate — but it's worth a human
decision rather than a silent pass.

**Fix:** confirm with the component owner whether this reuse is intentional. If yes,
leave as-is (optionally add a comment noting it's deliberate). If no, create
`--ds-tabs-scroll-btn-color-text` instead.

### 4. GAP — Hardcoded hover background color

**Where:** `tabs.host.scss:124`
**Current:** `background: rgba(255, 255, 255, 0.12);`

A literal color value with no token behind it at all — this is a hard blocker for
`ds-code-to-figma`, which needs a resolved token to bind to.

**Fix:** create `--ds-tabs-scroll-btn-color-hover-background`. No exact Alias match
found for this translucent white — propose a new Alias token rather than defaulting to
Global.

### 5. GAP — Reference to a token that doesn't exist

**Where:** `tabs.host.scss:61`
**Current:** `var(--ds-badge-size-sm)`

This token isn't in the compiled CSS — likely a typo or a token that was renamed/removed
without updating this call site. Closest real token: `--ds-badge-size-sm-height`.

**Fix:** this is a code bug, not a design gap — update the reference to
`--ds-badge-size-sm-height` (confirm that's the intended value first).

### 6. NAMING — "Unselected" flagged as a typo

**Where:** `Base.tokens.json`, key `--ds-tabs-indicator-default-unselected`

The naming-anatomy rule's sibling-majority heuristic read `Unselected` as a misspelling
of the sibling token `Selected`. This is a known limitation of that rule — legitimate
antonym pairs like `Selected`/`Unselected` trigger it.

**Fix:** none — verify this is in fact the known false-positive (sibling `…-selected`
token exists) before touching anything. Do not rename based on this finding alone.

No files other than this report were modified.
```
