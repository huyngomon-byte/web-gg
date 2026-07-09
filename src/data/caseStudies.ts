export type CaseStudyMetric = {
  value: string
  label: string
  shortLabel?: string
  featured?: boolean
  // Round 9: carousel slide + chart display config (from CMS)
  slide?: number
  display?: 'bignum' | 'beforeafter' | 'donut' | 'bars' | 'trend'
  from?: string
  to?: string
  benchmarkLabel?: string
  benchmarkValue?: string
  percent?: number
  // Round 10: multi-row bars ("Label:Value|Label:Value") + small caption under big charts
  series?: string
  chartCaption?: string
}

export type CaseStudy = {
  id: string
  brandName: string
  accountName?: string
  displayName?: string
  logoUrl?: string
  verified?: boolean
  category: string
  period: string
  headline: string
  shortDescription: string
  caption?: string
  likesSeed?: string
  services: string[]
  keyMetrics: CaseStudyMetric[]
  featuredStats?: CaseStudyMetric[]
  storyDetail: {
    challenge: string
    solution: string
    result: string
  }
  videoUrl?: string
  embedUrl?: string
  thumbnailUrl?: string
  homepageGalleryImages?: string[]
  backgroundImageUrl?: string
  backgroundImages?: string[]
  screenBackground?: {
    imageUrl?: string
    gradient?: string
  }
  showOnHomepage?: boolean
  homepageOrder?: string
  layoutVariant?: string
  testimonialQuote?: string
  testimonialAuthor?: string
  testimonialRole?: string
  testimonialAvatar?: string
  socialLinks?: {
    instagram?: string
    facebook?: string
    tiktok?: string
    website?: string
  }
  ctaText: string
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'phinoi',
    accountName: 'phinoi.vn',
    displayName: 'PHINOI',
    logoUrl: '/logo-phinoi.png',
    verified: true,
    brandName: 'PHINƠI',
    category: 'Vietnamese coffee culture / E-commerce growth',
    period: '07/2025 - ongoing',
    headline: 'Turning a niche phin startup into a multi-channel engine',
    shortDescription:
      'PHINƠI needed to educate a premium coffee accessory market while reducing marketplace dependence. The One operated the online P&L across owned web, Shopee, social/B2B, ads, KOLs and livestream.',
    caption: 'From niche coffee culture to a balanced owned-commerce growth engine.',
    likesSeed: '2486',
    services: ['E-commerce Management', 'Performance Ads', 'Micro KOLs', 'Livestream Commerce'],
    keyMetrics: [
      { value: '≈50%', label: 'of full-year 2025 revenue achieved in 6 low-season months of 2026', featured: true },
      { value: '×3', label: 'projected 2026 revenue vs 2025', featured: true },
      { value: '+84%', label: 'monthly revenue vs first project month' },
      { value: '×4', label: 'peak monthly revenue during gifting season' },
      { value: '0 → 36%', label: 'website became the #1 revenue channel' },
      { value: '70% → 32%', label: 'marketplace dependence reduced' },
      { value: '-74%', label: 'Shopee cancellation rate' },
      { value: '+27%', label: 'average order value' },
      { value: '200+', label: 'TikTok micro-KOLs operated' },
      { value: '5.8M+', label: 'users reached through TikTok Ads' },
    ],
    storyDetail: {
      challenge:
        'A niche, premium-priced phin product needed market education, stronger owned channels and a full online operating layer for a lean startup team.',
      solution:
        'The One ran website, Shopee and TikTok Shop operations, Meta/TikTok/Shopee Ads, 200+ micro KOL bookings, livestream commerce, seasonal bundles and social/B2B gifting pushes.',
      result:
        'The channel mix shifted from around 70% Shopee to a balanced Web 36%, Shopee 32% and Social/B2B 32% mix, with +84% monthly revenue growth, 2.68 marketing ROI in June 2026 and x3 projected FY2026 revenue.',
    },
    socialLinks: {
      website: 'https://phinoi.com',
    },
    ctaText: 'Read story',
  },
  {
    id: 'cota-cuti',
    accountName: 'cota.cuti',
    displayName: 'cota.cuti',
    logoUrl: '/logo-cotacuti.png',
    verified: true,
    brandName: 'cota.cuti',
    category: 'Gen Z eyewear / Brand & commerce launch',
    period: '09/2024 - ongoing',
    headline: 'Building a Gen Z eyewear brand from zero',
    shortDescription:
      'From launch, The One helped shape cota.cuti around commerce, content, pricing and creator operations. The work turned a young fashion idea into a measured local-brand growth system.',
    caption: 'A Gen Z eyewear brand built from zero with commerce, content and creator ops working together.',
    likesSeed: '4420',
    services: ['Go-to-market', 'E-commerce Management', 'Digital Ads', 'KOL/KOC Operations'],
    keyMetrics: [
      { value: '×35', label: 'peak monthly revenue growth', featured: true },
      { value: '×19', label: 'within the first 4 operating months', featured: true },
      { value: '×3.6', label: 'Q4 revenue YoY growth' },
      { value: '×10', label: 'peak monthly sales volume' },
      { value: '20,668', label: 'products sold in 20 months' },
      { value: '~70%', label: 'stable gross margin maintained' },
      { value: '82%', label: 'revenue from TikTok Shop built from zero' },
      { value: '100+', label: 'KOL/KOC bookings managed' },
      { value: '150+', label: 'SKUs R&D and commercialized' },
      { value: '37.2K', label: 'TikTok followers · 1.5M likes' },
    ],
    storyDetail: {
      challenge:
        'The brand started with no sales channels, no community, no operating data and a competitive eyewear market crowded with low-price marketplace sellers.',
      solution:
        'The One built and operated TikTok Shop, Shopee and D2C website workflows, TikTok/Meta/Shopee Ads, Gen Z content, pricing architecture, P&L tracking, cashflow control and 100+ KOL/KOC bookings.',
      result:
        'In 20 months, cota.cuti reached 4.42B VND cumulative revenue, 20,668 products sold, 37.2K TikTok followers and a stable gross margin of around 70%.',
    },
    socialLinks: {
      website: 'https://cotacuti.com',
    },
    ctaText: 'Read story',
  },
  {
    id: 'inkaholic',
    accountName: 'inkaholic.vn',
    displayName: 'INKAHOLIC',
    logoUrl: '/logo-inkaholic.png',
    verified: true,
    brandName: 'INKAHOLIC',
    category: 'Temporary tattoos / Full-stack e-commerce growth',
    period: '07/2020 - 11/2025',
    headline: "Scaling Vietnam's first temporary tattoo brand end to end",
    shortDescription:
      'The One operated e-commerce, ads, KOL/KOC, content and product strategy for INKAHOLIC across five years of platform shifts. A timely TikTok Shop pivot turned social attention into the main revenue engine.',
    caption: 'Five years of platform shifts, creator operations and performance discipline.',
    likesSeed: '29800',
    services: ['E-commerce Operation', 'Performance Ads', 'Influencer Machine', 'Product Strategy'],
    keyMetrics: [
      { value: '5+', label: 'years of uninterrupted end-to-end operation', featured: true },
      { value: '+35%', label: 'revenue growth & +58% order growth YoY in 2024', featured: true },
      { value: '0 → 79%', label: 'revenue share from TikTok Shop after 3 years' },
      { value: '×2.1', label: 'TikTok Shop channel scale in a single year (2024)' },
      { value: '~2×', label: 'average order value after bundle optimization' },
      { value: '+50%', label: 'basket size from 1.6 to 2.4 items/order' },
      { value: '2×', label: 'marketplace CVR vs category benchmark' },
      { value: '1,000+', label: 'KOL/KOC bookings · 90M+ tracked views' },
      { value: '326K+', label: 'multi-channel orders · 6.9M+ traffic' },
      { value: '193K+', label: 'community followers · 2.6M TikTok likes' },
    ],
    storyDetail: {
      challenge:
        'INKAHOLIC needed a full-stack online growth operation for a trend-led Gen Z product, while keeping channels, creators, campaigns and product launches moving together.',
      solution:
        'The One managed website, Shopee, TikTok Shop and Lazada, daily performance budgets, 1,000+ KOL/KOC and affiliate bookings, viral content formats, collection strategy, bundles and campaign spikes.',
      result:
        'The system tracked around 29.8B VND net online revenue, 326K+ orders and 886K+ items sold, while TikTok Shop grew from zero to 6.41B VND annual revenue in 2024.',
    },
    socialLinks: {
      website: 'https://inkaholic.vn',
    },
    ctaText: 'Read story',
  },
  {
    id: 'qanda-books',
    accountName: 'qandabooks.vn',
    displayName: 'QANDA Books',
    logoUrl: '/logo-qandabook.png',
    verified: true,
    brandName: 'QANDA Books',
    category: 'Edtech books / TikTok Commerce',
    period: '03/2025 - ongoing',
    headline: 'Making TikTok Commerce work for seasonal edtech',
    shortDescription:
      'QANDA Books had a low-AOV, seasonal exam-commerce challenge where every CPA mistake mattered. The One built the TikTok content, ads, Live Shopping, GMV Max and daily reporting rhythm around exam demand.',
    caption: 'Seasonal edtech demand turned into a daily TikTok commerce rhythm.',
    likesSeed: '25040',
    services: ['Content Strategy', 'TikTok Ads', 'Live Shopping', 'Daily Reporting'],
    keyMetrics: [
      { value: '25.04B VND', label: 'GMV attributed to TikTok ads', featured: true },
      { value: '4.56', label: 'blended ROAS across the TikTok commerce system', featured: true },
      { value: '101,301', label: 'orders generated from the operating system' },
      { value: '203M', label: 'paid impressions tracked' },
      { value: '5.8–9.3', label: 'Live Shopping ROAS range through 2026' },
      { value: '16 months', label: 'continuous TikTok commerce operation' },
      { value: '170K–345K VND', label: 'AOV range across books and course bundles' },
      { value: '3 layers', label: 'content, KOC/KOL reviews and commerce ads connected' },
      { value: 'Daily', label: 'SKU-level reporting rhythm for budget decisions' },
      { value: 'GMV Max', label: 'Video Shopping, Live Shopping and GMV Max integrated' },
    ],
    storyDetail: {
      challenge:
        'Books and bundled courses had a low AOV of 170K-345K VND, thin margin for CPA errors, strong exam-season demand and strict daily reporting requirements.',
      solution:
        'The One built a three-layer TikTok system: subject-led inhouse content, KOC/KOL review operations, Video Shopping, Live Shopping, GMV Max, pixel/UTM measurement and daily SKU-level reporting.',
      result:
        'Across 16 months, TikTok ads generated 25.04B VND GMV, 4.56 blended ROAS, 101,301 orders and 203M impressions, with Live Shopping ROAS holding 5.8-9.3 through 2026.',
    },
    socialLinks: {
      website: 'https://qandabooks.vn',
    },
    ctaText: 'Read story',
  },
  {
    id: 'curnon',
    accountName: 'curnonwatch',
    displayName: 'CURNON',
    logoUrl: '/logo-curnon.png',
    verified: true,
    brandName: 'CURNON',
    category: 'Watches & jewelry / Online-offline growth',
    period: '07/2023 - ongoing',
    headline: 'System-led growth for a premium local watch brand',
    shortDescription:
      'CURNON needed disciplined online-offline growth without eroding brand value. The One connected promotion, pricing, marketplaces, ads and real-order reporting into one operating system.',
    caption: 'Premium local watch growth with connected promotions, marketplaces and reporting.',
    likesSeed: '2480',
    services: ['Promotion & Pricing', 'Marketplace Ops', 'Multi-channel Ads', 'Dashboard Reporting'],
    keyMetrics: [
      { value: '+35%', label: 'successful orders (2024 vs 2023)', featured: true },
      { value: '+53%', label: 'products sold (2024 vs 2023)', featured: true },
      { value: '+22%', label: 'total online traffic (2024 vs 2023)' },
      { value: '-12%', label: 'advertising CAC cost (2024 vs 2023)' },
      { value: '+32%', label: 'blended ROAS efficiency (H1 2026 vs 2024)' },
      { value: '~80%', label: 'online revenue share, peaking at 84% from ~73%' },
      { value: '2,400+', label: 'KOL/KOC collaborations logged in tracker' },
      { value: '500+', label: 'zero-fee KOC videos + ~500 creators joined livestreams' },
      { value: '35+', label: 'monthly promotion plans across 4 sales platforms' },
      { value: '400K+', label: 'multi-platform social ecosystem followers' },
    ],
    storyDetail: {
      challenge:
        'A premium local watch and jewelry brand needed to coordinate online and offline channels, seasonal promotions, marketplace operations and multiple ad platforms without damaging price perception.',
      solution:
        'The One built a 5-channel promotion matrix, full-funnel Meta/TikTok/Shopee/CPAS/Google Ads planning, marketplace operation and a dashboard that compared platform data with real orders from nhanh.vn.',
      result:
        'During the 26-day Tet peak campaign, the system recorded 2.48B VND revenue with around 16% ads cost/revenue, Shopee Ads ROAS 19.7 and TikTok Ads ROAS around 3.0.',
    },
    socialLinks: {
      instagram: 'https://www.instagram.com/curnonwatch',
      facebook: 'https://www.facebook.com/curnonwatch',
      tiktok: 'https://www.tiktok.com/@curnonwatch',
      website: 'https://curnonwatch.com',
    },
    ctaText: 'Read story',
  },
  {
    id: 'annita-studios',
    accountName: 'annita.studios',
    displayName: 'ANNITA',
    logoUrl: '/logo-annita.png',
    verified: true,
    brandName: 'ANNITA STUDIOS',
    category: 'Designer eveningwear / Social commerce operating system',
    period: '02/2023 - 05/2025',
    headline: "Building a designer eveningwear brand's online business in Laos",
    shortDescription:
      'ANNITA STUDIOS launched as a local fashion startup in Vientiane with no online sales system, no operating data and no proven e-commerce playbook. The One built the strategy, reporting rhythm, Meta Ads engine, livestream workflow and handover system that the local team could keep running independently.',
    caption:
      'From launch to a self-sustaining social commerce system: ROAS x12, CIR down 92%, peak revenue x11 and 50K+ followers across three active channels.',
    likesSeed: '50000',
    services: ['Online Business Strategy', 'Meta Ads', 'Social Commerce', 'Livestream Operations'],
    keyMetrics: [
      { value: '×12', label: 'monthly ROAS lift from 1.5x to 18.3x peak (11/2023)', featured: true },
      { value: '-92%', label: 'CIR reduction from about 68% to 5.5%', featured: true },
      { value: '6.4×', label: 'average blended ROAS across the first 12 months' },
      { value: '11×+', label: 'ROAS sustained through the Q4/2023 peak quarter' },
      { value: '×12', label: 'message-to-order CVR from 1.6% to 19.2% peak' },
      { value: '×11', label: 'peak monthly revenue vs first ad-sales month' },
      { value: '2.8M+', label: '12-month cumulative page reach' },
      { value: '5,900+', label: 'ad-generated message conversations' },
      { value: '~50%', label: 'annual ad revenue from the Q4 party season' },
      { value: '50K+', label: 'followers across Facebook, Instagram and TikTok' },
    ],
    storyDetail: {
      challenge:
        'The brand started from zero in a niche Laos market: no fanpage data, no customer base, no online closing process and a limited startup budget where every ad dollar had to be accountable.',
      solution:
        'The One built an operating system around pricing, promotions, SKU planning, Meta Engagement and Message campaigns, livestream reporting, sales logs, customer database, KOL/KOC tracking and a full-funnel monthly dashboard.',
      result:
        'Within the first 12 months, monthly ROAS grew from 1.5x to an 18.3x peak, CIR fell from about 68% to 5.5%, message-to-order CVR reached 19.2% and peak monthly revenue grew 11x. After handover, the local team continued operating the system in Lao.',
    },
    thumbnailUrl: '/logo-annita.png',
    screenBackground: {
      gradient: 'linear-gradient(145deg,#120305 0%,#4f0b11 44%,#d21f2b 100%)',
    },
    showOnHomepage: true,
    homepageOrder: '5',
    socialLinks: {
      facebook: 'https://facebook.com/Annita.studio',
      instagram: 'https://instagram.com/annita.studios',
      tiktok: 'https://www.tiktok.com/@annita.studios',
    },
    ctaText: 'Read story',
  },
]
