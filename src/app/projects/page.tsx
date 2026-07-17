import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageIntro from '@/components/PageIntro'
import { getProjects } from '@/lib/actions'
import { separateStringWithCommas } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Software Projects',
  description: 'Selected software projects by Daniel Azubuine.',
}

export default async function Projects() {
  const { data: projects } = await getProjects()

  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="Software Mode"
        title="Software shaped around real problems."
        description="Selected products and engineering work, with the role, tools, and decisions behind each result."
      />

      {projects.length ? (
        <section className="project-grid" aria-label="Selected software projects">
          {projects.map((project) => (
            <article className="project-entry reveal" key={project.name}>
              <Link className="project-entry__image" href={project.link} aria-label={`View ${project.name}`}>
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
                <Link href={project.link}>View project</Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>Project stories are being prepared.</h2>
          <p>The new software archive will pair each result with the problem, process, and evidence behind it.</p>
        </section>
      )}
    </main>
  )
}
