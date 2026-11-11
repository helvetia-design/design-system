import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { run, scanAssets } from '../skills/ds-migrate-from-baloise/scripts/scan-assets.mjs'

const scratches: string[] = []

afterEach(() => {
  for (const dir of scratches) rmSync(dir, { recursive: true, force: true })
  scratches.length = 0
})

function createScratchDir() {
  const dir = mkdtempSync(join(tmpdir(), 'ds-migrate-assets-'))
  scratches.push(dir)
  return dir
}

function write(root: string, rel: string, contents: string) {
  const file = join(root, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

describe('scanAssets', () => {
  it('lists the legacy and new style imports of a React app after Init, including commented lines', () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { 'react': '19.0.0', '@baloise/ds-react': '19.0.0' } }))
    mkdirSync(join(root, 'public'))
    write(
      root,
      'src/main.tsx',
      [
        "// import '@baloise/ds-styles/css/normalize.css'",
        "import '@helvetia-design/tokens/css/base'",
        "import '@helvetia-design/styles/css/design-system'",
        '/* TODO: remove these legacy Baloise imports once the Helvetia migration is verified */',
        "import '@baloise/ds-styles/css/font.css'",
        "import '@baloise/ds-styles/css/structure.css'",
        "import '@baloise/ds-styles/css/core.css'",
        "import '@helvetia-design/styles/css/utilities'",
        '',
      ].join('\n'),
    )
    write(
      root,
      'src/legacy.ts',
      [
        "// import '@baloise/ds-styles/css/all.css'",
        "import '@baloise/ds-styles/css/basic.min.css'",
        "import '@baloise/ds-styles/dist/css/baloise-design-system.css'",
        "import '@helvetia-design/styles/css/design-system.min'",
        "import '@helvetia-design/styles/css/design-system.local'",
        '',
      ].join('\n'),
    )

    expect(scanAssets(root)).toEqual({
      total: 7,
      project: { framework: 'react', publicDir: 'public', angularAssets: null },
      files: [
        {
          file: 'src/legacy.ts',
          findings: [
            { line: 1, snippet: "// import '@baloise/ds-styles/css/all.css'" },
            { line: 2, snippet: "import '@baloise/ds-styles/css/basic.min.css'" },
            { line: 3, snippet: "import '@baloise/ds-styles/dist/css/baloise-design-system.css'" },
            { line: 4, snippet: "import '@helvetia-design/styles/css/design-system.min'" },
            { line: 5, snippet: "import '@helvetia-design/styles/css/design-system.local'" },
          ],
        },
        {
          file: 'src/main.tsx',
          findings: [
            { line: 3, snippet: "import '@helvetia-design/styles/css/design-system'" },
            { line: 5, snippet: "import '@baloise/ds-styles/css/font.css'" },
          ],
        },
      ],
    })
  })

  it('lists angular.json styles and assets and the src/assets entries per target', () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@angular/core': '18.0.0' } }))
    write(
      root,
      'angular.json',
      JSON.stringify(
        {
          projects: {
            app: {
              architect: {
                build: {
                  options: {
                    styles: [
                      'node_modules/@baloise/ds-styles/dist/css/all.css',
                      'node_modules/@helvetia-design/styles/dist/css/design-system.css',
                      'node_modules/@baloise/ds-styles/dist/css/utilities/all.css',
                    ],
                    assets: [
                      'src/favicon.ico',
                      'src/assets',
                      { glob: '**/*', input: 'node_modules/@baloise/ds-fonts/assets', output: 'assets/fonts' },
                      {
                        glob: '**/*',
                        input: 'node_modules/@baloise/ds-favicons/assets/green',
                        output: 'assets/favicons',
                      },
                    ],
                  },
                },
                test: { options: { assets: ['src/favicon.ico'] } },
              },
            },
          },
        },
        null,
        2,
      ),
    )

    const result = scanAssets(root)

    expect(result.project).toEqual({
      framework: 'angular',
      publicDir: null,
      angularAssets: [{ project: 'app', target: 'build', entries: ['src/assets'] }],
    })
    expect(result.files).toEqual([
      {
        file: 'angular.json',
        findings: [
          { line: 8, snippet: '"node_modules/@baloise/ds-styles/dist/css/all.css",' },
          { line: 9, snippet: '"node_modules/@helvetia-design/styles/dist/css/design-system.css",' },
          { line: 17, snippet: '"input": "node_modules/@baloise/ds-fonts/assets",' },
          { line: 22, snippet: '"input": "node_modules/@baloise/ds-favicons/assets/green",' },
        ],
      },
    ])
  })

  it('lists the src/assets entries of an assets array under configurations as its own item', () => {
    const root = createScratchDir()
    write(
      root,
      'angular.json',
      JSON.stringify({
        projects: {
          app: {
            architect: {
              build: {
                options: { assets: ['src/assets'] },
                configurations: {
                  production: { assets: ['src/favicon.ico', 'src/assets'] },
                  development: { optimization: false },
                  staging: { assets: ['src/favicon.ico'] },
                },
              },
            },
          },
        },
      }),
    )

    expect(scanAssets(root).project.angularAssets).toEqual([
      { project: 'app', target: 'build', entries: ['src/assets'] },
      { project: 'app', target: 'build', configuration: 'production', entries: ['src/assets'] },
    ])
  })

  it('reports a public folder for an Angular app and reads angular.json with comments', () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@angular/core': '19.0.0' } }))
    mkdirSync(join(root, 'public'))
    write(
      root,
      'angular.json',
      [
        '{',
        '  // generated by the Angular CLI',
        '  "projects": { "app": { "architect": { "build": { "options": {',
        '    "assets": [{ "glob": "**/*", "input": "public" }],',
        '    "styles": ["src/styles.scss"]',
        '  } } } } }',
        '}',
        '',
      ].join('\n'),
    )
    write(root, 'src/styles.scss', "@use '@helvetia-design/styles/scss/design-system';\n")

    expect(scanAssets(root)).toEqual({
      total: 1,
      project: { framework: 'angular', publicDir: 'public', angularAssets: [] },
      files: [
        {
          file: 'src/styles.scss',
          findings: [{ line: 1, snippet: "@use '@helvetia-design/styles/scss/design-system';" }],
        },
      ],
    })
  })

  it('reports public for a Vite or Next project without a public folder', () => {
    for (const config of ['vite.config.ts', 'vite.config.mjs', 'next.config.js', 'next.config.ts']) {
      const root = createScratchDir()
      write(root, 'package.json', JSON.stringify({ dependencies: { react: '19.0.0' } }))
      write(root, config, 'export default {}\n')

      expect(scanAssets(root).project.publicDir).toBe('public')
    }
  })

  it('reports no public folder for a project without public/, Vite config or Next config', () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { react: '19.0.0' } }))
    write(root, 'webpack.config.js', 'module.exports = {}\n')

    expect(scanAssets(root).project.publicDir).toBeNull()
  })

  it('reads angular.json with trailing commas, block comments and // inside strings', () => {
    const root = createScratchDir()
    write(
      root,
      'angular.json',
      [
        '{',
        '  "$schema": "https://example.com/a.json",',
        '  /* block',
        '     comment */',
        '  "projects": { "app": { "architect": { "build": { "options": {',
        '    "assets": ["src/assets", "src/favicon.ico",],',
        '  }, }, }, }, },',
        '}',
        '',
      ].join('\n'),
    )

    expect(scanAssets(root).project.angularAssets).toEqual([
      { project: 'app', target: 'build', entries: ['src/assets'] },
    ])
  })

  it('throws when angular.json is not valid JSON', () => {
    const root = createScratchDir()
    write(root, 'angular.json', '{ bad')

    expect(() => scanAssets(root)).toThrow(/angular\.json is not valid JSON/)
  })

  it('reads targets as an alias of architect and keeps object entries that name src/assets', () => {
    const root = createScratchDir()
    const assetsEntry = { glob: '**/*', input: 'src/assets' }
    write(
      root,
      'angular.json',
      JSON.stringify({
        projects: { app: { targets: { build: { options: { assets: ['src/favicon.ico', assetsEntry] } } } } },
      }),
    )

    expect(scanAssets(root).project.angularAssets).toEqual([
      { project: 'app', target: 'build', entries: [assetsEntry] },
    ])
  })

  it('reports both the public folder and the src/assets entries of an Angular app that has both', () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@angular/core': '19.0.0' } }))
    mkdirSync(join(root, 'public'))
    write(
      root,
      'angular.json',
      JSON.stringify({ projects: { app: { architect: { build: { options: { assets: ['src/assets'] } } } } } }),
    )

    expect(scanAssets(root).project).toEqual({
      framework: 'angular',
      publicDir: 'public',
      angularAssets: [{ project: 'app', target: 'build', entries: ['src/assets'] }],
    })
  })

  it('scans .vue, .htm, .mts, .cts and Nx project.json files', () => {
    const root = createScratchDir()
    write(root, 'src/App.vue', "<style>@import '@baloise/ds-styles/css/font.css';</style>\n")
    write(root, 'public/index.htm', '<link rel="icon" href="/favicon.ico" />\n')
    write(root, 'src/styles.mts', "import '@helvetia-design/styles/css/design-system'\n")
    write(root, 'src/legacy.cts', "require('@baloise/ds-styles/css/font.css')\n")
    write(
      root,
      'apps/web/project.json',
      JSON.stringify(
        { targets: { build: { options: { assets: ['node_modules/@baloise/ds-fonts/assets'] } } } },
        null,
        2,
      ),
    )

    expect(scanAssets(root).files.map(({ file, findings }) => [file, findings.map(({ line }) => line)])).toEqual([
      ['apps/web/project.json', [6]],
      ['public/index.htm', [1]],
      ['src/App.vue', [1]],
      ['src/legacy.cts', [1]],
      ['src/styles.mts', [1]],
    ])
  })

  it.each([
    ['double quotes', '<link rel="icon" href="/favicon.ico" />'],
    ['single quotes', "<link rel='icon' href='/favicon.ico' />"],
    ['no quotes', '<link rel=icon href=/favicon.ico>'],
    ['rel after href', '<link href="/favicon.ico" rel="shortcut icon" />'],
  ])('finds a favicon tag with %s', (_, tag) => {
    const root = createScratchDir()
    write(root, 'index.html', `${tag}\n`)

    expect(scanAssets(root).files).toEqual([{ file: 'index.html', findings: [{ line: 1, snippet: tag }] }])
  })

  it.each([
    ['data-rel', '<link data-rel="icon" href="/favicon.ico" />'],
    ['mask-icon', '<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />'],
  ])('does not treat a %s link as a favicon tag', (_, tag) => {
    const root = createScratchDir()
    write(root, 'index.html', `${tag}\n`)

    expect(scanAssets(root).files).toEqual([])
  })

  it('reports a single-line favicon tag with a legacy path once', () => {
    const root = createScratchDir()
    const tag = '<link rel="icon" href="node_modules/@baloise/ds-favicons/assets/primary/favicon.ico">'
    write(root, 'index.html', `${tag}\n`)

    expect(scanAssets(root).files).toEqual([{ file: 'index.html', findings: [{ line: 1, snippet: tag }] }])
  })

  it('lists favicon tags, legacy link hrefs and package.json copy scripts of a plain HTML app, reporting a multi-line tag on its first line plus the legacy path line', () => {
    const root = createScratchDir()
    write(
      root,
      'package.json',
      JSON.stringify(
        {
          dependencies: { '@baloise/ds-core': '19.0.0', '@baloise/ds-favicons': '19.0.0' },
          scripts: { 'copy:favicons': 'cp -r node_modules/@baloise/ds-favicons/assets/primary public/favicons' },
        },
        null,
        2,
      ),
    )
    write(
      root,
      'index.html',
      [
        '<link rel="stylesheet" href="node_modules/@baloise/ds-styles/dist/css/font.min.css" />',
        '<link rel="stylesheet" href="node_modules/@baloise/ds-styles/dist/css/structure.css" />',
        '<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png" />',
        '<link',
        '  rel="icon"',
        '  href="node_modules/@baloise/ds-favicons/assets/primary/favicon-32x32.png"',
        '/>',
        '<link rel="shortcut icon" href="/assets/favicons/favicon.ico" />',
        '<link rel="manifest" href="/assets/favicons/site.webmanifest" />',
        '<meta name="msapplication-config" content="/assets/favicons/browserconfig.xml" />',
        '<meta name="theme-color" content="#ffffff" />',
        '<link rel="preload" href="/x.woff2" />',
        '',
      ].join('\n'),
    )

    expect(scanAssets(root)).toEqual({
      total: 9,
      project: { framework: 'html', publicDir: null, angularAssets: null },
      files: [
        {
          file: 'index.html',
          findings: [
            {
              line: 1,
              snippet: '<link rel="stylesheet" href="node_modules/@baloise/ds-styles/dist/css/font.min.css" />',
            },
            {
              line: 3,
              snippet: '<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png" />',
            },
            {
              line: 4,
              snippet: '<link rel="icon" href="node_modules/@baloise/ds-favicons/assets/primary/favicon-32x32.png" />',
            },
            { line: 6, snippet: 'href="node_modules/@baloise/ds-favicons/assets/primary/favicon-32x32.png"' },
            { line: 8, snippet: '<link rel="shortcut icon" href="/assets/favicons/favicon.ico" />' },
            { line: 9, snippet: '<link rel="manifest" href="/assets/favicons/site.webmanifest" />' },
            { line: 10, snippet: '<meta name="msapplication-config" content="/assets/favicons/browserconfig.xml" />' },
          ],
        },
        {
          file: 'package.json',
          findings: [
            { line: 4, snippet: '"@baloise/ds-favicons": "19.0.0"' },
            {
              line: 7,
              snippet: '"copy:favicons": "cp -r node_modules/@baloise/ds-favicons/assets/primary public/favicons"',
            },
          ],
        },
      ],
    })
  })

  it('lists SCSS font loading through @baloise/ds-fonts', () => {
    const root = createScratchDir()
    write(
      root,
      'src/styles.scss',
      [
        "@use '@baloise/ds-fonts/scss/fonts' with ($font-path: '/assets/fonts');",
        "@import '~@baloise/ds-styles/css/font';",
        "@import '@baloise/ds-styles/css/structure';",
        '',
      ].join('\n'),
    )
    write(root, 'src/theme.sass', "@use '@helvetia-design/styles/css/design-system'\n")

    expect(scanAssets(root).files).toEqual([
      {
        file: 'src/styles.scss',
        findings: [
          { line: 1, snippet: "@use '@baloise/ds-fonts/scss/fonts' with ($font-path: '/assets/fonts');" },
          { line: 2, snippet: "@import '~@baloise/ds-styles/css/font';" },
        ],
      },
      { file: 'src/theme.sass', findings: [{ line: 1, snippet: "@use '@helvetia-design/styles/css/design-system'" }] },
    ])
  })

  it('lists the font-bearing Sass entry points of @baloise/ds-styles', () => {
    const root = createScratchDir()
    const lines = [
      "@use '@baloise/ds-styles/sass/all';",
      "@import '@baloise/ds-styles/sass/font.sass';",
      "// @import '~@baloise/ds-styles/sass/basic.scss';",
      "@use '@baloise/ds-styles/sass/baloise-design-system'",
      "@use '@baloise/ds-styles/sass/mixins';",
      "@use '@baloise/ds-styles/sass/all-in-one';",
    ]
    write(root, 'src/styles.scss', `${lines.join('\n')}\n`)

    expect(scanAssets(root).files).toEqual([
      {
        file: 'src/styles.scss',
        findings: lines.slice(0, 4).map((snippet, index) => ({ line: index + 1, snippet })),
      },
    ])
  })

  it('lists a msapplication-config meta tag with an unquoted name', () => {
    const root = createScratchDir()
    const tag = '<meta name=msapplication-config content="/assets/favicons/browserconfig.xml">'
    write(root, 'index.html', `${tag}\n<meta name=msapplication-configX content="x">\n`)

    expect(scanAssets(root).files).toEqual([{ file: 'index.html', findings: [{ line: 1, snippet: tag }] }])
  })

  it('does not match utilities, structure, core, normalize, longer font names, or skipped folders', () => {
    const root = createScratchDir()
    write(
      root,
      'src/main.ts',
      [
        "import '@baloise/ds-styles/css/utilities/all.css'",
        "import '@baloise/ds-styles/css/structure'",
        "import '@baloise/ds-styles/css/core.min.css'",
        "import '@baloise/ds-styles/css/normalize'",
        "import '@baloise/ds-styles/css/fontsX.css'",
        "import '@baloise/ds-styles/css/all-in-one'",
        "import '@helvetia-design/styles/css/utilities'",
        "import '@helvetia-design/styles/css/design-system-extra'",
        '',
      ].join('\n'),
    )
    write(root, 'tsconfig.json', '{ "paths": { "@baloise/ds-fonts": ["x"] } }\n')
    write(root, 'node_modules/@baloise/ds-styles/index.ts', "import '@baloise/ds-styles/css/font'\n")
    write(root, 'dist/index.html', '<link rel="icon" href="/favicon.ico" />\n')
    write(root, 'storybook-static/index.html', '<link rel="icon" href="/favicon.ico" />\n')
    write(root, '.nx/cache/main.ts', "import '@baloise/ds-styles/css/font'\n")

    expect(scanAssets(root)).toEqual({
      total: 0,
      project: { framework: 'html', publicDir: null, angularAssets: null },
      files: [],
    })
  })

  it('does not modify any file', () => {
    const root = createScratchDir()
    const source = "import '@baloise/ds-styles/css/font.css'\nimport '@helvetia-design/styles/css/design-system'\n"
    write(root, 'src/main.ts', source)

    scanAssets(root)

    expect(readFileSync(join(root, 'src/main.ts'), 'utf8')).toBe(source)
  })

  it('throws when the root is not a directory', () => {
    const root = createScratchDir()
    write(root, 'file.ts', '')

    expect(() => scanAssets(join(root, 'file.ts'))).toThrow(/not a directory/)
  })

  it('prints the scan JSON and exits 0', () => {
    const root = createScratchDir()
    write(root, 'main.ts', "import '@baloise/ds-styles/css/font'\n")
    let text = ''

    const code = run(root, {
      write(chunk: string) {
        text += chunk
      },
    })

    expect(code).toBe(0)
    expect(Object.keys(JSON.parse(text))).toEqual(['total', 'project', 'files'])
    expect(JSON.parse(text)).toEqual({
      total: 1,
      project: { framework: 'html', publicDir: null, angularAssets: null },
      files: [{ file: 'main.ts', findings: [{ line: 1, snippet: "import '@baloise/ds-styles/css/font'" }] }],
    })
  })
})
