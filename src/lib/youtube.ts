const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

export function getYouTubeVideoId(value: string): string | null {
  const input = value.trim()
  if (!input) return null
  if (YOUTUBE_VIDEO_ID.test(input)) return input

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`)
  } catch {
    return null
  }

  if (!['http:', 'https:'].includes(url.protocol)) return null

  const hostname = url.hostname.toLowerCase()
  let candidate: string | null = null

  if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
    candidate = url.pathname.split('/').filter(Boolean)[0] ?? null
  } else if (YOUTUBE_HOSTS.has(hostname)) {
    candidate = url.searchParams.get('v')
    if (!candidate) {
      const [route, id] = url.pathname.split('/').filter(Boolean)
      if (['embed', 'shorts', 'live'].includes(route)) candidate = id ?? null
    }
  }

  return candidate && YOUTUBE_VIDEO_ID.test(candidate) ? candidate : null
}

export function getYouTubeEmbedUrl(videoId: string): string | null {
  const normalizedId = getYouTubeVideoId(videoId)
  return normalizedId
    ? `https://www.youtube-nocookie.com/embed/${normalizedId}`
    : null
}
