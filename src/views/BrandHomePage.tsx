'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  MessageCircle,
  Pause,
  Play,
  Repeat2,
  Send,
} from 'lucide-react'
import { compactHomeByLang, homeMetaByLang, homeWebPageSchema, localizedPath, organizationSchema, websiteSchema, type BrandLang } from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { openBookingModal } from '../components/openBookingModal'
import { PackageCards } from '../components/PackageCards'
import { SeoHead } from '../components/SeoHead'
import { whenIntroGone } from '../hooks/useIntroGate'
import { FlowWaveBackground } from '../components/FlowWaveBackground'
import { HeroBackgroundVideo, type HeroVideoSources } from '../components/HeroBackgroundVideo'
import { getCmsBlock, getLocalizedCmsBlock, getLocalizedPageMeta, splitCmsParagraphs } from '../cms/contentBlocks'
import { mergeHomepageBackground } from '../cms/siteSettings'
import { cldSrcSet, cldWidth } from '../lib/cloudinaryImage'
import { buildHomeFaqSchema, getHomeClosingFaqItems } from '../cms/homeFaqSchema'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import type { CmsBlock, CmsBlockItem, CmsPageContent, CmsSiteSettings } from '../cms/types'
import { getOrderedCaseStudies } from '../data/caseStudyStories'
import type { CaseStudy } from '../data/caseStudies'

const primaryBookingCtaLabel = 'Schedule Our Date'
const defaultHeroGradient = 'linear-gradient(180deg,#FF7AA8 0%,#FF4D7D 45%,#FFB199 100%)'
const defaultClosingPortalSources: HeroVideoSources = {
  mp4: '/closing/closing-portal-1920.mp4',
  webm: '/closing/closing-portal-1920.webm',
  mobileMp4: '/closing/closing-portal-1280.mp4',
  mobileWebm: '/closing/closing-portal-1280.webm',
  poster: '/closing/closing-portal-poster.webp',
  mobilePoster: '/closing/closing-portal-poster.webp',
}
const heroFirstWordDelayMs = 420
const heroWordStepMs = 90
const heroWordDurationMs = 430

function resolvePrimaryBookingCtaLabel(label?: string) {
  const trimmed = label?.trim() ?? ''
  return !trimmed || /book a (free )?consultation|call your shot/i.test(trimmed) ? primaryBookingCtaLabel : trimmed
}

const storyLogoById: Record<string, string> = {
  phinoi: '/avatars/logo-phinoi.png',
  'cota-cuti': '/avatars/logo-cotacuti.png',
  inkaholic: '/avatars/logo-inkaholic.png',
  'qanda-books': '/avatars/logo-qandabook.png',
  curnon: '/avatars/logo-curnon.png',
  'annita-studios': '/avatars/logo-annita.png',
}

function getStoryLogoForHome(story: Pick<CaseStudy, 'id' | 'logoUrl'>) {
  return storyLogoById[story.id] || story.logoUrl || '/avatars/logo-gg.png'
}

// Round 12 A2.3: word-by-word reveal for big headings/quotes ([data-reveal='words'] CSS)
function RevealWords({ text }: { text: string }) {
  const words = splitWords(text)
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="rw-word" style={{ '--wi': index } as CSSProperties}>
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </>
  )
}

function SectionHeader({
  title,
  intro,
  quote,
  dark = false,
  align = 'left',
  perWord = false,
}: {
  title: string
  intro?: string
  quote?: string
  dark?: boolean
  align?: 'left' | 'center'
  perWord?: boolean
}) {
  const centered = align === 'center'
  const titleWordCount = countStaggerWords(title)
  const followDelayMs = perWord ? titleWordCount * 70 + 240 : 130
  return (
    <div className={`mb-8 max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      <h2 data-reveal={perWord ? 'words' : 'true'} className={`text-[28px] md:text-[36px] font-extrabold leading-tight ${dark ? 'text-white' : 'text-on-surface'}`}>
        {perWord ? <RevealWords text={title} /> : title}
      </h2>
      <div data-reveal="line" className={`home-gradient-underline mt-3 ${centered ? 'mx-auto' : ''}`} aria-hidden="true" />
      {intro && (
        <p
          data-reveal="soft"
          style={{ '--rd': `${followDelayMs}ms` } as CSSProperties}
          className={`mt-4 text-[15px] md:text-base leading-relaxed ${dark ? 'text-white/65' : 'text-on-surface-variant'}`}
        >
          {intro}
        </p>
      )}
      {quote && (
        // Round 12 A5: editorial pull-quote — oversized gradient quote mark behind-left,
        // hero-family serif italic, thin gradient underline. Text stays a CMS field.
        <div className="people-quote mt-6" data-reveal="words" style={{ '--rd': `${followDelayMs}ms` } as CSSProperties}>
          <span className="people-quote-mark" aria-hidden="true">&ldquo;</span>
          <p className="people-quote-text text-[19px] italic leading-snug text-[#3d1226] md:text-[24px]">
            <RevealWords text={quote} />
          </p>
          <div className="people-quote-underline" aria-hidden="true" />
        </div>
      )}
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

function heroBackgroundStyle(block: ReturnType<typeof getCmsBlock>): CSSProperties {
  const gradient = block?.backgroundGradient?.trim() || defaultHeroGradient
  return { backgroundImage: gradient, backgroundSize: 'cover', backgroundPosition: 'center' }
}

function normalizeObjectPosition(value: string | undefined, fallback = '50% 50%') {
  const candidate = value?.trim()
  return candidate || fallback
}

function StaticHeroBackground({ block }: { block: ReturnType<typeof getCmsBlock> }) {
  const desktop = block?.backgroundImageUrl?.trim()
  const mobile = block?.backgroundImageMobileUrl?.trim() || desktop
  if (!desktop && !mobile) return null

  const overlayValue = Number.parseFloat(block?.backgroundOverlayOpacity ?? '')
  const overlay = Number.isFinite(overlayValue) ? Math.min(0.85, Math.max(0, overlayValue)) : 0
  const style = {
    '--hero-image-position': normalizeObjectPosition(block?.backgroundImagePosition),
    '--hero-image-position-mobile': normalizeObjectPosition(block?.backgroundImageMobilePosition, normalizeObjectPosition(block?.backgroundImagePosition)),
    '--hero-image-overlay': overlay,
  } as CSSProperties

  return (
    <div className="home-static-hero-media" style={style} aria-hidden="true">
      <picture>
        {mobile && (
          <source
            media="(max-width: 767px)"
            srcSet={cldSrcSet(mobile, [640, 960, 1280]) || undefined}
            sizes="100vw"
          />
        )}
        <img
          src={cldWidth(desktop || mobile, 1600)}
          srcSet={cldSrcSet(desktop || mobile, [1280, 1600, 2400])}
          sizes="100vw"
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <span />
    </div>
  )
}

function getClosingPortalSources(block?: ReturnType<typeof getCmsBlock>): HeroVideoSources {
  return {
    mp4: block?.backgroundVideoUrl?.trim() || defaultClosingPortalSources.mp4,
    webm: block?.backgroundVideoWebmUrl?.trim() || defaultClosingPortalSources.webm,
    mobileMp4: block?.backgroundVideoMobileUrl?.trim() || defaultClosingPortalSources.mobileMp4,
    mobileWebm: block?.backgroundVideoMobileWebmUrl?.trim() || defaultClosingPortalSources.mobileWebm,
    poster: block?.backgroundVideoPoster?.trim() || defaultClosingPortalSources.poster,
    mobilePoster: block?.backgroundVideoMobilePoster?.trim() || block?.backgroundVideoPoster?.trim() || defaultClosingPortalSources.mobilePoster,
  }
}

function hasVideoSource(sources: HeroVideoSources) {
  return Boolean(sources.mp4 || sources.webm || sources.mobileMp4 || sources.mobileWebm)
}

function prefersStaticMedia() {
  if (typeof window === 'undefined') return true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}

function ClosingPortalVideo({ sources }: { sources: HeroVideoSources }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [active, setActive] = useState<{ mp4?: string; webm?: string; poster?: string } | null>(null)
  const [nearViewport, setNearViewport] = useState(false)

  useEffect(() => {
    const target = wrapperRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: '600px 0px', threshold: 0.01 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!nearViewport) return
    if (prefersStaticMedia()) return
    const mobile = window.matchMedia('(max-width: 767px)').matches
    setActive(
      mobile
        ? { mp4: sources.mobileMp4 || sources.mp4, webm: sources.mobileWebm || sources.webm, poster: sources.mobilePoster || sources.poster }
        : { mp4: sources.mp4, webm: sources.webm, poster: sources.poster || sources.mobilePoster },
    )
    // Source choice follows the first viewport load; CMS edits arrive through a new render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearViewport, sources.mobileMp4, sources.mobileWebm, sources.mp4, sources.webm])

  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    cleanupRef.current?.()
    cleanupRef.current = null
    if (!video) return

    let inView = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        if (inView) void video.play().catch(() => undefined)
        else video.pause()
      },
      { threshold: 0.2 },
    )
    observer.observe(video)

    const onVisible = () => {
      if (!document.hidden && inView && video.paused) void video.play().catch(() => undefined)
    }
    document.addEventListener('visibilitychange', onVisible)
    cleanupRef.current = () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  useEffect(() => () => cleanupRef.current?.(), [])

  return (
    <div ref={wrapperRef} className="closing-portal-media" aria-hidden="true">
      {(sources.poster || sources.mobilePoster) && (
        <picture>
          {sources.mobilePoster && <source media="(max-width: 767px)" srcSet={sources.mobilePoster} />}
          <img src={sources.poster || sources.mobilePoster} alt="" className="closing-portal-poster" />
        </picture>
      )}
      {active && (
        <video
          ref={attachVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={active.poster || undefined}
          className="closing-portal-video"
        >
          {active.webm && <source src={active.webm} type="video/webm" />}
          {active.mp4 && <source src={active.mp4} type="video/mp4" />}
        </video>
      )}
    </div>
  )
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
    storyLogoById[story.id],
    story.logoUrl,
    '/logo-gg.png',
  ])
  return thumbnail || '/logo-gg.png'
}

function getHomepageBannerMedia(story: CaseStudy) {
  const thumbnail = getCaseStudyThumbnail(story)
  const [desktopGallery, mobileGallery] = story.homepageGalleryImages ?? []
  return {
    thumbnail,
    desktop: story.homepageBannerImageUrl || desktopGallery || story.backgroundImageUrl || story.backgroundImages?.[0] || thumbnail,
    mobile: story.homepageBannerMobileUrl || mobileGallery || story.homepageBannerImageUrl || desktopGallery || story.backgroundImages?.[1] || story.backgroundImageUrl || thumbnail,
    desktopPosition: normalizeObjectPosition(story.homepageBannerPosition),
    mobilePosition: normalizeObjectPosition(story.homepageBannerMobilePosition, normalizeObjectPosition(story.homepageBannerPosition)),
  }
}

function cyclicDistance(index: number, activeIndex: number, length: number) {
  const direct = Math.abs(index - activeIndex)
  return Math.min(direct, Math.max(0, length - direct))
}

function getCaseStudyGallery(story: CaseStudy) {
  return uniqueImageUrls([
    getCaseStudyThumbnail(story),
    ...(story.homepageGalleryImages ?? []),
    ...(story.backgroundImages ?? []),
    story.backgroundImageUrl,
    story.screenBackground?.imageUrl,
    storyLogoById[story.id],
    story.logoUrl,
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
  const reducedMotion = useReducedMotionPreference()
  const href = resolveStoryHref(lang, story.id, story.id)
  const theme = getStoryPreviewTheme(story)
  const aboutLabel = lang === 'vi' ? 'Xem câu chuyện' : 'About this one'

  useEffect(() => {
    setActiveImage(0)
    if (images.length < 2 || reducedMotion) return
    const interval = window.setInterval(() => {
      setActiveImage((index) => (index + 1) % images.length)
    }, 8000)
    return () => window.clearInterval(interval)
  }, [story.id, images.length, reducedMotion])

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
            src={cldWidth(imageUrl, 420)}
            srcSet={cldSrcSet(imageUrl, [420, 840])}
            sizes="380px"
            decoding="async"
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
          className="mt-auto inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[#3d1226]/12 bg-white/70 px-3.5 py-2 text-sm font-extrabold text-[#3d1226] shadow-[0_10px_24px_rgba(43,23,33,0.1)] transition hover:-translate-y-0.5 hover:bg-white"
        >
          {aboutLabel}
          <ArrowUpRight size={15} strokeWidth={2.5} aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

function CaseStudyShowcase({ stories, lang, block, openingBaseMs = 0 }: { stories: CaseStudy[]; lang: BrandLang; block?: CmsBlock | null; openingBaseMs?: number }) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const showcaseStories = useMemo(() => getHomepageCaseStudies(stories), [stories])
  const [bannerIndex, setBannerIndex] = useState(0)
  const [previewStory, setPreviewStory] = useState<StoryPreviewState | null>(null)
  const [canHover, setCanHover] = useState(false)
  const [manuallyPaused, setManuallyPaused] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const reducedMotion = useReducedMotionPreference()
  const hoverOpenTimer = useRef<number | null>(null)
  const hoverCloseTimer = useRef<number | null>(null)
  const popupHoverRef = useRef(false)
  const pauseUntilRef = useRef(0)

  useEffect(() => {
    setCanHover(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false)
  }, [])

  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  useEffect(() => {
    if (showcaseStories.length < 2 || reducedMotion || manuallyPaused || interacting || !pageVisible) return
    const interval = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return
      setBannerIndex((index) => (index + 1) % showcaseStories.length)
    }, 8000)
    return () => window.clearInterval(interval)
  }, [interacting, manuallyPaused, pageVisible, reducedMotion, showcaseStories.length])

  useEffect(() => {
    const rail = railRef.current
    const activeId = showcaseStories[bannerIndex % Math.max(1, showcaseStories.length)]?.id
    if (!rail || !activeId) return
    const activeCard = rail.querySelector<HTMLElement>(`[data-story-id="${CSS.escape(activeId)}"]`)
    if (!activeCard) return
    const left = activeCard.offsetLeft - (rail.clientWidth - activeCard.offsetWidth) / 2
    rail.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [bannerIndex, reducedMotion, showcaseStories])

  if (!showcaseStories.length) return null

  const activeBannerIndex = bannerIndex % showcaseStories.length
  const activeStory = showcaseStories[activeBannerIndex] ?? showcaseStories[0]
  const activeStoryHref = resolveStoryHref(lang, activeStory.id, activeStory.id)
  const activeStats = getFeaturedStats(activeStory)
  const allStoriesHref = localizedPath(lang, '/the-one')
  const featuredContextLabel = block?.subtitle?.trim() || (lang === 'vi' ? 'Khach hang dang dong hanh cung The One' : 'Clients growing with The One')
  const allStoriesLabel = lang === 'vi' ? 'Xem tất cả stories' : 'View all stories'

  function moveRail(direction: -1 | 1) {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: direction * Math.max(280, rail.clientWidth * 0.82), behavior: reducedMotion ? 'auto' : 'smooth' })
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
    // 400ms grace so the pointer can cross the gap between card and popup (Round 7 A2.3).
    hoverCloseTimer.current = window.setTimeout(() => {
      if (popupHoverRef.current) {
        // Safety net: a close arrived while the pointer is inside the popup — re-check later.
        hoverCloseTimer.current = window.setTimeout(() => {
          if (!popupHoverRef.current) setPreviewStory(null)
        }, 3000)
        return
      }
      setPreviewStory(null)
    }, 400)
  }

  function pauseAuto(ms = 5000) {
    pauseUntilRef.current = Date.now() + ms
  }

  return (
    <section
      id="featured-cases"
      className="home-section-pad home-section-pad--featured relative overflow-hidden px-5 lg:px-10"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => {
        setInteracting(false)
        closePreviewSoon()
      }}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false)
      }}
      onPointerDown={() => pauseAuto(12000)}
    >
      {/* Round 7 A2.1: warm bridge from the video's bottom tone into the shared wave background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[180px]"
        style={{ background: 'linear-gradient(to bottom, rgba(255,182,170,0.55), transparent)' }}
      />
      <div className="relative mx-auto max-w-6xl">
        {/* Round 12 A2.2: the banner + thumbnail strip join the hero opening cascade —
            banner +200ms after the CTA, then tiles left→right (80ms/tile). useScrollReveal
            strips --rd outside the opening window (reload mid-page, scroll back). */}
        <div className="relative" data-reveal="scale" data-reveal-open style={{ '--rd': `${openingBaseMs}ms` } as CSSProperties}>
          {/* Round 8 A2.1: ambient glow — a blurred copy of the active slide bleeds its colors into the wave */}
          <div aria-hidden="true" className="pointer-events-none absolute -inset-2 md:-inset-4">
            <img
              key={`${activeStory.id}-glow`}
              src={cldWidth(getHomepageBannerMedia(activeStory).desktop, 640)}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-30 blur-[32px] saturate-[1.25] transition-opacity duration-700"
            />
          </div>
          <a
          href={activeStoryHref}
          onMouseEnter={() => setPreviewStory(null)}
          onFocus={() => setPreviewStory(null)}
          className="featured-banner group relative block w-full overflow-hidden text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          aria-label={`Open ${activeStory.brandName} story`}
        >
          {/* Feathered media layer: images + scrim fade at all four edges (no hard card border, Round 8 A2.1) */}
          <div className="featured-banner-media pointer-events-none absolute inset-0">
            {showcaseStories.map((story, index) => {
              if (cyclicDistance(index, activeBannerIndex, showcaseStories.length) > 1) return null
              const media = getHomepageBannerMedia(story)
              return (
                <picture key={`${story.id}-banner-${index}`}>
                  <source
                    media="(max-width: 767px)"
                    srcSet={cldSrcSet(media.mobile, [640, 960, 1280])}
                    sizes="100vw"
                  />
                  <img
                    src={cldWidth(media.desktop, 1600)}
                    srcSet={cldSrcSet(media.desktop, [1280, 1600, 2400])}
                    sizes="(min-width: 1280px) 1152px, 96vw"
                    alt={index === activeBannerIndex ? `${story.brandName} case study` : ''}
                    aria-hidden={index === activeBannerIndex ? undefined : true}
                    loading="lazy"
                    decoding="async"
                    className={`featured-banner-role-image absolute inset-0 h-full w-full transition duration-700 group-hover:scale-[1.025] ${
                      isLogoLikeImage(media.desktop) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffd8e8)] object-contain p-12 md:p-20' : 'object-cover'
                    } ${index === activeBannerIndex ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      '--featured-banner-position': media.desktopPosition,
                      '--featured-banner-position-mobile': media.mobilePosition,
                    } as CSSProperties}
                  />
                </picture>
              )
            })}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" aria-hidden="true" />
          </div>
          <div className="featured-banner-copy pointer-events-none absolute inset-x-0 bottom-0 text-white">
            <p className="featured-banner-context mb-2 inline-flex rounded-full border border-white/20 bg-white/14 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/78 backdrop-blur-md">{featuredContextLabel}</p>
            <p className="featured-banner-kicker font-extrabold uppercase text-white/68">Featured case</p>
            <h2 className="featured-banner-title mt-2 max-w-2xl font-extrabold leading-tight">{activeStory.brandName}</h2>
            <p className="featured-banner-caption mt-2 max-w-2xl font-semibold leading-relaxed text-white/76">{activeStory.caption || activeStory.shortDescription}</p>
            {activeStats.length > 0 && (
              <div className="featured-banner-stats mt-4 flex flex-wrap gap-2">
                {activeStats.map((stat) => (
                  <span key={`${activeStory.id}-banner-stat-${stat.value}-${stat.label}`} className="featured-banner-stat rounded-full border border-white/24 bg-white/18 px-3 py-1.5 text-xs font-black text-white shadow-[0_10px_26px_rgba(0,0,0,0.16)] backdrop-blur-md">
                    {stat.value}{stat.label ? ` ${stat.label}` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        </a>
        </div>

        <div className="relative mt-3">
          {showcaseStories.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveRail(-1)}
                className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Previous case studies"
              >
                <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => moveRail(1)}
                className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Next case studies"
              >
                <ChevronRight size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </>
          )}
          <div ref={railRef} className="case-study-rail flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2" onPointerDown={() => pauseAuto(12000)} onTouchStart={() => pauseAuto(12000)}>
            {showcaseStories.map((story, index) => (
              <a
                key={`${story.id}-rail`}
                href={resolveStoryHref(lang, story.id, story.id)}
                data-story-id={story.id}
                data-reveal="tile-in"
                data-tile-direction={index % 2 ? 'right' : 'bottom'}
                data-reveal-open
                style={{ '--ri': index, '--rd': `${openingBaseMs + 320}ms` } as CSSProperties}
                onMouseEnter={(event) => {
                  setBannerIndex(index)
                  showPreview(story, event.currentTarget)
                }}
                onFocus={(event) => {
                  setBannerIndex(index)
                  showPreview(story, event.currentTarget)
                }}
                onMouseLeave={closePreviewSoon}
                onClick={() => pauseAuto(12000)}
                className={[
                  // Round 7 A2.2: two-tier card — clean 16:9 image on top, glass caption bar below.
                  'group relative shrink-0 basis-[42vw] snap-start rounded-[18px] p-[2px] text-left outline-none transition duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:basis-[calc((100%_-_8px)/2.25)] md:basis-[calc((100%_-_16px)/3)] lg:basis-[calc((100%_-_24px)/4)]',
                  index === activeBannerIndex ? 'bg-gradient-to-r from-primary via-tertiary to-secondary' : 'bg-transparent',
                ].join(' ')}
                aria-label={`Open ${story.brandName} story`}
              >
                <span className="flex h-full flex-col overflow-hidden rounded-[16px] shadow-[0_14px_40px_rgba(219,39,119,0.14)]">
                  <span className="relative block aspect-video w-full overflow-hidden bg-[#180b11]">
                    {(() => {
                      const thumbnail = getCaseStudyThumbnail(story)
                      return (
                        <img
                          src={cldWidth(thumbnail, 640)}
                          srcSet={cldSrcSet(thumbnail, [640, 960])}
                          sizes="(min-width: 1024px) 25vw, 42vw"
                          alt=""
                          aria-hidden="true"
                          className={`absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105 ${
                            isLogoLikeImage(thumbnail) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffd8e8)] object-contain p-7' : 'object-cover'
                          }`}
                        />
                      )
                    })()}
                  </span>
                  <span className="glass-panel glass-panel--strong flex h-[58px] flex-col justify-center rounded-none border-x-0 border-b-0 px-3.5 py-2">
                    <h3 className="line-clamp-1 text-[14px] font-extrabold leading-tight text-[#3d1226] md:text-[15px]">{story.brandName}</h3>
                    <p className="line-clamp-1 text-xs font-semibold leading-snug text-on-surface-variant">{story.headline}</p>
                  </span>
                </span>
              </a>
            ))}
            <a
              href={allStoriesHref}
              data-reveal="tile-in"
              data-tile-direction="right"
              data-reveal-open
              style={{ '--ri': showcaseStories.length, '--rd': `${openingBaseMs + 320}ms` } as CSSProperties}
              className="group featured-ghost-card glass-panel glass-panel--strong relative flex shrink-0 basis-[42vw] snap-start flex-col items-center justify-center gap-3 rounded-[18px] p-5 text-center outline-none transition duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:basis-[calc((100%_-_8px)/2.25)] md:basis-[calc((100%_-_16px)/3)] lg:basis-[calc((100%_-_24px)/4)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] transition-transform group-hover:translate-x-1">
                <ArrowUpRight size={19} strokeWidth={2.7} aria-hidden="true" />
              </span>
              <span className="text-sm font-black text-[#3d1226]">{allStoriesLabel}</span>
            </a>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            {showcaseStories.length > 1 && (
              <button
                type="button"
                onClick={() => setManuallyPaused((paused) => !paused)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-black text-[#3d1226] shadow-sm transition hover:border-primary/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-pressed={manuallyPaused}
                aria-label={manuallyPaused ? 'Play featured case studies' : 'Pause featured case studies'}
              >
                {manuallyPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
                <span>{manuallyPaused ? 'Play' : 'Pause'}</span>
              </button>
            )}
            <a href={allStoriesHref} className="inline-flex items-center gap-1.5 text-sm font-black text-primary transition hover:text-primary/70">
              {allStoriesLabel}
              <ArrowUpRight size={15} strokeWidth={2.6} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {previewStory && canHover && (
        // Card and popup share one hover region: entering the popup cancels the
        // pending close, so it never flickers away under the pointer (Round 7 A2.3).
        <div
          className="pointer-events-none fixed z-[80] hidden md:block"
          style={previewStory.style}
          onMouseEnter={() => {
            popupHoverRef.current = true
            clearPreviewTimers()
          }}
          onMouseLeave={() => {
            popupHoverRef.current = false
            closePreviewSoon()
          }}
        >
          <CaseStudyPreviewPopover story={previewStory.story} lang={lang} />
        </div>
      )}
    </section>
  )
}

const threadAvatarPalette = [
  'bg-pink-200 text-pink-900',
  'bg-amber-200 text-amber-900',
  'bg-rose-200 text-rose-900',
  'bg-orange-200 text-orange-900',
  'bg-fuchsia-200 text-fuchsia-900',
  'bg-red-200 text-red-900',
]

function ThreadAvatar({ item, index }: { item: CmsBlockItem; index: number }) {
  if (item.avatarUrl?.trim()) {
    return <img src={item.avatarUrl} alt="" aria-hidden="true" className="relative z-10 h-10 w-10 rounded-full border border-white/80 bg-white object-cover shadow-sm" />
  }
  const source = item.handle?.trim() || item.roleLabel?.trim() || item.title || '?'
  return (
    <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 text-[15px] font-black shadow-sm ${threadAvatarPalette[index % threadAvatarPalette.length]}`}>
      {source.charAt(0).toUpperCase()}
    </span>
  )
}

// Round 7 A3 / Round 8 A3.1: the red-flags zone is a simulated Threads post — The One
// founders open a topic and the replies are the familiar agency complaints. Desktop:
// sticky message column (heading + punchline + CTA) left, feed right; mobile: one column.
function RedFlagsSection({ block }: { block?: ReturnType<typeof getCmsBlock> }) {
  const [showAllReplies, setShowAllReplies] = useState(false)
  const items = (block?.items ?? []).filter((item) => item.published !== false && (item.body?.trim() || item.title.trim()))
  if (!block || (!block.heading.trim() && !block.body.trim() && !items.length)) return null

  const postHandle = block.postHandle?.trim() || 'founders.theone'
  const postTopic = block.postTopic?.trim() || 'Agency life'
  const postText = block.postText?.trim() || 'Tell us the red flags you ran into with your last agency 👇'
  const punchline = block.body?.trim() || "You don't need another agency. You need The One."
  const punchlineIndex = items.length + 2
  const mobileVisibleCount = 3
  const hasHiddenMobileReplies = items.length > mobileVisibleCount

  return (
    <section className="home-section-pad px-5 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-28">
          <p data-reveal className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1226]/55">Red flags</p>
          <h2 data-reveal className="mt-3 font-serif text-[38px] font-normal leading-[0.98] text-[#3d1226] md:text-[52px]">
            {block.heading || 'Sounds familiar?'}
          </h2>
          {/* Desktop only: punchline + CTA live here; on mobile they close the feed below. */}
          <div className="hidden lg:block">
            <p data-reveal className="mt-6 max-w-sm bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[26px] font-black leading-tight text-transparent xl:text-[32px]">
              {punchline}
            </p>
            <button
              type="button"
              onClick={openBookingModal}
              className="btn-shine cta-idle mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] hover:opacity-95"
            >
              {block.ctaLabel?.trim() || 'Schedule Our Date'}
            </button>
          </div>
        </div>

        <div className="glass-panel quiet-zone relative w-full p-5 md:p-6">
          <div className="thread-line" aria-hidden="true" style={{ left: 39, top: 64 }} />

          <article data-reveal="tile-in" data-tile-direction="bottom" style={{ '--ri': 0 } as CSSProperties} className="relative grid grid-cols-[40px_1fr] gap-3">
            <img src="/avatars/logo-gg.png" alt="" aria-hidden="true" className="relative z-10 h-10 w-10 rounded-full border border-white/80 bg-white object-contain p-1 shadow-sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-extrabold text-[#3d1226]">{postHandle}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary">{postTopic}</span>
                <span className="text-xs font-semibold text-[#3d1226]/45">17h</span>
              </div>
              <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-[#3d1226]">{postText}</p>
              <div className="mt-3 flex items-center gap-5 text-[#3d1226]/55" aria-hidden="true">
                <span className="flex items-center gap-1.5 text-xs font-bold"><Heart size={17} strokeWidth={2.2} /> 512</span>
                <span className="flex items-center gap-1.5 text-xs font-bold"><MessageCircle size={17} strokeWidth={2.2} /> {items.length}</span>
                <Repeat2 size={17} strokeWidth={2.2} />
                <Send size={16} strokeWidth={2.2} />
              </div>
            </div>
          </article>

          <div data-reveal="tile-in" data-tile-direction="bottom" style={{ '--ri': 1 } as CSSProperties} className="relative mt-5 grid grid-cols-[40px_1fr] gap-3" aria-hidden="true">
            <span />
            <span className="flex h-6 items-center gap-1">
              <span className="thread-typing-dot" />
              <span className="thread-typing-dot" />
              <span className="thread-typing-dot" />
            </span>
          </div>

          {items.map((item, index) => (
            <article
              key={`${item.handle || item.title}-${index}`}
              data-testid="red-flag-reply"
              data-reveal="tile-in"
              data-tile-direction="bottom"
              style={{ '--ri': index + 2 } as CSSProperties}
              className={`relative mt-5 grid-cols-[40px_1fr] gap-3 ${
                index >= mobileVisibleCount && !showAllReplies ? 'hidden lg:grid' : 'grid'
              }`}
            >
              <ThreadAvatar item={item} index={index} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-extrabold text-[#3d1226]">{item.handle?.trim() || item.title}</span>
                  {item.roleLabel?.trim() && <span className="text-xs font-semibold text-[#3d1226]/50">· {item.roleLabel}</span>}
                  <span className="text-xs font-semibold text-[#3d1226]/45">{Math.max(1, 16 - index * 2)}h</span>
                </div>
                <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-[#3d1226]/90">{item.body?.trim() || item.title}</p>
                {item.likes?.trim() && (
                  <span className="mt-2 flex w-fit items-center gap-1.5 text-xs font-bold text-[#3d1226]/55" aria-hidden="true">
                    <Heart size={15} strokeWidth={2.2} /> {item.likes}
                  </span>
                )}
              </div>
            </article>
          ))}

          {hasHiddenMobileReplies && !showAllReplies && (
            <button
              type="button"
              onClick={() => setShowAllReplies(true)}
              className="relative mt-4 ml-[52px] inline-flex items-center gap-1 text-xs font-extrabold text-primary transition-colors hover:text-primary/70 lg:hidden"
            >
              Show {items.length - mobileVisibleCount} more replies ▾
            </button>
          )}

          {/* Mobile only: the punchline closes the feed (desktop shows it in the left column). */}
          <article data-reveal="tile-in" data-tile-direction="bottom" style={{ '--ri': punchlineIndex } as CSSProperties} className="relative mt-6 grid grid-cols-[40px_1fr] gap-3 lg:hidden">
            <img src="/avatars/logo-gg.png" alt="" aria-hidden="true" className="relative z-10 h-10 w-10 rounded-full border border-white/80 bg-white object-contain p-1 shadow-sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-extrabold text-[#3d1226]">{postHandle}</span>
                <span className="text-xs font-semibold text-[#3d1226]/45">now</span>
              </div>
              <p className="mt-2 bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[22px] font-black leading-tight text-transparent md:text-[30px]">
                {punchline}
              </p>
              <button
                type="button"
                onClick={openBookingModal}
                className="btn-shine cta-idle mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] hover:opacity-95"
              >
                {block.ctaLabel?.trim() || 'Schedule Our Date'}
              </button>
            </div>
          </article>
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

function getPersonInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '01'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

function PeopleSection({ block, showClosingLines = true }: { block?: ReturnType<typeof getCmsBlock>; showClosingLines?: boolean }) {
  const members = useMemo(() => (block?.items ?? []).filter((item) => item.published !== false).slice(0, 6), [block?.items])
  const railRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [previewMember, setPreviewMember] = useState<{ member: CmsBlockItem; style: CSSProperties } | null>(null)
  const [canHover, setCanHover] = useState(false)
  const [manuallyPaused, setManuallyPaused] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const reducedMotion = useReducedMotionPreference()
  const hoverOpenTimer = useRef<number | null>(null)
  const hoverCloseTimer = useRef<number | null>(null)
  const popupHoverRef = useRef(false)
  const pauseUntilRef = useRef(0)
  const hasPeople = Boolean(block && members.length)
  const autoSlideSeconds = Math.max(8, Number.parseFloat(block?.autoSlideSeconds ?? '8') || 8)

  useEffect(() => {
    setCanHover(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false)
  }, [])

  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  useEffect(() => {
    if (!hasPeople || members.length < 2 || reducedMotion || manuallyPaused || interacting || !pageVisible) return
    const interval = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return
      setActiveIndex((index) => (index + 1) % members.length)
    }, autoSlideSeconds * 1000)
    return () => window.clearInterval(interval)
  }, [autoSlideSeconds, hasPeople, interacting, manuallyPaused, members.length, pageVisible, reducedMotion])

  useEffect(() => {
    const rail = railRef.current
    const member = members[activeIndex % Math.max(1, members.length)]
    if (!rail || !member) return
    const activeCard = rail.querySelector<HTMLElement>(`[data-person-index="${activeIndex % members.length}"]`)
    if (!activeCard) return
    const left = activeCard.offsetLeft - (rail.clientWidth - activeCard.offsetWidth) / 2
    rail.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [activeIndex, members, reducedMotion])

  if (!block || !members.length) return null

  const closingLine1 = block.closingLine1 || 'We quit our 9-5 and started our own business.'
  const closingLine2 = block.closingLine2 || "Isn't it your turn now?"
  const activeMember = members[activeIndex % members.length] ?? members[0]
  const activeRoles = splitPeopleRoles(activeMember.label)
  const activeBanner = activeMember.bannerImageUrl || getPeopleAvatarImages(activeMember)[0] || '/logo-gg.png'
  const activeMobileBanner = activeMember.bannerImageMobileUrl || activeMember.bannerImageUrl || getPeopleAvatarImages(activeMember)[0] || activeBanner
  const activeBannerIsPlaceholder = isLogoLikeImage(activeBanner)

  function pauseAuto(ms = 5000) {
    pauseUntilRef.current = Date.now() + ms
  }

  function moveRail(direction: -1 | 1) {
    const rail = railRef.current
    if (!rail) return
    pauseAuto()
    rail.scrollBy({ left: direction * Math.max(220, rail.clientWidth * 0.8), behavior: reducedMotion ? 'auto' : 'smooth' })
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
    hoverCloseTimer.current = window.setTimeout(() => {
      if (popupHoverRef.current) {
        hoverCloseTimer.current = window.setTimeout(() => {
          if (!popupHoverRef.current) setPreviewMember(null)
        }, 3000)
        return
      }
      setPreviewMember(null)
    }, 400)
  }

  return (
    <section
      className="home-section-pad px-5 lg:px-10"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => {
        setInteracting(false)
        closeMemberPreviewSoon()
      }}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false)
      }}
      onPointerDown={() => pauseAuto(12000)}
    >
      <div className="mx-auto max-w-6xl">
        {/* Round 12 A5: the CMS body ("Teamwork makes the dream work.") renders as an editorial pull-quote */}
        <SectionHeader
          title={block.heading || 'The One People'}
          quote={block.body?.trim().replace(/^["“‘']+/, '').replace(/["”’']+$/, '')}
          align="left"
          perWord
        />
        <div data-reveal="scale" className="people-feature-banner group relative aspect-[16/8] overflow-hidden rounded-[24px] bg-[#190b12] text-white shadow-[0_24px_70px_rgba(80,20,50,0.16)] ring-1 ring-white/70 md:aspect-[16/6]">
          {activeBannerIsPlaceholder ? (
            <div className="people-typographic-banner absolute inset-0 flex items-center justify-center px-8 text-center" aria-hidden="true">
              <span>{getPersonInitials(activeMember.title)}</span>
            </div>
          ) : (
            <picture>
              <source media="(max-width: 767px)" srcSet={cldSrcSet(activeMobileBanner, [640, 960, 1280])} sizes="100vw" />
              <img
                src={cldWidth(activeBanner, 1280)}
                srcSet={cldSrcSet(activeBanner, [1280, 2400])}
                sizes="(min-width: 1280px) 1152px, 96vw"
                decoding="async"
                alt={`${activeMember.title} banner`}
                className="people-banner-image absolute inset-0 h-full w-full object-cover transition duration-700"
                style={{
                  '--people-banner-position': normalizeObjectPosition(activeMember.bannerImagePosition),
                  '--people-banner-position-mobile': normalizeObjectPosition(activeMember.bannerImageMobilePosition, normalizeObjectPosition(activeMember.bannerImagePosition)),
                } as CSSProperties}
              />
            </picture>
          )}
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
                className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Previous people"
              >
                <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => moveRail(1)}
                className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Next people"
              >
                <ChevronRight size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </>
          )}
          <div ref={railRef} className="case-study-rail flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2" onPointerDown={() => pauseAuto(12000)} onTouchStart={() => pauseAuto(12000)}>
          {members.map((member, index) => {
            const avatarImages = getPeopleAvatarImages(member)
            const thumbnail = member.thumbnailUrl || avatarImages[0] || '/logo-gg.png'
            const active = index === activeIndex % members.length
            return (
              <button
                key={`${member.title}-${index}`}
                data-person-index={index}
                data-reveal="people-card"
                type="button"
                onMouseEnter={(event) => showMemberPreview(member, event.currentTarget)}
                onMouseLeave={closeMemberPreviewSoon}
                onFocus={(event) => showMemberPreview(member, event.currentTarget)}
                onClick={() => {
                  pauseAuto(12000)
                  setActiveIndex(index)
                }}
                style={{ '--ri': index } as CSSProperties}
                className={[
                  'group relative aspect-[16/10] shrink-0 basis-[42vw] snap-start overflow-hidden rounded-[16px] bg-[#180b11] text-left shadow-[0_14px_40px_rgba(80,20,50,0.13)] outline-none ring-1 transition duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:basis-[calc((100%_-_8px)/2.25)] md:basis-[calc((100%_-_16px)/3)] lg:basis-[calc((100%_-_24px)/4)]',
                  active ? 'ring-primary/80' : 'ring-white/70',
                ].join(' ')}
              >
                {isLogoLikeImage(thumbnail) ? (
                  <span className="people-typographic-card absolute inset-0 flex items-center justify-center px-4 text-center transition duration-500 group-hover:scale-[1.04]" aria-hidden="true">
                    <span>{getPersonInitials(member.title)}</span>
                  </span>
                ) : (
                  <img
                    src={cldWidth(thumbnail, 320)}
                    srcSet={cldSrcSet(thumbnail, [320, 640])}
                    sizes="(min-width: 1024px) 25vw, 42vw"
                    loading="lazy"
                    decoding="async"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                  />
                )}
                <div className={`absolute inset-0 bg-gradient-to-t ${active ? 'from-black/82 via-black/18 to-transparent' : 'from-white/88 via-white/46 to-white/12 group-hover:from-black/76 group-hover:via-black/12 group-hover:to-transparent'}`} aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className={`line-clamp-1 text-[17px] font-extrabold leading-tight ${active ? 'text-white' : 'text-on-surface group-hover:text-white'}`}>{member.title}</h3>
                </div>
              </button>
            )
          })}
          </div>
          {members.length > 1 && (
            <div className="mt-2 flex justify-start">
              <button
                type="button"
                onClick={() => setManuallyPaused((paused) => !paused)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-black text-[#3d1226] shadow-sm transition hover:border-primary/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-pressed={manuallyPaused}
                aria-label={manuallyPaused ? 'Play people carousel' : 'Pause people carousel'}
              >
                {manuallyPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
                <span>{manuallyPaused ? 'Play' : 'Pause'}</span>
              </button>
            </div>
          )}
        </div>
        {previewMember && canHover && (
          <div
            className="pointer-events-none fixed z-[80] hidden md:block"
            style={previewMember.style}
            onMouseEnter={() => {
              popupHoverRef.current = true
              clearPreviewTimers()
            }}
            onMouseLeave={() => {
              popupHoverRef.current = false
              closeMemberPreviewSoon()
            }}
          >
            {(() => {
              const member = previewMember.member
              const image = member.bannerImageUrl || member.thumbnailUrl || getPeopleAvatarImages(member)[0] || '/logo-gg.png'
              const roles = splitPeopleRoles(member.label)
              return (
                <article className="pointer-events-auto flex max-h-[min(520px,82vh)] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white/[0.92] text-on-surface shadow-[0_28px_90px_rgba(219,39,119,0.28)] ring-1 ring-white/60 backdrop-blur-xl">
                  <div className="m-3 aspect-video max-h-[180px] shrink-0 overflow-hidden rounded-[18px] bg-surface-container-low">
                    <img src={cldWidth(image, 420)} srcSet={cldSrcSet(image, [420, 840])} sizes="380px" decoding="async" alt={`${member.title} preview`} className={`h-full w-full ${isLogoLikeImage(image) ? 'object-contain p-10' : 'object-cover'}`} />
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
        {showClosingLines && (
          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p data-reveal="soft" className="home-people-closing-one text-[24px] italic leading-tight text-on-surface/85 md:text-[28px]">{closingLine1}</p>
            <p data-reveal="soft" style={{ '--ri': 1 } as CSSProperties} className="home-people-closing-two mt-3 bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[28px] font-semibold leading-tight text-transparent md:text-[44px]">
              {closingLine2}
            </p>
          </div>
        )}
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
  void stories
  const faqTitle = block.heading?.trim() || 'Frequently Asked Questions'
  const faqSubtitle = block.subtitle?.trim() || block.body?.trim()
  const closingCharacterCount = countStaggerCharacters(faqTitle)
  const closingFollowDelay = Math.max(360, closingCharacterCount * 18 + 220)
  const portalSources = getClosingPortalSources(block)
  const hasPortalVideo = hasVideoSource(portalSources)
  const line1 = block.closingLine1?.trim() || 'We quit our 9-5 and started our own business.'
  const line2 = block.closingLine2?.trim() || "Isn't it your turn now?"
  const prefooterLine = block.ctaSubtext?.trim() || 'See you on our first date?'
  const ctaLabel = resolvePrimaryBookingCtaLabel(block.ctaLabel)

  // Round 7 A5: no solid gradient background and no logo marquee — glass items float
  // directly on the shared aurora + wave background.
  return (
    <>
      <section className="closing-section home-section-pad px-5 lg:px-10">
        <div className="closing-content quiet-zone quiet-zone--faq relative mx-auto w-full max-w-[880px]" data-reveal="closing-content">
          {/* Round 8 A5.2: left-aligned, lined up with the other zone headings */}
          <div className="mb-7 text-left">
            <h2 className="text-[30px] font-black leading-tight text-[#3d1226] md:text-[42px]">
              <StaggeredText text={faqTitle} className="inline" charClassName="closing-char" nowrap={false} />
            </h2>
            <div className="home-gradient-underline mt-3" aria-hidden="true" />
            {faqSubtitle && (
              <p className="closing-follow mt-4 text-[15px] font-bold leading-relaxed text-[#3d1226]/75 md:text-[18px]" style={{ '--closing-delay': `${closingFollowDelay}ms` } as CSSProperties}>
                {faqSubtitle}
              </p>
            )}
          </div>
          {faqItems.length > 0 && (
            <div className="closing-faq grid gap-3 text-left">
              {faqItems.map((item, index) => {
                const open = openFaqIndex === index
                const buttonId = `home-faq-button-${index}`
                const panelId = `home-faq-panel-${index}`
                return (
                  <div
                    key={`${item.question}-${index}`}
                    className={`closing-faq-item glass-panel overflow-hidden !rounded-2xl text-[#3d1226] ${open ? 'glass-panel--strong' : ''}`}
                    style={{ '--ri': index, '--closing-delay': `${closingFollowDelay + 140 + index * 80}ms` } as CSSProperties}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-[15px] font-bold leading-snug md:text-[16px]"
                      aria-expanded={open}
                      aria-controls={panelId}
                      id={buttonId}
                    >
                      <span>{item.question}</span>
                      <span className={`closing-faq-plus flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3d1226]/10 text-xl leading-none transition-transform ${open ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      aria-hidden={!open}
                      className={`closing-faq-answer grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm font-semibold leading-relaxed text-[#3d1226]/75">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
      {hasPortalVideo && (
        <section className="closing-portal-section" data-reveal="closing-portal">
          <ClosingPortalVideo sources={portalSources} />
          <div className="closing-portal-scrim" aria-hidden="true" />
          <div className="closing-portal-copy">
            <p className="closing-portal-line-one">{line1}</p>
            <h2 className="closing-portal-line-two" data-reveal="words">
              <RevealWords text={line2} />
            </h2>
          </div>
          <div className="closing-portal-cta" data-reveal="soft" style={{ '--rd': '520ms' } as CSSProperties}>
            <p>{prefooterLine}</p>
            <button
              type="button"
              onClick={() => openBookingModal('closing-video')}
              className="btn-shine cta-idle inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-8 py-4 text-[16px] font-extrabold text-white shadow-[0_18px_44px_rgba(219,39,119,0.28)] hover:opacity-95 md:px-11 md:py-[18px] md:text-[18px]"
            >
              {ctaLabel}
            </button>
          </div>
        </section>
      )}
    </>
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
  const [heroReady, setHeroReady] = useState(false)
  const [heroCueHidden, setHeroCueHidden] = useState(false)
  const reducedMotion = useReducedMotionPreference()

  const c = compactHomeByLang[lang]
  const homeBackground = mergeHomepageBackground(siteSettings?.homepageBackground)
  const flowWaveActive = homeBackground.mode === 'flow-wave'
  const homeMeta = getLocalizedPageMeta(cmsPage, lang, homeMetaByLang[lang])
  const heroBlock = getLocalizedCmsBlock(cmsPage, 'hero', lang)
  const showcaseBlock = getLocalizedCmsBlock(cmsPage, 'what-is', lang)
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
    mobilePoster: heroBlock?.backgroundVideoMobilePoster?.trim() || heroBlock?.backgroundVideoPoster?.trim() || undefined,
  }
  const heroHasVideo = Boolean(heroVideoSources.mp4 || heroVideoSources.webm)
  const heroTextAlign = heroBlock?.heroTextAlign === 'center' ? 'center' : 'left'
  const heroAlignLeft = heroTextAlign === 'left'
  const heroHasOwnBackground = !heroHasVideo && (!flowWaveActive || Boolean(heroBlock?.backgroundImageUrl?.trim() || heroBlock?.backgroundImageMobileUrl?.trim()))
  const rawHeroTextMode = heroBlock?.textColor ?? 'light'
  // "light" was chosen for opaque hero backgrounds (gradient/video); on the transparent aurora canvas it is unreadable.
  const heroTextMode = !heroHasOwnBackground && !heroHasVideo && rawHeroTextMode === 'light' ? 'dark' : rawHeroTextMode
  const showHeroDivider = heroBlock?.dividerShow !== false
  const heroWordCount = countStaggerWords(heroLineOne)
  const heroDelays = getHeroAnimationDelays(heroWordCount, showHeroDivider)
  const heroStatChips = (heroBlock?.statChips ?? []).filter((chip) => chip.value.trim() || chip.label.trim()).slice(0, 3)
  const showHeroStatChips = heroBlock?.showStatChips !== false && heroStatChips.length > 0
  const closingPortalSources = getClosingPortalSources(closingBlock)
  const closingHasPortal = hasVideoSource(closingPortalSources)
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
    if (reducedMotion) {
      setHeroReady(true)
      return
    }
    whenIntroGone(() => setHeroReady(true))
  }, [reducedMotion])

  useEffect(() => {
    const storageKey = 'gg99:hero-scroll-cue-hidden'
    try {
      setHeroCueHidden(window.sessionStorage.getItem(storageKey) === 'true')
    } catch {
      setHeroCueHidden(false)
    }

    const hide = () => {
      if (window.scrollY <= 24) return
      setHeroCueHidden(true)
      try {
        window.sessionStorage.setItem(storageKey, 'true')
      } catch {
        // sessionStorage can be blocked; hiding in-memory is enough.
      }
      window.removeEventListener('scroll', hide)
    }
    window.addEventListener('scroll', hide, { passive: true })
    return () => window.removeEventListener('scroll', hide)
  }, [])

  function scrollToFeaturedCases() {
    setHeroCueHidden(true)
    try {
      window.sessionStorage.setItem('gg99:hero-scroll-cue-hidden', 'true')
    } catch {
      // no-op
    }
    document.getElementById('featured-cases')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

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
        className={`home-hero relative flex overflow-hidden ${
          heroHasVideo ? 'home-hero--video items-start' : 'home-hero--static items-center'
        } ${heroReady ? 'is-ready' : ''}`}
        style={heroHasOwnBackground ? heroBackgroundStyle(heroBlock) : undefined}
      >
        {!heroHasVideo && <StaticHeroBackground block={heroBlock} />}
        {heroHasVideo && <HeroBackgroundVideo sources={heroVideoSources} />}
        {heroHasVideo && (
          // Round 7 A1.5: soft radial scrim right behind the text cluster only —
          // the sub-line sits on the brightest part of the sky.
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-[6%] h-[46%] w-[min(920px,94vw)] ${heroAlignLeft ? 'left-[26%] -translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`}
            style={{ background: `radial-gradient(closest-side, rgba(40,10,25,${heroAlignLeft ? 0.34 : 0.32}), transparent 100%)` }}
          />
        )}
        {heroHasOwnBackground && (
          <>
            <div className="absolute inset-0 tech-grid opacity-35 pointer-events-none" aria-hidden="true" />
            <div className="noise-overlay" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-surface-container" aria-hidden="true" />
          </>
        )}
        <div
          className={`relative mx-auto flex w-full ${heroAlignLeft ? 'max-w-6xl items-start text-left' : 'max-w-5xl items-center text-center'} flex-col px-5 lg:px-10 ${
            heroHasVideo ? 'home-hero-copy home-hero-copy--video' : 'home-hero-copy home-hero-copy--static justify-center'
          } ${heroAlignLeft ? 'home-hero-copy--left' : ''}`}
        >
          <h1
            className={[
              'hero-word-title home-hero-title-serif text-[clamp(30px,9vw,48px)] font-normal not-italic leading-[0.98] md:text-[clamp(54px,6vw,86px)]',
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
          {/* Round 8 A1: ctaSubtext slot removed from the DOM entirely (field stays dormant in CMS). */}
          {showHeroStatChips && (
            <div
              style={{ '--hero-delay': `${heroDelays.cta + 230}ms` } as CSSProperties}
              className={`home-hero-item home-hero-stat-chips mt-5 flex flex-wrap gap-2 ${heroAlignLeft ? 'justify-start' : 'justify-center'}`}
            >
              {heroStatChips.map((chip) => (
                <span
                  key={`${chip.value}-${chip.label}`}
                  className={`home-hero-stat-chip rounded-full px-3 py-1.5 text-xs font-semibold shadow-[0_10px_26px_rgba(0,0,0,0.1)] backdrop-blur-md ${
                    heroTextMode === 'dark'
                      ? 'border border-[#3d1226]/20 bg-white/75 text-[#3d1226]'
                      : 'border border-white/40 bg-black/20 text-white'
                  }`}
                >
                  {chip.value}{chip.label ? ` ${chip.label}` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={scrollToFeaturedCases}
          className={`hero-scroll-cue ${heroTextMode === 'dark' ? 'is-dark' : ''} ${heroCueHidden ? 'is-hidden' : ''}`}
          aria-label={lang === 'vi' ? 'Cuộn xuống case nổi bật' : 'Scroll to featured cases'}
        >
          <ChevronDown size={26} strokeWidth={1.9} aria-hidden="true" />
        </button>
      </section>

      <CaseStudyShowcase stories={storyTargets} lang={lang} block={showcaseBlock} openingBaseMs={heroDelays.cta + 200} />
      <RedFlagsSection block={redFlagsBlock} />

      <section id="packages" className="home-section-pad px-5 lg:px-10">
        <div className="quiet-zone quiet-zone--strong max-w-6xl mx-auto">
          <SectionHeader
            title={packagesBlock?.heading || 'The One Packages'}
            intro={packagesBlock?.body || (lang === 'vi' ? 'Chọn nhịp tăng trưởng phù hợp với giai đoạn của bạn.' : 'Choose the growth system that fits your stage.')}
            align="center"
            perWord
          />
          <PackageCards items={packageItems} lang={lang} layout={packagesBlock?.layout === 'cards' ? 'cards' : 'horizontal'} />
          {(packagesBlock?.packagesNote?.trim() || packagesBlock?.pricingNote?.trim() || packagesBlock?.disclaimer?.trim()) && (
            // Round 12 A4.2: the single merged note (Round 8 rule) moves onto a dense glass
            // card so it stays legible over the drifting wave blobs.
            <div
              data-reveal="soft"
              className="quiet-zone mx-auto mt-8 flex max-w-[760px] items-start gap-2.5 rounded-[14px] border border-primary/[0.12] bg-white/85 px-6 py-[18px] shadow-[0_12px_34px_rgba(219,39,119,0.08)] backdrop-blur-[12px]"
            >
              <Info size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#B3124B]" aria-hidden="true" />
              <p className="whitespace-pre-line text-left text-[13px] italic leading-[1.6] text-[#6b4a58]">
                {packagesBlock.packagesNote?.trim() ||
                  [packagesBlock.pricingNote?.trim(), packagesBlock.disclaimer?.trim()].filter(Boolean).join('\n')}
              </p>
            </div>
          )}
        </div>
      </section>

      <PeopleSection block={peopleBlock} showClosingLines={!closingHasPortal} />
      <ClosingBanner block={closingBlock} stories={storyTargets} faqItems={closingFaqItems} />
    </BrandLayout>
  )
}
