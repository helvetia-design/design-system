import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, parse } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { run } from './cli'

const SKILL_DIR = 'ds-migrate-from-baloise'
const LOCK_FILES = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'npm-shrinkwrap.json']
const SKILL_RELATIVE_PATH = join('.claude', 'skills', SKILL_DIR)

let scratch: string | undefined

afterEach(() => {
  if (scratch) {
    rmSync(scratch, { recursive: true, force: true })
    scratch = undefined
  }
})

function createScratchDir() {
  scratch = mkdtempSync(join(tmpdir(), 'skills-'))
  writeFileSync(join(scratch, 'package.json'), '{}\n')
  writeFileSync(join(scratch, 'pnpm-lock.yaml'), '')
  return scratch
}

function createBareScratchDir() {
  scratch = mkdtempSync(join(tmpdir(), 'skills-'))
  return scratch
}

function hasProjectRootAbove(dir: string) {
  let current = dir
  while (true) {
    if (existsSync(join(current, 'package.json')) && LOCK_FILES.some(name => existsSync(join(current, name)))) {
      return true
    }
    if (current === parse(current).root) {
      return false
    }
    current = dirname(current)
  }
}

async function install(cwd: string, argv: string[] = ['add']) {
  const stdout = collectOutput()
  const stderr = collectOutput()
  const code = await run(argv, { cwd, stdout, stderr })
  return { code, stdout, stderr }
}

function collectOutput() {
  let text = ''
  return {
    get text() {
      return text
    },
    write(chunk: string) {
      text += chunk
    },
  }
}

describe('skills add', () => {
  it('copies the skill payload into .claude/skills, creating the parent folders', async () => {
    const cwd = createScratchDir()
    const stdout = collectOutput()
    const stderr = collectOutput()

    const code = await run(['add'], { cwd, stdout, stderr })

    expect(code).toBe(0)
    expect(stderr.text).toBe('')
    expect(stdout.text).toContain(join(cwd, SKILL_RELATIVE_PATH))

    const copiedSkill = readFileSync(join(cwd, SKILL_RELATIVE_PATH, 'SKILL.md'), 'utf8')
    expect(copiedSkill).toContain('Init')
    expect(copiedSkill).toContain('Components')
    expect(copiedSkill).toContain('Manual')
    expect(copiedSkill).toContain('Detect')
    expect(copiedSkill).toContain('CSS utils')
    expect(copiedSkill).not.toContain('CSS utils (coming soon)')
    expect(copiedSkill).toContain('shared/css-utils.md')
    expect(copiedSkill).not.toContain('Assets (coming soon)')
    expect(copiedSkill).toContain('shared/icons.md')
    expect(copiedSkill).toContain('@helvetia-design/core')
    expect(copiedSkill).toContain('@helvetia-design/styles')
    expect(copiedSkill).toMatch(/never runs `git add`/i)
    expect(copiedSkill).toMatch(/git commit/i)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'scripts', 'scan-migratable.mjs'))).toBe(true)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'shared', 'icon-name-map.json'))).toBe(true)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'shared', 'css-utils.md'))).toBe(true)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'shared', 'css-utils-map.json'))).toBe(true)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'scripts', 'scan-css-utils.mjs'))).toBe(true)
  })

  it('overwrites a previous copy on re-run', async () => {
    const cwd = createScratchDir()
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    mkdirSync(dest, { recursive: true })
    writeFileSync(join(dest, 'SKILL.md'), 'stale payload\n')
    writeFileSync(join(dest, 'stale.txt'), 'should be replaced\n')

    const stdout = collectOutput()
    const stderr = collectOutput()
    const code = await run(['add', '--force'], { cwd, stdout, stderr })

    expect(code).toBe(0)
    expect(stderr.text).toBe('')
    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).not.toContain('stale payload')
    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toContain('Init')
    expect(existsSync(join(dest, 'stale.txt'))).toBe(false)
  })

  it('prints usage and exits with 1 when the add command is missing', async () => {
    const cwd = createScratchDir()
    const stdout = collectOutput()
    const stderr = collectOutput()

    const code = await run([], { cwd, stdout, stderr })

    expect(code).toBe(1)
    expect(stderr.text).toMatch(/Usage: skills add/)
  })

  it('prints usage and exits with 1 for an unknown command', async () => {
    const cwd = createScratchDir()
    const stdout = collectOutput()
    const stderr = collectOutput()

    const code = await run(['list'], { cwd, stdout, stderr })

    expect(code).toBe(1)
    expect(stderr.text).toMatch(/Usage: skills add/)
  })

  it('prints usage and exits with 1 for an unknown flag', async () => {
    const cwd = createScratchDir()
    const { code, stderr } = await install(cwd, ['add', '--unknown'])

    expect(code).toBe(1)
    expect(stderr.text).toBe('Usage: skills add [--force]\n')
    expect(existsSync(join(cwd, '.claude'))).toBe(false)
  })
})

describe('skills add safe install', () => {
  const claudeDir = (cwd: string) => join(cwd, '.claude')
  const tempDir = (cwd: string) => join(claudeDir(cwd), '.ds-migrate-from-baloise.tmp')
  const backupDir = (cwd: string) => join(claudeDir(cwd), '.ds-migrate-from-baloise.bak')

  it('writes .installed.json with the version and a sorted hash per file', async () => {
    const cwd = createScratchDir()
    await install(cwd)

    const marker = JSON.parse(readFileSync(join(cwd, SKILL_RELATIVE_PATH, '.installed.json'), 'utf8')) as {
      version: string
      files: Record<string, string>
    }
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as { version: string }
    const paths = Object.keys(marker.files)

    expect(marker.version).toBe(pkg.version)
    expect(paths).toContain('SKILL.md')
    expect(paths).toContain('shared/css-utils.md')
    expect(paths).not.toContain('.installed.json')
    expect(paths).toEqual([...paths].sort())
    expect(marker.files['SKILL.md']).toMatch(/^[0-9a-f]{64}$/)
  })

  it('succeeds on a re-run of an unmodified install without --force', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const second = await install(cwd)

    expect(second.code).toBe(0)
    expect(second.stderr.text).toBe('')
  })

  it('keeps the old install and leaves no temp folder when the copy fails halfway', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    const before = readFileSync(join(dest, 'SKILL.md'), 'utf8')

    const failingCopy = async (source: string, destination: string) => {
      mkdirSync(destination, { recursive: true })
      cpSync(join(source, 'SKILL.md'), join(destination, 'SKILL.md'))
      throw new Error('disk full')
    }

    await expect(
      run(['add', '--force'], { cwd, stdout: collectOutput(), stderr: collectOutput(), copy: failingCopy }),
    ).rejects.toThrow('disk full')

    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toBe(before)
    expect(existsSync(join(dest, 'shared', 'css-utils.md'))).toBe(true)
    expect(existsSync(tempDir(cwd))).toBe(false)
    expect(existsSync(backupDir(cwd))).toBe(false)
  })

  it('removes a leftover temp folder at the start', async () => {
    const cwd = createScratchDir()
    mkdirSync(tempDir(cwd), { recursive: true })
    writeFileSync(join(tempDir(cwd), 'partial.txt'), 'partial\n')

    const { code } = await install(cwd)

    expect(code).toBe(0)
    expect(existsSync(tempDir(cwd))).toBe(false)
  })

  it('restores a leftover backup folder when the destination is missing', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    renameSync(dest, backupDir(cwd))

    const { code } = await install(cwd)

    expect(code).toBe(0)
    expect(existsSync(backupDir(cwd))).toBe(false)
    expect(existsSync(join(dest, 'SKILL.md'))).toBe(true)
  })

  it('restores the backup unchanged and then reports local edits in it', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    renameSync(dest, backupDir(cwd))
    writeFileSync(join(backupDir(cwd), 'SKILL.md'), 'edited\n')

    const { code, stderr } = await install(cwd)

    expect(code).toBe(1)
    expect(stderr.text).toContain('changed: SKILL.md')
    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toBe('edited\n')
  })

  it('deletes a leftover backup folder when the destination exists', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    mkdirSync(backupDir(cwd), { recursive: true })
    writeFileSync(join(backupDir(cwd), 'old.txt'), 'old\n')

    const { code } = await install(cwd)

    expect(code).toBe(0)
    expect(existsSync(backupDir(cwd))).toBe(false)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'old.txt'))).toBe(false)
  })

  it('refuses to overwrite a local edit without --force and changes nothing', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    writeFileSync(join(dest, 'SKILL.md'), 'my edit\n')

    const { code, stdout, stderr } = await install(cwd)

    expect(code).toBe(1)
    expect(stdout.text).toBe('')
    expect(stderr.text).toContain('changed: SKILL.md')
    expect(stderr.text).not.toContain('.installed.json')
    expect(stderr.text).toContain('--force')
    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toBe('my edit\n')
  })

  it('overwrites a local edit with --force', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    writeFileSync(join(dest, 'SKILL.md'), 'my edit\n')

    const { code, stderr } = await install(cwd, ['add', '--force'])

    expect(code).toBe(0)
    expect(stderr.text).toBe('')
    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toContain('Init')
  })

  it('detects an added file and a removed file', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    writeFileSync(join(dest, 'notes.txt'), 'mine\n')
    rmSync(join(dest, 'shared', 'css-utils.md'))

    const { code, stderr } = await install(cwd)

    expect(code).toBe(1)
    expect(stderr.text).toContain('added: notes.txt')
    expect(stderr.text).toContain('removed: shared/css-utils.md')
    expect(existsSync(join(dest, 'notes.txt'))).toBe(true)
  })

  it('without a marker, lists differing files and notes that upstream changes look the same', async () => {
    const cwd = createScratchDir()
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    mkdirSync(dest, { recursive: true })
    writeFileSync(join(dest, 'SKILL.md'), 'old payload\n')

    const { code, stderr } = await install(cwd)

    expect(code).toBe(1)
    expect(stderr.text).toContain('changed: SKILL.md')
    expect(stderr.text).toContain('cannot tell local edits from upstream changes')
    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toBe('old payload\n')
  })

  it('without a marker, succeeds when the files match the new payload', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    rmSync(join(dest, '.installed.json'))

    const { code, stderr } = await install(cwd)

    expect(code).toBe(0)
    expect(stderr.text).toBe('')
    expect(existsSync(join(dest, '.installed.json'))).toBe(true)
  })

  it('ignores CRLF line endings when checking for local edits', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const skillFile = join(cwd, SKILL_RELATIVE_PATH, 'SKILL.md')
    writeFileSync(skillFile, readFileSync(skillFile, 'utf8').replaceAll('\r\n', '\n').replaceAll('\n', '\r\n'))

    const { code, stderr } = await install(cwd)

    expect(code).toBe(0)
    expect(stderr.text).toBe('')
  })

  it('reports an invalid marker as invalid, not missing', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    writeFileSync(join(dest, '.installed.json'), '{not json')
    writeFileSync(join(dest, 'SKILL.md'), 'my edit\n')

    const { code, stderr } = await install(cwd)

    expect(code).toBe(1)
    expect(stderr.text).toContain('.installed.json in the installed ds-migrate-from-baloise skill is invalid.')
    expect(stderr.text).not.toContain('No .installed.json found')
    expect(stderr.text).toContain('cannot tell local edits from upstream changes')
    expect(stderr.text).toContain('changed: SKILL.md')
  })

  it.each(['{"files":"abc"}', '{"files":null}', '{"files":{"SKILL.md":1}}', 'null'])(
    'treats the marker %s as invalid without crashing',
    async content => {
      const cwd = createScratchDir()
      await install(cwd)
      const dest = join(cwd, SKILL_RELATIVE_PATH)
      writeFileSync(join(dest, '.installed.json'), content)
      writeFileSync(join(dest, 'SKILL.md'), 'my edit\n')

      const { code, stderr } = await install(cwd)

      expect(code).toBe(1)
      expect(stderr.text).toContain('is invalid.')
    },
  )

  it.skipIf(process.platform === 'win32')('does not crash on a dangling symlink in the destination', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    symlinkSync(join(cwd, 'missing-target'), join(dest, 'link'))

    const { code, stderr } = await install(cwd)

    expect(code).toBe(1)
    expect(stderr.text).toContain('added: link')

    const forced = await install(cwd, ['add', '--force'])
    expect(forced.code).toBe(0)
    expect(existsSync(join(dest, 'link'))).toBe(false)
  })

  it('requires --force when the destination is a file', async () => {
    const cwd = createScratchDir()
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, 'not a folder\n')

    const { code, stderr } = await install(cwd)

    expect(code).toBe(1)
    expect(stderr.text).toContain('changed: .')
    expect(readFileSync(dest, 'utf8')).toBe('not a folder\n')

    const forced = await install(cwd, ['add', '--force'])
    expect(forced.code).toBe(0)
    expect(existsSync(join(dest, 'SKILL.md'))).toBe(true)
  })

  it('restores the old install and rethrows when the swap fails', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    const dest = join(cwd, SKILL_RELATIVE_PATH)
    const before = readFileSync(join(dest, 'SKILL.md'), 'utf8')
    let calls = 0
    const failingRename = async (from: string, to: string) => {
      calls += 1
      if (calls === 2) {
        throw new Error('swap failed')
      }
      renameSync(from, to)
    }

    await expect(
      run(['add', '--force'], { cwd, stdout: collectOutput(), stderr: collectOutput(), rename: failingRename }),
    ).rejects.toThrow('swap failed')

    expect(readFileSync(join(dest, 'SKILL.md'), 'utf8')).toBe(before)
    expect(existsSync(tempDir(cwd))).toBe(false)
    expect(existsSync(backupDir(cwd))).toBe(false)
  })

  it('throws an AggregateError and keeps the backup when the rollback also fails', async () => {
    const cwd = createScratchDir()
    await install(cwd)
    let calls = 0
    const failingRename = async (from: string, to: string) => {
      calls += 1
      if (calls === 2) {
        throw new Error('swap failed')
      }
      if (calls === 3) {
        throw new Error('rollback failed')
      }
      renameSync(from, to)
    }

    const error = await run(['add', '--force'], {
      cwd,
      stdout: collectOutput(),
      stderr: collectOutput(),
      rename: failingRename,
    }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(AggregateError)
    const aggregate = error as AggregateError
    expect(aggregate.message).toContain(backupDir(cwd))
    expect(aggregate.errors.map((item: Error) => item.message)).toEqual(['swap failed', 'rollback failed'])
    expect(existsSync(join(backupDir(cwd), 'SKILL.md'))).toBe(true)
    expect(existsSync(tempDir(cwd))).toBe(false)
  })

  it('installs into the project root when run from a sub-folder', async () => {
    const cwd = createScratchDir()
    const sub = join(cwd, 'src')
    mkdirSync(sub)

    const { code } = await install(sub)

    expect(code).toBe(0)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'SKILL.md'))).toBe(true)
    expect(existsSync(join(sub, '.claude'))).toBe(false)
  })

  it('installs into the workspace root when run from a member without a lockfile', async () => {
    const cwd = createScratchDir()
    const member = join(cwd, 'packages', 'app')
    mkdirSync(member, { recursive: true })
    writeFileSync(join(member, 'package.json'), '{}\n')

    const { code } = await install(member)

    expect(code).toBe(0)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'SKILL.md'))).toBe(true)
    expect(existsSync(join(member, '.claude'))).toBe(false)
  })

  it('falls back to cwd when no project root is found', async ctx => {
    const cwd = createBareScratchDir()
    if (hasProjectRootAbove(cwd)) {
      ctx.skip()
    }

    const { code } = await install(cwd)

    expect(code).toBe(0)
    expect(existsSync(join(cwd, SKILL_RELATIVE_PATH, 'SKILL.md'))).toBe(true)
  })
})
