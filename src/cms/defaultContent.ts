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
    href: '',
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
    href: '',
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
    href: '',
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
  screenBackground: story.screenBackground,
  socialLinks: {
    instagram: '',
    facebook: '',
    tiktok: '',
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
        imageUrl: '',
        imageAlt: 'The One - GG99',
        backgroundImageUrl: '',
        backgroundGradient: 'linear-gradient(180deg,#FFF5F7 0%,#FFE4EC 55%,#FFD9E4 100%)',
        backgroundOverlayOpacity: '0',
        ctaLabel: '',
        ctaHref: '',
        items: [],
      },
      {
        id: 'what-is',
        heading: compactHomeByLang.en.whatIs.title,
        body: compactHomeByLang.en.whatIs.body,
        items: [
          { title: 'The One Performance Marketing Agency', body: 'Tut - tricks and real performance.', icon: 'Megaphone', href: 'phinoi', imageUrl: '/logo-phinoi.png' },
          { title: 'The One Production House', body: 'Ideas, Contents, and Productions.', icon: 'Sparkles', href: 'cota-cuti', imageUrl: '/logo-cotacuti.png' },
          { title: 'The One Consultant', body: 'KPIs, Targets, Optimization & Growth Strategies.', icon: 'Target', href: 'inkaholic', imageUrl: '/logo-inkaholic.png' },
          { title: 'The Cheating One', body: 'faster, better and cheaper', icon: 'Rocket', href: 'qanda-books', imageUrl: '/logo-qandabook.png' },
          { title: 'The One knows about failure.', body: '', icon: 'Search', href: 'curnon', imageUrl: '/logo-curnon.png' },
        ],
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
  coverAlt: post.coverAlt,
  datePublished: post.datePublished,
  dateModified: post.dateModified,
  sections: post.sections,
  ctaHref: post.ctaHref,
  ctaLabel: post.ctaLabel,
}))
