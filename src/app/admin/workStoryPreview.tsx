'use client'

import type { RefObject } from 'react'
import Image from 'next/image'
import storyStyles from '@/app/projects/[slug]/story.module.css'
import styles from './workStoryPreview.module.css'

export type WorkStoryPreviewData = {
  name: string
  description: string
  role: string
  technologies: string[]
  image?: string
  storyHtml: string
}

type WorkStoryPreviewProps = {
  dialogRef: RefObject<HTMLDialogElement | null>
  titleId: string
  preview: WorkStoryPreviewData | null
  onClose: () => void
}

export default function WorkStoryPreview({ dialogRef, titleId, preview, onClose }: WorkStoryPreviewProps) {
  const name = preview?.name ?? 'Untitled Work Story'

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby={titleId}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          dialogRef.current?.close()
        }
      }}
    >
      <header className={styles.chrome}>
        <div>
          <span>Draft preview</span>
          <strong id={titleId}>{name}</strong>
        </div>
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Close preview
        </button>
      </header>

      <div className={styles.previewViewport}>
        <div className={storyStyles.story}>
          <header className={storyStyles.header}>
            <span className={storyStyles.backLink}>← Software Projects</span>
            <div className={storyStyles.titleRow}>
              <div>
                <p className={storyStyles.mode}>Software Work Story</p>
                <h1>{name}</h1>
              </div>
              <span className={`button ${styles.inertButton}`}>Visit project</span>
            </div>
            <p className={storyStyles.lede}>
              {preview?.description || 'Add a project description to preview the opening statement.'}
            </p>
            <dl className={storyStyles.metadata}>
              <div>
                <dt>Role</dt>
                <dd>{preview?.role || 'Role not added'}</dd>
              </div>
              <div>
                <dt>Built with</dt>
                <dd>{preview?.technologies.length ? preview.technologies.join(' · ') : 'Technologies not added'}</dd>
              </div>
            </dl>
          </header>

          {preview?.image ? (
            <figure className={storyStyles.heroMedia}>
              <Image
                src={preview.image}
                alt={`Preview of ${name}`}
                width={1600}
                height={1050}
                sizes="(max-width: 767px) 100vw, 90vw"
                unoptimized
              />
            </figure>
          ) : (
            <div className={`${storyStyles.heroMedia} ${styles.emptyMedia}`}>
              <span>Choose a project image to preview the hero.</span>
            </div>
          )}

          {preview?.storyHtml ? (
            <article
              className={storyStyles.richStory}
              aria-label={`${name} story preview`}
              dangerouslySetInnerHTML={{ __html: preview.storyHtml }}
            />
          ) : (
            <section className={styles.emptyStory} aria-label="Empty story preview">
              <h2>The story canvas is still empty.</h2>
              <p>Add a chapter and its supporting detail in the editor, then preview again.</p>
            </section>
          )}

          <footer className={storyStyles.endMatter}>
            <p>Explore the product or continue through the software archive.</p>
            <div>
              <span className={styles.previewLink}>Visit {name}</span>
              <span className={styles.previewLink}>All Software Projects</span>
            </div>
          </footer>
        </div>
      </div>
    </dialog>
  )
}
