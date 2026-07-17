'use client'

import { SubmitButton } from '@/components/SubmitButton'
import { addCategory } from '@/lib/actions'
import { notifyActionResult } from './notifyActionResult'

export default function CategoryForm() {
  async function action(formData: FormData) {
    const result = await addCategory(formData)
    notifyActionResult(result, {
      success: 'Category added.',
      error: 'The category could not be added.',
    })
  }

  return (
    <form className="console-form" action={action}>
      <h2>Add music category</h2>
      <div className="field-group">
        <label htmlFor="category-name">Name</label>
        <input type="text" id="category-name" name="name" required />
      </div>
      <SubmitButton buttonText="Add category" />
    </form>
  )
}
