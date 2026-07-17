'use client'

import { SubmitButton } from '@/components/SubmitButton'
import { addProject, updateProject } from '@/lib/actions'
import type { IProject } from '@/types'
import { notifyActionResult } from './notifyActionResult'

export type EditableProject = Omit<IProject, '_id' | 'date'> & { _id: string }

export default function ProjectForm({ project }: { project?: EditableProject }) {
  const formId = project ? `project-${project._id}` : 'new-project'

  async function action(formData: FormData) {
    const result = project ? await updateProject(project._id, formData) : await addProject(formData)
    notifyActionResult(result, {
      success: project ? 'Project updated.' : 'Project added.',
      error: project ? 'The project could not be updated.' : 'The project could not be added.',
    })
  }

  return (
    <form action={action} className="console-form">
      <h2>{project ? `Edit ${project.name}` : 'Add software project'}</h2>
      <div className="field-group">
        <label htmlFor={`${formId}-name`}>Name</label>
        <input type="text" id={`${formId}-name`} name="name" defaultValue={project?.name} required />
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-description`}>Description</label>
        <textarea
          id={`${formId}-description`}
          name="description"
          rows={5}
          defaultValue={project?.description}
          required
        />
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-role`}>Role</label>
        <input type="text" id={`${formId}-role`} name="role" defaultValue={project?.role} required />
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-link`}>Project link</label>
        <input type="url" id={`${formId}-link`} name="link" defaultValue={project?.link} required />
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-image`}>{project ? 'Replace preview image' : 'Preview image'}</label>
        <input
          type="file"
          id={`${formId}-image`}
          name="image"
          accept="image/*"
          required={!project}
        />
        {project ? <p>Leave empty to keep the current image.</p> : null}
      </div>
      <div className="field-group">
        <label htmlFor={`${formId}-tech`}>Technologies</label>
        <input type="text" id={`${formId}-tech`} name="tech" defaultValue={project?.tech} required />
        <p>Separate technologies with commas.</p>
      </div>
      <SubmitButton
        buttonText={project ? 'Save project' : 'Add project'}
        pendingText={project ? 'Saving project' : 'Adding project'}
      />
    </form>
  )
}
