import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import score from '@images/pianomusic.jpg'
import ContactForm from '@/app/contact/contactForm'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'
import styles from './commissions.module.css'

const description = 'Commission original music, arrangements, and orchestrations from Daniel Azubuine for any instrument, ensemble, choir, or orchestra. Enquire for a quote.'

export const metadata: Metadata = {
  title: 'Music Commissions',
  description,
  alternates: { canonical: '/commissions' },
  openGraph: {
    title: 'Music Commissions | Daniel Azubuine',
    description,
    url: '/commissions',
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'Daniel Azubuine' }],
  },
  twitter: { card: 'summary_large_image', title: 'Music Commissions', description, images: [DEFAULT_OG_IMAGE] },
}

const services = [
  ['Original compositions', 'A new piece written for your performers, concert, occasion, or idea.'],
  ['Arrangements', 'An existing piece adapted for the instruments or voices you have.'],
  ['Orchestrations', 'Music scored for an orchestra or a different combination of instruments.'],
]

const process = [
  ['Tell me about the music', 'Share the performers, occasion, approximate length, and any dates you have in mind. An early idea is enough to start.'],
  ['Agree the details and fee', 'We’ll discuss the musical direction, scope, schedule, and materials you need. You’ll receive a quote before deciding to go ahead.'],
  ['Create the music', 'Once the details are agreed, I’ll write the music with your performers and project in mind.'],
  ['Prepare for performance', 'The score, parts, and any other agreed materials are prepared for delivery on the agreed schedule.'],
]

const questions = [
  ['How much does a commission cost?', 'Every project is quoted individually. The fee depends on the instrumentation, length, complexity, deadline, and materials required. Send an enquiry to discuss a price.'],
  ['How far ahead should I enquire?', 'Get in touch as early as you can, especially for an orchestral work or a planned premiere. Include your preferred date so we can discuss availability and a realistic schedule.'],
  ['Can I enquire before all the details are decided?', 'Yes. Tell me what you know so far. You do not need a complete brief, a confirmed concert, or an exact duration to start a conversation.'],
  ['Can you arrange or orchestrate an existing piece?', 'Yes. Include the title, composer, original instrumentation, and the performers you want it adapted for. We’ll discuss any permissions needed before work begins.'],
  ['What about premieres, dedications, and recordings?', 'Mention these in your enquiry. Any dedication, premiere, recording, publication, or other intended use can be discussed and agreed as part of the project.'],
]

export default function Commissions() {
  return (
    <main id="main-content" className={`page-shell ${styles.page}`}>
      <header className={styles.hero}>
        <h1>Commission a piece of music</h1>
        <div className={styles.heroCopy}>
          <p>Original compositions, arrangements, and orchestrations for any instrument, ensemble, choir, or orchestra.</p>
          <div className="button-row">
            <a className="button button--primary" href="#enquire">Enquire about a commission</a>
            <Link className="button button--text" href="/music-catalog">Listen to my music</Link>
          </div>
          <p className={styles.priceNote}>Each project is priced individually. Enquire for a quote.</p>
        </div>
      </header>

      <section className={styles.feature} aria-labelledby="performers-heading">
        <figure className={styles.photo}>
          <Image src={score} alt="Sheet music across piano keys" sizes="(max-width: 767px) 100vw, 55vw" priority />
        </figure>
        <div className={styles.featureCopy}>
          <h2 id="performers-heading">From one instrument to a full orchestra.</h2>
          <p>A concert, a celebration, a dedication, or a new piece for your repertoire. Tell me who the music is for and what you have in mind.</p>
          <ul className={styles.forces}>
            <li>Solo instruments &amp; soloists with accompaniment</li>
            <li>Chamber groups &amp; mixed ensembles</li>
            <li>Solo voices &amp; choirs</li>
            <li>Chamber &amp; symphony orchestras</li>
          </ul>
          <p>Strings, woodwinds, brass, percussion, keyboards, or another combination—your instrumentation is the starting point.</p>
        </div>
      </section>

      <section className={styles.editorial} aria-labelledby="services-heading">
        <h2 id="services-heading">What you can commission</h2>
        <dl className={styles.rows}>
          {services.map(([title, text]) => <div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}
        </dl>
      </section>

      <section className={styles.editorial} aria-labelledby="process-heading">
        <div><h2 id="process-heading">How it works</h2><p>The details are agreed together before writing begins.</p></div>
        <ol className={styles.process}>
          {process.map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}
        </ol>
      </section>

      <section className={styles.editorial} aria-labelledby="questions-heading">
        <h2 id="questions-heading">A few useful details</h2>
        <div className={styles.questions}>
          {questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </div>
      </section>

      <section id="enquire" className={styles.enquiry} aria-labelledby="enquiry-heading">
        <div className={styles.enquiryCopy}>
          <h2 id="enquiry-heading">Tell me about your commission.</h2>
          <p>Share your idea and I’ll be in touch to discuss the music, availability, and a quote.</p>
          <p>Not sure about the instruments, length, or budget yet? Leave those details open.</p>
          <Link href="/music-catalog">Explore my compositions</Link>
        </div>
        <ContactForm kind="commission" />
      </section>
    </main>
  )
}
