'use client';

import { ICategory } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompositionCategories({ categories }: { categories: string }){
  const router = useRouter();
  const [active, setActive] = useState('');

  function toggleActive(category: string, id:string){
    if(active === category) {
      setActive('')
      router.push('/music-catalog')
      return 
    };
    setActive(category);
    router.push(`/music-catalog?category=${id}`)
  }

  const categoriesParsed: ICategory[] = JSON.parse(categories);

  return (
    <div className="flex gap-x-3 md:gap-x-6 mb-8 overflow-x-auto">
      {categoriesParsed?.map((category) => (
        <button 
          className={`px-6 py-3 rounded-xl text-sm md:text-lg ${active === category.name ? 'bg-blue-600 text-white' : 'border-2 border-slate-500'}`} 
          key={category._id}
          onClick={() => toggleActive(category.name, category._id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}