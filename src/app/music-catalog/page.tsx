import { getCategories, getCompositions } from "@/lib/actions";
import Link from "next/link";
import CompositionSearch from "./search";
import CompositionCategories from "./categories";

export default async function MusicCatalog({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined}}){
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;

  const { data: compositions } = await getCompositions(search, category);
  const { data: categories } = await getCategories();
  
  return (
    <main className="container mx-auto px-4 md:px-0 min-h-screen">
      <section className="my-4">
        <h1 className="my-8 text-4xl font-bold relative">
          Music Catalog
          <span className="absolute w-[100px] h-2 bg-blue-600 -bottom-4 left-0" />
        </h1>
      </section>

      <section className="my-4">
        <CompositionSearch search={search} />

        <CompositionCategories categories={JSON.stringify(categories)} />

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4'>
          {compositions?.map((composition) => (
            <Link href={`/music-catalog/${composition._id}`} key={composition._id} className="rounded-xl bg-white text-blue-600 px-6 py-3 hover:scale-105">
              <h2 className="">{composition.title}</h2> 
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}