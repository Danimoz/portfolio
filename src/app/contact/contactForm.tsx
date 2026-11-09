'use client'

import { useRef } from 'react'
import toast from 'react-hot-toast'
import { SubmitButton } from '@/components/SubmitButton'
import { sendEmail } from '@/lib/actions'

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)

  async function action(formData: FormData) {
    const response = await sendEmail(formData)
    if (response.status === 200) {
      toast.success('Your message has been sent.')
      formRef.current?.reset()
    } else {
      toast.error('The message could not be sent. Please try again.')
    }
  }

  return (
    <form ref={formRef} action={action} className="contact-form">
      <div className="field-group">
        <label htmlFor="name">Name</label>
        <input autoComplete="name" type="text" id="name" name="name" required />
      </div>

      <div className="field-group">
        <label htmlFor="email">Email</label>
        <input autoComplete="email" type="email" id="email" name="email" required />
      </div>

      <div className="field-group">
        <label htmlFor="message">What would you like to discuss?</label>
        <textarea id="message" name="message" rows={7} required />
        <p>Share a few details, any deadlines, and relevant links.</p>
      </div>

      <SubmitButton buttonText="Send message" pendingText="Sending" />
    </form>
  )
}
