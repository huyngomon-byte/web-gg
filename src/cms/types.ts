import type { BrandLang, PageMeta } from '../brandContent'

export type CmsStatus = 'draft' | 'published'

export type CmsStatChip = {
  value: string
  label: string
  icon?: string
}

export type CmsPackageFeature = {
  // Legacy field kept for old data; "group" supersedes it (Round 7 A4).
  label?: string
  text: string
  group?: string
  availability?: 'included' | 'excluded'
  // Featured rows appear in the compact card view (max 4); the rest live in the expander.
  featured?: boolean
}

export type CmsPackageComparisonRow = {
  label: string
  value: string
  availability?: 'included' | 'excluded'
}

export type CmsLocalizedBlockFields = {
  eyebrow?: string
  heading?: string
  body?: string
  subtitle?: string
  closingLine1?: string
  closingLine2?: string
  ctaLabel?: string
  ctaHref?: string
  ctaSubtext?: string
  heroTextAlign?: 'center' | 'left'
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
    // Round 9: Instagram-carousel slide assignment + chart display type
    slide?: number
    display?: 'bignum' | 'beforeafter' | 'donut' | 'bars' | 'trend'
    tileAnchor?: 'auto' | 'left-stack' | 'right-stack' | 'top-band' | 'split-diagonal' | 'center-low'
    from?: string
    to?: string
    benchmarkLabel?: string
    benchmarkValue?: string
    percent?: number
    // Round 10: multi-row bars ("Label:Value|Label:Value") + small caption under big charts
    series?: string
    chartCaption?: string
  }>
  ctaText?: string
  caseStudyLabel?: string
  priceLabel?: string
  priceValue?: string
  priceSupportingText?: string
  ctaMicrocopy?: string
  comparisonRows?: CmsPackageComparisonRow[]
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
  // Round 7 A3: Threads-style red-flags replies
  handle?: string
  roleLabel?: string
  likes?: string
  avatarUrl?: string
  imageUrl?: string
  imageAlt?: string
  avatarImages?: string[]
  avatarImagesMobile?: string[]
  thumbnailUrl?: string
  homepageBannerImageUrl?: string
  homepageBannerMobileUrl?: string
  homepageBannerPosition?: string
  homepageBannerMobilePosition?: string
  homepageGalleryImages?: string[]
  homepageGalleryImagesMobile?: string[]
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
    // Round 9: Instagram-carousel slide assignment + chart display type
    slide?: number
    display?: 'bignum' | 'beforeafter' | 'donut' | 'bars' | 'trend'
    tileAnchor?: 'auto' | 'left-stack' | 'right-stack' | 'top-band' | 'split-diagonal' | 'center-low'
    from?: string
    to?: string
    benchmarkLabel?: string
    benchmarkValue?: string
    percent?: number
    // Round 10: multi-row bars ("Label:Value|Label:Value") + small caption under big charts
    series?: string
    chartCaption?: string
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
  packageTier?: 'start' | 'system' | 'scale'
  priceSupportingText?: string
  ctaMicrocopy?: string
  comparisonRows?: CmsPackageComparisonRow[]
  leftBackgroundUrl?: string
  rightBackgroundUrl?: string
  overlayOpacity?: string
  bannerImageUrl?: string
  bannerImageMobileUrl?: string
  bannerImagePosition?: string
  bannerImageMobilePosition?: string
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
  eyebrow?: string
  heading: string
  body: string
  icon?: string
  imageUrl?: string
  imageAlt?: string
  backgroundImageUrl?: string
  backgroundImageMobileUrl?: string
  backgroundImagePosition?: string
  backgroundImageMobilePosition?: string
  backgroundGradient?: string
  backgroundOverlayOpacity?: string
  backgroundVideoUrl?: string
  backgroundVideoWebmUrl?: string
  backgroundVideoMobileUrl?: string
  backgroundVideoMobileWebmUrl?: string
  backgroundVideoPoster?: string
  backgroundVideoMobilePoster?: string
  heroTextAlign?: 'center' | 'left'
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
  // Round 7 A4: single merged note under the packages section (replaces pricingNote + disclaimer).
  packagesNote?: string
  // Round 7 A3: Threads-style opening post for the red-flags zone
  postHandle?: string
  postTopic?: string
  postText?: string
  statChips?: CmsStatChip[]
  showCtaSubtext?: boolean
  showStatChips?: boolean
  layout?: 'cards' | 'horizontal'
  // Round 9 A3: swipe hint pill text on slide 1 of story carousels
  swipeHintText?: string
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
    // Round 8 A6: closing serif line + booking CTA at the top of the footer
    ctaHeading?: string
    qrCaption?: string
    socials?: {
      facebook?: string
      instagram?: string
      tiktok?: string
      threads?: string
      zalo?: string
    }
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
  pointSize: number
  density: number
  scrollRise: number
  flow: number
  waveHeight: number
  pointerStrength: number
  blobs: CmsAuroraBlob[]
}

export type CmsSiteSettings = {
  id: 'global'
  locales: Record<BrandLang, CmsLocalizedSiteSettings>
  homepageBackground?: Partial<CmsHomepageBackground>
  // Round 7 A6: intro logo loader is opt-in while the PO tests; default OFF.
  introLoaderEnabled?: boolean
  updatedAt?: string
}
