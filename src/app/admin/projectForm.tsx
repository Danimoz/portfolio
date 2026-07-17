'use client'

import { useState } from 'react'
import { SubmitButton } from '@/components/SubmitButton'
import { addProject, updateProject } from '@/lib/actions'
import type { IProject } from '@/types'
import { notifyActionResult } from './notifyActionResult'
import WorkStoryEditor from './workStoryEditor'
import { legacyStoryToDocument } from '@/lib/workStory'

export type EditableProject = Omit<IProject, '_id' | 'date'> & { _id: string }

export default function ProjectForm({ project }: { project?: EditableProject }) {
  const formId = project ? `project-${project._id}` : 'new-project'
  const [hasStory, setHasStory] = useState(Boolean(project?.story))

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
      <div className="field-group">
        <label htmlFor={`${formId}-story`}>Work Story</label>
        <select
          id={`${formId}-story`}
          name="story"
          value={hasStory ? 'true' : 'false'}
          onChange={(event) => setHasStory(event.target.value === 'true')}
        >
          <option value="false">Link directly to the project</option>
          <option value="true">Publish an internal Work Story</option>
        </select>
        <p>Projects without a Work Story keep using their external project link.</p>
      </div>
      {hasStory ? (
        <>
          <div className="field-group">
            <label htmlFor={`${formId}-slug`}>Work Story slug</label>
            <input
              type="text"
              id={`${formId}-slug`}
              name="slug"
              defaultValue={project?.slug}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="solfa-streams"
            />
            <p>Leave empty to generate it from the project name.</p>
          </div>
          <div className="field-group">
            <label htmlFor={`${formId}-story-document`}>Work Story</label>
            <WorkStoryEditor
              id={`${formId}-story-document`}
              initialContent={
                project?.storyDocument ??
                legacyStoryToDocument(project?.storyContent ?? '')
              }
              existingImage={project?.image}
            />
            <p>The authoring guide in docs/work-stories.md includes the full chapter structure.</p>
          </div>
        </>
      ) : null}
      <SubmitButton
        buttonText={project ? 'Save project' : 'Add project'}
        pendingText={project ? 'Saving project' : 'Adding project'}
      />
    </form>
  )
}
