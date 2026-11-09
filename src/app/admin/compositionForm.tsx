'use client'

import { SubmitButton } from '@/components/SubmitButton'
import { addComposition, updateComposition } from '@/lib/actions'
import type { ICategory, IComposition } from '@/types'
import { notifyActionResult } from './notifyActionResult'

export default function CompositionForm({
  categories,
  composition,
}: {
  categories: ICategory[]
  composition?: IComposition
}) {
  const formId = composition ? `composition-${composition._id}` : 'new-composition'

  async function action(formData: FormData) {
    const result = composition
      ? await updateComposition(composition._id, formData)
      : await addComposition(formData)
    notifyActionResult(result, {
      success: composition ? 'Composition updated.' : 'Composition added.',
      error: composition
        ? 'The composition could not be updated.'
        : 'The composition could not be added.',
    })
  }

  return (
    <form action={action} className="console-form console-form--wide">
      <h2>{composition ? `Edit ${composition.title}` : 'Add composition'}</h2>
      <div className="console-form__columns">
        <div className="field-group">
          <label htmlFor={`${formId}-title`}>Title</label>
          <input
            type="text"
            id={`${formId}-title`}
            name="title"
            defaultValue={composition?.title}
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
      <SubmitButton
        buttonText={composition ? 'Save composition' : 'Add composition'}
        pendingText={composition ? 'Saving composition' : 'Adding composition'}
      />
    </form>
  )
}
