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
 *   1. AEM component — these functions. The website team owns this layer.
 *   2. DS wrapper    — a `ds-*` custom element, one per thing that genuinely needs
 *                      behaviour. Never stacked inside another one.
 *   3. Native HTML   — everything inside the slots, styled by the global DS
 *                      stylesheet. No custom element per list item, per card part
 *                      or per row.
 *
 * Layer 3 is the point. Native markup is in AEM's output for free; anything a
 * component generates inside its own shadow root is not. The more of the page that
 * is native, the more of it exists before any JavaScript runs.
 */

const IMAGE_HOST = 'https://picsum.photos'

/* ============================================================================
 * AEM component: Seiten-Header
 * ========================================================================== */

type PageHeader = {
  brand: string
  links: { label: string; href: string; current?: boolean }[]
}

const pageHeader = ({ brand, links }: PageHeader): string => `
  <header class="demo-header">
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
    <section class="demo-hero">
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
    <section class="demo-section">
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
    <section class="demo-section demo-section--muted">
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
    <section class="demo-section">
      <div class="ds-container">
        <h2 class="ds-heading demo-section__heading">${heading}</h2>
        <ds-carousel label="${label}" controls="dots" value="${slides[0].name}">
${slides.map(s => `          <ds-carousel-item name="${s.name}" src="${s.src}"></ds-carousel-item>`).join('\n')}
        </ds-carousel>
      </div>
    </section>`

/* ============================================================================
 * AEM component: FAQ-Sektion
 * One ds-accordion per entry, grouped via the `group` attribute. There is
 * deliberately no <ds-accordion-group> element — grouping is a property, not a
 * layer. Everything inside the slots is native markup.
 * ========================================================================== */

type FaqSection = {
  heading: string
  group: string
  entries: { question: string; answer: string; open?: boolean }[]
}

const faqSection = ({ heading, group, entries }: FaqSection): string => `
    <section class="demo-section demo-section--muted">
      <div class="ds-container">
        <div class="demo-prose">
          <h2 class="ds-heading demo-section__heading">${heading}</h2>
${entries
  .map(
    entry => `          <ds-accordion group="${group}" summary-title marker="plus-minus"${entry.open ? ' open' : ''}>
            <span slot="summary">${entry.question}</span>
            <div slot="content" class="py-base">
              <p class="ds-text mb-none">${entry.answer.replace(/\s+/g, ' ').trim()}</p>
            </div>
          </ds-accordion>`,
  )
  .join('\n          <hr class="ds-divider" />\n')}
        </div>
      </div>
    </section>`

/* ============================================================================
 * AEM component: Stresstest  (diagnostic section, not a page pattern)
 *
 * The question the CMS team actually asked: if AEM renders a large, deep tree of
 * native HTML *inside* a web component, does anything resolve the styles away or
 * pull the markup into the shadow DOM?
 *
 * This is the Baloise link-accordion rebuilt the way we would build it: one
 * ds-accordion wrapper, and inside it plain <ul>/<li>/<a> — not a custom element
 * per row. Compare with
 * https://www.baloise.be/nl/contact-service/schadegevallen-NEW.html, where every
 * item is a bal-list-item with its own shadow root.
 * ========================================================================== */

type StressTest = {
  heading: string
  note: string
  question: string
  rows: number
}

const stressTest = ({ heading, note, question, rows }: StressTest): string => {
  // ds-list / ds-item work here because the <ul> itself carries .ds-list — the
  // compiled selector is `ul.ds-list li.ds-item`. Mixing a custom-element parent
  // with CSS-class children (e.g. <ds-card> + .ds-card-header) is what does NOT
  // work, because <ds-card> carries no .ds-card class for the descendant
  // selector to match.
  const items = Array.from(
    { length: rows },
    (_, i) => `              <li class="ds-item">
                <div class="ds-item-content">
                  <h5 class="ds-item-title"><a class="ds-link" href="/schaden/${i}">Schadenfall ${i + 1} melden</a></h5>
                  <span class="ds-item-text">Formular, Checkliste und Kontakt für diesen Fall.</span>
                </div>
              </li>`,
  ).join('\n')

  // 5 native elements per row (li, div, h5, a, span) plus the <ul>, the <p> and
  // the slot wrapper — printed on the page so the number is verifiable.
  const elementCount = rows * 5 + 3

  return `
    <section class="demo-section">
      <div class="ds-container">
        <div class="demo-prose">
          <h2 class="ds-heading demo-section__heading">${heading}</h2>
          <p class="ds-text is-sm">${note}</p>
          <ds-accordion group="stress" summary-title marker="plus-minus" open data-native-elements="${elementCount}">
            <span slot="summary">${question}</span>
            <div slot="content" class="py-base">
              <p class="ds-text">${elementCount} native Elemente, von AEM geliefert, in einem einzigen Web Component.</p>
              <ul class="ds-list">
${items}
              </ul>
            </div>
          </ds-accordion>
        </div>
      </div>
    </section>`
}

/* ============================================================================
 * AEM component: Kontakt-Aufruf
 * ds-button next to the CSS-only <button class="ds-button">. Same source SCSS
 * compiled twice (hybrid component model), so they are visibly identical — one
 * costs a JS chunk and a shadow root, the other costs nothing.
 * ========================================================================== */

type Cta = { title: string; lead: string; label: string }

const cta = ({ title, lead, label }: Cta): string => `
    <section class="demo-section demo-cta">
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
  <footer class="demo-footer">
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
 * The authored page — what a content author typed into the dialogs above.
 * ========================================================================== */

export const fragment = `
<ds-root>
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
  group: 'faq',
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
${stressTest({
  heading: 'Stresstest: natives Markup in einer Web Component',
  note: 'Diese Sektion ist kein Seitenmuster, sondern ein Nachweis. Sie beantwortet die Frage des CMS-Teams: Was passiert mit von AEM geliefertem Markup, wenn es tief in einer Web Component liegt?',
  question: 'Schadenfälle — welche Formulare brauche ich?',
  rows: 12,
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
})}
</ds-root>
`
