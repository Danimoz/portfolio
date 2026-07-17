'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

export default function CompositionSearch({ search }: { search?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(search ?? '')
  const initialRender = useRef(true)
  const [query] = useDebounce(searchValue, 500)

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    const normalizedQuery = query.trim()
    if (normalizedQuery) params.set('search', normalizedQuery)
    else params.delete('search')

    const nextQuery = params.toString()
    if (nextQuery === searchParams.toString()) return

    router.replace(`/music-catalog${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false })
  }, [query, router, searchParams])

  return (
    <div className="catalog-search">
      <label htmlFor="composition-search">Search the catalog</label>
      <input
        id="composition-search"
        type="search"
        placeholder="Title or keyword"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
      />
    </div>
  )
}
