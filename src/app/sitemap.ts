import type { MetadataRoute } from 'next'
import { getCompositions, getProjects } from '@/lib/actions'
import { absoluteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [{ data: projects }, { data: compositions }] = await Promise.all([
    getProjects(),
    getCompositions(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/projects'), lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: absoluteUrl('/music-catalog'), lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => project.story && project.slug)
    .map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.date ? new Date(project.date) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

  const compositionRoutes: MetadataRoute.Sitemap = compositions.map((composition) => ({
    url: absoluteUrl(`/music-catalog/${composition._id}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  return [...staticRoutes, ...projectRoutes, ...compositionRoutes]
}
