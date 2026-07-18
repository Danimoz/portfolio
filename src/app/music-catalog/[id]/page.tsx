import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSingleComposition } from '@/lib/actions'
import { absoluteUrl, serializeJsonLd, truncateDescription } from '@/lib/seo'
import { separateStringWithCommas } from '@/lib/utils'
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '@/lib/youtube'
import styles from './composition.module.css'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await getSingleComposition(id)
  if (!data) return { title: 'Composition not found' }

  const title = data.title
  const description = truncateDescription(
    data.noteFromComposer ||
      data.compositionText ||
      `${data.title}, a composition by Daniel Azubuine for ${data.instrumentation}.`,
  )

  return {
    title,
    description,
    alternates: { canonical: `/music-catalog/${id}` },
    openGraph: {
      type: 'music.song',
      title,
      description,
      url: `/music-catalog/${id}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function SingleComposition({ params }: Props) {
  const { id } = await params
  const { data: composition, status } = await getSingleComposition(id)
  if (status === 404 || !composition) notFound()

  const recordings = composition.youtubeLinks
    ? separateStringWithCommas(composition.youtubeLinks)
        .map((link) => {
          const videoId = getYouTubeVideoId(link)
          const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null
          return videoId && embedUrl ? { videoId, embedUrl } : null
        })
        .filter((recording): recording is { videoId: string; embedUrl: string } => Boolean(recording))
    : []
  const canonicalUrl = absoluteUrl(`/music-catalog/${composition._id}`)
  const description = truncateDescription(
    composition.noteFromComposer ||
      composition.compositionText ||
      `${composition.title}, a composition by Daniel Azubuine for ${composition.instrumentation}.`,
  )
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'MusicComposition',
      '@id': `${canonicalUrl}#composition`,
      name: composition.title,
      url: canonicalUrl,
      description,
      composer: { '@id': 'https://danielazubuine.me/#daniel-azubuine' },
      dateCreated: composition.yearOfComposition,
      musicCompositionForm: composition.instrumentation,
      duration: composition.duration,
      recordedAs: recordings.map((recording, index) => ({
        '@type': 'MusicRecording',
        name: `${composition.title} recording ${index + 1}`,
        url: recording.embedUrl,
      })),
      offers: composition.scorePurchaseLinks?.map((link) => ({
        '@type': 'Offer',
        name: link.label,
        url: link.url,
        availability: 'https://schema.org/InStock',
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Music Catalog', item: absoluteUrl('/music-catalog') },
        { '@type': 'ListItem', position: 3, name: composition.title, item: canonicalUrl },
      ],
    },
  ]

  return (
    <main id="main-content" className="page-shell composition-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
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
        <section className="composition-note reveal" suppressHydrationWarning>
          <h2>From the composer</h2>
          <p>{composition.noteFromComposer}</p>
        </section>
      ) : null}

      {recordings.length ? (
        <section className="recordings reveal" aria-labelledby="recordings-heading" suppressHydrationWarning>
          <h2 id="recordings-heading">Listen</h2>
          <div className="recordings__grid">
            {recordings.map((recording, index) => (
              <iframe
                key={recording.videoId}
                src={recording.embedUrl}
                title={`${composition.title} recording ${index + 1}`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ))}
          </div>
        </section>
      ) : null}

      {composition.scorePurchaseLinks?.length ? (
        <section className={`${styles.score} reveal`} aria-labelledby="score-heading" suppressHydrationWarning>
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
        <section className="composition-text reveal" suppressHydrationWarning>
          <h2>Text</h2>
          <p>{composition.compositionText}</p>
        </section>
      ) : null}
    </main>
  )
}
