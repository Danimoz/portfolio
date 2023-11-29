import Link from "next/link"
import SocialLinks from "./socialLinks"
import { FaLinkedin, FaTwitter } from "react-icons/fa"

export default function Footer(){
  const drounzSocialLinks = [
    { name: 'LinkedIn', link: 'https://linkedin.com/in/Davidegorp', icon: FaLinkedin }, 
    { name: 'Twitter', link: 'https://twitter.com/d_rounz', icon: FaTwitter }, 
  ]

  return (
    <footer className="bg-blue-600">
      <div className="container mx-auto py-4 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col">
            <p className="text-xl">Design by Drounz</p>
            <div className="flex gap-x-6 mt-2">
              {drounzSocialLinks.map((link) => (
                <Link key={link.name} href={link.link} className="bg-white rounded-3xl text-blue-600 text-lg font-bold px-3 py-1 hover:scale-110"><link.icon size={30} /></Link>
              ))}
            </div>
          </div>

          <SocialLinks />
        </div>
      </div>
    </footer>
  )
}