import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'

export const workStoryExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: false,
  }),
  Link.configure({
    autolink: true,
    defaultProtocol: 'https',
    openOnClick: false,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank',
    },
    isAllowedUri: (url, context) => {
      if (!context.defaultValidate(url)) return false
      try {
        const parsed = new URL(url, 'https://portfolio.local')
        return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
      } catch {
        return false
      }
    },
  }),
  Image.configure({
    allowBase64: false,
    HTMLAttributes: { loading: 'lazy' },
  }),
]
