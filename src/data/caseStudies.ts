export type CaseStudyMetric = {
  value: string
  label: string
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
  storyDetail: {
    challenge: string
    solution: string
    result: string
  }
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
      { value: 'x3', label: 'projected FY2026 revenue' },
      { value: '+84%', label: 'latest monthly revenue' },
    ],
    storyDetail: {
      challenge:
        'A niche, premium-priced phin product needed market education, stronger owned channels and a full online operating layer for a lean startup team.',
      solution:
        'The One ran website, Shopee and TikTok Shop operations, Meta/TikTok/Shopee Ads, 200+ micro KOL bookings, livestream commerce, seasonal bundles and social/B2B gifting pushes.',
      result:
        'The channel mix shifted from around 70% Shopee to a balanced Web 36%, Shopee 32% and Social/B2B 32% mix, with +84% monthly revenue growth, 2.68 marketing ROI in June 2026 and x3 projected FY2026 revenue.',
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
      { value: '4.42B VND', label: 'cumulative revenue' },
      { value: '20,668', label: 'products sold' },
    ],
    storyDetail: {
      challenge:
        'The brand started with no sales channels, no community, no operating data and a competitive eyewear market crowded with low-price marketplace sellers.',
      solution:
        'The One built and operated TikTok Shop, Shopee and D2C website workflows, TikTok/Meta/Shopee Ads, Gen Z content, pricing architecture, P&L tracking, cashflow control and 100+ KOL/KOC bookings.',
      result:
        'In 20 months, cota.cuti reached 4.42B VND cumulative revenue, 20,668 products sold, 37.2K TikTok followers and a stable gross margin of around 70%.',
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
      { value: '~29.8B VND', label: 'net online revenue' },
      { value: '326K+', label: 'orders across channels' },
    ],
    storyDetail: {
      challenge:
        'INKAHOLIC needed a full-stack online growth operation for a trend-led Gen Z product, while keeping channels, creators, campaigns and product launches moving together.',
      solution:
        'The One managed website, Shopee, TikTok Shop and Lazada, daily performance budgets, 1,000+ KOL/KOC and affiliate bookings, viral content formats, collection strategy, bundles and campaign spikes.',
      result:
        'The system tracked around 29.8B VND net online revenue, 326K+ orders and 886K+ items sold, while TikTok Shop grew from zero to 6.41B VND annual revenue in 2024.',
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
      { value: '25.04B VND', label: 'GMV from ads' },
      { value: '4.56', label: 'blended ROAS' },
    ],
    storyDetail: {
      challenge:
        'Books and bundled courses had a low AOV of 170K-345K VND, thin margin for CPA errors, strong exam-season demand and strict daily reporting requirements.',
      solution:
        'The One built a three-layer TikTok system: subject-led inhouse content, KOC/KOL review operations, Video Shopping, Live Shopping, GMV Max, pixel/UTM measurement and daily SKU-level reporting.',
      result:
        'Across 16 months, TikTok ads generated 25.04B VND GMV, 4.56 blended ROAS, 101,301 orders and 203M impressions, with Live Shopping ROAS holding 5.8-9.3 through 2026.',
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
      { value: '2.48B VND', label: 'peak campaign revenue' },
      { value: '~16%', label: 'ads cost / revenue' },
    ],
    storyDetail: {
      challenge:
        'A premium local watch and jewelry brand needed to coordinate online and offline channels, seasonal promotions, marketplace operations and multiple ad platforms without damaging price perception.',
      solution:
        'The One built a 5-channel promotion matrix, full-funnel Meta/TikTok/Shopee/CPAS/Google Ads planning, marketplace operation and a dashboard that compared platform data with real orders from nhanh.vn.',
      result:
        'During the 26-day Tet peak campaign, the system recorded 2.48B VND revenue with around 16% ads cost/revenue, Shopee Ads ROAS 19.7 and TikTok Ads ROAS around 3.0.',
    },
    ctaText: 'Read story',
  },
]
