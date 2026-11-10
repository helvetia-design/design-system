# poc-website

A server-rendered demo page for the website team: a normal-looking page where **only three
things are real components** — `<ds-button>`, `<ds-carousel>` and `<ds-accordion>`. Everything
else (header, hero, richtext, image row, footer) is plain HTML styled by
`@helvetia-design/styles`. That mix is the message: most of a page needs no JavaScript from
the design system at all.

This is a demo, not documentation and not an AEM integration — a small Express server stands
in for AEM. `apps/integration-ssr` is the CI harness for SSR and is left untouched.

## Run it

From a clean checkout, one command:

```bash
pnpm app:poc
```

That builds `@helvetia-design/core` and `@helvetia-design/styles`, stages the client assets
into `public/`, and serves the page on <http://localhost:3200>.

Already built? `pnpm --filter poc-website start` is enough.

## What to look at

1. **`view-source:http://localhost:3200/`** — the response is a finished document. Every
   `ds-*` element already carries its shadow root as `<template shadowrootmode="open">`, and
   every headline and paragraph is present as text. Nothing is filled in by the browser.
2. **Loading** — nothing flickers or jumps. Images reserve their aspect ratio before they
   arrive, and components are visible from the first paint (ADR-0033's `:not(:defined)` gate).
3. **JavaScript off** (DevTools → Settings → Debugger → Disable JavaScript, then hard reload) —
   the page still renders and reads correctly. The carousel sits on its first slide and the
   accordion stops toggling; that is expected. `<ds-accordion>` renders a
   `<button aria-expanded>` and needs JavaScript to toggle — the `<details>`-based
   `.ds-accordion` class is the CSS-only alternative, not used here. The first FAQ entry is
   server-rendered `open` so an answer is readable without JavaScript too.
4. **Console** — no errors, and no `c-id` attributes left in the DOM after load. A leftover
   `c-id` would mean the client re-rendered instead of adopting the server-rendered shadow roots.
5. **320px** — responsive down to the narrowest supported width.

## How it is put together

| Section        | Built from                                                                    | Tier      |
| -------------- | ----------------------------------------------------------------------------- | --------- |
| Header, footer | native elements, `.ds-container`, `.ds-grid`/`.ds-col`                        | Style     |
| Hero           | `<section>`, `<h1 class="ds-heading">`, `<picture>`, `.ds-button` on an `<a>` | Style     |
| Richtext       | `.ds-content` wrapper, `.ds-text`, `.ds-link`                                 | Style     |
| Image row      | native `<picture>` (CSS-only component)                                       | Style     |
| Gallery        | `<ds-carousel>` / `<ds-carousel-item>`                                        | Component |
| FAQ            | `<ds-accordion>` with `slot="summary"` / `slot="content"`                     | Component |
| CTA            | `<ds-button>` next to a CSS-only `<button class="ds-button">`                 | Component |

The tiers match the four-tier model in [docs/AEM-with-DS.md](../../docs/AEM-with-DS.md).
There is no hero, richtext or website header/footer component in the library, and this demo
does not add one: `AEM-with-DS.md` classifies a hero as a **Block**, authored on the AEM side.
Building those from page-level markup is the point, not a workaround.

- `page.ts` — the page as one HTML fragment.
- `server.ts` — `renderToString()` plus the document shell, the part AEM would own.
- `static/page.css` — page-level styling, the part a website team writes itself. Every value
  comes from a `--ds-*` token.

## Known rough edges

- **Duplicated stylesheets in view-source.** Stencil cannot share a stylesheet across
  declarative shadow roots in static HTML, so every component instance carries its own full
  `<style>` copy — the four accordions alone repeat the ~48 KB button stylesheet four times.
  The page is ~380 KB raw, ~45 KB gzipped on the wire. The fix was reverted in `b19ede325`
  (ADR-0034); component instance counts are kept low here instead.
- **Fonts are still Baloise.** `packages/assets` ships `BaloiseCreateHeadline` /
  `BaloiseCreateText`; no Helvetia typeface exists in the repo yet. The `.woff2` files are
  self-hosted from `/assets/fonts` via the `design-system.local.min.css` bundle — loading them
  from `www.baloise.ch` or jsDelivr would disclose visitor IPs to a third party (nDSG).
  Swap `design-system.local.min.css` for `design-system.min.css` in `server.ts` to drop
  webfonts entirely and fall back to system fonts.
- **Images come from `picsum.photos`.** Convenient for a demo, but a third-party request from
  every visitor's browser. Anything beyond a demo should serve its images from its own origin.

## Tests

```bash
pnpm --filter poc-website play:run
```

Mirrors `apps/integration-ssr/e2e/ssr.spec.ts` and covers the acceptance criteria: finished
HTML before any JS, hydration without console errors or leftover `c-id`, the accordion
toggling once JS has run, readability with JavaScript disabled, and no horizontal overflow
at 320px. Deliberately not wired into CI: this is a demo, and the page pulls its images from
`picsum.photos`, which would make a CI job depend on a third-party host.
