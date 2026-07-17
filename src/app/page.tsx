import Image from 'next/image'
import Link from 'next/link'
import dan from '@images/dan.jpeg'
import pianoMusic from '@images/pianomusic.jpg'
import software from '@images/software.jpg'

export default function Home() {
  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="home-hero__label">Daniel Azubuine</p>
          <h1>
            Sound, software,
            <span>one creative practice.</span>
          </h1>
          <p className="home-hero__summary">
            Founder of Solfa Streams. Daniel composes music and builds software with structure, feeling, and consequence.
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

      <section className="practice-statement reveal">
        <p>Different materials. The same attention.</p>
        <h2>
          I care about how an idea is structured, how it moves, and what remains after it reaches someone.
        </h2>
      </section>

      <section id="practice" className="practice-modes" aria-label="Areas of practice">
        <article className="mode-story mode-story--music reveal">
          <div className="mode-story__media">
            <Image
              src={pianoMusic}
              alt="Sheet music resting across piano keys"
              sizes="(max-width: 767px) 100vw, 55vw"
            />
          </div>
          <div className="mode-story__copy">
            <p>Music</p>
            <h2>Compositions built to be lived in.</h2>
            <p>
              Explore concert works, recordings, instrumentation, texts, and the stories behind each piece.
            </p>
            <Link href="/music-catalog">Enter Music Mode</Link>
          </div>
        </article>

        <article className="mode-story mode-story--software reveal">
          <div className="mode-story__copy">
            <p>Software</p>
            <h2>Digital products shaped with clarity.</h2>
            <p>
              See selected engineering work, the problems it addresses, and the thinking behind the result.
            </p>
            <Link href="/projects">Enter Software Mode</Link>
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

      <section className="home-conversation reveal">
        <div>
          <p>Looking for a composer, engineer, or creative collaborator?</p>
          <h2>Bring me the question you cannot stop thinking about.</h2>
        </div>
        <Link className="button button--primary" href="/contact">
          Start a conversation
        </Link>
      </section>
    </main>
  )
}
