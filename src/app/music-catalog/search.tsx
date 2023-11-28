'use client';

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa"
import { useDebounce } from "use-debounce";

export default function CompositionSearch({ search }: { search?: string }){
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search);

  const initialRender = useRef(true);
  const [query] = useDebounce(searchValue, 750)
  
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    if (!query) router.push('/music-catalog')
    else router.push(`/music-catalog?search=${query}`)
  }, [query])

  return (
    <div className="relative container mx-auto my-8 rounded-lg shadow-lg">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <FaSearch size={20} color='#10161E'/>
      </div>
      <input 
        placeholder="Search ..." 
        className="w-full rounded-xl p-3 pl-12 text-zinc-950"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
      />
    </div>
  )
}