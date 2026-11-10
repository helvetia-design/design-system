import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { endOfString, maskComments, scanSourceFiles } from '../skills/ds-migrate-from-baloise/scripts/source-scan.mjs'

const scratches: string[] = []

afterEach(() => {
  for (const dir of scratches) rmSync(dir, { recursive: true, force: true })
  scratches.length = 0
})

function createScratchDir() {
  const dir = mkdtempSync(join(tmpdir(), 'ds-migrate-source-'))
  scratches.push(dir)
  return dir
}

function write(root: string, rel: string, contents: string) {
  const file = join(root, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

function maskedFiles(root: string) {
  const masked: Record<string, string> = {}
  scanSourceFiles(root, (source: { file: string; masked: string }) => {
    masked[source.file] = source.masked
  })
  return masked
}

describe('maskComments', () => {
  it('keeps `//` inside a string and blanks a real line comment', () => {
    const text = "const url = 'https://x.ch' // note"
    expect(maskComments(text, 'script')).toBe("const url = 'https://x.ch'        ")
  })

  it('keeps every string and blanks block and HTML comments in script', () => {
    const text = 'const a = "/* no */" /* yes */ + `<!-- gone --> kept`'
    expect(maskComments(text, 'script')).toBe(`const a = "/* no */"${' '.repeat(11)}+ \`${' '.repeat(13)} kept\``)
  })

  it('treats only `<!--` as a comment in HTML markup outside script and style', () => {
    const text = '<input accept="image/*"><p>a // b</p><!-- c --><div class="x"></div>'
    expect(maskComments(text, 'markup')).toBe('<input accept="image/*"><p>a // b</p>          <div class="x"></div>')
  })

  it('applies script and style rules inside their blocks only', () => {
    const text = '<p>https://x.ch</p><script>const a = 1 // c\n</script><style>/* s */ .a {}</style>'
    expect(maskComments(text, 'markup')).toBe(
      '<p>https://x.ch</p><script>const a = 1     \n</script><style>        .a {}</style>',
    )
  })

  it('keeps a URL in Vue template text', () => {
    const text = '<template><p>See https://x.ch <span class="a">b</span></p></template>'
    expect(maskComments(text, 'markup')).toBe(text)
  })

  it('keeps an unclosed `/*`', () => {
    const text = "const re = /^\\/*/\nel.classList.add('grid')"
    expect(maskComments(text, 'script')).toBe(text)
  })

  it('keeps a `/*` and a `//` inside a regex literal', () => {
    const text = "u.replace(/\\/*$/, '')\nconst re = /https?:\\/\\//\n/** Doc. */"
    expect(maskComments(text, 'script')).toBe(`u.replace(/\\/*$/, '')\nconst re = /https?:\\/\\//\n${' '.repeat(11)}`)
  })

  it('reads a `/` after an operand as division, not as a regex', () => {
    const text = 'const half = total / 2 // note'
    expect(maskComments(text, 'script')).toBe(`const half = total / 2 ${' '.repeat(7)}`)
  })

  it('reads `//` as a comment in SCSS but not in CSS or after a colon', () => {
    expect(maskComments('// .a\nb { c: url(http://x) }', 'scss')).toBe('     \nb { c: url(http://x) }')
    expect(maskComments('// .a', 'css')).toBe('// .a')
  })
})

describe('endOfString', () => {
  it('skips nested strings in a substitution only when asked', () => {
    const text = '`a ${"`"} b` rest'
    expect(endOfString(text, 0)).toBe(7)
    expect(endOfString(text, 0, true)).toBe(12)
  })
})

describe('scanSourceFiles masked text', () => {
  it('masks a Vue file as markup outside <script> and as script inside it', () => {
    const root = createScratchDir()
    const template = '<template>\n  <p>a // <bal-button>Go</bal-button></p>\n</template>\n'
    write(root, 'g.vue', `${template}<script setup>\n// <bal-button>\n/* <bal-tag> */\nconst a = 1\n</script>\n`)

    expect(maskedFiles(root)['g.vue']).toBe(
      `${template}<script setup>\n${' '.repeat(15)}\n${' '.repeat(15)}\nconst a = 1\n</script>\n`,
    )
  })

  it('masks a Vue template that follows a <script> block as markup', () => {
    const root = createScratchDir()
    const template = '<template>\n  <p>a // b</p><bal-button>Go</bal-button><!-- x -->\n</template>\n'
    write(root, 'g.vue', `<script setup>\n// x\n</script>\n${template}<script>\n// y\n</script>\n`)

    expect(maskedFiles(root)['g.vue']).toBe(
      `<script setup>\n    \n</script>\n${template.replace('<!-- x -->', ' '.repeat(10))}<script>\n    \n</script>\n`,
    )
  })

  it('keeps a Vue template tag after text such as image/*', () => {
    const root = createScratchDir()
    const text = '<template>\n  <p>Accepted: image/*</p>\n  <bal-button>x</bal-button>\n</template>\n'
    write(root, 'g.vue', text)

    expect(maskedFiles(root)['g.vue']).toBe(text)
  })

  it('masks // comments in a Vue <style lang="scss"> block and keeps the url', () => {
    const root = createScratchDir()
    write(root, 'g.vue', '<style lang="scss">\n// <bal-button>\na { b: url(//x) }\n</style>\n')

    expect(maskedFiles(root)['g.vue']).toBe(`<style lang="scss">\n${' '.repeat(15)}\na { b: url(//x) }\n</style>\n`)
  })

  it('does not treat a Vue element named script-loader as a script block', () => {
    const root = createScratchDir()
    const text = '<template><script-loader>a // b</script-loader></template>\n'
    write(root, 'g.vue', text)

    expect(maskedFiles(root)['g.vue']).toBe(text)
  })

  it('masks a .htm file like a .html file', () => {
    const root = createScratchDir()
    const text = '<p>a // <bal-button>b</bal-button></p><!-- <bal-tag> -->\n'
    write(root, 'a.html', text)
    write(root, 'a.htm', text)

    const masked = maskedFiles(root)
    expect(masked['a.htm']).toBe(`<p>a // <bal-button>b</bal-button></p>${' '.repeat(18)}\n`)
    expect(masked['a.htm']).toBe(masked['a.html'])
  })

  it('masks a line comment in a .mjs file', () => {
    const root = createScratchDir()
    write(root, 'a.mjs', '// <bal-button>\nexport const a = 1\n')

    expect(maskedFiles(root)['a.mjs']).toBe(`${' '.repeat(15)}\nexport const a = 1\n`)
  })
})
