# spinner → Figma validation

## Re-check: text properties + variations (11.11.2026)

Verification run of the two new skill rules (`docs/plans/figma-text-properties-plan.md`,
`docs/plans/figma-variations-section-plan.md`) on throwaway Figma branch `TMW8IfOY7LbN3IXvu3cI15`
only — main is unchanged. Node ids below are the branch's. Only the checks the new rules touch; the
earlier full runs (04.11.2026) wrote no report file.

Before the checks, on the branch: properties renamed in place (`Show label` → `show label`,
`Label` → `label`, `labelPosition` → `label position`, via `editComponentProperty`), sets renamed
(`Spinner/Logo/Primary` → `Spinner`, `…/Logo/Inverted` → `SpinnerInverted`, `…/Circle/Primary` →
`SpinnerCircle`, `…/Circle/Inverted` → `SpinnerCircleInverted`) with their `sub-label`s and the 4
`labelPosition` axis labels; Variations placeholder cloned once from the template and filled.

| #   | Check                                   | Result       | Evidence                                                                                                                                                                                                                                                                                                                                                              |
| --- | --------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2   | Header                                  | pass         | `status=review`, `v0.0.6`, `11.11.2026`; links `components-indicators-spinner-spinner--spinner` (doc-config), Toky `filter=spinner`, GitHub `indicators/spinner`.                                                                                                                                                                                                     |
| 3a  | Naming                                  | pass         | Properties `show label`, `label`, `label position`, `size`; sets `Spinner`, `SpinnerInverted`, `SpinnerCircle`, `SpinnerCircleInverted`; `sub-label`s equal set names.                                                                                                                                                                                                |
| 3a  | Text property                           | pass         | `label` (TEXT, default `Label`) bound on 4 / 4 variants per set, with `show label` (default false) on the same node. No generated text.                                                                                                                                                                                                                               |
| —   | Instances after rename                  | pass         | 344 instances (Button, Input) still `show label=false`, `label position=right`, `size=sm`; the 8 with `show label=true` (doc sections) unchanged.                                                                                                                                                                                                                     |
| 5e  | Variations structure                    | pass         | `Section` `6022:913` last of 4; 2 `Preview`s (`Spinner`, `SpinnerCircle`; no inverted). 2 / 2 instances each: `show label · right` and `show label · bottom` (show label true, the given `label position`, default variant otherwise). Only override: HUG `width` / `height`.                                                                                         |
| 6e  | `Spinner` · `show label · right`        | fail         | Screenshot `6022:913` vs `spinner-label` (first case): label right of the logo ✓, but the logo is ~half the snapshot's size (Figma default variant is `size=sm`; code's default is the unset base size, `--ds-spinner-logo-size-md`) and the label is navy (`Alias/Text/Color/Primary`, `137:288`) where the snapshot is purple (`--ds-spinner-label-color-primary`). |
| 6e  | `Spinner` · `show label · bottom`       | fail         | Label centred below ✓; same size and color differences.                                                                                                                                                                                                                                                                                                               |
| 6e  | `SpinnerCircle` · `show label · right`  | not verified | Case added to `circle-variation` 11.11.2026; snapshot not re-created yet.                                                                                                                                                                                                                                                                                             |
| 6e  | `SpinnerCircle` · `show label · bottom` | not verified | Same.                                                                                                                                                                                                                                                                                                                                                                 |

**Verdict: `fail`** — 2 failures, 2 not verified.

Both failures come from the original build, not the new rules — the Variations section is the first
check that shows Spinner's label against code:

1. **Default variant `size=sm`.** `size` options are `sm`, `base` with `sm` first, so every instance
   (these variations included) starts small. Fix: `base` first. Option order is fixed when a set is
   combined, so the four sets must be recreated from clones in reading order (as `ButtonInverted`
   was) — needs approval; Phase 5 doesn't delete and rebuild.
2. **Label color token not in Figma.** `--ds-spinner-label-color-primary` / `-inverted` resolve to
   `PENDING-FIGMA-SYNC` in `Base.tokens.json`. Hard stop until the token sync creates the variables;
   then bind the label fill to them.

## Repair log

### Iteration 1 (11.11.2026, approved by the user)

- **Default variant `size=sm` → `size=base`** (fix 1 above). All four sets recreated from clones in
  reading order (`label position` right → bottom, then `size` base → sm) and combined, so `size`
  options read `base`, `sm` and the default variant is `label position=right, size=base`. Set
  fill, dashed stroke and radius copied from the old sets; `show label` / `label` re-added and bound
  on every variant; columns re-laid (base left), `Column Labels` values swapped. 360 instances
  re-pointed with `swapComponent` (fill overrides kept, e.g. 129 in Button) and their `show label` /
  `label` values re-set; old sets deleted once they had 0 instances. New ids: `Spinner` `6024:629`,
  `SpinnerInverted` `6024:2692`, `SpinnerCircle` `6024:2794`, `SpinnerCircleInverted` `6024:2912`.
  The four Variations instances set to `size=base`. `Row Labels` widened 77 → 79 to fit
  `label position`.
- **Label color** (fix 2): not repaired — hard stop until the token sync creates
  `--ds-spinner-label-color-primary` / `-inverted`.

### Re-check after iteration 1

| #   | Check                             | Result       | Evidence                                                                                                                                                    |
| --- | --------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5c  | Ordering                          | pass         | All four sets: `size` = base · sm, `label position` = right · bottom; first layer and top-left cell = `label position=right, size=base`.                    |
| 6e  | `Spinner` · `show label · right`  | fail         | Screenshot `6022:913`: logo now the snapshot's size relative to the label, label right ✓; label still navy vs purple in `spinner-label` (token not synced). |
| 6e  | `Spinner` · `show label · bottom` | fail         | Size and position ✓; same label color difference.                                                                                                           |
| 6e  | `SpinnerCircle` · both            | not verified | Snapshot not re-created yet.                                                                                                                                |

**Verdict: `fail`** — only the label color is left, blocked on the token sync.
