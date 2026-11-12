# Typography: every text part wired to one typography token

Package: `packages/core`, `packages/tokens`, `packages/styles`, `.claude/skills/ds-token-check`

Status: Decisions agreed (grilling session 11.11.2026). Not started.

ADR: [ADR-0037](../adr/0037-one-typography-token-per-text-part.md). Glossary: **Text part**, **Inline
text part**, **Part modifier** in [`packages/tokens/CONTEXT.md`](../../packages/tokens/CONTEXT.md).

## Goal

Every piece of text in every component reads all seven parts of one typography token (family, size,
weight, line height, letter spacing, text decoration, text transform), and its size is responsive. A
designer binds a Figma text node to that one token. A brand changes any part of any text by overriding
one token, e.g. underline every level-1 heading, without code changes.

Follows [ADR-0035](../adr/0035-typography-letter-spacing-text-decoration-text-transform.md), which added
the three new parts to the tokens but left component stylesheets on four.

## Decisions

| #   | Decision |
| --- | --- |
| 1   | **Color is out of scope.** It is not part of a typography token and this plan does not touch it. |
| 2   | **One typography token per text part**, on the Component layer. It may alias a shared one (`Notification.Body → Text.Typo.Paragraph`). Loose per-property tokens (`Button.Size.Base.FontFamily`, …) are folded into a typography token and deleted. |
| 3   | **One shared mixin family** in `packages/core/src/typography.scss` wires all seven parts: `typo.local($name, $token)` (7 × `vars.local`), `typo.apply($name, $inline: false)` (7 CSS properties), `typo.mod($name, $token)` (7 × `--mod-`). No hand-written font properties remain in components. |
| 4   | **Text decoration that depends on a variant or state comes from tokens.** A pure element reset (`text-decoration: none` on `<a>`/`<button>` to undo browser defaults) stays hardcoded. Underline offset and thickness stay separate tokens. |
| 5   | **Inline text part** (link in running text): full typography token, but `typo.apply(…, $inline: true)` applies only weight, letter spacing, text decoration, text transform. Family, size and line height are inherited. |
| 6   | **Every `fontSize` resolves to `Device.Text.Size.*`**, no exceptions. A fixed size gets a Device token with equal values. The tokens build fails on a violation; `ds-token-check` reports it too. |
| 7   | **Scope:** all `packages/core` components plus `packages/styles/src/scss/structure.scss`. Utility classes and `packages/ag-grid` are out. |
| 8   | **Phase 0 updates `ds-token-check`.** `ds-code-to-figma` binding of all seven parts is a follow-up in `.claude/skills/ds-code-to-figma/TODO.md`. |
| 9   | **New typography tokens** are named `<Component>.[<Variant/State>.]<Part>.Typo`. Existing typography token names stay. |
| 10  | **One PR per category** (see "PR order"). Acceptance per PR: zero visual diffs. New longhands default to browser defaults (`0`, `none`, `none`); every Alias → Device size swap below has equal values at every breakpoint (XS/SM/Base/LG). |
| 11  | **Canonical public CSS custom properties:** `--<component>[-<part>]-{font-family,font-size,font-weight,line-height,letter-spacing,text-decoration,text-transform}`. Short names (`--link-family`, `--text-size`, `--form-label-weight`, …) are **renamed, not aliased**. Breaking: major changeset with a migration table. |
| 12  | **Part modifier:** a single-property Component token may override one part for a prop/state that changes only that part (`ds-text` weight, selected datepicker day). Two or more changed parts need their own typography token. |

## PR order

Each PR carries its own token changes (Phase 1 items for its components), SCSS, docs/tests (Phase 3) and
its own changeset with its rows of the migration table (Phase 4). The major release goes out only after
the last PR is merged.

| PR  | Content |
| --- | --- |
| 0   | Phase 0 (mixin, Device validation, `ds-token-check`, Figma TODO) + Phase 1 global fixes (slider size, wrong `$type`s). No component wiring yet. |
| 1   | Actions: button (+ its consumers in card-header and snackbar), link |
| 2   | Forms: `form.mixin`, `input.mixin` first, then every forms component |
| 3   | Indicators |
| 4   | Navigation (needs PR 1: pagination uses button) |
| 5   | Overlays (needs PR 1: snackbar button override) |
| 6   | Structure, incl. `typography.content()` (needs PR 1: card header uses button) |
| 7   | Global body (`packages/styles/src/scss/structure.scss`) |

PR 0 must merge first; PRs 1–7 can then run in parallel apart from the noted dependencies. Media has no
work.

## Conventions used in the component list

- **x/7** = parts the component wires today.
- **Pattern** = how the text part is backed today: **C** composite typography token, **L** loose
  per-property Component tokens, **A** Alias/Device or literal values used directly in the SCSS.
- **New token** = typography token to add to `Base.tokens.json`. Default value: alias of the named
  existing token, or the listed parts. Letter spacing, decoration and transform always reference
  `Alias.Text.LetterSpacing.{Text|Heading}`, `Alias.Text.TextDecoration.None`,
  `Alias.Text.TextTransform.None` unless stated.
- **Rename** = public custom properties that change name (decision 11). Every rename goes into the
  migration table (Phase 4).
- Line numbers are from `main` at 11.11.2026, to find the spot, not to trust blindly.

## Phase 0 — Tooling

### 0.1 Mixin family — `packages/core/src/typography.scss`

The file exists (it holds `content()`). Add:

- `typo.local($name, $token)` — emits `vars.local(#{$name}-font-family, var(--ds-#{$token}-font-family))`
  for all seven parts.
- `typo.apply($name, $inline: false)` — emits the seven properties from `--_#{$name}-*`. With `$inline:
  true` only `font-weight`, `letter-spacing`, `text-decoration`, `text-transform`.
- `typo.mod($name, $token)` — emits the seven `--mod-#{$name}-*` from `--ds-#{$token}-*`.
- `typo.prop-docs` is not possible in SCSS. Instead, add a doc snippet to `docs/STYLE_GUIDE.md` showing the
  seven `@prop` lines to copy per text part.

Unit-test with a small Sass compile test if the repo has one for `vars.scss`; otherwise covered by the
visual suite.

### 0.2 Device-size validation — `packages/tokens`

A Style Dictionary validation step (next to the existing typography validation from ADR-0035) fails the
build when a `$type: typography` token's `fontSize` does not resolve, through any chain of references, to
`📱 Device.🔤 Text.Size.*`. Error lists token path and the offending reference.

### 0.3 `ds-token-check` — `.claude/skills/ds-token-check`

- Typography row checks **7/7** per text part, not 4/4.
- Checks: one typography token per text part (decision 2), Device size (decision 6), inline exception
  (decision 5), part modifiers only for single-property props/states (decision 12), canonical public
  prop names (decision 11), new token names (decision 9).
- Hand-written `font-*`/`line-height`/`letter-spacing`/`text-decoration`/`text-transform` outside the
  mixin is a finding, except `text-decoration: none` element resets and `inherit`.
- Update `naming-rules.js` and `SKILL.md`. Existing `*.token-check.md` reports go stale; regenerate per
  component during Phase 2 as the verification step.

### 0.4 Follow-up note

Add to `.claude/skills/ds-code-to-figma/TODO.md`: bind all seven typography variables per text node;
inline text parts bind only weight, letter spacing, decoration, transform.

## Phase 1 — Tokens (`packages/tokens/tokens/Base.tokens.json`)

The global fixes below go into PR 0. The token additions/removals listed per component in Phase 2 go
into that component's category PR, before its SCSS changes. After each, `pnpm tokens` and check the
Device validation passes. OrangeVacations overrides no
font token today, so no brand file changes.

Global fixes:

- `Slider.Tooltip.Typo.fontSize`: `Alias.Text.Size.SM` → `Device.Text.Size.SM` (both 14px).
- Wrong `$type`: `Tag.Size.*.FontWeight`, `Datepicker.Calendar.Day.Weight.*`, `Select.Option.Weight.Selected`
  are `string`; they are deleted or become `fontWeight` part modifiers (see components).

## Phase 2 — Components

### Actions

#### `ds-button` — `actions/button/button.style.scss`
- **Text parts:** label. **Today:** 4/7, L (`Button.Size.{SM,Base,LG}.{FontFamily,FontWeight,FontSize,LineHeight}`), sizes on Alias.
- **New tokens:** `Button.Size.{SM,Base,LG}.Label.Typo` from the loose values, size → `Device.Text.Size.{SM,Base,LG}`. Delete the 12 loose tokens.
- **Part modifiers:** `Button.Link.Label.TextDecoration` = underline (the `is-link` variant changes only decoration; replaces the hardcoded `@mixin text-decoration` at :200). `Button.Disabled.Label.TextDecoration` = none (:558, disabled link loses underline). Offset/thickness stay as is.
- **SCSS:** :21–24 → `typo.local(button, 'button-size-base-label-typo')`; :86–89 → `typo.apply(button)`; :351–354 / :376–379 → `typo.mod`. :75 stays (reset).
- **Rename:** none (already canonical); adds `--button-letter-spacing`, `--button-text-decoration`, `--button-text-transform`.
- **Consumers to update:** `structure/card/card-header/card-header.mixin.scss:10–13` and `overlays/alert/snackbar/snackbar.host.scss:144,155` set `--button-font-*` from `--ds-button-size-sm-*`; point them at `--ds-button-size-sm-label-typo-*`, all seven parts.

#### `ds-link` — `actions/link/link.style.scss` — **inline text part**
- **Today:** 2/7 (family, weight), L (`Link.FontFamily` = `"inherit"`, `Link.FontWeight`), decoration hardcoded :65.
- **New tokens:** `Link.Typo` — family `Alias.Text.Family.Text` (Figma sample only), size `Device.Text.Size.Base`, line height `Alias.Text.LineHeight.Text`, weight `Alias.Text.Weight.Bold`, decoration `Alias.Text.TextDecoration.Underline`. Delete `Link.FontFamily`, `Link.FontWeight`. Keep `Link.UnderlineWidth`.
- **SCSS:** :39–40 → `typo.local(link, 'link-typo')`; :60–61, :65 → `typo.apply(link, $inline: true)`. Font family stays inherited (no rule written).
- **Rename:** `--link-family` (removed, inline parts have no family prop), `--link-weight` → `--link-font-weight`.

#### `ds-close`
- No text part. No change.

### Forms

Shared mixins first: `form.mixin.scss` (label, description) and `input.mixin.scss` (control) are used by
input, number-input, textarea, time-input, phone-input, datepicker, select, file-upload, checkbox-group,
radio-group, segment.

#### `form.mixin.scss` — label and description
- **Today:** 4/7, C (`Form.{Default,Disabled}.{Label,Description}.Typo`).
- **SCSS:** :97–100 → `typo.local(form-label, 'form-default-label-typo')`; :129–132 → `typo.apply(form-label)`; same for description :143–146, :167–170. Wire the disabled typography tokens through `typo.mod` (verify whether they are used today; if not, wire them for the disabled state).
- :164 `min-height: calc(size * line-height)` keeps reading `--_form-description-font-size`.
- **Rename:** `--form-label-{family,weight,size}` → `--form-label-font-{family,weight,size}`; same for `--form-description-*`. Documented `--checkbox-group-label-*`, `--radio-group-label-*`, `--segment-label-*`, `--checkbox-group-description-*`, … `@prop`s in group hosts: verify they exist; if they are only doc entries, replace them with the `--form-*` names.

#### `input.mixin.scss` — control
- **Today:** 4/7, C (`Form.Default.Control.Typo`).
- **SCSS:** :28–31 → `typo.local(#{$prefix}, 'form-default-control-typo')`; :48–51 → `typo.apply(#{$prefix})`. Disabled: `Form.Disabled.Control.Typo` via `typo.mod`.
- **Rename (per prefix):** `--{input,textarea,datepicker,phone-input,time-input,select}-{family,weight,size}` → `-font-{family,weight,size}`. `--number-input-*` is the same if it uses its own prefix (verify).

#### `ds-input`, `ds-textarea`, `ds-number-input`, `ds-time-input`
- Covered by the two mixins. Check each `*.host.scss` `@prop` block matches the renamed names.

#### `ds-label` — `forms/label/label.style.scss`
- **Today:** 4/7, C (`Label.Typo.{Base,SM,LG,XL,2XL,3XL}`).
- **SCSS:** :20–23, :44–47, :92–95 → mixins.
- **Rename:** `--label-{family,weight,size}` → `--label-font-*`.

#### `ds-checkbox` / `ds-radio` / `ds-toggle` — `*.mixin.scss` `_label-styles`
- **Text parts:** option label. **Today:** 2/7, A (`font-family: var(--ds-alias-text-family-text)`, `line-height: var(--ds-alias-text-line-height-text)`, size inherited from host) — checkbox.mixin :84–85, radio.mixin :80–81, toggle.mixin :79–80. Loose `Checkbox.FontFamily`, `Radio.FontFamily`, `Toggle.FontFamily` exist but are not used.
- **New tokens:** `Checkbox.Label.Typo`, `Radio.Label.Typo`, `Toggle.Label.Typo` → alias `Form.Default.Control.Typo` (verify the computed size matches; host font size today comes from body = `Text.Typo.Paragraph` = Device Base, same as Control). Delete the three loose `FontFamily` tokens.
- **Rename:** `@prop --checkbox-label-font-{size,family,weight}` and `--checkbox-helper-font-size` are documented in `checkbox.host.scss:17–23` but not wired. Wire them via the mixin (they are already canonical) and drop `--checkbox-helper-font-size` if there is no helper part. Same check for radio and toggle.

#### `ds-checkbox-group` / `ds-radio-group`
- Group label/description come from `form.mixin`. Only `@prop` doc fixes (see form.mixin).

#### `ds-counter` — `forms/counter/counter.host.scss`
- **Text parts:** value. **Today:** 2/7 (weight, family), A (:38–39). Size/line height inherited.
- **New tokens:** `Counter.Value.Typo` — family Text, weight Bold, size/line height = what the value renders at today (resolve in the browser; likely `Form.Default.Control.Typo` size/line height).
- **Rename:** none (already canonical); add the missing five.

#### `ds-datepicker` — `forms/datepicker/datepicker.host.scss`
- **Text parts:** input control (input.mixin), calendar (month/year header, day), day name. **Today:** L (`Datepicker.Calendar.{Family,Weight}`, `Calendar.Day.Weight.{Base,Selected}`, `Calendar.DayName.{Family,Weight}`), size `--_datepicker-calendar-size` (:329, :346) and day name `font-size: 1rem` literal (:436), `text-transform: none` (:437, reset of air-datepicker).
- **New tokens:** `Datepicker.Calendar.Typo`, `Datepicker.Calendar.DayName.Typo` (size `Device.Text.Size.Base` = 1rem). Delete the loose ones.
- **Part modifier:** `Datepicker.Calendar.Day.Selected.FontWeight` (selected day changes only weight). `Day.Weight.Base` is the composite's weight, delete it.
- **SCSS:** air-datepicker vars `--adp-font-family`/`--adp-font-size` (:328–329) read from `--_datepicker-calendar-*`. :345, :353 `font-family: inherit` stay. :437 `text-transform: none` becomes `typo.apply` (token value none). :178 reset stays.
- **Rename:** `--datepicker-calendar-{family,size,weight}`, `--datepicker-calendar-day-name-{family,weight}` → `-font-*`; `--datepicker-calendar-day-weight{,-selected}` → `--datepicker-calendar-day-font-weight{,-selected}`.

#### `ds-file-upload` — `forms/file-upload/file-upload.host.scss`
- **Text parts:** drop-zone label, drop-zone description (:160–166), plus form label/description from `form.mixin`. **Today:** A — :133–135, :160–161, :166 use Alias family/weight/size directly; :35–38 local vars exist. Loose `FileUpload.{Label,Control,Description}.{Font.*,Text.LineHeight}` tokens exist (check usage; likely dead).
- **New tokens:** `FileUpload.Label.Typo` (Text, Bold, Device Base), `FileUpload.Description.Typo` (Text, Regular, Device XS). Delete the loose ones that are unused.
- **Rename:** `--file-upload-label-{family,weight,size}` → `-font-*`.

#### `ds-phone-input` — `forms/phone-input/phone-input.host.scss`
- **Text parts:** control (input.mixin prefix `phone-input`), country picker list (:330–331). **Today:** 4/7 and 2/7.
- **SCSS:** :153–156 → `typo.apply(phone-input)`; :330–331 → `typo.apply(phone-input)` too (same text part, list rows render like the control) or a separate `PhoneInput.Option.Typo` if the size differs in the browser (verify).
- **Rename:** via input.mixin.

#### `ds-segment` — `forms/segment/segment/segment.mixin.scss`
- **Text parts:** item label, item description. **Today:** L — `Segment.Item.FontWeight`, `Segment.Description.{FontWeight,FontSize}` (size on Alias SM).
- **New tokens:** `Segment.Item.Label.Typo` (family/size/line height from what it inherits today, weight Bold), `Segment.Item.Description.Typo` (Device SM). Delete loose ones.
- **SCSS:** :28–30, :80, :86–87, :287.
- **Rename:** `--segment-item-font-weight` stays canonical; `--segment-description-*` stays; group `--segment-{label,description}-{family,size,weight}` docs → see form.mixin.
- **Cleanup:** `segment/segmented-button.scss` is not imported anywhere (uses old `tokens.get('button-segmented-font-weight')` and literal `line-height: 1.2`). Delete it.

#### `ds-select` — `forms/select/select.host.scss`
- **Text parts:** control (input.mixin), dropdown content/option, selected option, optgroup label, tag/chip (multi-select). **Today:** L — `Select.Content.Family` (:99), `Select.Option.Weight.Selected` (:110, `string`), `Select.Optgroup.Weight` (:123), `Select.Chip.Family` (:131); chip borrows `--ds-tag-size-sm-font-{size,weight}` (:559–560) and literal `line-height: 1` (:558). `Select.{Label,Control,Description}.*` loose tokens exist (check usage; label/description come from form.mixin).
- **New tokens:** `Select.Option.Typo` (alias `Form.Default.Control.Typo`), `Select.Optgroup.Typo` (Bold), `Select.Chip.Typo` (alias `Tag.Size.SM.Label.Typo`, see Tag; line height 1 → needs an `Alias.Text.LineHeight.Single` reference, which exists).
- **Part modifier:** `Select.Option.Selected.FontWeight` (only weight changes).
- Delete loose `Select.*` font tokens.
- **Rename:** `--select-content-family` → `--select-option-font-family` (and the other six); `--select-option-selected-weight` → `--select-option-selected-font-weight`; `--select-optgroup-weight` → `--select-optgroup-font-weight`; `--select-tag-family` → `--select-tag-font-family` (+6).

#### `ds-slider` — `forms/slider/slider.host.scss`
- **Text parts:** tooltip value. **Today:** 4/7, C (`Slider.Tooltip.Typo`), but read straight as `--ds-*` (:152–156), no public props.
- **Tokens:** size fix in Phase 1.
- **SCSS:** add `typo.local(slider-tooltip, 'slider-tooltip-typo')` + `typo.apply`. New public props `--slider-tooltip-font-*` etc.

### Indicators

#### `ds-badge` — `indicators/badge/badge.host.scss`
- **Text parts:** label. **Today:** 4/7, L (`Badge.Typo.{FontFamily,FontWeight,LineHeight}` + `Badge.Size.{SM,Base,LG}.Font` dimension; SM = `0rem`, hides text in the dot size).
- **New tokens:** `Badge.Size.{Base,LG}.Label.Typo` (Device SM / LG). SM keeps hiding text: `Badge.Size.SM.Label.Typo` with size `Device.Text.Size.Base` breaks the 0rem trick, so keep SM's `font-size: 0` as a hardcoded rule in the `is-sm` modifier (it is a "no text" state, not a typography value). Delete loose ones.
- **SCSS:** :29–32, :64–75, :130, :148.
- **Rename:** none (canonical); add the three.

#### `ds-hint` — `indicators/hint/hint.host.scss`
- **Text parts:** heading, body. **Today:** 4/7, C (`Hint.Heading → Heading.Level.3`, `Hint.Body → Body.Font`).
- **SCSS:** :30–39, :129–140 → mixins. :72 `line-height: 0` is the trigger icon box, not text; leave.
- **Rename:** none.

#### `ds-progress-bar`
- No text part. No change.

#### `ds-spinner` — `indicators/spinner/spinner.host.scss`
- **Text parts:** label. **Today:** 4/7, L (`Spinner.Label.{FontFamily,LineHeight,FontSize,FontWeight}`, size Alias Base).
- **New tokens:** `Spinner.Label.Typo` (size Device Base). Delete loose.
- **Rename:** none.

#### `ds-tag` — `indicators/tag/tag.style.scss`
- **Text parts:** label. **Today:** 4/7, L (`Tag.FontFamily`, `Tag.LineHeight`, `Tag.Size.{Base,SM,MD,LG}.{FontWeight,FontSize}`, weights typed `string`).
- **New tokens:** `Tag.Size.{SM,Base,MD,LG}.Label.Typo`. Delete loose.
- **SCSS:** :25–28, :56–59, :164–187.
- **Rename:** none. Consumers: `ds-select` chip.

### Media

`ds-icon` (`line-height: 1` box reset), `ds-brand-icon`, `ds-logo`, `ds-picture`, `ds-shape`: no text part. No change.

### Navigation

#### `ds-app-navbar` — `navigation/app-navbar/app-navbar.host.scss`
- **Text parts:** title, sidebar item, menu item. **Today:** title 3/7, sidebar item 3/7, menu item 1/7 (size only); L (`AppNavbar.Default.{Title,Sidebar.Item,Menu.Item}.Font*`), sidebar/menu sizes on Alias Base; :690 menu item active `font-weight: var(--ds-alias-text-weight-bold)`; line heights inherited.
- **New tokens:** `AppNavbar.Default.Title.Typo`, `AppNavbar.Default.Sidebar.Item.Typo`, `AppNavbar.Default.Menu.Item.Typo` (line heights = what they inherit today). Delete loose.
- **Part modifier:** `AppNavbar.Default.Menu.Item.Active.FontWeight` (:690).
- **SCSS:** :118–120, :148–150, :174, :340–342, :516–519, :660, :690. :519, :664 `text-decoration: none` are `<a>` resets; stay.
- **Rename:** none (canonical).

#### `ds-pagination` — `navigation/pagination/pagination.host.scss`
- **Text parts:** page buttons (are `ds-button` → button label tokens), compact value `<strong>` (:149), ellipsis (:71 literal `font-weight: 700`). Surrounding text inherits from body.
- **New tokens:** `Pagination.Text.Typo` (alias `Text.Typo.Paragraph`) for the compact "x of y" text and the ellipsis; part modifier `Pagination.Value.FontWeight` (Bold) for `<strong>`.
- **SCSS:** wire `Pagination.Text.Typo` on the list; :71 literal → token; :149 → part modifier.
- **Rename:** none; adds `--pagination-text-font-*` etc.

#### `ds-steps` / `ds-step` — `navigation/steps/*`
- **Text parts:** step label, step number (circle). **Today:** 4/7, C (`Steps.Step.Typo.{Base,SM}`), but SM wired as a separate `--steps-step-font-size-sm` var (only size); number uses `line-height: 1` literal (:39, :56).
- **New tokens:** `Steps.Step.Number.Typo` (same as `Steps.Step.Typo.Base` with line height `Alias.Text.LineHeight.Single`).
- **SCSS:** steps.host :53–57 → `typo.local`; step.host :36–38, :53–56, :96–99, :216–219 → `typo.apply`; :148, :249 → `typo.mod(steps-step, 'steps-step-typo-sm')` (SM changes size only, but it is an existing typography token, use it whole). :210 `<a>` reset stays.
- **Rename:** `--steps-step-font-size-sm` removed (replaced by the mod).

#### `ds-tabs` / `ds-tab` — `navigation/tabs/*`
- **Text parts:** tab label (selected / unselected). **Today:** 4/7, C (`Tabs.Tab.{Selected,Unselected}.Typo`). tabs.host :108–109 overrides unselected family/weight with Alias values for a variant; tab.host :152–153, :215–216 hardcode `Alias.Text.Family.Heading` + selected weight for a hidden "bold width reserve" pseudo-element.
- **New tokens:** for the :108–109 variant (identify which variant; likely `vertical`/`underline`): `Tabs.Tab.<Variant>.Unselected.Typo` (two parts change → own typography token).
- **SCSS:** tabs.host :34–44 → `typo.local`; tab.host :27–30, :75–78, :189–192, :207–210 → `typo.apply`; :152–153, :215–216 → `typo.apply(tabs-tab-selected)` (the reserve must match the selected text exactly, all seven parts, letter spacing matters for width). :25, :193 resets stay.
- **Rename:** none.

### Overlays

#### `ds-snackbar` / `ds-toast` — `overlays/alert/*`
- **Text parts:** heading, body. **Today:** 4/7, C (`{Snackbar,Toast}.{Heading,Body}`).
- **SCSS:** snackbar :30–40, :111–128; toast :37–47, :122–139 → mixins. Snackbar :144, :155 button size override → see `ds-button` consumers.
- **Rename:** `--{snackbar,toast}-content-*` keep part name `content` (already canonical shape).

#### `ds-modal` — `overlays/modal/modal.host.scss`
- **Text parts:** heading. **Today:** 4/7, C (`Modal.Heading`).
- **SCSS:** :24–27, :121–124.
- **Rename:** `--modal-heading-{family,weight,size}` → `-font-*`.

#### `ds-notification` — `overlays/notification/notification.style.scss`
- **Text parts:** heading, body. **Today:** 4/7, C (`Notification.<Color>.{Heading,Body}`).
- **SCSS:** :25–33, :100–124, :234–242 (color mod).
- :113 `height: calc(var(--_notification-heading-line-height) * 16px)` hardcodes 16px — the icon box assumes a 16px font. Use `1lh` or `calc(line-height * font-size)` instead (verify zero diff).
- **Rename:** `--notification-{heading,content}-{family,weight,size}` → `-font-*`.

#### `ds-tooltip` — `overlays/tooltip/tooltip.host.scss`
- **Text parts:** text. **Today:** 4/7, C (`Tooltip.Text`).
- **SCSS:** :34–37, :129–132. :138–141 `inherit` block (slotted content) stays.
- **Rename:** none.

#### `ds-drawer`, `ds-sheet`, `ds-popup`
- No own text part (slotted content). No change.

### Structure

#### `ds-accordion` — `structure/accordion/accordion.host.scss`
- **Text parts:** summary. **Today:** 4/7, C (`Accordion.Summary.Typo`), but the heading variant (:139–161) builds a heading look from Alias family/weight/line height plus `--ds-heading-level-N-font-size` (borrow).
- **New tokens:** `Accordion.Summary.Level.{1..5}.Typo` → alias `Heading.Level.{1..5}`.
- **SCSS:** :28–31, :77–80 → mixins; :139–161 → `typo.mod(accordion-summary, 'accordion-summary-level-N-typo')`.
- **Rename:** `--accordion-summary-font-line-height` → `--accordion-summary-line-height`.

#### `ds-app-footer` — `structure/app-footer/app-footer.host.scss`
- **Text parts:** footer text, section title (:107 Alias bold), links (:172–196). **Today:** 4/7 C for text; title A; links hardcode `underline` on hover/focus (:178, :184).
- **New tokens:** `AppFooter.Title.Typo` (AppFooter.Typo + Bold, line height as rendered; :128 literal `1.3` → nearest `Alias.Text.LineHeight.*` only if equal, else new Alias value). Part modifier `AppFooter.Link.Hover.TextDecoration` = underline.
- **SCSS:** :33–36, :75–78 → mixins. :172, :196 resets stay.
- **Rename:** none.

#### `ds-card` family — `structure/card/*`
- **Text parts:** title (`ds-heading`), subtitle, content (`typography.content()`), header actions (button size SM, see `ds-button` consumers).
- `card-title` renders `ds-heading`: covered there. `card-subtitle`: verify which component renders it and whether it needs `Card.Subtitle.Typo`.
- `card.style.scss:64` `<a>` reset stays.
- **Content:** see `typography.content()` below.

#### `typography.content()` — `packages/core/src/typography.scss`
- Rich-text mixin used by `card.style.scss:73`, `card-content.host.scss:7`, `list.style.scss:337`. Sets Alias family/weight, `h1–h5` size + line height from `Heading.Level.N` (partial), `.ds-subtitle` weight.
- **SCSS:** body text → `Text.Typo.Paragraph` via `typo.apply`-like emission (no public props; content is consumer HTML); `h1–h5` / `[role=heading]` → all seven parts of `Heading.Level.N`; `strong, b` → `Heading.Emphasis.FontWeight`-style part modifier `Text.Weight.Bold`; `.ds-subtitle` → `Heading.Level.Light*` where available. `list.style.scss:336` `font-size: var(--ds-device-text-size-sm)` → a `List.Content.Typo` (alias `Text.Typo.Small`).

#### `ds-carousel-item` — `structure/carousel/carousel-item/carousel-item.host.scss`
- :136–139 `<a>` reset + `inherit`. No own text part. No change.

#### `ds-data` / `ds-data-item` — `structure/data/data-item.host.scss`
- **Text parts:** label, value. **Today:** label 1/7 (weight, `DataItem.Label.FontWeight`); value inherits.
- **New tokens:** `DataItem.Label.Typo` (alias `Text.Typo.Paragraph` + Bold), `DataItem.Value.Typo` (alias `Text.Typo.Paragraph`). Delete `DataItem.Label.FontWeight`.
- **Rename:** `--data-item-font-weight-label` → `--data-item-label-font-weight` (+6); new `--data-item-value-*`.

#### `ds-heading` — `structure/heading/heading.style.scss`
- **Text parts:** heading; emphasis (`<strong>` inside). **Today:** 4/7, C (`Heading.Level.*`); emphasis via `Heading.Emphasis.FontWeight` (already a part modifier).
- **SCSS:** :24–39, :64–67, :177–180 → mixins. :73 `inherit` stays.
- **Rename:** `--heading-{family,weight,size}` → `--heading-font-*`.
- This is the example of the goal: `Heading.Level.1.textDecoration` → underline must change every level-1 heading, including card titles, `typography.content()` h1 and the accordion level 1.

#### `ds-list` / `ds-item` — `structure/list/*`
- **Text parts:** item title, item text; native list marker (:131 `font-size: 0.75rem` literal); native heading list title (:72–73 Alias bold heading); description list term/detail.
- **Today:** item 4/7 C (`List.Item.{Title,Text}`), but item.host :193 overrides title size from `Heading.Level.N` (borrow, size only); list.style :184 Alias bold. Description list 2/7 L (`DescriptionList.{Term,Detail}.{FontWeight,FontFamily}`).
- **New tokens:** `List.Item.Title.Level.{1..5}.Typo` (alias `Heading.Level.N` — if only size differs, use a part modifier instead; check whether family/weight also differ from `List.Item.Title`), `List.Marker.Typo` (`Device.Text.Size.XS` = 12px = 0.75rem), `List.Heading.Typo`, `DescriptionList.Term.Typo`, `DescriptionList.Detail.Typo` (sizes/line heights as rendered today). Delete loose `DescriptionList.*`.
- **SCSS:** item.host :67–75, :124–164, :193, :223–226; list.style :43–51, :116–155, :183–185, :336; list-native :72–73, :131; description-list-native :29–34, :57–66. :189, :206 resets stay.
- **Rename:** `--list-item-{title,text}-{family,weight,size}` → `-font-*`; `--description-list-{term,detail}-{family,weight}` → `-font-*`.

#### `ds-table` — `structure/table/table.style.scss`
- **Text parts:** cell, head cell. **Today:** 4/7, C (`Table.Font`, `Table.Head.Font`), read straight as `--ds-*` (:42–45, :96–99), no public props.
- **SCSS:** `typo.local(table, 'table-font')`, `typo.local(table-head, 'table-head-font')` + apply.
- **Rename:** none; new `--table-*`, `--table-head-*` props.

#### `ds-text` — `structure/text/text.style.scss`
- **Text parts:** text. **Today:** 4/7, C (`Text.Typo.*`); weight prop via part modifiers `Text.Weight.*` (:121, :128); `typo($variant)` mixin (:280) sets only family/weight/line height for heading/subtitle; :61 bold for `<strong>`.
- **SCSS:** :25–28, :50–53 → mixins; :228 size mod → `typo.mod` (size variants are whole typography tokens); :280–303 local `typo()` mixin → replaced by `typo.mod(text, 'text-typo-#{$variant}')`; weight prop stays a part modifier.
- Check the interaction: `heading` variant + size variant today combine (heading family/weight + size from size token). With whole-token `typo.mod`, the later one wins. Keep the current combination by applying size as a part modifier on top of the heading/subtitle variant (size = single property → decision 12). Verify with the visual suite.
- **Rename:** `--text-{family,weight,size}` → `--text-font-*`.

#### `ds-container`, `ds-content`, `ds-divider`, `ds-grid`, `ds-root`, `ds-stack`
- No own text part. No change.

### Global body — `packages/styles/src/scss/structure.scss`
- `html, :host` (:13–16), `body, button, input, optgroup, select, textarea` (:49–52), `body` (:57–60) set 4/7 from `Body.Font` (alias `Text.Typo.Paragraph`).
- Add `letter-spacing`, `text-decoration`, `text-transform` from `--ds-body-font-*` to `html, :host` and `body`. Not to the form-control block (`text-decoration` on `<input>` is meaningless; letter spacing and transform yes).
- No public props (global stylesheet).

## Phase 3 — Docs and tests

- Every changed `@prop` block: seven lines per text part, canonical names (decision 11).
- `pnpm build` regenerates `components.json` / `components.d.ts`; Storybook Styling pages read from it.
- Grep tests, stories, `apps/*` and `packages/{react,angular}` for every renamed property and update.
- `packages/core/CONTEXT.md` and `docs/STYLE_GUIDE.md`: replace hand-written font wiring examples with
  the mixin.
- Re-run `ds-token-check` per component; reports must show 7/7 for every text part.
- `pnpm test`, `pnpm lint`, visual suite: **zero diffs**.

## Phase 4 — Release

- Major changeset (`pnpm changeset`, `@helvetia-design/core` major, `@helvetia-design/tokens` major for the
  deleted loose tokens, `@helvetia-design/styles` minor).
- Migration table in the changeset: old custom property → new custom property, and deleted token →
  replacement typography token.

## Risks

- **Hidden visual diffs from inherited values.** Parts that inherit today (counter value, segment label,
  app-navbar line heights, data value, checkbox label) get explicit tokens; the token must equal the
  computed value. Read computed styles in the browser before choosing the reference.
- **`ds-text` variant × size combination** (see `ds-text`). Most likely place for a diff.
- **Letter spacing in tab width reserve.** The pseudo-element must apply the same seven parts as the
  selected label or tabs jump when a brand sets letter spacing.
- **Removed loose tokens may be used by consumers** directly as `--ds-*`. Covered by the major changeset;
  list them in the migration table.
- **Breaking changes spread over several PRs.** `main` holds a partly migrated API between PRs; do not
  release until PR 7 is merged. Merge the changesets into one migration table at release.
