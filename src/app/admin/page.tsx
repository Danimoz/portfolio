import type { Metadata } from 'next'
import { getCategories } from '@/lib/actions'
import CategoryForm from './categoryForm'
import CompositionForm from './compositionForm'
import ProjectForm from './projectForm'

export const metadata: Metadata = {
  title: 'Studio Console',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const compositionCategories = await getCategories()
  const categories = compositionCategories.data.map((category) => ({
    _id: category._id.toString(),
    name: category.name,
  }))

  return (
    <main id="main-content" className="page-shell studio-console">
      <header className="studio-console__header">
        <p>Studio Console</p>
        <h1>Manage the work behind the portfolio.</h1>
      </header>

      <section className="studio-console__grid">
        <CompositionForm categories={categories} />
        <ProjectForm />
        <CategoryForm />
      </section>
    </main>
  )
}
