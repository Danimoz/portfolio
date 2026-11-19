type CompositionUrl = { _id: { toString(): string }; slug?: string | null }
type SlugInput = {
  title: string
  yearOfComposition: string
  instrumentation: string
  requestedSlug?: string
  currentSlug?: string | null
}

export class CompositionSlugError extends Error {}

export function normalizeCompositionSlug(value: string) {
  return value.toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function allocateCompositionSlug(
  input: SlugInput,
  isTaken: (slug: string) => Promise<boolean>,
) {
  const requested = input.requestedSlug?.trim()
  if (!requested && input.currentSlug) return input.currentSlug

  if (requested) {
    const slug = normalizeCompositionSlug(requested)
    if (!slug || slug.length > 100 || /^[a-f0-9]{24}$/.test(slug)) {
      throw new CompositionSlugError('Use a readable URL slug of 1–100 letters, numbers, and hyphens, not a database ID.')
    }
    if (await isTaken(slug)) throw new CompositionSlugError('That composition URL is already in use, including as a previous URL. Choose another slug.')
    return slug
  }

  const base = normalizeCompositionSlug(input.title).slice(0, 70).replace(/-+$/, '') || 'composition'
  const year = normalizeCompositionSlug(input.yearOfComposition).slice(0, 10)
  const instrumentation = normalizeCompositionSlug(input.instrumentation).slice(0, 15).replace(/-+$/, '')
  const candidates = [base, [base, year].filter(Boolean).join('-'), [base, year, instrumentation].filter(Boolean).join('-')]
  for (const candidate of Array.from(new Set(candidates))) {
    if (!/^[a-f0-9]{24}$/.test(candidate) && !(await isTaken(candidate))) return candidate
  }
  const qualified = candidates[2]
  for (let edition = 2; ; edition++) {
    const candidate = `${qualified}-${edition}`
    if (!(await isTaken(candidate))) return candidate
  }
}

export function compositionPath(composition: CompositionUrl) {
  return `/music-catalog/${composition.slug || composition._id.toString()}`
}

export function compositionRedirect(composition: CompositionUrl, identifier: string) {
  return composition.slug && identifier !== composition.slug ? compositionPath(composition) : null
}

export function compositionLookup(identifier: string) {
  const alternatives: Record<string, string>[] = [{ slug: identifier }, { urlSlugs: identifier }]
  if (/^[a-f0-9]{24}$/i.test(identifier)) alternatives.push({ _id: identifier })
  return { $or: alternatives }
}

type MigrationComposition = CompositionUrl & SlugInput & { urlSlugs?: string[] }

export async function planCompositionSlugs(records: MigrationComposition[]) {
  const owners = new Map<string, string>()
  for (const record of records) {
    for (const slug of [record.slug, ...(record.urlSlugs ?? [])].filter((value): value is string => Boolean(value))) {
      const owner = owners.get(slug)
      if (owner && owner !== record._id.toString()) throw new CompositionSlugError(`The URL ${slug} belongs to more than one Composition. Resolve this before migrating.`)
      owners.set(slug, record._id.toString())
    }
  }
  const plan = []
  for (const record of records) {
    const slug = await allocateCompositionSlug({ ...record, currentSlug: record.slug }, async (candidate) => owners.has(candidate))
    owners.set(slug, record._id.toString())
    plan.push({
      _id: record._id,
      title: record.title,
      slug,
      urlSlugs: Array.from(new Set([...(record.urlSlugs ?? []), slug])),
    })
  }
  return plan
}
