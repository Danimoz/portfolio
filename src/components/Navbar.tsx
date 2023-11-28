'use client';

import Link from "next/link";
import { useState } from "react";
import { CiMenuFries } from "react-icons/ci";

const navbarSections = [
  { name:'Home', link: '/' },
  { name: 'Projects', link: '/projects' },
  { name: 'Music Catalog', link: '/music-catalog' },
  { name: 'Contact', link: '/contact' },
  { name: 'Blog', link: 'https://dflat.hashnode.dev/' },
]

export default function Navbar(){
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full top-0 sticky z-50">
      <nav className="h-20 py-3 bg-slate-700 bg-opacity-25">
        <div className="container mx-auto ">
          <div className="hidden md:flex space-x-4">
            {navbarSections.map((section) => (
              <Link key={section.name} href={section.link} className="p-3">{section.name}</Link>
            ))}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="mx-6">
              <CiMenuFries size={40} color='white' />
            </button>
          </div>
        </div>
      </nav>

      <div className={isMenuOpen ? 'w-full px-8 fixed top-16 bg-gray-950 text-slate-200' : 'hidden'}>
        {
          navbarSections.map((section) => (
            <Link key={section.name} href={section.link} className="block w-full p-2">{section.name}</Link>
          ))
        }
      </div>
    </header>
  )
}