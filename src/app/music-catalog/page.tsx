import type { Metadata } from 'next'
import Link from 'next/link'
import PageIntro from '@/components/PageIntro'
import { getCategories, getCompositions } from '@/lib/actions'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'
import CompositionCategories from './categories'
import CompositionSearch from './search'

export const metadata: Metadata = {
  title: 'Music Catalog',
  description: 'Compositions and musical works by Daniel Azubuine.',
  alternates: { canonical: '/music-catalog' },
  openGraph: {
    title: 'Music Catalog',
    description: 'Compositions and musical works by Daniel Azubuine.',
    url: '/music-catalog',
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'Daniel Azubuine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music Catalog',
    description: 'Compositions and musical works by Daniel Azubuine.',
    images: [DEFAULT_OG_IMAGE],
  },
}

export default async function MusicCatalog({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const search =
    typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined
  const category =
    typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined
  const [{ data: compositions }, { data: categories }] = await Promise.all([
    getCompositions(search, category),
    getCategories(),
  ])
  const serializedCategories = categories.map((item) => ({
    _id: item._id.toString(),
    name: item.name,
  }))

  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="Music"
        title="My compositions"
        description="Find a piece, listen to recordings, and browse scores."
      />

      <section className="catalog-tools" aria-label="Catalog filters">
        <CompositionSearch search={search} />
        <CompositionCategories categories={serializedCategories} />
      </section>

      {compositions.length ? (
        <section className="composition-index" aria-label="Compositions">
          {compositions.map((composition) => (
            <Link
              className="composition-entry"
              href={`/music-catalog/${composition._id}`}
              key={composition._id}
            >
              <div>
                <h2>{composition.title}</h2>
                <p>{composition.instrumentation}</p>
              </div>
              <div>
                <span>{composition.yearOfComposition}</span>
                <span>{composition.duration}</span>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>No compositions found.</h2>
          <p>Try another search or change the category filter.</p>
        </section>
      )}
    </main>
  )
}
