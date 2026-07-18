import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getProjectBySlug } from '@/lib/actions'
import { absoluteUrl, serializeJsonLd, truncateDescription } from '@/lib/seo'
import { separateStringWithCommas } from '@/lib/utils'
import { parseWorkStory } from '@/lib/workStory'
import { workStoryExtensions } from '@/lib/workStoryExtensions'
import { generateHTML } from '@tiptap/html'
import styles from './story.module.css'

type WorkStoryPageProps = {
  params: Promise<{ slug: string }>
}

const loadWorkStory = cache(async (slug: string) => {
  const { data } = await getProjectBySlug(slug)
  return data
})

export async function generateMetadata({ params }: WorkStoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await loadWorkStory(slug)

  if (!project) return { title: 'Work Story not found' }

  const title = `${project.name} — Work Story`
  const description = truncateDescription(project.description)
  const url = `/projects/${project.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: [{ url: project.image, alt: `Preview of ${project.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [project.image],
    },
  }
}

export default async function WorkStoryPage({ params }: WorkStoryPageProps) {
  const { slug } = await params
  const project = await loadWorkStory(slug)

  if (!project) notFound()

  const chapters = parseWorkStory(project.storyContent ?? '')
  const storyHtml = project.storyDocument
    ? generateHTML(project.storyDocument, workStoryExtensions)
    : null
  const technologies = separateStringWithCommas(project.tech)
  const canonicalUrl = absoluteUrl(`/projects/${project.slug}`)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${canonicalUrl}#work-story`,
      name: `${project.name} Work Story`,
      headline: project.name,
      description: truncateDescription(project.description),
      url: canonicalUrl,
      image: project.image,
      creator: { '@id': 'https://danielazubuine.me/#daniel-azubuine' },
      about: {
        '@type': 'SoftwareApplication',
        name: project.name,
        applicationCategory: 'SoftwareApplication',
        url: project.link,
        description: truncateDescription(project.description),
      },
      keywords: technologies,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Software Projects', item: absoluteUrl('/projects') },
        { '@type': 'ListItem', position: 3, name: project.name, item: canonicalUrl },
      ],
    },
  ]

  return (
    <main id="main-content" className={styles.story}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <header className={styles.header}>
        <Link href="/projects" className={styles.backLink}>← Software Projects</Link>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.mode}>Software Work Story</p>
            <h1>{project.name}</h1>
          </div>
          <a className="button" href={project.link} target="_blank" rel="noreferrer">
            Visit project
          </a>
        </div>
        <p className={styles.lede}>{project.description}</p>
        <dl className={styles.metadata}>
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Built with</dt>
            <dd>{technologies.join(' · ')}</dd>
          </div>
        </dl>
      </header>

      <figure className={styles.heroMedia}>
        <Image
          src={project.image}
          alt={`Preview of ${project.name}`}
          width={1600}
          height={1050}
          sizes="(max-width: 767px) 100vw, 90vw"
          priority
        />
      </figure>

      {storyHtml ? (
        <article
          className={styles.richStory}
          aria-label={`${project.name} story`}
          dangerouslySetInnerHTML={{ __html: storyHtml }}
        />
      ) : (
        <section className={styles.chapters} aria-label={`${project.name} story`}>
          {chapters.map((chapter, chapterIndex) => (
            <article className={styles.chapter} key={`${chapter.heading}-${chapterIndex}`}>
              <h2>{chapter.heading}</h2>
              <div className={styles.chapterCopy}>
                {chapter.paragraphs.map((paragraph, index) => (
                  <p key={`${chapter.heading}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      <footer className={styles.endMatter}>
        <p>Explore the product or continue through the software archive.</p>
        <div>
          <a href={project.link} target="_blank" rel="noreferrer">Visit {project.name}</a>
          <Link href="/projects">All Software Projects</Link>
        </div>
      </footer>
    </main>
  )
}
