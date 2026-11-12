/**
 * The demo page, assembled the way an AEM page is assembled.
 *
 * Every function below stands in for one **AEM component**:
 *
 *   - its props type is the **author dialog** — the form a content author fills in
 *   - its body is the **HTL template** — a server-side string renderer
 *   - what it returns is exactly what AEM would put on the page
 *
 * None of these functions survive into the browser. AEM components are server-side
 * only; after rendering, all that is left is HTML. That is why none of them is a
 * custom element.
 *
 * Three layers, deliberately kept apart:
 *
 *   1. AEM component — these functions. The website team owns this layer. Each one
 *                      carries `data-cmp-is`/`data-cmp-data-layer` on its outermost
 *                      element (see `aemComponent()` below) — that is the actual
 *                      "wrapper" a CMS needs to manage an instance of this block:
 *                      move it, duplicate it across pages, read it from analytics.
 *                      It is plain markup, never a custom element.
 *   2. DS wrapper    — a `ds-*` custom element, one per thing that genuinely needs
 *                      behaviour. Never stacked inside another one.
 *   3. Native HTML   — everything inside the slots, styled by the global DS
 *                      stylesheet. No custom element per list item, per card part
 *                      or per row.
 *
 * Layer 3 is the point. Native markup is in AEM's output for free; anything a
 * component generates inside its own shadow root is not. The more of the page that
 * is native, the more of it exists before any JavaScript runs. The stats strip at
 * the foot of the page counts this for real, from the markup below — not a quote
 * someone has to remember to update.
 *
 * Deliberately tiered after the four-tier model in `docs/AEM-with-DS.md`: header,
 * hero, richtext, teaser grid and footer are plain markup styled by
 * `@helvetia-design/styles` (Style tier, zero JavaScript from the design system).
 * Only two things on this page are real components — `<ds-button>` and
 * `<ds-carousel>` (with the `<ds-carousel-item>` children its own API requires).
 * The FAQ accordion is deliberately NOT `<ds-accordion>`: it needs nothing `details`
 * does not already do natively — exclusive open-one-close-others grouping is the
 * native `name` attribute on `<details>` (baseline-supported since 2023), and
 * `accordion.style.scss` already ships the matching `.ds-accordion` CSS-only look,
 * including the animated open/close, for exactly this case. Reach for the
 * component only once real behaviour is needed that `details` cannot provide.
 *
 * Keep the number of `ds-*` instances low on purpose: Stencil cannot share a
 * stylesheet across declarative shadow roots, so every instance carries its own
 * full `<style>` copy into `view-source:` (see ADR-0034, reverted in b19ede325).
 */

const IMAGE_HOST = 'https://picsum.photos'

/**
 * The AEM Core Components instrumentation pair every real AEM component carries on
 * its outermost element: `data-cmp-is` names the resource type for the edit-mode
 * component grid and the JS component API, `data-cmp-data-layer` registers this
 * instance with the Adobe Client Data Layer under its own id. Neither is a `ds-*`
 * concern — this is pure AEM authoring plumbing, present on every section below
 * regardless of whether that section also happens to contain a `ds-*` component.
 */
function aemComponent(type: string): string {
  return `data-cmp-is="${type}" data-cmp-data-layer='{"${type}":{"@type":"helvetia/components/${type}"}}'`
}

/* ============================================================================
 * AEM component: Seiten-Header
 * ========================================================================== */

type PageHeader = {
  brand: string
  links: { label: string; href: string; current?: boolean }[]
}

const pageHeader = ({ brand, links }: PageHeader): string => `
  <header class="demo-header" ${aemComponent('header')}>
    <div class="ds-container demo-header__inner">
      <a class="demo-header__brand" href="/" aria-label="${brand} — zur Startseite">${brand}</a>
      <nav class="demo-header__nav" aria-label="Hauptnavigation">
        <ul>
${links
  .map(
    link => `          <li><a href="${link.href}"${link.current ? ' aria-current="page"' : ''}>${link.label}</a></li>`,
  )
  .join('\n')}
        </ul>
      </nav>
    </div>
  </header>`

/* ============================================================================
 * AEM component: Hero
 * No custom element at all — a headline, a paragraph, two links and an image.
 * Nothing here needs JavaScript, so nothing here is a component.
 * ========================================================================== */

type Hero = {
  eyebrow: string
  title: string
  lead: string
  actions: { label: string; href: string; secondary?: boolean }[]
  image: { src: string; alt: string }
}

const hero = ({ eyebrow, title, lead, actions, image }: Hero): string => `
    <section class="demo-hero" ${aemComponent('hero')}>
      <div class="ds-container">
        <div class="ds-grid is-multiline is-vcentered gap-xl">
          <div class="ds-col">
            <p class="demo-eyebrow">${eyebrow}</p>
            <h1 class="ds-heading">${title}</h1>
            <p class="ds-text is-lead mt-base">${lead}</p>
            <div class="demo-actions mt-xl">
${actions
  .map(a => `              <a class="ds-button${a.secondary ? ' is-secondary' : ''}" href="${a.href}">${a.label}</a>`)
  .join('\n')}
            </div>
          </div>
          <div class="ds-col">
            <picture class="demo-hero__image">
              <img
                src="${image.src}"
                alt="${image.alt}"
                width="1280"
                height="960"
                fetchpriority="high"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>`

/* ============================================================================
 * AEM component: Textabschnitt
 * `.ds-content` is the richtext wrapper: a bare <a> inside it picks up link
 * styling without the author adding a class (link.style.scss).
 * ========================================================================== */

type Richtext = {
  title: string
  paragraphs: string[]
  listTitle: string
  listItems: string[]
}

const richtext = ({ title, paragraphs, listTitle, listItems }: Richtext): string => `
    <section class="demo-section" ${aemComponent('text')}>
      <div class="ds-container">
        <div class="demo-prose ds-content">
          <h2 class="ds-heading">${title}</h2>
${paragraphs.map(p => `          <p class="ds-text">${p}</p>`).join('\n')}
          <h3 class="ds-title">${listTitle}</h3>
          <ul class="ds-text">
${listItems.map(li => `            <li>${li}</li>`).join('\n')}
          </ul>
        </div>
      </div>
    </section>`

/* ============================================================================
 * AEM component: Bereichs-Teaser
 * A multifield in the dialog; the HTL loops it. Three native <figure> elements,
 * not three custom elements.
 * ========================================================================== */

type TeaserGrid = {
  heading: string
  teasers: { src: string; alt: string; caption: string; text: string }[]
}

const teaserGrid = ({ heading, teasers }: TeaserGrid): string => `
    <section class="demo-section demo-section--muted" ${aemComponent('teasergrid')}>
      <div class="ds-container">
        <h2 class="ds-heading demo-section__heading">${heading}</h2>
        <div class="ds-grid is-multiline gap-lg">
${teasers
  .map(
    t => `          <div class="ds-col">
            <figure class="demo-figure">
              <picture>
                <img src="${t.src}" alt="${t.alt}" width="800" height="600" loading="lazy" decoding="async" />
              </picture>
              <figcaption>
                <h3 class="ds-title">${t.caption}</h3>
                <p class="ds-text is-sm">${t.text}</p>
              </figcaption>
            </figure>
          </div>`,
  )
  .join('\n')}
        </div>
      </div>
    </section>`

/* ============================================================================
 * AEM component: Bildergalerie
 * The one place a nested custom element is unavoidable: ds-carousel resolves its
 * slides by tag name at runtime (carousel.tsx), so ds-carousel-item is required.
 * Shown honestly rather than hidden — it is the exception that proves the rule,
 * and a candidate for "should this accept native children instead?".
 * ========================================================================== */

type Gallery = {
  heading: string
  label: string
  slides: { name: string; src: string }[]
}

const gallery = ({ heading, label, slides }: Gallery): string => `
    <section class="demo-section" ${aemComponent('carousel')}>
      <div class="ds-container">
        <h2 class="ds-heading demo-section__heading">${heading}</h2>
        <ds-carousel label="${label}" controls="dots" value="${slides[0].name}">
${slides.map(s => `          <ds-carousel-item name="${s.name}" src="${s.src}"></ds-carousel-item>`).join('\n')}
        </ds-carousel>
      </div>
    </section>`

/* ============================================================================
 * AEM component: FAQ-Sektion
 * One <details class="ds-accordion"> per entry, grouped via the native `name`
 * attribute — the browser itself closes the others when one opens, no JavaScript
 * involved. `accordion.style.scss` ships the matching CSS-only look (marker,
 * animated open/close) for this exact element shape. Not `<ds-accordion>`: that
 * component earns its JS cost on open()/close() control or events neither this
 * page nor the brief needs here. Everything inside is native markup either way.
 * ========================================================================== */

type FaqSection = {
  heading: string
  name: string
  entries: { question: string; answer: string; open?: boolean }[]
}

const faqSection = ({ heading, name, entries }: FaqSection): string => `
    <section class="demo-section demo-section--muted" ${aemComponent('faq')}>
      <div class="ds-container">
        <div class="demo-prose">
          <h2 class="ds-heading demo-section__heading">${heading}</h2>
${entries
  .map(
    entry => `          <details class="ds-accordion has-marker-plus-minus" name="${name}"${entry.open ? ' open' : ''}>
            <summary><h3 class="ds-title">${entry.question}</h3></summary>
            <div class="ds-content py-base">
              <p class="ds-text mb-none">${entry.answer.replace(/\s+/g, ' ').trim()}</p>
            </div>
          </details>`,
  )
  .join('\n          <hr class="ds-divider" />\n')}
        </div>
      </div>
    </section>`

/* ============================================================================
 * AEM component: Kontakt-Aufruf
 * ds-button next to the CSS-only <button class="ds-button">. Same source SCSS
 * compiled twice (hybrid component model), so they are visibly identical — one
 * costs a JS chunk and a shadow root, the other costs nothing.
 * ========================================================================== */

type Cta = { title: string; lead: string; label: string }

const cta = ({ title, lead, label }: Cta): string => `
    <section class="demo-section demo-cta" ${aemComponent('cta')}>
      <div class="ds-container">
        <h2 class="ds-heading">${title}</h2>
        <p class="ds-text is-lead mt-base mb-xl">${lead}</p>
        <div class="demo-actions">
          <ds-button>${label}</ds-button>
          <button type="button" class="ds-button">${label}</button>
        </div>
      </div>
    </section>`

/* ============================================================================
 * AEM component: Seiten-Footer
 * ========================================================================== */

type PageFooter = {
  columns: { title: string; links: { label: string; href: string }[] }[]
  legal: string
}

const pageFooter = ({ columns, legal }: PageFooter): string => `
  <footer class="demo-footer" ${aemComponent('footer')}>
    <div class="ds-container">
      <div class="ds-grid is-multiline gap-lg">
${columns
  .map(
    col => `        <div class="ds-col">
          <h2 class="demo-footer__title">${col.title}</h2>
          <ul>
${col.links.map(l => `            <li><a href="${l.href}">${l.label}</a></li>`).join('\n')}
          </ul>
        </div>`,
  )
  .join('\n')}
      </div>
      <p class="demo-footer__legal">${legal}</p>
    </div>
  </footer>`

/* ============================================================================
 * Stats strip — not an AEM component, a fact check.
 *
 * Counted from the actual page markup above, not typed by hand: a hand-typed
 * number goes stale the moment someone edits a section and forgets the footnote.
 * Counting tags is enough here — this is demo markup assembled by the functions
 * above, not arbitrary HTML, so a plain regex over the authored fragment (before
 * `renderToString` expands any shadow root) reliably tells component tags from
 * native ones.
 * ========================================================================== */

const REAL_COMPONENTS = ['ds-button', 'ds-carousel'] as const

function countTag(html: string, tag: string): number {
  return (html.match(new RegExp(`<${tag}(?=[\\s/>])`, 'g')) ?? []).length
}

function pageStats(authoredHtml: string): string {
  const instancesByComponent = REAL_COMPONENTS.map(tag => ({ tag, count: countTag(authoredHtml, tag) }))
  const componentInstances = instancesByComponent.reduce((sum, c) => sum + c.count, 0)
  const allTags = (authoredHtml.match(/<[a-z][a-z0-9-]*(?=[\s/>])/g) ?? []).length
  // ds-carousel-item is a real custom element too (the slide child of ds-carousel), not a
  // "native" one — excluded from the native count the same way ds-button/ds-carousel are.
  const componentTags = (authoredHtml.match(/<ds-[a-z0-9-]*(?=[\s/>])/g) ?? []).length
  const nativeTags = allTags - componentTags
  const nativeShare = Math.round((nativeTags / allTags) * 100)

  return `
  <section class="demo-stats" aria-label="Seitenstatistik">
    <div class="ds-container">
      <div class="ds-grid is-multiline gap-lg demo-stats__grid">
        <div class="ds-col demo-stats__item">
          <span class="demo-stats__number">${REAL_COMPONENTS.length}</span>
          <span class="demo-stats__label">echte Web Components<br />(${REAL_COMPONENTS.join(', ')})</span>
        </div>
        <div class="ds-col demo-stats__item">
          <span class="demo-stats__number">${componentInstances}</span>
          <span class="demo-stats__label">Komponenten-Instanzen auf dieser Seite</span>
        </div>
        <div class="ds-col demo-stats__item">
          <span class="demo-stats__number">${nativeTags}</span>
          <span class="demo-stats__label">native HTML-Elemente ohne eigenes Shadow&nbsp;DOM</span>
        </div>
        <div class="ds-col demo-stats__item">
          <span class="demo-stats__number">${nativeShare}&nbsp;%</span>
          <span class="demo-stats__label">der Seite kommt ohne Web-Component-JavaScript aus</span>
        </div>
      </div>
    </div>
  </section>`
}

/* ============================================================================
 * The authored page — what a content author typed into the dialogs above.
 * ========================================================================== */

const content = `
  <a class="demo-skip-link" href="#inhalt">Direkt zum Inhalt</a>
${pageHeader({
  brand: 'helvetia',
  links: [
    { label: 'Privatkunden', href: '/privatkunden', current: true },
    { label: 'Unternehmen', href: '/unternehmen' },
    { label: 'Schaden melden', href: '/schaden' },
    { label: 'Kontakt', href: '/kontakt' },
  ],
})}

  <main id="inhalt">
${hero({
  eyebrow: 'Privatkunden',
  title: 'Versichern, was Ihnen wichtig ist',
  lead: 'Von der Hausratversicherung bis zur Vorsorge begleitet Sie die Helvetia durch jede Lebenslage — persönlich beraten, digital erledigt.',
  actions: [
    { label: 'Beratung vereinbaren', href: '/beratung' },
    { label: 'Prämie berechnen', href: '/praemienrechner', secondary: true },
  ],
  image: { src: `${IMAGE_HOST}/id/1015/1280/960`, alt: 'Flusslandschaft zwischen bewaldeten Hängen' },
})}
${richtext({
  title: 'Sicherheit, die mitwächst',
  paragraphs: [
    'Eine Versicherung ist kein Produkt, das man einmal kauft und dann vergisst. Sie wächst mit: mit der ersten eigenen Wohnung, dem ersten Auto, der Familie, dem Eigenheim. Deshalb prüfen wir Ihre Deckung regelmässig mit Ihnen gemeinsam — und passen an, was nicht mehr passt.',
    'Unsere Beraterinnen und Berater sind an über 100 Standorten in der ganzen Schweiz für Sie da. Wer lieber selbst nachschaut, findet im <a class="ds-link" href="/kundenportal">Kundenportal</a> jederzeit alle Policen, Rechnungen und offenen Schadenfälle. Und falls doch einmal etwas passiert, erreichen Sie uns über die <a class="ds-link" href="/schaden">Schadenhotline</a> rund um die Uhr.',
  ],
  listTitle: 'Was zu einer guten Deckung gehört',
  listItems: [
    'Eine Versicherungssumme, die zum heutigen Hausrat passt — nicht zu dem von vor zehn Jahren.',
    'Eine Privathaftpflicht, die auch grobfahrlässige Fehler einschliesst.',
    'Ein Selbstbehalt, den Sie im Ernstfall tatsächlich tragen können.',
    'Klar geregelte Deckung für Velo, Laptop und Sportausrüstung ausserhalb der Wohnung.',
  ],
})}
${teaserGrid({
  heading: 'Unsere Bereiche',
  teasers: [
    {
      src: `${IMAGE_HOST}/id/1040/800/600`,
      alt: 'Ein Wohnhaus an einem Hang',
      caption: 'Wohnen',
      text: 'Hausrat und Gebäude, vom Wasserschaden bis zum Einbruch.',
    },
    {
      src: `${IMAGE_HOST}/id/1072/800/600`,
      alt: 'Eine Strasse durch eine bewaldete Landschaft',
      caption: 'Mobilität',
      text: 'Auto, Motorrad und E-Bike — mit Pannenhilfe in ganz Europa.',
    },
    {
      src: `${IMAGE_HOST}/id/1011/800/600`,
      alt: 'Zwei Personen auf einer Wanderung',
      caption: 'Vorsorge',
      text: 'Säule 3a, Lebensversicherung und Pensionsplanung.',
    },
  ],
})}
${gallery({
  heading: 'Unterwegs in der Schweiz',
  label: 'Bildergalerie',
  slides: [
    { name: 'alpen', src: `${IMAGE_HOST}/id/1018/1280/720` },
    { name: 'see', src: `${IMAGE_HOST}/id/1016/1280/720` },
    { name: 'kueste', src: `${IMAGE_HOST}/id/1019/1280/720` },
    { name: 'stadt', src: `${IMAGE_HOST}/id/1024/1280/720` },
  ],
})}
${faqSection({
  heading: 'Häufige Fragen',
  name: 'faq',
  entries: [
    {
      question: 'Wie melde ich einen Schaden?',
      answer: `Am schnellsten geht es über das Kundenportal: Schaden erfassen, Fotos hochladen, fertig.
        Rund um die Uhr erreichbar ist auch die Schadenhotline. Halten Sie Ihre Policennummer bereit —
        damit ist Ihr Fall in der Regel innert zwei Arbeitstagen beurteilt.`,
      open: true,
    },
    {
      question: 'Kann ich meine Police online anpassen?',
      answer: `Ja. Adresse, Zahlungsrhythmus und Zahlungsmittel ändern Sie direkt im Kundenportal.
        Für Anpassungen an der Deckung — etwa eine höhere Versicherungssumme — meldet sich Ihre
        Beraterin oder Ihr Berater nach der Eingabe bei Ihnen.`,
    },
    {
      question: 'Was muss ich bei einem Umzug beachten?',
      answer: `Melden Sie uns die neue Adresse vor dem Umzugstermin. Die Hausratversicherung deckt
        beide Wohnungen während 30 Tagen parallel. Ändert sich die Wohnfläche, passen wir die
        Versicherungssumme an — die Prämie wird pro rata verrechnet.`,
    },
    {
      question: 'Wie kündige ich meine Versicherung?',
      answer: `Schriftlich, spätestens drei Monate vor Ablauf der Vertragsdauer. Nach einem Schadenfall
        besteht ein ausserordentliches Kündigungsrecht. Eine Kündigung per E-Mail genügt, solange sie
        aus Ihrem im Kundenportal hinterlegten Konto stammt.`,
    },
  ],
})}
${cta({
  title: 'Bereit für den nächsten Schritt?',
  lead: 'Vereinbaren Sie ein unverbindliches Gespräch — online oder in der Geschäftsstelle in Ihrer Nähe.',
  label: 'Termin vereinbaren',
})}
  </main>
${pageFooter({
  columns: [
    {
      title: 'Versicherungen',
      links: [
        { label: 'Hausrat', href: '/hausrat' },
        { label: 'Privathaftpflicht', href: '/haftpflicht' },
        { label: 'Motorfahrzeug', href: '/motorfahrzeug' },
        { label: 'Reise', href: '/reise' },
      ],
    },
    {
      title: 'Vorsorge',
      links: [
        { label: 'Säule 3a', href: '/saeule-3a' },
        { label: 'Lebensversicherung', href: '/leben' },
        { label: 'Pensionsplanung', href: '/pensionsplanung' },
      ],
    },
    {
      title: 'Service',
      links: [
        { label: 'Schaden melden', href: '/schaden' },
        { label: 'Kundenportal', href: '/kundenportal' },
        { label: 'Kontakt', href: '/kontakt' },
      ],
    },
  ],
  legal: 'Demoseite des Helvetia Design System — keine echten Produkte, keine echten Preise.',
})}`

export const fragment = `
<ds-root>${content}
${pageStats(content)}
</ds-root>
`
