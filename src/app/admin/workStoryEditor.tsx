'use client'

import { generateHTML, type JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { uploadStoryImage } from '@/lib/actions'
import { workStoryExtensions } from '@/lib/workStoryExtensions'
import { hasWorkStoryContent } from '@/lib/workStory'
import { getYouTubeVideoId } from '@/lib/youtube'
import styles from './workStoryEditor.module.css'
import WorkStoryPreview, { type WorkStoryPreviewData } from './workStoryPreview'

type WorkStoryEditorProps = {
  id: string
  initialContent: JSONContent
  existingImage?: string
}

export default function WorkStoryEditor({ id, initialContent, existingImage }: WorkStoryEditorProps) {
  const [document, setDocument] = useState(initialContent)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [showLinkTools, setShowLinkTools] = useState(false)
  const [showImageTools, setShowImageTools] = useState(false)
  const [showVideoTools, setShowVideoTools] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<WorkStoryPreviewData | null>(null)
  const imageInput = useRef<HTMLInputElement>(null)
  const editorShell = useRef<HTMLDivElement>(null)
  const previewDialog = useRef<HTMLDialogElement>(null)
  const previewObjectUrl = useRef<string | null>(null)
  const editor = useEditor({
    extensions: workStoryExtensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        'aria-label': 'Work Story body',
      },
    },
    onUpdate: ({ editor: currentEditor }) => setDocument(currentEditor.getJSON()),
  })

  useEffect(() => () => {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current)
  }, [])

  function openPreview() {
    const form = editorShell.current?.closest('form')
    if (!form) return

    const formData = new FormData(form)
    const textValue = (field: string) => {
      const value = formData.get(field)
      return typeof value === 'string' ? value.trim() : ''
    }
    const selectedImage = formData.get('image')

    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current)
      previewObjectUrl.current = null
    }

    let image = existingImage
    if (selectedImage instanceof File && selectedImage.size > 0) {
      image = URL.createObjectURL(selectedImage)
      previewObjectUrl.current = image
    }

    let storyHtml = ''
    try {
      storyHtml = hasWorkStoryContent(document)
        ? generateHTML(document, workStoryExtensions)
        : ''
    } catch {
      storyHtml = ''
    }

    setPreview({
      name: textValue('name') || 'Untitled Work Story',
      description: textValue('description'),
      role: textValue('role'),
      technologies: textValue('tech').split(',').map((technology) => technology.trim()).filter(Boolean),
      image,
      storyHtml,
    })

    requestAnimationFrame(() => {
      if (previewDialog.current && !previewDialog.current.open) previewDialog.current.showModal()
    })
  }

  function closePreview() {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current)
    previewObjectUrl.current = null
    setPreview(null)
  }

  function applyLink() {
    if (!editor) return
    const href = linkUrl.trim()
    if (!href) {
      editor.chain().focus().unsetLink().run()
      setShowLinkTools(false)
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    setShowLinkTools(false)
  }

  async function addImage(file?: File) {
    if (!editor || !file) return
    if (!imageAlt.trim()) {
      if (imageInput.current) imageInput.current.value = ''
      toast.error('Add a short image description before choosing the file.')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.set('image', file)
    const result = await uploadStoryImage(formData).catch(() => ({
      status: 500,
      message: 'The image upload was interrupted. Please try again.',
      url: undefined,
    }))
    setIsUploading(false)

    if (!result.url) {
      if (imageInput.current) imageInput.current.value = ''
      toast.error(result.message)
      return
    }

    editor.chain().focus().setImage({ src: result.url, alt: imageAlt.trim() }).run()
    setImageAlt('')
    setShowImageTools(false)
    if (imageInput.current) imageInput.current.value = ''
    toast.success('Image added to the story.')
  }

  function applyYouTubeVideo() {
    if (!editor) return

    const videoId = getYouTubeVideoId(videoUrl)
    if (!videoId) {
      toast.error('Paste a valid YouTube video URL.')
      return
    }

    const title = videoTitle.trim()
    if (!title) {
      toast.error('Add a short title that identifies the video.')
      return
    }

    const attributes = { videoId, title }
    if (editor.isActive('youtubeVideo')) {
      editor.chain().focus().updateAttributes('youtubeVideo', attributes).run()
      toast.success('YouTube video updated.')
    } else {
      editor.chain().focus().insertContent({ type: 'youtubeVideo', attrs: attributes }).run()
      toast.success('YouTube video added to the story.')
    }

    setVideoUrl('')
    setVideoTitle('')
    setShowVideoTools(false)
  }

  function openYouTubeTools() {
    const attributes = editor?.getAttributes('youtubeVideo') ?? {}
    setVideoUrl(attributes.videoId ? `https://youtu.be/${attributes.videoId}` : '')
    setVideoTitle(attributes.title ?? '')
    setShowLinkTools(false)
    setShowImageTools(false)
    setShowVideoTools((visible) => !visible)
  }

  const toolbarItems = [
    { label: 'Paragraph', active: editor?.isActive('paragraph'), run: () => editor?.chain().focus().setParagraph().run() },
    { label: 'H2', active: editor?.isActive('heading', { level: 2 }), run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'H3', active: editor?.isActive('heading', { level: 3 }), run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Bold', active: editor?.isActive('bold'), run: () => editor?.chain().focus().toggleBold().run() },
    { label: 'Italic', active: editor?.isActive('italic'), run: () => editor?.chain().focus().toggleItalic().run() },
    { label: 'Bullets', active: editor?.isActive('bulletList'), run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: 'Numbers', active: editor?.isActive('orderedList'), run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: 'Quote', active: editor?.isActive('blockquote'), run: () => editor?.chain().focus().toggleBlockquote().run() },
    { label: 'Code', active: editor?.isActive('codeBlock'), run: () => editor?.chain().focus().toggleCodeBlock().run() },
    { label: 'Divider', active: false, run: () => editor?.chain().focus().setHorizontalRule().run() },
  ]

  return (
    <div ref={editorShell} className={styles.editorShell}>
      <input type="hidden" id={id} name="storyDocument" value={JSON.stringify(document)} />
      <div className={styles.toolbar} role="toolbar" aria-label="Work Story formatting">
        {toolbarItems.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={Boolean(item.active)}
            className={item.active ? styles.active : undefined}
            onClick={item.run}
            disabled={!editor}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          aria-expanded={showLinkTools}
          aria-pressed={Boolean(editor?.isActive('link'))}
          onClick={() => {
            setLinkUrl(editor?.getAttributes('link').href ?? '')
            setShowImageTools(false)
            setShowVideoTools(false)
            setShowLinkTools((visible) => !visible)
          }}
          disabled={!editor}
        >
          Link
        </button>
        <button
          type="button"
          aria-expanded={showImageTools}
          onClick={() => {
            setShowLinkTools(false)
            setShowVideoTools(false)
            setShowImageTools((visible) => !visible)
          }}
          disabled={!editor || isUploading}
        >
          {isUploading ? 'Uploading…' : 'Image'}
        </button>
        <button
          type="button"
          aria-expanded={showVideoTools}
          aria-pressed={Boolean(editor?.isActive('youtubeVideo'))}
          onClick={openYouTubeTools}
          disabled={!editor}
        >
          YouTube
        </button>
        <span className={styles.toolbarSpacer} />
        <button type="button" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}>
          Undo
        </button>
        <button type="button" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}>
          Redo
        </button>
        <button type="button" className={styles.previewButton} onClick={openPreview}>
          Preview story
        </button>
      </div>

      {showLinkTools ? (
        <div className={styles.inlineTools}>
          <label htmlFor={`${id}-link`}>Link URL</label>
          <input
            id={`${id}-link`}
            type="url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://example.com"
          />
          <button type="button" onClick={applyLink}>Apply link</button>
          {editor?.isActive('link') ? (
            <button type="button" onClick={() => editor.chain().focus().unsetLink().run()}>Remove link</button>
          ) : null}
        </div>
      ) : null}

      {showImageTools ? (
        <div className={styles.inlineTools}>
          <label htmlFor={`${id}-alt`}>Image description</label>
          <input
            id={`${id}-alt`}
            type="text"
            value={imageAlt}
            onChange={(event) => setImageAlt(event.target.value)}
            placeholder="What the image shows"
          />
          <label className={styles.fileButton} htmlFor={`${id}-image`}>Choose image</label>
          <input
            ref={imageInput}
            className={styles.fileInput}
            id={`${id}-image`}
            type="file"
            accept="image/*"
            onChange={(event) => void addImage(event.target.files?.[0])}
          />
        </div>
      ) : null}

      {showVideoTools ? (
        <div className={`${styles.inlineTools} ${styles.videoTools}`}>
          <label htmlFor={`${id}-youtube-url`}>YouTube URL</label>
          <input
            id={`${id}-youtube-url`}
            type="url"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://youtu.be/â€¦"
          />
          <label htmlFor={`${id}-youtube-title`}>Video title</label>
          <input
            id={`${id}-youtube-title`}
            type="text"
            value={videoTitle}
            onChange={(event) => setVideoTitle(event.target.value)}
            placeholder="What this video demonstrates"
          />
          <button type="button" onClick={applyYouTubeVideo}>
            {editor?.isActive('youtubeVideo') ? 'Update video' : 'Add video'}
          </button>
          {editor?.isActive('youtubeVideo') ? (
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteSelection().run()
                setShowVideoTools(false)
                setVideoUrl('')
                setVideoTitle('')
              }}
            >
              Remove video
            </button>
          ) : null}
        </div>
      ) : null}

      <EditorContent
        editor={editor}
        className={styles.content}
        data-empty={!hasWorkStoryContent(document)}
      />
      <p className={styles.hint}>Use H2 for chapters and H3 for sections. Every image and video needs a useful description.</p>
      <WorkStoryPreview
        dialogRef={previewDialog}
        titleId={`${id}-preview-title`}
        preview={preview}
        onClose={closePreview}
      />
    </div>
  )
}
