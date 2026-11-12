import compression from 'compression'
import express from 'express'
import { renderToString } from '@helvetia-design/core/hydrate'
import { fragment, stressTestScript } from './page.js'

/**
 * Stands in for AEM: one route, one page, rendered on the server. The browser receives a
 * finished document — every `ds-*` element already carries its shadow root as a
 * `<template shadowrootmode>` in the response body, before any JavaScript runs.
 */
async function renderPage(): Promise<string> {
  const { html } = await renderToString(fragment, {
    // Render only the fragment — the document shell below is ours, as it would be AEM's.
    fullDocument: false,
    // Keep the response readable in `view-source:`, which is this demo's headline criterion.
    prettyHtml: true,
    // Real shadow DOM, serialized into the HTML response.
    serializeShadowRoot: 'declarative-shadow-dom',
  })

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Versichern, was Ihnen wichtig ist — Helvetia</title>
    <meta
      name="description"
      content="Demoseite des Helvetia Design System: server-gerendert, drei Komponenten, der Rest ist HTML und CSS."
    />

    <!-- Configure the design system before it boots (ADR-0002) -->
    <meta name="design-system-config" data-brand="helvetia" data-region="CH" data-language="de" />

    <!-- Design tokens: the --ds-* custom properties everything below resolves against -->
    <link rel="stylesheet" href="/assets/base.tokens.css" />
    <!-- Reset, structural styles and the CSS-only component classes (.ds-button, .ds-grid, …) -->
    <!-- The .local bundle is the one that ships @font-face rules pointing at /assets/fonts -->
    <link rel="stylesheet" href="/assets/design-system.local.min.css" />
    <!-- Utility classes (mt-base, gap-lg, …) -->
    <link rel="stylesheet" href="/assets/utilities.min.css" />
    <!-- Page-level styling — the part a website team writes themselves -->
    <link rel="stylesheet" href="/static/page.css" />
  </head>
  <body>
${html}
    <script type="module" src="/assets/design-system/design-system.esm.js"></script>
    <!-- Demo instrumentation for the Stresstest section's live proof panel — not part of
         the design system, and not something AEM would actually ship. -->
    <script>${stressTestScript}</script>
  </body>
</html>
`
}

const app = express()

app.use(compression())

app.get('/', async (_req, res) => {
  res.type('html').send(await renderPage())
})

// `pnpm copy-assets` stages everything the client needs — the design-system JS chunks, the
// tokens/styles CSS and the self-hosted font files — into public, served as-is below. These
// filenames aren't content-hashed, so a year-long immutable cache would outlive a
// design-system upgrade; this is a demo, so the assets are served without a far-future cache.
app.use('/assets', express.static('public'))

// Version-controlled page assets that need no staging step.
app.use('/static', express.static('static'))

const port = Number(process.env.PORT ?? 3200)
app.listen(port, () => {
  console.log(`poc-website listening on http://localhost:${port}`)
})
