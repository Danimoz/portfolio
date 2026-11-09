import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import dan from '@images/hero-portrait.jpg'
import pianoMusic from '@images/pianomusic.jpg'
import software from '@images/software.jpg'
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/lib/seo'
import HeroIdentity from '@/components/HeroIdentity'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Daniel Azubuine | Music and Software',
    description: DEFAULT_DESCRIPTION,
    url: '/',
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'Daniel Azubuine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daniel Azubuine | Music and Software',
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function Home() {
  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="home-hero__label">Daniel Azubuine</p>
          <HeroIdentity />
          <p className="home-hero__summary">
            Founder of Solfa Streams.
          </p>
          <div className="button-row">
            <Link className="button button--primary" href="#practice">
              Explore the work
            </Link>
            <Link className="button button--text" href="/contact">
              Start a conversation
            </Link>
          </div>
        </div>

        <figure className="home-hero__portrait">
          <Image
            src={dan}
            alt="Portrait of Daniel Azubuine"
            priority
            sizes="(max-width: 767px) 100vw, 48vw"
          />
        </figure>
      </section>

      <section id="practice" className="practice-modes" aria-label="Areas of practice">
        <article className="mode-story mode-story--music reveal" suppressHydrationWarning>
          <div className="mode-story__media">
            <Image
              src={pianoMusic}
              alt="Sheet music resting across piano keys"
              sizes="(max-width: 767px) 100vw, 55vw"
            />
          </div>
          <div className="mode-story__copy">
            <p>Music</p>
            <h2>My compositions</h2>
            <p>
              Listen to my music and find scores.
            </p>
            <Link href="/music-catalog">Browse compositions</Link>
          </div>
        </article>

        <article className="mode-story mode-story--software reveal" suppressHydrationWarning>
          <div className="mode-story__copy">
            <p>Software</p>
            <h2>My software projects</h2>
            <p>
              Explore what I build and how it works.
            </p>
            <Link href="/projects">View projects</Link>
          </div>
          <div className="mode-story__media">
            <Image
              src={software}
              alt="Source code displayed on a screen"
              sizes="(max-width: 767px) 100vw, 55vw"
            />
          </div>
        </article>
      </section>

      <section className="home-conversation reveal" suppressHydrationWarning>
        <div>
          <p>Have a project in mind?</p>
          <h2>Let’s work together.</h2>
        </div>
        <Link className="button button--primary" href="/contact">
          Start a conversation
        </Link>
      </section>
    </main>
  )
}
