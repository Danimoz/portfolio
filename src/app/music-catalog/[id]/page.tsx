import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSingleComposition } from '@/lib/actions'
import { separateStringWithCommas } from '@/lib/utils'
import styles from './composition.module.css'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await getSingleComposition(id)
  return {
    title: data?.title ?? 'Composition',
    description: data
      ? `${data.title}, a composition by Daniel Azubuine for ${data.instrumentation}.`
      : 'A composition by Daniel Azubuine.',
  }
}

export default async function SingleComposition({ params }: Props) {
  const { id } = await params
  const { data: composition, status } = await getSingleComposition(id)
  if (status === 404 || !composition) notFound()

  const recordings = composition.youtubeLinks
    ? separateStringWithCommas(composition.youtubeLinks).filter(Boolean)
    : []

  return (
    <main id="main-content" className="page-shell composition-page">
      <header className="composition-hero">
        <Link href="/music-catalog">Back to the catalog</Link>
        <h1>{composition.title}</h1>
        <p>{composition.instrumentation}</p>
        <dl>
          <div>
            <dt>Year</dt>
            <dd>{composition.yearOfComposition}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{composition.duration}</dd>
          </div>
        </dl>
      </header>

      {composition.noteFromComposer ? (
        <section className="composition-note reveal">
          <h2>From the composer</h2>
          <p>{composition.noteFromComposer}</p>
        </section>
      ) : null}

      {recordings.length ? (
        <section className="recordings reveal" aria-labelledby="recordings-heading">
          <h2 id="recordings-heading">Listen</h2>
          <div className="recordings__grid">
            {recordings.map((link, index) => (
              <iframe
                key={link}
                src={link}
                title={`${composition.title} recording ${index + 1}`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ))}
          </div>
        </section>
      ) : null}

      {composition.scorePurchaseLinks?.length ? (
        <section className={`${styles.score} reveal`} aria-labelledby="score-heading">
          <div>
            <p className={styles.eyebrow}>Published edition</p>
            <h2 id="score-heading">Purchase the score</h2>
            <p>Choose a publisher or edition to continue to its secure storefront.</p>
          </div>
          <div className={styles.links}>
            {composition.scorePurchaseLinks.map((link) => (
              <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                <span>{link.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {composition.compositionText ? (
        <section className="composition-text reveal">
          <h2>Text</h2>
          <p>{composition.compositionText}</p>
        </section>
      ) : null}
    </main>
  )
}
