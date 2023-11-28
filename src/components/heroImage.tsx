'use client';

import pianoMusic from '@images/pianomusic.jpg'
import software from '@images/software.jpg'
import Image from 'next/image';
import { useEffect, useState } from 'react';

const images = [pianoMusic, software]

export default function HeroImage(){
  const [currentImage, setCurrentImage] = useState(0)
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(currentImage => (currentImage + 1) % images.length)
    }, 8642)

    return () => clearInterval(interval)
  }, [])

  return(
    <div>
      <Image src={images[currentImage]} alt="Daniel's Specialty" fill priority className='polygon opacity-50 h-screen' style={{ objectFit: 'cover'}} />
    </div>
  )
}