import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function readSkillFile(rel: string) {
  return readFileSync(fileURLToPath(new URL(`../skills/ds-migrate-from-baloise/${rel}`, import.meta.url)), 'utf8')
}

describe('shared/legacy-config.md', () => {
  it('keeps the legacy config call until no bal-* component is left, then deletes the whole call', () => {
    const rules = readSkillFile('shared/legacy-config.md')

    for (const phrase of [
      'initializeBaloiseDesignSystem',
      'useBaloiseDesignSystem',
      'provideBaloiseDesignSystem',
      'scan-bal-app.mjs',
      'Reuse those findings instead of running it again',
      'Keep only the call sites of the three calls, not the import lines',
      'scan-migratable.mjs',
      'When **Detect** already ran this script and no file has changed since, reuse its JSON instead',
      'the component being migrated does not count when this migration rewrites every usage of it',
      'A usage that its migration file leaves in place or reports as not migrated, such as a `bal-navbar` with `interface="simple"`, counts as a `bal-*` component left',
      'Check the answer again after the Rewrite step',
      'leave every legacy config call and its import unchanged',
      'the call stays until the last `bal-*` component is migrated',
      'components/app/migration.md',
      'initializeDesignSystem',
      'Never drop a value without reporting it',
      'shared/icons.md',
      'Delete the whole call',
      'Delete every import specifier that only the deleted call used',
      'named `balIcon*` imports from `@baloise/ds-icons` that only its `icons` value used',
      'Delete an import when no specifier is left on it',
      'import * as balIcons',
      'Also keep every `updateBalLanguage` call site',
      'Delete every `updateBalLanguage(...)` call',
      "carry `brand: 'baloise'`",
      "including `brand: 'baloise'` when the call had no `brand` key",
      'Every `forms` key deleted with the call, with the note from the `forms.*` row of the Config table in `components/app/migration.md`',
      'Every `updateBalLanguage` call deleted, with the `ds-*` language call that stays next to it',
      'A `toast` entry that comes only from a `bal-notices` that this run deleted does not count either',
      'unless an existing `initializeDesignSystem` call already sets `brand`',
    ]) {
      expect(rules, phrase).toContain(phrase)
    }
    expect(rules).not.toContain('ignore the component being migrated, because this migration replaces it')
    expect(rules).not.toContain('needs no replacement')
  })

  it('is the only rule that deletes the legacy call, so shared/icons.md defers to it', () => {
    const icons = readSkillFile('shared/icons.md')

    expect(icons).toContain('Never edit the legacy `icons` value or the imports it needs here')
    expect(icons).toContain('`shared/legacy-config.md` decides about the whole call')
    expect(icons).toContain(
      'The legacy registration is reported with the legacy config call by `shared/legacy-config.md`',
    )
    expect(icons).not.toContain('scan-migratable.mjs')
    expect(icons).not.toContain('ignore the component being migrated')
    expect(icons).not.toContain('whether the legacy registration was deleted or kept')
    expect(icons).not.toContain('delete the `icons` entry from the legacy config call')
  })
})

describe('SKILL.md', () => {
  it('hooks shared/legacy-config.md into every component migration and the Assets step', () => {
    const skill = readSkillFile('SKILL.md')
    const componentsStart = skill.indexOf('### Components')
    const manualStart = skill.indexOf('#### Manual')
    const assetsStart = skill.indexOf('### Assets')

    expect(componentsStart).toBeGreaterThan(-1)
    expect(manualStart).toBeGreaterThan(componentsStart)
    expect(assetsStart).toBeGreaterThan(-1)

    const components = skill.slice(componentsStart, manualStart)
    const assets = skill.slice(assetsStart)

    expect(components).toContain('shared/legacy-config.md')
    expect(skill).toContain(
      '**Assets** — migrate legacy icons in files that no component migration touches, move fonts and favicons to `@helvetia-design/assets`, and delete the legacy config call once no `bal-*` component is left',
    )
    for (const phrase of [
      'Then run the Scan section of `shared/legacy-config.md`',
      'List each call it marks for deletion after the icon and asset findings',
      'When step 1 listed icon findings, icon candidates or asset findings, ask one yes/no: rewrite every listed usage and delete every listed call?',
      'When it listed only calls to delete, ask one yes/no: delete every listed call?',
      'Apply the Decide section of `shared/legacy-config.md`',
    ]) {
      expect(assets, phrase).toContain(phrase)
    }
    expect(assets).not.toContain('When steps 2 and 3 were skipped and it would delete a call')
  })
})
