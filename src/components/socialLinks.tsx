import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function SocialLinks(){
  const socialMediaLinks = [
    { name: 'Twitter', link: 'https://twitter.com/danielazubuine', icon: FaXTwitter},
    { name: 'Facebook', link: 'https://www.facebook.com/azubuine.daniel', icon: FaFacebookF },
    { name: 'Instagram', link: 'https://www.instagram.com/deeflaat/', icon: FaInstagram },
    { name: 'YouTube', link: 'https://www.youtube.com/@DanielAzubuine', icon: FaYoutube },
    { name: 'LinkedIn', link: 'https://www.linkedin.com/in/danielazubuine/', icon: FaLinkedin }
  ];

  return (
    <div className="flex gap-x-3 md:gap-x-8">
      {socialMediaLinks.map((link) => (
        <Link key={link.name} href={link.link} className="bg-white rounded-[50%] text-blue-600 text-lg font-bold px-3 py-3 hover:scale-110"><link.icon size={30} /></Link>
      ))}
    </div>
  )
}