'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Software', href: '/projects' },
  { name: 'Music', href: '/music-catalog' },
  { name: 'Writing', href: 'https://dflat.hashnode.dev/' },
]

function isActiveRoute(pathname: string, href: string) {
  if (!href.startsWith('/')) return false
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/" className="site-nav__brand">
          <span aria-hidden="true">DA</span>
          <span>Daniel Azubuine</span>
        </Link>

        <div className="site-nav__links">
          {navigation.map((item) => {
            const active = isActiveRoute(pathname, item.href)
            return (
              <Link key={item.name} href={item.href} aria-current={active ? 'page' : undefined}>
                {item.name}
              </Link>
            )
          })}
          <Link className="button button--quiet" href="/contact">
            Start a conversation
          </Link>
        </div>

        <details className="mobile-navigation">
          <summary className="site-nav__menu-button">
            <span className="site-nav__menu-label">Menu</span>
            <span className="site-nav__close-label">Close</span>
          </summary>

          <div id="mobile-navigation" className="mobile-navigation__inner">
            {navigation.map((item) => {
              const active = isActiveRoute(pathname, item.href)
              return (
                <Link key={item.name} href={item.href} aria-current={active ? 'page' : undefined}>
                  {item.name}
                </Link>
              )
            })}
            <Link href="/contact">Start a conversation</Link>
          </div>
        </details>
      </nav>
    </header>
  )
}
