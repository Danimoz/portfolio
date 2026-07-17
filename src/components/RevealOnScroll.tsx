'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function RevealOnScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (elements.length === 0) return

    // Each `.reveal` element carries `suppressHydrationWarning`, so enhancing
    // it on the client (the progress variable below) does not trip a
    // server/client hydration mismatch.
    document.documentElement.setAttribute('data-reveal-ready', '')

    let frame = 0

    const update = () => {
      frame = 0
      const viewportHeight = window.innerHeight
      // The reveal completes over roughly a full viewport of scrolling,
      // finishing once the element has risen to ~5% from the top.
      const travel = viewportHeight * 0.998
      elements.forEach((element) => {
        const top = element.getBoundingClientRect().top
        const progress = Math.min(1, Math.max(0, (viewportHeight - top) / travel))
        element.style.setProperty('--reveal-progress', progress.toFixed(4))
      })
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [pathname])

  return null
}
