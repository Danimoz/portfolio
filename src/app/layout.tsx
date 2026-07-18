import type { Metadata } from 'next'
import { Anybody } from 'next/font/google'
import SiteChrome from '@/components/SiteChrome'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  personJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from '@/lib/seo'
import './globals.css'

const anybody = Anybody({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-anybody',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'Daniel Azubuine | Music and Software',
    template: '%s | Daniel Azubuine',
  },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: 'Daniel Azubuine', url: SITE_URL }],
  alternates: { canonical: '/' },
  keywords: [
    'Daniel Azubuine',
    'composer',
    'pianist',
    'software engineer',
    'Solfa Streams',
    'music composition',
    'software projects',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: '/',
    title: 'Daniel Azubuine | Music and Software',
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 3456, height: 2987, alt: 'Daniel Azubuine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daniel Azubuine | Music and Software',
    description: DEFAULT_DESCRIPTION,
    creator: '@danielazubuine',
    images: [DEFAULT_OG_IMAGE],
  },
  creator: 'Daniel Azubuine',
  verification: {
    google: '2J1KmHMMWwUYJvcm3GLlsDy2BeWu7ynWkccC0-PUbS0',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = [personJsonLd, websiteJsonLd]

  return (
    <html lang="en" className={anybody.variable} data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
