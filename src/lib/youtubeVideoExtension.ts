import { mergeAttributes, Node } from '@tiptap/core'
import { getYouTubeEmbedUrl, getYouTubeVideoId } from './youtube'

export const YouTubeVideo = Node.create({
  name: 'youtubeVideo',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      videoId: {
        default: null,
        parseHTML: (element) => getYouTubeVideoId(element.getAttribute('data-youtube-video') ?? ''),
        renderHTML: () => ({}),
      },
      title: {
        default: '',
        parseHTML: (element) => element.querySelector('iframe')?.getAttribute('title') ?? '',
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-youtube-video]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const videoId = getYouTubeVideoId(String(node.attrs.videoId ?? ''))
    const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null
    const title = String(node.attrs.title ?? '').trim() || 'YouTube video'

    if (!videoId || !embedUrl) {
      return ['div', { 'data-invalid-youtube-video': 'true' }]
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-youtube-video': videoId }),
      [
        'iframe',
        {
          src: embedUrl,
          title,
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowfullscreen: 'true',
          referrerpolicy: 'strict-origin-when-cross-origin',
        },
      ],
    ]
  },
})
