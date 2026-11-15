'use client'

import { useRef, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { sendEmail } from '@/lib/actions'

export default function ContactForm({ kind = 'contact' }: { kind?: 'contact' | 'commission' }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [feedback, setFeedback] = useState('')
  const [isSending, setIsSending] = useState(false)
  const isCommission = kind === 'commission'
  const id = (field: string) => `${kind}-${field}`

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSending) return
    const formData = new FormData(event.currentTarget)
    setIsSending(true)
    setFeedback('')
    const response = await sendEmail(formData).catch(() => ({ status: 500, message: 'Your message could not be sent. Please try again.' }))
    setIsSending(false)
    if (response.status === 200) {
      const message = isCommission ? 'Your commission enquiry has been sent.' : 'Your message has been sent.'
      setFeedback(message)
      toast.success(message)
      formRef.current?.reset()
    } else {
      setFeedback(response.message)
      toast.error(response.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} method="post" className="contact-form" aria-busy={isSending}>
      <input type="hidden" name="enquiryType" value={kind} />
      <div className="field-group">
        <label htmlFor={id('name')}>Name</label>
        <input autoComplete="name" type="text" id={id('name')} name="name" maxLength={100} required />
      </div>

      <div className="field-group">
        <label htmlFor={id('email')}>Email</label>
        <input autoComplete="email" type="email" id={id('email')} name="email" maxLength={254} required />
      </div>

      {isCommission ? <>
        <div className="field-group">
          <label htmlFor={id('service')}>What would you like to commission?</label>
          <select id={id('service')} name="service" defaultValue="Not sure yet">
            <option>Not sure yet</option><option>Original composition</option><option>Arrangement</option><option>Orchestration</option>
          </select>
        </div>
        <div className="field-group">
          <label htmlFor={id('ensemble')}>Who will perform it?</label>
          <select id={id('ensemble')} name="ensemble" defaultValue="Not decided yet">
            <option>Not decided yet</option><option>Solo instrument</option><option>Soloist with accompaniment</option><option>Chamber or mixed ensemble</option><option>Solo voice or choir</option><option>Orchestra</option><option>Other</option>
          </select>
        </div>
        <div className="field-group">
          <label htmlFor={id('instrumentation')}>Instruments or voices (optional)</label>
          <input id={id('instrumentation')} name="instrumentation" maxLength={500} placeholder="For example, violin and piano, SATB choir, or full orchestra" />
        </div>
        <div className="field-group">
          <label htmlFor={id('duration')}>Approximate length (optional)</label>
          <input id={id('duration')} name="duration" maxLength={500} placeholder="For example, 5–8 minutes" />
        </div>
        <div className="field-group">
          <label htmlFor={id('deadline')}>Deadline or performance date (optional)</label>
          <input id={id('deadline')} name="deadline" maxLength={500} placeholder="A date, season, or still to be decided" />
        </div>
        <div className="field-group">
          <label htmlFor={id('budget')}>Budget, if known (optional)</label>
          <input id={id('budget')} name="budget" maxLength={500} placeholder="Include the currency, or leave open for a quote" />
        </div>
      </> : null}

      <div className="field-group">
        <label htmlFor={id('message')}>{isCommission ? 'Tell me about the music you have in mind' : 'What would you like to discuss?'}</label>
        <textarea id={id('message')} name="message" rows={7} maxLength={5000} aria-describedby={id('message-help')} required />
        <p id={id('message-help')}>{isCommission ? 'Share the occasion, musical ideas, or links to an existing piece for an arrangement or orchestration.' : 'Share a few details, any deadlines, and relevant links.'}</p>
      </div>

      <button type="submit" className="button button--primary" disabled={isSending}>
        {isSending ? 'Sending' : isCommission ? 'Send commission enquiry' : 'Send message'}
      </button>
      <p role="status" aria-live="polite">{feedback}</p>
    </form>
  )
}
