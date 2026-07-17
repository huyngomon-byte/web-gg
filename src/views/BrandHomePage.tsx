'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  MessageCircle,
  Repeat2,
  Send,
} from 'lucide-react'
import { compactHomeByLang, homeMetaByLang, homeWebPageSchema, localizedPath, organizationSchema, websiteSchema, type BrandLang } from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { BookingCtaContent } from '../components/BookingCtaContent'
import { openBookingModal } from '../components/openBookingModal'
import { PackageCards } from '../components/PackageCards'
import { SeoHead } from '../components/SeoHead'
import { whenIntroGone } from '../hooks/useIntroGate'
import { FlowWaveBackground } from '../components/FlowWaveBackground'
import { HeroBackgroundVideo, type HeroVideoSources } from '../components/HeroBackgroundVideo'
import { getCmsBlock, getLocalizedCmsBlock, getLocalizedPageMeta, splitCmsParagraphs } from '../cms/contentBlocks'
import { mergeHomepageBackground } from '../cms/siteSettings'
import { cldResponsiveSrcSet, cldSrcSet, cldWidth } from '../lib/cloudinaryImage'
import { getHomepageVideoDeliveryWidth, retargetCloudinaryVideoWidth } from '../lib/cloudinaryVideo'
import { buildHomeFaqSchema, getHomeClosingFaqItems } from '../cms/homeFaqSchema'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import type { CmsBlock, CmsBlockItem, CmsPageContent, CmsSiteSettings } from '../cms/types'
import { getOrderedCaseStudies } from '../data/caseStudyStories'
import type { CaseStudy } from '../data/caseStudies'
import { brandDisplayFontClass } from '../lib/brandNames'

const defaultHeroGradient = 'linear-gradient(180deg,#FF7AA8 0%,#FF4D7D 45%,#FFB199 100%)'
// Checked-in closing media is an honest 1920px desktop / 1440px mobile
// fallback ceiling. A CMS Cloudinary override with genuine 4K and portrait
// masters is required for true Retina/4K closing delivery; never upscale it.
const defaultClosingPortalSources: HeroVideoSources = {
  mp4: '/closing/closing-portal-1920.mp4',
  webm: '/closing/closing-portal-1920.webm',
  mobileMp4: '/closing/closing-portal-1440.mp4',
  mobileWebm: '/closing/closing-portal-1440.webm',
  poster: '/closing/closing-portal-poster.webp',
  mobilePoster: '/closing/closing-portal-poster.webp',
}
const homepageVideoTargetWidth = {
  mobile: 1440,
  desktop: 3840,
} as const
const legacyLowResolutionMobileVideoMarkers = [
  // Current hero mobile exports are only 1280x720. Until a true 1440px mobile
  // master is uploaded, derive the mobile rendition from the sharper desktop
  // master instead. New mobile uploads are not on this list and stay respected.
  '/njmm9y7l4xpdoi6rr07t.mp4',
  '/togvf3ict63sjnoj807s.webm',
  '/closing/closing-portal-1280.',
] as const
const cloudinaryVideoUploadMarker = '/video/upload/'
const heroFirstWordDelayMs = 420
const heroWordStepMs = 90
const heroWordDurationMs = 430

const packageTermsHighlights = [
  'Transparent pricing',
  'No hidden fees',
  'Quarterly commitment',
  'does not guarantee revenue',
  "90% of results depend on the product, the founder and the company's internal strength",
  'is not a representative of Meta, TikTok, Google or Shopee',
] as const

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightPackageTerms(text: string): ReactNode[] {
  const matcher = new RegExp(`(${packageTermsHighlights.map(escapeRegExp).join('|')})`, 'gi')
  return text.split(matcher).filter(Boolean).map((part, index) => {
    const isHighlight = packageTermsHighlights.some((phrase) => phrase.toLocaleLowerCase('en') === part.toLocaleLowerCase('en'))
    return isHighlight
      ? <strong key={`${part}-${index}`} className="package-terms-emphasis">{part}</strong>
      : part
  })
}

function isCloudinaryVideo(url: string | undefined) {
  return Boolean(url?.includes('res.cloudinary.com/') && url.includes(cloudinaryVideoUploadMarker))
}

function cloudinaryVideoVariant(url: string | undefined, width: number) {
  const value = url?.trim()
  if (!value || !isCloudinaryVideo(value)) return value || undefined

  // Never fake detail: c_limit preserves the native source ceiling. q_90 keeps
  // fine motion detail that q_auto removed from the current flower footage;
  // modest sharpening restores edge separation without manufacturing pixels.
  return value.replace(
    cloudinaryVideoUploadMarker,
    `${cloudinaryVideoUploadMarker}c_limit,w_${width},q_90,e_sharpen:60,vc_auto/`,
  )
}

function mobileVideoMaster(desktop: string | undefined, mobile: string | undefined) {
  const desktopValue = desktop?.trim()
  const mobileValue = mobile?.trim()

  if (
    desktopValue
    && mobileValue
    && legacyLowResolutionMobileVideoMarkers.some((marker) => mobileValue.includes(marker))
  ) return desktopValue

  // Respect every new/bespoke mobile crop. Upload validation guarantees future
  // CMS mobile videos are at least 1440px wide.
  if (mobileValue) return mobileValue
  return mobileValue || desktopValue
}

function getAdaptiveHomepageVideoSources(sources: HeroVideoSources): HeroVideoSources {
  const mobileMp4Master = mobileVideoMaster(sources.mp4, sources.mobileMp4)
  const mobileWebmMaster = mobileVideoMaster(sources.webm, sources.mobileWebm)

  return {
    mp4: cloudinaryVideoVariant(sources.mp4, homepageVideoTargetWidth.desktop),
    webm: cloudinaryVideoVariant(sources.webm, homepageVideoTargetWidth.desktop),
    mobileMp4: cloudinaryVideoVariant(mobileMp4Master, homepageVideoTargetWidth.mobile),
    mobileWebm: cloudinaryVideoVariant(mobileWebmMaster, homepageVideoTargetWidth.mobile),
    poster: cldWidth(sources.poster, 1920, 'best') || undefined,
    mobilePoster: cldWidth(sources.mobilePoster || sources.poster, 1080, 'best') || undefined,
    posterSrcSet: cldResponsiveSrcSet(sources.poster, 'full', 'best'),
    mobilePosterSrcSet: cldResponsiveSrcSet(sources.mobilePoster || sources.poster, 'mobile', 'best'),
  }
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
  return story.logoUrl || storyLogoById[story.id] || '/avatars/logo-gg.png'
}

// Round 12 A2.3: word-by-word reveal for big headings/quotes ([data-reveal='words'] CSS)
function RevealWords({ text, includeScreenReaderText = true }: { text: string; includeScreenReaderText?: boolean }) {
  const words = splitWords(text)
  return (
    <>
      {includeScreenReaderText && <span className="sr-only">{text}</span>}
      <span aria-hidden="true" style={{ '--rw-count': words.length } as CSSProperties}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="rw-word"
            style={{ '--wi': index, '--rwi': words.length - index - 1 } as CSSProperties}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </>
  )
}

function SectionHeader({
  eyebrow,
  title,
  intro,
  quote,
  dark = false,
  align = 'left',
  perWord = false,
  className = '',
  titleClassName = '',
}: {
  eyebrow?: string
  title: string
  intro?: string
  quote?: string
  dark?: boolean
  align?: 'left' | 'center'
  perWord?: boolean
  className?: string
  titleClassName?: string
}) {
  const centered = align === 'center'
  const titleWordCount = countStaggerWords(title)
  const followDelayMs = perWord ? titleWordCount * 70 + 240 : 130
  return (
    <div className={`mb-8 max-w-3xl ${centered ? 'mx-auto text-center' : ''} ${className}`}>
      {eyebrow && (
        <p data-reveal="soft" data-reveal-phase="0" className="packages-eyebrow">
          {eyebrow}
        </p>
      )}
      <h2 data-reveal={perWord ? 'words' : 'true'} data-reveal-phase="0" className={`text-[28px] md:text-[36px] font-extrabold leading-tight ${dark ? 'text-white' : 'text-on-surface'} ${titleClassName}`}>
        {perWord ? <RevealWords text={title} /> : title}
      </h2>
      <div
        data-reveal="line"
        data-reveal-phase="1"
        style={{ '--rd': `${followDelayMs}ms` } as CSSProperties}
        className={`home-gradient-underline mt-3 ${centered ? 'mx-auto' : ''}`}
        aria-hidden="true"
      />
      {intro && (
        <p
          data-reveal="soft"
          data-reveal-phase="1"
          style={{ '--rd': `${followDelayMs}ms` } as CSSProperties}
          className={`mt-4 text-[15px] md:text-base leading-relaxed ${dark ? 'text-white/75' : 'text-on-surface-variant'}`}
        >
          {intro}
        </p>
      )}
      {quote && (
        // Round 12 A5: editorial pull-quote — oversized gradient quote mark behind-left,
        // hero-family serif italic, thin gradient underline. Text stays a CMS field.
        <div className="people-quote mt-6" data-reveal="words" data-reveal-phase="1" style={{ '--rd': `${followDelayMs}ms` } as CSSProperties}>
          <span className="people-quote-mark" aria-hidden="true">&ldquo;</span>
          <p className={`people-quote-text text-[19px] italic leading-snug md:text-[24px] ${dark ? 'text-[#fff1f7]' : 'text-[#3d1226]'}`}>
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
  const totalCharacters = countStaggerCharacters(text)
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
                <span
                  key={`${word}-${index}-${character}`}
                  className={`stagger-char ${charClassName}`}
                  style={{ '--ci': currentIndex, '--rci': totalCharacters - currentIndex - 1 } as CSSProperties}
                >
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
          <span
            key={`${word}-${index}`}
            className="stagger-word hero-stagger-word"
            style={{
              '--hero-word-delay': `${heroFirstWordDelayMs + index * heroWordStepMs}ms`,
              '--hero-word-delay-up': `${(words.length - index - 1) * heroWordStepMs}ms`,
            } as CSSProperties}
          >
            {word}
            {index < words.length - 1 ? <span className="stagger-space" aria-hidden="true">&nbsp;</span> : null}
          </span>
        ))}
      </span>
    </span>
  )
}

type HeroProofKind = 'growth' | 'orders' | 'partnership'

function resolveHeroProofKind(chip: { value: string; label: string; icon?: string }, index: number): HeroProofKind {
  const hint = `${chip.icon ?? ''} ${chip.value} ${chip.label}`.toLowerCase()
  if (/order|cart|shop|package|bag/.test(hint)) return 'orders'
  if (/partner|year|yrs|relationship|heart|handshake/.test(hint)) return 'partnership'
  if (/growth|peak|trend|revenue|increase/.test(hint)) return 'growth'
  return (['growth', 'orders', 'partnership'] as const)[index % 3]
}

function HeroProofIcon({ kind }: { kind: HeroProofKind }) {
  if (kind === 'orders') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h16l-1.35 11H5.35L4 8Z" />
        <path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9M8.5 13h7" />
      </svg>
    )
  }

  if (kind === 'partnership') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.8 5.8a5.1 5.1 0 0 0-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8a5.1 5.1 0 0 0 0-7.2Z" />
        <path d="m8.5 12 2.1 2.1 4.9-5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 17 5-5 4 3 7-8" />
      <path d="M15 7h5v5" />
    </svg>
  )
}

function HeroProofMicrovisual({ kind }: { kind: HeroProofKind }) {
  if (kind === 'orders') {
    return (
      <svg viewBox="0 0 72 24" preserveAspectRatio="none">
        <rect x="3" y="14" width="8" height="7" rx="2" fill="currentColor" opacity="0.34" />
        <rect x="17" y="10" width="8" height="11" rx="2" fill="currentColor" opacity="0.52" />
        <rect x="31" y="5" width="8" height="16" rx="2" fill="currentColor" opacity="0.78" />
        <path d="M45 16h20m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'partnership') {
    return (
      <svg viewBox="0 0 72 24" preserveAspectRatio="none">
        <path d="M7 12h58" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.44" />
        <circle cx="8" cy="12" r="3" fill="currentColor" opacity="0.42" />
        <circle cx="36" cy="12" r="4" fill="currentColor" opacity="0.64" />
        <circle cx="64" cy="12" r="5" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 72 24" preserveAspectRatio="none">
      <path d="M2 21 16 17 28 18 42 10 54 12 70 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="42" cy="10" r="2.5" fill="currentColor" opacity="0.68" />
      <circle cx="70" cy="3" r="3" fill="currentColor" />
    </svg>
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
            srcSet={cldResponsiveSrcSet(mobile, 'mobile', 'best') || undefined}
            sizes="100vw"
          />
        )}
        <img
          src={cldWidth(desktop || mobile, 1920, 'best')}
          srcSet={cldResponsiveSrcSet(desktop || mobile, 'full', 'best')}
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
  const configuredMobileMp4 = block?.backgroundVideoMobileUrl?.trim()
  const configuredMobileWebm = block?.backgroundVideoMobileWebmUrl?.trim()
  return getAdaptiveHomepageVideoSources({
    mp4: block?.backgroundVideoUrl?.trim() || defaultClosingPortalSources.mp4,
    webm: block?.backgroundVideoWebmUrl?.trim() || defaultClosingPortalSources.webm,
    mobileMp4: !configuredMobileMp4 || configuredMobileMp4 === '/closing/closing-portal-1280.mp4'
      ? defaultClosingPortalSources.mobileMp4
      : configuredMobileMp4,
    mobileWebm: !configuredMobileWebm || configuredMobileWebm === '/closing/closing-portal-1280.webm'
      ? defaultClosingPortalSources.mobileWebm
      : configuredMobileWebm,
    poster: block?.backgroundVideoPoster?.trim() || defaultClosingPortalSources.poster,
    mobilePoster: block?.backgroundVideoMobilePoster?.trim() || block?.backgroundVideoPoster?.trim() || defaultClosingPortalSources.mobilePoster,
  })
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
    const deliveryWidth = getHomepageVideoDeliveryWidth(window.innerWidth, window.devicePixelRatio, mobile)
    const selected = mobile
      ? { mp4: sources.mobileMp4 || sources.mp4, webm: sources.mobileWebm || sources.webm, poster: sources.mobilePoster || sources.poster }
      : { mp4: sources.mp4, webm: sources.webm, poster: sources.poster || sources.mobilePoster }
    setActive({
      mp4: retargetCloudinaryVideoWidth(selected.mp4, deliveryWidth),
      webm: retargetCloudinaryVideoWidth(selected.webm, deliveryWidth),
      poster: selected.poster,
    })
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
          {sources.mobilePoster && (
            <source media="(max-width: 767px)" srcSet={sources.mobilePosterSrcSet || sources.mobilePoster} sizes="100vw" />
          )}
          <img
            src={sources.poster || sources.mobilePoster}
            srcSet={sources.posterSrcSet}
            sizes="100vw"
            alt=""
            className="closing-portal-poster"
          />
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
  // The homepage thumbnail field was removed from the editor — the first
  // hover-gallery image now auto-fills this role.
  const [thumbnail] = uniqueImageUrls([
    story.homepageGalleryImages?.[0],
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

type BannerSlide = { desktop: string; mobile?: string }

// Mobile crops are matched to the desktop gallery by array position, so slot 0
// of homepageGalleryImagesMobile pairs with slot 0 of homepageGalleryImages.
// Slides missing a mobile crop simply render their desktop image everywhere.
function getFeaturedBannerSlides(story: CaseStudy): BannerSlide[] {
  const media = getHomepageBannerMedia(story)
  const seen = new Set<string>()
  const slides: BannerSlide[] = []
  function push(desktop: string | undefined, mobile?: string) {
    const url = desktop?.trim()
    if (!url || seen.has(url)) return
    seen.add(url)
    slides.push({ desktop: url, mobile: mobile?.trim() || undefined })
  }
  push(media.desktop)
  ;(story.homepageGalleryImages ?? []).forEach((url, i) => push(url, story.homepageGalleryImagesMobile?.[i]))
  return (slides.length ? slides : [{ desktop: media.desktop }]).slice(0, 4)
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
            } ${activeImage === index ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/[0.18]" aria-hidden="true" />
        {images.length > 1 && (
          <div className="absolute bottom-3 left-4 flex gap-1.5" aria-hidden="true">
            {images.map((imageUrl, index) => (
              <span key={`${story.id}-dot-${imageUrl}-${index}`} className={`h-1.5 rounded-full transition-all ${activeImage === index ? 'w-5 bg-white' : 'w-1.5 bg-white/[0.55]'}`} />
            ))}
          </div>
        )}
      </div>
      <div className="relative m-3 mt-0 flex min-h-0 flex-1 flex-col rounded-[18px] border border-white/[0.65] bg-white/[0.88] p-4 shadow-[0_18px_44px_rgba(43,23,33,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.accent }}>{story.category}</p>
            <h3 className={`mt-2 line-clamp-2 text-[22px] font-extrabold leading-tight text-on-surface ${brandDisplayFontClass(story.brandName)}`}>{story.brandName}</h3>
          </div>
          <img src={getStoryLogoForHome(story)} alt="" aria-hidden="true" className="h-11 w-11 shrink-0 rounded-full border border-white bg-white object-contain p-1.5 shadow-[0_10px_28px_rgba(43,23,33,0.14)]" />
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-relaxed text-on-surface-variant">{story.shortDescription}</p>
        {stats.length > 0 && (
          <div className="mt-4 grid gap-1.5">
            {stats.map((stat) => (
              <span key={`${story.id}-preview-stat-${stat.value}-${stat.label}`} className="rounded-full bg-gradient-to-r from-primary/[0.12] via-tertiary/10 to-secondary/[0.12] px-3 py-1.5 text-xs font-black text-primary">
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
          className="mt-auto inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[#3d1226]/[0.12] bg-white/70 px-3.5 py-2 text-sm font-extrabold text-[#3d1226] shadow-[0_10px_24px_rgba(43,23,33,0.1)] transition hover:-translate-y-0.5 hover:bg-white"
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
  const [bannerSlide, setBannerSlide] = useState(0)
  // While a rail card is hovered/focused the banner locks onto that story and
  // loops its slides instead of handing off to the next brand.
  const [hoverLockIndex, setHoverLockIndex] = useState<number | null>(null)
  const [previewStory, setPreviewStory] = useState<StoryPreviewState | null>(null)
  const [canHover, setCanHover] = useState(false)
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

  const activeSlideCount = showcaseStories.length
    ? getFeaturedBannerSlides(showcaseStories[bannerIndex % showcaseStories.length]).length
    : 0

  // One ticker drives the banner "video": each tick shows the active story's
  // next slide; overflowing the slide set hands the banner to the next story.
  useEffect(() => {
    setBannerSlide(0)
  }, [bannerIndex])

  useEffect(() => {
    if (!showcaseStories.length || reducedMotion || !pageVisible) return
    if (showcaseStories.length < 2 && activeSlideCount < 2) return
    const interval = window.setInterval(() => {
      setBannerSlide((slide) => slide + 1)
    }, 3000)
    return () => window.clearInterval(interval)
  }, [activeSlideCount, pageVisible, reducedMotion, showcaseStories.length])

  useEffect(() => {
    if (!showcaseStories.length || bannerSlide < activeSlideCount) return
    setBannerSlide(0)
    // Slides never stop; hover lock and recent taps only keep the banner
    // looping the current story instead of handing off to the next brand.
    if (hoverLockIndex === null && Date.now() >= pauseUntilRef.current) {
      setBannerIndex((index) => (index + 1) % showcaseStories.length)
    }
  }, [activeSlideCount, bannerSlide, hoverLockIndex, showcaseStories.length])

  useEffect(() => {
    const rail = railRef.current
    // Never auto-scroll the rail while the user is hovering a card — the card
    // would slide away from under the cursor.
    if (hoverLockIndex !== null) return
    const activeId = showcaseStories[bannerIndex % Math.max(1, showcaseStories.length)]?.id
    if (!rail || !activeId) return
    const activeCard = rail.querySelector<HTMLElement>(`[data-story-id="${CSS.escape(activeId)}"]`)
    if (!activeCard) return
    const left = activeCard.offsetLeft - (rail.clientWidth - activeCard.offsetWidth) / 2
    rail.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [bannerIndex, hoverLockIndex, reducedMotion, showcaseStories])

  if (!showcaseStories.length) return null

  const activeBannerIndex = bannerIndex % showcaseStories.length
  const activeStory = showcaseStories[activeBannerIndex] ?? showcaseStories[0]
  const activeStoryHref = resolveStoryHref(lang, activeStory.id, activeStory.id)
  const activeStats = getFeaturedStats(activeStory)
  const allStoriesHref = localizedPath(lang, '/the-one')
  const featuredContextLabel = block?.subtitle?.trim() || (lang === 'vi' ? 'Khach hang dang dong hanh cung The One' : 'Clients growing with The One')
  const allStoriesLabel = lang === 'vi' ? 'Xem tất cả stories' : 'View all stories'
  const featuredCopyBaseMs = openingBaseMs + 320
  const featuredTitleDoneMs = featuredCopyBaseMs + 160 + Math.max(0, countStaggerWords(activeStory.brandName) - 1) * 70 + 420
  const featuredCaptionMs = featuredTitleDoneMs + 70
  const featuredStatsMs = featuredCaptionMs + 130
  const featuredRailMs = featuredStatsMs + activeStats.length * 80 + 180

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
      data-reveal-scene
      data-home-tone="light"
      className="home-tone-zone home-section-pad home-section-pad--featured relative overflow-hidden px-5 lg:px-10"
      onMouseLeave={closePreviewSoon}
      onPointerDown={() => pauseAuto(12000)}
    >
      {/* Round 7 A2.1: warm bridge from the video's bottom tone into the shared wave background */}
      <div
        aria-hidden="true"
        className="featured-top-bridge pointer-events-none absolute inset-x-0 top-0 h-[180px]"
      />
      <div className="relative mx-auto max-w-6xl">
        {/* Round 12 A2.2: the banner + thumbnail strip join the hero opening cascade —
            banner +200ms after the CTA, then tiles left→right (80ms/tile). useScrollReveal
            strips --rd outside the opening window (reload mid-page, scroll back). */}
        <div className="relative">
          {/* Round 8 A2.1: ambient glow — a blurred copy of the active slide bleeds its colors into the wave */}
          <div aria-hidden="true" className="pointer-events-none absolute -inset-2 md:-inset-4">
            <img
              key={`${activeStory.id}-glow`}
              src={cldWidth(getHomepageBannerMedia(activeStory).desktop, 640)}
              alt=""
              loading="lazy"
              className="featured-banner-ambient absolute inset-0 h-full w-full scale-[1.03] object-cover saturate-[1.2] transition-opacity duration-700"
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
          <div
            className="featured-banner-media pointer-events-none absolute inset-0"
            data-reveal="scale"
            data-reveal-phase="0"
            data-reveal-open
            style={{ '--rd': `${openingBaseMs}ms` } as CSSProperties}
          >
            {showcaseStories.map((story, index) => {
              if (cyclicDistance(index, activeBannerIndex, showcaseStories.length) > 1) return null
              const media = getHomepageBannerMedia(story)
              const storyActive = index === activeBannerIndex
              // Inactive stories keep only their opening slide mounted for the crossfade hand-off.
              const slides = storyActive ? getFeaturedBannerSlides(story) : getFeaturedBannerSlides(story).slice(0, 1)
              const safeSlide = bannerSlide < slides.length ? bannerSlide : 0
              return slides.map((slide, slideIndex) => {
                const isMainSlide = slide.desktop === media.desktop
                const visible = storyActive && slideIndex === safeSlide
                if (isMainSlide) {
                  return (
                    <picture key={`${story.id}-banner-${index}-${slideIndex}`}>
                      <source
                        media="(max-width: 767px)"
                        srcSet={cldResponsiveSrcSet(media.mobile, 'mobile', 'best')}
                        sizes="100vw"
                      />
                      <img
                        src={cldWidth(slide.desktop, 1920, 'best')}
                        srcSet={cldResponsiveSrcSet(slide.desktop, 'full', 'best')}
                        sizes="(min-width: 1280px) 1152px, 96vw"
                        alt={visible ? `${story.brandName} case study` : ''}
                        aria-hidden={visible ? undefined : true}
                        loading="lazy"
                        decoding="async"
                        className={`featured-banner-role-image absolute inset-0 h-full w-full transition duration-700 group-hover:scale-[1.025] ${
                          isLogoLikeImage(slide.desktop) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffd8e8)] object-contain p-12 md:p-20' : 'object-cover'
                        } ${visible ? 'banner-slide-active opacity-100' : 'opacity-0'}`}
                        style={{
                          '--featured-banner-position': media.desktopPosition,
                          '--featured-banner-position-mobile': media.mobilePosition,
                        } as CSSProperties}
                      />
                    </picture>
                  )
                }
                // Gallery slides keep the whole upload visible: object-contain
                // letterboxes over a blurred copy. A dedicated 4:3 mobile crop
                // (when uploaded) swaps in below 768px and fills edge-to-edge
                // since it already matches the mobile banner's aspect ratio.
                return (
                  <div
                    key={`${story.id}-banner-${index}-${slideIndex}`}
                    aria-hidden={visible ? undefined : true}
                    className={`absolute inset-0 transition duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <img
                      src={cldWidth(slide.desktop, 480)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl saturate-[1.15]"
                    />
                    <picture>
                      {slide.mobile && (
                        <source media="(max-width: 767px)" srcSet={cldResponsiveSrcSet(slide.mobile, 'mobile', 'best')} sizes="100vw" />
                      )}
                      <img
                        src={cldWidth(slide.desktop, 1920, 'best')}
                        srcSet={cldResponsiveSrcSet(slide.desktop, 'full', 'best')}
                        sizes="(min-width: 1280px) 1152px, 96vw"
                        alt={visible ? `${story.brandName} case study` : ''}
                        loading="lazy"
                        decoding="async"
                        className={`relative h-full w-full object-contain ${visible ? 'banner-slide-active' : ''}`}
                      />
                    </picture>
                  </div>
                )
              })
            })}
            <div className="featured-banner-scrim absolute inset-0" aria-hidden="true" />
          </div>
          <div className="featured-banner-copy pointer-events-none absolute inset-x-0 bottom-0 text-white">
            <p data-reveal="soft" data-reveal-phase="1" data-reveal-open style={{ '--rd': `${featuredCopyBaseMs}ms` } as CSSProperties} className="featured-banner-context mb-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]">{featuredContextLabel}</p>
            <p data-reveal="soft" data-reveal-phase="1" data-reveal-open style={{ '--rd': `${featuredCopyBaseMs + 80}ms` } as CSSProperties} className="featured-banner-kicker font-extrabold uppercase">Featured case</p>
            <h2 key={`${activeStory.id}-featured-title`} aria-label={activeStory.brandName} data-reveal="words" data-reveal-phase="1" data-reveal-open style={{ '--rd': `${featuredCopyBaseMs + 160}ms` } as CSSProperties} className={`featured-banner-title mt-2 max-w-2xl font-extrabold leading-tight ${brandDisplayFontClass(activeStory.brandName)}`}>
              <RevealWords text={activeStory.brandName} includeScreenReaderText={false} />
            </h2>
            <p data-reveal="soft" data-reveal-phase="1" data-reveal-open style={{ '--rd': `${featuredCaptionMs}ms` } as CSSProperties} className="featured-banner-caption mt-2 max-w-2xl font-semibold leading-relaxed">{activeStory.caption || activeStory.shortDescription}</p>
            {activeStats.length > 0 && (
              <div className="featured-banner-stats mt-4 flex flex-wrap gap-2">
                {activeStats.map((stat, statIndex) => (
                  <span key={`${activeStory.id}-banner-stat-${stat.value}-${stat.label}`} data-reveal="soft" data-reveal-phase="1" data-reveal-open style={{ '--ri': statIndex, '--rd': `${featuredStatsMs + statIndex * 80}ms` } as CSSProperties} className="featured-banner-stat rounded-full px-3 py-1.5 text-xs font-black shadow-[0_10px_26px_rgba(0,0,0,0.16)]">
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
                className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Previous case studies"
              >
                <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => moveRail(1)}
                className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
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
                data-reveal-phase="2"
                data-tile-direction={index % 2 ? 'right' : 'bottom'}
                data-reveal-open
                style={{ '--ri': index, '--rd': `${featuredRailMs}ms` } as CSSProperties}
                onMouseEnter={(event) => {
                  setHoverLockIndex(index)
                  setBannerIndex(index)
                  showPreview(story, event.currentTarget)
                }}
                onFocus={(event) => {
                  setHoverLockIndex(index)
                  setBannerIndex(index)
                  showPreview(story, event.currentTarget)
                }}
                onMouseLeave={() => {
                  setHoverLockIndex(null)
                  closePreviewSoon()
                }}
                onBlur={() => setHoverLockIndex(null)}
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
                    <h3 className={`line-clamp-1 text-[14px] font-extrabold leading-tight text-[#3d1226] md:text-[15px] ${brandDisplayFontClass(story.brandName)}`}>{story.brandName}</h3>
                    <p className="line-clamp-1 text-xs font-semibold leading-snug text-on-surface-variant">{story.headline}</p>
                  </span>
                </span>
              </a>
            ))}
            <a
              href={allStoriesHref}
              data-reveal="tile-in"
              data-reveal-phase="3"
              data-tile-direction="right"
              data-reveal-open
              style={{ '--ri': showcaseStories.length, '--rd': `${featuredRailMs}ms` } as CSSProperties}
              className="group featured-ghost-card glass-panel glass-panel--strong relative flex shrink-0 basis-[42vw] snap-start flex-col items-center justify-center gap-3 rounded-[18px] p-5 text-center outline-none transition duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:basis-[calc((100%_-_8px)/2.25)] md:basis-[calc((100%_-_16px)/3)] lg:basis-[calc((100%_-_24px)/4)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] transition-transform group-hover:translate-x-1">
                <ArrowUpRight size={19} strokeWidth={2.7} aria-hidden="true" />
              </span>
              <span className="text-sm font-black text-[#3d1226]">{allStoriesLabel}</span>
            </a>
          </div>
          <div className="mt-2 flex items-center justify-end gap-3">
            <a href={allStoriesHref} data-reveal="soft" data-reveal-phase="3" data-reveal-open style={{ '--rd': `${featuredRailMs + 180}ms` } as CSSProperties} className="inline-flex items-center gap-1.5 text-sm font-black text-primary transition hover:text-primary/70">
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
  const headingRevealDelay = countStaggerWords(block.heading || 'Sounds familiar?') * 70 + 240

  return (
    <section
      data-reveal-scene
      data-home-tone="rose"
      data-testid="red-flags-stage"
      className="red-flags-stage home-tone-zone home-section-pad px-5 lg:px-10"
    >
      <div className="red-flags-stage-motion" aria-hidden="true">
        <span className="red-flags-stage-aurora" />
        <span className="red-flags-stage-signal" />
      </div>
      <div className="red-flags-stage-content mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-start lg:gap-12">
        <div className="red-flags-stage-intro lg:sticky lg:top-28">
          <p data-reveal="soft" data-reveal-phase="0" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1226]/[0.55]">Red flags</p>
          <h2 data-reveal="words" data-reveal-phase="0" className="mt-3 font-serif text-[38px] font-normal leading-[0.98] text-[#3d1226] md:text-[52px]">
            <RevealWords text={block.heading || 'Sounds familiar?'} />
          </h2>
          {/* Desktop only: punchline + CTA live here; on mobile they close the feed below. */}
          <div className="hidden lg:block">
            <p data-reveal="words" data-reveal-phase="3" style={{ '--rd': `${headingRevealDelay + 360}ms` } as CSSProperties} className="mt-6 max-w-sm bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[26px] font-black leading-tight text-transparent xl:text-[32px]">
              <RevealWords text={punchline} />
            </p>
            <div data-reveal="soft" data-reveal-phase="3" style={{ '--rd': `${headingRevealDelay + 520}ms` } as CSSProperties}>
              <button
                type="button"
                onClick={openBookingModal}
                className="booking-cta-enhanced btn-shine cta-idle mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] hover:opacity-95"
              >
                <BookingCtaContent />
              </button>
            </div>
          </div>
        </div>

        <div className="red-flags-feed glass-panel quiet-zone relative w-full p-5 md:p-6">
          <div className="thread-line" aria-hidden="true" />

          <article data-reveal="tile-in" data-reveal-phase="1" data-tile-direction="bottom" style={{ '--ri': 0, '--rd': `${headingRevealDelay}ms` } as CSSProperties} className="relative grid grid-cols-[40px_1fr] gap-3">
            <img src="/avatars/logo-gg.png" alt="" aria-hidden="true" className="relative z-10 h-10 w-10 rounded-full border border-white/80 bg-white object-contain p-1 shadow-sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-extrabold text-[#3d1226]">{postHandle}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary">{postTopic}</span>
                <span className="text-xs font-semibold text-[#3d1226]/[0.45]">17h</span>
              </div>
              <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-[#3d1226]">{postText}</p>
              <div className="mt-3 flex items-center gap-5 text-[#3d1226]/[0.55]" aria-hidden="true">
                <span className="flex items-center gap-1.5 text-xs font-bold"><Heart size={17} strokeWidth={2.2} /> 512</span>
                <span className="flex items-center gap-1.5 text-xs font-bold"><MessageCircle size={17} strokeWidth={2.2} /> {items.length}</span>
                <Repeat2 size={17} strokeWidth={2.2} />
                <Send size={16} strokeWidth={2.2} />
              </div>
            </div>
          </article>

          <div data-reveal="tile-in" data-reveal-phase="2" data-tile-direction="bottom" style={{ '--ri': 1, '--rd': `${headingRevealDelay + 160}ms` } as CSSProperties} className="relative mt-5 grid grid-cols-[40px_1fr] gap-3" aria-hidden="true">
            <span />
            <span className="flex h-6 items-center gap-1">
              <span className="thread-typing-dot" />
              <span className="thread-typing-dot" />
              <span className="thread-typing-dot" />
            </span>
          </div>

          <div id="red-flags-replies" className="red-flags-replies">
            {items.map((item, index) => (
              <article
                key={`${item.handle || item.title}-${index}`}
                data-testid="red-flag-reply"
                data-reveal="tile-in"
                data-reveal-phase="2"
                data-tile-direction="bottom"
                style={{ '--ri': index + 2, '--rd': `${headingRevealDelay + 220}ms` } as CSSProperties}
                className={`relative mt-5 grid-cols-[40px_1fr] gap-3 ${
                  index >= mobileVisibleCount && !showAllReplies ? 'hidden lg:grid' : 'grid'
                }`}
              >
                <ThreadAvatar item={item} index={index} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-extrabold text-[#3d1226]">{item.handle?.trim() || item.title}</span>
                    {item.roleLabel?.trim() && <span className="text-xs font-semibold text-[#3d1226]/50">· {item.roleLabel}</span>}
                    <span className="text-xs font-semibold text-[#3d1226]/[0.45]">{Math.max(1, 16 - index * 2)}h</span>
                  </div>
                  <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-[#3d1226]/90">{item.body?.trim() || item.title}</p>
                  {item.likes?.trim() && (
                    <span className="mt-2 flex w-fit items-center gap-1.5 text-xs font-bold text-[#3d1226]/[0.55]" aria-hidden="true">
                      <Heart size={15} strokeWidth={2.2} /> {item.likes}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>

          {hasHiddenMobileReplies && (
            <button
              type="button"
              onClick={() => setShowAllReplies((current) => !current)}
              aria-expanded={showAllReplies}
              aria-controls="red-flags-replies"
              className="relative mt-4 ml-[52px] inline-flex items-center gap-1 text-xs font-extrabold text-primary transition-colors hover:text-primary/70 lg:hidden"
            >
              {showAllReplies ? 'Show fewer replies' : `Show ${items.length - mobileVisibleCount} more replies`}
            </button>
          )}

          {/* Mobile only: the punchline closes the feed (desktop shows it in the left column). */}
          <article data-reveal="tile-in" data-reveal-phase="3" data-tile-direction="bottom" style={{ '--ri': punchlineIndex, '--rd': `${headingRevealDelay + 360}ms` } as CSSProperties} className="relative mt-6 grid grid-cols-[40px_1fr] gap-3 lg:hidden">
            <img src="/avatars/logo-gg.png" alt="" aria-hidden="true" className="relative z-10 h-10 w-10 rounded-full border border-white/80 bg-white object-contain p-1 shadow-sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-extrabold text-[#3d1226]">{postHandle}</span>
                <span className="text-xs font-semibold text-[#3d1226]/[0.45]">now</span>
              </div>
              <p className="mt-2 bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[22px] font-black leading-tight text-transparent md:text-[30px]">
                {punchline}
              </p>
              <button
                type="button"
                onClick={openBookingModal}
                className="booking-cta-enhanced btn-shine cta-idle mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] hover:opacity-95"
              >
                <BookingCtaContent />
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

// Mobile avatar crops are matched to the avatar carousel by array position,
// same convention as getFeaturedBannerSlides.
function getPeopleBannerSlides(member: CmsBlockItem): BannerSlide[] {
  const avatars = getPeopleAvatarImages(member)
  const avatarsMobile = member.avatarImagesMobile ?? []
  const seen = new Set<string>()
  const slides: BannerSlide[] = []
  function push(desktop: string | undefined, mobile?: string) {
    const url = desktop?.trim()
    if (!url || seen.has(url)) return
    seen.add(url)
    slides.push({ desktop: url, mobile: mobile?.trim() || undefined })
  }
  push(member.bannerImageUrl)
  avatars.forEach((url, i) => push(url, avatarsMobile[i]))
  return slides.slice(0, 5)
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
  const [bannerSlide, setBannerSlide] = useState(0)
  // While a member card is hovered/focused the banner locks onto that member
  // and loops their avatar slides instead of advancing to the next person.
  const [hoverLockIndex, setHoverLockIndex] = useState<number | null>(null)
  const [previewMember, setPreviewMember] = useState<{ member: CmsBlockItem; style: CSSProperties } | null>(null)
  const [canHover, setCanHover] = useState(false)
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

  const activeSlideCount = hasPeople ? getPeopleBannerSlides(members[activeIndex % members.length] ?? members[0]).length : 0
  // Slides split the member's autoSlideSeconds window, but never flip faster than 3s.
  const slideDurationMs = Math.max(3000, (autoSlideSeconds * 1000) / Math.max(1, activeSlideCount))

  useEffect(() => {
    setBannerSlide(0)
  }, [activeIndex])

  useEffect(() => {
    if (!hasPeople || reducedMotion || !pageVisible) return
    if (members.length < 2 && activeSlideCount < 2) return
    const interval = window.setInterval(() => {
      setBannerSlide((slide) => slide + 1)
    }, slideDurationMs)
    return () => window.clearInterval(interval)
  }, [activeSlideCount, hasPeople, members.length, pageVisible, reducedMotion, slideDurationMs])

  useEffect(() => {
    if (!hasPeople || bannerSlide < activeSlideCount) return
    setBannerSlide(0)
    // Slides never stop; hover lock and recent taps only keep the banner
    // looping the current member instead of advancing to the next person.
    if (hoverLockIndex === null && Date.now() >= pauseUntilRef.current) {
      setActiveIndex((index) => (index + 1) % members.length)
    }
  }, [activeSlideCount, bannerSlide, hasPeople, hoverLockIndex, members.length])

  useEffect(() => {
    const rail = railRef.current
    // Never auto-scroll the rail while the user is hovering a card.
    if (hoverLockIndex !== null) return
    const member = members[activeIndex % Math.max(1, members.length)]
    if (!rail || !member) return
    const activeCard = rail.querySelector<HTMLElement>(`[data-person-index="${activeIndex % members.length}"]`)
    if (!activeCard) return
    const left = activeCard.offsetLeft - (rail.clientWidth - activeCard.offsetWidth) / 2
    rail.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [activeIndex, hoverLockIndex, members, reducedMotion])

  if (!block || !members.length) return null

  const closingLine1 = block.closingLine1 || 'We quit our 9-5 and started our own business.'
  const closingLine2 = block.closingLine2 || "Isn't it your turn now?"
  const activeMember = members[activeIndex % members.length] ?? members[0]
  const activeRoles = splitPeopleRoles(activeMember.label)
  const activeBanner = activeMember.bannerImageUrl || getPeopleAvatarImages(activeMember)[0] || '/logo-gg.png'
  const activeMobileBanner = activeMember.bannerImageMobileUrl || activeMember.bannerImageUrl || getPeopleAvatarImages(activeMember)[0] || activeBanner
  const activeBannerIsPlaceholder = isLogoLikeImage(activeBanner)
  const peopleTitle = block.heading || 'The One People'
  const peopleQuote = block.body?.trim().replace(/^["“‘']+/, '').replace(/["”’']+$/, '')
  const peopleHeaderDelay = countStaggerWords(peopleTitle) * 70 + 240
  const peopleQuoteDelay = peopleQuote ? countStaggerWords(peopleQuote) * 70 + 320 : 0
  const peopleBannerDelay = peopleHeaderDelay + peopleQuoteDelay

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
      data-reveal-scene
      data-home-tone="dark"
      className="home-tone-zone home-section-pad px-5 lg:px-10"
      onMouseLeave={closeMemberPreviewSoon}
      onPointerDown={() => pauseAuto(12000)}
    >
      <div className="mx-auto max-w-6xl">
        {/* Round 12 A5: the CMS body ("Teamwork makes the dream work.") renders as an editorial pull-quote */}
        <SectionHeader
          title={peopleTitle}
          quote={peopleQuote}
          align="left"
          perWord
          dark
        />
        <div className="people-feature-banner group relative aspect-[16/9] overflow-hidden rounded-[24px] bg-[#190b12] text-white shadow-[0_24px_70px_rgba(80,20,50,0.16)] ring-1 ring-white/70">
          <div data-reveal="scale" data-reveal-phase="1" style={{ '--rd': `${peopleBannerDelay}ms` } as CSSProperties} className="absolute inset-0">
            {activeBannerIsPlaceholder ? (
              <div className="people-typographic-banner absolute inset-0 flex items-center justify-center px-8 text-center" aria-hidden="true">
                <span>{getPersonInitials(activeMember.title)}</span>
              </div>
            ) : (
              getPeopleBannerSlides(activeMember).map((slide, slideIndex, slides) => {
                const isMainSlide = slide.desktop === activeBanner
                const visible = slideIndex === (bannerSlide < slides.length ? bannerSlide : 0)
                if (isMainSlide) {
                  return (
                    <picture key={`${activeMember.title}-banner-slide-${slideIndex}`}>
                      <source media="(max-width: 767px)" srcSet={cldResponsiveSrcSet(activeMobileBanner, 'mobile', 'best')} sizes="100vw" />
                      <img
                        src={cldWidth(slide.desktop, 1920, 'best')}
                        srcSet={cldResponsiveSrcSet(slide.desktop, 'full', 'best')}
                        sizes="(min-width: 1280px) 1152px, 96vw"
                        decoding="async"
                        alt={visible ? `${activeMember.title} banner` : ''}
                        aria-hidden={visible ? undefined : true}
                        className={`people-banner-image absolute inset-0 h-full w-full object-cover transition duration-700 ${visible ? 'banner-slide-active opacity-100' : 'opacity-0'}`}
                        style={{
                          '--people-banner-position': normalizeObjectPosition(activeMember.bannerImagePosition),
                          '--people-banner-position-mobile': normalizeObjectPosition(activeMember.bannerImageMobilePosition, normalizeObjectPosition(activeMember.bannerImagePosition)),
                        } as CSSProperties}
                      />
                    </picture>
                  )
                }
                // Avatar slides show the full uploaded frame, letterboxed over a
                // blurred fill. A dedicated 4:3 mobile crop (when uploaded) swaps
                // in below 768px and fills edge-to-edge with no letterbox.
                return (
                  <div
                    key={`${activeMember.title}-banner-slide-${slideIndex}`}
                    aria-hidden={visible ? undefined : true}
                    className={`absolute inset-0 transition duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <img
                      src={cldWidth(slide.desktop, 480)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl saturate-[1.15]"
                    />
                    <picture>
                      {slide.mobile && (
                        <source media="(max-width: 767px)" srcSet={cldResponsiveSrcSet(slide.mobile, 'mobile', 'best')} sizes="100vw" />
                      )}
                      <img
                        src={cldWidth(slide.desktop, 1920, 'best')}
                        srcSet={cldResponsiveSrcSet(slide.desktop, 'full', 'best')}
                        sizes="(min-width: 1280px) 1152px, 96vw"
                        decoding="async"
                        alt={visible ? `${activeMember.title} banner` : ''}
                        className={`relative h-full w-full object-contain ${visible ? 'banner-slide-active' : ''}`}
                      />
                    </picture>
                  </div>
                )
              })
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/[0.72] via-black/20 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8" style={{ '--rd': `${peopleBannerDelay + 360}ms` } as CSSProperties}>
            <p data-reveal="soft" data-reveal-phase="1" className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/[0.68]">The One People</p>
            <h3 key={`${activeMember.title}-people-title`} aria-label={activeMember.title} data-reveal="words" data-reveal-phase="1" className="mt-2 max-w-2xl text-[30px] font-extrabold leading-tight md:text-[48px]">
              <RevealWords text={activeMember.title} includeScreenReaderText={false} />
            </h3>
            {activeRoles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeRoles.slice(0, 4).map((role) => (
                  <span key={`${activeMember.title}-${role}`} data-reveal="soft" data-reveal-phase="1" className="rounded-full border border-white/30 bg-black/[0.35] px-3 py-1.5 text-xs font-black text-white">
                    {role}
                  </span>
                ))}
              </div>
            )}
            {activeMember.body && <p data-reveal="soft" data-reveal-phase="1" className="mt-3 max-w-2xl text-sm font-semibold italic leading-relaxed text-white/80 md:text-base">{formatPeopleQuote(activeMember.body)}</p>}
          </div>
        </div>
        <div className="relative mt-3">
          {members.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveRail(-1)}
                className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
                aria-label="Previous people"
              >
                <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => moveRail(1)}
                className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-on-surface shadow-[0_16px_36px_rgba(80,20,50,0.2)] transition hover:bg-primary hover:text-white md:inline-flex"
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
                data-reveal-phase="2"
                type="button"
                onMouseEnter={(event) => {
                  setHoverLockIndex(index)
                  setActiveIndex(index)
                  showMemberPreview(member, event.currentTarget)
                }}
                onMouseLeave={() => {
                  setHoverLockIndex(null)
                  closeMemberPreviewSoon()
                }}
                onFocus={(event) => {
                  setHoverLockIndex(index)
                  setActiveIndex(index)
                  showMemberPreview(member, event.currentTarget)
                }}
                onBlur={() => setHoverLockIndex(null)}
                onClick={() => {
                  pauseAuto(12000)
                  setActiveIndex(index)
                }}
                style={{ '--ri': index, '--rd': `${peopleBannerDelay + 900}ms` } as CSSProperties}
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
                <div className={`absolute inset-0 bg-gradient-to-t ${active ? 'from-black/[0.82] via-black/[0.18] to-transparent' : 'from-white/[0.88] via-white/[0.46] to-white/[0.12] group-hover:from-black/[0.76] group-hover:via-black/[0.12] group-hover:to-transparent'}`} aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className={`line-clamp-1 text-[17px] font-extrabold leading-tight ${active ? 'text-white' : 'text-on-surface group-hover:text-white'}`}>{member.title}</h3>
                </div>
              </button>
            )
          })}
          </div>
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
                  <div className="m-3 mt-0 rounded-[18px] border border-primary/10 bg-white/[0.88] p-4">
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
          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p data-reveal="soft" data-reveal-phase="3" style={{ '--rd': `${peopleBannerDelay + 620}ms` } as CSSProperties} className="home-people-closing-one text-[24px] italic leading-tight text-white/[0.85] md:text-[28px]">{closingLine1}</p>
            {/* Gradient text lives on a static inner span: clipping it on the reveal-animated
                block leaves a stray background stripe on Windows at 100% zoom (DPR 1). */}
            <p data-reveal="soft" data-reveal-phase="3" style={{ '--ri': 1, '--rd': `${peopleBannerDelay + 720}ms` } as CSSProperties} className="home-people-closing-two mt-3 text-[28px] font-semibold leading-tight md:text-[44px]">
              <span className="bg-gradient-to-r from-[#ffd6e6] via-[#ff9dbd] to-[#ffbd78] bg-clip-text text-transparent [backface-visibility:hidden] [transform:translateZ(0)]">
                {closingLine2}
              </span>
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
  // Round 7 A5: no solid gradient background and no logo marquee — glass items float
  // directly on the shared aurora + wave background.
  return (
    <>
      <section data-reveal-scene data-home-tone="night" className="home-tone-zone closing-section home-section-pad px-5 lg:px-10">
        <div
          className="closing-content quiet-zone quiet-zone--faq relative mx-auto w-full max-w-[880px]"
          data-reveal="closing-content"
          data-reveal-phase="0"
          style={{
            '--closing-follow-up-delay': `${faqItems.length * 80 + 100}ms`,
            '--closing-heading-up-delay': `${faqItems.length * 80 + 200}ms`,
          } as CSSProperties}
        >
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
                    style={{
                      '--ri': index,
                      '--closing-delay': `${closingFollowDelay + 140 + index * 80}ms`,
                      '--closing-delay-up': `${(faqItems.length - index - 1) * 80}ms`,
                    } as CSSProperties}
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
        <section className="closing-portal-section" data-reveal-scene data-home-tone="night">
          <div className="closing-portal-media-stage" data-reveal="closing-portal" data-reveal-phase="0">
            <ClosingPortalVideo sources={portalSources} />
            <div className="closing-portal-scrim" aria-hidden="true" />
          </div>
          <div className="closing-portal-copy">
            <p className="closing-portal-line-one" data-reveal="soft" data-reveal-phase="1">{line1}</p>
            <h2 className="closing-portal-line-two" data-reveal="words" data-reveal-phase="1">
              <RevealWords text={line2} />
            </h2>
          </div>
          <div className="closing-portal-cta" data-reveal="soft" data-reveal-phase="2" style={{ '--rd': '520ms' } as CSSProperties}>
            <p>{prefooterLine}</p>
            <button
              type="button"
              onClick={() => openBookingModal('closing-video')}
              className="booking-cta-enhanced btn-shine cta-idle inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-8 py-4 text-[16px] font-extrabold text-white shadow-[0_18px_44px_rgba(219,39,119,0.28)] hover:opacity-95 md:px-11 md:py-[18px] md:text-[18px]"
            >
              <BookingCtaContent showNote />
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
  const heroVideoSources = getAdaptiveHomepageVideoSources({
    mp4: heroBlock?.backgroundVideoUrl?.trim() || undefined,
    webm: heroBlock?.backgroundVideoWebmUrl?.trim() || undefined,
    mobileMp4: heroBlock?.backgroundVideoMobileUrl?.trim() || undefined,
    mobileWebm: heroBlock?.backgroundVideoMobileWebmUrl?.trim() || undefined,
    poster: heroBlock?.backgroundVideoPoster?.trim() || undefined,
    mobilePoster: heroBlock?.backgroundVideoMobilePoster?.trim() || heroBlock?.backgroundVideoPoster?.trim() || undefined,
  })
  const heroHasVideo = Boolean(heroVideoSources.mp4 || heroVideoSources.webm)
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
  const packagesTitle = packagesBlock?.heading || 'The One Packages'
  const packagesHeaderDelay = countStaggerWords(packagesTitle) * 70 + 240
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
      resolveNavHref={(href, label) => (href === '/#packages' || label.toLowerCase().includes('packages') ? '#packages' : href)}
    >
      <SeoHead meta={homeMeta} schema={homeSchemas} lang={lang} />
      {flowWaveActive && <FlowWaveBackground settings={homeBackground} />}

      <section
        data-reveal-scene
        data-home-tone="hero"
        className={`home-hero relative flex overflow-hidden ${
          heroHasVideo ? 'home-hero--video items-center' : 'home-hero--static items-center'
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
            className="pointer-events-none absolute left-1/2 top-[6%] h-[58%] w-[min(980px,96vw)] -translate-x-1/2"
            style={{ background: 'radial-gradient(closest-side, rgba(40,10,25,0.34), transparent 100%)' }}
          />
        )}
        {heroHasOwnBackground && (
          <>
            <div className="absolute inset-0 tech-grid opacity-35 pointer-events-none" aria-hidden="true" />
            <div className="noise-overlay" aria-hidden="true" />
            {!heroHasVideo && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-surface-container" aria-hidden="true" />
            )}
          </>
        )}
        <div
          className={`home-hero-copy--centered relative mx-auto flex w-full max-w-5xl flex-col items-center px-5 text-center lg:px-10 ${
            heroHasVideo ? 'home-hero-copy home-hero-copy--video' : 'home-hero-copy home-hero-copy--static justify-center'
          }`}
        >
          <h1
            data-reveal="hero-words"
            data-reveal-phase="0"
            data-reveal-open
            className={[
              'hero-word-title home-hero-title-serif text-[clamp(30px,9vw,48px)] font-normal not-italic leading-[0.98] md:text-[clamp(54px,6vw,86px)]',
              heroTextMode === 'gradient' ? 'gg-grad-text' : heroTextMode === 'dark' ? 'text-on-surface' : 'text-white',
            ].join(' ')}
          >
            <HeroWordTitle text={heroLineOne} className="inline" nowrap={isDefaultHeroTitle} />
          </h1>
          {showHeroDivider && (
            <div
              data-reveal="line"
              data-reveal-phase="1"
              data-reveal-open
              className={`home-hero-divider mt-5 h-px ${heroTextMode === 'dark' ? 'bg-on-surface/25' : 'bg-white/[0.45]'}`}
              style={{ '--hero-delay': `${heroDelays.divider}ms`, '--rd': `${heroDelays.divider}ms` } as CSSProperties}
              aria-hidden="true"
            />
          )}
          <p
            data-reveal="soft"
            data-reveal-phase="2"
            data-reveal-open
            style={{ '--hero-delay': `${heroDelays.subline}ms`, '--rd': `${heroDelays.subline}ms` } as CSSProperties}
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
            data-reveal="soft"
            data-reveal-phase="3"
            data-reveal-open
            style={{ '--hero-delay': `${heroDelays.cta}ms`, '--rd': `${heroDelays.cta}ms` } as CSSProperties}
            className="home-hero-item booking-cta-enhanced btn-shine cta-idle mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-7 py-3.5 font-bold text-white shadow-[0_16px_36px_rgba(219,39,119,0.28)] hover:opacity-95"
          >
            <BookingCtaContent showNote />
          </button>
          {/* Round 8 A1: ctaSubtext slot removed from the DOM entirely (field stays dormant in CMS). */}
          {showHeroStatChips && (
            <ul className="home-hero-stat-chips home-hero-proof-list mt-5" aria-label="Selected client outcomes">
              {heroStatChips.map((chip, chipIndex) => {
                const proofKind = resolveHeroProofKind(chip, chipIndex)
                return (
                  <li
                    key={`${chip.value}-${chip.label}`}
                    data-reveal="soft"
                    data-reveal-phase="4"
                    data-reveal-open
                    data-proof-kind={proofKind}
                    style={{
                      '--hero-delay': `${heroDelays.cta + 230 + chipIndex * 90}ms`,
                      '--rd': `${heroDelays.cta + 230 + chipIndex * 90}ms`,
                    } as CSSProperties}
                    className={`home-hero-item home-hero-stat-chip home-hero-proof-card ${
                      heroTextMode === 'dark' ? 'is-on-light' : 'is-on-dark'
                    }`}
                  >
                    <span className="home-hero-proof-icon" aria-hidden="true">
                      <HeroProofIcon kind={proofKind} />
                    </span>
                    <span className="home-hero-proof-copy">
                      <strong className="home-hero-proof-value">{chip.value}</strong>
                      {chip.label && <span className="home-hero-proof-label">{chip.label}</span>}
                    </span>
                    <span className="home-hero-proof-visual" aria-hidden="true">
                      <HeroProofMicrovisual kind={proofKind} />
                    </span>
                  </li>
                )
              })}
            </ul>
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

      <section
        id="packages"
        data-reveal-scene
        data-reveal-once
        data-reveal-step-ms="100"
        data-home-tone="dark"
        className="packages-section home-tone-zone"
      >
        <div className="packages-section-inner mx-auto">
          <SectionHeader
            eyebrow={packagesBlock?.eyebrow?.trim() || 'PRICING'}
            title={packagesTitle}
            intro={packagesBlock?.body || (lang === 'vi' ? 'Chọn nhịp tăng trưởng phù hợp với giai đoạn của bạn.' : 'Choose the growth system that fits your stage.')}
            dark
            align="center"
            perWord
            className="packages-section-header"
            titleClassName="packages-section-title"
          />
          <div style={{ '--rd': `${packagesHeaderDelay + 260}ms` } as CSSProperties}>
            <PackageCards items={packageItems} lang={lang} layout={packagesBlock?.layout === 'cards' ? 'cards' : 'horizontal'} />
          </div>
          {(packagesBlock?.packagesNote?.trim() || packagesBlock?.pricingNote?.trim() || packagesBlock?.disclaimer?.trim()) && (
            <aside
              role="note"
              aria-labelledby="package-terms-title"
              data-reveal="soft"
              data-reveal-phase="3"
              style={{ '--rd': `${packagesHeaderDelay + 540}ms` } as CSSProperties}
              className="package-terms-note quiet-zone mx-auto mt-8 flex max-w-[820px] items-start gap-3.5 rounded-[18px] px-5 py-5 md:px-6"
            >
              <span className="package-terms-icon" aria-hidden="true">
                <Info size={17} strokeWidth={2.5} />
              </span>
              <div className="min-w-0 text-left">
                <h3 id="package-terms-title" className="package-terms-title">Important package terms</h3>
                <div className="package-terms-copy mt-2 grid gap-2">
                  {splitCmsParagraphs(
                    packagesBlock.packagesNote?.trim() ||
                    [packagesBlock.pricingNote?.trim(), packagesBlock.disclaimer?.trim()].filter(Boolean).join('\n'),
                  ).map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`}>{highlightPackageTerms(paragraph)}</p>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>

      <PeopleSection block={peopleBlock} showClosingLines={!closingHasPortal} />
      <ClosingBanner block={closingBlock} stories={storyTargets} faqItems={closingFaqItems} />
    </BrandLayout>
  )
}
