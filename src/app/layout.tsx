import type { Metadata } from 'next'
import { Anybody } from 'next/font/google'
import SiteChrome from '@/components/SiteChrome'
import './globals.css'

const anybody = Anybody({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-anybody',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://danielazubuine.me'),
  title: {
    default: 'Daniel Azubuine | Music and Software',
    template: '%s | Daniel Azubuine',
  },
  description:
    'The creative practice of Daniel Azubuine, a composer, pianist, and software engineer shaping expressive work in sound and software.',
  authors: [{ name: 'Daniel Azubuine', url: 'https://danielazubuine.me' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Daniel Azubuine | Music and Software',
    description: 'Compositions, performances, software projects, and the craft connecting them.',
    images: [{ url: '/images/dan.jpeg', width: 1920, height: 1280, alt: 'Daniel Azubuine' }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@danielazubuine',
    images: ['/images/dan.jpeg'],
  },
  creator: 'Daniel Azubuine',
  verification: {
    google: '2J1KmHMMWwUYJvcm3GLlsDy2BeWu7ynWkccC0-PUbS0',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={anybody.variable} data-scroll-behavior="smooth">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
