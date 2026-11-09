import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageIntro from '@/components/PageIntro'
import { getProjects } from '@/lib/actions'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'
import { separateStringWithCommas } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Software Projects',
  description: 'Selected software projects by Daniel Azubuine.',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Software Projects',
    description: 'Selected software projects by Daniel Azubuine.',
    url: '/projects',
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'Daniel Azubuine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software Projects',
    description: 'Selected software projects by Daniel Azubuine.',
    images: [DEFAULT_OG_IMAGE],
  },
}

export default async function Projects() {
  const { data: projects } = await getProjects()

  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="Software"
        title="My software projects"
        description="What I’ve built, my role, and the tools I used."
      />

      {projects.length ? (
        <section className="project-grid" aria-label="Selected software projects">
          {projects.map((project) => {
            const hasStory = Boolean(project.story)
            const href = hasStory ? `/projects/${project.slug}` : project.link

            return (
              <article className="project-entry" key={project.name}>
                <Link
                  className="project-entry__image"
                  href={href}
                  aria-label={hasStory ? `Read about ${project.name}` : `View ${project.name}`}
                >
                  <Image
                    src={project.image}
                    alt={`Preview of ${project.name}`}
                    width={1200}
                    height={820}
                    sizes="(max-width: 767px) 100vw, 50vw"
                  />
                </Link>
                <div className="project-entry__copy">
                  <div>
                    <h2>{project.name}</h2>
                    <p>{project.role}</p>
                  </div>
                  <p>{project.description}</p>
                  <div className="tag-list" aria-label="Technologies used">
                    {separateStringWithCommas(project.tech).map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  <Link href={href}>{hasStory ? 'Read project story' : 'View project'}</Link>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <section className="empty-state">
          <h2>No projects to show yet.</h2>
          <p>Check back for new projects.</p>
        </section>
      )}
    </main>
  )
}
