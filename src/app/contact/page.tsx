import type { Metadata } from 'next'
import PageIntro from '@/components/PageIntro'
import SocialLinks from '@/components/socialLinks'
import ContactForm from './contactForm'
import AboutPortrait from './hero'

export const metadata: Metadata = {
  title: 'Start a Conversation',
  description: 'Contact Daniel Azubuine about software, music, performances, or creative collaboration.',
}

export default function Contact() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="Contact"
        title="A good collaboration starts with a clear question."
        description="Tell me what you are making, what is unresolved, and why the work matters now."
      />

      <section className="contact-layout">
        <div className="contact-context">
          <AboutPortrait />
          <div>
            <h2>What we can discuss</h2>
            <p>
              Software roles, product engineering, original composition, arranging, performance, and work that crosses disciplines.
            </p>
            <SocialLinks />
          </div>
        </div>
        <ContactForm />
      </section>
    </main>
  )
}
