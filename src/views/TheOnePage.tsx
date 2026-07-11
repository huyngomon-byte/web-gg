'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowUp,
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
  X,
} from 'lucide-react'
import { compactTheOneByLang, organizationSchema, websiteSchema, type BrandLang } from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { openBookingModal } from '../components/openBookingModal'
import { SeoHead } from '../components/SeoHead'
import { getLocalizedCmsBlock, getLocalizedPageMeta } from '../cms/contentBlocks'
import type { CmsPageContent, CmsSiteSettings } from '../cms/types'
import { getOrderedCaseStudies } from '../data/caseStudyStories'
import type { CaseStudy, CaseStudyMetric } from '../data/caseStudies'
import { BigStatTile, StoryMetricChart } from '../components/StoryMetricCharts'
import { FlowWaveBackground } from '../components/FlowWaveBackground'
import { StoryBrandLogo } from '../components/StoryBrandLogo'
import { mergeHomepageBackground } from '../cms/siteSettings'
import { cldStoryMediaSrcSet, cldStoryMediaWidth, cldWidth } from '../lib/cloudinaryImage'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { brandDisplayFontClass } from '../lib/brandNames'

type SocialKey = 'facebook' | 'instagram' | 'tiktok' | 'website'
type MetricLayoutSlot = {
  column: number
  row: number
  columnSpan: number
  rowSpan: number
}
type StoryGlassTone = 'tone-on-dark' | 'tone-on-medium' | 'tone-on-light'
type StoryTileAnchor = 'left-stack' | 'right-stack' | 'top-band' | 'split-diagonal' | 'center-low'

// Round 11 P0-C: adaptive-tone cache. Tones are computed ONCE per image from a tiny
// w_64 Cloudinary variant during idle time, then cached in memory + localStorage.
// Slide changes only ever read this cache — no decode, no getImageData in the hot path.
const storyToneCache = new Map<string, Promise<StoryGlassTone[] | null>>()
const TONE_STORAGE_KEY = 'gg99-story-tones-v1'

function readStoredTones(url: string): StoryGlassTone[] | null {
  try {
    const store = JSON.parse(window.localStorage.getItem(TONE_STORAGE_KEY) || '{}') as Record<string, StoryGlassTone[]>
    return Array.isArray(store[url]) ? store[url] : null
  } catch {
    return null
  }
}

function writeStoredTones(url: string, tones: StoryGlassTone[]) {
  try {
    const store = JSON.parse(window.localStorage.getItem(TONE_STORAGE_KEY) || '{}') as Record<string, StoryGlassTone[]>
    store[url] = tones
    window.localStorage.setItem(TONE_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // storage full/blocked — memory cache still holds the value
  }
}

const socialPlatforms: Array<{ key: SocialKey; label: string; Icon: typeof Instagram }> = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'tiktok', label: 'TikTok', Icon: Music2 },
  { key: 'website', label: 'Website', Icon: Globe2 },
]

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


function storyStorageKey(id: string) {
  return `gg99:viewed-story:${id}`
}





function getStoryTheme(story: CaseStudy, storyIndex: number) {
  const fallbackThemes = Object.values(storyThemesById)
  return storyThemesById[story.id] ?? fallbackThemes[storyIndex % fallbackThemes.length]
}















function getToneFromLuminance(luminance: number): StoryGlassTone {
  if (luminance >= 0.55) return 'tone-on-light'
  if (luminance >= 0.45) return 'tone-on-medium'
  return 'tone-on-dark'
}

// Loads the w_64 thumbnail (not the full image!) and computes the tone for all
// 4 slide tile zones in one pass. Cached per URL in memory + localStorage.
function getSlideTonesCached(url: string): Promise<StoryGlassTone[] | null> {
  if (typeof window === 'undefined') return Promise.resolve(null)
  const cached = storyToneCache.get(url)
  if (cached) return cached

  const stored = readStoredTones(url)
  if (stored) {
    const resolved = Promise.resolve(stored)
    storyToneCache.set(url, resolved)
    return resolved
  }

  const promise = new Promise<StoryGlassTone[] | null>((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 48
        canvas.height = 60
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) {
          resolve(null)
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const tones = storySlideTileZones.map((zone) => getToneFromLuminance(getAverageLuminance(imageData, zone)))
        writeStoredTones(url, tones)
        resolve(tones)
      } catch {
        resolve(null)
      }
    }
    image.onerror = () => resolve(null)
    image.src = cldWidth(url, 64)
  })
  storyToneCache.set(url, promise)
  return promise
}

function getAverageLuminance(imageData: ImageData, slot: MetricLayoutSlot) {
  const { data, width, height } = imageData
  const startX = Math.max(0, Math.floor(((slot.column - 1) / 6) * width))
  const endX = Math.min(width, Math.ceil(((slot.column - 1 + slot.columnSpan) / 6) * width))
  const startY = Math.max(0, Math.floor(((slot.row - 1) / 8) * height))
  const endY = Math.min(height, Math.ceil(((slot.row - 1 + slot.rowSpan) / 8) * height))
  let total = 0
  let count = 0

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * width + x) * 4
      const red = data[index] / 255
      const green = data[index + 1] / 255
      const blue = data[index + 2] / 255
      total += 0.2126 * red + 0.7152 * green + 0.0722 * blue
      count += 1
    }
  }

  return count ? total / count : 0.5
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
    <a
      href={`#${encodeURIComponent(story.id)}`}
      onClick={(event) => {
        event.preventDefault()
        onClick(story)
      }}
      aria-label={`View ${getDisplayName(story)} case study`}
      className="ig-story-button group text-center"
    >
      <span className={`ig-story-ring mx-auto ${viewed ? 'is-viewed' : ''}`}>
        <span className="ig-story-ring-inner">
          <StoryBrandLogo
            storyId={story.id}
            brandName={getDisplayName(story)}
            src={story.logoUrl}
            variant={compact ? 'compact' : 'ring'}
            decorative
            eager={!compact}
          />
        </span>
      </span>
      {!compact && (
        <span className={`mt-2 block truncate text-[11px] font-bold text-on-surface-variant group-hover:text-primary ${brandDisplayFontClass(getDisplayName(story))}`}>
          {getDisplayName(story)}
        </span>
      )}
    </a>
  )
}

function YourStoryRing({ compact }: { compact: boolean }) {
  return (
    <button type="button" onClick={() => openBookingModal('your-story')} className="ig-story-button group text-center">
      <span className="ig-story-ring is-your-story mx-auto">
        <span className="ig-story-ring-inner relative">
          <StoryBrandLogo storyId="gg99" brandName="The One - GG99" variant={compact ? 'compact' : 'ring'} decorative />
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
    <section className={`ig-stories-bar stories-tray sticky z-30 border-y px-4 backdrop-blur-xl ${compact ? 'is-compact' : ''} ${mobile ? 'is-mobile' : ''}`}>
      <div className="mx-auto max-w-[900px]">
        <h1 className={mobile ? 'sr-only' : 'ig-stories-title ig-script-title text-center text-[46px] leading-none text-on-surface md:text-[58px]'}>
          {heading}
        </h1>
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
      <summary
        aria-label={`More options for ${getDisplayName(story)}`}
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-low"
      >
        <MoreHorizontal size={20} aria-hidden="true" />
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

// Each slide carries at most two unique metrics. This keeps every KPI readable on
// narrow screens without relying on CSS to hide a third tile.
type StorySlide = {
  image: string | null
  metrics: CaseStudyMetric[]
  isHero: boolean
  tileAnchor: StoryTileAnchor
}

const MAX_METRICS_PER_SLIDE = 2

// Approximate zone each slide's tiles occupy (6x8 grid) — used for adaptive luminance.
const storySlideTileZones: MetricLayoutSlot[] = [
  { column: 1, row: 5, columnSpan: 6, rowSpan: 3 },
  { column: 4, row: 2, columnSpan: 3, rowSpan: 6 },
  { column: 1, row: 2, columnSpan: 3, rowSpan: 6 },
  { column: 4, row: 2, columnSpan: 3, rowSpan: 6 },
  { column: 1, row: 2, columnSpan: 3, rowSpan: 6 },
]

const storyTileAnchors: StoryTileAnchor[] = ['left-stack', 'right-stack', 'top-band', 'split-diagonal', 'center-low']

function resolveSlideTileAnchor(slideMetrics: CaseStudyMetric[], slideIndex: number): StoryTileAnchor {
  const explicit = slideMetrics.find((metric) => metric.tileAnchor && metric.tileAnchor !== 'auto')?.tileAnchor
  if (explicit && explicit !== 'auto') return explicit
  return storyTileAnchors[slideIndex % storyTileAnchors.length]
}

function buildStorySlides(story: CaseStudy): StorySlide[] {
  const images = carouselImagesForStory(story)
  const metrics = story.keyMetrics.filter((metric) => metric.value.trim() || metric.label.trim())
  const featured = metrics.filter((metric) => metric.featured).slice(0, 2)
  const heroMetrics = featured.length ? featured : metrics.slice(0, MAX_METRICS_PER_SLIDE)
  const chartSlides: CaseStudyMetric[][] = []
  const unassigned: CaseStudyMetric[] = []

  for (const metric of metrics) {
    if (heroMetrics.includes(metric)) continue
    const preferredChartIndex = metric.slide && metric.slide > 1 ? metric.slide - 2 : null
    if (preferredChartIndex !== null) {
      while (chartSlides.length <= preferredChartIndex) chartSlides.push([])
      if (chartSlides[preferredChartIndex].length < MAX_METRICS_PER_SLIDE) {
        chartSlides[preferredChartIndex].push(metric)
      } else {
        unassigned.push(metric)
      }
      continue
    }
    unassigned.push(metric)
  }

  // Metrics without a CMS slide, and overflow from a populated CMS slide, fill the
  // first available two-tile chart slide. Nothing is sliced or discarded.
  for (const metric of unassigned) {
    let target = chartSlides.findIndex((slideMetrics) => slideMetrics.length < MAX_METRICS_PER_SLIDE)
    if (target < 0) {
      target = chartSlides.length
      chartSlides.push([])
    }
    chartSlides[target].push(metric)
  }

  const perSlide = [heroMetrics, ...chartSlides.filter((slideMetrics) => slideMetrics.length > 0)]
  if (!perSlide.length) perSlide.push([])

  return perSlide.map((slideMetrics, slideIndex) => ({
    // When there are fewer images than data slides, repeat the final supplied image.
    image: images[slideIndex] ?? images[images.length - 1] ?? null,
    metrics: slideMetrics,
    isHero: slideIndex === 0,
    tileAnchor: resolveSlideTileAnchor(slideMetrics, slideIndex),
  }))
}

function StoryMediaFrame({ story, index, swipeHint }: { story: CaseStudy; index: number; swipeHint: string }) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const summaryCopyRef = useRef<HTMLParagraphElement | null>(null)
  const summarySheetRef = useRef<HTMLDivElement | null>(null)
  const summaryCloseRef = useRef<HTMLButtonElement | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const slides = useMemo(() => buildStorySlides(story), [story])
  const theme = useMemo(() => getStoryTheme(story, index), [index, story])
  const [activeSlide, setActiveSlide] = useState(0)
  const [activatedSlides, setActivatedSlides] = useState<boolean[]>(() => slides.map((_, slideIndex) => slideIndex === 0))
  const [slideTones, setSlideTones] = useState<StoryGlassTone[]>(() => slides.map(() => 'tone-on-medium'))
  const [inView, setInView] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [summaryNeedsMore, setSummaryNeedsMore] = useState(false)
  const summarySheetId = `${story.id}-summary-sheet`
  const slideCount = slides.length
  const frameStyle = {
    '--story-accent': theme.accent,
    '--story-accent-soft': theme.accentSoft,
    '--story-tile-bg': theme.tile,
    '--story-featured-bg': theme.featured,
  }

  useEffect(() => {
    setCanHover(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false)
  }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const element = frameRef.current
    if (!element) return
    // Round 11 P0-C: threshold 0.3 — chart effects only run for posts truly in view.
    // Observe the outer .story-post article: it carries content-visibility:auto and
    // is never itself skipped — IO does NOT fire for elements inside skipped subtrees.
    const target = element.closest('.story-post') ?? element
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  // Chart animations run once per slide per view: remember which slides were shown.
  useEffect(() => {
    setActivatedSlides((current) => (current[activeSlide] ? current : current.map((value, slideIndex) => (slideIndex === activeSlide ? true : value))))
  }, [activeSlide])

  // Round 11 P0-C: adaptive tones resolve once per post during idle time from the
  // w_64 thumbnail cache. Slide changes never trigger decode or pixel sampling.
  useEffect(() => {
    let cancelled = false
    const run = () => {
      slides.forEach((slide, slideIndex) => {
        if (!slide.image) return
        void getSlideTonesCached(slide.image).then((tones) => {
          if (cancelled || !tones) return
          const tone = tones[slideIndex] ?? tones[0]
          setSlideTones((current) => (current[slideIndex] === tone ? current : current.map((value, i) => (i === slideIndex ? tone : value))))
        })
      })
    }
    let idleId = 0
    let timeoutId = 0
    if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(run, { timeout: 4000 })
    else timeoutId = window.setTimeout(run, 300)
    return () => {
      cancelled = true
      if (idleId && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [slides])

  useEffect(() => {
    const element = summaryCopyRef.current
    if (!element) return
    const sync = () => setSummaryNeedsMore(element.scrollHeight > element.clientHeight + 2)
    sync()
    if (!('ResizeObserver' in window)) return
    const observer = new ResizeObserver(sync)
    observer.observe(element)
    return () => observer.disconnect()
  }, [story.shortDescription])

  useEffect(() => {
    if (!summaryExpanded) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => summaryCloseRef.current?.focus(), 0)

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSummaryExpanded(false)
        return
      }
      if (event.key !== 'Tab') return
      const sheet = summarySheetRef.current
      if (!sheet) return
      const focusable = Array.from(sheet.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'))
        .filter((element) => !element.hasAttribute('disabled'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [summaryExpanded])

  // Manual navigation clamps at the ends — IG does not loop.
  function goTo(delta: number) {
    if (slideCount <= 1) return
    setInteracted(true)
    setActiveSlide((current) => Math.max(0, Math.min(slideCount - 1, current + delta)))
  }

  function goToSlide(slideIndex: number) {
    setInteracted(true)
    setActiveSlide(Math.max(0, Math.min(slideCount - 1, slideIndex)))
  }

  function openSummarySheet() {
    setSummaryExpanded(true)
  }

  function closeSummarySheet() {
    setSummaryExpanded(false)
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? 0
    touchStartY.current = event.touches[0]?.clientY ?? 0
    setInteracted(true)
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const endX = event.changedTouches[0]?.clientX ?? 0
    const endY = event.changedTouches[0]?.clientY ?? 0
    const deltaX = endX - touchStartX.current
    const deltaY = endY - touchStartY.current
    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) return
    goTo(deltaX < 0 ? 1 : -1)
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(-1)
    }
  }

  const showArrows = canHover && slideCount > 1
  const showHint = slideCount > 1 && activeSlide === 0 && !interacted

  return (
    <div data-reveal="scale" className="w-full min-w-0">
    <div
      ref={frameRef}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${getDisplayName(story)} results — slide ${activeSlide + 1} of ${slideCount}`}
      className={`story-media-frame relative aspect-[4/5] max-w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary ${inView ? 'glass-active' : ''}`}
      style={frameStyle as CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <div
        className="story-slide-track absolute inset-y-0 left-0 flex w-full transition-[left] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ left: `-${activeSlide * 100}%` }}
      >
        {slides.map((slide, slideIndex) => {
          const nearActive = Math.abs(slideIndex - activeSlide) <= 1
          const tone = slideTones[slideIndex] ?? 'tone-on-medium'
          const activated = Boolean(activatedSlides[slideIndex]) && inView

          return (
            <div
              key={`${story.id}-slide-${slideIndex}`}
              className={`story-slide-unit relative h-full w-full shrink-0 overflow-hidden ${slideIndex === activeSlide ? 'is-active' : ''}`}
              aria-hidden={slideIndex === activeSlide ? undefined : true}
              aria-label={`Slide ${slideIndex + 1} of ${slideCount}`}
            >
              {slide.image && nearActive ? (
                <>
                  <div
                    className="story-slide-media-stage absolute inset-0"
                    style={{ backgroundImage: story.screenBackground?.gradient || theme.gradient }}
                    aria-hidden="true"
                  />
                  <img
                    /* Preserve every source pixel instead of magnifying a
                       landscape crop to fill the portrait Instagram frame. */
                    src={cldStoryMediaWidth(slide.image, 1720)}
                    srcSet={cldStoryMediaSrcSet(slide.image)}
                    sizes="(min-width: 1280px) 828px, (min-width: 1024px) 660px, (min-width: 768px) 640px, (min-width: 640px) calc(100vw - 40px), calc(100vw - 24px)"
                    alt=""
                    crossOrigin="anonymous"
                    className="story-slide-image absolute inset-0 h-full w-full object-contain"
                    loading={index === 0 && slideIndex === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 && slideIndex === 0 ? 'high' : 'low'}
                    decoding="async"
                  />
                </>
              ) : (
                <div className="absolute inset-0" style={{ backgroundImage: story.screenBackground?.gradient || theme.gradient }} aria-hidden="true" />
              )}
              <div className="story-slide-scrim absolute inset-0" aria-hidden="true" />

              {/* Round 11: only slides within ±1 of active render their tiles */}
              {!nearActive ? null : slide.isHero ? (
                <>
                  {slide.metrics.length > 0 && (
                    <div className="story-slide-hero-stats">
                      {slide.metrics.map((metric, metricIndex) => (
                        <div key={`${story.id}-hero-metric-${metricIndex}`} className={`story-glass-tile story-chart-tile is-hero ${tone}`}>
                          <BigStatTile metric={metric} activated={activated} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`story-summary-glass story-slide-summary ${tone}`}>
                    <span className="story-summary-kicker">{story.category}</span>
                    <p ref={summaryCopyRef} className="story-summary-copy">{story.shortDescription}</p>
                    {summaryNeedsMore && (
                      <button
                        type="button"
                        className="story-summary-more"
                        aria-expanded={summaryExpanded}
                        aria-controls={summarySheetId}
                        onClick={openSummarySheet}
                      >
                        ... more
                      </button>
                    )}
                    <div className="story-summary-tags" aria-label="Services">
                      {story.services.slice(0, 4).map((service) => (
                        <span key={`${story.id}-summary-${service}`}>{service}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className={`story-slide-tiles is-${slide.tileAnchor}`}>
                  {slide.metrics.map((metric, metricIndex) => (
                    <div
                      key={`${story.id}-slide-${slideIndex}-metric-${metricIndex}`}
                      className={`story-glass-tile story-chart-tile ${tone} ${metric.display && metric.display !== 'bignum' ? 'is-chart' : ''}`}
                      style={{ '--ri': metricIndex } as CSSProperties}
                    >
                      <StoryMetricChart metric={metric} activated={activated} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {slideCount > 1 && (
        <div className="story-carousel-status absolute right-3 top-3 z-30" aria-hidden="true">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-extrabold text-white" aria-hidden="true">
            {activeSlide + 1}/{slideCount}
          </span>
        </div>
      )}

      {showHint && (
        <button type="button" className="story-swipe-hint" onClick={() => goTo(1)}>
          {swipeHint.replace(/\s*(→|->)\s*$/, '')}
          <span className="story-swipe-hint-arrow" aria-hidden="true">→</span>
        </button>
      )}

      {showArrows && activeSlide > 0 && (
        <button
          type="button"
          className="story-carousel-arrow is-left"
          aria-label="Previous slide"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            goTo(-1)
          }}
        >
          <ChevronLeft size={19} strokeWidth={2.6} />
        </button>
      )}
      {showArrows && activeSlide < slideCount - 1 && (
        <button
          type="button"
          className="story-carousel-arrow is-right"
          aria-label="Next slide"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            goTo(1)
          }}
        >
          <ChevronRight size={19} strokeWidth={2.6} />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 z-30 flex px-3.5 pb-3.5">
        <button
          type="button"
          onClick={openSummarySheet}
          aria-haspopup="dialog"
          aria-controls={summarySheetId}
          className="about-story-btn"
        >
          About this story
        </button>
      </div>

      {summaryExpanded && typeof document !== 'undefined' && createPortal(
        <div
          className="story-summary-sheet-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSummarySheet()
          }}
        >
          <div
            id={summarySheetId}
            ref={summarySheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${summarySheetId}-title`}
            aria-describedby={`${summarySheetId}-description`}
            data-testid="story-detail-dialog"
            className="story-summary-sheet"
          >
            <button
              type="button"
              ref={summaryCloseRef}
              className="story-summary-sheet-close"
              aria-label={`Close ${getDisplayName(story)} case study details`}
              onClick={closeSummarySheet}
            >
              <X size={22} aria-hidden="true" />
            </button>
            <span className="story-summary-sheet-kicker">{story.category}</span>
            <h3 id={`${summarySheetId}-title`} className={`story-detail-title pr-12 text-2xl font-extrabold leading-tight ${brandDisplayFontClass(getDisplayName(story))}`}>
              {getDisplayName(story)} case study
            </h3>
            <p id={`${summarySheetId}-description`} className="mt-3">{story.shortDescription}</p>
            <div className="story-summary-sheet-tags" aria-label="Services">
              {story.services.map((service) => (
                <span key={`${story.id}-sheet-${service}`}>{service}</span>
              ))}
            </div>

            <div className="story-detail-sections mt-6 grid gap-5">
              {story.storyDetail.challenge && (
                <section>
                  <h4 className="text-sm font-extrabold uppercase tracking-[0.08em]">Challenge</h4>
                  <p className="mt-2">{story.storyDetail.challenge}</p>
                </section>
              )}
              {story.storyDetail.solution && (
                <section>
                  <h4 className="text-sm font-extrabold uppercase tracking-[0.08em]">Solution</h4>
                  <p className="mt-2">{story.storyDetail.solution}</p>
                </section>
              )}
              {story.storyDetail.result && (
                <section>
                  <h4 className="text-sm font-extrabold uppercase tracking-[0.08em]">Result</h4>
                  <p className="mt-2">{story.storyDetail.result}</p>
                </section>
              )}
            </div>

            {story.keyMetrics.some((metric) => metric.value.trim() || metric.label.trim()) && (
              <section className="story-detail-metrics mt-6" aria-labelledby={`${summarySheetId}-metrics-title`}>
                <h4 id={`${summarySheetId}-metrics-title`} className="text-sm font-extrabold uppercase tracking-[0.08em]">Full results</h4>
                <dl className="mt-3 grid grid-cols-2 gap-3" data-testid="story-detail-metrics">
                  {story.keyMetrics.filter((metric) => metric.value.trim() || metric.label.trim()).map((metric, metricIndex) => (
                    <div key={`${story.id}-detail-metric-${metricIndex}`} className="story-detail-metric flex flex-col rounded-2xl border border-white/20 bg-white/10 p-3">
                      <dt className="order-2 mt-1 text-xs font-bold leading-snug text-white/80">{metric.label}</dt>
                      <dd className="order-1 text-xl font-extrabold">{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {story.testimonialQuote && (
              <figure className="story-detail-testimonial mt-6 rounded-2xl border border-white/20 bg-white/10 p-4">
                <blockquote className="font-semibold italic">“{story.testimonialQuote}”</blockquote>
                {(story.testimonialAuthor || story.testimonialRole) && (
                  <figcaption className="mt-2 text-xs font-extrabold uppercase tracking-[0.08em] text-white/75">
                    {story.testimonialAuthor}{story.testimonialRole ? `, ${story.testimonialRole}` : ''}
                  </figcaption>
                )}
              </figure>
            )}

            <button
              type="button"
              className="story-detail-booking-cta mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white"
              onClick={() => {
                closeSummarySheet()
                window.setTimeout(() => openBookingModal(`story-detail-${story.id}`), 0)
              }}
            >
              Book a consultation
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>

    {slideCount > 1 && (
      <div className="story-carousel-dots" role="group" aria-label={`${getDisplayName(story)} carousel slides`}>
        <span className="sr-only" aria-live="polite">Slide {activeSlide + 1} of {slideCount}</span>
        {slides.map((_, slideIndex) => (
          <button
            type="button"
            key={`${story.id}-dot-${slideIndex}`}
            aria-pressed={slideIndex === activeSlide}
            aria-current={slideIndex === activeSlide ? 'true' : undefined}
            aria-label={`Show slide ${slideIndex + 1} of ${slideCount}`}
            onClick={() => goToSlide(slideIndex)}
            className="story-carousel-dot"
          >
            <span
              aria-hidden="true"
              className={`story-carousel-dot-indicator ${slideIndex === activeSlide ? 'is-active' : ''}`}
            />
          </button>
        ))}
      </div>
    )}
    </div>
  )
}


function normalizeSocialUrl(value: string | undefined) {
  let candidate = value?.trim() || ''
  if (/^ttps:\/\//i.test(candidate)) candidate = `h${candidate}`
  if (/^www\./i.test(candidate)) candidate = `https://${candidate}`
  if (!candidate) return ''
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : ''
  } catch {
    return ''
  }
}

function PostSocialLinks({ story }: { story: CaseStudy }) {
  const links = socialPlatforms
    .map((platform) => ({ ...platform, href: normalizeSocialUrl(story.socialLinks?.[platform.key]) }))
    .filter((link) => Boolean(link.href))
  const websiteLink = links.find((link) => link.key === 'website')
  const actionLinks = links.filter((link) => link.key !== 'website')

  function renderSocialAction({ key, label, href, Icon }: (typeof links)[number], extraClass = '') {
    const className = `story-social-icon inline-flex h-11 w-11 items-center justify-center text-[#262626] transition hover:scale-[1.15] hover:text-primary ${extraClass}`
    return (
      <a
        key={key}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${getDisplayName(story)} on ${label}`}
        title={`${getDisplayName(story)} on ${label}`}
        className={className}
      >
        <Icon size={24} strokeWidth={2.1} aria-hidden="true" />
      </a>
    )
  }

  if (!links.length) return null

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
  swipeHint,
  highlighted,
  onCopy,
}: {
  story: CaseStudy
  index: number
  swipeHint: string
  highlighted: boolean
  onCopy: (story: CaseStudy) => void
}) {
  const seedLikes = parseLikes(story.likesSeed, 980 + index * 397)

  return (
    <div data-reveal="scale" style={{ '--ri': index } as CSSProperties}>
    <article
      id={story.id}
      tabIndex={-1}
      aria-labelledby={`${story.id}-title`}
      className={`story-post w-full max-w-full overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_70px_rgba(219,39,119,0.12)] transition duration-500 ${highlighted ? 'is-highlighted' : ''}`}
    >
      <header className="flex items-center gap-3 border-b border-outline-variant/35 px-4 py-3">
        <StoryBrandLogo storyId={story.id} brandName={getDisplayName(story)} src={story.logoUrl} variant="header" decorative />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 id={`${story.id}-title`} className="truncate text-sm font-extrabold text-on-surface">{getAccountName(story)}</h2>
            {story.verified && (
              <>
                <Check size={14} className="rounded-full bg-primary p-0.5 text-white" aria-hidden="true" />
                <span className="sr-only">Verified account</span>
              </>
            )}
            <span className="text-xs font-bold text-on-surface-variant">.</span>
            <span className="truncate text-xs font-bold text-on-surface-variant">{story.period}</span>
          </div>
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-on-surface-variant md:truncate md:leading-normal">{story.headline}</p>
        </div>
        <PostMoreMenu story={story} onCopy={onCopy} />
      </header>

      <StoryMediaFrame story={story} index={index} swipeHint={swipeHint} />

      <footer className="px-4 pb-4 pt-3">
        <PostSocialLinks story={story} />
        <p className="mt-3 text-sm font-extrabold text-on-surface">Liked by {compactNumber(seedLikes)} people</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface">
          <span className="font-extrabold">{getAccountName(story)}</span>{' '}
          {story.caption || story.shortDescription}
        </p>
        {story.testimonialQuote && (
          <figure className="story-testimonial-quote mt-3 rounded-2xl border border-primary/15 bg-[#FFF7F5] p-3">
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
        <div className="stories-rail-card rounded-[24px] border p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <StoryBrandLogo storyId="gg99" brandName="The One - GG99" variant="profile" />
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

        <div className="stories-rail-card rounded-[24px] border p-5 backdrop-blur-xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Suggested stories</p>
          <div className="mt-4 space-y-3">
            {stories.slice(0, 4).map((story) => (
              <button key={story.id} type="button" onClick={() => onStoryClick(story)} className="flex w-full items-center gap-3 text-left">
                <StoryBrandLogo storyId={story.id} brandName={getDisplayName(story)} src={story.logoUrl} variant="suggested" decorative />
                <span className="min-w-0">
                  <span className={`block truncate text-sm font-extrabold text-on-surface ${brandDisplayFontClass(getDisplayName(story))}`}>{getDisplayName(story)}</span>
                  <span className="block truncate text-xs font-semibold text-on-surface-variant">{story.category}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {firstStory && (
          <a href={`#${encodeURIComponent(firstStory.id)}`} className="inline-flex items-center gap-2 px-2 text-sm font-extrabold text-primary">
            Back to top story <ArrowUp size={16} strokeWidth={2.8} />
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
      className="story-post stories-final-cta group w-full overflow-hidden rounded-[28px] border p-6 text-left backdrop-blur transition hover:-translate-y-1 hover:border-primary/45 md:p-8"
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

export default function TheOnePage({ lang = 'en', cmsPage, siteSettings }: { lang?: BrandLang; cmsPage?: CmsPageContent | null; siteSettings?: CmsSiteSettings | null }) {
  const c = compactTheOneByLang[lang]
  const reducedMotion = useReducedMotionPreference()
  const heroBlock = getLocalizedCmsBlock(cmsPage, 'hero', lang)
  const storiesBlock = getLocalizedCmsBlock(cmsPage, 'stories', lang)
  const storiesOrderKey = JSON.stringify(storiesBlock?.items ?? [])
  const orderedCaseStudies = useMemo(() => getOrderedCaseStudies(storiesBlock), [storiesOrderKey])
  const swipeHintText = storiesBlock?.swipeHintText?.trim() || 'Swipe for more records →'
  const [viewedStories, setViewedStories] = useState<Set<string>>(() => new Set())
  const [highlightedId, setHighlightedId] = useState('')
  const [toast, setToast] = useState('')
  const [compactStories, setCompactStories] = useState(false)
  const [isMobileStories, setIsMobileStories] = useState(false)
  const [storiesOffsets, setStoriesOffsets] = useState({ anchorOffset: 168, pageTopPadding: 80, stickyTop: 80 })
  const storyHeading = heroBlock?.heading?.trim() || 'The One Stories'
  const storyIntro = heroBlock?.body?.trim()
  const finalCtaLabel = heroBlock?.ctaLabel?.trim() || 'How about our stories?'
  const storiesBackground = mergeHomepageBackground(siteSettings?.homepageBackground)


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
    let frame = 0
    let resizeObserver: ResizeObserver | undefined
    const sync = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const header = document.querySelector('header')
        const bar = document.querySelector('.ig-stories-bar')
        const headerStyle = header ? window.getComputedStyle(header) : undefined
        const headerRect = header?.getBoundingClientRect()
        const headerTop = Number.parseFloat(headerStyle?.top ?? '0') || 0
        const headerHeight = headerRect?.height ?? 80
        const pageTopPadding = Math.max(0, Math.round(headerTop + headerHeight))
        const position = headerStyle?.position
        const visibleHeaderBottom = Math.round(headerRect?.bottom ?? pageTopPadding)
        const stickyTop = position === 'fixed' || position === 'sticky'
          ? Math.max(0, visibleHeaderBottom)
          : Math.max(0, Math.min(pageTopPadding, visibleHeaderBottom))
        const barHeight = Math.round(bar?.getBoundingClientRect().height ?? (isMobileStories ? 56 : compactStories ? 56 : 150))
        const anchorOffset = stickyTop + barHeight + 16
        setStoriesOffsets((current) => (
          current.stickyTop === stickyTop && current.anchorOffset === anchorOffset && current.pageTopPadding === pageTopPadding
            ? current
            : { anchorOffset, pageTopPadding, stickyTop }
        ))
      })
    }

    sync()
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(sync)
      const header = document.querySelector('header')
      const bar = document.querySelector('.ig-stories-bar')
      if (header) resizeObserver.observe(header)
      if (bar) resizeObserver.observe(bar)
    }
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      resizeObserver?.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [compactStories, isMobileStories])

  useEffect(() => {
    const scrollToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      window.setTimeout(() => {
        const target = document.getElementById(id)
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        target?.scrollIntoView({ block: 'start', behavior })
        target?.focus({ preventScroll: true })
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
    const target = document.getElementById(story.id)
    target?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
    target?.focus({ preventScroll: true })
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
    <BrandLayout
      lang={lang}
      siteSettings={siteSettings}
      flushTop
      transparentBackground
      chromeTone="dark"
      mobileHeaderTitle={isMobileStories ? storyHeading : undefined}
    >
      <SeoHead meta={getLocalizedPageMeta(cmsPage, lang, c.meta)} schema={[organizationSchema, websiteSchema]} lang={lang} />
      <FlowWaveBackground settings={storiesBackground} variant="stories" />

      <article
        className="the-one-page stories-dark-stage relative min-h-screen overflow-x-clip bg-transparent pb-16"
        style={{
          '--stories-sticky-top': `${storiesOffsets.stickyTop}px`,
          '--story-anchor-offset': `${storiesOffsets.anchorOffset}px`,
          paddingTop: storiesOffsets.pageTopPadding,
        } as CSSProperties}
      >
        <StoriesBar
          heading={storyHeading}
          compact={compactStories}
          mobile={isMobileStories}
          stories={orderedCaseStudies}
          viewedStories={viewedStories}
          onStoryClick={handleStoryClick}
        />

        {storyIntro && (
          <p className="stories-intro mx-auto mt-7 max-w-2xl px-5 text-center text-sm font-bold leading-relaxed md:text-base">
            {storyIntro}
          </p>
        )}

        <section className="mx-auto mt-8 grid w-full max-w-[1180px] min-w-0 grid-cols-[minmax(0,1fr)] gap-8 px-3 sm:px-5 xl:grid-cols-[minmax(0,860px)_280px]">
          <div className="mx-auto grid w-full min-w-0 max-w-full grid-cols-[minmax(0,1fr)] gap-7 md:max-w-[640px] lg:max-w-[660px] xl:max-w-[828px]">
            {orderedCaseStudies.map((story, index) => (
              <InstagramPost
                key={story.id}
                story={story}
                index={index}
                swipeHint={swipeHintText}
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
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-on-surface px-4 py-2 text-sm font-bold text-white shadow-xl"
        >
          {toast}
        </div>
      )}
    </BrandLayout>
  )
}
