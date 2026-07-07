'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Facebook,
  Globe2,
  Instagram,
  MoreHorizontal,
  Music2,
  Plus,
} from 'lucide-react'
import { compactTheOneByLang, organizationSchema, websiteSchema, type BrandLang } from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { openBookingModal } from '../components/openBookingModal'
import { SeoHead } from '../components/SeoHead'
import { getLocalizedCmsBlock, getLocalizedPageMeta } from '../cms/contentBlocks'
import type { CmsPageContent, CmsSiteSettings } from '../cms/types'
import { getOrderedCaseStudies } from '../data/caseStudyStories'
import type { CaseStudy, CaseStudyMetric } from '../data/caseStudies'
import { useScrollReveal } from '../hooks/useScrollReveal'

type SocialKey = 'facebook' | 'instagram' | 'tiktok' | 'website'

const socialPlatforms: Array<{ key: SocialKey; label: string; Icon: typeof Instagram }> = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'tiktok', label: 'TikTok', Icon: Music2 },
  { key: 'website', label: 'Website', Icon: Globe2 },
]

const storyLogoById: Record<string, string> = {
  phinoi: '/logo-phinoi.png',
  'cota-cuti': '/logo-cotacuti.png',
  inkaholic: '/logo-inkaholic.png',
  'qanda-books': '/logo-qandabook.png',
  curnon: '/logo-curnon.png',
  'annita-studios': '/logo-annita.png',
}

const storyThemesById: Record<string, { gradient: string; accent: string; accentSoft: string; tile: string; featured: string }> = {
  phinoi: {
    gradient: 'linear-gradient(145deg,#1a0e06 0%,#91581f 45%,#f0b45c 100%)',
    accent: '#f0b45c',
    accentSoft: 'rgba(240,180,92,0.32)',
    tile: 'rgba(54,30,12,0.36)',
    featured: 'rgba(240,180,92,0.28)',
  },
  'cota-cuti': {
    gradient: 'linear-gradient(145deg,#fff0f6 0%,#ff78aa 44%,#ef476f 100%)',
    accent: '#ff78aa',
    accentSoft: 'rgba(255,120,170,0.34)',
    tile: 'rgba(94,28,58,0.34)',
    featured: 'rgba(255,255,255,0.28)',
  },
  inkaholic: {
    gradient: 'linear-gradient(145deg,#0f0f12 0%,#342331 45%,#9f1239 100%)',
    accent: '#f43f5e',
    accentSoft: 'rgba(244,63,94,0.34)',
    tile: 'rgba(18,18,22,0.42)',
    featured: 'rgba(244,63,94,0.28)',
  },
  'qanda-books': {
    gradient: 'linear-gradient(145deg,#130b07 0%,#7c2d12 42%,#fb923c 100%)',
    accent: '#fb923c',
    accentSoft: 'rgba(251,146,60,0.34)',
    tile: 'rgba(64,30,12,0.38)',
    featured: 'rgba(251,146,60,0.28)',
  },
  curnon: {
    gradient: 'linear-gradient(145deg,#f7f1e8 0%,#75512a 45%,#111827 100%)',
    accent: '#d6a35f',
    accentSoft: 'rgba(214,163,95,0.34)',
    tile: 'rgba(30,22,16,0.4)',
    featured: 'rgba(214,163,95,0.28)',
  },
  'annita-studios': {
    gradient: 'linear-gradient(145deg,#120305 0%,#4f0b11 44%,#d21f2b 100%)',
    accent: '#ef2f39',
    accentSoft: 'rgba(239,47,57,0.34)',
    tile: 'rgba(20,3,7,0.46)',
    featured: 'rgba(239,47,57,0.32)',
  },
}

function getStoryLogo(story: CaseStudy) {
  return story.logoUrl || storyLogoById[story.id] || '/logo-gg.png'
}

function getAccountName(story: CaseStudy) {
  return story.accountName || story.displayName || story.brandName
}

function getDisplayName(story: CaseStudy) {
  return story.displayName || story.brandName
}

function parseLikes(value: string | undefined, fallback: number) {
  const numeric = Number.parseInt(String(value || '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function initials(label: string) {
  const parts = label.split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] || 'G') + (parts[1]?.[0] || '')
}

function storyStorageKey(id: string) {
  return `gg99:viewed-story:${id}`
}

function metricKey(metric: CaseStudyMetric) {
  return `${metric.value.trim().toLowerCase()}::${metric.label.trim().toLowerCase()}`
}

function getStoryTheme(story: CaseStudy, storyIndex: number) {
  const fallbackThemes = Object.values(storyThemesById)
  return storyThemesById[story.id] ?? fallbackThemes[storyIndex % fallbackThemes.length]
}

function getMetricDensity(value: string) {
  const compactLength = value.replace(/\s+/g, '').length
  if (compactLength >= 11) return 'is-dense-value'
  if (compactLength >= 8) return 'is-long-value'
  return ''
}

function buildMetricTiles(story: CaseStudy) {
  const metricItems = story.keyMetrics.filter((metric) => metric.value.trim() || metric.label.trim())
  const serviceItems: CaseStudyMetric[] = story.services.map((service) => ({ value: initials(service), label: service }))
  const fallbackItems: CaseStudyMetric[] = [
    { value: initials(story.category), label: story.category },
    { value: initials(story.period), label: story.period || 'Project period' },
    { value: initials(story.headline), label: story.headline || 'Growth story' },
  ]
  const source = [...metricItems, ...serviceItems, ...fallbackItems]
  const uniqueMetrics: CaseStudyMetric[] = []
  source.forEach((metric) => {
    const value = metric.value.trim()
    const label = metric.label.trim()
    if (!value && !label) return
    const normalized = { ...metric, value: value || initials(label), label: label || value }
    if (!uniqueMetrics.some((item) => metricKey(item) === metricKey(normalized))) uniqueMetrics.push(normalized)
  })
  while (uniqueMetrics.length < 10) {
    const fallback = story.services[uniqueMetrics.length % Math.max(story.services.length, 1)] || story.category || 'Growth system'
    uniqueMetrics.push({ value: initials(fallback), label: fallback })
  }

  const featuredMetrics = uniqueMetrics.filter((metric) => metric.featured).slice(0, 2)
  const ordered = [...featuredMetrics, ...uniqueMetrics.filter((metric) => !featuredMetrics.includes(metric))].slice(0, 10)

  return ordered.map((metric, index) => ({
    ...metric,
    className: getMetricDensity(metric.value),
    featured: index < 2,
  }))
}

function carouselImagesForStory(story: CaseStudy) {
  return Array.from(
    new Set(
      [
        ...(story.backgroundImages ?? []),
        story.screenBackground?.imageUrl,
        story.backgroundImageUrl,
      ].map((url) => String(url || '').trim()).filter(Boolean),
    ),
  )
}

function StoryRing({
  story,
  viewed,
  compact,
  onClick,
}: {
  story: CaseStudy
  viewed: boolean
  compact: boolean
  onClick: (story: CaseStudy) => void
}) {
  return (
    <button type="button" onClick={() => onClick(story)} className="ig-story-button group text-center">
      <span className={`ig-story-ring mx-auto ${viewed ? 'is-viewed' : ''}`}>
        <span className="ig-story-ring-inner">
          <img src={getStoryLogo(story)} alt={getDisplayName(story)} className="h-full w-full rounded-full object-contain" />
        </span>
      </span>
      {!compact && (
        <span className="mt-2 block truncate text-[11px] font-bold text-on-surface-variant group-hover:text-primary">
          {getDisplayName(story)}
        </span>
      )}
    </button>
  )
}

function YourStoryRing({ compact }: { compact: boolean }) {
  return (
    <button type="button" onClick={() => openBookingModal('your-story')} className="ig-story-button group text-center">
      <span className="ig-story-ring is-your-story mx-auto">
        <span className="ig-story-ring-inner relative">
          <img src="/logo-gg.png" alt="GG99" className="h-full w-full rounded-full object-contain opacity-45" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-white">
            <Plus size={14} strokeWidth={3} />
          </span>
        </span>
      </span>
      {!compact && (
        <span className="mt-2 block truncate text-[11px] font-bold text-on-surface-variant group-hover:text-primary">
          Your story
        </span>
      )}
    </button>
  )
}

function StoriesBar({
  heading,
  compact,
  mobile,
  stories,
  viewedStories,
  onStoryClick,
}: {
  heading: string
  compact: boolean
  mobile: boolean
  stories: CaseStudy[]
  viewedStories: Set<string>
  onStoryClick: (story: CaseStudy) => void
}) {
  return (
    <section className={`ig-stories-bar sticky top-[88px] z-30 border-y border-white/65 bg-white/[0.72] px-4 shadow-[0_14px_40px_rgba(219,39,119,0.08)] backdrop-blur-xl ${compact ? 'is-compact' : ''} ${mobile ? 'is-mobile' : ''}`}>
      <div className="mx-auto max-w-[900px]">
        {!mobile && <h1 className="ig-stories-title ig-script-title text-center text-[46px] leading-none text-on-surface md:text-[58px]">{heading}</h1>}
        <div className="ig-stories-row flex max-w-full gap-4 overflow-x-auto overscroll-x-contain pb-1">
          <YourStoryRing compact={compact} />
          {stories.map((story) => (
            <StoryRing key={story.id} story={story} viewed={viewedStories.has(story.id)} compact={compact} onClick={onStoryClick} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PostMoreMenu({ story, onCopy }: { story: CaseStudy; onCopy: (story: CaseStudy) => void }) {
  return (
    <details className="group relative">
      <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-low">
        <MoreHorizontal size={20} />
      </summary>
      <button
        type="button"
        onClick={() => onCopy(story)}
        className="absolute right-0 top-10 z-20 inline-flex min-w-36 items-center gap-2 rounded-2xl border border-outline-variant/45 bg-white px-3 py-2 text-sm font-bold text-on-surface-variant shadow-xl hover:bg-primary/10 hover:text-primary"
      >
        <Copy size={15} /> Copy link
      </button>
    </details>
  )
}

function StoryMediaFrame({ story, index }: { story: CaseStudy; index: number }) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef(0)
  const images = useMemo(() => carouselImagesForStory(story), [story])
  const metricTiles = useMemo(() => buildMetricTiles(story), [story])
  const theme = useMemo(() => getStoryTheme(story, index), [index, story])
  const [activeImage, setActiveImage] = useState(0)
  const [inView, setInView] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [pausedUntil, setPausedUntil] = useState(0)
  const frameStyle = {
    '--story-accent': theme.accent,
    '--story-accent-soft': theme.accentSoft,
    '--story-tile-bg': theme.tile,
    '--story-featured-bg': theme.featured,
    backgroundImage: images.length ? undefined : story.screenBackground?.gradient || theme.gradient,
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const element = frameRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (images.length <= 1 || !inView || reducedMotion) return
    const delay = Math.max(4500, pausedUntil - Date.now())
    const timer = window.setTimeout(() => {
      setActiveImage((current) => (current + 1) % images.length)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [activeImage, images.length, inView, pausedUntil, reducedMotion])

  function pauseAutoplay() {
    setPausedUntil(Date.now() + 8000)
  }

  function goTo(delta: number, pause = true) {
    if (images.length <= 1) return
    if (pause) pauseAutoplay()
    setActiveImage((current) => (current + delta + images.length) % images.length)
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? 0
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const endX = event.changedTouches[0]?.clientX ?? 0
    const delta = endX - touchStartX.current
    if (Math.abs(delta) < 40) return
    goTo(delta < 0 ? 1 : -1)
  }

  return (
    <div data-reveal="scale" className="w-full min-w-0">
    <div
      ref={frameRef}
      className="story-media-frame relative aspect-[4/5] max-w-full overflow-hidden bg-cover bg-center"
      style={frameStyle as CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {images.length > 0 && (
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${activeImage * 100}%)` }}
          aria-hidden="true"
        >
          {images.map((image) => (
            <img
              key={`${story.id}-bg-${image}`}
              src={image}
              alt=""
              className="h-full w-full shrink-0 object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      )}
      {images.length === 0 && (
        <img
          src={getStoryLogo(story)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain p-12 opacity-[0.14] mix-blend-screen sm:p-16"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,8,16,0.42),rgba(20,8,16,0.14)_42%,rgba(20,8,16,0.72))]" aria-hidden="true" />

      {images.length > 1 && (
        <>
          <div className="absolute right-4 top-4 z-20 hidden items-center gap-2 rounded-full bg-black/32 px-2.5 py-1.5 text-xs font-extrabold text-white backdrop-blur-md sm:flex">
            <button type="button" onClick={() => goTo(-1)} aria-label="Previous background" className="rounded-full p-1 hover:bg-white/15">
              <ChevronLeft size={16} />
            </button>
            <span>{activeImage + 1}/{images.length}</span>
            <button type="button" onClick={() => goTo(1)} aria-label="Next background" className="rounded-full p-1 hover:bg-white/15">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-1.5">
            {images.map((image, imageIndex) => (
              <button
                type="button"
                key={`${image}-dot`}
                onClick={() => {
                  pauseAutoplay()
                  setActiveImage(imageIndex)
                }}
                aria-label={`Show background ${imageIndex + 1}`}
                className={`h-1.5 rounded-full transition-all ${imageIndex === activeImage ? 'w-6 bg-white' : 'w-1.5 bg-white/48'}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="relative z-10 grid h-full min-w-0 grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[repeat(7,minmax(0,1fr))] gap-1.5 p-2 sm:gap-2 sm:p-4">
        <div className="story-metric-grid col-span-4 row-span-5 min-w-0 sm:row-span-3">
          {metricTiles.map((metric, metricIndex) => (
            <div
              key={`${story.id}-metric-${metricIndex}`}
              className={`story-glass-tile ${metric.className} ${metric.featured ? 'is-featured' : ''}`}
              style={{ '--ri': metricIndex } as CSSProperties}
            >
              <span className="story-metric-kicker">{String(metricIndex + 1).padStart(2, '0')}</span>
              <span className={`story-metric-value ${metric.featured ? 'is-featured' : ''}`}>{metric.value || initials(metric.label)}</span>
              <span className="story-metric-label">{metric.label}</span>
            </div>
          ))}
        </div>

        <div className="story-glass-tile col-span-4 row-span-1 justify-end text-left sm:row-span-3">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-white/78">{story.category}</span>
          <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-relaxed text-white sm:text-sm">{story.shortDescription}</p>
        </div>

        <button
          type="button"
          onClick={() => openBookingModal('story-media')}
          className="col-span-4 row-span-1 self-end rounded-full border border-white/38 bg-white/20 px-4 py-3 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:bg-white/28"
        >
          About this story
        </button>
      </div>
    </div>
    </div>
  )
}

function PostSocialLinks({ story }: { story: CaseStudy }) {
  const links = socialPlatforms.map((platform) => ({ ...platform, href: story.socialLinks?.[platform.key]?.trim() || '' }))
  const websiteLink = links.find((link) => link.key === 'website')
  const actionLinks = links.filter((link) => link.key !== 'website')

  function renderSocialAction({ key, label, href, Icon }: (typeof links)[number], extraClass = '') {
    const className = `story-social-icon inline-flex h-8 w-8 items-center justify-center text-[#262626] transition hover:scale-[1.15] hover:text-primary ${extraClass}`
    if (href) {
      return (
        <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className={className}>
          <Icon size={24} strokeWidth={2.1} />
        </a>
      )
    }
    return (
      <button
        key={key}
        type="button"
        onClick={() => openBookingModal('social-missing')}
        aria-label={`${label} link pending - open booking`}
        title={`${label} link pending`}
        className={className}
      >
        <Icon size={24} strokeWidth={2.1} />
      </button>
    )
  }

  return (
    <div className="story-social-row flex w-full items-center gap-4">
      {actionLinks.map((link) => renderSocialAction(link))}
      {websiteLink && renderSocialAction(websiteLink, 'ml-auto')}
    </div>
  )
}

function InstagramPost({
  story,
  index,
  highlighted,
  onCopy,
}: {
  story: CaseStudy
  index: number
  highlighted: boolean
  onCopy: (story: CaseStudy) => void
}) {
  const seedLikes = parseLikes(story.likesSeed, 980 + index * 397)

  return (
    <div data-reveal="scale" style={{ '--ri': index } as CSSProperties}>
    <article
      id={story.id}
      className={`story-post w-full max-w-full scroll-mt-56 overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_70px_rgba(219,39,119,0.12)] transition duration-500 ${highlighted ? 'is-highlighted' : ''}`}
    >
      <header className="flex items-center gap-3 border-b border-outline-variant/35 px-4 py-3">
        <img src={getStoryLogo(story)} alt={getDisplayName(story)} className="h-11 w-11 rounded-full border border-outline-variant/45 object-contain" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-extrabold text-on-surface">{getAccountName(story)}</p>
            {story.verified && <Check size={14} className="rounded-full bg-primary p-0.5 text-white" />}
            <span className="text-xs font-bold text-on-surface-variant">.</span>
            <span className="truncate text-xs font-bold text-on-surface-variant">{story.period}</span>
          </div>
          <p className="truncate text-xs font-semibold text-on-surface-variant">{story.headline}</p>
        </div>
        <PostMoreMenu story={story} onCopy={onCopy} />
      </header>

      <StoryMediaFrame story={story} index={index} />

      <footer className="px-4 pb-4 pt-3">
        <PostSocialLinks story={story} />
        <p className="mt-3 text-sm font-extrabold text-on-surface">Liked by {compactNumber(seedLikes)} people</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface">
          <span className="font-extrabold">{getAccountName(story)}</span>{' '}
          {story.caption || story.shortDescription}
        </p>
        {story.testimonialQuote && (
          <figure className="mt-3 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-tertiary/10 to-secondary/10 p-3">
            <blockquote className="text-sm font-semibold italic leading-relaxed text-on-surface">
              "{story.testimonialQuote}"
            </blockquote>
            {(story.testimonialAuthor || story.testimonialRole) && (
              <figcaption className="mt-2 text-xs font-black uppercase tracking-[0.08em] text-primary">
                {story.testimonialAuthor}{story.testimonialRole ? `, ${story.testimonialRole}` : ''}
              </figcaption>
            )}
          </figure>
        )}
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">{story.category}</p>
      </footer>
    </article>
    </div>
  )
}

function StickyStoryRail({
  stories,
  onStoryClick,
}: {
  stories: CaseStudy[]
  onStoryClick: (story: CaseStudy) => void
}) {
  const firstStory = stories[0]

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-32 space-y-4">
        <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(219,39,119,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <img src="/logo-gg.png" alt="The One - GG99" className="h-12 w-12 rounded-full border border-outline-variant/35 object-contain" />
            <div>
              <p className="text-sm font-extrabold text-on-surface">The One - GG99</p>
              <p className="text-xs font-semibold text-on-surface-variant">Client story feed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openBookingModal('story-rail')}
            className="btn-shine mt-4 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-on-primary gg-btn-primary"
          >
            Start your story
          </button>
        </div>

        <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(219,39,119,0.1)] backdrop-blur-xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Suggested stories</p>
          <div className="mt-4 space-y-3">
            {stories.slice(0, 4).map((story) => (
              <button key={story.id} type="button" onClick={() => onStoryClick(story)} className="flex w-full items-center gap-3 text-left">
                <img src={getStoryLogo(story)} alt="" className="h-10 w-10 rounded-full border border-outline-variant/35 object-contain" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-on-surface">{getDisplayName(story)}</span>
                  <span className="block truncate text-xs font-semibold text-on-surface-variant">{story.category}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {firstStory && (
          <a href={`#${encodeURIComponent(firstStory.id)}`} className="inline-flex items-center gap-2 px-2 text-sm font-extrabold text-primary">
            Back to top story <ChevronRight size={16} />
          </a>
        )}
      </div>
    </aside>
  )
}

function FinalStoryCta({ label }: { label: string }) {
  return (
    <div data-reveal="scale">
    <button
      type="button"
      onClick={() => openBookingModal('story-final')}
      className="story-post group w-full overflow-hidden rounded-[28px] border border-white/75 bg-white/[0.82] p-6 text-left shadow-[0_24px_70px_rgba(219,39,119,0.12)] backdrop-blur transition hover:-translate-y-1 hover:border-primary/45 md:p-8"
    >
      <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">The One - GG99</span>
      <span className="mt-3 flex items-center justify-between gap-4">
        <span className="text-2xl font-extrabold leading-tight text-on-surface md:text-3xl">{label}</span>
        <span className="flex shrink-0 text-primary">
          <ChevronRight className="story-chevron" size={26} />
          <ChevronRight className="story-chevron" size={26} />
          <ChevronRight className="story-chevron" size={26} />
        </span>
      </span>
    </button>
    </div>
  )
}

export default function TheOnePage({ lang = 'vi', cmsPage, siteSettings }: { lang?: BrandLang; cmsPage?: CmsPageContent | null; siteSettings?: CmsSiteSettings | null }) {
  const c = compactTheOneByLang[lang]
  const heroBlock = getLocalizedCmsBlock(cmsPage, 'hero', lang)
  const storiesBlock = getLocalizedCmsBlock(cmsPage, 'stories', lang)
  const orderedCaseStudies = useMemo(() => getOrderedCaseStudies(storiesBlock), [storiesBlock])
  const [viewedStories, setViewedStories] = useState<Set<string>>(() => new Set())
  const [highlightedId, setHighlightedId] = useState('')
  const [toast, setToast] = useState('')
  const [compactStories, setCompactStories] = useState(false)
  const [isMobileStories, setIsMobileStories] = useState(false)
  const storyHeading = heroBlock?.heading?.trim() || 'The One Stories'
  const storyIntro = heroBlock?.body?.trim()
  const finalCtaLabel = heroBlock?.ctaLabel?.trim() || 'How about our stories?'

  useScrollReveal()

  useEffect(() => {
    const viewed = new Set<string>()
    orderedCaseStudies.forEach((story) => {
      if (window.sessionStorage.getItem(storyStorageKey(story.id)) === '1') viewed.add(story.id)
    })
    setViewedStories(viewed)
  }, [orderedCaseStudies])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        setCompactStories((current) => {
          if (!current && window.scrollY > 200) return true
          if (current && window.scrollY < 80) return false
          return current
        })
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobileStories(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const scrollToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
        setHighlightedId(id)
        window.setTimeout(() => setHighlightedId(''), 1200)
      }, 120)
    }
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])

  function handleStoryClick(story: CaseStudy) {
    window.sessionStorage.setItem(storyStorageKey(story.id), '1')
    setViewedStories((current) => new Set(current).add(story.id))
    window.history.replaceState(null, '', `#${encodeURIComponent(story.id)}`)
    document.getElementById(story.id)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    setHighlightedId(story.id)
    window.setTimeout(() => setHighlightedId(''), 1200)
  }

  async function handleCopy(story: CaseStudy) {
    const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(story.id)}`
    try {
      await navigator.clipboard.writeText(url)
      setToast(`Copied ${getDisplayName(story)} link`)
    } catch {
      setToast(url)
    }
    window.setTimeout(() => setToast(''), 1800)
  }

  return (
    <BrandLayout lang={lang} siteSettings={siteSettings} flushTop mobileHeaderTitle={isMobileStories ? storyHeading : undefined}>
      <SeoHead meta={getLocalizedPageMeta(cmsPage, lang, c.meta)} schema={[organizationSchema, websiteSchema]} lang={lang} />

      <article className="the-one-page min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#fff5f7_0%,#ffe4ec_35%,#fff1c8_100%)] pb-16 pt-24">
        <StoriesBar
          heading={storyHeading}
          compact={compactStories}
          mobile={isMobileStories}
          stories={orderedCaseStudies}
          viewedStories={viewedStories}
          onStoryClick={handleStoryClick}
        />

        {storyIntro && (
          <p className="mx-auto mt-7 max-w-2xl px-5 text-center text-sm font-bold leading-relaxed text-on-surface-variant md:text-base">
            {storyIntro}
          </p>
        )}

        <section className="mx-auto mt-8 grid w-full max-w-[1180px] min-w-0 grid-cols-[minmax(0,1fr)] gap-8 px-3 sm:px-5 xl:grid-cols-[minmax(0,860px)_280px]">
          <div className="mx-auto grid w-full min-w-0 max-w-full grid-cols-[minmax(0,1fr)] gap-7 sm:max-w-[860px]">
            {orderedCaseStudies.map((story, index) => (
              <InstagramPost
                key={story.id}
                story={story}
                index={index}
                highlighted={highlightedId === story.id}
                onCopy={handleCopy}
              />
            ))}
            <FinalStoryCta label={finalCtaLabel} />
          </div>
          <StickyStoryRail stories={orderedCaseStudies} onStoryClick={handleStoryClick} />
        </section>
      </article>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-on-surface px-4 py-2 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </BrandLayout>
  )
}
