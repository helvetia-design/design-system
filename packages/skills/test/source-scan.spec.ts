import { describe, expect, it } from 'vitest'
import { endOfString, maskComments } from '../skills/ds-migrate-from-baloise/scripts/source-scan.mjs'

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
