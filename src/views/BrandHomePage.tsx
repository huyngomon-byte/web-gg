'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { compactHomeByLang, homeMetaByLang, homeWebPageSchema, localizedPath, organizationSchema, websiteSchema, type BrandLang } from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { openBookingModal } from '../components/openBookingModal'
import { PackageCards } from '../components/PackageCards'
import { SeoHead } from '../components/SeoHead'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { whenIntroGone } from '../hooks/useIntroGate'
import { FlowWaveBackground } from '../components/FlowWaveBackground'
import { HeroBackgroundVideo } from '../components/HeroBackgroundVideo'
import { getCmsBlock, getLocalizedCmsBlock, getLocalizedPageMeta, splitCmsParagraphs } from '../cms/contentBlocks'
import { mergeHomepageBackground } from '../cms/siteSettings'
import { buildHomeFaqSchema, getHomeClosingFaqItems } from '../cms/homeFaqSchema'
import type { CmsBlockItem, CmsPageContent, CmsSiteSettings } from '../cms/types'
import { getOrderedCaseStudies } from '../data/caseStudyStories'
import type { CaseStudy } from '../data/caseStudies'

const primaryBookingCtaLabel = 'Schedule Our Date'
const defaultHeroGradient = 'linear-gradient(180deg,#FF7AA8 0%,#FF4D7D 45%,#FFB199 100%)'
const heroFirstWordDelayMs = 420
const heroWordStepMs = 90
const heroWordDurationMs = 430

function resolvePrimaryBookingCtaLabel(label?: string) {
  const trimmed = label?.trim() ?? ''
  return !trimmed || /book a (free )?consultation|call your shot/i.test(trimmed) ? primaryBookingCtaLabel : trimmed
}

const storyLogoById: Record<string, string> = {
  phinoi: '/logo-phinoi.png',
  'cota-cuti': '/logo-cotacuti.png',
  inkaholic: '/logo-inkaholic.png',
  'qanda-books': '/logo-qandabook.png',
  curnon: '/logo-curnon.png',
  'annita-studios': '/logo-annita.png',
}

function getStoryLogoForHome(story: Pick<CaseStudy, 'id' | 'logoUrl'>) {
  return story.logoUrl || storyLogoById[story.id] || '/logo-gg.png'
}

function SectionHeader({
  title,
  intro,
  dark = false,
  align = 'left',
}: {
  title: string
  intro?: string
  dark?: boolean
  align?: 'left' | 'center'
}) {
  const centered = align === 'center'
  return (
    <div className={`mb-8 max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      <h2 data-reveal className={`text-[28px] md:text-[36px] font-extrabold leading-tight ${dark ? 'text-white' : 'text-on-surface'}`}>
        {title}
      </h2>
      <div data-reveal="line" className={`home-gradient-underline mt-3 ${centered ? 'mx-auto' : ''}`} aria-hidden="true" />
      {intro && <p className={`mt-4 text-[15px] md:text-base leading-relaxed ${dark ? 'text-white/65' : 'text-on-surface-variant'}`}>{intro}</p>}
    </div>
  )
}

function splitWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean)
}

function countStaggerCharacters(text: string) {
  return splitWords(text).reduce((total, word) => total + word.length, 0)
}

function countStaggerWords(text: string) {
  return splitWords(text).length
}

function getHeroAnimationDelays(wordCount: number, showDivider: boolean) {
  const lastWordDone = heroFirstWordDelayMs + Math.max(0, wordCount - 1) * heroWordStepMs + heroWordDurationMs
  const dividerDelay = lastWordDone + 90
  return {
    divider: dividerDelay,
    subline: showDivider ? dividerDelay + 170 : lastWordDone + 120,
    cta: showDivider ? dividerDelay + 260 : lastWordDone + 210,
  }
}

function StaggeredText({
  text,
  className,
  charClassName,
  nowrap,
}: {
  text: string
  className: string
  charClassName: string
  nowrap: boolean
}) {
  const words = splitWords(text)
  let characterIndex = 0

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={nowrap ? 'inline-block whitespace-nowrap' : 'inline'}>
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} className="stagger-word">
            {Array.from(word).map((character, index) => {
              const currentIndex = characterIndex
              characterIndex += 1
              return (
                <span key={`${word}-${index}-${character}`} className={`stagger-char ${charClassName}`} style={{ '--ci': currentIndex } as CSSProperties}>
                  {character}
                </span>
              )
            })}
            {wordIndex < words.length - 1 ? <span className="stagger-space" aria-hidden="true">&nbsp;</span> : null}
          </span>
        ))}
      </span>
    </span>
  )
}

function HeroWordTitle({
  text,
  className,
  nowrap,
}: {
  text: string
  className: string
  nowrap: boolean
}) {
  const words = splitWords(text)

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={nowrap ? 'inline-block whitespace-nowrap' : 'inline'}>
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="stagger-word hero-stagger-word" style={{ '--hero-word-delay': `${heroFirstWordDelayMs + index * heroWordStepMs}ms` } as CSSProperties}>
            {word}
            {index < words.length - 1 ? <span className="stagger-space" aria-hidden="true">&nbsp;</span> : null}
          </span>
        ))}
      </span>
    </span>
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
    return { backgroundImage: gradient, backgroundSize: 'cover', backgroundPosition: 'center' }
  }

  return {
    backgroundImage: `linear-gradient(rgba(185,20,76,${overlay}), rgba(185,20,76,${overlay})), ${cssUrl(imageUrl)}, ${gradient}`,
    backgroundSize: 'cover, cover, cover',
    backgroundPosition: 'center, center, center',
  }
}

function resolveStoryHref(lang: BrandLang, href: string, storyId?: string) {
  const candidate = href.trim()
  if (/^https?:\/\//i.test(candidate) || candidate.startsWith('/')) return candidate
  const targetId = !candidate || candidate === '#' ? storyId : candidate.replace(/^#/, '')
  return `${localizedPath(lang, '/the-one')}${targetId ? `#${encodeURIComponent(targetId)}` : ''}`
}

function getCaseStudyThumbnail(story: CaseStudy) {
  const [thumbnail] = uniqueImageUrls([
    story.thumbnailUrl,
    story.backgroundImageUrl,
    story.backgroundImages?.[0],
    story.screenBackground?.imageUrl,
    story.logoUrl,
    storyLogoById[story.id],
    '/logo-gg.png',
  ])
  return thumbnail || '/logo-gg.png'
}

function getCaseStudyGallery(story: CaseStudy) {
  return uniqueImageUrls([
    getCaseStudyThumbnail(story),
    ...(story.homepageGalleryImages ?? []),
    ...(story.backgroundImages ?? []),
    story.backgroundImageUrl,
    story.screenBackground?.imageUrl,
    story.logoUrl,
    storyLogoById[story.id],
    '/logo-gg.png',
  ]).slice(0, 4)
}

function getFeaturedStats(story: CaseStudy) {
  const explicit = story.featuredStats?.filter((metric) => metric.value.trim() || metric.label.trim()) ?? []
  const source = explicit.length ? explicit : story.keyMetrics.filter((metric) => metric.value.trim() || metric.label.trim()).slice(0, 2)
  return source.slice(0, 2)
}

function isLogoLikeImage(url: string) {
  return /(^|\/)logo[-_]/i.test(url) || /logo[-_]/i.test(url)
}

function getHomepageCaseStudies(stories: CaseStudy[]) {
  return stories
    .map((story, index) => ({ story, index, order: Number.parseFloat(story.homepageOrder ?? '') }))
    .filter(({ story }) => story.showOnHomepage !== false)
    .sort((left, right) => {
      const leftOrder = Number.isFinite(left.order) ? left.order : left.index
      const rightOrder = Number.isFinite(right.order) ? right.order : right.index
      return leftOrder - rightOrder || left.index - right.index
    })
    .map(({ story }) => story)
}

type StoryPreviewState = {
  story: CaseStudy
  style: CSSProperties
}

const storyPreviewThemes: Record<string, { shell: string; accent: string; glow: string; chip: string }> = {
  phinoi: {
    shell: 'linear-gradient(145deg,rgba(255,243,219,0.98),rgba(255,180,92,0.9) 46%,rgba(219,39,119,0.86))',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.34)',
    chip: 'rgba(245,158,11,0.16)',
  },
  'cota-cuti': {
    shell: 'linear-gradient(145deg,rgba(255,239,248,0.98),rgba(255,122,168,0.88) 42%,rgba(245,158,11,0.88))',
    accent: '#db2777',
    glow: 'rgba(219,39,119,0.34)',
    chip: 'rgba(219,39,119,0.12)',
  },
  inkaholic: {
    shell: 'linear-gradient(145deg,rgba(255,242,246,0.98),rgba(244,63,94,0.84) 45%,rgba(35,12,22,0.92))',
    accent: '#f43f5e',
    glow: 'rgba(244,63,94,0.36)',
    chip: 'rgba(244,63,94,0.13)',
  },
  'qanda-books': {
    shell: 'linear-gradient(145deg,rgba(255,248,232,0.98),rgba(251,146,60,0.86) 43%,rgba(239,68,68,0.86))',
    accent: '#fb923c',
    glow: 'rgba(251,146,60,0.34)',
    chip: 'rgba(251,146,60,0.15)',
  },
  curnon: {
    shell: 'linear-gradient(145deg,rgba(255,246,236,0.98),rgba(214,163,95,0.84) 44%,rgba(17,24,39,0.9))',
    accent: '#d6a35f',
    glow: 'rgba(214,163,95,0.34)',
    chip: 'rgba(214,163,95,0.15)',
  },
  'annita-studios': {
    shell: 'linear-gradient(145deg,rgba(255,240,242,0.98),rgba(239,47,57,0.86) 45%,rgba(18,3,5,0.92))',
    accent: '#ef2f39',
    glow: 'rgba(239,47,57,0.36)',
    chip: 'rgba(239,47,57,0.14)',
  },
}

function getStoryPreviewTheme(story: CaseStudy) {
  return storyPreviewThemes[story.id] ?? {
    shell: 'linear-gradient(145deg,rgba(255,247,251,0.98),rgba(219,39,119,0.86) 44%,rgba(245,158,11,0.86))',
    accent: '#db2777',
    glow: 'rgba(219,39,119,0.34)',
    chip: 'rgba(219,39,119,0.13)',
  }
}

function getPreviewPopoverStyle(target: HTMLElement): CSSProperties {
  const rect = target.getBoundingClientRect()
  const width = Math.min(window.innerWidth - 32, 380)
  const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 16), window.innerWidth - width - 16)
  const openUp = rect.top + rect.height / 2 > window.innerHeight / 2
  const top = openUp ? rect.top - 12 : rect.bottom + 12
  return {
    left,
    top,
    width,
    maxHeight: 'min(560px, 85vh)',
    borderRadius: 22,
    transform: openUp ? 'translateY(-100%)' : 'none',
    transformOrigin: openUp ? '50% 100%' : '50% 0%',
  }
}

function CaseStudyPreviewPopover({ story, lang }: { story: CaseStudy; lang: BrandLang }) {
  const images = getCaseStudyGallery(story)
  const stats = getFeaturedStats(story)
  const [activeImage, setActiveImage] = useState(0)
  const href = resolveStoryHref(lang, story.id, story.id)
  const theme = getStoryPreviewTheme(story)

  useEffect(() => {
    setActiveImage(0)
    if (images.length < 2) return
    const interval = window.setInterval(() => {
      setActiveImage((index) => (index + 1) % images.length)
    }, 2200)
    return () => window.clearInterval(interval)
  }, [story.id, images.length])

  return (
    <article
      className="pointer-events-auto relative flex max-h-[min(560px,85vh)] flex-col overflow-hidden rounded-[22px] border border-white/70 text-on-surface ring-1 ring-white/60 backdrop-blur-xl"
      style={{ background: theme.shell, boxShadow: `0 28px 90px ${theme.glow}` }}
    >
      <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 18% 12%, rgba(255,255,255,0.9), transparent 30%), radial-gradient(circle at 86% 22%, ${theme.glow}, transparent 34%)` }} aria-hidden="true" />
      <div className="relative m-3 aspect-video max-h-[180px] shrink-0 overflow-hidden rounded-[18px] bg-surface-container-low shadow-[0_18px_44px_rgba(43,23,33,0.18)]">
        {images.map((imageUrl, index) => (
          <img
            key={`${story.id}-preview-${imageUrl}-${index}`}
            src={imageUrl}
            alt={index === 0 ? `${story.brandName} case study preview` : ''}
            aria-hidden={index === 0 ? undefined : true}
            className={`absolute inset-0 h-full w-full transition duration-700 ${
              isLogoLikeImage(imageUrl) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffe3ef)] object-contain p-10' : 'object-cover'
            } ${activeImage === index ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/18" aria-hidden="true" />
        {images.length > 1 && (
          <div className="absolute bottom-3 left-4 flex gap-1.5" aria-hidden="true">
            {images.map((imageUrl, index) => (
              <span key={`${story.id}-dot-${imageUrl}-${index}`} className={`h-1.5 rounded-full transition-all ${activeImage === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55'}`} />
            ))}
          </div>
        )}
      </div>
      <div className="relative m-3 mt-0 flex min-h-0 flex-1 flex-col rounded-[18px] border border-white/65 bg-white/[0.88] p-4 shadow-[0_18px_44px_rgba(43,23,33,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.accent }}>{story.category}</p>
            <h3 className="mt-2 line-clamp-2 text-[22px] font-extrabold leading-tight text-on-surface">{story.brandName}</h3>
          </div>
          <img src={getStoryLogoForHome(story)} alt="" aria-hidden="true" className="h-11 w-11 shrink-0 rounded-full border border-white bg-white object-contain p-1.5 shadow-[0_10px_28px_rgba(43,23,33,0.14)]" />
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-relaxed text-on-surface-variant">{story.shortDescription}</p>
        {stats.length > 0 && (
          <div className="mt-4 grid gap-1.5">
            {stats.map((stat) => (
              <span key={`${story.id}-preview-stat-${stat.value}-${stat.label}`} className="rounded-full bg-gradient-to-r from-primary/12 via-tertiary/10 to-secondary/12 px-3 py-1.5 text-xs font-black text-primary">
                <strong>{stat.value}</strong>{stat.label ? ` ${stat.label}` : ''}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-extrabold text-on-surface-variant">
          <span className="rounded-full px-2.5 py-1" style={{ background: theme.chip, color: theme.accent }}>{story.period}</span>
          {story.services.slice(0, 2).map((service) => (
            <span key={`${story.id}-${service}`} className="rounded-full bg-surface-container/80 px-2.5 py-1">
              {service}
            </span>
          ))}
          {story.services.length > 2 && <span className="rounded-full bg-surface-container/80 px-2.5 py-1">+{story.services.length - 2}</span>}
        </div>
        <a
          href={href}
          className="btn-shine mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] transition hover:opacity-95"
        >
          About this one
          <ArrowUpRight size={15} strokeWidth={2.5} aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

function CaseStudyShowcase({ stories, lang }: { stories: CaseStudy[]; lang: BrandLang }) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const showcaseStories = getHomepageCaseStudies(stories)
  const [bannerIndex, setBannerIndex] = useState(0)
  const [previewStory, setPreviewStory] = useState<StoryPreviewState | null>(null)
  const [canHover, setCanHover] = useState(false)
  const hoverOpenTimer = useRef<number | null>(null)
  const hoverCloseTimer = useRef<number | null>(null)
  const pauseUntilRef = useRef(0)

  useEffect(() => {
    setCanHover(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false)
  }, [])

  useEffect(() => {
    if (showcaseStories.length < 2) return
    const interval = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return
      setBannerIndex((index) => (index + 1) % showcaseStories.length)
    }, 3600)
    return () => window.clearInterval(interval)
  }, [showcaseStories.length])

  useEffect(() => {
    const rail = railRef.current
    if (!rail || canHover) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const delta = now - last
      last = now
      if (Date.now() >= pauseUntilRef.current) {
        rail.scrollLeft += (delta / 1000) * 28
        if (rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2) rail.scrollLeft = 0
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [canHover, showcaseStories.length])

  if (!showcaseStories.length) return null

  const activeBannerIndex = bannerIndex % showcaseStories.length
  const activeStory = showcaseStories[activeBannerIndex] ?? showcaseStories[0]
  const activeStoryHref = resolveStoryHref(lang, activeStory.id, activeStory.id)
  const activeStats = getFeaturedStats(activeStory)

  function moveRail(direction: -1 | 1) {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: direction * Math.max(280, rail.clientWidth * 0.82), behavior: 'smooth' })
  }

  function clearPreviewTimers() {
    if (hoverOpenTimer.current) window.clearTimeout(hoverOpenTimer.current)
    if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current)
  }

  function showPreview(story: CaseStudy, target: HTMLElement) {
    if (!canHover) return
    clearPreviewTimers()
    hoverOpenTimer.current = window.setTimeout(() => {
      setPreviewStory({ story, style: getPreviewPopoverStyle(target) })
    }, 300)
  }

  function closePreviewSoon() {
    clearPreviewTimers()
    hoverCloseTimer.current = window.setTimeout(() => setPreviewStory(null), 150)
  }

  function pauseAuto(ms = 5000) {
    pauseUntilRef.current = Date.now() + ms
  }

  return (
    <section className="relative overflow-visible bg-surface-container px-5 py-8 md:py-12 lg:px-10" onMouseLeave={closePreviewSoon}>
      <div className="mx-auto max-w-6xl">
        <a
          href={activeStoryHref}
          data-reveal="scale"
          onMouseEnter={() => setPreviewStory(null)}
          onFocus={() => setPreviewStory(null)}
          className="group relative block aspect-[16/8] w-full overflow-hidden rounded-[24px] bg-[#190b12] text-left shadow-[0_24px_70px_rgba(80,20,50,0.18)] outline-none ring-1 ring-white/65 transition duration-500 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:aspect-[16/6]"
          aria-label={`Open ${activeStory.brandName} story`}
        >
          {showcaseStories.map((story, index) => (
            (() => {
              const thumbnail = getCaseStudyThumbnail(story)
              return (
                <img
                  key={`${story.id}-banner-${index}`}
                  src={thumbnail}
                  alt={index === activeBannerIndex ? `${story.brandName} case study thumbnail` : ''}
                  aria-hidden={index === activeBannerIndex ? undefined : true}
                  className={`pointer-events-none absolute inset-0 h-full w-full transition duration-700 group-hover:scale-[1.025] ${
                    isLogoLikeImage(thumbnail) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffd8e8)] object-contain p-12 md:p-20' : 'object-cover'
                  } ${index === activeBannerIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              )
            })()
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white md:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/68">Featured case</p>
            <h2 className="mt-2 max-w-2xl text-[30px] font-extrabold leading-tight md:text-[48px]">{activeStory.brandName}</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-white/76 md:text-base">{activeStory.caption || activeStory.shortDescription}</p>
            {activeStats.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeStats.map((stat) => (
                  <span key={`${activeStory.id}-banner-stat-${stat.value}-${stat.label}`} className="rounded-full border border-white/24 bg-white/18 px-3 py-1.5 text-xs font-black text-white shadow-[0_10px_26px_rgba(0,0,0,0.16)] backdrop-blur-md">
                    {stat.value}{stat.label ? ` ${stat.label}` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        </a>

        <div className="relative mt-3">
          {showcaseStories.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveRail(-1)}
                className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Previous case studies"
              >
                <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => moveRail(1)}
                className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Next case studies"
              >
                <ChevronRight size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </>
          )}
          <div ref={railRef} className="case-study-rail flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2" onPointerDown={() => pauseAuto()} onTouchStart={() => pauseAuto()}>
            {showcaseStories.map((story, index) => (
              <button
                key={`${story.id}-rail`}
                type="button"
                data-reveal="tile-in"
                data-tile-direction={index % 2 ? 'right' : 'bottom'}
                style={{ '--ri': index } as CSSProperties}
                onMouseEnter={(event) => showPreview(story, event.currentTarget)}
                onFocus={(event) => showPreview(story, event.currentTarget)}
                onMouseLeave={closePreviewSoon}
                onClick={(event) => {
                  pauseAuto()
                  setBannerIndex(index)
                  if (!canHover) window.location.href = resolveStoryHref(lang, story.id, story.id)
                  else showPreview(story, event.currentTarget)
                }}
                className={[
                  'group relative aspect-[16/10] shrink-0 basis-[42vw] snap-start overflow-hidden rounded-[16px] bg-[#180b11] text-left shadow-[0_14px_40px_rgba(80,20,50,0.13)] outline-none ring-1 transition duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:basis-[calc((100%_-_8px)/2.25)] md:basis-[calc((100%_-_16px)/3)] lg:basis-[calc((100%_-_24px)/4)]',
                  index === activeBannerIndex ? 'ring-primary/70' : 'ring-white/70',
                ].join(' ')}
                aria-label={`Preview ${story.brandName}`}
              >
                {(() => {
                  const thumbnail = getCaseStudyThumbnail(story)
                  return (
                    <img
                      src={thumbnail}
                      alt=""
                      aria-hidden="true"
                      className={`absolute inset-0 h-full w-full transition duration-500 group-hover:scale-[1.06] ${
                        isLogoLikeImage(thumbnail) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffd8e8)] object-contain p-7' : 'object-cover'
                      }`}
                    />
                  )
                })()}
                <div className={`absolute inset-0 bg-gradient-to-t ${index === activeBannerIndex ? 'from-black/82 via-black/18 to-transparent' : 'from-white/88 via-white/46 to-white/12 group-hover:from-black/76 group-hover:via-black/12 group-hover:to-transparent'}`} aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className={`line-clamp-1 text-[17px] font-extrabold leading-tight ${index === activeBannerIndex ? 'text-white' : 'text-on-surface group-hover:text-white'}`}>{story.brandName}</h3>
                  <p className={`mt-1 line-clamp-2 text-xs font-semibold leading-relaxed ${index === activeBannerIndex ? 'text-white/70' : 'text-on-surface-variant group-hover:text-white/70'}`}>{story.headline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {previewStory && canHover && (
        <>
          <div className="pointer-events-none fixed z-[80] hidden md:block" style={previewStory.style}>
            <CaseStudyPreviewPopover story={previewStory.story} lang={lang} />
          </div>
        </>
      )}
    </section>
  )
}

function RedFlagsSection({ block }: { block?: ReturnType<typeof getCmsBlock> }) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const items = (block?.items ?? []).filter((item) => item.published !== false && (item.thumbnailUrl?.trim() || item.imageUrl?.trim() || item.title.trim()))
  if (!block || (!block.heading.trim() && !block.body.trim() && !items.length)) return null

  function scrollRow(direction: -1 | 1) {
    const row = rowRef.current
    if (!row) return
    row.scrollBy({ left: direction * Math.max(280, row.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-[#180712] px-5 py-14 text-white md:py-20 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(219,39,119,0.34),transparent_34%),radial-gradient(circle_at_86%_24%,rgba(245,158,11,0.24),transparent_30%),linear-gradient(135deg,rgba(255,122,168,0.1),rgba(239,68,68,0.08))]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p data-reveal className="text-[11px] font-black uppercase tracking-[0.2em] text-white/54">Red flags</p>
          <h2 data-reveal className="mt-4 max-w-xl font-serif text-[38px] font-normal leading-[0.98] md:text-[58px]">
            {block.heading || 'Sound familiar?'}
          </h2>
          {block.body && (
            <p data-reveal className="mt-5 max-w-xl bg-gradient-to-r from-[#ff7aa8] via-[#ef4444] to-[#f59e0b] bg-clip-text text-[24px] font-black leading-tight text-transparent md:text-[34px]">
              {block.body}
            </p>
          )}
        </div>
        <div className="red-flags-row group/row relative mt-8">
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scrollRow(-1)}
                className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/72 text-on-surface opacity-60 shadow-[0_16px_36px_rgba(0,0,0,0.26)] backdrop-blur-md transition hover:bg-white hover:opacity-100 md:opacity-0 md:group-hover/row:opacity-100"
                aria-label="Previous red flags"
              >
                <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollRow(1)}
                className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/72 text-on-surface opacity-60 shadow-[0_16px_36px_rgba(0,0,0,0.26)] backdrop-blur-md transition hover:bg-white hover:opacity-100 md:opacity-0 md:group-hover/row:opacity-100"
                aria-label="Next red flags"
              >
                <ChevronRight size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </>
          )}
          <div ref={rowRef} className="red-flags-scroll flex snap-x gap-2.5 overflow-x-auto scroll-smooth pb-2">
          {items.map((item, index) => (
            <a
              key={`${item.title}-${index}`}
              href={item.href?.trim() || undefined}
              data-reveal="tile-in"
              data-tile-direction="bottom"
              style={{ '--ri': index } as CSSProperties}
              className="red-flag-poster group/poster relative aspect-video shrink-0 basis-[78vw] snap-start overflow-hidden rounded-lg border border-white/12 bg-white/[0.08] shadow-[0_22px_70px_rgba(0,0,0,0.22)] outline-none transition duration-300 hover:z-10 hover:scale-[1.06] hover:shadow-[0_30px_90px_rgba(219,39,119,0.28)] focus-visible:ring-2 focus-visible:ring-white sm:basis-[48vw] md:basis-[30vw] lg:basis-[calc((100%_-_40px)/4.5)]"
              aria-label={item.title}
            >
              {item.thumbnailUrl || item.imageUrl ? (
                <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover/poster:scale-[1.04]" />
              ) : (
                <div className="flex h-full w-full items-end bg-gradient-to-br from-primary via-red-500 to-secondary p-4">
                  <p className="text-[15px] font-black leading-tight text-white md:text-[18px]">{item.title}</p>
                </div>
              )}
            </a>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function uniqueImageUrls(urls: Array<string | undefined>) {
  return Array.from(new Set(urls.map((url) => url?.trim()).filter(Boolean) as string[]))
}

function getPeopleAvatarImages(member: CmsBlockItem) {
  const carouselImages = uniqueImageUrls(member.avatarImages ?? [])
  if (carouselImages.length) return carouselImages.slice(0, 4)
  const legacyImages = uniqueImageUrls([member.imageUrl, member.funPhotoUrl, member.photoUrl, member.backgroundImageUrl])
  return (legacyImages.length ? legacyImages : ['/logo-gg.png']).slice(0, 4)
}

function formatPeopleQuote(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed
  return `"${trimmed}"`
}

function splitPeopleRoles(value?: string) {
  return value
    ?.split(/[\/,|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6) ?? []
}

function PeopleSection({ block }: { block?: ReturnType<typeof getCmsBlock> }) {
  const members = (block?.items ?? []).filter((item) => item.published !== false).slice(0, 6)
  const railRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [previewMember, setPreviewMember] = useState<{ member: CmsBlockItem; style: CSSProperties } | null>(null)
  const [canHover, setCanHover] = useState(false)
  const hoverOpenTimer = useRef<number | null>(null)
  const hoverCloseTimer = useRef<number | null>(null)
  const pauseUntilRef = useRef(0)
  const hasPeople = Boolean(block && members.length)
  const autoSlideSeconds = Math.max(2.5, Number.parseFloat(block?.autoSlideSeconds ?? '5') || 5)

  useEffect(() => {
    setCanHover(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false)
  }, [])

  useEffect(() => {
    if (!hasPeople) return
    if (members.length < 2) return
    const interval = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return
      setActiveIndex((index) => (index + 1) % members.length)
    }, autoSlideSeconds * 1000)
    return () => window.clearInterval(interval)
  }, [autoSlideSeconds, hasPeople, members.length])

  if (!block || !members.length) return null

  const closingLine1 = block.closingLine1 || 'We quit our 9-5 and started our own business.'
  const closingLine2 = block.closingLine2 || "Isn't it your turn now?"
  const activeMember = members[activeIndex % members.length] ?? members[0]
  const activeRoles = splitPeopleRoles(activeMember.label)
  const activeBanner = activeMember.bannerImageUrl || getPeopleAvatarImages(activeMember)[0] || '/logo-gg.png'

  function pauseAuto(ms = 5000) {
    pauseUntilRef.current = Date.now() + ms
  }

  function moveRail(direction: -1 | 1) {
    const rail = railRef.current
    if (!rail) return
    pauseAuto()
    rail.scrollBy({ left: direction * Math.max(220, rail.clientWidth * 0.8), behavior: 'smooth' })
    setActiveIndex((index) => (index + direction + members.length) % members.length)
  }

  function clearPreviewTimers() {
    if (hoverOpenTimer.current) window.clearTimeout(hoverOpenTimer.current)
    if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current)
  }

  function showMemberPreview(member: CmsBlockItem, target: HTMLElement) {
    if (!canHover) return
    clearPreviewTimers()
    hoverOpenTimer.current = window.setTimeout(() => {
      setPreviewMember({ member, style: getPreviewPopoverStyle(target) })
    }, 300)
  }

  function closeMemberPreviewSoon() {
    clearPreviewTimers()
    hoverCloseTimer.current = window.setTimeout(() => setPreviewMember(null), 150)
  }

  return (
    <section className="px-5 py-12 md:py-16 lg:px-10" onMouseLeave={closeMemberPreviewSoon}>
      <div className="mx-auto max-w-6xl">
        <SectionHeader title={block.heading || 'The One People'} intro={block.body} align="left" />
        <div data-reveal="scale" className="group relative aspect-[16/8] overflow-hidden rounded-[24px] bg-[#190b12] text-white shadow-[0_24px_70px_rgba(80,20,50,0.16)] ring-1 ring-white/70 md:aspect-[16/6]">
          <img
            src={activeBanner}
            alt={`${activeMember.title} banner`}
            className={`absolute inset-0 h-full w-full transition duration-700 ${
              isLogoLikeImage(activeBanner) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffd8e8)] object-contain p-12 md:p-20' : 'object-cover'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/68">The One People</p>
            <h3 className="mt-2 max-w-2xl text-[30px] font-extrabold leading-tight md:text-[48px]">{activeMember.title}</h3>
            {activeRoles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeRoles.slice(0, 4).map((role) => (
                  <span key={`${activeMember.title}-${role}`} className="rounded-full border border-white/24 bg-white/18 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md">
                    {role}
                  </span>
                ))}
              </div>
            )}
            {activeMember.body && <p className="mt-3 max-w-2xl text-sm font-semibold italic leading-relaxed text-white/80 md:text-base">{formatPeopleQuote(activeMember.body)}</p>}
          </div>
        </div>
        <div className="relative mt-3">
          {members.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveRail(-1)}
                className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Previous people"
              >
                <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => moveRail(1)}
                className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Next people"
              >
                <ChevronRight size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </>
          )}
          <div ref={railRef} className="case-study-rail flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2" onPointerDown={() => pauseAuto()} onTouchStart={() => pauseAuto()}>
          {members.map((member, index) => {
            const avatarImages = getPeopleAvatarImages(member)
            const thumbnail = member.thumbnailUrl || avatarImages[0] || '/logo-gg.png'
            const active = index === activeIndex % members.length
            return (
              <button
                key={`${member.title}-${index}`}
                data-reveal="people-card"
                type="button"
                onMouseEnter={(event) => showMemberPreview(member, event.currentTarget)}
                onMouseLeave={closeMemberPreviewSoon}
                onFocus={(event) => showMemberPreview(member, event.currentTarget)}
                onClick={() => {
                  pauseAuto()
                  setActiveIndex(index)
                }}
                style={{ '--ri': index } as CSSProperties}
                className={[
                  'group relative aspect-[16/10] shrink-0 basis-[42vw] snap-start overflow-hidden rounded-[16px] bg-[#180b11] text-left shadow-[0_14px_40px_rgba(80,20,50,0.13)] outline-none ring-1 transition duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:basis-[calc((100%_-_8px)/2.25)] md:basis-[calc((100%_-_16px)/3)] lg:basis-[calc((100%_-_24px)/4)]',
                  active ? 'ring-primary/80' : 'ring-white/70',
                ].join(' ')}
              >
                <img
                  src={thumbnail}
                  alt=""
                  aria-hidden="true"
                  className={`absolute inset-0 h-full w-full transition duration-500 group-hover:scale-[1.06] ${
                    isLogoLikeImage(thumbnail) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffd8e8)] object-contain p-7' : 'object-cover'
                  }`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${active ? 'from-black/82 via-black/18 to-transparent' : 'from-white/88 via-white/46 to-white/12 group-hover:from-black/76 group-hover:via-black/12 group-hover:to-transparent'}`} aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className={`line-clamp-1 text-[17px] font-extrabold leading-tight ${active ? 'text-white' : 'text-on-surface group-hover:text-white'}`}>{member.title}</h3>
                </div>
              </button>
            )
          })}
          </div>
        </div>
        {previewMember && canHover && (
          <div className="pointer-events-none fixed z-[80] hidden md:block" style={previewMember.style}>
            {(() => {
              const member = previewMember.member
              const image = member.bannerImageUrl || member.thumbnailUrl || getPeopleAvatarImages(member)[0] || '/logo-gg.png'
              const roles = splitPeopleRoles(member.label)
              return (
                <article className="pointer-events-auto flex max-h-[min(520px,82vh)] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white/[0.92] text-on-surface shadow-[0_28px_90px_rgba(219,39,119,0.28)] ring-1 ring-white/60 backdrop-blur-xl">
                  <div className="m-3 aspect-video max-h-[180px] shrink-0 overflow-hidden rounded-[18px] bg-surface-container-low">
                    <img src={image} alt={`${member.title} preview`} className={`h-full w-full ${isLogoLikeImage(image) ? 'object-contain p-10' : 'object-cover'}`} />
                  </div>
                  <div className="m-3 mt-0 rounded-[18px] border border-primary/10 bg-white/88 p-4">
                    <h3 className="text-[22px] font-extrabold leading-tight text-on-surface">{member.title}</h3>
                    {roles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {roles.slice(0, 4).map((role) => (
                          <span key={`${member.title}-popup-${role}`} className="rounded-full bg-gradient-to-r from-primary/10 via-tertiary/10 to-secondary/10 px-2.5 py-1 text-[11px] font-black text-primary">{role}</span>
                        ))}
                      </div>
                    )}
                    {member.body && <p className="mt-3 line-clamp-3 text-sm font-semibold italic leading-relaxed text-on-surface-variant">{formatPeopleQuote(member.body)}</p>}
                    {member.proofPoint && <p className="mt-3 rounded-2xl bg-primary/10 px-3 py-2 text-xs font-black text-primary">{member.proofPoint}</p>}
                  </div>
                </article>
              )
            })()}
          </div>
        )}
        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="home-people-closing-one text-[24px] italic leading-tight text-on-surface/85 md:text-[28px]">{closingLine1}</p>
          <p className="home-people-closing-two mt-3 bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[28px] font-semibold leading-tight text-transparent md:text-[44px]">
            {closingLine2}
          </p>
        </div>
      </div>
    </section>
  )
}

function ClosingBanner({
  block,
  stories,
  faqItems,
}: {
  block?: ReturnType<typeof getCmsBlock>
  stories: CaseStudy[]
  faqItems: Array<{ question: string; answer: string }>
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  if (!block) return null
  const overlayValue = Number.parseFloat(block.backgroundOverlayOpacity ?? '0.62')
  const overlay = Number.isFinite(overlayValue) ? Math.min(0.85, Math.max(0.2, overlayValue)) : 0.62
  const gradient = block.backgroundGradient || 'linear-gradient(135deg,#db2777 0%,#ef4444 48%,#f59e0b 100%)'
  const style: CSSProperties = block.backgroundImageUrl
    ? {
      backgroundImage: `linear-gradient(rgba(185,20,76,${overlay}), rgba(185,20,76,${overlay})), ${cssUrl(block.backgroundImageUrl)}, ${gradient}`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
    : { backgroundImage: gradient }
  const logos = stories.map(getStoryLogoForHome).filter(Boolean)
  const faqTitle = block.heading?.trim() || 'Frequently Asked Questions'
  const faqSubtitle = block.subtitle?.trim() || block.body?.trim()
  const closingCharacterCount = countStaggerCharacters(faqTitle)
  const closingFollowDelay = Math.max(360, closingCharacterCount * 18 + 220)

  return (
    <section className="closing-section px-0 py-0">
      <div className="closing-banner relative flex min-h-[420px] items-center overflow-hidden px-5 py-16 text-center md:min-h-[540px] lg:px-10" style={style}>
        <div className="absolute inset-0 closing-banner-bg" aria-hidden="true" />
        {logos.length > 0 && (
          <div className="closing-logo-rail absolute inset-x-0 top-7 h-12 overflow-hidden opacity-80">
            <div className="closing-logo-marquee flex w-max items-center gap-12">
              {[...logos, ...logos].map((logo, index) => (
                <img key={`${logo}-${index}`} src={logo} alt="" aria-hidden="true" className="h-8 w-auto max-w-[128px] object-contain brightness-0 invert opacity-80" />
              ))}
            </div>
          </div>
        )}
        <div className="closing-content relative mx-auto w-full max-w-[1200px]" data-reveal="closing-content">
          <div className="mx-auto mb-7 max-w-3xl text-left md:text-center">
            <h2 className="text-[30px] font-black leading-tight text-white md:text-[42px]">
              <StaggeredText text={faqTitle} className="inline" charClassName="closing-char" nowrap={false} />
            </h2>
            <div className="home-gradient-underline mt-3 bg-white/80 md:mx-auto" aria-hidden="true" />
            {faqSubtitle && (
              <p className="closing-follow mt-4 text-[15px] font-bold leading-relaxed text-white/82 md:text-[18px]" style={{ '--closing-delay': `${closingFollowDelay}ms` } as CSSProperties}>
                {faqSubtitle}
              </p>
            )}
          </div>
          {faqItems.length > 0 && (
            <div className="closing-faq mx-auto grid max-w-3xl gap-3 text-left">
              {faqItems.map((item, index) => {
                const open = openFaqIndex === index
                return (
                  <div
                    key={`${item.question}-${index}`}
                    className="closing-faq-item overflow-hidden rounded-2xl border border-white/22 bg-white/14 text-white shadow-[0_18px_46px_rgba(0,0,0,0.12)] backdrop-blur-xl"
                    style={{ '--ri': index, '--closing-delay': `${closingFollowDelay + 140 + index * 80}ms` } as CSSProperties}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-[15px] font-extrabold leading-snug md:text-[16px]"
                      aria-expanded={open}
                    >
                      <span>{item.question}</span>
                      <span className={`closing-faq-plus flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/18 text-xl leading-none transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    <div className={`closing-faq-answer grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm font-semibold leading-relaxed text-white/78">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function BrandHomePage({
  lang = 'en',
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
  const [heroReady, setHeroReady] = useState(false)

  const c = compactHomeByLang[lang]
  const homeBackground = mergeHomepageBackground(siteSettings?.homepageBackground)
  const flowWaveActive = homeBackground.mode === 'flow-wave'
  const homeMeta = getLocalizedPageMeta(cmsPage, lang, homeMetaByLang[lang])
  const heroBlock = getLocalizedCmsBlock(cmsPage, 'hero', lang)
  const packagesBlock = getLocalizedCmsBlock(cmsPage, 'packages', lang)
  const redFlagsBlock = getLocalizedCmsBlock(cmsPage, 'red-flags', lang)
  const peopleBlock = getLocalizedCmsBlock(cmsPage, 'people', lang)
  const closingBlock = getLocalizedCmsBlock(cmsPage, 'closing', lang)
  const storiesBlock = getLocalizedCmsBlock(theOnePage, 'stories', lang)
  const storyTargets = getOrderedCaseStudies(storiesBlock)
  const heroLines = splitCmsParagraphs(heroBlock?.body)
  const heroLineOne = heroBlock?.heading?.trim() || 'The One by gg99'
  const heroLineTwo = heroBlock?.subtitle?.trim() || heroLines[0] || 'The only one digital agency you needed'
  const isDefaultHeroTitle = heroLineOne.toLowerCase() === 'the one by gg99'
  const heroVideoSources = {
    mp4: heroBlock?.backgroundVideoUrl?.trim() || undefined,
    webm: heroBlock?.backgroundVideoWebmUrl?.trim() || undefined,
    mobileMp4: heroBlock?.backgroundVideoMobileUrl?.trim() || undefined,
    mobileWebm: heroBlock?.backgroundVideoMobileWebmUrl?.trim() || undefined,
    poster: heroBlock?.backgroundVideoPoster?.trim() || undefined,
  }
  const heroHasVideo = Boolean(heroVideoSources.mp4 || heroVideoSources.webm)
  const heroHasOwnBackground = !heroHasVideo && (!flowWaveActive || Boolean(heroBlock?.backgroundImageUrl?.trim()))
  const rawHeroTextMode = heroBlock?.textColor ?? 'light'
  // "light" was chosen for opaque hero backgrounds (gradient/video); on the transparent aurora canvas it is unreadable.
  const heroTextMode = !heroHasOwnBackground && !heroHasVideo && rawHeroTextMode === 'light' ? 'dark' : rawHeroTextMode
  const showHeroDivider = heroBlock?.dividerShow !== false
  const heroWordCount = countStaggerWords(heroLineOne)
  const heroDelays = getHeroAnimationDelays(heroWordCount, showHeroDivider)
  const heroStatChips = (heroBlock?.statChips ?? []).filter((chip) => chip.value.trim() || chip.label.trim()).slice(0, 3)
  const heroCtaSubtext = heroBlock?.ctaSubtext?.trim()
  const showHeroCtaSubtext = heroBlock?.showCtaSubtext === true && Boolean(heroCtaSubtext)
  const showHeroStatChips = heroBlock?.showStatChips === true && heroStatChips.length > 0
  const closingFaqItems = getHomeClosingFaqItems(cmsPage, lang)
  const homeSchemas = [organizationSchema, websiteSchema, homeWebPageSchema, buildHomeFaqSchema(cmsPage, lang)].filter(Boolean)
  const packageItems: CmsBlockItem[] = packagesBlock?.items?.length
    ? packagesBlock.items
    : c.packages.map((item, index) => ({
      title: item.name,
      body: `${item.title}\n${item.text}`,
      icon: ['Rocket', 'Workflow', 'TrendingUp'][index],
      href: item.href,
    }))

  useEffect(() => {
    whenIntroGone(() => setHeroReady(true))
  }, [])

  return (
    <BrandLayout
      lang={lang}
      siteSettings={siteSettings}
      flushTop
      transparentBackground={flowWaveActive}
      floatingCtaRevealSelector="[data-floating-cta-threshold='hero']"
      resolveNavHref={(href, label) => (href === '/packages' || label.toLowerCase().includes('packages') ? '#packages' : href)}
    >
      <SeoHead meta={homeMeta} schema={homeSchemas} lang={lang} />
      {flowWaveActive && <FlowWaveBackground settings={homeBackground} />}

      <section
        className={`home-hero relative flex items-center overflow-hidden ${
          heroHasVideo ? 'min-h-[100svh]' : 'min-h-[52vh] md:min-h-[58vh]'
        } ${heroReady ? 'is-ready' : ''}`}
        style={heroHasOwnBackground ? heroBackgroundStyle(heroBlock) : undefined}
      >
        {heroHasVideo && <HeroBackgroundVideo sources={heroVideoSources} />}
        {heroHasOwnBackground && (
          <>
            <div className="absolute inset-0 tech-grid opacity-35 pointer-events-none" aria-hidden="true" />
            <div className="noise-overlay" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-surface-container" aria-hidden="true" />
          </>
        )}
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-5 pb-14 pt-28 text-center lg:px-10">
          <h1
            className={[
              'hero-word-title home-hero-title-serif text-[clamp(38px,10vw,52px)] font-normal not-italic leading-[0.98] md:text-[clamp(54px,6vw,86px)]',
              heroTextMode === 'gradient' ? 'gg-grad-text' : heroTextMode === 'dark' ? 'text-on-surface' : 'text-white',
            ].join(' ')}
          >
            <HeroWordTitle text={heroLineOne} className="inline" nowrap={isDefaultHeroTitle} />
          </h1>
          {showHeroDivider && (
            <div
              className={`home-hero-divider mt-5 h-px ${heroTextMode === 'dark' ? 'bg-on-surface/25' : 'bg-white/45'}`}
              style={{ '--hero-delay': `${heroDelays.divider}ms` } as CSSProperties}
              aria-hidden="true"
            />
          )}
          <p
            style={{ '--hero-delay': `${heroDelays.subline}ms` } as CSSProperties}
            className={[
              'home-hero-item mt-6 max-w-2xl text-[15px] font-medium leading-relaxed md:text-[20px]',
              heroTextMode === 'dark' ? 'text-on-surface-variant' : 'text-white/90',
            ].join(' ')}
          >
            {heroLineTwo}
          </p>
          <button
            type="button"
            onClick={openBookingModal}
            data-floating-cta-threshold="hero"
            style={{ '--hero-delay': `${heroDelays.cta}ms` } as CSSProperties}
            className="home-hero-item btn-shine cta-idle mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-7 py-3.5 font-bold text-white shadow-[0_16px_36px_rgba(219,39,119,0.28)] hover:opacity-95"
          >
            {resolvePrimaryBookingCtaLabel(heroBlock?.ctaLabel)}
          </button>
          {showHeroCtaSubtext && (
            <p
              style={{ '--hero-delay': `${heroDelays.cta + 140}ms` } as CSSProperties}
              className={`home-hero-item mt-3 max-w-xl text-xs font-bold md:text-sm ${heroTextMode === 'dark' ? 'text-on-surface-variant' : 'text-white/76'}`}
            >
              {heroCtaSubtext}
            </p>
          )}
          {showHeroStatChips && (
            <div
              style={{ '--hero-delay': `${heroDelays.cta + 230}ms` } as CSSProperties}
              className="home-hero-item mt-5 flex flex-wrap justify-center gap-2"
            >
              {heroStatChips.map((chip) => (
                <span key={`${chip.value}-${chip.label}`} className="rounded-full border border-white/24 bg-white/16 px-3 py-1.5 text-xs font-black text-white shadow-[0_10px_26px_rgba(0,0,0,0.12)] backdrop-blur-md md:text-sm">
                  {chip.value}{chip.label ? ` ${chip.label}` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <CaseStudyShowcase stories={storyTargets} lang={lang} />
      <RedFlagsSection block={redFlagsBlock} />

      <section id="packages" className="py-10 md:py-14 px-5 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title={packagesBlock?.heading || 'The One Packages'}
            intro={packagesBlock?.body || (lang === 'vi' ? 'Chọn nhịp tăng trưởng phù hợp với giai đoạn của bạn.' : 'Choose the growth system that fits your stage.')}
            align="center"
          />
          <PackageCards items={packageItems} lang={lang} layout={packagesBlock?.layout === 'cards' ? 'cards' : 'horizontal'} />
          {packagesBlock?.pricingNote && (
            <p className="mx-auto mt-6 max-w-3xl rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm font-bold leading-relaxed text-on-surface-variant">
              {packagesBlock.pricingNote}
            </p>
          )}
          {packagesBlock?.disclaimer && (
            <p className="mx-auto mt-6 max-w-[720px] whitespace-pre-line text-center text-[12px] italic leading-relaxed text-on-surface-variant/60 md:text-[13px]">
              {packagesBlock.disclaimer}
            </p>
          )}
        </div>
      </section>

      <PeopleSection block={peopleBlock} />
      <ClosingBanner block={closingBlock} stories={storyTargets} faqItems={closingFaqItems} />
    </BrandLayout>
  )
}
