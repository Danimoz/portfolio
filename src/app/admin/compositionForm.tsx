'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addComposition, updateComposition } from '@/lib/actions'
import type { ICategory, IComposition } from '@/types'
import { notifyActionResult } from './notifyActionResult'
import { normalizeCompositionSlug } from '@/lib/compositionUrls'

export default function CompositionForm({
  categories,
  composition,
}: {
  categories: ICategory[]
  composition?: IComposition
}) {
  const formId = composition ? `composition-${composition._id}` : 'new-composition'
  const [pending, setPending] = useState(false)
  const [title, setTitle] = useState(composition?.title ?? '')
  const [slug, setSlug] = useState(composition?.slug ?? '')
  const sending = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const router = useRouter()

  async function action(formData: FormData) {
    if (sending.current) return
    sending.current = true
    setPending(true)
    try {
      const result = composition
        ? await updateComposition(composition._id, formData)
        : await addComposition(formData)
      notifyActionResult(result, {
        success: composition ? 'Composition updated.' : 'Composition added.',
        error: composition ? 'The composition could not be updated.' : 'The composition could not be added.',
      })
      if (result.status < 300) {
        if (!composition) {
          form.current?.reset()
          setTitle('')
          setSlug('')
        } else if ('slug' in result && typeof result.slug === 'string') {
          setSlug(result.slug)
        }
        router.refresh()
      }
    } catch {
      notifyActionResult({ status: 500, message: 'Could not save. Your changes are still here; please try again.' }, {
        success: 'Composition saved.', error: 'Could not save the composition.',
      })
    } finally {
      sending.current = false
      setPending(false)
    }
  }

  return (
    <form ref={form} onSubmit={(event) => {
      event.preventDefault()
      void action(new FormData(event.currentTarget))
    }} className="console-form console-form--wide">
      <h2>{composition ? `Edit ${composition.title}` : 'Add composition'}</h2>
      <div className="console-form__columns">
        <div className="field-group">
          <label htmlFor={`${formId}-title`}>Title</label>
          <input
            type="text"
            id={`${formId}-title`}
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor={`${formId}-duration`}>Duration</label>
          <input
            type="text"
            id={`${formId}-duration`}
            name="duration"
            defaultValue={composition?.duration}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor={`${formId}-year`}>Year composed</label>
          <input
            type="text"
            id={`${formId}-year`}
            name="yearOfComposition"
            defaultValue={composition?.yearOfComposition}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor={`${formId}-instrumentation`}>Instrumentation</label>
          <input
            type="text"
            id={`${formId}-instrumentation`}
            name="instrumentation"
            defaultValue={composition?.instrumentation}
            required
          />
        </div>
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-slug`}>URL slug</label>
        <input
          type="text"
          id={`${formId}-slug`}
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          maxLength={100}
          spellCheck={false}
          autoCapitalize="none"
          aria-describedby={`${formId}-slug-help`}
          placeholder={normalizeCompositionSlug(title) || 'generated-from-the-title'}
        />
        <p id={`${formId}-slug-help`}>
          /music-catalog/{normalizeCompositionSlug(slug) || composition?.slug || normalizeCompositionSlug(title) || 'your-composition'}
          {' — '}{composition?.slug
            ? 'Title edits keep this URL. If you change the slug, old links will redirect.'
            : 'Leave empty to generate from the title. A year or instrumentation is added if needed.'}
        </p>
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-note`}>Note from the composer</label>
        <textarea
          id={`${formId}-note`}
          name="noteFromComposer"
          rows={6}
          defaultValue={composition?.noteFromComposer}
        />
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-text`}>Text</label>
        <textarea
          id={`${formId}-text`}
          name="compositionText"
          rows={6}
          defaultValue={composition?.compositionText}
        />
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-youtube`}>YouTube video links</label>
        <input
          type="text"
          id={`${formId}-youtube`}
          name="youtubeLinks"
          defaultValue={composition?.youtubeLinks}
        />
        <p>Separate multiple links with commas.</p>
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-score-links`}>Published score links</label>
        <textarea
          id={`${formId}-score-links`}
          name="scorePurchaseLinks"
          rows={4}
          defaultValue={composition?.scorePurchaseLinks
            ?.map((link) => `${link.label} | ${link.url}`)
            .join('\n')}
          placeholder={'Publisher name | https://publisher.example/score\nDigital edition | https://example.com/score'}
        />
        <p>Add one link per line as Publisher name | URL. Leave empty if the score is not available.</p>
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-categories`}>Categories</label>
        <select
          id={`${formId}-categories`}
          name="categories"
          multiple
          defaultValue={composition?.categories}
          required
        >
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <p>Use Control or Command to select more than one.</p>
      </div>
      <button type="submit" className="button button--primary" disabled={pending} aria-disabled={pending}>
        {pending ? 'Saving composition…' : composition ? 'Save composition' : 'Add composition'}
      </button>
    </form>
  )
}
