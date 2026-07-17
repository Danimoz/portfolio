'use client'

import { usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import Footer from './Footer'
import Navbar from './Navbar'
import ResonanceField from './ResonanceField'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudioConsole = pathname.startsWith('/admin')

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {isStudioConsole ? null : <ResonanceField />}
      {isStudioConsole ? null : <Navbar />}
      {children}
      {isStudioConsole ? null : <Footer />}
      <Toaster position="top-right" />
    </>
  )
}
