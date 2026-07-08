import type { BrandLang, PageMeta } from '../brandContent'

export type CmsStatus = 'draft' | 'published'

export type CmsStatChip = {
  value: string
  label: string
  icon?: string
}

export type CmsPackageFeature = {
  label: string
  text: string
}

export type CmsLocalizedBlockFields = {
  heading?: string
  body?: string
  subtitle?: string
  closingLine1?: string
  closingLine2?: string
  ctaLabel?: string
  ctaHref?: string
  ctaSubtext?: string
  pricingNote?: string
  disclaimer?: string
  statChips?: CmsStatChip[]
}

export type CmsLocalizedBlockItemFields = {
  title?: string
  body?: string
  subtitle?: string
  label?: string
  caption?: string
  period?: string
  shortDescription?: string
  services?: string[]
  features?: CmsPackageFeature[]
  keyMetrics?: Array<{
    value: string
    label: string
    shortLabel?: string
    featured?: boolean
  }>
  ctaText?: string
  caseStudyLabel?: string
  priceLabel?: string
  priceValue?: string
  featuredStats?: CmsStatChip[]
  proofPoint?: string
  testimonialQuote?: string
  testimonialAuthor?: string
  testimonialRole?: string
  testimonialAvatar?: string
  storyDetail?: {
    challenge?: string
    solution?: string
    result?: string
  }
}

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
  avatarImages?: string[]
  thumbnailUrl?: string
  homepageGalleryImages?: string[]
  videoUrl?: string
  videoPoster?: string
  embedUrl?: string
  backgroundImageUrl?: string
  backgroundImages?: string[]
  funPhotoUrl?: string
  photoUrl?: string
  published?: boolean
  screenBackground?: {
    imageUrl?: string
    gradient?: string
  }
  socialLinks?: {
    instagram?: string
    facebook?: string
    tiktok?: string
    website?: string
  }
  href?: string
  label?: string
  caseStudyLabel?: string
  subtitle?: string
  period?: string
  shortDescription?: string
  services?: string[]
  features?: CmsPackageFeature[]
  keyMetrics?: Array<{
    value: string
    label: string
    shortLabel?: string
    featured?: boolean
  }>
  storyDetail?: {
    challenge?: string
    solution?: string
    result?: string
  }
  ctaText?: string
  caseStudyLink?: string
  priceLabel?: string
  priceValue?: string
  leftBackgroundUrl?: string
  rightBackgroundUrl?: string
  overlayOpacity?: string
  bannerImageUrl?: string
  showOnHomepage?: boolean
  homepageOrder?: string
  layoutVariant?: string
  featuredStats?: CmsStatChip[]
  proofPoint?: string
  testimonialQuote?: string
  testimonialAuthor?: string
  testimonialRole?: string
  testimonialAvatar?: string
  locales?: Partial<Record<BrandLang, CmsLocalizedBlockItemFields>>
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
  backgroundVideoUrl?: string
  backgroundVideoWebmUrl?: string
  backgroundVideoMobileUrl?: string
  backgroundVideoMobileWebmUrl?: string
  backgroundVideoPoster?: string
  subtitle?: string
  textColor?: 'light' | 'dark' | 'gradient'
  dividerShow?: boolean
  closingLine1?: string
  closingLine2?: string
  ctaLabel?: string
  ctaHref?: string
  ctaSubtext?: string
  pricingNote?: string
  disclaimer?: string
  statChips?: CmsStatChip[]
  showCtaSubtext?: boolean
  showStatChips?: boolean
  layout?: 'cards' | 'horizontal'
  autoSlideSeconds?: string
  items?: CmsBlockItem[]
  locales?: Partial<Record<BrandLang, CmsLocalizedBlockFields>>
}

export type CmsPageContent = {
  id: string
  title: string
  status: CmsStatus
  meta: PageMeta
  metaLocales?: Partial<Record<BrandLang, PageMeta>>
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
  coverImageUrl?: string
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
  visible?: boolean
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
  booking: {
    title: string
    subtitle: string
    intro: string
    frameLabel: string
    continueLabel: string
    continueDisabledLabel: string
    submitLabel: string
    successTitle: string
    successMessage: string
    successFollowup: string
    softCtaLabel: string
    softCtaHref: string
    needs: string[]
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

export type CmsAuroraBlob = {
  color: string
  alpha: number
}

export type CmsHomepageBackground = {
  mode: 'flow-wave' | 'static'
  colorLow: string
  colorHigh: string
  atmoColor: string
  atmoCount: number
  opacity: number
  flow: number
  waveHeight: number
  pointerStrength: number
  blobs: CmsAuroraBlob[]
}

export type CmsSiteSettings = {
  id: 'global'
  locales: Record<BrandLang, CmsLocalizedSiteSettings>
  homepageBackground?: Partial<CmsHomepageBackground>
  updatedAt?: string
}
