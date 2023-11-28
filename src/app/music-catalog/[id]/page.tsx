import { getSingleComposition } from "@/lib/actions";
import { separateStringWithCommas } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SingleComposition({ params: { id } }: { params: { id: string }}){
  const { data: composition, status } = await getSingleComposition(id);
  if(status === 404) return notFound();

  return (
    <main className="container min-h-screen mx-auto px-6 md:px-0">
      <section className="my-4 flex flex-col md:flex-row gap-y-6 items-center">
        <h1 className="my-8 text-4xl font-bold relative">
          {composition?.title}
          <span className="absolute w-[100px] h-2 bg-blue-600 -bottom-4 left-0" />
        </h1>
        <div className="ml-auto hover:scale-110">
          <Link href='/music-catalog' className='uppercase text-xl px-6 py-3 border-2 border-slate-500 rounded-xl'>Browse Catalog</Link>
        </div>
      </section>

      <section className="my-4">
        <div className="mt-8">
          <p className="text-lg uppercase">{composition?.instrumentation}</p>
          <h2 className="uppercase text-xl font-bold my-4">Note from Composer</h2>
          <p className="text-lg">{composition?.noteFromComposer}</p>
        </div>
        <div className="my-4">
          {composition?.youtubeLinks && separateStringWithCommas(composition?.youtubeLinks as string).map((link) => (
            <iframe 
              width="560" 
              height="505"
              className="w-full" 
              src={link + '?autoplay=1'}
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen={true} 
            />
          ))}
        </div>
        <div>
          {composition?.compositionText && (
            <>
              <h2 className="uppercase text-xl font-bold my-4">The text</h2>
              <p className="text-lg whitespace-pre-line">{composition?.compositionText}</p>
            </>
          )}
          
          <h2 className="uppercase text-xl font-bold my-4">Duration</h2>
          <p className="text-lg">{composition?.duration}</p>

          <h2 className="uppercase text-xl font-bold my-4">Year Of Composition</h2>
          <p className="text-lg">{composition?.yearOfComposition}</p>

        </div>
      </section>
    </main>
  )
}