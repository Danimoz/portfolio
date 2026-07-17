import type { JSONContent } from '@tiptap/core'

export type WorkStoryChapter = {
  heading: string
  paragraphs: string[]
}

export function parseWorkStory(content: string): WorkStoryChapter[] {
  const normalized = content.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const headingPattern = /^##\s+(.+)$/gm
  const headings = Array.from(normalized.matchAll(headingPattern))

  if (!headings.length) {
    return [{ heading: 'The story', paragraphs: splitParagraphs(normalized) }]
  }

  const chapters: WorkStoryChapter[] = []
  const opening = normalized.slice(0, headings[0].index).trim()
  if (opening) chapters.push({ heading: 'Overview', paragraphs: splitParagraphs(opening) })

  headings.forEach((match, index) => {
    const bodyStart = (match.index ?? 0) + match[0].length
    const bodyEnd = headings[index + 1]?.index ?? normalized.length
    const body = normalized.slice(bodyStart, bodyEnd).trim()
    chapters.push({ heading: match[1].trim(), paragraphs: splitParagraphs(body) })
  })

  return chapters.filter((chapter) => chapter.heading && chapter.paragraphs.length)
}

function splitParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export function legacyStoryToDocument(content: string): JSONContent {
  const chapters = parseWorkStory(content)

  return {
    type: 'doc',
    content: chapters.flatMap((chapter) => [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: chapter.heading }],
      },
      ...chapter.paragraphs.map((paragraph) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: paragraph }],
      })),
    ]),
  }
}

export function hasWorkStoryContent(document: JSONContent): boolean {
  if (document.type === 'image') return Boolean(document.attrs?.src)
  if (document.type === 'youtubeVideo') return Boolean(document.attrs?.videoId)
  if (typeof document.text === 'string' && document.text.trim()) return true
  return childNodes(document).some(hasWorkStoryContent)
}

export function hasWorkStoryBody(document: JSONContent): boolean {
  if (document.type === 'heading') return false
  if (document.type === 'youtubeVideo') return Boolean(document.attrs?.videoId)
  if (['paragraph', 'codeBlock'].includes(document.type ?? '') && containsText(document)) return true
  return childNodes(document).some(hasWorkStoryBody)
}

function containsText(document: JSONContent): boolean {
  if (typeof document.text === 'string' && document.text.trim()) return true
  return childNodes(document).some(containsText)
}

export type WorkStoryImage = {
  src: unknown
  alt: unknown
}

export function getWorkStoryImages(document: JSONContent): WorkStoryImage[] {
  const current = document.type === 'image'
    ? [{ src: document.attrs?.src, alt: document.attrs?.alt }]
    : []

  return [
    ...current,
    ...childNodes(document).flatMap(getWorkStoryImages),
  ]
}

export type WorkStoryYouTubeVideo = {
  videoId: unknown
  title: unknown
}

export function getWorkStoryYouTubeVideos(document: JSONContent): WorkStoryYouTubeVideo[] {
  const current = document.type === 'youtubeVideo'
    ? [{ videoId: document.attrs?.videoId, title: document.attrs?.title }]
    : []

  return [
    ...current,
    ...childNodes(document).flatMap(getWorkStoryYouTubeVideos),
  ]
}

function childNodes(document: JSONContent): JSONContent[] {
  if (!Array.isArray(document.content)) return []
  return document.content.filter(
    (child): child is JSONContent => typeof child === 'object' && child !== null,
  )
}
