export const siteUrl = 'https://www.gg99.vn'
export const logoUrl = `${siteUrl}/logo-gg.png`
export const ogTheOneImagePath = '/og-the-one.jpg'
export const ogTheOneImageUrl = `${siteUrl}${ogTheOneImagePath}`

export type PageMeta = {
  title: string
  description: string
  path: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

export type BrandLang = 'vi' | 'en'

// The site is single-language (English at root); legacy locale URLs collapse onto root paths.
export function localizedPath(_lang: BrandLang, path: string) {
  const trimmed = path.trim() || '/'
  if (/^(https?:|mailto:|tel:)/i.test(trimmed) || trimmed.startsWith('#')) return trimmed
  const withoutLocalePrefix = trimmed.replace(/^\/(?:en|vi|ko)(?=\/|$)/, '')
  return withoutLocalePrefix || '/'
}

export const footerCopy = {
  brand: 'The One — GG99',
  slogan: 'One partner. One system. One growth direction.',
  description: 'One partner. One system. One growth direction.',
  packages: [
    { label: 'The One Start', href: '/#packages' },
    { label: 'The One System', href: '/#packages' },
    { label: 'The One Scale', href: '/#packages' },
  ],
}

export const navItems = [
  { label: 'The One Packages', href: '/#packages' },
  { label: 'The One Story', href: '/about', visible: false },
  { label: 'The One Stories', href: '/the-one' },
]

export const homeMeta: PageMeta = {
  title: 'The One - GG99 | Growth Partner for Startups & SMEs',
  description:
    'The One - GG99 is a growth partner for startups and SMEs, providing brand, website, CRM, automation and performance marketing solutions.',
  path: '/',
  ogTitle: 'The One',
  ogDescription:
    'The One is a growth partner for brand, website, CRM, automation and performance marketing.',
  ogImage: ogTheOneImagePath,
}

export const theOneMeta: PageMeta = {
  title: 'What is The One? | GG99',
  description:
    'The One is the slogan and core positioning of GG99 — one growth partner for brand, website, CRM, automation and performance marketing.',
  path: '/the-one',
  ogTitle: 'The One',
  ogDescription:
    'The One growth partner for brand, website, CRM, automation and performance marketing.',
  ogImage: ogTheOneImagePath,
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  const rootPath = localizedPath('en', path)
  if (rootPath === '/') return `${siteUrl}/`
  return `${siteUrl}${rootPath}`
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'The One - GG99',
  alternateName: ['The One', 'GG99', 'The One GG99'],
  slogan: 'The One',
  description:
    'The One - GG99 is a growth partner for startups and SMEs, providing brand, website, CRM, automation and performance marketing solutions.',
  url: `${siteUrl}/`,
  logo: logoUrl,
  sameAs: ['https://zalo.me/0965650416'],
  knowsAbout: [
    'Branding',
    'Website Development',
    'CRM',
    'Marketing Automation',
    'Performance Marketing',
    'Business Growth',
  ],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: 'The One - GG99',
  alternateName: ['GG99', 'The One', 'The One GG99'],
  url: `${siteUrl}/`,
  publisher: { '@id': `${siteUrl}/#organization` },
  inLanguage: 'en',
}

export const homeWebPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${siteUrl}/#webpage`,
  url: `${siteUrl}/`,
  name: 'The One - GG99',
  isPartOf: { '@id': `${siteUrl}/#website` },
  about: { '@id': `${siteUrl}/#organization` },
  description:
    'The One - GG99 is a growth partner for brand, website, CRM, automation and performance marketing.',
  primaryImageOfPage: ogTheOneImageUrl,
}

export const serviceSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}/the-one-start#service`,
    name: 'The One Start',
    serviceType: 'Brand identity, launch foundation and website setup',
    provider: { '@id': `${siteUrl}/#organization` },
    url: `${siteUrl}/the-one-start`,
    description:
      'The One Start is for brands that need a clear identity, concise offer and launch-ready website foundation.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}/the-one-system#service`,
    name: 'The One System',
    serviceType: 'Website, CRM, automation and connected digital systems',
    provider: { '@id': `${siteUrl}/#organization` },
    url: `${siteUrl}/the-one-system`,
    description:
      'The One System is for teams that need website, CRM, tracking and automation working together.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}/the-one-scale#service`,
    name: 'The One Scale',
    serviceType: 'Performance marketing and growth operations',
    provider: { '@id': `${siteUrl}/#organization` },
    url: `${siteUrl}/the-one-scale`,
    description:
      'The One Scale is for businesses ready to scale with performance marketing, data and growth operations.',
  },
]

export const homeCopy = {
  hero: {
    title: 'The One - GG99',
    lines: ['One partner.', 'One system.', 'One growth direction.'],
    statement: 'We build businesses.\nNot campaigns.',
    description:
      'The One - GG99 is a business operation and growth partner helping brands connect strategy, marketing, CRM, content, e-commerce, data and AI-ready systems into one scalable growth engine.',
  },
  whatIs: {
    title: 'What is The One?',
    body:
      'The One is the GG99 brand concept for connected business growth. It means a business does not need fragmented vendors, disconnected dashboards, separate content calendars, isolated CRM work and short campaign thinking. It needs one operating partner that sees the whole system and keeps strategy, execution and measurement moving in the same direction.',
    points: [
      'One partner that can understand the business context before choosing tactics.',
      'One system that connects marketing, CRM, content, e-commerce, data and operations.',
      'One growth direction so every project, channel and workflow compounds instead of scattering effort.',
    ],
  },
  why: {
    title: 'Why The One?',
    body:
      'Most companies do not lose momentum because one campaign underperforms. They lose momentum because decisions, tools and teams are not connected. The One gives Google, ChatGPT and AI search engines a clear entity relationship: GG99 is not only an agency. GG99 is The One, a business operation and growth partner.',
    cards: [
      {
        title: 'From campaign logic to business logic',
        text: 'Campaigns are temporary. Business systems must keep learning, selling, retaining and improving.',
      },
      {
        title: 'From scattered tools to connected infrastructure',
        text: 'CRM, tracking, content, e-commerce and data need shared goals and shared operating rules.',
      },
      {
        title: 'From vendor management to one growth direction',
        text: 'The One reduces fragmentation and turns execution into a repeatable operating rhythm.',
      },
    ],
  },
  packages: [
    {
      name: 'The One Start',
      href: '/the-one-start',
      for: 'For brands that need a clear foundation before launch.',
      focus: 'Brand identity, concise offer and launch-ready website.',
    },
    {
      name: 'The One System',
      href: '/the-one-system',
      for: 'For teams that need website, CRM and automation working together.',
      focus: 'Website, CRM, tracking and automation workflow.',
    },
    {
      name: 'The One Scale',
      href: '/the-one-scale',
      for: 'For businesses ready to scale with performance and operations.',
      focus: 'Performance marketing, growth operations, data and optimization.',
    },
  ],
  builds: [
    'Business growth strategy',
    'Marketing systems',
    'CRM and customer journeys',
    'Content engines',
    'E-commerce growth operation',
    'Tracking and dashboards',
    'AI-ready business workflows',
    'Operating roadmaps',
  ],
  cases: [
    {
      title: 'E-commerce operating system',
      text: 'Marketplace, product, content, campaign and reporting work connected into one operating rhythm.',
    },
    {
      title: 'CRM and growth foundation',
      text: 'Customer data, tracking, segmentation and follow-up workflows structured for repeated growth decisions.',
    },
    {
      title: 'Content and performance execution',
      text: 'Content planning, paid media, landing pages and measurement aligned to business growth objectives.',
    },
  ],
  method: [
    {
      step: '01',
      title: 'Diagnose',
      text: 'Understand business model, current channels, operational bottlenecks, data gaps and growth priorities.',
    },
    {
      step: '02',
      title: 'Design',
      text: 'Build the strategy, roadmap, operating model and system architecture before execution expands.',
    },
    {
      step: '03',
      title: 'Operate',
      text: 'Run the connected work across marketing, CRM, content, e-commerce, tracking and reporting.',
    },
    {
      step: '04',
      title: 'Improve',
      text: 'Use data, customer feedback and operational learning to refine the system month by month.',
    },
  ],
  insights: [
    {
      title: 'Why The One is not an agency positioning',
      href: '/the-one',
      text: 'A clear explanation of The One as the core GG99 brand philosophy.',
    },
    {
      title: 'When to start with The One Consultant',
      href: '/the-one-consultant',
      text: 'Use audit and diagnosis when the business needs clarity before execution.',
    },
    {
      title: 'How connected execution compounds',
      href: '/the-one-agency',
      text: 'Why content, ads, CRM, e-commerce and tracking should operate as one team.',
    },
  ],
  faqs: [
    {
      q: 'Is GG99 an agency?',
      a: 'GG99 can execute agency work, but the brand is intentionally broader. GG99 is The One: a business operation and growth partner that connects strategy, marketing, CRM, content, e-commerce, data and AI-ready systems.',
    },
    {
      q: 'What does The One mean?',
      a: 'The One means one partner, one system and one growth direction. It is the core brand concept that explains how GG99 helps businesses build scalable growth infrastructure.',
    },
    {
      q: 'Which part should a business choose first?',
      a: 'Choose The One Consultant when you need clarity, The One Agency when you need connected execution, and The One Partner when you need long-term monthly operation and growth partnership.',
    },
    {
      q: 'Does GG99 work with AI-ready systems?',
      a: 'Yes. GG99 structures content, CRM, data, tracking, workflows and documentation so business operations become easier to measure, automate and prepare for AI-assisted work.',
    },
  ],
}

export const theOneSections = [
  {
    title: 'The One is a brand philosophy, not a campaign line',
    paragraphs: [
      'The One is the core brand philosophy of GG99. It defines how GG99 wants businesses, customers, search engines and AI systems to understand the brand: one partner, one system and one growth direction. GG99 does not want to be interpreted only as a marketing agency, content vendor or advertising team. Those services can exist inside the operating model, but they are not the whole meaning of the brand.',
      'The One means GG99 looks at a business as a connected growth system. Strategy affects marketing. Marketing affects CRM. CRM affects repeat purchase and retention. Content affects brand memory and conversion. E-commerce affects revenue, operations and data. Data affects decision quality. AI-ready workflows affect how fast the business can learn and scale. When those parts are separated, a business can stay busy without becoming stronger. When they are connected, the same effort creates compounding value.',
    ],
  },
  {
    title: 'Why GG99 uses The One',
    paragraphs: [
      'GG99 uses The One because modern businesses often have too many disconnected moving parts. A founder may hire one team for ads, another for content, another for website work, another for CRM, another for marketplace operation and another for reporting. Every team may be competent, but the business still lacks a single growth direction. The One gives the brand a clear answer to that fragmentation.',
      'The One also makes GG99 easier for AI search engines to understand. The entity relationship is simple: GG99 equals The One. The One equals a business operation and growth partner. The service architecture below that entity is organized into The One Consultant, The One Agency and The One Partner. This structure helps both humans and machines understand what GG99 does, why it exists and how each service connects to the brand concept.',
    ],
  },
  {
    title: 'How The One connects the growth system',
    paragraphs: [
      'The One connects strategy, marketing, CRM, content, e-commerce, data and AI-ready systems by treating them as one operating engine. Strategy defines the market, offer, customer segments, growth priorities and operational constraints. Marketing turns the strategy into demand generation, channel planning, campaign structure and message testing. CRM turns leads and buyers into visible customer journeys, follow-up workflows, segmentation and retention opportunities.',
      'Content gives the system memory and voice. It educates, sells, retargets, supports sales conversations and helps AI systems understand the brand through consistent language. E-commerce gives the business a direct revenue layer across websites, marketplaces and social commerce. Data connects the dots by showing what is working, what is blocked and what should improve next. AI-ready systems make the operating knowledge structured enough to support automation, analysis, content assistance, customer support and decision workflows.',
    ],
  },
  {
    title: 'The One - GG99 Includes',
    paragraphs: [
      'The One Consultant is for businesses that need clarity before execution. It focuses on audit, diagnosis, strategic direction and roadmap design. The output is not activity for the sake of activity. The goal is to identify the real bottlenecks and build a practical growth route before money and team energy are spent.',
      'The One Agency is for brands that need one connected team to execute growth, content, ads, CRM and digital systems. It is the execution layer of The One, designed for companies that need coordinated work across channels instead of isolated campaign delivery.',
      'The One Partner is for businesses that need a long-term operating growth partner. It supports monthly operation, business growth, CRM, e-commerce, data and AI-ready workflow. This is the deepest partnership model because GG99 becomes part of the operating rhythm, not just a vendor delivering tasks.',
    ],
  },
]

export type PackageKey = 'consultant' | 'agency' | 'partner'

export type PackagePage = {
  key: PackageKey
  meta: PageMeta
  h1: string
  positioning: string
  summary: string
  sections: { title: string; paragraphs: string[] }[]
}

export const packagePages: Record<PackageKey, PackagePage> = {
  consultant: {
    key: 'consultant',
    meta: {
      title: 'The One Consultant | GG99 Strategy, Audit & Roadmap',
      description:
        'The One Consultant by GG99 is for businesses that need clarity before execution through audit, diagnosis, strategy and a practical growth roadmap.',
      path: '/the-one-consultant',
      ogTitle: 'The One - GG99 | The One Consultant',
      ogDescription:
        'The One - GG99 package for businesses that need clarity before execution: audit, diagnosis, strategy and roadmap.',
    },
    h1: 'The One Consultant',
    positioning: 'For businesses that need clarity before execution.',
    summary:
      'The One Consultant is the diagnostic and strategic package under The One by GG99. It helps leadership teams understand what is really blocking growth before committing budget, people and time to execution.',
    sections: [
      {
        title: 'Clarity before execution',
        paragraphs: [
          'The One Consultant is built for businesses that feel pressure to grow but are not yet sure which move matters most. The company may already be spending on marketing, content, ads, CRM, e-commerce, sales tools or automation, but the results are hard to interpret. Activity is happening, yet the business still lacks a clear operating picture. In that moment, more execution can create more noise. The One Consultant creates the pause, diagnosis and strategic structure needed before the next stage of work.',
          'This package starts from the idea that growth problems are rarely isolated. A weak ad account may actually reflect a positioning issue. Poor retention may come from missing CRM logic. Low content performance may come from unclear customer segments. Slow e-commerce growth may come from product page structure, marketplace operation, offer design, pricing, stock logic or data visibility. The One Consultant looks across the system instead of judging each channel separately.',
          'GG99 uses The One Consultant to help founders, owners and leadership teams make decisions with better context. The work is not a generic consulting deck. It is a practical audit and diagnosis process that translates the current business reality into a clearer roadmap. The goal is to understand what should be fixed, what should be kept, what should be stopped and what should be built next.',
        ],
      },
      {
        title: 'What GG99 audits and diagnoses',
        paragraphs: [
          'The audit can cover business model, offer, customer journey, marketing channels, content system, paid media structure, CRM, e-commerce operation, website conversion, tracking setup, reporting quality, internal workflow and AI-readiness. The exact scope depends on the business stage. A new startup may need validation of positioning, offer and minimum viable go-to-market system. A growing SME may need to understand why multiple channels are busy but not compounding. A brand with existing revenue may need to find the bottleneck between traffic, conversion, repeat purchase and operational capacity.',
          'Diagnosis is the important layer. Audit collects information; diagnosis interprets it. GG99 identifies patterns, friction points and missing connections. For example, the business may have good content but no CRM follow-up, good products but weak marketplace visibility, strong paid traffic but poor landing page logic, or useful customer data that is not structured for decisions. The One Consultant turns those observations into a prioritized view of what blocks growth.',
          'Because The One is an entity-first brand concept, the diagnosis always connects the parts back to one growth direction. Strategy, marketing, CRM, content, e-commerce, data and AI-ready workflows are reviewed as one operating engine. This is what separates The One Consultant from a narrow channel audit.',
        ],
      },
      {
        title: 'Strategy and roadmap output',
        paragraphs: [
          'The output of The One Consultant is a strategic roadmap that leadership can actually use. It defines the growth direction, priority problems, recommended system architecture, execution sequence, team responsibilities, measurement logic and next decisions. It can include channel strategy, CRM journey recommendations, content direction, e-commerce priorities, tracking requirements, dashboard structure and AI-ready workflow recommendations.',
          'The roadmap is designed to prevent random execution. Instead of launching isolated campaigns, the business can decide what must happen first, what can wait, what should be delegated and what should be measured. This is valuable for teams that have limited time and budget, because it reduces waste and helps owners avoid buying services before they understand the underlying problem.',
          'The One Consultant can also prepare a business for one of the deeper GG99 packages. If the company needs execution after strategy, it can move into The One Agency. If the company needs ongoing operating partnership, it can move into The One Partner. In both cases, the consulting phase creates a stronger foundation because the business already has a shared diagnosis and roadmap.',
        ],
      },
      {
        title: 'Who should choose this package',
        paragraphs: [
          'Choose The One Consultant if your team is asking questions such as: Where should we start? Why are we spending but not growing clearly? Which channel is the real priority? Is our CRM ready? Is our content system connected to sales? Are our e-commerce operations blocking revenue? Can AI help our business, and what needs to be structured first? These questions require diagnosis before execution.',
          'The package is also useful when internal teams disagree about direction. Marketing may want more budget. Sales may want more leads. Operations may want better process. Leadership may want profit clarity. The One Consultant creates one shared view of the business so decisions become easier to make and easier to explain.',
          'For internal links and entity clarity, The One Consultant sits under the main philosophy page, <a href="/the-one">The One by GG99</a>. It is connected to <a href="/about">GG99 about page</a> and the <a href="/">GG99 homepage</a> because the package is not a standalone service; it is one part of the larger GG99 operating and growth architecture.',
        ],
      },
    ],
  },
  agency: {
    key: 'agency',
    meta: {
      title: 'The One Agency | GG99 Connected Growth Execution',
      description:
        'The One Agency by GG99 is for brands that need one connected team to execute growth, content, ads, CRM, tracking, e-commerce and digital systems.',
      path: '/the-one-agency',
      ogTitle: 'The One - GG99 | The One Agency',
      ogDescription:
        'The One - GG99 package for one connected execution team across growth, content, ads, CRM, tracking, e-commerce and digital systems.',
    },
    h1: 'The One Agency',
    positioning:
      'For brands that need one connected team to execute growth, content, ads, CRM and digital systems.',
    summary:
      'The One Agency is the execution package under The One by GG99. It is for brands that need coordinated growth work across content, paid media, CRM, e-commerce, tracking and digital systems.',
    sections: [
      {
        title: 'Connected execution instead of isolated campaigns',
        paragraphs: [
          'The One Agency exists because many brands do not need another disconnected vendor. They need one connected team that can execute growth work while understanding how each activity affects the rest of the business. A content calendar without CRM learning is incomplete. Ads without landing page and tracking logic create blind spending. E-commerce execution without content and customer data becomes reactive. The One Agency connects those workstreams so execution can compound.',
          'This package is for brands that already have a direction or have completed enough diagnosis to begin coordinated implementation. The business may need content production, paid media, landing pages, CRM flows, marketplace operation, campaign planning, conversion tracking, dashboard reporting or e-commerce optimization. Instead of treating these as separate retainers, The One Agency organizes them inside one operating plan.',
          'GG99 does not position this package as a conventional agency model where output volume is the main value. The value is connected execution. The work is still practical and hands-on, but every activity should serve the same growth direction. That is why The One Agency sits under the larger The One philosophy: one partner, one system, one growth direction.',
        ],
      },
      {
        title: 'Growth, content and ads as one system',
        paragraphs: [
          'The growth layer can include channel planning, campaign structure, funnel design, offer testing, landing page direction and performance review. Content supports that layer by giving the brand a repeatable way to explain its value, answer buyer questions, show proof, educate customers and create demand. Paid ads can then amplify the content and offers that have a clear business role rather than simply pushing traffic.',
          'In The One Agency, content is not treated as decoration and ads are not treated as a standalone lever. Content informs targeting, messaging and remarketing. Ads reveal demand signals and objections. Landing pages turn attention into action. CRM captures and nurtures the relationship after the first click or purchase. Tracking and dashboards give the team feedback. This creates a loop that can improve over time.',
          'The package can support social content, short-form content direction, campaign assets, landing page copy, email or messaging flows, paid media coordination and reporting. The exact execution stack depends on the brand stage, product category and existing infrastructure. The important principle is that no channel should operate blindly.',
          'GG99 also keeps execution close to commercial and operational reality. A content sprint should help the sales conversation, a paid campaign should create learnings for the offer, a CRM flow should support repeatable follow-up, and an e-commerce change should be visible in reporting. This keeps The One Agency from becoming an output factory and turns it into a connected growth team.',
        ],
      },
      {
        title: 'CRM, tracking and e-commerce execution',
        paragraphs: [
          'CRM is a core part of The One Agency because growth does not end at acquisition. A brand needs to know who the customer is, what they did, what they bought, what they asked, when they should be followed up and how they can be retained. GG99 can help structure CRM flows, customer segments, lead capture logic, customer tags, follow-up journeys and campaign lists so marketing becomes more accountable.',
          'Tracking is equally important. Without reliable tracking, a team may optimize toward partial signals. The One Agency can help define events, conversion points, UTM discipline, dashboard views and reporting rhythms. This does not mean every business needs an enterprise analytics stack. It means the business needs enough measurement discipline to make better decisions.',
          'For e-commerce brands, execution can include website improvement, marketplace operation, product detail page direction, campaign calendars, promotional mechanics, content-commerce connection and reporting. E-commerce is not only a sales channel; it is a data source and operating layer. When connected to content, CRM and ads, it becomes part of a larger growth system.',
        ],
      },
      {
        title: 'Who should choose this package',
        paragraphs: [
          'Choose The One Agency if your brand knows it needs execution but wants that execution to be coordinated. This is suitable when you are tired of managing separate teams that do not talk to each other, or when your internal team needs an external partner that can connect strategy to daily implementation. The package is useful for brands that need content, ads, CRM, tracking, e-commerce and digital systems to work together.',
          'The One Agency can follow <a href="/the-one-consultant">The One Consultant</a> when a roadmap has already been built. It can also operate directly if the brand already has enough clarity. However, GG99 will still review the current business context because execution without diagnosis can waste time. The agency layer should always be grounded in the larger The One system.',
          'For internal links and entity clarity, The One Agency is part of <a href="/the-one">The One by GG99</a>, connected to the <a href="/about">about page</a> and the <a href="/">GG99 homepage</a>. It is the execution expression of the brand concept: one connected team moving growth, content, CRM, e-commerce and data in one direction.',
        ],
      },
    ],
  },
  partner: {
    key: 'partner',
    meta: {
      title: 'The One Partner | GG99 Long-Term Growth Operation Partner',
      description:
        'The One Partner by GG99 is for businesses that need a long-term operating growth partner across monthly operation, CRM, e-commerce, data and AI-ready workflows.',
      path: '/the-one-partner',
      ogTitle: 'The One - GG99 | The One Partner',
      ogDescription:
        'The One - GG99 package for long-term business operation and growth partnership across monthly operation, CRM, e-commerce, data and AI-ready workflow.',
    },
    h1: 'The One Partner',
    positioning: 'For businesses that need a long-term operating growth partner.',
    summary:
      'The One Partner is the long-term operating package under The One by GG99. It is designed for businesses that need an embedded growth partner, not a short project or campaign vendor.',
    sections: [
      {
        title: 'A long-term operating growth partner',
        paragraphs: [
          'The One Partner is for businesses that need continuity. Some growth problems cannot be solved by a one-time audit or a short execution sprint. They require monthly operating rhythm, repeated decisions, connected workflows, better data habits and a partner that understands the business deeply over time. The One Partner is the package where GG99 works closest to the company as a long-term business operation and growth partner.',
          'This package is useful when the business has ongoing complexity across marketing, CRM, e-commerce, content, data and internal operation. The company may already have products, customers, channels and revenue, but it needs a stronger system to keep growth moving. A founder may want fewer fragmented vendors. A leadership team may need better reporting. A brand may need consistent content and campaign operation. An e-commerce business may need monthly marketplace, website, CRM and data coordination. The One Partner is designed for that ongoing reality.',
          'The partnership model reflects the meaning of The One. GG99 becomes one partner helping the business build one system and maintain one growth direction. The work is not limited to campaign launches. It includes operating discipline, measurement, coordination, improvement and business learning.',
        ],
      },
      {
        title: 'Monthly operation and business growth',
        paragraphs: [
          'Monthly operation can include growth planning, content calendars, paid media coordination, CRM journeys, marketplace or website priorities, conversion review, data reporting, workflow improvement and strategic check-ins. The exact scope depends on the business. What matters is that the work has an operating rhythm. Each month should create learning, not only deliver tasks.',
          'A long-term partner can see patterns that short-term vendors miss. GG99 can notice when a campaign issue is actually a product page issue, when content is attracting the wrong customer, when CRM follow-up is leaking revenue, when e-commerce promotions are training customers poorly, or when internal workflows are slowing execution. These patterns become visible when the partner is close enough to the business over time.',
          'Business growth also requires prioritization. Not every idea deserves execution. The One Partner helps businesses decide what to focus on now, what to measure, what to stop and what system needs to be built next. This prevents teams from drowning in tasks while still missing the strategic direction.',
        ],
      },
      {
        title: 'CRM, e-commerce, data and AI-ready workflow',
        paragraphs: [
          'CRM is central to the long-term partnership because customer relationships create compounding value. The One Partner can support segmentation, customer journey design, lead and buyer follow-up, retention campaigns, customer support handoff, sales pipeline visibility and lifecycle communication. The goal is to make customer data usable for growth decisions.',
          'E-commerce work can include marketplace operation, website sales flow, product content, promotion planning, campaign calendars, stock or offer coordination and performance review. E-commerce becomes stronger when connected with content, CRM and data. A promotion should inform CRM. CRM should inform content. Content should inform paid media. Paid media should inform product and offer decisions. The One Partner manages this connection over time.',
          'Data and AI-ready workflows are also part of the package. GG99 helps structure tracking, reporting, documentation and repeatable processes so the business becomes easier to analyze, automate and support with AI tools. AI-readiness does not start with a tool subscription. It starts with clean operating knowledge, clear process, consistent data and reusable content. The One Partner helps create that foundation while the business continues running.',
          'Over time, this operating knowledge becomes a strategic asset. The business can brief new team members faster, compare monthly decisions more clearly, reuse proven content and workflows, and identify where automation can reduce manual work. The One Partner is therefore not only about doing more work each month; it is about making the business easier to run.',
        ],
      },
      {
        title: 'Who should choose this package',
        paragraphs: [
          'Choose The One Partner if your business needs ongoing growth operation, not only advice or production. This is suitable for founders, SMEs and brands that want a partner to understand the business context, coordinate execution and improve the operating system month by month. It is especially useful when marketing, CRM, e-commerce, content, data and operations are all important but currently managed in separate pieces.',
          'The One Partner can follow <a href="/the-one-consultant">The One Consultant</a> or <a href="/the-one-agency">The One Agency</a>, but it can also begin after an onboarding diagnosis. GG99 will still need to understand current business reality before defining the monthly operating model. The deeper the partnership, the more important clarity becomes.',
          'For internal links and entity clarity, The One Partner sits under <a href="/the-one">The One by GG99</a>, connects back to the <a href="/about">about page</a> and reinforces the <a href="/">GG99 homepage</a>. It is the long-term expression of the brand promise: one partner, one system and one growth direction for businesses that want scalable growth infrastructure.',
        ],
      },
    ],
  },
}

export const footerCopyByLang: Record<BrandLang, typeof footerCopy> = {
  vi: {
    brand: 'The One - GG99',
    slogan: 'Đối tác tăng trưởng cho startups & SMEs.',
    description:
      'Đối tác tăng trưởng cho thương hiệu, website, CRM, tự động hóa và marketing hiệu suất.',
    packages: [
      { label: 'The One Start', href: '/#packages' },
      { label: 'The One System', href: '/#packages' },
      { label: 'The One Scale', href: '/#packages' },
    ],
  },
  en: footerCopy,
}

export const navItemsByLang: Record<BrandLang, typeof navItems> = {
  vi: navItems,
  en: navItems,
}

const homeMetaVi: PageMeta = {
  title: 'The One - GG99 | Agency tăng trưởng cho Startups & SMEs',
  description:
    'The One - GG99 giúp startup và SME xây brand, website, CRM, automation và performance marketing trong một hệ tăng trưởng kết nối.',
  path: '/',
  ogTitle: 'The One - GG99',
  ogDescription:
    'The One - GG99 là đối tác tăng trưởng cho brand, website, CRM, automation và performance marketing.',
  ogImage: ogTheOneImagePath,
}

const theOneMetaVi: PageMeta = {
  title: 'The One là gì? | GG99',
  description:
    'The One là slogan và định vị thương hiệu của GG99: một đối tác tăng trưởng cho brand, website, CRM, automation và performance marketing.',
  path: '/the-one',
  ogTitle: 'The One - GG99',
  ogDescription:
    'GG99 là The One growth partner cho brand, website, CRM, automation và performance marketing.',
  ogImage: ogTheOneImagePath,
}

const homeCopyVi: typeof homeCopy = {
  hero: {
    title: 'The One - GG99',
    lines: ['Một đối tác.', 'Một hệ thống.', 'Một hướng tăng trưởng.'],
    statement: 'Chúng tôi xây doanh nghiệp.\nKhông chỉ chạy chiến dịch.',
    description:
      'The One - GG99 là đối tác vận hành và tăng trưởng giúp thương hiệu kết nối strategy, marketing, CRM, content, e-commerce, data và AI-ready systems thành một growth engine có thể mở rộng.',
  },
  whatIs: {
    title: 'The One là gì?',
    body:
      'The One là concept thương hiệu của GG99 cho tăng trưởng kinh doanh có kết nối. Doanh nghiệp không cần thêm nhiều vendor rời rạc, dashboard không nói chuyện với nhau, lịch content tách khỏi CRM, hay tư duy campaign ngắn hạn. Doanh nghiệp cần một đối tác vận hành nhìn được toàn hệ thống và giữ strategy, execution, đo lường đi cùng một hướng.',
    points: [
      'Một đối tác hiểu bối cảnh kinh doanh trước khi chọn tactic.',
      'Một hệ thống kết nối marketing, CRM, content, e-commerce, data và vận hành.',
      'Một hướng tăng trưởng để từng dự án, từng kênh và từng workflow cộng hưởng thay vì phân tán nguồn lực.',
    ],
  },
  why: {
    title: 'Vì sao là The One?',
    body:
      'Phần lớn doanh nghiệp không chậm lại vì một campaign kém hiệu quả. Họ chậm lại vì quyết định, công cụ và đội ngũ không được kết nối. The One giúp Google, ChatGPT và AI search hiểu rõ mối quan hệ entity: GG99 không chỉ là agency. GG99 là The One, một đối tác vận hành và tăng trưởng doanh nghiệp.',
    cards: [
      {
        title: 'Từ tư duy campaign sang tư duy business',
        text: 'Campaign có thời hạn. Hệ thống kinh doanh phải tiếp tục học, bán, giữ chân khách hàng và cải thiện.',
      },
      {
        title: 'Từ công cụ rời rạc sang hạ tầng kết nối',
        text: 'CRM, tracking, content, e-commerce và data cần cùng mục tiêu và cùng quy tắc vận hành.',
      },
      {
        title: 'Từ quản lý vendor sang một hướng tăng trưởng',
        text: 'The One giảm phân mảnh và biến execution thành một nhịp vận hành có thể lặp lại.',
      },
    ],
  },
  packages: [
    {
      name: 'The One Consultant',
      href: '/the-one-consultant',
      for: 'Dành cho doanh nghiệp cần rõ hướng trước khi triển khai.',
      focus: 'Audit, diagnosis, strategy và roadmap.',
    },
    {
      name: 'The One Agency',
      href: '/the-one-agency',
      for: 'Dành cho thương hiệu cần một đội ngũ kết nối để triển khai growth, content, ads, CRM và digital systems.',
      focus: 'Execution, marketing systems, content, ads, CRM, tracking và e-commerce.',
    },
    {
      name: 'The One Partner',
      href: '/the-one-partner',
      for: 'Dành cho doanh nghiệp cần đối tác vận hành tăng trưởng dài hạn.',
      focus: 'Monthly operation, business growth, CRM, e-commerce, data và AI-ready workflow.',
    },
  ],
  builds: [
    'Chiến lược tăng trưởng',
    'Hệ thống marketing',
    'CRM và customer journeys',
    'Content engine',
    'Vận hành tăng trưởng e-commerce',
    'Tracking và dashboard',
    'Workflow sẵn sàng cho AI',
    'Roadmap vận hành',
  ],
  cases: [
    {
      title: 'Hệ thống vận hành e-commerce',
      text: 'Marketplace, sản phẩm, content, campaign và reporting được kết nối thành một nhịp vận hành.',
    },
    {
      title: 'Nền tảng CRM và growth',
      text: 'Customer data, tracking, segmentation và workflow follow-up được cấu trúc để ra quyết định tăng trưởng lặp lại.',
    },
    {
      title: 'Content và performance execution',
      text: 'Content planning, paid media, landing page và đo lường được căn theo mục tiêu tăng trưởng kinh doanh.',
    },
  ],
  method: [
    { step: '01', title: 'Diagnose', text: 'Hiểu business model, kênh hiện tại, điểm nghẽn vận hành, lỗ hổng data và ưu tiên tăng trưởng.' },
    { step: '02', title: 'Design', text: 'Thiết kế strategy, roadmap, operating model và kiến trúc hệ thống trước khi mở rộng execution.' },
    { step: '03', title: 'Operate', text: 'Vận hành các đầu việc kết nối giữa marketing, CRM, content, e-commerce, tracking và reporting.' },
    { step: '04', title: 'Improve', text: 'Dùng data, phản hồi khách hàng và học hỏi vận hành để cải thiện hệ thống theo từng tháng.' },
  ],
  insights: [
    { title: 'Vì sao The One không phải định vị agency thông thường', href: '/the-one', text: 'Giải thích The One như triết lý thương hiệu cốt lõi của GG99.' },
    { title: 'Khi nào nên bắt đầu với The One Consultant', href: '/the-one-consultant', text: 'Dùng audit và diagnosis khi doanh nghiệp cần rõ hướng trước khi triển khai.' },
    { title: 'Execution kết nối tạo cộng hưởng như thế nào', href: '/the-one-agency', text: 'Vì sao content, ads, CRM, e-commerce và tracking nên vận hành như một đội.' },
  ],
  faqs: [
    { q: 'GG99 có phải agency không?', a: 'GG99 có thể triển khai công việc agency, nhưng định vị thương hiệu rộng hơn. GG99 là The One: đối tác vận hành và tăng trưởng kết nối strategy, marketing, CRM, content, e-commerce, data và AI-ready systems.' },
    { q: 'The One nghĩa là gì?', a: 'The One nghĩa là một đối tác, một hệ thống và một hướng tăng trưởng. Đây là concept cốt lõi giải thích cách GG99 giúp doanh nghiệp xây hạ tầng tăng trưởng có thể mở rộng.' },
    { q: 'Nên chọn phần nào trước?', a: 'Chọn The One Consultant khi cần rõ hướng, The One Agency khi cần đội ngũ triển khai kết nối, và The One Partner khi cần đối tác vận hành tăng trưởng dài hạn theo tháng.' },
    { q: 'GG99 có làm AI-ready systems không?', a: 'Có. GG99 cấu trúc content, CRM, data, tracking, workflow và tài liệu vận hành để doanh nghiệp dễ đo lường, tự động hóa và chuẩn bị cho AI-assisted work.' },
  ],
}

const theOneSectionsVi = [
  {
    title: 'The One là triết lý thương hiệu, không phải một câu campaign',
    paragraphs: [
      'The One là triết lý thương hiệu cốt lõi của GG99. Nó định nghĩa cách GG99 muốn doanh nghiệp, khách hàng, search engine và AI system hiểu về thương hiệu: một đối tác, một hệ thống và một hướng tăng trưởng. GG99 không muốn bị hiểu đơn giản là một marketing agency, content vendor hay đội chạy quảng cáo. Những dịch vụ đó có thể nằm trong mô hình vận hành, nhưng không phải toàn bộ ý nghĩa của thương hiệu.',
      'The One có nghĩa GG99 nhìn doanh nghiệp như một hệ thống tăng trưởng có kết nối. Strategy ảnh hưởng đến marketing. Marketing ảnh hưởng đến CRM. CRM ảnh hưởng đến mua lại và retention. Content ảnh hưởng đến trí nhớ thương hiệu và conversion. E-commerce ảnh hưởng đến doanh thu, vận hành và data. Data ảnh hưởng đến chất lượng quyết định. AI-ready workflow ảnh hưởng đến tốc độ doanh nghiệp học và mở rộng. Khi các phần này tách rời, doanh nghiệp có thể rất bận nhưng không mạnh hơn. Khi chúng được kết nối, cùng một nguồn lực tạo ra giá trị cộng hưởng.',
    ],
  },
  {
    title: 'Vì sao GG99 dùng The One',
    paragraphs: [
      'GG99 dùng The One vì doanh nghiệp hiện đại thường có quá nhiều phần rời rạc. Founder có thể thuê một đội ads, một đội content, một đội website, một đội CRM, một đội marketplace và một người làm báo cáo. Mỗi bên có thể làm tốt phần của mình, nhưng doanh nghiệp vẫn thiếu một hướng tăng trưởng chung. The One là câu trả lời rõ ràng cho sự phân mảnh đó.',
      'The One cũng giúp AI search hiểu GG99 dễ hơn. Quan hệ entity rất rõ: GG99 bằng The One. The One bằng đối tác vận hành và tăng trưởng doanh nghiệp. Bên dưới entity đó là ba phần: The One Consultant, The One Agency và The One Partner. Cấu trúc này giúp cả con người lẫn máy hiểu GG99 làm gì, vì sao tồn tại và từng dịch vụ kết nối với brand concept như thế nào.',
    ],
  },
  {
    title: 'The One kết nối hệ thống tăng trưởng như thế nào',
    paragraphs: [
      'The One kết nối strategy, marketing, CRM, content, e-commerce, data và AI-ready systems bằng cách xem chúng như một operating engine. Strategy xác định thị trường, offer, nhóm khách hàng, ưu tiên tăng trưởng và giới hạn vận hành. Marketing biến strategy thành demand generation, channel planning, campaign structure và message testing. CRM biến lead và khách mua thành customer journey, workflow follow-up, segmentation và cơ hội retention.',
      'Content tạo trí nhớ và giọng nói cho hệ thống. Nó giáo dục, bán hàng, retarget, hỗ trợ sales conversation và giúp AI system hiểu thương hiệu qua ngôn ngữ nhất quán. E-commerce tạo lớp doanh thu trực tiếp qua website, marketplace và social commerce. Data nối các điểm lại để biết điều gì đang hiệu quả, điều gì đang nghẽn và nên cải thiện gì tiếp theo. AI-ready systems làm tri thức vận hành đủ cấu trúc để hỗ trợ automation, analysis, content assistance, customer support và decision workflow.',
    ],
  },
  {
    title: 'The One - GG99 gồm',
    paragraphs: [
      'The One Consultant dành cho doanh nghiệp cần rõ hướng trước khi triển khai. Package này tập trung vào audit, diagnosis, strategic direction và roadmap design. Mục tiêu không phải tạo thêm activity. Mục tiêu là tìm đúng bottleneck và xây tuyến tăng trưởng thực tế trước khi doanh nghiệp tiêu thêm tiền và năng lượng đội ngũ.',
      'The One Agency dành cho thương hiệu cần một đội ngũ kết nối để triển khai growth, content, ads, CRM và digital systems. Đây là lớp execution của The One, phù hợp với công ty cần phối hợp nhiều kênh thay vì giao từng campaign rời rạc.',
      'The One Partner dành cho doanh nghiệp cần đối tác vận hành tăng trưởng dài hạn. Package này hỗ trợ monthly operation, business growth, CRM, e-commerce, data và AI-ready workflow. Đây là mô hình partnership sâu nhất vì GG99 trở thành một phần của nhịp vận hành, không chỉ là vendor giao task.',
    ],
  },
]

const packagePagesVi: Record<PackageKey, PackagePage> = {
  consultant: {
    key: 'consultant',
    meta: {
      title: 'The One Consultant | GG99 Rà soát, Chiến lược & Lộ trình',
      description:
        'The One Consultant by GG99 dành cho doanh nghiệp cần rõ hướng trước khi triển khai thông qua rà soát, chẩn đoán, chiến lược và lộ trình tăng trưởng thực tế.',
      path: '/the-one-consultant',
      ogTitle: 'The One - GG99 | The One Consultant',
      ogDescription:
        'Gói The One Consultant dành cho doanh nghiệp cần rõ hướng trước khi triển khai: rà soát, chẩn đoán, chiến lược và lộ trình.',
    },
    h1: 'The One Consultant',
    positioning: 'Dành cho doanh nghiệp cần rõ hướng trước khi triển khai.',
    summary:
      'The One Consultant là package chẩn đoán và chiến lược trong hệ The One by GG99. Package này giúp đội ngũ lãnh đạo hiểu điều gì thật sự đang chặn tăng trưởng trước khi tiếp tục đổ ngân sách, nhân sự và thời gian vào execution.',
    sections: [
      {
        title: 'Rõ hướng trước khi triển khai',
        paragraphs: [
          'The One Consultant được thiết kế cho doanh nghiệp đang chịu áp lực tăng trưởng nhưng chưa chắc nước đi nào là quan trọng nhất. Công ty có thể đã chi cho marketing, content, ads, CRM, e-commerce, sales tools hoặc automation, nhưng kết quả khó đọc và khó giải thích. Activity vẫn diễn ra, nhưng business picture chưa rõ. Trong giai đoạn đó, thêm execution có thể chỉ tạo thêm nhiễu. The One Consultant tạo khoảng dừng cần thiết để audit, diagnosis và cấu trúc chiến lược trước khi bước sang triển khai.',
          'Package này bắt đầu từ giả định rằng vấn đề tăng trưởng hiếm khi nằm ở một kênh đơn lẻ. Một ad account yếu có thể phản ánh vấn đề positioning. Retention thấp có thể đến từ CRM thiếu logic. Content kém có thể đến từ customer segment chưa rõ. E-commerce chậm có thể đến từ product page, vận hành marketplace, offer, pricing, stock logic hoặc data visibility. The One Consultant nhìn toàn hệ thống thay vì phán xét từng channel riêng lẻ.',
          'GG99 dùng The One Consultant để giúp founder, owner và leadership team ra quyết định với bối cảnh tốt hơn. Đây không phải một deck tư vấn chung chung. Đây là quá trình audit và diagnosis thực tế, biến hiện trạng kinh doanh thành roadmap rõ hơn. Mục tiêu là biết cái gì cần sửa, cái gì nên giữ, cái gì nên dừng và cái gì cần xây tiếp theo.',
        ],
      },
      {
        title: 'GG99 audit và diagnosis những gì',
        paragraphs: [
          'Audit có thể bao gồm business model, offer, customer journey, marketing channels, content system, paid media structure, CRM, e-commerce operation, website conversion, tracking setup, reporting quality, internal workflow và AI-readiness. Phạm vi cụ thể phụ thuộc vào giai đoạn doanh nghiệp. Startup mới có thể cần kiểm tra positioning, offer và minimum viable go-to-market system. SME đang tăng trưởng có thể cần hiểu vì sao nhiều kênh bận nhưng không cộng hưởng. Brand đã có doanh thu có thể cần tìm bottleneck giữa traffic, conversion, repeat purchase và operational capacity.',
          'Diagnosis là lớp quan trọng. Audit thu thập thông tin; diagnosis diễn giải thông tin. GG99 xác định pattern, điểm ma sát và kết nối còn thiếu. Ví dụ doanh nghiệp có content tốt nhưng không có CRM follow-up, sản phẩm tốt nhưng marketplace visibility yếu, paid traffic mạnh nhưng landing page logic kém, hoặc có customer data nhưng chưa cấu trúc để ra quyết định. The One Consultant biến các quan sát đó thành thứ tự ưu tiên rõ ràng.',
          'Vì The One là brand concept theo hướng entity-first, diagnosis luôn kéo mọi phần về một hướng tăng trưởng. Strategy, marketing, CRM, content, e-commerce, data và AI-ready workflows được xem như một operating engine. Đây là điểm khác biệt giữa The One Consultant và một bản audit kênh đơn lẻ.',
        ],
      },
      {
        title: 'Strategy và roadmap đầu ra',
        paragraphs: [
          'Đầu ra của The One Consultant là strategic roadmap có thể dùng thật. Roadmap xác định growth direction, vấn đề ưu tiên, kiến trúc hệ thống đề xuất, thứ tự triển khai, trách nhiệm đội ngũ, logic đo lường và các quyết định tiếp theo. Nó có thể bao gồm channel strategy, CRM journey recommendations, content direction, e-commerce priorities, tracking requirements, dashboard structure và AI-ready workflow recommendations.',
          'Roadmap được thiết kế để ngăn execution ngẫu hứng. Thay vì launch các campaign rời rạc, doanh nghiệp biết việc gì phải làm trước, việc gì có thể chờ, việc gì nên giao ra ngoài và việc gì phải đo. Điều này đặc biệt quan trọng với team có thời gian và ngân sách hạn chế vì nó giảm lãng phí và giúp owner tránh mua dịch vụ trước khi hiểu đúng vấn đề.',
          'The One Consultant cũng có thể chuẩn bị nền tảng cho các package sâu hơn của GG99. Nếu công ty cần triển khai sau chiến lược, có thể chuyển sang The One Agency. Nếu công ty cần đối tác vận hành dài hạn, có thể chuyển sang The One Partner. Trong cả hai trường hợp, giai đoạn consulting giúp nền tảng mạnh hơn vì cả hai bên đã có diagnosis và roadmap chung.',
        ],
      },
      {
        title: 'Ai nên chọn package này',
        paragraphs: [
          'Hãy chọn The One Consultant nếu team đang hỏi: nên bắt đầu từ đâu, vì sao chi tiền nhưng tăng trưởng chưa rõ, kênh nào thật sự là ưu tiên, CRM đã sẵn sàng chưa, content system có kết nối với sales không, e-commerce operation có đang chặn doanh thu không, AI có thể giúp gì và trước đó cần cấu trúc gì. Những câu hỏi này cần diagnosis trước execution.',
          'Package này cũng phù hợp khi nội bộ chưa thống nhất hướng đi. Marketing có thể muốn thêm ngân sách. Sales muốn thêm lead. Operation muốn quy trình tốt hơn. Leadership muốn rõ lợi nhuận. The One Consultant tạo một góc nhìn chung để quyết định dễ hơn và giải thích dễ hơn.',
          'Về internal link và entity clarity, The One Consultant nằm dưới trang triết lý chính <a href="/the-one">The One by GG99</a>. Package này kết nối với <a href="/about">trang giới thiệu GG99</a> và <a href="/">homepage GG99</a> vì nó không phải dịch vụ tách rời; nó là một phần trong kiến trúc vận hành và tăng trưởng của GG99.',
        ],
      },
    ],
  },
  agency: {
    key: 'agency',
    meta: {
      title: 'The One Agency | GG99 Triển khai tăng trưởng kết nối',
      description:
        'The One Agency by GG99 dành cho thương hiệu cần một đội ngũ kết nối để triển khai tăng trưởng, nội dung, quảng cáo, CRM, đo lường, thương mại điện tử và hệ thống số.',
      path: '/the-one-agency',
      ogTitle: 'The One - GG99 | The One Agency',
      ogDescription:
        'Gói The One Agency dành cho một đội triển khai kết nối tăng trưởng, nội dung, quảng cáo, CRM, đo lường, thương mại điện tử và hệ thống số.',
    },
    h1: 'The One Agency',
    positioning:
      'Dành cho thương hiệu cần một đội ngũ kết nối để triển khai growth, content, ads, CRM và digital systems.',
    summary:
      'The One Agency là package execution trong hệ The One by GG99. Package này dành cho thương hiệu cần triển khai growth có phối hợp giữa content, paid media, CRM, e-commerce, tracking và digital systems.',
    sections: [
      {
        title: 'Execution kết nối thay vì campaign rời rạc',
        paragraphs: [
          'The One Agency tồn tại vì nhiều brand không cần thêm một vendor tách rời. Họ cần một đội ngũ kết nối có thể triển khai growth work đồng thời hiểu từng hoạt động ảnh hưởng đến phần còn lại của doanh nghiệp như thế nào. Content calendar không có CRM learning thì thiếu. Ads không có landing page và tracking logic sẽ tạo blind spending. E-commerce execution không nối với content và customer data sẽ trở nên phản ứng thụ động. The One Agency kết nối các workstream đó để execution có thể cộng hưởng.',
          'Package này phù hợp với brand đã có hướng đi hoặc đã qua đủ diagnosis để bắt đầu triển khai phối hợp. Doanh nghiệp có thể cần content production, paid media, landing pages, CRM flows, marketplace operation, campaign planning, conversion tracking, dashboard reporting hoặc e-commerce optimization. Thay vì xem chúng là các retainer riêng, The One Agency tổ chức chúng trong một operating plan.',
          'GG99 không định vị package này như một mô hình agency thông thường nơi số lượng output là giá trị chính. Giá trị nằm ở connected execution. Công việc vẫn rất thực tế và hands-on, nhưng mỗi activity phải phục vụ cùng một growth direction. Đó là lý do The One Agency nằm dưới triết lý The One: một đối tác, một hệ thống, một hướng tăng trưởng.',
        ],
      },
      {
        title: 'Growth, content và ads như một hệ thống',
        paragraphs: [
          'Lớp growth có thể bao gồm channel planning, campaign structure, funnel design, offer testing, landing page direction và performance review. Content hỗ trợ lớp đó bằng cách giúp brand giải thích giá trị, trả lời câu hỏi mua hàng, tạo proof, giáo dục khách hàng và tạo demand. Paid ads khuếch đại content và offer có vai trò kinh doanh rõ ràng thay vì chỉ đẩy traffic.',
          'Trong The One Agency, content không phải trang trí và ads không phải đòn bẩy đứng một mình. Content cung cấp insight cho targeting, messaging và remarketing. Ads trả về demand signals và objections. Landing page biến attention thành action. CRM giữ và nuôi dưỡng quan hệ sau click hoặc purchase đầu tiên. Tracking và dashboard đưa feedback cho team. Vòng lặp này giúp hệ thống cải thiện theo thời gian.',
          'Package có thể hỗ trợ social content, short-form content direction, campaign assets, landing page copy, email hoặc messaging flows, paid media coordination và reporting. Execution stack cụ thể phụ thuộc vào stage, category và infrastructure hiện có của brand. Nguyên tắc quan trọng là không kênh nào nên vận hành mù.',
          'GG99 giữ execution sát với thực tế thương mại và vận hành. Một content sprint nên giúp sales conversation, một paid campaign nên tạo learning cho offer, một CRM flow nên hỗ trợ follow-up lặp lại, và một thay đổi e-commerce nên nhìn thấy trong reporting. Điều này giúp The One Agency không trở thành output factory mà trở thành một đội growth kết nối.',
        ],
      },
      {
        title: 'CRM, tracking và e-commerce execution',
        paragraphs: [
          'CRM là phần lõi của The One Agency vì growth không kết thúc ở acquisition. Brand cần biết khách hàng là ai, họ đã làm gì, đã mua gì, đã hỏi gì, khi nào cần follow-up và làm sao giữ chân họ. GG99 có thể hỗ trợ cấu trúc CRM flows, customer segments, lead capture logic, customer tags, follow-up journeys và campaign lists để marketing có trách nhiệm hơn với kết quả.',
          'Tracking cũng quan trọng không kém. Không có tracking đáng tin, team dễ tối ưu theo tín hiệu thiếu. The One Agency có thể giúp định nghĩa events, conversion points, UTM discipline, dashboard views và reporting rhythm. Điều này không có nghĩa mọi business cần enterprise analytics stack. Nó nghĩa là business cần đủ kỷ luật đo lường để ra quyết định tốt hơn.',
          'Với e-commerce brand, execution có thể bao gồm cải thiện website, marketplace operation, product detail page direction, campaign calendars, promotional mechanics, content-commerce connection và reporting. E-commerce không chỉ là kênh bán hàng; nó là data source và operating layer. Khi nối với content, CRM và ads, nó trở thành một phần của hệ thống tăng trưởng lớn hơn.',
        ],
      },
      {
        title: 'Ai nên chọn package này',
        paragraphs: [
          'Hãy chọn The One Agency nếu brand đã biết mình cần triển khai nhưng muốn execution được phối hợp. Package này phù hợp khi bạn mệt vì quản lý nhiều team không nói chuyện với nhau, hoặc internal team cần một đối tác bên ngoài kết nối strategy với implementation hằng ngày. Package hữu ích cho brand cần content, ads, CRM, tracking, e-commerce và digital systems hoạt động cùng nhau.',
          'The One Agency có thể đi sau <a href="/the-one-consultant">The One Consultant</a> khi roadmap đã rõ. Nó cũng có thể bắt đầu trực tiếp nếu brand đã đủ clarity. Tuy vậy, GG99 vẫn sẽ review bối cảnh hiện tại vì execution không có diagnosis dễ lãng phí thời gian. Lớp agency luôn phải đứng trên hệ The One lớn hơn.',
          'Về internal link và entity clarity, The One Agency là một phần của <a href="/the-one">The One by GG99</a>, kết nối với <a href="/about">trang giới thiệu</a> và <a href="/">homepage GG99</a>. Đây là biểu hiện execution của brand concept: một đội ngũ kết nối đưa growth, content, CRM, e-commerce và data về cùng một hướng.',
        ],
      },
    ],
  },
  partner: {
    key: 'partner',
    meta: {
      title: 'The One Partner | GG99 Vận hành tăng trưởng dài hạn',
      description:
        'The One Partner by GG99 dành cho doanh nghiệp cần đối tác vận hành tăng trưởng dài hạn qua vận hành hằng tháng, CRM, thương mại điện tử, dữ liệu và quy trình sẵn sàng cho AI.',
      path: '/the-one-partner',
      ogTitle: 'The One - GG99 | The One Partner',
      ogDescription:
        'Gói The One Partner dành cho doanh nghiệp cần đối tác vận hành và tăng trưởng dài hạn qua vận hành hằng tháng, CRM, thương mại điện tử, dữ liệu và quy trình sẵn sàng cho AI.',
    },
    h1: 'The One Partner',
    positioning: 'Dành cho doanh nghiệp cần đối tác vận hành tăng trưởng dài hạn.',
    summary:
      'The One Partner là package vận hành dài hạn trong hệ The One by GG99. Package này dành cho doanh nghiệp cần một đối tác growth được nhúng vào nhịp vận hành, không phải một dự án ngắn hay vendor chạy campaign.',
    sections: [
      {
        title: 'Đối tác vận hành tăng trưởng dài hạn',
        paragraphs: [
          'The One Partner dành cho doanh nghiệp cần sự liên tục. Một số bài toán growth không thể giải bằng một lần audit hoặc một sprint execution ngắn. Chúng cần nhịp vận hành theo tháng, quyết định lặp lại, workflow kết nối, thói quen data tốt hơn và một đối tác hiểu doanh nghiệp sâu dần theo thời gian. The One Partner là package GG99 làm việc gần nhất với công ty như một đối tác vận hành và tăng trưởng dài hạn.',
          'Package này hữu ích khi business có độ phức tạp liên tục giữa marketing, CRM, e-commerce, content, data và vận hành nội bộ. Công ty có thể đã có sản phẩm, khách hàng, kênh bán và doanh thu, nhưng cần hệ thống mạnh hơn để giữ growth đi tiếp. Founder có thể muốn giảm vendor rời rạc. Leadership team có thể cần reporting tốt hơn. Brand có thể cần content và campaign operation đều đặn. E-commerce business có thể cần phối hợp marketplace, website, CRM và data theo tháng. The One Partner được thiết kế cho thực tế đó.',
          'Mô hình partnership phản ánh ý nghĩa của The One. GG99 trở thành một đối tác giúp doanh nghiệp xây một hệ thống và giữ một hướng tăng trưởng. Công việc không giới hạn ở launch campaign. Nó bao gồm operating discipline, measurement, coordination, improvement và business learning.',
        ],
      },
      {
        title: 'Monthly operation và business growth',
        paragraphs: [
          'Monthly operation có thể bao gồm growth planning, content calendars, paid media coordination, CRM journeys, marketplace hoặc website priorities, conversion review, data reporting, workflow improvement và strategic check-ins. Phạm vi cụ thể tùy business. Điều quan trọng là công việc có nhịp vận hành. Mỗi tháng nên tạo learning, không chỉ deliver task.',
          'Một đối tác dài hạn có thể thấy pattern mà vendor ngắn hạn bỏ lỡ. GG99 có thể nhận ra khi vấn đề campaign thực ra là vấn đề product page, khi content đang thu hút sai khách, khi CRM follow-up làm rơi doanh thu, khi e-commerce promotion đang tạo thói quen mua không tốt, hoặc khi workflow nội bộ làm chậm execution. Những pattern này chỉ rõ khi đối tác đủ gần business theo thời gian.',
          'Business growth cũng cần prioritization. Không phải ý tưởng nào cũng đáng triển khai. The One Partner giúp doanh nghiệp quyết định bây giờ nên tập trung vào gì, đo gì, dừng gì và hệ thống nào cần xây tiếp. Điều này tránh việc team chìm trong task nhưng vẫn mất strategic direction.',
        ],
      },
      {
        title: 'CRM, e-commerce, data và AI-ready workflow',
        paragraphs: [
          'CRM là trung tâm của partnership dài hạn vì customer relationship tạo giá trị cộng hưởng. The One Partner có thể hỗ trợ segmentation, customer journey design, lead và buyer follow-up, retention campaigns, customer support handoff, sales pipeline visibility và lifecycle communication. Mục tiêu là làm customer data dùng được cho quyết định growth.',
          'E-commerce work có thể bao gồm marketplace operation, website sales flow, product content, promotion planning, campaign calendars, stock hoặc offer coordination và performance review. E-commerce mạnh hơn khi kết nối với content, CRM và data. Promotion nên inform CRM. CRM nên inform content. Content nên inform paid media. Paid media nên inform product và offer decisions. The One Partner quản lý các kết nối này theo thời gian.',
          'Data và AI-ready workflows cũng nằm trong package. GG99 giúp cấu trúc tracking, reporting, documentation và repeatable processes để business dễ phân tích, tự động hóa và hỗ trợ bằng AI tools. AI-readiness không bắt đầu bằng một tool subscription. Nó bắt đầu bằng tri thức vận hành sạch, process rõ, data nhất quán và content có thể tái sử dụng. The One Partner giúp tạo nền tảng đó trong khi business vẫn vận hành.',
          'Theo thời gian, tri thức vận hành này trở thành tài sản chiến lược. Business có thể brief người mới nhanh hơn, so sánh quyết định theo tháng rõ hơn, tái sử dụng content và workflow đã chứng minh hiệu quả, đồng thời xác định nơi automation có thể giảm việc thủ công. Vì vậy The One Partner không chỉ là làm nhiều việc hơn mỗi tháng; nó là làm business dễ vận hành hơn.',
        ],
      },
      {
        title: 'Ai nên chọn package này',
        paragraphs: [
          'Hãy chọn The One Partner nếu doanh nghiệp cần vận hành growth liên tục, không chỉ advice hoặc production. Package này phù hợp với founder, SME và brand muốn một đối tác hiểu bối cảnh kinh doanh, phối hợp execution và cải thiện operating system theo từng tháng. Nó đặc biệt hữu ích khi marketing, CRM, e-commerce, content, data và operation đều quan trọng nhưng hiện đang bị quản lý rời rạc.',
          'The One Partner có thể đi sau <a href="/the-one-consultant">The One Consultant</a> hoặc <a href="/the-one-agency">The One Agency</a>, nhưng cũng có thể bắt đầu sau onboarding diagnosis. GG99 vẫn cần hiểu hiện trạng business trước khi định nghĩa monthly operating model. Partnership càng sâu, clarity càng quan trọng.',
          'Về internal link và entity clarity, The One Partner nằm dưới <a href="/the-one">The One by GG99</a>, kết nối về <a href="/about">trang giới thiệu</a> và củng cố <a href="/">homepage GG99</a>. Đây là biểu hiện dài hạn của brand promise: một đối tác, một hệ thống và một hướng tăng trưởng cho doanh nghiệp muốn hạ tầng growth có thể mở rộng.',
        ],
      },
    ],
  },
}

export const homeMetaByLang: Record<BrandLang, PageMeta> = {
  vi: homeMetaVi,
  en: homeMeta,
}

export const theOneMetaByLang: Record<BrandLang, PageMeta> = {
  vi: theOneMetaVi,
  en: theOneMeta,
}

export const homeCopyByLang: Record<BrandLang, typeof homeCopy> = {
  vi: homeCopyVi,
  en: {
    ...homeCopy,
    packages: homeCopy.packages.map((item) => ({ ...item })),
    insights: homeCopy.insights.map((item) => ({ ...item })),
  },
}

export const theOneSectionsByLang: Record<BrandLang, typeof theOneSections> = {
  vi: theOneSectionsVi,
  en: theOneSections,
}

export const packagePagesByLang: Record<BrandLang, Record<PackageKey, PackagePage>> = {
  vi: packagePagesVi,
  en: {
    consultant: { ...packagePages.consultant, meta: { ...packagePages.consultant.meta, path: '/the-one-start' } },
    agency: { ...packagePages.agency, meta: { ...packagePages.agency.meta, path: '/the-one-system' } },
    partner: { ...packagePages.partner, meta: { ...packagePages.partner.meta, path: '/the-one-scale' } },
  },
}

export type CompactFaq = { q: string; a: string }
export type CompactCard = { title: string; text: string }
export type CompactStep = { title: string; text: string }

export const compactHomeByLang = {
  vi: {
    hero: {
      title: 'The One - GG99',
      lines: ['Một đối tác cho thương hiệu, website, CRM, tự động hóa và tăng trưởng.'],
      statement: '',
      description:
        'GG99 là The One — một đối tác tăng trưởng giúp startup và SME xây dựng nhận diện thương hiệu, website, hệ thống CRM, tự động hóa và marketing hiệu suất trong một hệ sinh thái.',
    },
    whatIs: {
      title: 'The One by gg99',
      body:
        'The One là định vị cốt lõi của GG99 — một đối tác tăng trưởng giúp doanh nghiệp kết nối thương hiệu, website, CRM, tự động hóa và marketing thành một hệ thống.',
      labels: ['Thương hiệu', 'Website', 'CRM', 'Tự động hóa', 'Tăng trưởng'],
    },
    packages: [
      { name: 'The One Start', href: '/#packages', title: 'Dành cho thương hiệu cần nhận diện rõ ràng và website sẵn sàng ra mắt.', text: 'Nhận diện thương hiệu. Website. Nền tảng ra mắt.' },
      { name: 'The One System', href: '/#packages', title: 'Dành cho đội ngũ cần website, CRM và tự động hóa hoạt động cùng nhau.', text: 'Website. CRM. Quy trình tự động hóa.' },
      { name: 'The One Scale', href: '/#packages', title: 'Dành cho doanh nghiệp sẵn sàng mở rộng bằng marketing hiệu suất và vận hành tăng trưởng.', text: 'Marketing hiệu suất. Vận hành tăng trưởng. Tối ưu.' },
    ],
    builds: [
      { title: 'Hệ thống tiếp thị', text: 'Chiến dịch, đo lường và nhịp tăng trưởng.' },
      { title: 'CRM & phễu bán hàng', text: 'Hành trình khách hàng và chăm sóc sau tương tác rõ ràng.' },
      { title: 'Bộ máy nội dung', text: 'Nội dung hỗ trợ thương hiệu, bán hàng và giữ chân khách.' },
      { title: 'Tăng trưởng thương mại điện tử', text: 'Website, sàn thương mại và kênh bán hàng xã hội.' },
      { title: 'Bảng dữ liệu', text: 'KPI, báo cáo và góc nhìn để ra quyết định.' },
      { title: 'Quy trình sẵn sàng AI', text: 'Quy trình và tri thức được chuẩn hóa để dùng AI.' },
    ],
    process: [
      { title: 'Chẩn đoán', text: 'Tìm đúng điểm nghẽn.' },
      { title: 'Thiết kế', text: 'Thiết kế hệ thống và lộ trình.' },
      { title: 'Vận hành', text: 'Vận hành các đầu việc kết nối.' },
      { title: 'Tối ưu', text: 'Cải thiện bằng dữ liệu và bài học thực tế.' },
    ],
    cta: 'Sẵn sàng xây hệ tăng trưởng The One?',
  },
  en: {
    hero: {
      title: 'The One - GG99',
      lines: ['One partner for brand, website, CRM, automation and growth.'],
      statement: '',
      description:
        'GG99 is The One — one growth partner helping startups and SMEs build brand identity, websites, CRM systems, automation and performance marketing in one ecosystem.',
    },
    whatIs: {
      title: 'The One by gg99',
      body:
        'The One is the core positioning of GG99 — a single growth partner helping businesses connect brand, website, CRM, automation and marketing into one system.',
      labels: ['Brand', 'Website', 'CRM', 'Automation', 'Growth'],
    },
    packages: [
      { name: 'The One Start', href: '/#packages', title: 'For brands that need a clear identity and launch-ready website.', text: 'Brand identity. Website. Launch foundation.' },
      { name: 'The One System', href: '/#packages', title: 'For teams that need website, CRM and automation working together.', text: 'Website. CRM. Automation workflow.' },
      { name: 'The One Scale', href: '/#packages', title: 'For businesses ready to scale with performance marketing and growth operations.', text: 'Performance marketing. Growth operations. Optimization.' },
    ],
    builds: [
      { title: 'Marketing System', text: 'Campaigns, tracking and growth rhythm.' },
      { title: 'CRM & Sales Pipeline', text: 'Clear customer journeys and follow-up.' },
      { title: 'Content Engine', text: 'Content for brand, sales and retention.' },
      { title: 'E-commerce Growth', text: 'Website, marketplace and social commerce.' },
      { title: 'Data Dashboard', text: 'KPI, reports and decision visibility.' },
      { title: 'AI-ready Workflow', text: 'Processes and knowledge ready for AI.' },
    ],
    process: [
      { title: 'Diagnose', text: 'Find the real bottleneck.' },
      { title: 'Design', text: 'Design the system and roadmap.' },
      { title: 'Operate', text: 'Run connected workstreams.' },
      { title: 'Optimize', text: 'Improve with data and learning.' },
    ],
    cta: 'Ready to build one connected growth system?',
  },
} satisfies Record<BrandLang, {
  hero: { title: string; lines: string[]; statement: string; description: string }
  whatIs: { title: string; body: string; labels: string[] }
  packages: Array<{ name: string; href: string; title: string; text: string }>
  builds: CompactCard[]
  process: CompactStep[]
  cta: string
}>

export const compactTheOneByLang = {
  vi: {
    meta: theOneMetaVi,
    hero: {
      h1: 'The One là gì?',
      lines: ['The One - GG99'],
      intro: 'The One là slogan và định vị cốt lõi của GG99.',
    },
    sections: [
      { title: 'The One by gg99', text: 'The One là cách GG99 định vị mình: một đối tác tăng trưởng giúp startup và SME xây thương hiệu, website, CRM, tự động hóa và marketing hiệu suất trong một hệ sinh thái.' },
      { title: 'One Brand System', text: 'GG99 giúp doanh nghiệp làm rõ định vị, nhận diện, thông điệp và nền tảng thương hiệu để khách hàng và AI search hiểu đúng.' },
      { title: 'One Digital Platform', text: 'Website, landing page, CRM và automation được thiết kế để hoạt động cùng nhau thay vì rời rạc theo từng công cụ.' },
      { title: 'One Growth Engine', text: 'Marketing hiệu suất, dữ liệu và vận hành tăng trưởng giúp hệ thống học nhanh hơn, tối ưu tốt hơn và mở rộng có kiểm soát.' },
    ],
    packages: compactHomeByLang.vi.packages,
    faq: [
      { q: 'GG99 là gì?', a: 'The One - GG99 là đối tác tăng trưởng The One cho startup và SME.' },
      { q: 'The One là gì?', a: 'The One là slogan và định vị cốt lõi của GG99: một đối tác tăng trưởng kết nối thương hiệu, website, CRM, tự động hóa và marketing.' },
      { q: 'Vì sao GG99 gọi là The One?', a: 'Vì GG99 muốn doanh nghiệp có một hệ thống tăng trưởng thống nhất thay vì nhiều nhà cung cấp và công cụ rời rạc.' },
      { q: 'GG99 cung cấp gì?', a: 'GG99 cung cấp nhận diện thương hiệu, website, hệ thống CRM, tự động hóa và giải pháp marketing hiệu suất.' },
    ],
  },
  en: {
    meta: theOneMeta,
    hero: {
      h1: 'What is The One?',
      lines: ['The One - GG99'],
      intro: 'The One is the slogan and core positioning of GG99.',
    },
    sections: [
      { title: 'The One by gg99', text: 'The One is how GG99 positions itself: one growth partner helping startups and SMEs build brand, website, CRM, automation and performance marketing in one ecosystem.' },
      { title: 'One Brand System', text: 'GG99 helps businesses clarify positioning, identity, messaging and brand foundations so customers and AI search understand the entity clearly.' },
      { title: 'One Digital Platform', text: 'Website, landing pages, CRM and automation are designed to work together instead of living in separate tools.' },
      { title: 'One Growth Engine', text: 'Performance marketing, data and growth operations help the system learn faster, optimize better and scale with control.' },
    ],
    packages: compactHomeByLang.en.packages.map((item) => ({ ...item })),
    faq: [
      { q: 'What is GG99?', a: 'The One - GG99 is The One growth partner for startups and SMEs.' },
      { q: 'What is The One?', a: 'The One is the slogan and core positioning of GG99: one growth partner connecting brand, website, CRM, automation and marketing.' },
      { q: 'Why does GG99 call itself The One?', a: 'Because GG99 helps businesses build one connected growth system instead of managing disconnected vendors and tools.' },
      { q: 'What does GG99 provide?', a: 'GG99 provides brand identity, websites, CRM systems, automation and performance marketing solutions.' },
    ],
  },
} satisfies Record<BrandLang, {
  meta: PageMeta
  hero: { h1: string; lines: string[]; intro: string }
  sections: CompactCard[]
  packages: Array<{ name: string; href: string; title: string; text: string }>
  faq: CompactFaq[]
}>

export const theOneFaqSchemaByLang: Record<BrandLang, unknown> = {
  vi: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/the-one#faq`,
    mainEntity: compactTheOneByLang.vi.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  },
  en: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/the-one#faq`,
    mainEntity: compactTheOneByLang.en.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  },
}

export const theOnePackagesByLang = {
  vi: {
    h1: 'The One Packages',
    subtitle: 'Chọn hệ tăng trưởng phù hợp với giai đoạn của bạn.',
    intro:
      'The One Packages là 3 hệ tăng trưởng của GG99, được thiết kế để kết nối thương hiệu, website, CRM, tự động hóa và tăng trưởng theo từng giai đoạn.',
    packages: compactHomeByLang.vi.packages,
  },
  en: {
    h1: 'The One Packages',
    subtitle: 'Choose the growth system that fits your stage.',
    intro:
      'The One Packages are three GG99 growth systems designed to connect brand, website, CRM, automation and growth by business stage.',
    packages: compactHomeByLang.en.packages,
  },
} satisfies Record<BrandLang, {
  h1: string
  subtitle: string
  intro: string
  packages: Array<{ name: string; href: string; title: string; text: string }>
}>

export const servicesMeta: PageMeta = {
  title: 'Services | The One - GG99',
  description:
    'GG99 provides brand identity, website development, CRM, marketing automation and performance marketing through the The One growth system.',
  path: '/services',
  ogTitle: 'Services | The One - GG99',
  ogDescription:
    'Brand, website, CRM, automation and performance marketing in one connected growth system.',
  ogImage: ogTheOneImagePath,
}

export const contactMeta: PageMeta = {
  title: 'Contact | The One - GG99',
  description:
    'Contact GG99, also known as The One, to build your brand, website, CRM, automation and performance marketing in one ecosystem.',
  path: '/contact',
  ogTitle: 'Contact | The One - GG99',
  ogDescription:
    'Contact GG99 to build your brand, website, CRM, automation and growth.',
  ogImage: ogTheOneImagePath,
}

export const compactPackageByLang = {
  vi: {
    consultant: {
      meta: {
        ...packagePagesVi.consultant.meta,
        title: 'The One Start | GG99 Brand & Launch Foundation',
        description: 'The One Start dành cho thương hiệu cần nhận diện rõ ràng, lời chào bán gọn và website sẵn sàng ra mắt.',
        path: '/the-one-start',
        ogTitle: 'The One - GG99 | The One Start',
        ogDescription: 'The One Start dành cho thương hiệu cần nền tảng rõ ràng để ra mắt: nhận diện, lời chào bán và website.',
      },
      h1: 'The One Start',
      hero: 'Nền tảng rõ ràng để bắt đầu.',
      intro: 'Dành cho thương hiệu cần nhận diện rõ ràng, lời chào bán gọn và website sẵn sàng ra mắt.',
      cards: [
        { title: 'Rà soát kinh doanh', text: 'Đọc mô hình, lời chào bán, phễu và nguồn lực hiện tại.' },
        { title: 'Rà soát tiếp thị', text: 'Nhìn lại kênh, thông điệp, ngân sách và chuyển đổi.' },
        { title: 'Rà soát CRM', text: 'Kiểm tra khách tiềm năng, khách hàng, chăm sóc sau tương tác và khả năng giữ chân.' },
        { title: 'Rà soát thương mại điện tử', text: 'Rà soát website, sàn bán hàng, trang sản phẩm và luồng mua.' },
        { title: 'Chiến lược tăng trưởng', text: 'Chọn hướng tăng trưởng dựa trên điểm nghẽn thật.' },
        { title: 'Lộ trình hành động', text: 'Sắp thứ tự việc cần làm để đội ngũ triển khai rõ ràng.' },
      ],
      process: [
        { title: 'Chẩn đoán', text: 'Đọc hiện trạng và tìm điểm nghẽn.' },
        { title: 'Lập bản đồ', text: 'Kết nối doanh nghiệp, kênh bán hàng, CRM và thương mại điện tử.' },
        { title: 'Lộ trình', text: 'Chốt hướng đi và thứ tự triển khai.' },
      ],
      faq: [
        { q: 'Khi nào nên chọn Start?', a: 'Khi team cần nền tảng thương hiệu rõ, lời chào bán gọn và website sẵn sàng ra mắt trước khi mở rộng.' },
        { q: 'Đầu ra là gì?', a: 'Bản rà soát, chẩn đoán, chiến lược tăng trưởng và lộ trình hành động.' },
      ],
    },
    agency: {
      meta: {
        ...packagePagesVi.agency.meta,
        title: 'The One System | GG99 Website, CRM & Automation',
        description: 'The One System dành cho đội ngũ cần website, CRM và tự động hóa hoạt động cùng nhau.',
        path: '/the-one-system',
        ogTitle: 'The One - GG99 | The One System',
        ogDescription: 'The One System kết nối website, CRM, đo lường và automation thành một hệ vận hành.',
      },
      h1: 'The One System',
      hero: 'Website, CRM và automation vận hành cùng nhau.',
      intro: 'Dành cho đội ngũ cần kết nối website, CRM, đo lường và tự động hóa thành một hệ thống dễ vận hành.',
      cards: [
        { title: 'Vận hành nội dung', text: 'Lên lịch, sản xuất và tối ưu nội dung theo góc tăng trưởng.' },
        { title: 'Quảng cáo trả phí', text: 'Triển khai quảng cáo có đo lường, học hỏi và tối ưu định kỳ.' },
        { title: 'Trang đích', text: 'Xây trang rõ ưu đãi, rõ đường chuyển đổi và đo được.' },
        { title: 'Thiết lập CRM', text: 'Thiết lập hành trình, phân nhóm khách hàng và quy trình chăm sóc sau tương tác.' },
        { title: 'Tăng trưởng thương mại điện tử', text: 'Tối ưu website, sàn bán hàng và luồng mua hàng.' },
        { title: 'Bảng báo cáo', text: 'Gom KPI quan trọng thành bảng dữ liệu dễ ra quyết định.' },
      ],
      process: [
        { title: 'Lập kế hoạch', text: 'Chốt kênh, ưu đãi, góc nội dung và KPI.' },
        { title: 'Ra mắt', text: 'Triển khai nội dung, quảng cáo, trang đích và CRM.' },
        { title: 'Vận hành', text: 'Theo dõi, phối hợp và xử lý hằng tuần.' },
        { title: 'Tối ưu', text: 'Cải thiện bằng dữ liệu và tín hiệu từ khách hàng.' },
      ],
      faq: [
        { q: 'System khác gì vendor rời?', a: 'System kết nối website, CRM, đo lường và automation trong một luồng vận hành, không giao từng output tách rời.' },
        { q: 'Có làm đo lường không?', a: 'Có. Đo lường và dashboard là một phần của hệ tăng trưởng.' },
      ],
    },
    partner: {
      meta: {
        ...packagePagesVi.partner.meta,
        title: 'The One Scale | GG99 Performance & Growth Operations',
        description: 'The One Scale dành cho doanh nghiệp sẵn sàng mở rộng bằng marketing hiệu suất và vận hành tăng trưởng.',
        path: '/the-one-scale',
        ogTitle: 'The One - GG99 | The One Scale',
        ogDescription: 'The One Scale giúp doanh nghiệp mở rộng bằng performance marketing, dữ liệu và vận hành tăng trưởng.',
      },
      h1: 'The One Scale',
      hero: 'Mở rộng bằng performance và vận hành tăng trưởng.',
      intro: 'Dành cho doanh nghiệp đã có nền tảng và cần mở rộng bằng marketing hiệu suất, dữ liệu và nhịp vận hành tăng trưởng.',
      cards: [
        { title: 'Vận hành hằng tháng', text: 'Giữ nhịp vận hành, lập kế hoạch, rà soát và cải thiện mỗi tháng.' },
        { title: 'Hệ thống tăng trưởng', text: 'Kết nối kênh, ưu đãi, CRM, nội dung và dữ liệu thành một hệ.' },
        { title: 'CRM & bán hàng', text: 'Tăng khả năng nhìn thấy khách tiềm năng, phễu bán hàng, mua lại và giữ chân.' },
        { title: 'Thương mại điện tử', text: 'Điều phối website, sàn bán hàng, khuyến mãi và nội dung sản phẩm.' },
        { title: 'Bảng dữ liệu', text: 'Theo dõi KPI, tín hiệu và ưu tiên tiếp theo bằng dữ liệu.' },
        { title: 'Quy trình sẵn sàng AI', text: 'Chuẩn hóa quy trình và tri thức để dùng AI hiệu quả hơn.' },
      ],
      process: [
        { title: 'Xây nền', text: 'Xây nền tảng vận hành và hệ thống tăng trưởng.' },
        { title: 'Vận hành', text: 'Vận hành theo nhịp tháng.' },
        { title: 'Tối ưu', text: 'Cải thiện từ số liệu thực tế.' },
        { title: 'Mở rộng', text: 'Mở rộng kênh, quy trình và mức độ sẵn sàng cho AI.' },
      ],
      faq: [
        { q: 'Scale phù hợp với ai?', a: 'Doanh nghiệp đã có nền tảng và cần mở rộng bằng performance marketing, dữ liệu và vận hành tăng trưởng.' },
        { q: 'Có hỗ trợ quy trình sẵn sàng cho AI không?', a: 'Có. GG99 chuẩn hóa quy trình, dữ liệu và tri thức để doanh nghiệp dùng AI hiệu quả hơn.' },
      ],
    },
  },
  en: {
    consultant: {
      meta: {
        ...packagePages.consultant.meta,
        title: 'The One Start | GG99 Brand & Launch Foundation',
        description: 'The One Start is for brands that need clear identity, concise offer and a launch-ready website.',
        path: '/the-one-start',
        ogTitle: 'The One - GG99 | The One Start',
        ogDescription: 'The One Start is for brands that need clear identity, concise offer and a launch-ready website.',
      },
      h1: 'The One Start',
      hero: 'A clear foundation to start.',
      intro: 'For brands that need clear identity, concise offer and a launch-ready website.',
      cards: [
        { title: 'Business Audit', text: 'Read the model, offer, funnel and current resources.' },
        { title: 'Marketing Audit', text: 'Review channels, messaging, media spend and conversion.' },
        { title: 'CRM Audit', text: 'Check leads, customers, follow-up and retention.' },
        { title: 'E-commerce Audit', text: 'Review website, marketplace, product pages and sales flow.' },
        { title: 'Growth Strategy', text: 'Choose the growth direction from the real bottleneck.' },
        { title: 'Action Roadmap', text: 'Sequence the work so the team can execute clearly.' },
      ],
      process: [
        { title: 'Diagnose', text: 'Read the current state and find the bottleneck.' },
        { title: 'Map', text: 'Connect business, channels, CRM and e-commerce.' },
        { title: 'Roadmap', text: 'Define direction and execution order.' },
      ],
      faq: [
        { q: 'When should I choose Start?', a: 'When the team needs a clear brand foundation, concise offer and launch-ready website before scaling.' },
        { q: 'What is the output?', a: 'Audit, diagnosis, growth strategy and action roadmap.' },
      ],
    },
    agency: {
      meta: {
        ...packagePages.agency.meta,
        title: 'The One System | GG99 Website, CRM & Automation',
        description: 'The One System is for teams that need website, CRM and automation working together.',
        path: '/the-one-system',
        ogTitle: 'The One - GG99 | The One System',
        ogDescription: 'The One System connects website, CRM, tracking and automation into one operating flow.',
      },
      h1: 'The One System',
      hero: 'Website, CRM and automation working together.',
      intro: 'For teams that need website, CRM, tracking and automation connected into one operating system.',
      cards: [
        { title: 'Content Operation', text: 'Plan, produce and improve content by growth angle.' },
        { title: 'Paid Ads', text: 'Run media with tracking, learning and regular optimization.' },
        { title: 'Landing Pages', text: 'Build pages with clear offers and measurable conversion paths.' },
        { title: 'CRM Setup', text: 'Set up journeys, segmentation and follow-up workflows.' },
        { title: 'E-commerce Growth', text: 'Improve website, marketplace and buying flows.' },
        { title: 'Reporting Dashboard', text: 'Turn key KPIs into a dashboard for decisions.' },
      ],
      process: [
        { title: 'Plan', text: 'Define channels, offer, content angles and KPIs.' },
        { title: 'Launch', text: 'Launch content, ads, landing pages and CRM.' },
        { title: 'Operate', text: 'Track, coordinate and solve weekly.' },
        { title: 'Optimize', text: 'Improve with data and customer signals.' },
      ],
      faq: [
        { q: 'How is System different from vendors?', a: 'System connects website, CRM, tracking and automation in one operating flow instead of isolated output delivery.' },
        { q: 'Do you handle tracking?', a: 'Yes. Tracking and dashboards are part of the growth system.' },
      ],
    },
    partner: {
      meta: {
        ...packagePages.partner.meta,
        title: 'The One Scale | GG99 Performance & Growth Operations',
        description: 'The One Scale is for businesses ready to scale with performance marketing and growth operations.',
        path: '/the-one-scale',
        ogTitle: 'The One - GG99 | The One Scale',
        ogDescription: 'The One Scale helps businesses scale through performance marketing, data and growth operations.',
      },
      h1: 'The One Scale',
      hero: 'Scale with performance and growth operations.',
      intro: 'For businesses with a foundation ready to scale through performance marketing, data and growth rhythm.',
      cards: [
        { title: 'Monthly Operation', text: 'Keep planning, review and improvement moving monthly.' },
        { title: 'Growth System', text: 'Connect channels, offer, CRM, content and data as one system.' },
        { title: 'CRM & Sales', text: 'Improve visibility for leads, pipeline, repeat purchase and retention.' },
        { title: 'E-commerce', text: 'Coordinate website, marketplace, promotion and product content.' },
        { title: 'Data Dashboard', text: 'Track KPIs, signals and the next priorities with data.' },
        { title: 'AI-ready Workflow', text: 'Standardize process and knowledge for better AI use.' },
      ],
      process: [
        { title: 'Build', text: 'Build the operating base and growth system.' },
        { title: 'Operate', text: 'Run the monthly operating rhythm.' },
        { title: 'Optimize', text: 'Improve from real data.' },
        { title: 'Scale', text: 'Scale channels, workflow and AI-readiness.' },
      ],
      faq: [
        { q: 'Who is Scale for?', a: 'Businesses with a foundation that are ready to scale through performance marketing, data and growth operations.' },
        { q: 'Do you support AI-ready workflows?', a: 'Yes. GG99 standardizes process, data and knowledge so AI can be used better.' },
      ],
    },
  },
} satisfies Record<BrandLang, Record<PackageKey, {
  meta: PageMeta
  h1: string
  hero: string
  intro: string
  cards: CompactCard[]
  process: CompactStep[]
  faq: CompactFaq[]
}>>

export const aboutMetaByLang: Record<BrandLang, PageMeta> = {
  vi: {
    title: 'Về The One - GG99',
    description:
      'The One - GG99 là đối tác tăng trưởng cho brand, website, CRM, automation và performance marketing.',
    path: '/about',
    ogTitle: 'Về The One - GG99',
    ogDescription:
      'GG99 là The One growth partner cho startups và SMEs.',
    ogImage: ogTheOneImagePath,
  },
  en: {
    title: 'About The One - GG99',
    description:
      'The One - GG99 is a growth partner for brand, website, CRM, automation and performance marketing.',
    path: '/about',
    ogTitle: 'About The One - GG99',
    ogDescription:
      'GG99 is The One growth partner for startups and SMEs.',
    ogImage: ogTheOneImagePath,
  },
}

export const compactAboutByLang = {
  vi: {
    hero: {
      h1: 'About The One - GG99',
      intro:
        'The One - GG99 là đối tác tăng trưởng giúp startup và SME xây thương hiệu, website, CRM, tự động hóa và marketing hiệu suất.',
    },
    cards: [
      { title: 'The One - GG99', text: 'Đối tác tăng trưởng cho startup và SME.' },
      { title: 'The One', text: 'Slogan và định vị cốt lõi: một đối tác tăng trưởng.' },
      { title: 'Connected Growth', text: 'Thương hiệu, website, CRM, tự động hóa và marketing hiệu suất vận hành trong một hệ.' },
    ],
    process: [
      { title: 'Chẩn đoán', text: 'Hiểu doanh nghiệp và điểm nghẽn thật.' },
      { title: 'Thiết kế', text: 'Thiết kế hệ thống và lộ trình.' },
      { title: 'Vận hành', text: 'Triển khai các đầu việc kết nối.' },
      { title: 'Tối ưu', text: 'Cải thiện bằng dữ liệu và bài học thực tế.' },
    ],
    faq: [
      { q: 'The One - GG99 là gì?', a: 'The One - GG99 là đối tác tăng trưởng cho startup và SME.' },
      { q: 'The One - GG99 cung cấp gì?', a: 'Nhận diện thương hiệu, website, hệ thống CRM, tự động hóa và marketing hiệu suất.' },
    ],
  },
  en: {
    hero: {
      h1: 'About The One - GG99',
      intro:
        'The One - GG99 is a growth partner helping startups and SMEs build brand, website, CRM, automation and performance marketing.',
    },
    cards: [
      { title: 'The One - GG99', text: 'Growth partner for startups and SMEs.' },
      { title: 'The One', text: 'The slogan and core positioning: one growth partner.' },
      { title: 'Connected Growth', text: 'Brand, website, CRM, automation and performance marketing operating together.' },
    ],
    process: [
      { title: 'Diagnose', text: 'Understand the business and real bottleneck.' },
      { title: 'Design', text: 'Design the system and roadmap.' },
      { title: 'Operate', text: 'Run connected workstreams.' },
      { title: 'Optimize', text: 'Improve through data and learning.' },
    ],
    faq: [
      { q: 'What is The One - GG99?', a: 'The One - GG99 is a growth partner for startups and SMEs.' },
      { q: 'What does The One - GG99 provide?', a: 'Brand identity, websites, CRM systems, automation and performance marketing.' },
    ],
  },
} satisfies Record<BrandLang, {
  hero: { h1: string; intro: string }
  cards: CompactCard[]
  process: CompactStep[]
  faq: CompactFaq[]
}>

export type InsightSlug =
  | 'gg99-the-one'
  | 'the-one-growth-system'
  | 'the-one-packages'
  | 'one-growth-partner-for-startups'
  | 'brand-website-crm-automation-growth'

export type InsightPost = {
  slug: InsightSlug
  path: string
  title: string
  meta: PageMeta
  excerpt: string
  category: string
  datePublished: string
  dateModified: string
  coverImage: string
  coverAlt: string
  sections: Array<{
    heading: string
    paragraphs: string[]
  }>
  ctaHref: string
  ctaLabel: string
}

export const insightsIndexMeta: PageMeta = {
  title: 'Insights | The One - GG99',
  description:
    'Insights from The One - GG99 on brand, website, CRM, automation and growth systems for startups and SMEs.',
  path: '/insights',
  ogTitle: 'Insights | The One - GG99',
  ogDescription:
    'Insights from The One - GG99 on brand, website, CRM, automation and growth systems for startups and SMEs.',
  ogImage: ogTheOneImagePath,
}

export const insightPosts: InsightPost[] = [
  {
    slug: 'gg99-the-one',
    path: '/insights/gg99-the-one',
    title: 'GG99 = The One: The new positioning of The One - GG99',
    meta: {
      title: 'GG99 = The One: The new positioning of The One - GG99',
      description:
        'GG99 is The One: a growth system that connects brand, website, CRM, automation and performance marketing for startups and SMEs.',
      path: '/insights/gg99-the-one',
      ogTitle: 'GG99 = The One: The new positioning of The One - GG99',
      ogDescription:
        'GG99 is The One: a growth system that connects brand, website, CRM, automation and performance marketing for startups and SMEs.',
      ogImage: ogTheOneImagePath,
    },
    excerpt:
      'GG99 is positioned as The One: a growth partner that helps startups and SMEs connect brand, website, CRM, automation and performance marketing.',
    category: 'Entity SEO',
    datePublished: '2026-07-02',
    dateModified: '2026-07-03',
    coverImage: ogTheOneImagePath,
    coverAlt: 'The One - GG99 cover image for entity positioning',
    sections: [
      {
        heading: 'The One is the core positioning',
        paragraphs: [
          'GG99 = The One means a business has one growth partner instead of many disconnected vendors. The One - GG99 is how the brand should be recognized across search, AI search and the customer experience.',
          'This positioning helps Google and AI assistants understand that GG99 is not only an agency that executes campaigns. GG99 is a connected growth system that links strategy, brand, website, CRM, automation and performance marketing in one ecosystem.',
        ],
      },
      {
        heading: 'Why this positioning matters',
        paragraphs: [
          'Startups and SMEs often lose speed when each part of growth is handled by a different team. Brand says one thing, the website does not support conversion, CRM lacks useful data and performance marketing does not feed learning back into operations.',
          'The One resets the structure: every touchpoint should serve one shared growth direction. From there, the business becomes easier to measure, optimize and scale.',
        ],
      },
      {
        heading: 'What to read next',
        paragraphs: [
          'Start with The One to understand the positioning, explore The One Packages to choose the right system, read About to understand the role of The One - GG99, or contact GG99 to discuss your growth setup directly.',
        ],
      },
    ],
    ctaHref: '/the-one',
    ctaLabel: 'Explore The One',
  },
  {
    slug: 'the-one-growth-system',
    path: '/insights/the-one-growth-system',
    title: 'What is The One Growth System?',
    meta: {
      title: 'What is The One Growth System?',
      description:
        'The One Growth System is how GG99 connects brand, website, CRM, automation and performance marketing into one growth system.',
      path: '/insights/the-one-growth-system',
      ogTitle: 'What is The One Growth System?',
      ogDescription:
        'The One Growth System is how GG99 connects brand, website, CRM, automation and performance marketing into one growth system.',
      ogImage: ogTheOneImagePath,
    },
    excerpt:
      'The One Growth System connects brand, website, CRM, automation and performance marketing into an operating growth system.',
    category: 'Growth System',
    datePublished: '2026-07-02',
    dateModified: '2026-07-03',
    coverImage: ogTheOneImagePath,
    coverAlt: 'The One Growth System cover image',
    sections: [
      {
        heading: 'One system instead of many fragments',
        paragraphs: [
          "The One Growth System is how GG99 organizes a business's growth touchpoints into one shared flow. Brand creates trust, the website converts, CRM records customer relationships, automation reduces repetitive work and performance marketing creates scale signals.",
          'When these parts are not connected, the business produces many outputs but learns very little. When they work together, every campaign becomes data that improves the system.',
        ],
      },
      {
        heading: 'How the system works',
        paragraphs: [
          'GG99 starts by reading the current state, identifying bottlenecks and designing a workflow that fits the business stage. The system is then implemented through a clear rhythm: build the foundation, operate, measure and optimize.',
          'The goal is not to add more tools. The goal is to make brand, website, CRM, automation and marketing serve one clear growth direction.',
        ],
      },
      {
        heading: 'What to read next',
        paragraphs: [
          'The One explains the overall positioning. The Packages section on the homepage helps businesses choose Start, System or Scale. About explains The One - GG99 in more detail. Contact is the starting point for a system consultation.',
        ],
      },
    ],
    ctaHref: '/the-one',
    ctaLabel: 'Read The One',
  },
  {
    slug: 'the-one-packages',
    path: '/insights/the-one-packages',
    title: 'The One Packages: Start, System and Scale',
    meta: {
      title: 'The One Packages: Start, System and Scale',
      description:
        'The One Packages include The One Start, The One System and The One Scale: three GG99 growth packages for different business stages.',
      path: '/insights/the-one-packages',
      ogTitle: 'The One Packages: Start, System and Scale',
      ogDescription:
        'The One Packages include The One Start, The One System and The One Scale: three GG99 growth packages for different business stages.',
      ogImage: ogTheOneImagePath,
    },
    excerpt:
      'The One Packages include The One Start, The One System and The One Scale, designed around different growth stages.',
    category: 'Packages',
    datePublished: '2026-07-02',
    dateModified: '2026-07-03',
    coverImage: ogTheOneImagePath,
    coverAlt: 'The One Packages cover image',
    sections: [
      {
        heading: 'Three packages for three growth stages',
        paragraphs: [
          'The One Start is for brands that need clear positioning and a launch-ready website. The One System is for teams that need website, CRM and automation to operate together. The One Scale is for businesses that already have a foundation and want to expand with performance marketing and growth operations.',
          'All three packages sit under The One - GG99 positioning: a connected growth system, not a disconnected list of services.',
        ],
      },
      {
        heading: 'Choose by bottleneck',
        paragraphs: [
          'If a business still needs clearer identity and a sharper offer, Start is the right entry point. If it already has traffic but lacks data, CRM or automation, System is more suitable. If the foundation is stable and the next challenge is scale with an operating rhythm, Scale is the package to consider.',
          'The best way to choose is to start from the real business bottleneck, not from an advertising channel.',
        ],
      },
      {
        heading: 'What to read next',
        paragraphs: [
          'Explore The One Packages in detail, read The One to understand the positioning, visit About to understand The One - GG99, or contact us to choose the right package.',
        ],
      },
    ],
    ctaHref: '/#packages',
    ctaLabel: 'Explore The One Packages',
  },
  {
    slug: 'one-growth-partner-for-startups',
    path: '/insights/one-growth-partner-for-startups',
    title: 'Why startups need one growth partner instead of fragmented teams',
    meta: {
      title: 'Why startups need one growth partner instead of fragmented teams',
      description:
        'Startups often struggle when brand, website, CRM, ads and automation are separated. GG99 solves this through The One model.',
      path: '/insights/one-growth-partner-for-startups',
      ogTitle: 'Why startups need one growth partner instead of fragmented teams',
      ogDescription:
        'Startups often struggle when brand, website, CRM, ads and automation are separated. GG99 solves this through The One model.',
      ogImage: ogTheOneImagePath,
    },
    excerpt:
      'One growth partner helps a startup keep brand, website, CRM, ads and automation aligned around one growth direction.',
    category: 'Startups',
    datePublished: '2026-07-02',
    dateModified: '2026-07-03',
    coverImage: ogTheOneImagePath,
    coverAlt: 'One growth partner for startups cover image',
    sections: [
      {
        heading: 'The problem is not only a lack of people',
        paragraphs: [
          'Many startups do not lack vendors. The problem is that each vendor sees only one part: logo, website, ads, CRM or automation. Without a shared operating frame, the team may have many tasks in motion but still struggle to know which work truly drives growth.',
          'The One - GG99 proposes one growth partner that looks at the full journey: identity, digital foundation, customer data and marketing operations.',
        ],
      },
      {
        heading: 'One shared growth direction',
        paragraphs: [
          'One growth partner helps a startup make decisions faster because information is not split across disconnected teams. Ad insights can improve landing pages. CRM data can influence content. Website signals can shape automation.',
          'When the system is connected, the startup reduces coordination cost and learns from the market faster.',
        ],
      },
      {
        heading: 'What to read next',
        paragraphs: [
          'Read The One to understand the positioning, explore the Packages section on the homepage to choose the right model, read About to understand the role of The One - GG99 and contact GG99 when you need a growth partner.',
        ],
      },
    ],
    ctaHref: '/the-one',
    ctaLabel: 'Explore The One',
  },
  {
    slug: 'brand-website-crm-automation-growth',
    path: '/insights/brand-website-crm-automation-growth',
    title: 'How should Brand, Website, CRM, Automation and Growth connect?',
    meta: {
      title: 'How should Brand, Website, CRM, Automation and Growth connect?',
      description:
        'GG99 connects brand, website, CRM, automation and performance marketing to create one unified growth system for businesses.',
      path: '/insights/brand-website-crm-automation-growth',
      ogTitle: 'How should Brand, Website, CRM, Automation and Growth connect?',
      ogDescription:
        'GG99 connects brand, website, CRM, automation and performance marketing to create one unified growth system for businesses.',
      ogImage: ogTheOneImagePath,
    },
    excerpt:
      'Brand creates trust, the website converts, CRM stores data, automation improves efficiency and growth turns signals into action.',
    category: 'AI Search',
    datePublished: '2026-07-02',
    dateModified: '2026-07-03',
    coverImage: ogTheOneImagePath,
    coverAlt: 'Brand Website CRM Automation Growth cover image',
    sections: [
      {
        heading: 'Five parts, one flow',
        paragraphs: [
          'Brand shapes trust and how customers remember the business. The website turns that trust into action. CRM keeps customer data. Automation helps the team respond at the right time. Performance marketing creates traffic and new signals.',
          'If these five parts are separated, the business loses context. If they are connected, every touchpoint creates useful data for the next touchpoint.',
        ],
      },
      {
        heading: 'Connect the system to become AI-ready',
        paragraphs: [
          'AI-ready does not start with an AI tool. It starts with data structure, process and content that are clear enough for machines to read, support and automate. The One - GG99 helps businesses standardize this foundation.',
          'When brand, website, CRM, automation and growth share the same logic, the business can use AI more effectively to summarize insights, create workflows, support customer care and optimize operations.',
        ],
      },
      {
        heading: 'What to read next',
        paragraphs: [
          'Read The One to understand the system, explore the Packages section on the homepage to choose the right implementation stage, read About to understand The One - GG99, or contact us if you need to build a connected growth system.',
        ],
      },
    ],
    ctaHref: '/#packages',
    ctaLabel: 'Explore The One Packages',
  },
]

export const insightPostsBySlug = insightPosts.reduce(
  (acc, post) => {
    acc[post.slug] = post
    return acc
  },
  {} as Record<InsightSlug, InsightPost>,
)

export function getRelatedInsightPosts(slug: InsightSlug) {
  return insightPosts.filter((post) => post.slug !== slug).slice(0, 3)
}

export const insightInternalLinks = [
  { label: 'The One', href: '/the-one' },
  { label: 'The One Packages', href: '/#packages' },
  { label: 'About GG99', href: '/about' },
  { label: 'Contact GG99', href: '/contact' },
]

export const insightsIndexSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${siteUrl}/insights#blog`,
  name: 'Insights | The One - GG99',
  url: absoluteUrl('/insights'),
  description: insightsIndexMeta.description,
  publisher: { '@id': `${siteUrl}/#organization` },
  inLanguage: 'en',
  blogPost: insightPosts.map((post) => ({
    '@type': 'BlogPosting',
    '@id': `${siteUrl}${post.path}#article`,
    headline: post.title,
    url: absoluteUrl(post.path),
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { '@type': 'Organization', name: 'GG99', url: absoluteUrl('/') },
  })),
}

export const insightArticleSchemas = insightPosts.reduce(
  (acc, post) => {
    acc[post.slug] = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${siteUrl}${post.path}#article`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': absoluteUrl(post.path),
      },
      headline: post.title,
      description: post.meta.description,
      image: [absoluteUrl(post.coverImage)],
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      author: {
        '@type': 'Organization',
        name: 'GG99',
        url: absoluteUrl('/'),
      },
      publisher: { '@id': `${siteUrl}/#organization` },
      isPartOf: { '@id': `${siteUrl}/insights#blog` },
      inLanguage: 'en',
      about: [
        'The One - GG99',
        'Brand',
        'Website',
        'CRM',
        'Automation',
        'Performance Marketing',
        'Growth System',
      ],
    }
    return acc
  },
  {} as Record<InsightSlug, unknown>,
)

export const insightBreadcrumbSchemas = insightPosts.reduce(
  (acc, post) => {
    acc[post.slug] = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'The One - GG99',
          item: absoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Insights',
          item: absoluteUrl('/insights'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: absoluteUrl(post.path),
        },
      ],
    }
    return acc
  },
  {} as Record<InsightSlug, unknown>,
)
