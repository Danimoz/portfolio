import Link from 'next/link'
import SocialLinks from './socialLinks'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__lead">
        <p>Have a role, score, performance, or product in mind?</p>
        <Link href="/contact">Start a conversation</Link>
      </div>

      <div className="site-footer__base">
        <div>
          <p>Daniel Azubuine</p>
          <p>Composer, pianist, and software engineer.</p>
        </div>
        <SocialLinks />
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
