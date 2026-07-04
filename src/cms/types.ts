import type { BrandLang, PageMeta } from '../brandContent'

export type CmsStatus = 'draft' | 'published'

export type CmsBlockItem = {
  id?: string
  title: string
  body?: string
  icon?: string
  accountName?: string
  displayName?: string
  logoUrl?: string
  verified?: boolean
  caption?: string
  likesSeed?: string
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  embedUrl?: string
  backgroundImageUrl?: string
  screenBackground?: {
    imageUrl?: string
    gradient?: string
  }
  socialLinks?: {
    instagram?: string
    facebook?: string
    tiktok?: string
  }
  href?: string
  label?: string
  period?: string
  shortDescription?: string
  services?: string[]
  keyMetrics?: Array<{
    value: string
    label: string
  }>
  storyDetail?: {
    challenge?: string
    solution?: string
    result?: string
  }
  ctaText?: string
}

export type CmsBlock = {
  id: string
  heading: string
  body: string
  icon?: string
  imageUrl?: string
  imageAlt?: string
  backgroundImageUrl?: string
  backgroundGradient?: string
  backgroundOverlayOpacity?: string
  ctaLabel?: string
  ctaHref?: string
  items?: CmsBlockItem[]
}

export type CmsPageContent = {
  id: string
  title: string
  status: CmsStatus
  meta: PageMeta
  blocks: CmsBlock[]
  updatedAt?: string
}

export type CmsInsightContent = {
  slug: string
  title: string
  status: CmsStatus
  meta: PageMeta
  excerpt: string
  category: string
  coverImage: string
  coverAlt: string
  datePublished: string
  dateModified: string
  sections: Array<{
    heading: string
    paragraphs: string[]
  }>
  ctaHref: string
  ctaLabel: string
  related?: string[]
  updatedAt?: string
}

export type CmsLink = {
  label: string
  href: string
}

export type CmsLocalizedSiteSettings = {
  header: {
    logoSrc: string
    logoAlt: string
    brandName: string
    tagline: string
    ctaLabel: string
    navLinks: CmsLink[]
  }
  footer: {
    logoSrc: string
    logoAlt: string
    brandName: string
    tagline: string
    description: string
    solutionsHeading: string
    solutionLinks: CmsLink[]
    navigationHeading: string
    navigationLinks: CmsLink[]
    contactHeading: string
    email: string
    chatUrl: string
    chatLabel: string
    address: string
    companyName: string
    taxCode: string
    companyAddress: string
    copyright: string
    privacyLabel: string
    privacyHref: string
    termsLabel: string
    termsHref: string
  }
}

export type CmsSiteSettings = {
  id: 'global'
  locales: Record<BrandLang, CmsLocalizedSiteSettings>
  updatedAt?: string
}
