import type { CmsBlock, CmsBlockItem } from '../cms/types'
import { caseStudies, type CaseStudy } from './caseStudies'

const caseStudiesById = new Map(caseStudies.map((story) => [story.id.toLowerCase(), story]))
const caseStudiesByBrandName = new Map(caseStudies.map((story) => [story.brandName.toLowerCase(), story]))

export function storyFromCmsItem(item: CmsBlockItem) {
  const candidates = [item.href, item.id, item.title, item.label]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)

  for (const candidate of candidates) {
    const fallback = caseStudiesById.get(candidate) ?? caseStudiesByBrandName.get(candidate)
    if (fallback) {
      const services = (item.services ?? []).map((service) => service.trim()).filter(Boolean)
      const hasCmsMetrics = Array.isArray(item.keyMetrics)
      const cmsMetrics = (item.keyMetrics ?? []).slice(0, 10).map((metric) => ({
        value: metric.value ?? '',
        label: metric.label ?? '',
        shortLabel: metric.shortLabel ?? '',
        featured: metric.featured,
        slide: metric.slide,
        display: metric.display,
        tileAnchor: metric.tileAnchor,
        from: metric.from,
        to: metric.to,
        benchmarkLabel: metric.benchmarkLabel,
        benchmarkValue: metric.benchmarkValue,
        percent: metric.percent,
        series: metric.series,
        chartCaption: metric.chartCaption,
      }))
      // Once the CMS supplies the metric collection it is authoritative, including
      // an intentionally empty collection. Do not resurrect deleted fallback KPIs.
      const keyMetrics = hasCmsMetrics
        ? cmsMetrics.filter((metric) => metric.value.trim() || metric.label.trim())
        : fallback.keyMetrics

      return {
        ...fallback,
        brandName: item.title || fallback.brandName,
        accountName: item.accountName || fallback.accountName,
        displayName: item.displayName || fallback.displayName || item.title || fallback.brandName,
        logoUrl: item.logoUrl || fallback.logoUrl,
        verified: item.verified ?? fallback.verified,
        category: item.label || fallback.category,
        period: item.period || fallback.period,
        headline: item.body || fallback.headline,
        shortDescription: item.shortDescription || fallback.shortDescription,
        caption: item.caption || fallback.caption,
        likesSeed: item.likesSeed || fallback.likesSeed,
        services: services.length ? services : fallback.services,
        keyMetrics,
        featuredStats: item.featuredStats?.length ? item.featuredStats : fallback.featuredStats,
        storyDetail: {
          challenge: item.storyDetail?.challenge || fallback.storyDetail.challenge,
          solution: item.storyDetail?.solution || fallback.storyDetail.solution,
          result: item.storyDetail?.result || fallback.storyDetail.result,
        },
        videoUrl: item.videoUrl || fallback.videoUrl,
        embedUrl: item.embedUrl || fallback.embedUrl,
        thumbnailUrl: item.thumbnailUrl || fallback.thumbnailUrl,
        homepageBannerImageUrl: item.homepageBannerImageUrl || fallback.homepageBannerImageUrl,
        homepageBannerMobileUrl: item.homepageBannerMobileUrl || fallback.homepageBannerMobileUrl,
        homepageBannerPosition: item.homepageBannerPosition || fallback.homepageBannerPosition,
        homepageBannerMobilePosition: item.homepageBannerMobilePosition || fallback.homepageBannerMobilePosition,
        homepageGalleryImages: (item.homepageGalleryImages?.length ? item.homepageGalleryImages : fallback.homepageGalleryImages) ?? [],
        backgroundImageUrl: item.backgroundImageUrl || item.imageUrl || fallback.backgroundImageUrl,
        backgroundImages: (item.backgroundImages?.length ? item.backgroundImages : fallback.backgroundImages) ?? [],
        screenBackground: {
          imageUrl: item.screenBackground?.imageUrl || fallback.screenBackground?.imageUrl || '',
          gradient: item.screenBackground?.gradient || fallback.screenBackground?.gradient || '',
        },
        socialLinks: {
          instagram: item.socialLinks?.instagram || fallback.socialLinks?.instagram || '',
          facebook: item.socialLinks?.facebook || fallback.socialLinks?.facebook || '',
          tiktok: item.socialLinks?.tiktok || fallback.socialLinks?.tiktok || '',
          website: item.socialLinks?.website || fallback.socialLinks?.website || '',
        },
        showOnHomepage: item.showOnHomepage ?? fallback.showOnHomepage,
        homepageOrder: item.homepageOrder || fallback.homepageOrder,
        layoutVariant: item.layoutVariant || fallback.layoutVariant,
        testimonialQuote: item.testimonialQuote || fallback.testimonialQuote,
        testimonialAuthor: item.testimonialAuthor || fallback.testimonialAuthor,
        testimonialRole: item.testimonialRole || fallback.testimonialRole,
        testimonialAvatar: item.testimonialAvatar || fallback.testimonialAvatar,
        ctaText: item.ctaText || fallback.ctaText,
      }
    }
  }

  return undefined
}

export function getOrderedCaseStudies(storiesBlock: CmsBlock | undefined) {
  if (!storiesBlock?.items) return caseStudies

  const ordered = (storiesBlock?.items ?? []).map(storyFromCmsItem).filter(Boolean) as CaseStudy[]
  // The CMS order is also the CMS inclusion list. A removed story must stay removed.
  return ordered
}
