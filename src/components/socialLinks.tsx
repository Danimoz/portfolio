import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

const socialMediaLinks = [
  { name: 'X', href: 'https://twitter.com/danielazubuine', icon: FaXTwitter },
  { name: 'Facebook', href: 'https://www.facebook.com/azubuine.daniel', icon: FaFacebookF },
  { name: 'Instagram', href: 'https://www.instagram.com/deeflaat/', icon: FaInstagram },
  { name: 'YouTube', href: 'https://www.youtube.com/@DanielAzubuine', icon: FaYoutube },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/danielazubuine/', icon: FaLinkedin },
]

export default function SocialLinks() {
  return (
    <div className="social-links" aria-label="Social profiles">
      {socialMediaLinks.map((item) => (
        <Link key={item.name} href={item.href} aria-label={item.name}>
          <item.icon aria-hidden="true" />
        </Link>
      ))}
    </div>
  )
}
