'use client'

import { SubmitButton } from '@/components/SubmitButton'
import { addProject } from '@/lib/actions'
import { notifyActionResult } from './notifyActionResult'

export default function ProjectForm() {
  async function action(formData: FormData) {
    const result = await addProject(formData)
    notifyActionResult(result, {
      success: 'Project added.',
      error: 'The project could not be added.',
    })
  }

  return (
    <form action={action} className="console-form">
      <h2>Add software project</h2>
      <div className="field-group">
        <label htmlFor="project-name">Name</label>
        <input type="text" id="project-name" name="name" required />
      </div>
      <div className="field-group">
        <label htmlFor="project-description">Description</label>
        <textarea id="project-description" name="description" rows={5} required />
      </div>
      <div className="field-group">
        <label htmlFor="project-role">Role</label>
        <input type="text" id="project-role" name="role" required />
      </div>
      <div className="field-group">
        <label htmlFor="project-link">Project link</label>
        <input type="url" id="project-link" name="link" required />
      </div>
      <div className="field-group">
        <label htmlFor="project-image">Preview image</label>
        <input type="file" id="project-image" name="image" accept="image/*" required />
      </div>
      <div className="field-group">
        <label htmlFor="project-tech">Technologies</label>
        <input type="text" id="project-tech" name="tech" required />
        <p>Separate technologies with commas.</p>
      </div>
      <SubmitButton buttonText="Add project" />
    </form>
  )
}
