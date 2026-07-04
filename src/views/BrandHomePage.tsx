'use client'

import { useRef, useState, type CSSProperties } from 'react'
import {
  Play,
  Rocket,
} from 'lucide-react'
import { compactHomeByLang, homeMetaByLang, homeWebPageSchema, localizedPath, organizationSchema, websiteSchema, type BrandLang } from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { openBookingModal } from '../components/openBookingModal'
import { PackageCards } from '../components/PackageCards'
import { SeoHead } from '../components/SeoHead'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { getCmsBlock, splitCmsParagraphs } from '../cms/contentBlocks'
import type { CmsBlockItem, CmsPageContent, CmsSiteSettings } from '../cms/types'
import { getOrderedCaseStudies } from '../data/caseStudyStories'
import type { CaseStudy } from '../data/caseStudies'

const primaryBookingCtaLabel = 'Call Your Shot'
const defaultHeroGradient = 'linear-gradient(180deg,#FFF5F7 0%,#FFE4EC 55%,#FFD9E4 100%)'

function resolvePrimaryBookingCtaLabel(label?: string) {
  const trimmed = label?.trim() ?? ''
  return !trimmed || /book a (free )?consultation/i.test(trimmed) ? primaryBookingCtaLabel : trimmed
}

const storyLogoById: Record<string, string> = {
  phinoi: '/logo-phinoi.png',
  'cota-cuti': '/logo-cotacuti.png',
  inkaholic: '/logo-inkaholic.png',
  'qanda-books': '/logo-qandabook.png',
  curnon: '/logo-curnon.png',
}

const mediaBackdrops = [
  'from-[#120c08] via-[#9a3412] to-[#f08a35]',
  'from-[#16080c] via-[#b91c1c] to-[#db4458]',
  'from-[#120d06] via-[#78350f] to-[#d97706]',
  'from-[#1a0b05] via-[#9a3412] to-[#ea580c]',
  'from-[#160804] via-[#7c2d12] to-[#b45309]',
]

function SectionHeader({ title, intro, dark = false }: { title: string; intro?: string; dark?: boolean }) {
  return (
    <div className="max-w-3xl mb-8">
      <h2 data-reveal className={`text-[28px] md:text-[36px] font-extrabold leading-tight ${dark ? 'text-white' : 'text-on-surface'}`}>
        {title}
      </h2>
      <div data-reveal="line" className="home-gradient-underline mt-3" aria-hidden="true" />
      {intro && <p className={`mt-4 text-[15px] md:text-base leading-relaxed ${dark ? 'text-white/65' : 'text-on-surface-variant'}`}>{intro}</p>}
    </div>
  )
}

function cssUrl(value: string) {
  return `url("${value.replace(/"/g, '%22')}")`
}

function heroBackgroundStyle(block: ReturnType<typeof getCmsBlock>): CSSProperties {
  const gradient = block?.backgroundGradient?.trim() || defaultHeroGradient
  const imageUrl = block?.backgroundImageUrl?.trim()
  const overlayValue = Number.parseFloat(block?.backgroundOverlayOpacity ?? '')
  const overlay = Number.isFinite(overlayValue) ? Math.min(0.85, Math.max(0, overlayValue)) : 0

  if (!imageUrl) {
    return { backgroundImage: gradient }
  }

  return {
    backgroundImage: `linear-gradient(rgba(255,245,247,${overlay}), rgba(255,245,247,${overlay})), ${cssUrl(imageUrl)}, ${gradient}`,
    backgroundSize: 'cover, cover, cover',
    backgroundPosition: 'center, center, center',
  }
}

function extractIframeSrc(value: string) {
  const match = value.match(/\ssrc=["']([^"']+)["']/i)
  return match?.[1] ?? value
}

function isDirectVideoUrl(value: string) {
  const url = extractIframeSrc(value).trim()
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return true

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname.endsWith('cloudinary.com') && parsedUrl.pathname.includes('/video/upload/')
  } catch {
    return false
  }
}

function isEmbeddableUrl(value: string) {
  const url = value.trim()
  return /youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com|tiktok\.com|iframe/i.test(url)
}

function parseYouTubeId(url: URL) {
  if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0]
  if (url.pathname.startsWith('/watch')) return url.searchParams.get('v')
  if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/').filter(Boolean)[1]
  if (url.pathname.startsWith('/embed/')) return url.pathname.split('/').filter(Boolean)[1]
  return url.searchParams.get('v')
}

function withAutoplayParams(rawValue: string, active: boolean) {
  const value = extractIframeSrc(rawValue).trim()
  if (!value) return ''

  try {
    const url = new URL(value)
    const hostname = url.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be' || hostname.endsWith('youtube.com')) {
      const videoId = parseYouTubeId(url)
      if (videoId) {
        const embed = new URL(`https://www.youtube.com/embed/${videoId}`)
        embed.searchParams.set('autoplay', active ? '1' : '0')
        embed.searchParams.set('mute', '1')
        embed.searchParams.set('playsinline', '1')
        embed.searchParams.set('rel', '0')
        embed.searchParams.set('controls', '0')
        embed.searchParams.set('loop', '1')
        embed.searchParams.set('playlist', videoId)
        return embed.toString()
      }
    }

    if (hostname === 'vimeo.com' || hostname.endsWith('vimeo.com')) {
      const segments = url.pathname.split('/').filter(Boolean)
      const videoId = hostname === 'player.vimeo.com' && segments[0] === 'video' ? segments[1] : segments[0]
      if (videoId) {
        const embed = new URL(`https://player.vimeo.com/video/${videoId}`)
        embed.searchParams.set('autoplay', active ? '1' : '0')
        embed.searchParams.set('muted', '1')
        embed.searchParams.set('loop', '1')
        embed.searchParams.set('title', '0')
        embed.searchParams.set('byline', '0')
        embed.searchParams.set('portrait', '0')
        return embed.toString()
      }
    }

    url.searchParams.set('autoplay', active ? '1' : '0')
    url.searchParams.set('mute', '1')
    url.searchParams.set('muted', '1')
    return url.toString()
  } catch {
    return value
  }
}

function resolveStoryHref(lang: BrandLang, href: string, storyId?: string) {
  const candidate = href.trim()
  if (/^https?:\/\//i.test(candidate) || candidate.startsWith('/')) return candidate
  const targetId = !candidate || candidate === '#' ? storyId : candidate.replace(/^#/, '')
  return `${localizedPath(lang, '/the-one')}${targetId ? `#${encodeURIComponent(targetId)}` : ''}`
}

function normalizeStoryKey(value: unknown) {
  return String(value || '').trim().replace(/^#/, '').toLowerCase()
}

function ExploreTile({
  stage,
  story,
  index,
  lang,
  featured = false,
}: {
  stage: {
    label: string
    detail: string
    href: string
    imageUrl?: string
    imageAlt: string
    videoUrl?: string
    embedUrl?: string
  }
  story?: CaseStudy
  index: number
  lang: BrandLang
  featured?: boolean
}) {
  const [active, setActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rawVideoUrl = stage.videoUrl?.trim() || stage.embedUrl?.trim() || ''
  const imageLooksLikeVideo = stage.imageUrl ? isEmbeddableUrl(stage.imageUrl) || isDirectVideoUrl(stage.imageUrl) : false
  const mediaUrl = rawVideoUrl || (imageLooksLikeVideo ? stage.imageUrl || '' : '')
  const posterUrl = imageLooksLikeVideo ? '' : stage.imageUrl || (story?.id ? storyLogoById[story.id] : '') || '/logo-gg.png'
  const directVideo = Boolean(mediaUrl && isDirectVideoUrl(mediaUrl))
  const embedSrc = mediaUrl && !directVideo ? withAutoplayParams(mediaUrl, active) : ''
  const storyHref = resolveStoryHref(lang, stage.href, story?.id)
  const backdrop = mediaBackdrops[index % mediaBackdrops.length]
  const posterIsLogo = /(^|\/)logo[-_]/i.test(posterUrl)

  function activatePreview() {
    setActive(true)
    const video = videoRef.current
    if (!video) return
    video.muted = true
    void video.play().catch(() => {
      setActive(false)
    })
  }

  function deactivatePreview() {
    setActive(false)
    const video = videoRef.current
    if (!video) return
    video.pause()
    try {
      video.currentTime = 0
    } catch {
      // Some remote streams do not allow seeking before metadata is ready.
    }
  }

  return (
    <a
      href={storyHref}
      aria-label={`${stage.label}${story ? ` - ${story.brandName}` : ''}`}
      data-reveal={featured ? 'scale' : index % 2 === 0 ? 'right' : 'left'}
      style={{ '--ri': featured ? 0 : index } as CSSProperties}
      onMouseEnter={activatePreview}
      onMouseLeave={deactivatePreview}
      onFocus={activatePreview}
      onBlur={deactivatePreview}
      className={[
        'home-explore-tile group relative block overflow-hidden bg-surface text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
        featured ? 'md:col-span-2 md:row-span-2' : '',
      ].join(' ')}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${backdrop}`} aria-hidden="true" />
      {directVideo ? (
        <>
          <video
            ref={videoRef}
            src={mediaUrl}
            poster={posterUrl || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="relative h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {posterUrl && (
            <img
              src={posterUrl}
              alt=""
              className={`pointer-events-none absolute inset-0 h-full w-full transition duration-500 ${
                active ? 'scale-105 opacity-0' : 'opacity-100'
              } ${posterIsLogo ? 'object-contain p-8' : 'object-cover'}`}
            />
          )}
        </>
      ) : embedSrc ? (
        <iframe
          key={embedSrc}
          src={embedSrc}
          title={stage.imageAlt}
          loading="lazy"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="pointer-events-none relative h-full w-full border-0 transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="relative flex h-full w-full items-center justify-center p-6">
          <img
            src={posterUrl}
            alt=""
            className="max-h-20 max-w-[66%] object-contain opacity-95 drop-shadow-[0_14px_24px_rgba(0,0,0,0.34)] transition duration-500 group-hover:scale-110"
          />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/10 to-black/20" aria-hidden="true" />
      <span className="absolute right-3 top-3 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-black/55 px-2 text-white shadow-lg backdrop-blur-md ring-1 ring-white/10">
        <Play size={15} fill="currentColor" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className={`${featured ? 'text-[26px] md:text-[34px]' : 'text-[16px] md:text-[18px]'} font-extrabold leading-tight text-white drop-shadow`}>
          {stage.label}
        </h3>
        {stage.detail && (
          <p className="mt-2 line-clamp-3 translate-y-2 text-[12px] font-semibold leading-relaxed text-white/78 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:text-sm">
            {stage.detail}
          </p>
        )}
      </div>
    </a>
  )
}

function SystemMap({ labels, lang, items, storyTargets }: { labels: string[]; lang: BrandLang; items?: CmsBlockItem[]; storyTargets: CaseStudy[] }) {
  const [expanded, setExpanded] = useState(false)
  const detailText = [
    'Brand identity and messaging.',
    'Launch-ready websites and landing pages.',
    'CRM systems and customer journeys.',
    'Automation workflows that reduce manual work.',
    'Performance marketing and growth operations.',
  ]

  const fallbackItems: CmsBlockItem[] = labels.map((label, index) => ({
    title: label,
    body: detailText[index],
    href: '',
    imageUrl: '',
    imageAlt: '',
  }))
  const sourceItems = items?.length ? items : fallbackItems
  const itemsByStoryId = new Map<string, CmsBlockItem>()

  sourceItems.forEach((item) => {
    ;[item.href, item.id].map(normalizeStoryKey).filter(Boolean).forEach((key) => {
      if (!itemsByStoryId.has(key)) itemsByStoryId.set(key, item)
    })
  })

  const orderedItems = storyTargets.length
    ? storyTargets.map((story, index) => itemsByStoryId.get(normalizeStoryKey(story.id)) ?? sourceItems[index] ?? fallbackItems[index])
    : sourceItems

  const storiesById = new Map(storyTargets.map((story) => [normalizeStoryKey(story.id), story]))
  const stages = orderedItems
    .filter((item) => item.showOnHomepage !== false)
    .map((item, index) => {
    const story = storiesById.get(normalizeStoryKey(item.href)) ?? storyTargets[index]
    return {
      label: item.title,
      detail: item.body ?? '',
      href: item.href ?? story?.id ?? '',
      imageUrl: story?.backgroundImageUrl || item.imageUrl,
      imageAlt: item.imageAlt || item.title,
      videoUrl: item.videoUrl || story?.videoUrl,
      embedUrl: item.embedUrl || story?.embedUrl,
      story,
      order: Number.parseFloat(item.homepageOrder ?? ''),
    }
  }).sort((left, right) => {
    const leftOrder = Number.isFinite(left.order) ? left.order : left.label.toLowerCase().includes('failure') ? -1 : 999
    const rightOrder = Number.isFinite(right.order) ? right.order : right.label.toLowerCase().includes('failure') ? -1 : 999
    return leftOrder - rightOrder
  })

  const visibleStages = expanded ? stages : stages.slice(0, 6)
  const canToggle = stages.length > 5

  return (
    <div className="space-y-5">
      <div className="home-explore-grid grid auto-rows-[minmax(120px,1fr)] grid-cols-2 gap-1 overflow-hidden rounded-[24px] bg-white p-1 shadow-[0_24px_70px_rgba(219,39,119,0.12)] md:grid-cols-3 md:auto-rows-[minmax(170px,1fr)]">
        {visibleStages.map((stage, index) => (
          <ExploreTile
            key={`${stage.label}-${index}`}
            stage={stage}
            story={stage.story}
            index={index}
            lang={lang}
            featured={index === 0}
          />
        ))}
      </div>
      {canToggle && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex rounded-full border border-primary/20 px-4 py-2 text-sm font-extrabold text-primary transition-colors hover:bg-primary/10"
        >
          {expanded ? 'Show less' : 'See more stories...'}
        </button>
      )}
    </div>
  )
}

export default function BrandHomePage({
  lang = 'vi',
  cmsPage,
  theOnePage,
  siteSettings,
}: {
  lang?: BrandLang
  cmsPage?: CmsPageContent | null
  theOnePage?: CmsPageContent | null
  siteSettings?: CmsSiteSettings | null
}) {
  useScrollReveal()

  const c = compactHomeByLang[lang]
  const homeMeta = cmsPage?.meta ?? homeMetaByLang[lang]
  const heroBlock = getCmsBlock(cmsPage, 'hero')
  const whatIsBlock = getCmsBlock(cmsPage, 'what-is')
  const packagesBlock = getCmsBlock(cmsPage, 'packages')
  const storiesBlock = getCmsBlock(theOnePage, 'stories')
  const storyTargets = getOrderedCaseStudies(storiesBlock)
  const heroLines = splitCmsParagraphs(heroBlock?.body)
  const heroLineOne = heroBlock?.heading?.trim() || 'The One by gg99'
  const heroLineTwo = heroLines[0] || 'The only one digital agency you needed'
  const isDefaultHeroTitle = heroLineOne.toLowerCase() === 'the one by gg99'
  const packageItems: CmsBlockItem[] = packagesBlock?.items?.length
    ? packagesBlock.items
    : c.packages.map((item, index) => ({
      title: item.name,
      body: `${item.title}\n${item.text}`,
      icon: ['Rocket', 'Workflow', 'TrendingUp'][index],
      href: item.href,
    }))

  return (
    <BrandLayout lang={lang} siteSettings={siteSettings} hideHeaderCta flushTop>
      <SeoHead meta={homeMeta} schema={[organizationSchema, websiteSchema, homeWebPageSchema]} lang={lang} />

      <section className="relative flex min-h-[52vh] items-center overflow-hidden md:min-h-[58vh]" style={heroBackgroundStyle(heroBlock)}>
        <div className="absolute inset-0 tech-grid opacity-35 pointer-events-none" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-surface-container" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-5 pb-10 pt-28 text-center lg:px-10">
          <h1
            data-reveal
            style={{ '--ri': 0 } as CSSProperties}
            className={`gg-hero-title text-[clamp(36px,10vw,48px)] font-extrabold not-italic leading-[1.02] text-on-surface md:text-[clamp(48px,6vw,80px)] ${isDefaultHeroTitle ? 'md:whitespace-nowrap' : ''}`}
          >
            {heroLineOne}
          </h1>
          <p
            data-reveal
            style={{ '--ri': 1 } as CSSProperties}
            className="mt-6 max-w-2xl text-[20px] font-medium leading-relaxed text-on-surface-variant md:text-[24px]"
          >
            {heroLineTwo}
          </p>
          <button
            type="button"
            onClick={openBookingModal}
            data-reveal
            style={{ '--ri': 2 } as CSSProperties}
            className="btn-shine cta-idle mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-7 py-3.5 font-bold text-white shadow-[0_16px_36px_rgba(219,39,119,0.28)] hover:opacity-95"
          >
            {resolvePrimaryBookingCtaLabel(heroBlock?.ctaLabel)}
          </button>
        </div>
      </section>

      <section className="bg-surface-container px-5 py-8 md:py-12 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <SystemMap labels={c.whatIs.labels} lang={lang} items={whatIsBlock?.items} storyTargets={storyTargets} />
        </div>
      </section>

      <section id="packages" className="py-10 md:py-14 px-5 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="The One Packages"
            intro={lang === 'vi' ? 'Chọn hệ tăng trưởng phù hợp với giai đoạn của bạn.' : 'Choose the growth system that fits your stage.'}
          />
          {packagesBlock?.body && (
            <div className="mb-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
              {packagesBlock.body}
            </div>
          )}
          <PackageCards items={packageItems} lang={lang} />
        </div>
      </section>

      <section className="py-10 md:py-12 px-5 lg:px-10">
        <div className="max-w-6xl mx-auto bg-primary rounded-2xl p-8 md:p-10 text-center">
          <Rocket size={30} className="mx-auto mb-4 text-white" />
          <h2 className="text-[26px] md:text-[34px] font-extrabold text-white">So, ready to be our plus one?</h2>
          <button
            type="button"
            onClick={openBookingModal}
            className="mt-6 inline-flex px-6 py-3 rounded-xl bg-white text-primary font-bold hover:bg-surface-container-low transition-colors"
          >
            {primaryBookingCtaLabel}
          </button>
        </div>
      </section>
    </BrandLayout>
  )
}
