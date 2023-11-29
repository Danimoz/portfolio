import { getProjects } from "@/lib/actions"
import { getMultipleBase64, separateStringWithCommas } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Daniel Azubuine Portfolio',
  description: 'Software Projects done by Daniel Azubuine'
}


export default async function Projects() {
  const projects = await getProjects();
  const blurredURLs = await getMultipleBase64(projects.data)
  
  return (
    <main className="container mx-auto px-4 min-h-screen">
      <section className="my-4">
        <h1 className="mt-8 text-4xl font-bold relative">
          My work
          <span className="absolute w-[100px] h-2 bg-blue-600 -bottom-4 left-0" />
        </h1>
      </section>

      <section className="py-9">
        {projects.data?.map((project, index) => (
          <Link href={project.link} key={project.name} className="hover:shadow-2xl mb-6">
            <Image 
              src={project.image} 
              alt={project.name}
              placeholder="blur"
              blurDataURL={blurredURLs[index].blurredImage} 
              width={1120} 
              height={240} 
              className="w-full h-60 rounded-tl-2xl rounded-tr-2xl transform brightness-90 transition hover:brightness-110" 
              style={{ transform: "translate3d(0, 0, 0)" }}
            />
            <div className="bg-white dark:bg-zinc-900 py-4 px-6 border-b-4 border-slate-500">
              <h2 className="uppercase text-xl font-bold py-4">{project.name}</h2>
              <p className="text-base">{project.description}</p>
              <p className="text-base my-3">{project.role}</p>
              {separateStringWithCommas(project.tech).map((tech) => (
                <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mt-2" key={tech}>{tech}</span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}