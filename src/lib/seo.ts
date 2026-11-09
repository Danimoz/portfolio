export const SITE_URL = 'https://danielazubuine.me'
export const SITE_NAME = 'Daniel Azubuine'
export const DEFAULT_DESCRIPTION =
  'Daniel Azubuine is a composer, pianist, software engineer, and founder of Solfa Streams. Explore his music and software projects.'
export const DEFAULT_OG_IMAGE = '/images/hero-portrait.jpg'

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}

export function truncateDescription(value: string, maxLength = 155) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#daniel-azubuine`,
  name: 'Daniel Azubuine',
  url: SITE_URL,
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  jobTitle: ['Composer', 'Pianist', 'Software Engineer'],
  sameAs: [
    'https://twitter.com/danielazubuine',
    'https://www.facebook.com/azubuine.daniel',
    'https://www.instagram.com/deeflaat/',
    'https://www.youtube.com/@DanielAzubuine',
    'https://www.linkedin.com/in/danielazubuine/',
  ],
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  publisher: { '@id': `${SITE_URL}/#daniel-azubuine` },
}
