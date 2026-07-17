'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  buttonText: string
  pendingText?: string
}

export function SubmitButton({ buttonText, pendingText = 'Saving' }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="button button--primary" aria-disabled={pending} disabled={pending}>
      {pending ? pendingText : buttonText}
    </button>
  )
}
