import ContactForm from "./contactForm";
import AboutSlide from "./hero";
import SocialLinks from "@/components/socialLinks";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Contact Daniel Azubuine',
  description: 'Reach out to Daniel Azubuine'
}


export default function Contact(){
  return (
    <main className="container mx-auto px-6 md:px-0">
      <section className="my-4">
        <h1 className="mt-8 text-4xl font-bold relative">
          Contact Me
          <span className="absolute w-[100px] h-2 bg-blue-600 -bottom-4 left-0" />
        </h1>
      </section>

      <section className="relative py-12 md:flex gap-x-8">
        <div>
          <p className="text-lg leading-relaxed">Whether you&apos;re seeking innovative software solutions to drive your business forward or looking for beautifully crafted musical compositions to enhance your projects, I&apos;m here to collaborate with you.</p>
          <p className="text-lg mt-4 leading-relaxed">As a seasoned software engineer, I specialize in building robust applications, architecting scalable systems, and optimizing code for peak performance. 
            From designing efficient algorithms to crafting user-friendly applications, I bring a wealth of experience and a passion for problem-solving to every project. 
          </p>
          <p className="text-lg mt-4 leading-relaxed">Simultaneously, as a passionate composer with a deep understanding of musical theory and a flair for creativity, I bring creativity and emotion to every musical creation, tailoring melodies that resonate with your audience.
            From creating memorable melodies to crafting immersive soundscapes, I bring a wealth of experience and a passion for storytelling to every project.
          </p>

          <p className="text-lg mt-6 leading-relaxed">I&apos;m happy to connect with you! You can also follow me on Twitter (X), Facebook, Instagram and YouTube at the links below!<br /> 
            Don&apos;t be shy! If you have a project that you want to get started, think you need my help with something or just fancy saying hey, then get in touch.
          </p>

          <div className="mt-9">
            <SocialLinks />
          </div>
        </div>
        
        <AboutSlide />
      </section>
      
      <ContactForm />
    </main>
  )
}