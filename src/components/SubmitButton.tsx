'use client'
 
import { useFormStatus } from 'react-dom'
 
interface SubmitButtonProps {
  buttonText: string;
}

export function SubmitButton({ buttonText }: SubmitButtonProps) {
  const { pending } = useFormStatus()
 
  return (
    <button type="submit" aria-disabled={pending} className='px-6 py-4 rounded-xl bg-white text-blue-600 text-xl'>
      {pending? 'Loading ....' : buttonText}
    </button>
  )
}