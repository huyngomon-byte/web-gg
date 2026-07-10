import type { MetadataRoute } from 'next'
import { contactMeta, localizedPath, servicesMeta, siteUrl } from '../brandContent'
import { listServerCmsInsights, listServerCmsPages } from '../cms/serverRepository'

const staticPaths = [
  '/',
  '/gg99-vn-la-gi',
  '/the-one',
  '/packages',
  '/services',
  '/contact',
  '/the-one-start',
  '/the-one-system',
  '/the-one-scale',
  '/about',
  '/chinh-sach-bao-mat',
  '/dieu-khoan-dich-vu',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, insights] = await Promise.all([listServerCmsPages(), listServerCmsInsights()])
  const cmsPaths = pages.map((page) => localizedPath('en', page.meta.path)).filter(Boolean)
  const insightPaths = insights.map((post) => `/insights/${post.slug}`)
  const paths = Array.from(new Set([...staticPaths, '/insights', ...cmsPaths, ...insightPaths]))

  const lastModifiedFallback =
    pages.find((page) => page.id === 'homepage')?.updatedAt ??
    insights[0]?.dateModified ??
    new Date().toISOString()

  return paths.map((path) => {
    const matchingPage = pages.find((page) => localizedPath('en', page.meta.path) === path)
    const matchingInsight = insights.find((post) => `/insights/${post.slug}` === path)
    const priority =
      path === '/'
        ? 1
        : path === '/packages'
          ? 0.9
          : ['/about', servicesMeta.path, contactMeta.path].includes(path)
            ? 0.7
            : path.startsWith('/insights/')
              ? 0.8
              : 0.85

    return {
      url: `${siteUrl}${path === '/' ? '/' : path}`,
      lastModified: matchingPage?.updatedAt ?? matchingInsight?.dateModified ?? lastModifiedFallback,
      changeFrequency: path.startsWith('/insights/') ? 'monthly' : 'weekly',
      priority,
    }
  })
}
