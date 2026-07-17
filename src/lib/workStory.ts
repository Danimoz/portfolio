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
