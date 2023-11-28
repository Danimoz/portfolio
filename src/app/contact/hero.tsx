'use client';

import danny from '@images/danny.jpg';
import dan from '@images/dan.jpeg'; 
import { useEffect, useState } from 'react';
import Image from 'next/image';


export default function AboutSlide(){
  const [currentImage, setCurrentImage] = useState(0);
  const images = [danny, dan];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((currentImage) => (currentImage + 1) % images.length);
    }, 6420);

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='my-8'>
      <Image src={images[currentImage]} alt='Danny' width={1240} height={355} className='h-full rounded-3xl' style={{ objectFit: 'cover' }} />
    </div>
  )  
}