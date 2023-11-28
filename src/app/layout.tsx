import Navbar from '@/components/Navbar'
import './globals.css'
import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Lines from '@/components/lines'
import Footer from '@/components/Footer'

const noto_sans = Noto_Sans({ 
  subsets: ['latin'],
  weight: ['400', '700'] 

})

export const metadata: Metadata = {
  title: 'Daniel Azubuine - Software Engineer, Pianist, Composer',
  authors: [{ name: 'Daniel Azubuine', url: 'https://danielazubuine.me', }],
  alternates: { canonical: 'https://danielazubuine.me' },
  openGraph: {
    type: 'website',
    url: 'https://danielazubuine.me',
    title: 'Daniel Azubuine - Software Engineer, Pianist, Composer',
    description: "Official Website of Daniel Azubuine, a talented Software Engineer, Pianist, and Composer. Combining technology with the artistry of music to craft innovative software solutions and soulful compositions.",
  },
  twitter: { 
    card: 'summary_large_image',
    site: '@danielazubuine',
    creator: '@danielazubuine',

  },
  description: "Official Website of Daniel Azubuine, a talented Software Engineer, Pianist, and Composer. Combining technology with the artistry of music to craft innovative software solutions and soulful compositions.",
  keywords: "Daniel Azubuine, Software Engineer, Pianist, Composer, Musician, Software Developer, Web Developer, Frontend Developer, Backend Developer, Fullstack Developer, React, Next.js, Node.js, Typescript, Javascript, HTML, CSS, TailwindCSS, ChakraUI, Figma, Adobe Photoshop, Adobe Illustrator, Adobe XD, Adobe Premiere Pro, Adobe After Effects, Ableton Live, FL Studio, Logic Pro, Pro Tools, Cubase, Sibelius, Finale, Dorico, Musescore, Notion, Trello, Jira, Github, Gitlab, Bitbucket, Agile, Scrum, Kanban, Waterfall, Software Development, Web Development, Frontend Development, Backend Development, Fullstack Development, React Development, Next.js Development, Node.js Development, Typescript Development, Javascript Development, HTML Development, CSS Development, TailwindCSS Development, ChakraUI Development, Figma Development, Adobe Photoshop Development, Adobe Illustrator Development, Adobe XD Development, Adobe Premiere Pro Development, Adobe After Effects Development, Ableton Live Development, FL Studio Development, Logic Pro Development, Pro Tools Development, Cubase Development, Sibelius Development, Finale Development, Dorico Development, Musescore Development, Notion Development, Trello Development, Jira Development, Github Development, Gitlab Development, Bitbucket Development, Agile Development, Scrum Development, Kanban Development, Waterfall Development",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={noto_sans.className}>
        <Navbar />
        <Lines />
        {children}
        <Footer />
        <Toaster position='top-right' />
      </body>
    </html>
  )
}
