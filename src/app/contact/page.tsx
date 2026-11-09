import type { Metadata } from 'next'
import PageIntro from '@/components/PageIntro'
import SocialLinks from '@/components/socialLinks'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'
import ContactForm from './contactForm'
import AboutPortrait from './hero'

export const metadata: Metadata = {
  title: 'Start a Conversation',
  description: 'Contact Daniel Azubuine about software, music, performances, or creative collaboration.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Start a Conversation',
    description: 'Contact Daniel Azubuine about software, music, performances, or creative collaboration.',
    url: '/contact',
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'Daniel Azubuine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start a Conversation',
    description: 'Contact Daniel Azubuine about software, music, performances, or creative collaboration.',
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function Contact() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="Contact"
        title="Start a conversation"
        description="Tell me about your project or ask a question."
      />

      <section className="contact-layout">
        <div className="contact-context">
          <AboutPortrait />
          <div>
            <h2>What we can discuss</h2>
            <p>
              Software projects and roles, music commissions, arrangements, and performances.
            </p>
            <SocialLinks />
          </div>
        </div>
        <ContactForm />
      </section>
    </main>
  )
}
