import type { Metadata } from 'next'
import { getCategories, getCompositions, getProjects } from '@/lib/actions'
import CategoryForm from './categoryForm'
import CompositionForm from './compositionForm'
import ProjectForm, { type EditableProject } from './projectForm'

export const metadata: Metadata = {
  title: 'Studio Console',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const [categoryResult, compositionResult, projectResult] = await Promise.all([
    getCategories(),
    getCompositions(),
    getProjects(),
  ])

  const categories = categoryResult.data.map((category) => ({
    _id: category._id.toString(),
    name: category.name,
  }))
  const compositions = compositionResult.data.map((composition) => ({
    _id: composition._id.toString(),
    title: composition.title,
    duration: composition.duration,
    yearOfComposition: composition.yearOfComposition,
    instrumentation: composition.instrumentation,
    noteFromComposer: composition.noteFromComposer ?? '',
    compositionText: composition.compositionText ?? '',
    youtubeLinks: composition.youtubeLinks ?? '',
    scorePurchaseLinks: composition.scorePurchaseLinks?.map((link) => ({
      label: link.label,
      url: link.url,
    })) ?? [],
    categories: composition.categories.map((category) => category.toString()),
  }))
  const projects: EditableProject[] = projectResult.data.flatMap((project) => {
    const id = project._id?.toString()
    if (!id) return []
    return [
      {
        _id: id,
        name: project.name,
        description: project.description,
        image: project.image,
        link: project.link,
        tech: project.tech,
        role: project.role,
        story: project.story ?? false,
        slug: project.slug ?? '',
        storyContent: project.storyContent ?? '',
        storyDocument: project.storyDocument
          ? JSON.parse(JSON.stringify(project.storyDocument))
          : undefined,
      },
    ]
  })

  return (
    <main id="main-content" className="page-shell studio-console">
      <header className="studio-console__header">
        <p>Studio Console</p>
        <h1>Manage your portfolio</h1>
      </header>

      <section className="studio-console__grid">
        <CompositionForm categories={categories} />
        <ProjectForm />
        <CategoryForm />
      </section>

      <section className="console-library" aria-labelledby="edit-content-heading">
        <header>
          <p>Published work</p>
          <h2 id="edit-content-heading">Edit existing content</h2>
        </header>

        <div className="console-library__group">
          <h3>Compositions</h3>
          {compositions.length ? (
            <div className="console-editor-list">
              {compositions.map((composition) => (
                <details className="console-editor" key={composition._id}>
                  <summary>
                    <span>{composition.title}</span>
                    <span>{composition.instrumentation}</span>
                  </summary>
                  <CompositionForm categories={categories} composition={composition} />
                </details>
              ))}
            </div>
          ) : (
            <p>No compositions are available to edit.</p>
          )}
        </div>

        <div className="console-library__group">
          <h3>Software projects</h3>
          {projects.length ? (
            <div className="console-editor-list">
              {projects.map((project) => (
                <details className="console-editor" key={project._id}>
                  <summary>
                    <span>{project.name}</span>
                    <span>{project.role}</span>
                  </summary>
                  <ProjectForm project={project} />
                </details>
              ))}
            </div>
          ) : (
            <p>No software projects are available to edit.</p>
          )}
        </div>
      </section>
    </main>
  )
}
