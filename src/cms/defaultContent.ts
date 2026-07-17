import {
  aboutMetaByLang,
  compactAboutByLang,
  compactHomeByLang,
  compactPackageByLang,
  compactTheOneByLang,
  contactMeta,
  homeMetaByLang,
  insightPosts,
  servicesMeta,
} from '../brandContent'
import { caseStudies } from '../data/caseStudies'
import type { CmsBlockItem, CmsInsightContent, CmsPageContent } from './types'
export { defaultCmsSiteSettings } from './siteSettings'

const theOnePackageItems: CmsBlockItem[] = [
  {
    title: 'The One Start',
    packageTier: 'start',
    icon: 'Rocket',
    href: '/#packages',
    caseStudyLink: '/the-one#cota-cuti',
    imageUrl: '',
    body: [
      'Mới quen - xây nền digital tử tế, đều tay mỗi tuần.',
      '45 content units/month (tối thiểu 15 reels/short-form videos)',
      'Content strategy, content calendar, production, posting and optimization.',
      'Basic booking website, tối đa 10 landing pages.',
      'Performance marketing (% trên ad spend thực tế)',
      'Price: 15,000,000 VND/month',
    ].join('\n'),
    subtitle: 'Mới quen - xây nền digital tử tế, đều tay mỗi tuần.',
    features: [
      { label: 'CAPACITY', text: '45 content units/month, tối thiểu 15 reels/short-form videos.', availability: 'included' },
      { label: 'CONTENT ENGINE', text: 'Content strategy, content calendar, production, posting and optimization.', availability: 'included' },
      { label: 'WEBSITE SYSTEM', text: 'Basic booking website, tối đa 10 landing pages.', availability: 'included' },
      { label: 'PERFORMANCE MEDIA', text: 'Performance marketing theo % trên ad spend thực tế.', availability: 'included' },
      { label: 'E-COMMERCE OPS', text: 'E-commerce management (Shopee, TikTok Shop, Lazada...)', availability: 'excluded' },
      { label: 'WEBSITE SYSTEM', text: 'Unlimited landing pages', availability: 'excluded' },
    ],
    comparisonRows: [
      { label: 'Landing pages', value: '10 pages', availability: 'included' },
      { label: 'E-commerce ops', value: 'No access', availability: 'excluded' },
      { label: 'Event execution', value: 'No access', availability: 'excluded' },
    ],
    priceLabel: 'From',
    priceValue: '15,000,000 VND/month',
    leftBackgroundUrl: '',
    rightBackgroundUrl: '',
    ctaText: 'Chọn The One này',
    caseStudyLabel: 'Xem tất cả stories',
    locales: {
      en: {
        subtitle: 'For brands starting to build a consistent digital presence.',
        features: [
          { label: 'CAPACITY', text: '45 content units/month, minimum 15 reels/short-form videos.', availability: 'included' },
          { label: 'CONTENT ENGINE', text: 'Content strategy, content calendar, production, posting and optimization.', availability: 'included' },
          { label: 'WEBSITE SYSTEM', text: 'Basic booking website, up to 10 landing pages.', availability: 'included' },
          { label: 'PERFORMANCE MEDIA', text: 'Performance marketing based on actual ad spend.', availability: 'included' },
          { label: 'E-COMMERCE OPS', text: 'E-commerce management (Shopee, TikTok Shop, Lazada...)', availability: 'excluded' },
          { label: 'WEBSITE SYSTEM', text: 'Unlimited landing pages', availability: 'excluded' },
        ],
        comparisonRows: [
          { label: 'Landing pages', value: '10 pages', availability: 'included' },
          { label: 'E-commerce ops', value: 'No access', availability: 'excluded' },
          { label: 'Event execution', value: 'No access', availability: 'excluded' },
        ],
        priceLabel: 'From',
        priceValue: '15,000,000 VND/month',
        body: [
          'For brands starting to build a consistent digital presence.',
          '45 content units/month (minimum 15 reels/short-form videos)',
          'Content strategy, content calendar, production, posting and optimization.',
          'Basic booking website, up to 10 landing pages.',
          'Performance marketing (% of actual ad spend)',
          'Price: 15,000,000 VND/month',
        ].join('\n'),
        ctaText: 'Pick this One',
        caseStudyLabel: 'View all stories',
      },
    },
  },
  {
    title: 'The One System',
    packageTier: 'system',
    label: 'Được chọn nhiều nhất',
    icon: 'Workflow',
    href: '/#packages',
    caseStudyLink: '/the-one#curnon',
    imageUrl: '',
    body: [
      'Về chung nhà - content, web và ads chạy như một hệ thống.',
      '60 content units/month (tối thiểu 20 reels/short-form videos)',
      'Content strategy, content calendar, production, posting and optimization.',
      'Booking/sales website, unlimited landing pages.',
      'Performance marketing (% trên ad spend thực tế)',
      'Price: 30,000,000 VND/month',
    ].join('\n'),
    subtitle: 'Về chung nhà - content, web và ads chạy như một hệ thống.',
    features: [
      { label: 'CAPACITY', text: '60 content units/month, tối thiểu 20 reels/short-form videos.', availability: 'included' },
      { label: 'CONTENT ENGINE', text: 'Content strategy, content calendar, production, posting and optimization.', availability: 'included' },
      { label: 'ECOMMERCE OPS', text: 'E-commerce management (Shopee, TikTok Shop, Lazada...)', availability: 'included' },
      { label: 'WEBSITE SYSTEM', text: 'Booking/sales website, unlimited landing pages.', availability: 'included' },
      { label: 'PERFORMANCE MEDIA', text: 'Performance marketing theo % trên ad spend thực tế.', availability: 'included' },
    ],
    comparisonRows: [
      { label: 'Landing pages', value: 'Unlimited', availability: 'included' },
      { label: 'E-commerce ops', value: 'Full access', availability: 'included' },
      { label: 'Event execution', value: 'No access', availability: 'excluded' },
    ],
    priceLabel: 'From',
    priceValue: '30,000,000 VND/month',
    priceSupportingText: 'All-in-one: content + web + ads',
    leftBackgroundUrl: '',
    rightBackgroundUrl: '',
    ctaText: 'Chọn The One này',
    caseStudyLabel: 'Xem tất cả stories',
    locales: {
      en: {
        label: 'Most Popular',
        subtitle: 'For brands that need content, website and paid media running as one stable system.',
        features: [
          { label: 'CAPACITY', text: '60 content units/month, minimum 20 reels/short-form videos.', availability: 'included' },
          { label: 'CONTENT ENGINE', text: 'Content strategy, content calendar, production, posting and optimization.', availability: 'included' },
          { label: 'ECOMMERCE OPS', text: 'E-commerce management (Shopee, TikTok Shop, Lazada...)', availability: 'included' },
          { label: 'WEBSITE SYSTEM', text: 'Booking/sales website, unlimited landing pages.', availability: 'included' },
          { label: 'PERFORMANCE MEDIA', text: 'Performance marketing based on actual ad spend.', availability: 'included' },
        ],
        comparisonRows: [
          { label: 'Landing pages', value: 'Unlimited', availability: 'included' },
          { label: 'E-commerce ops', value: 'Full access', availability: 'included' },
          { label: 'Event execution', value: 'No access', availability: 'excluded' },
        ],
        priceLabel: 'From',
        priceValue: '30,000,000 VND/month',
        priceSupportingText: 'All-in-one: content + web + ads',
        body: [
          'For brands that need content, website and paid media running as one stable system.',
          '60 content units/month (minimum 20 reels/short-form videos)',
          'Content strategy, content calendar, production, posting and optimization.',
          'Booking/sales website, unlimited landing pages.',
          'Performance marketing (% of actual ad spend)',
          'Price: 30,000,000 VND/month',
        ].join('\n'),
        ctaText: 'Pick this One',
        caseStudyLabel: 'View all stories',
      },
    },
  },
  {
    title: 'The One Scale',
    packageTier: 'scale',
    label: 'CUSTOM',
    icon: 'Megaphone',
    href: '/#packages',
    caseStudyLink: '/the-one#inkaholic',
    imageUrl: '',
    body: [
      'Tính chuyện lâu dài - chiến dịch lớn, mục tiêu doanh thu cụ thể.',
      'Everything included in The One System.',
      'Support planning and running on-site events.',
      'Campaign strategy, creative direction, media planning and performance optimization.',
      'Performance marketing (% trên ad spend thực tế)',
      'Price: Custom package — based on project scope.',
    ].join('\n'),
    subtitle: 'Tính chuyện lâu dài - chiến dịch lớn, mục tiêu doanh thu cụ thể.',
    features: [
      { label: 'SYSTEM BASE', text: 'Everything included in The One System.', availability: 'included' },
      { label: 'EVENT OPS', text: 'On-site event planning and execution.', availability: 'included' },
      { label: 'CAMPAIGN GROWTH', text: 'Campaign strategy, creative direction, media planning.', availability: 'included' },
      { label: 'DELIVERABLES', text: 'Might be cheaper than The One Start 😉', availability: 'included' },
    ],
    comparisonRows: [
      { label: 'Landing pages', value: 'Unlimited', availability: 'included' },
      { label: 'E-commerce ops', value: 'Full access', availability: 'included' },
      { label: 'Event execution', value: 'On-site', availability: 'included' },
    ],
    priceLabel: 'Custom',
    priceValue: 'Custom package',
    priceSupportingText: 'based on project scope.',
    leftBackgroundUrl: '',
    rightBackgroundUrl: '',
    ctaText: 'Chọn The One này',
    caseStudyLabel: 'Xem tất cả stories',
    locales: {
      en: {
        label: 'CUSTOM',
        subtitle: 'For brands ready for strong growth: large campaigns, event execution, branch expansion or specific revenue targets.',
        features: [
          { label: 'SYSTEM BASE', text: 'Everything included in The One System.', availability: 'included' },
          { label: 'EVENT OPS', text: 'On-site event planning and execution.', availability: 'included' },
          { label: 'CAMPAIGN GROWTH', text: 'Campaign strategy, creative direction, media planning.', availability: 'included' },
          { label: 'DELIVERABLES', text: 'Might be cheaper than The One Start 😉', availability: 'included' },
        ],
        comparisonRows: [
          { label: 'Landing pages', value: 'Unlimited', availability: 'included' },
          { label: 'E-commerce ops', value: 'Full access', availability: 'included' },
          { label: 'Event execution', value: 'On-site', availability: 'included' },
        ],
        priceLabel: 'Custom',
        priceValue: 'Custom package',
        priceSupportingText: 'based on project scope.',
        body: [
          'For brands ready for strong growth: large campaigns, event execution, branch expansion or specific revenue targets.',
          'Everything included in The One System.',
          'Support planning and running on-site events.',
          'Campaign strategy, creative direction, media planning and performance optimization.',
          'Performance marketing (% of actual ad spend)',
          'Price: Custom package — based on project scope.',
        ].join('\n'),
        ctaText: 'Pick this One',
        caseStudyLabel: 'View all stories',
      },
    },
  },
]

const theOnePeopleItems: CmsBlockItem[] = [
  {
    title: 'Smooth',
    label: 'Founder / Growth Architect / CRM / Commerce',
    body: 'Trung thành là đường hai chiều. Mình đòi hỏi nó từ bạn, thì bạn cũng nhận được nó từ mình.',
    proofPoint: '5 năm cùng INKAHOLIC, 0 -> 326K+ đơn hàng.',
    imageUrl: '/logo-gg.png',
    funPhotoUrl: '/logo-gg.png',
    bannerImageUrl: '/logo-gg.png',
    thumbnailUrl: '/logo-gg.png',
    avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'],
    locales: {
      en: {
        label: 'Founder / Growth Architect',
        body: 'Loyalty is a two-way street. If I ask it from you, you get it back from me.',
        proofPoint: '5 years with INKAHOLIC, 0 -> 326K+ orders.',
      },
    },
  },
  {
    title: 'Creative One',
    label: 'Content / Scripts / Visuals / Social rhythm',
    body: 'Content không phải đăng cho có. Content phải khiến người xem nhớ, hỏi, rồi mua.',
    proofPoint: 'Vận hành nội dung ngắn hạn cho nhiều brand Gen Z.',
    imageUrl: '/logo-gg.png',
    funPhotoUrl: '/logo-gg.png',
    bannerImageUrl: '/logo-gg.png',
    thumbnailUrl: '/logo-gg.png',
    avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'],
    locales: {
      en: {
        label: 'Content Lead',
        body: 'Content is not posting for the sake of posting. It should make people remember, ask, then buy.',
        proofPoint: 'Short-form content rhythm across Gen Z brands.',
      },
    },
  },
  {
    title: 'Performance One',
    label: 'Paid media / Reporting / Experiments / Revenue',
    body: 'Số xấu vẫn phải đưa. Vì số xấu giấu đi thì tiền của bạn mới là thứ biến mất.',
    proofPoint: 'Theo dõi ads, ROAS, CPA và dashboard hằng tuần.',
    imageUrl: '/logo-gg.png',
    funPhotoUrl: '/logo-gg.png',
    bannerImageUrl: '/logo-gg.png',
    thumbnailUrl: '/logo-gg.png',
    avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'],
    locales: {
      en: {
        label: 'Media Lead',
        body: 'Bad numbers still need to be shown. If they are hidden, your money is what disappears.',
        proofPoint: 'Weekly ads, ROAS, CPA and dashboard operation.',
      },
    },
  },
  {
    title: 'System One',
    label: 'Website / CRM / Funnel / Automation',
    body: 'Một landing page tốt không chỉ đẹp. Nó biết khách đang sợ gì và trả lời đúng lúc.',
    proofPoint: 'Xây web, funnel và CRM flow cho các đội lean.',
    imageUrl: '/logo-gg.png',
    funPhotoUrl: '/logo-gg.png',
    bannerImageUrl: '/logo-gg.png',
    thumbnailUrl: '/logo-gg.png',
    avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'],
    locales: {
      en: {
        label: 'Website / CRM',
        body: 'A good landing page is not only pretty. It knows what customers fear and answers at the right moment.',
        proofPoint: 'Web, funnel and CRM flows for lean teams.',
      },
    },
  },
  {
    title: 'Commerce One',
    label: 'Marketplace / Launches / Bundles / Campaign mechanics',
    body: 'Sàn không tự lớn. Mỗi bundle, mỗi live, mỗi mã giảm giá đều phải có lý do.',
    proofPoint: 'Vận hành Shopee, TikTok Shop, bundles và launch calendar.',
    imageUrl: '/logo-gg.png',
    funPhotoUrl: '/logo-gg.png',
    bannerImageUrl: '/logo-gg.png',
    thumbnailUrl: '/logo-gg.png',
    avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'],
    locales: {
      en: {
        label: 'Marketplace Ops',
        body: 'Marketplaces do not grow by themselves. Every bundle, live and discount needs a reason.',
        proofPoint: 'Shopee, TikTok Shop, bundles and launch calendar operation.',
      },
    },
  },
  {
    title: 'Data One',
    label: 'Dashboard / Insight / KPI / Decision system',
    body: 'Data phải nói được chuyện kinh doanh. Nếu chỉ đẹp trong sheet, nó chưa giúp ai quyết định.',
    proofPoint: 'Biến tín hiệu rời rạc thành dashboard dùng được mỗi tuần.',
    imageUrl: '/logo-gg.png',
    funPhotoUrl: '/logo-gg.png',
    bannerImageUrl: '/logo-gg.png',
    thumbnailUrl: '/logo-gg.png',
    avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'],
    locales: {
      en: {
        label: 'Dashboard / Insight',
        body: 'Data should speak business. If it only looks good in a sheet, it has not helped anyone decide.',
        proofPoint: 'Turns scattered signals into weekly operating dashboards.',
      },
    },
  },
]

const contactItems: CmsBlockItem[] = [
  { title: 'Email', body: 'smooth@gg99.vn', href: 'mailto:smooth@gg99.vn', icon: 'Mail' },
  { title: 'Chat', body: 'Zalo', href: 'https://zalo.me/smoothgg', icon: 'MessageCircle' },
  { title: 'Office', body: 'Hanoi, Vietnam', icon: 'Target' },
]

const servicesMetaVi = {
  ...servicesMeta,
  title: 'Services | The One - GG99',
  description:
    'Các dịch vụ của The One - GG99: brand, website, CRM, marketing automation và performance marketing trong một hệ tăng trưởng kết nối.',
  path: '/services',
  ogDescription:
    'Brand, website, CRM, automation và performance marketing trong một hệ tăng trưởng kết nối.',
}

const contactMetaVi = {
  ...contactMeta,
  title: 'Contact | The One - GG99',
  description:
    'Liên hệ The One - GG99 để xây thương hiệu, website, CRM, automation và performance marketing trong một hệ sinh thái.',
  path: '/contact',
  ogDescription: 'Liên hệ GG99 để bắt đầu buổi hẹn đầu tiên với The One.',
}

const packageDetailDefinitions = [
  { id: 'the-one-start', key: 'consultant' },
  { id: 'the-one-system', key: 'agency' },
  { id: 'the-one-scale', key: 'partner' },
] as const

const packageDetailPages: CmsPageContent[] = packageDetailDefinitions.map(({ id, key }) => {
  const page = compactPackageByLang.vi[key]
  const pageEn = compactPackageByLang.en[key]
  return {
    id,
    title: page.h1,
    status: 'published',
    meta: { ...page.meta, path: `/${id}` },
    metaLocales: {
      en: pageEn.meta,
    },
    blocks: [
      {
        id: 'hero',
        heading: page.h1,
        body: `${page.hero}\n\n${page.intro}`,
        imageUrl: '/logo-gg.png',
        imageAlt: page.h1,
        locales: {
          en: {
            heading: pageEn.h1,
            body: `${pageEn.hero}\n\n${pageEn.intro}`,
          },
        },
      },
      {
        id: 'cards',
        heading: 'Bạn nhận được gì',
        body: '',
        items: page.cards.map((card, index) => ({
          title: card.title,
          body: card.text,
          icon: ['ClipboardCheck', 'Megaphone', 'Users', 'ShoppingCart', 'Target', 'Route'][index] ?? 'BadgeCheck',
          locales: {
            en: {
              title: pageEn.cards[index]?.title ?? card.title,
              body: pageEn.cards[index]?.text ?? card.text,
            },
          },
        })),
        locales: {
          en: {
            heading: 'What you get',
          },
        },
      },
      {
        id: 'process',
        heading: 'Quy trình',
        body: '',
        items: page.process.map((step, index) => ({
          title: step.title,
          body: step.text,
          icon: String(index + 1).padStart(2, '0'),
          locales: {
            en: {
              title: pageEn.process[index]?.title ?? step.title,
              body: pageEn.process[index]?.text ?? step.text,
            },
          },
        })),
        locales: {
          en: {
            heading: 'Process',
          },
        },
      },
    ],
  }
})

const storyVietnameseCopy: Record<string, Partial<CmsBlockItem>> = {
  phinoi: {
    label: 'Văn hóa cà phê Việt / Tăng trưởng e-commerce',
    body: 'Biến một startup phin ngách thành cỗ máy đa kênh',
    shortDescription:
      'PHINƠI cần giáo dục thị trường cho sản phẩm phin cao cấp và giảm phụ thuộc marketplace. The One vận hành P&L online qua website, Shopee, social/B2B, ads, KOL và livestream.',
    caption: 'Từ văn hóa cà phê ngách thành một growth engine owned-commerce cân bằng.',
    featuredStats: [
      { value: '≈50%', label: 'doanh thu cả năm 2025 đạt trong 6 tháng thấp điểm 2026' },
      { value: '×3', label: 'doanh thu dự kiến 2026 so với 2025' },
    ],
    keyMetrics: [
      { value: '≈50%', label: 'doanh thu cả năm 2025 đạt trong 6 tháng thấp điểm 2026', featured: true },
      { value: '×3', label: 'doanh thu dự kiến 2026 so với 2025', featured: true },
      { value: '+84%', label: 'doanh thu tháng so với tháng đầu dự án' },
      { value: '×4', label: 'doanh thu tháng cao điểm mùa quà tặng' },
      { value: '0 → 36%', label: 'website thành kênh doanh thu số 1' },
      { value: '70% → 32%', label: 'giảm phụ thuộc một sàn TMĐT' },
      { value: '-74%', label: 'tỷ lệ hủy đơn trên Shopee' },
      { value: '+27%', label: 'giá trị trung bình mỗi đơn hàng' },
      { value: '200+', label: 'micro KOLs TikTok được vận hành' },
      { value: '5.8M+', label: 'người dùng tiếp cận qua TikTok Ads' },
    ],
    storyDetail: {
      challenge:
        'Một sản phẩm phin cao cấp, ngách và cần giáo dục thị trường phải xây owned channel mạnh hơn cùng một lớp vận hành online đầy đủ cho team startup tinh gọn.',
      solution:
        'The One vận hành website, Shopee, TikTok Shop, Meta/TikTok/Shopee Ads, 200+ micro KOL, livestream commerce, bundle theo mùa và các push social/B2B gifting.',
      result:
        'Channel mix chuyển từ khoảng 70% Shopee sang Web 36%, Shopee 32% và Social/B2B 32%, doanh thu tháng gần nhất tăng 84%, marketing ROI tháng 06/2026 đạt 2.68 và FY2026 dự phóng x3.',
    },
    testimonialQuote: 'The One giúp tụi mình nhìn e-commerce như một hệ vận hành, không chỉ là vài campaign rời rạc.',
    testimonialAuthor: 'PHINƠI team',
    testimonialRole: 'Founder office',
  },
  'cota-cuti': {
    label: 'Kính Gen Z / Brand & commerce launch',
    body: 'Nuôi một brand kính Gen Z từ con số 0',
    shortDescription:
      'Ngay từ launch, The One giúp cota.cuti định hình commerce, content, pricing và creator operations, biến một ý tưởng thời trang trẻ thành hệ tăng trưởng local brand có đo lường.',
    caption: 'Một brand kính Gen Z được xây từ số 0 với commerce, content và creator ops chạy cùng nhau.',
    featuredStats: [
      { value: 'x35', label: 'doanh thu đỉnh' },
      { value: 'x19', label: 'sau 4 tháng đầu' },
    ],
    keyMetrics: [
      { value: '×35', label: 'tăng trưởng doanh thu tháng cao điểm', featured: true },
      { value: '×19', label: 'chỉ sau 4 tháng đầu vận hành', featured: true },
      { value: '×3,6', label: 'doanh thu Q4 tăng trưởng YoY' },
      { value: '×10', label: 'sản lượng bán ra tháng cao điểm' },
      { value: '20.668', label: 'sản phẩm bán ra trong 20 tháng' },
      { value: '~70%', label: 'biên lợi nhuận gộp duy trì ổn định' },
      { value: '82%', label: 'doanh thu từ TikTok Shop xây từ con số 0' },
      { value: '100+', label: 'KOL/KOC booking và quản lý' },
      { value: '150+', label: 'SKU được R&D và thương mại hóa' },
      { value: '37,2K', label: 'followers TikTok · 1,5M lượt thích' },
    ],
    storyDetail: {
      challenge:
        'Brand bắt đầu với không kênh bán, không cộng đồng, không dữ liệu vận hành và thị trường kính cạnh tranh dày đặc người bán giá thấp trên marketplace.',
      solution:
        'The One xây và vận hành TikTok Shop, Shopee, website D2C, TikTok/Meta/Shopee Ads, content Gen Z, pricing architecture, P&L tracking, cashflow control và 100+ booking KOL/KOC.',
      result:
        'Trong 20 tháng, cota.cuti đạt 4.42B VND doanh thu lũy kế, 20,668 sản phẩm bán ra, 37.2K follower TikTok và gross margin ổn định khoảng 70%.',
    },
    testimonialQuote: 'Từ một ý tưởng kính nhỏ, tụi mình có một hệ bán hàng thật sự nhìn được số mỗi ngày.',
    testimonialAuthor: 'cota.cuti team',
    testimonialRole: 'Founder office',
  },
  inkaholic: {
    label: 'Temporary tattoos / Full-stack e-commerce growth',
    body: 'Scale thương hiệu tattoo dán đầu tiên tại Việt Nam từ end to end',
    shortDescription:
      'The One vận hành e-commerce, ads, KOL/KOC, content và product strategy cho INKAHOLIC suốt 5 năm platform thay đổi. Cú pivot TikTok Shop đúng lúc biến social attention thành revenue engine chính.',
    caption: '5 năm platform shifts, creator operations và performance discipline.',
    featuredStats: [
      { value: '5+', label: 'năm vận hành end-to-end' },
      { value: '+35%', label: 'doanh thu YoY 2024' },
    ],
    keyMetrics: [
      { value: '5+', label: 'năm vận hành end-to-end, không gián đoạn', featured: true },
      { value: '+35%', label: 'doanh thu & +58% đơn hàng YoY (2024)', featured: true },
      { value: '0 → 79%', label: 'tỷ trọng doanh thu từ TikTok Shop sau 3 năm' },
      { value: '×2.1', label: 'quy mô kênh TikTok Shop chỉ trong 1 năm (2024)' },
      { value: '~2×', label: 'giá trị đơn hàng trung bình sau tối ưu combo' },
      { value: '+50%', label: 'số sản phẩm mỗi đơn (1.6 → 2.4 items/order)' },
      { value: '2×', label: 'tỷ lệ chuyển đổi vs benchmark ngành trên sàn' },
      { value: '1,000+', label: 'booking KOL/KOC · 90M+ views tracked' },
      { value: '326K+', label: 'đơn hàng đa kênh · 6.9M+ traffic' },
      { value: '193K+', label: 'followers cộng đồng · 2.6M likes TikTok' },
    ],
    storyDetail: {
      challenge:
        'INKAHOLIC cần một lớp vận hành online full-stack cho sản phẩm Gen Z theo trend, đồng thời giữ kênh, creator, campaign và product launch chạy cùng một nhịp.',
      solution:
        'The One quản lý website, Shopee, TikTok Shop, Lazada, ngân sách performance hằng ngày, 1,000+ booking KOL/KOC và affiliate, format viral, collection strategy, bundles và campaign spikes.',
      result:
        'Hệ thống ghi nhận khoảng 29.8B VND net online revenue, 326K+ đơn và 886K+ sản phẩm bán ra, trong khi TikTok Shop tăng từ 0 lên 6.41B VND doanh thu năm 2024.',
    },
    testimonialQuote: 'The One vận hành như người trong nhà, đủ gần để thấy vấn đề trước khi nó thành khủng hoảng.',
    testimonialAuthor: 'INKAHOLIC team',
    testimonialRole: 'Founder office',
  },
  'qanda-books': {
    label: 'Sách EdTech / TikTok Commerce',
    body: 'Làm TikTok Commerce hiệu quả cho ngành sách mùa vụ',
    shortDescription:
      'QANDA Books có bài toán exam-commerce AOV thấp, mùa vụ mạnh và CPA sai một chút là đau ngay. The One xây hệ TikTok content, ads, Live Shopping, GMV Max và reporting hằng ngày quanh nhu cầu mùa thi.',
    caption: 'Nhu cầu mùa thi được biến thành nhịp TikTok commerce hằng ngày.',
    featuredStats: [
      { value: '25.04B VND', label: 'GMV từ ads' },
      { value: '4.56', label: 'blended ROAS' },
    ],
    keyMetrics: [
      { value: '25.04B VND', label: 'GMV ghi nhận từ TikTok Ads', featured: true },
      { value: '4.56', label: 'blended ROAS toàn hệ TikTok commerce', featured: true },
      { value: '101,301', label: 'đơn hàng tạo ra từ hệ vận hành' },
      { value: '203M', label: 'paid impressions được tracking' },
      { value: '5.8–9.3', label: 'dải ROAS Live Shopping trong 2026' },
      { value: '16 tháng', label: 'vận hành TikTok commerce liên tục' },
      { value: '170K–345K VND', label: 'AOV theo sách và combo khóa học' },
      { value: '3 lớp', label: 'content, KOC/KOL review và commerce ads kết nối' },
      { value: 'Hằng ngày', label: 'report SKU-level để ra quyết định ngân sách' },
      { value: 'GMV Max', label: 'Video Shopping, Live Shopping và GMV Max tích hợp' },
    ],
    storyDetail: {
      challenge:
        'Sách và combo khóa học có AOV 170K-345K VND, biên sai số CPA mỏng, nhu cầu mùa thi mạnh và yêu cầu báo cáo hằng ngày nghiêm ngặt.',
      solution:
        'The One xây hệ TikTok ba lớp: content inhouse theo môn, KOC/KOL review, Video Shopping, Live Shopping, GMV Max, pixel/UTM measurement và reporting SKU-level hằng ngày.',
      result:
        'Trong 16 tháng, TikTok ads tạo 25.04B VND GMV, 4.56 blended ROAS, 101,301 đơn và 203M impressions; Live Shopping ROAS giữ 5.8-9.3 trong 2026.',
    },
    testimonialQuote: 'Điều đáng giá nhất là tụi mình biết mỗi ngày tiền ads đang đi đâu và SKU nào đang thật sự kéo doanh thu.',
    testimonialAuthor: 'QANDA Books team',
    testimonialRole: 'Commerce team',
  },
  curnon: {
    label: 'Đồng hồ & trang sức / Online-offline growth',
    body: 'Tăng trưởng có hệ thống cho một local watch brand cao cấp',
    shortDescription:
      'CURNON cần tăng trưởng online-offline có kỷ luật mà không làm mòn brand value. The One nối promotion, pricing, marketplace, ads và real-order reporting thành một hệ vận hành.',
    caption: 'Premium local watch growth với promotion, marketplace và reporting kết nối.',
    featuredStats: [
      { value: '+35%', label: 'đơn hàng thành công' },
      { value: '+53%', label: 'sản phẩm bán ra' },
    ],
    keyMetrics: [
      { value: '+35%', label: 'đơn hàng thành công (2024 vs 2023)', featured: true },
      { value: '+53%', label: 'sản phẩm bán ra (2024 vs 2023)', featured: true },
      { value: '+22%', label: 'tổng traffic online (2024 vs 2023)' },
      { value: '-12%', label: 'chi phí CAC quảng cáo (2024 vs 2023)' },
      { value: '+32%', label: 'hiệu suất ROAS blended (6T/2026 vs 2024)' },
      { value: '~80%', label: 'tỷ trọng doanh thu online, đỉnh 84% từ mức ~73%' },
      { value: '2,400+', label: 'lượt hợp tác KOL/KOC ghi nhận trên tracker' },
      { value: '500+', label: 'video KOC booking 0đ + ~500 KOL join livestream' },
      { value: '35+', label: 'kế hoạch promotion tháng đồng bộ 4 nền tảng bán' },
      { value: '400K+', label: 'followers hệ sinh thái social đa nền tảng' },
    ],
    storyDetail: {
      challenge:
        'Một brand đồng hồ và trang sức cao cấp cần phối hợp online-offline, seasonal promotion, marketplace operations và nhiều ad platform mà không phá perception về giá.',
      solution:
        'The One xây ma trận promotion 5 kênh, full-funnel Meta/TikTok/Shopee/CPAS/Google Ads planning, marketplace operation và dashboard so sánh data nền tảng với đơn thật từ nhanh.vn.',
      result:
        'Trong campaign Tết 26 ngày, hệ thống ghi nhận 2.48B VND doanh thu với khoảng 16% ads cost/revenue, Shopee Ads ROAS 19.7 và TikTok Ads ROAS khoảng 3.0.',
    },
    testimonialQuote: 'The One giúp tụi mình tăng trưởng mà vẫn giữ được kỷ luật thương hiệu.',
    testimonialAuthor: 'CURNON team',
    testimonialRole: 'Growth team',
  },
  'annita-studios': {
    label: 'Designer eveningwear / Social commerce operating system',
    body: 'Xây online business cho một brand eveningwear tại Lào',
    shortDescription:
      'ANNITA STUDIOS khởi đầu là local fashion startup tại Vientiane, chưa có hệ bán online, chưa có data vận hành và chưa có playbook e-commerce. The One xây strategy, reporting rhythm, Meta Ads engine, livestream workflow và hệ bàn giao để team local tiếp tục tự chạy.',
    caption:
      'Từ launch đến hệ social commerce tự vận hành: ROAS x12, CIR giảm 92%, peak revenue x11 và 50K+ followers trên ba kênh.',
    featuredStats: [
      { value: '×12', label: 'ROAS theo tháng' },
      { value: '-92%', label: 'CIR reduction' },
    ],
    keyMetrics: [
      { value: '×12', label: 'ROAS theo tháng: 1.5 → 18.3 peak (11/2023)', featured: true },
      { value: '-92%', label: 'CIR (chi phí ads/doanh thu): ~68% → ~5.5%', featured: true },
      { value: '6.4×', label: 'ROAS blended trung bình 12 tháng đầu' },
      { value: '11×+', label: 'ROAS duy trì suốt quý cao điểm Q4/2023' },
      { value: '×12', label: 'CVR mess → đơn: 1.6% → 19.2% peak' },
      { value: '×11', label: 'doanh thu tháng peak so với tháng đầu có doanh thu ads' },
      { value: '2.8M+', label: 'Page reach lũy kế 12 tháng (9.4M+ impressions)' },
      { value: '5,900+', label: 'hội thoại mess tạo ra từ ads (+280% cuối kỳ vs đầu kỳ)' },
      { value: '~50%', label: 'doanh thu ads cả năm đến từ 3 tháng mùa tiệc Q4' },
      { value: '50K+', label: 'followers 3 kênh social — vẫn active sau bàn giao' },
    ],
    storyDetail: {
      challenge:
        'Brand bắt đầu từ số 0 trong thị trường Lào khá ngách: không fanpage data, không customer base, không quy trình chốt online và ngân sách startup cần accountability cao.',
      solution:
        'The One xây operating system quanh pricing, promotions, SKU planning, Meta Engagement và Message campaigns, livestream reporting, sales logs, customer database, KOL/KOC tracking và dashboard monthly full-funnel.',
      result:
        'Trong 12 tháng đầu, monthly ROAS tăng từ 1.5x lên peak 18.3x, CIR giảm từ khoảng 68% xuống 5.5%, message-to-order CVR đạt 19.2% và doanh thu tháng đỉnh tăng 11x. Sau bàn giao, team local tiếp tục vận hành bằng tiếng Lào.',
    },
    testimonialQuote: 'The One không chỉ chạy ads. Họ để lại cho team mình một hệ vận hành có thể tiếp tục dùng.',
    testimonialAuthor: 'ANNITA STUDIOS team',
    testimonialRole: 'Founder office',
  },
}

function getHomepageStats(story: (typeof caseStudies)[number], copy?: Partial<CmsBlockItem>) {
  const copyStats = copy?.featuredStats?.filter((item) => item.value || item.label)
  if (copyStats?.length) return copyStats.slice(0, 2)
  const featured = story.keyMetrics.filter((metric) => metric.featured).slice(0, 2)
  return (featured.length ? featured : story.keyMetrics.slice(0, 2)).map((metric) => ({
    value: metric.value,
    label: metric.label,
    featured: metric.featured,
  }))
}

const theOneStoryItems: CmsBlockItem[] = caseStudies.map((story) => ({
  id: story.id,
  title: story.brandName,
  accountName: story.accountName,
  displayName: story.displayName,
  logoUrl: story.logoUrl,
  verified: story.verified,
  body: storyVietnameseCopy[story.id]?.body || story.headline,
  href: story.id,
  label: storyVietnameseCopy[story.id]?.label || story.category,
  period: storyVietnameseCopy[story.id]?.period || story.period,
  shortDescription: storyVietnameseCopy[story.id]?.shortDescription || story.shortDescription,
  caption: storyVietnameseCopy[story.id]?.caption || story.caption,
  likesSeed: story.likesSeed,
  services: storyVietnameseCopy[story.id]?.services || story.services,
  keyMetrics: storyVietnameseCopy[story.id]?.keyMetrics || story.keyMetrics,
  featuredStats: getHomepageStats(story, storyVietnameseCopy[story.id]),
  storyDetail: storyVietnameseCopy[story.id]?.storyDetail || story.storyDetail,
  videoUrl: '',
  embedUrl: '',
  thumbnailUrl: story.thumbnailUrl,
  homepageGalleryImages: story.homepageGalleryImages,
  backgroundImageUrl: story.backgroundImageUrl ?? '',
  backgroundImages: story.backgroundImages,
  screenBackground: story.screenBackground,
  socialLinks: {
    instagram: story.socialLinks?.instagram ?? '',
    facebook: story.socialLinks?.facebook ?? '',
    tiktok: story.socialLinks?.tiktok ?? '',
    website: story.socialLinks?.website ?? '',
  },
  showOnHomepage: story.showOnHomepage ?? true,
  homepageOrder: story.homepageOrder ?? '',
  layoutVariant: story.layoutVariant ?? 'auto',
  testimonialQuote: storyVietnameseCopy[story.id]?.testimonialQuote,
  testimonialAuthor: storyVietnameseCopy[story.id]?.testimonialAuthor,
  testimonialRole: storyVietnameseCopy[story.id]?.testimonialRole,
  ctaText: 'About this story',
  locales: {
    en: {
      body: story.headline,
      label: story.category,
      period: story.period,
      shortDescription: story.shortDescription,
      caption: story.caption,
      services: story.services,
      keyMetrics: story.keyMetrics,
      featuredStats: getHomepageStats(story),
      storyDetail: story.storyDetail,
      testimonialQuote: story.testimonialQuote,
      testimonialAuthor: story.testimonialAuthor,
      testimonialRole: story.testimonialRole,
      ctaText: story.ctaText,
    },
  },
}))

export const defaultCmsPages: CmsPageContent[] = [
  {
    id: 'homepage',
    title: 'Homepage',
    status: 'published',
    meta: { ...homeMetaByLang.vi, path: '/' },
    metaLocales: {
      en: homeMetaByLang.en,
    },
    blocks: [
      {
        id: 'hero',
        heading: 'Hẹn hò bao nhiêu agency rồi - vẫn chưa gặp The One?',
        body: 'Người làm được mọi thứ bạn cần: content, web, CRM, ads. Người hiểu bạn muốn đi đâu. Và quan trọng nhất: người ở lại đủ lâu để cùng bạn thấy kết quả.',
        subtitle: 'Người làm được mọi thứ bạn cần: content, web, CRM, ads. Người hiểu bạn muốn đi đâu. Và quan trọng nhất: người ở lại đủ lâu để cùng bạn thấy kết quả.',
        imageUrl: '',
        imageAlt: 'The One - GG99',
        backgroundImageUrl: '',
        backgroundGradient: 'linear-gradient(180deg,#FF7AA8 0%,#FF4D7D 45%,#FFB199 100%)',
        backgroundOverlayOpacity: '0',
        textColor: 'light',
        heroTextAlign: 'center',
        dividerShow: true,
        ctaLabel: 'Schedule Our Date',
        ctaSubtext: '30 phút cà phê online với founder - miễn phí, không ràng buộc, không sales gọi dai.',
        showCtaSubtext: false,
        showStatChips: true,
        statChips: [
          { value: 'x35', label: 'tăng trưởng đỉnh của khách' },
          { value: '326K+', label: 'đơn hàng đã vận hành' },
          { value: '5+', label: 'năm mối tình dài nhất' },
        ],
        ctaHref: '',
        items: [],
        locales: {
          en: {
            heading: 'All-in-one Marketing Agency for Startups & SMEs',
            body: 'The One delivers full-service marketing solutions with exceptional speed, efficiency, and cost-effectiveness.',
            subtitle: 'The One delivers full-service marketing solutions with exceptional speed, efficiency, and cost-effectiveness.',
            ctaLabel: 'Schedule Our Date',
            ctaSubtext: 'Free 30-min call - no commitment - talk directly with a founder.',
            heroTextAlign: 'center',
            statChips: [
              { value: 'x35', label: 'peak client growth' },
              { value: '326K+', label: 'orders operated' },
              { value: '5+', label: 'yrs longest partnership' },
            ],
          },
        },
      },
      {
        id: 'what-is',
        heading: compactHomeByLang.en.whatIs.title,
        body: compactHomeByLang.en.whatIs.body,
        subtitle: 'Khách hàng đang đồng hành cùng The One',
        items: [
          { title: 'The One knows about failure.', body: 'Premium local watch growth with connected promotions, marketplaces and reporting.', icon: 'Search', href: 'curnon', imageUrl: '/logo-curnon.png', showOnHomepage: true, homepageOrder: '0' },
          { title: 'The One Performance Marketing Agency', body: 'Tut - tricks and real performance.', icon: 'Megaphone', href: 'phinoi', imageUrl: '/logo-phinoi.png', showOnHomepage: true, homepageOrder: '1' },
          { title: 'The One Production House', body: 'Ideas, Contents, and Productions.', icon: 'Sparkles', href: 'cota-cuti', imageUrl: '/logo-cotacuti.png', showOnHomepage: true, homepageOrder: '2' },
          { title: 'The One Consultant', body: 'KPIs, Targets, Optimization & Growth Strategies.', icon: 'Target', href: 'inkaholic', imageUrl: '/logo-inkaholic.png', showOnHomepage: true, homepageOrder: '3' },
          { title: 'The Cheating One', body: 'faster, better and cheaper', icon: 'Rocket', href: 'qanda-books', imageUrl: '/logo-qandabook.png', showOnHomepage: true, homepageOrder: '4' },
        ],
        locales: {
          en: {
            subtitle: 'Clients growing with The One',
          },
        },
      },
      {
        id: 'packages',
        eyebrow: 'PRICING',
        heading: 'The One Packages',
        body: 'Mối quan hệ nào cũng cần đúng nhịp. Chọn nhịp của bạn - mình không vội.',
        layout: 'horizontal',
        pricingNote: 'Giá thật. Không phí ẩn. Cam kết theo quý - hợp thì đi tiếp, không hợp thì chia tay văn minh, dữ liệu và tài khoản là của bạn.',
        disclaimer: '* The One không cam kết doanh thu. Về workflow, tài khoản quảng cáo và nền tảng, The One là đơn vị vận hành/đối tác triển khai, không phải đại diện của Meta, TikTok, Google hoặc Shopee.',
        items: theOnePackageItems,
        locales: {
          en: {
            eyebrow: 'PRICING',
            body: 'Choose the growth system that fits your stage.',
            pricingNote: 'Transparent pricing. No hidden fees. Quarterly commitment - if it works, we continue; if not, we part cleanly and your data stays yours.',
            disclaimer: '* The One does not guarantee revenue. For workflows, ad accounts and platforms, The One operates as an implementation partner, not as a representative of Meta, TikTok, Google or Shopee.',
          },
        },
      },
      {
        id: 'red-flags',
        heading: 'Nghe quen không?',
        body: 'Bạn không cần thêm một agency. Bạn cần The One.',
        items: [
          { title: '"Bên em cam kết KPI, anh yên tâm" - rồi biến mất sau tháng thứ 2.', thumbnailUrl: '/logo-gg.png' },
          { title: 'Báo cáo 40 trang màu mè. Đơn hàng thì không thấy đâu.', thumbnailUrl: '/logo-gg.png' },
          { title: 'Đổi người phụ trách 3 lần một quý. Lần nào cũng kể lại từ đầu.', thumbnailUrl: '/logo-gg.png' },
          { title: 'Phí phát sinh nhiều hơn kết quả.', thumbnailUrl: '/logo-gg.png' },
        ],
        locales: {
          en: {
            heading: 'Sound familiar?',
            body: "You don't need another agency. You need The One.",
          },
        },
      },
      {
        id: 'people',
        heading: 'The One People',
        body: 'Những người đã bỏ việc 9-5 để làm "người ấy" của bạn: chiến lược, content, media, thương mại, CRM và data chạy về một hướng.',
        autoSlideSeconds: '5',
        closingLine1: 'Tụi mình đã nghỉ việc 9-5 và tự mở công ty.',
        closingLine2: "Isn't it your turn now?",
        items: theOnePeopleItems,
        locales: {
          en: {
            body: 'The people behind the system: strategy, creative, media, commerce, CRM and data moving in one direction.',
            closingLine1: 'We quit our 9-5 and started our own business.',
          },
        },
      },
      {
        id: 'closing',
        heading: 'Những điều bạn ngại hỏi trong buổi hẹn đầu',
        subtitle: 'Buổi hẹn đầu không mất gì - ngoài 30 phút, và có thể là khởi đầu của một mối quan hệ lâu dài.',
        body: '',
        backgroundImageUrl: '',
        backgroundGradient: 'linear-gradient(135deg,#db2777 0%,#ef4444 48%,#f59e0b 100%)',
        backgroundOverlayOpacity: '0.62',
        backgroundVideoUrl: '/closing/closing-portal-1920.mp4',
        backgroundVideoWebmUrl: '/closing/closing-portal-1920.webm',
        backgroundVideoMobileUrl: '/closing/closing-portal-1440.mp4',
        backgroundVideoMobileWebmUrl: '/closing/closing-portal-1440.webm',
        backgroundVideoPoster: '/closing/closing-portal-poster.webp',
        closingLine1: 'Tụi mình đã nghỉ việc 9-5 và tự mở công ty.',
        closingLine2: "Isn't it your turn now?",
        ctaSubtext: 'See you on our first date?',
        ctaLabel: 'Schedule Our Date',
        items: [
          {
            title: 'Mình mới có ý tưởng, chưa có brand - The One có nhận không?',
            body: 'Có. Một nửa khách của mình bắt đầu từ con số 0. Buổi hẹn đầu chính là để xem ý tưởng của bạn cần gì trước.',
          },
          {
            title: 'Hợp đồng tối thiểu bao lâu? Dừng giữa chừng thế nào?',
            body: 'Cam kết theo quý. Muốn dừng, báo trước 30 ngày - bàn giao sạch sẽ, tài khoản và dữ liệu là của bạn. Mình giữ người bằng kết quả, không bằng điều khoản.',
          },
          {
            title: '15 triệu/tháng gồm gì - và KHÔNG gồm gì?',
            body: 'Gồm đội vận hành đủ vai trò theo gói bạn chọn. Không gồm ngân sách ads: tiền ads là của bạn, chạy trên tài khoản của bạn, mình thu phần quản lý trên chi tiêu thực.',
          },
          {
            title: 'Tháng đầu tiên diễn ra thế nào?',
            body: 'Tuần 1: mình khám toàn bộ kênh, số, sản phẩm. Tuần 2: chốt kế hoạch và KPI. Tuần 3-4: chạy và ra báo cáo đầu tiên. Bạn luôn biết mình đang ở đâu.',
          },
          {
            title: 'Team mình nhỏ, chưa có ai làm content - ai làm gì?',
            body: 'Mình làm phần nặng: chiến lược, sản xuất, đăng tải, tối ưu. Bạn làm phần chỉ bạn làm được: hiểu sản phẩm và quyết định. Mỗi tuần bạn cần 1-2 giờ với mình, không hơn.',
          },
          {
            title: 'Làm sao mình biết có hiệu quả?',
            body: 'Report số thật hằng tuần trên dashboard chung: đơn hàng, doanh thu, chi phí. Số xấu mình cũng đưa, kèm phương án. Yêu nhau thì không giấu số.',
          },
        ],
        locales: {
          en: {
            heading: 'Frequently Asked Questions',
            subtitle: 'The first date costs nothing except 30 minutes - and it might be the beginning of a long-term growth relationship.',
            closingLine1: 'We quit our 9-5 and started our own business.',
            closingLine2: "Isn't it your turn now?",
            ctaSubtext: 'See you on our first date?',
          },
        },
      },
    ],
  },
  {
    id: 'the-one',
    title: 'The One Stories',
    status: 'published',
    meta: {
      ...compactTheOneByLang.vi.meta,
      path: '/the-one',
      title: 'The One Stories | Case Studies - GG99',
      description:
        'Khách thật, số thật và những mối quan hệ tăng trưởng của The One - GG99 với các brand startup và SME.',
      ogTitle: 'The One Stories | GG99',
      ogDescription: 'Khách thật, số thật - client stories từ The One - GG99.',
    },
    metaLocales: {
      en: {
        ...compactTheOneByLang.en.meta,
        path: '/en/the-one',
        title: 'The One Stories | Client Case Studies - GG99',
        description:
          'Real brands, real growth. See how startups and SMEs partner with The One - GG99 on brand, website, CRM, automation and performance marketing.',
        ogTitle: 'The One Stories | GG99',
        ogDescription: 'Real brands, real growth - client stories from The One - GG99.',
      },
    },
    blocks: [
      {
        id: 'hero',
        heading: 'The One Stories',
        body: 'Khách thật. Số thật. Và những mối quan hệ chưa ai ghost ai.',
        imageUrl: '/logo-gg.png',
        imageAlt: 'The One - GG99',
        locales: {
          en: {
            body: "Real brands we've partnered with. Every story below is a client on The One growth system.",
          },
        },
      },
      {
        id: 'stories',
        heading: 'Story order',
        body: 'Sắp xếp case study ở đây để quyết định brand nào xuất hiện trước trên The One Stories và homepage showcase. Href phải trùng story id.',
        items: theOneStoryItems,
        locales: {
          en: {
            body: 'Reorder the items below to control which brand appears first on The One Stories page and homepage showcase. Keep each Href equal to the story id.',
          },
        },
      },
    ],
  },
  ...packageDetailPages,
  {
    id: 'about',
    title: 'About',
    status: 'published',
    meta: { ...aboutMetaByLang.vi, path: '/about' },
    metaLocales: {
      en: aboutMetaByLang.en,
    },
    blocks: [
      {
        id: 'hero',
        heading: compactAboutByLang.vi.hero.h1,
        body: compactAboutByLang.vi.hero.intro,
        imageUrl: '/logo-gg.png',
        imageAlt: 'The One - GG99',
        locales: {
          en: {
            heading: compactAboutByLang.en.hero.h1,
            body: compactAboutByLang.en.hero.intro,
          },
        },
      },
      {
        id: 'cards',
        heading: 'GG99 xây gì',
        body: compactAboutByLang.vi.cards.map((card) => `${card.title}: ${card.text}`).join('\n'),
        items: compactAboutByLang.vi.cards.map((card, index) => ({
          title: card.title,
          body: card.text,
          icon: ['Search', 'BarChart3', 'BadgeCheck', 'Settings2'][index],
          locales: {
            en: {
              title: compactAboutByLang.en.cards[index]?.title ?? card.title,
              body: compactAboutByLang.en.cards[index]?.text ?? card.text,
            },
          },
        })),
        locales: {
          en: {
            heading: 'About cards',
            body: compactAboutByLang.en.cards.map((card) => `${card.title}: ${card.text}`).join('\n'),
          },
        },
      },
    ],
  },
  {
    id: 'services',
    title: 'Services',
    status: 'published',
    meta: servicesMetaVi,
    metaLocales: {
      en: servicesMeta,
    },
    blocks: [
      {
        id: 'intro',
        heading: 'Services',
        body: servicesMetaVi.description,
        items: [
          { title: 'Brand', body: 'Định vị, nhận diện và campaign direction.', icon: 'BadgeCheck', locales: { en: { body: 'Identity, positioning and campaign direction.' } } },
          { title: 'Website development', body: 'Landing page, booking flow và web system sẵn sàng bán.', icon: 'Globe2', locales: { en: { body: 'Landing pages, booking flows and sales-ready web systems.' } } },
          { title: 'CRM', body: 'Customer data, form và lifecycle workflow.', icon: 'Users', locales: { en: { body: 'Customer data, forms and lifecycle workflows.' } } },
          { title: 'Marketing automation', body: 'Journey, reminder và workflow vận hành được kết nối.', icon: 'Workflow', locales: { en: { body: 'Connected journeys, reminders and operating workflows.' } } },
          { title: 'Performance marketing', body: 'Paid media planning, reporting và optimization.', icon: 'Megaphone', locales: { en: { body: 'Paid media planning, reporting and optimization.' } } },
        ],
        locales: {
          en: {
            body: servicesMeta.description,
          },
        },
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    status: 'published',
    meta: contactMetaVi,
    metaLocales: {
      en: contactMeta,
    },
    blocks: [
      {
        id: 'intro',
        heading: 'Contact The One',
        body: contactMetaVi.description,
        items: contactItems.map((item) => ({
          ...item,
          body: item.title === 'Office' ? 'Hà Nội, Việt Nam' : item.body,
          locales: {
            en: {
              body: item.body,
            },
          },
        })),
        locales: {
          en: {
            heading: 'Contact GG99',
            body: contactMeta.description,
          },
        },
      },
    ],
  },
]

export const defaultCmsInsights: CmsInsightContent[] = insightPosts.map((post) => ({
  slug: post.slug,
  title: post.title,
  status: 'published',
  meta: post.meta,
  excerpt: post.excerpt,
  category: post.category,
  coverImage: post.coverImage,
  coverImageUrl: post.coverImage,
  coverAlt: post.coverAlt,
  datePublished: post.datePublished,
  dateModified: post.dateModified,
  sections: post.sections,
  ctaHref: post.ctaHref,
  ctaLabel: post.ctaLabel,
}))
