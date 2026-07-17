'use client'

import type { ICategory } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CompositionCategories({ categories }: { categories: ICategory[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  const selectCategory = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeCategory === id) params.delete('category')
    else params.set('category', id)
    const nextQuery = params.toString()

    router.replace(`/music-catalog${nextQuery ? `?${nextQuery}` : ''}`, {
      scroll: false,
    })
  }

  if (!categories.length) return null

  return (
    <div className="category-filter" aria-label="Filter compositions by category">
      {categories.map((category) => (
        <button
          type="button"
          key={category._id}
          aria-pressed={activeCategory === category._id}
          onClick={() => selectCategory(category._id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
