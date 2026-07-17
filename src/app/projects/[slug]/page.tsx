import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getProjectBySlug } from '@/lib/actions'
import { separateStringWithCommas } from '@/lib/utils'
import { parseWorkStory } from '@/lib/workStory'
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

  return {
    title: `${project.name} — Work Story`,
    description: project.description,
    openGraph: {
      title: `${project.name} — Work Story`,
      description: project.description,
      images: [{ url: project.image, alt: `Preview of ${project.name}` }],
    },
  }
}

export default async function WorkStoryPage({ params }: WorkStoryPageProps) {
  const { slug } = await params
  const project = await loadWorkStory(slug)

  if (!project) notFound()

  const chapters = parseWorkStory(project.storyContent ?? '')
  const technologies = separateStringWithCommas(project.tech)

  return (
    <main id="main-content" className={styles.story}>
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
