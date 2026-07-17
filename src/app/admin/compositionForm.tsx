'use client'

import { SubmitButton } from '@/components/SubmitButton'
import { addComposition } from '@/lib/actions'
import type { ICategory } from '@/types'
import { notifyActionResult } from './notifyActionResult'

export default function CompositionForm({ categories }: { categories: ICategory[] }) {
  async function action(formData: FormData) {
    const result = await addComposition(formData)
    notifyActionResult(result, {
      success: 'Composition added.',
      error: 'The composition could not be added.',
    })
  }

  return (
    <form action={action} className="console-form console-form--wide">
      <h2>Add composition</h2>
      <div className="console-form__columns">
        <div className="field-group">
          <label htmlFor="composition-title">Title</label>
          <input type="text" id="composition-title" name="title" required />
        </div>
        <div className="field-group">
          <label htmlFor="composition-duration">Duration</label>
          <input type="text" id="composition-duration" name="duration" required />
        </div>
        <div className="field-group">
          <label htmlFor="composition-year">Year composed</label>
          <input type="text" id="composition-year" name="yearOfComposition" required />
        </div>
        <div className="field-group">
          <label htmlFor="composition-instrumentation">Instrumentation</label>
          <input type="text" id="composition-instrumentation" name="instrumentation" required />
        </div>
      </div>
      <div className="field-group">
        <label htmlFor="composer-note">Note from the composer</label>
        <textarea id="composer-note" name="noteFromComposer" rows={6} />
      </div>
      <div className="field-group">
        <label htmlFor="composition-text">Text</label>
        <textarea id="composition-text" name="compositionText" rows={6} />
      </div>
      <div className="field-group">
        <label htmlFor="composition-youtube">YouTube embed links</label>
        <input type="text" id="composition-youtube" name="youtubeLinks" />
        <p>Separate multiple links with commas.</p>
      </div>
      <div className="field-group">
        <label htmlFor="composition-categories">Categories</label>
        <select id="composition-categories" name="categories" multiple required>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <p>Use Control or Command to select more than one.</p>
      </div>
      <SubmitButton buttonText="Add composition" />
    </form>
  )
}
