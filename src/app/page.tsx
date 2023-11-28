import Title from '@/components/title'
import HeroImage from '@/components/heroImage'
import Link from 'next/link'

export default function Home() {
  return (
    <main className='overflow-y-hidden'>
      <section className='flex justify-center items-center h-screen overscroll-y-hidden'>
        <div className='px-8 container mx-auto flex flex-col'>
          <h2 className='text-5xl z-10 md:text-7xl font-bold leading-relaxed'>Daniel</h2>
          <h2 className='text-5xl z-10 md:text-7xl font-bold leading-relaxed'>Azubuine</h2>

          <Title />

          <div className='z-10 md:w-[530px]'>
            <p className='text-lg leading-loose mt-12'>I&apos;m a software engineer, pianist, and composer.</p>
            <p className='text-lg leading-loose'>My mission is to create beautiful melodies in both the world of code and music sheets, crafting innovative software solutions and soulful compositions.</p>
            <p className='text-lg leading-loose'>Whether it&apos;s writing elegant code or composing melodies that resonate, I strive to create artistry that touches both hearts and screens.</p>
          </div>

          <div className='flex gap-x-6 mt-12'>
            <Link href='/projects' className='bg-white rounded-3xl text-blue-600 text-lg font-bold px-6 py-4 hover:scale-110'>My Projects</Link>
            <Link href='/music-catalog' className='bg-transparent border border-white rounded-3xl text-lg font-bold px-6 py-4 hover:scale-110'>Listen to my music</Link>
          </div>
        </div>

        <HeroImage />
      </section>
    </main>
  )
}
