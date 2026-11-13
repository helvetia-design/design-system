import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { compactMarkdown, compactRow, run } from '../scripts/compact-tables.mjs'

const scratches: string[] = []

afterEach(() => {
  for (const dir of scratches) rmSync(dir, { recursive: true, force: true })
  scratches.length = 0
})

function scratchWith(name: string, text: string) {
  const dir = mkdtempSync(join(tmpdir(), 'compact-tables-'))
  scratches.push(dir)
  writeFileSync(join(dir, name), text)
  return dir
}

function capture() {
  const lines: string[] = []
  return { lines, out: { write: (line: string) => lines.push(line) } }
}

describe('compactRow', () => {
  it('removes the alignment padding around cell delimiters', () => {
    expect(compactRow('| `size`      | `sm`   | Copy it.        |')).toBe('| `size` | `sm` | Copy it. |')
  })

  it('shortens a delimiter row and keeps its alignment colons', () => {
    expect(compactRow('| :---------- | -------: | :----: |')).toBe('| :--- | ---: | :---: |')
  })

  it('keeps an escaped pipe and a pipe inside a code span in their cell', () => {
    expect(compactRow('| `a  |  b`   | x \\| y   |')).toBe('| `a  |  b` | x \\| y |')
  })

  it('keeps the indentation of a table inside a list item', () => {
    expect(compactRow('   | a   | b   |')).toBe('   | a | b |')
  })
})

describe('compactMarkdown', () => {
  it('leaves fenced code blocks and prose unchanged', () => {
    const text = ['Some  text  |  here', '', '```md', '| a   | b   |', '```', '', '| a   | b   |'].join('\n')
    expect(compactMarkdown(text)).toBe(
      ['Some  text  |  here', '', '```md', '| a   | b   |', '```', '', '| a | b |'].join('\n'),
    )
  })

  it('keeps a longer fence open across a shorter inner fence', () => {
    const text = ['````md', '```', '| p   | q   |', '```', '| r   | s   |', '````', '| t   | u   |'].join('\n')
    expect(compactMarkdown(text)).toBe(
      ['````md', '```', '| p   | q   |', '```', '| r   | s   |', '````', '| t | u |'].join('\n'),
    )
  })

  it('does not close a fence on a line with an info string', () => {
    const text = ['```md', '```ts', '| a   | b   |', '```', '| c   | d   |'].join('\n')
    expect(compactMarkdown(text)).toBe(['```md', '```ts', '| a   | b   |', '```', '| c | d |'].join('\n'))
  })

  it('shortens only the delimiter row, not a body row of dashes', () => {
    const text = ['| a   | b   |', '| --- | --- |', '| ------ | ----- |'].join('\n')
    expect(compactMarkdown(text)).toBe(['| a | b |', '| --- | --- |', '| ------ | ----- |'].join('\n'))
  })

  it('treats a tilde fence like a backtick fence', () => {
    const text = ['~~~', '| a   | b   |', '~~~'].join('\n')
    expect(compactMarkdown(text)).toBe(text)
  })

  it('returns compacted text unchanged', () => {
    const once = compactMarkdown('| a      | b |\n| ------ | - |\n| long x | y |\n')
    expect(compactMarkdown(once)).toBe(once)
  })
})

describe('run', () => {
  it('rewrites padded files in place and names them', () => {
    const dir = scratchWith('a.md', '| a   | b   |\n')
    const { lines, out } = capture()
    expect(run([], out, dir)).toBe(0)
    expect(readFileSync(join(dir, 'a.md'), 'utf8')).toBe('| a | b |\n')
    expect(lines).toEqual(['compacted: a.md\n'])
  })

  it('lists padded files with --check, exits 1 and writes nothing', () => {
    const dir = scratchWith('a.md', '| a   | b   |\n')
    const { lines, out } = capture()
    expect(run(['--check'], out, dir)).toBe(1)
    expect(readFileSync(join(dir, 'a.md'), 'utf8')).toBe('| a   | b   |\n')
    expect(lines).toEqual(['padded: a.md\n'])
  })

  it('rejects an unknown argument without touching files', () => {
    const dir = scratchWith('a.md', '| a   | b   |\n')
    const { lines, out } = capture()
    expect(run(['--chek'], out, dir)).toBe(1)
    expect(readFileSync(join(dir, 'a.md'), 'utf8')).toBe('| a   | b   |\n')
    expect(lines[0]).toContain('Unknown argument: --chek')
  })
})

describe('skill payload', () => {
  it('has no padded table rows, so the published Markdown carries no alignment whitespace', () => {
    const { lines, out } = capture()
    expect(run(['--check'], out)).toBe(0)
    expect(lines).toEqual([])
  })
})
