'use client';

import { useEffect, useState } from "react";

const titles = ['Software Engineer', 'Pianist', 'Composer']

export default function Title() {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0)
  const [currentTitle, setCurrentTitle] = useState('')

  useEffect(() => {
    let typingTimer: NodeJS.Timeout;

    async function typeTitle(sentence: string) {
      const letters = sentence.split('');
      for (let i = 0; i <= letters.length; i++) {
        setCurrentTitle(letters.slice(0, i).join(''));
        await new Promise((resolve) => {
          typingTimer = setTimeout(resolve, 100);
        });
      }
    }

    async function eraseTitle(sentence: string) {
      const letters = sentence.split('');
      for (let i = letters.length; i >= 0; i--) {
        setCurrentTitle(letters.slice(0, i).join(''));
        await new Promise((resolve) => {
          typingTimer = setTimeout(resolve, 50);
        });
      }
    }

    async function cycleTitles() {
      await typeTitle(titles[currentTitleIndex]);
      await new Promise((resolve) => {
        setTimeout(resolve, 1000); // Delay between titles
      });
      await eraseTitle(titles[currentTitleIndex]);
      setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % titles.length);
    }

    cycleTitles();

    return () => {
      clearTimeout(typingTimer); // Clear timer to prevent memory leaks
    };
  }, [currentTitleIndex])
  

  return (
    <div className="flex items-center">
      <p className='text-2xl tracking-[8px]'>{currentTitle}</p>
      <span className="inline-block w-1 h-9 bg-white ml-3 animate-blink"></span>
    </div>
  )
  
}