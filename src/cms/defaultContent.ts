import {
  aboutMetaByLang,
  compactAboutByLang,
  compactHomeByLang,
  compactTheOneByLang,
  contactMeta,
  homeMetaByLang,
  insightPosts,
  packagesMetaByLang,
  servicesMeta,
  theOnePackagesByLang,
} from '../brandContent'
import { caseStudies } from '../data/caseStudies'
import type { CmsBlockItem, CmsInsightContent, CmsPageContent } from './types'
export { defaultCmsSiteSettings } from './siteSettings'

const theOnePackageItems: CmsBlockItem[] = [
  {
    title: 'The One Start',
    icon: 'Rocket',
    href: '/packages#the-one-start',
    caseStudyLink: '/the-one#cota-cuti',
    imageUrl: '',
    body: [
      'For brands starting to build a consistent digital presence.',
      '45 content units/month (minimum 15 reels/short-form videos)',
      'Content strategy, content calendar, production, posting and optimization.',
      'Basic booking website, up to 10 landing pages.',
      'Performance marketing (% of actual ad spend)',
      'Price: 15,000,000 VND/month',
    ].join('\n'),
  },
  {
    title: 'The One System',
    label: 'Most Popular',
    icon: 'Workflow',
    href: '/packages#the-one-system',
    caseStudyLink: '/the-one#curnon',
    imageUrl: '',
    body: [
      'For brands that need content, website and paid media running as one stable system.',
      '60 content units/month (minimum 20 reels/short-form videos)',
      'Content strategy, content calendar, production, posting and optimization.',
      'Booking/sales website, unlimited landing pages.',
      'Performance marketing (% of actual ad spend)',
      'Price: 30,000,000 VND/month',
    ].join('\n'),
  },
  {
    title: 'The One Scale',
    icon: 'Megaphone',
    href: '/packages#the-one-scale',
    caseStudyLink: '/the-one#inkaholic',
    imageUrl: '',
    body: [
      'For brands ready for strong growth: large campaigns, event execution, branch expansion or specific revenue targets.',
      'Everything included in The One System.',
      'Support planning and running on-site events.',
      'Campaign strategy, creative direction, media planning and performance optimization.',
      'Performance marketing (% of actual ad spend)',
      'Price: Custom package — based on project scope.',
    ].join('\n'),
  },
]

const theOnePeopleItems: CmsBlockItem[] = [
  { title: 'Smooth', label: 'Founder / Growth Architect', body: 'Connects brand, commerce, CRM and performance into one operating system.', imageUrl: '/logo-gg.png', funPhotoUrl: '/logo-gg.png', avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'] },
  { title: 'Creative One', label: 'Content Lead', body: 'Turns strategy into reels, scripts, visuals and daily content rhythm.', imageUrl: '/logo-gg.png', funPhotoUrl: '/logo-gg.png', avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'] },
  { title: 'Performance One', label: 'Media Lead', body: 'Keeps paid media, reporting and experiments moving toward revenue.', imageUrl: '/logo-gg.png', funPhotoUrl: '/logo-gg.png', avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'] },
  { title: 'System One', label: 'Website / CRM', body: 'Builds landing pages, funnels and customer journeys that teams can run.', imageUrl: '/logo-gg.png', funPhotoUrl: '/logo-gg.png', avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'] },
  { title: 'Commerce One', label: 'Marketplace Ops', body: 'Operates marketplaces, launches, bundles and campaign mechanics.', imageUrl: '/logo-gg.png', funPhotoUrl: '/logo-gg.png', avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'] },
  { title: 'Data One', label: 'Dashboard / Insight', body: 'Turns messy signals into decisions the whole team can understand.', imageUrl: '/logo-gg.png', funPhotoUrl: '/logo-gg.png', avatarImages: ['/logo-gg.png', '/logo-gg.png', '/logo-gg.png', '/logo-gg.png'] },
]

const theOneStoryItems: CmsBlockItem[] = caseStudies.map((story) => ({
  id: story.id,
  title: story.brandName,
  accountName: story.accountName,
  displayName: story.displayName,
  logoUrl: story.logoUrl,
  verified: story.verified,
  body: story.headline,
  href: story.id,
  label: story.category,
  period: story.period,
  shortDescription: story.shortDescription,
  caption: story.caption,
  likesSeed: story.likesSeed,
  services: story.services,
  keyMetrics: story.keyMetrics,
  storyDetail: story.storyDetail,
  videoUrl: '',
  embedUrl: '',
  backgroundImageUrl: '',
  backgroundImages: story.backgroundImages,
  screenBackground: story.screenBackground,
  socialLinks: {
    instagram: story.socialLinks?.instagram ?? '',
    facebook: story.socialLinks?.facebook ?? '',
    tiktok: story.socialLinks?.tiktok ?? '',
    website: story.socialLinks?.website ?? '',
  },
  ctaText: story.ctaText,
}))

export const defaultCmsPages: CmsPageContent[] = [
  {
    id: 'homepage',
    title: 'Homepage',
    status: 'published',
    meta: { ...homeMetaByLang.en, path: '/' },
    blocks: [
      {
        id: 'hero',
        heading: 'The One by gg99',
        body: 'The only one digital agency you needed',
        subtitle: 'The only one digital agency you needed',
        imageUrl: '',
        imageAlt: 'The One - GG99',
        backgroundImageUrl: '',
        backgroundGradient: 'linear-gradient(180deg,#FF7AA8 0%,#FF4D7D 45%,#FFB199 100%)',
        backgroundOverlayOpacity: '0',
        textColor: 'light',
        dividerShow: true,
        ctaLabel: '',
        ctaHref: '',
        items: [],
      },
      {
        id: 'what-is',
        heading: compactHomeByLang.en.whatIs.title,
        body: compactHomeByLang.en.whatIs.body,
        items: [
          { title: 'The One knows about failure.', body: 'Premium local watch growth with connected promotions, marketplaces and reporting.', icon: 'Search', href: 'curnon', imageUrl: '/logo-curnon.png', showOnHomepage: true, homepageOrder: '0' },
          { title: 'The One Performance Marketing Agency', body: 'Tut - tricks and real performance.', icon: 'Megaphone', href: 'phinoi', imageUrl: '/logo-phinoi.png', showOnHomepage: true, homepageOrder: '1' },
          { title: 'The One Production House', body: 'Ideas, Contents, and Productions.', icon: 'Sparkles', href: 'cota-cuti', imageUrl: '/logo-cotacuti.png', showOnHomepage: true, homepageOrder: '2' },
          { title: 'The One Consultant', body: 'KPIs, Targets, Optimization & Growth Strategies.', icon: 'Target', href: 'inkaholic', imageUrl: '/logo-inkaholic.png', showOnHomepage: true, homepageOrder: '3' },
          { title: 'The Cheating One', body: 'faster, better and cheaper', icon: 'Rocket', href: 'qanda-books', imageUrl: '/logo-qandabook.png', showOnHomepage: true, homepageOrder: '4' },
        ],
      },
      {
        id: 'packages',
        heading: 'The One Packages',
        body: '',
        items: theOnePackageItems,
      },
      {
        id: 'people',
        heading: 'The One People',
        body: 'The people behind the system: strategy, creative, media, commerce, CRM and data moving in one direction.',
        closingLine1: 'We quit our 9-5 and started our own business.',
        closingLine2: "Isn't it your turn now?",
        items: theOnePeopleItems,
      },
      {
        id: 'closing',
        heading: 'So, ready to be our plus one?',
        subtitle: 'Build the next story with The One - GG99.',
        body: '',
        backgroundImageUrl: '',
        backgroundGradient: 'linear-gradient(135deg,#db2777 0%,#ef4444 48%,#f59e0b 100%)',
        backgroundOverlayOpacity: '0.62',
        ctaLabel: 'Call Your Shot',
        items: [
          {
            title: 'What does The One help with first?',
            body: 'We start by clarifying your growth stage, then connect brand, website, content, CRM, automation and performance into one operating system.',
          },
          {
            title: 'Can GG99 work with an existing team?',
            body: 'Yes. The One can plug into your current team as strategy, execution, system setup or performance support depending on what is missing.',
          },
          {
            title: 'How fast can a project start?',
            body: 'Most projects begin with a short audit and kickoff. Scope, assets and access decide how quickly production and launch work can begin.',
          },
          {
            title: 'Which package should we choose?',
            body: 'Start is for early setup, System is for stable growth operations, and Scale is for larger campaigns, expansion or custom targets.',
          },
          {
            title: 'What should we prepare before booking?',
            body: 'Bring your current website, channels, goals, constraints and any performance data. The first call is designed to map the next practical step.',
          },
        ],
      },
    ],
  },
  {
    id: 'the-one',
    title: 'The One Stories',
    status: 'published',
    meta: {
      ...compactTheOneByLang.en.meta,
      path: '/the-one',
      title: 'The One Stories | Client Case Studies — GG99',
      description:
        'Real brands, real growth. See how startups and SMEs partner with The One - GG99 on brand, website, CRM, automation and performance marketing.',
      ogTitle: 'The One Stories | GG99',
      ogDescription: 'Real brands, real growth — client stories from The One - GG99.',
    },
    blocks: [
      {
        id: 'hero',
        heading: 'The One Stories',
        body: "Real brands we've partnered with. Every story below is a client on The One growth system.",
        imageUrl: '/logo-gg.png',
        imageAlt: 'The One - GG99',
      },
      {
        id: 'stories',
        heading: 'Story order',
        body: 'Reorder the items below to control which brand appears first on The One Stories page. Keep each Href equal to the story id.',
        items: theOneStoryItems,
      },
    ],
  },
  {
    id: 'packages',
    title: 'Packages',
    status: 'published',
    meta: { ...packagesMetaByLang.en, path: '/packages' },
    blocks: [
      {
        id: 'intro',
        heading: theOnePackagesByLang.en.h1,
        body: `${theOnePackagesByLang.en.subtitle}\n\n${theOnePackagesByLang.en.intro}`,
        imageUrl: '/logo-gg.png',
        imageAlt: 'The One Packages — GG99',
      },
      {
        id: 'packages',
        heading: 'The One Packages',
        body: '',
        items: theOnePackageItems,
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    status: 'published',
    meta: { ...aboutMetaByLang.en, path: '/about' },
    blocks: [
      {
        id: 'hero',
        heading: compactAboutByLang.en.hero.h1,
        body: compactAboutByLang.en.hero.intro,
        imageUrl: '/logo-gg.png',
        imageAlt: 'The One - GG99',
      },
      {
        id: 'cards',
        heading: 'About cards',
        body: compactAboutByLang.en.cards.map((card) => `${card.title}: ${card.text}`).join('\n'),
        items: compactAboutByLang.en.cards.map((card, index) => ({
          title: card.title,
          body: card.text,
          icon: ['Search', 'BarChart3', 'BadgeCheck', 'Settings2'][index],
        })),
      },
    ],
  },
  {
    id: 'services',
    title: 'Services',
    status: 'published',
    meta: servicesMeta,
    blocks: [
      {
        id: 'intro',
        heading: 'Services',
        body: servicesMeta.description,
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    status: 'published',
    meta: contactMeta,
    blocks: [
      {
        id: 'intro',
        heading: 'Contact GG99',
        body: contactMeta.description,
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
