/**
 * The demo page, as one HTML fragment.
 *
 * Deliberately tiered after the four-tier model in `docs/AEM-with-DS.md`: header, hero,
 * richtext, image row and footer are plain markup styled by `@helvetia-design/styles`
 * (Style tier, zero JavaScript from the design system). Only three things on this page
 * are real components — `<ds-button>`, `<ds-carousel>` and `<ds-accordion>`.
 *
 * Keep the number of `ds-*` instances low on purpose: Stencil cannot share a stylesheet
 * across declarative shadow roots, so every instance carries its own full `<style>` copy
 * into `view-source:` (see ADR-0034, reverted in b19ede325).
 */

type Figure = { src: string; alt: string; caption: string; text: string }

const IMAGE_HOST = 'https://picsum.photos'

const FIGURES: Figure[] = [
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
]

const GALLERY = [
  { name: 'alpen', src: `${IMAGE_HOST}/id/1018/1280/720` },
  { name: 'see', src: `${IMAGE_HOST}/id/1016/1280/720` },
  { name: 'kueste', src: `${IMAGE_HOST}/id/1019/1280/720` },
  { name: 'stadt', src: `${IMAGE_HOST}/id/1024/1280/720` },
]

const FAQ = [
  {
    question: 'Wie melde ich einen Schaden?',
    answer: `Am schnellsten geht es über das Kundenportal: Schaden erfassen, Fotos hochladen, fertig.
      Rund um die Uhr erreichbar ist auch die Schadenhotline. Halten Sie Ihre Policennummer bereit —
      damit ist Ihr Fall in der Regel innert zwei Arbeitstagen beurteilt.`,
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
]

const figure = (item: Figure): string => `
            <figure class="demo-figure">
              <picture>
                <img
                  src="${item.src}"
                  alt="${item.alt}"
                  width="800"
                  height="600"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <figcaption>
                <h3 class="ds-title">${item.caption}</h3>
                <p class="ds-text is-sm">${item.text}</p>
              </figcaption>
            </figure>`

export const fragment = `
<ds-root>
  <a class="demo-skip-link" href="#inhalt">Direkt zum Inhalt</a>

  <!-- Header — plain markup, no design-system JavaScript -->
  <header class="demo-header">
    <div class="ds-container demo-header__inner">
      <a class="demo-header__brand" href="/" aria-label="Helvetia — zur Startseite">helvetia</a>
      <nav class="demo-header__nav" aria-label="Hauptnavigation">
        <ul>
          <li><a href="/privatkunden" aria-current="page">Privatkunden</a></li>
          <li><a href="/unternehmen">Unternehmen</a></li>
          <li><a href="/schaden">Schaden melden</a></li>
          <li><a href="/kontakt">Kontakt</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="inhalt">
    <!-- Hero — plain markup: container, grid, heading, picture, CSS-only button -->
    <section class="demo-hero">
      <div class="ds-container">
        <div class="ds-grid is-multiline is-vcentered gap-xl">
          <div class="ds-col">
            <p class="demo-eyebrow">Privatkunden</p>
            <h1 class="ds-heading">Versichern, was Ihnen wichtig ist</h1>
            <p class="ds-text is-lead mt-base">
              Von der Hausratversicherung bis zur Vorsorge begleitet Sie die Helvetia durch jede
              Lebenslage — persönlich beraten, digital erledigt.
            </p>
            <div class="demo-actions mt-xl">
              <a class="ds-button" href="/beratung">Beratung vereinbaren</a>
              <a class="ds-button is-secondary" href="/praemienrechner">Prämie berechnen</a>
            </div>
          </div>
          <div class="ds-col">
            <picture class="demo-hero__image">
              <img
                src="${IMAGE_HOST}/id/1015/1280/960"
                alt="Flusslandschaft zwischen bewaldeten Hängen"
                width="1280"
                height="960"
                fetchpriority="high"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>

    <!-- Richtext — plain markup; links styled by the CSS-only .ds-link class (link.style.scss) -->
    <section class="demo-section">
      <div class="ds-container">
        <div class="demo-prose ds-content">
          <h2 class="ds-heading">Sicherheit, die mitwächst</h2>
          <p class="ds-text">
            Eine Versicherung ist kein Produkt, das man einmal kauft und dann vergisst. Sie wächst mit:
            mit der ersten eigenen Wohnung, dem ersten Auto, der Familie, dem Eigenheim. Deshalb
            prüfen wir Ihre Deckung regelmässig mit Ihnen gemeinsam — und passen an, was nicht mehr passt.
          </p>
          <p class="ds-text">
            Unsere Beraterinnen und Berater sind an über 100 Standorten in der ganzen Schweiz für Sie da.
            Wer lieber selbst nachschaut, findet im
            <a class="ds-link" href="/kundenportal">Kundenportal</a> jederzeit alle Policen, Rechnungen und offenen
            Schadenfälle. Und falls doch einmal etwas passiert, erreichen Sie uns über die
            <a class="ds-link" href="/schaden">Schadenhotline</a> rund um die Uhr.
          </p>
          <h3 class="ds-title">Was zu einer guten Deckung gehört</h3>
          <ul class="ds-text">
            <li>Eine Versicherungssumme, die zum heutigen Hausrat passt — nicht zu dem von vor zehn Jahren.</li>
            <li>Eine Privathaftpflicht, die auch grobfahrlässige Fehler einschliesst.</li>
            <li>Ein Selbstbehalt, den Sie im Ernstfall tatsächlich tragen können.</li>
            <li>Klar geregelte Deckung für Velo, Laptop und Sportausrüstung ausserhalb der Wohnung.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Image row — three native pictures, styled by picture.style.scss -->
    <section class="demo-section demo-section--muted">
      <div class="ds-container">
        <h2 class="ds-heading demo-section__heading">Unsere Bereiche</h2>
        <div class="ds-grid is-multiline gap-lg">
${FIGURES.map(item => `          <div class="ds-col">${figure(item)}\n          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- Gallery — ds-carousel, one of the three real components on this page -->
    <section class="demo-section">
      <div class="ds-container">
        <h2 class="ds-heading demo-section__heading">Unterwegs in der Schweiz</h2>
        <ds-carousel label="Bildergalerie" controls="dots" value="${GALLERY[0].name}">
${GALLERY.map(slide => `          <ds-carousel-item name="${slide.name}" src="${slide.src}"></ds-carousel-item>`).join('\n')}
        </ds-carousel>
      </div>
    </section>

    <!-- FAQ — ds-accordion, the second real component -->
    <section class="demo-section demo-section--muted">
      <div class="ds-container">
        <div class="demo-prose">
          <h2 class="ds-heading demo-section__heading">Häufige Fragen</h2>
${FAQ.map(
  (entry, index) =>
    // The first entry starts open so the page still shows an answer with JavaScript off —
    // ds-accordion renders a <button aria-expanded> and needs JS to toggle.
    `          <ds-accordion group="faq" summary-title marker="plus-minus"${index === 0 ? ' open' : ''}>
            <span slot="summary">${entry.question}</span>
            <div slot="content" class="py-base">
              <p class="ds-text mb-none">${entry.answer.replace(/\s+/g, ' ').trim()}</p>
            </div>
          </ds-accordion>`,
).join('\n          <hr class="ds-divider" />\n')}
        </div>
      </div>
    </section>

    <!-- Call to action — ds-button next to the CSS-only button, visibly identical -->
    <section class="demo-section demo-cta">
      <div class="ds-container">
        <h2 class="ds-heading">Bereit für den nächsten Schritt?</h2>
        <p class="ds-text is-lead mt-base mb-xl">
          Vereinbaren Sie ein unverbindliches Gespräch — online oder in der Geschäftsstelle in Ihrer Nähe.
        </p>
        <div class="demo-actions">
          <ds-button>Termin vereinbaren</ds-button>
          <button type="button" class="ds-button">Termin vereinbaren</button>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer — plain markup, no design-system JavaScript -->
  <footer class="demo-footer">
    <div class="ds-container">
      <div class="ds-grid is-multiline gap-lg">
        <div class="ds-col">
          <h2 class="demo-footer__title">Versicherungen</h2>
          <ul>
            <li><a href="/hausrat">Hausrat</a></li>
            <li><a href="/haftpflicht">Privathaftpflicht</a></li>
            <li><a href="/motorfahrzeug">Motorfahrzeug</a></li>
            <li><a href="/reise">Reise</a></li>
          </ul>
        </div>
        <div class="ds-col">
          <h2 class="demo-footer__title">Vorsorge</h2>
          <ul>
            <li><a href="/saeule-3a">Säule 3a</a></li>
            <li><a href="/leben">Lebensversicherung</a></li>
            <li><a href="/pensionsplanung">Pensionsplanung</a></li>
          </ul>
        </div>
        <div class="ds-col">
          <h2 class="demo-footer__title">Service</h2>
          <ul>
            <li><a href="/schaden">Schaden melden</a></li>
            <li><a href="/kundenportal">Kundenportal</a></li>
            <li><a href="/kontakt">Kontakt</a></li>
          </ul>
        </div>
      </div>
      <p class="demo-footer__legal">
        Demoseite des Helvetia Design System — keine echten Produkte, keine echten Preise.
      </p>
    </div>
  </footer>
</ds-root>
`
