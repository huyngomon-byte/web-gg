'use client'

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import {
  ArrowDown,
  Play,
} from 'lucide-react'
import { compactHomeByLang, homeMetaByLang, homeWebPageSchema, localizedPath, organizationSchema, websiteSchema, type BrandLang } from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { openBookingModal } from '../components/openBookingModal'
import { PackageCards } from '../components/PackageCards'
import { SeoHead } from '../components/SeoHead'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { whenIntroGone } from '../hooks/useIntroGate'
import { getCmsBlock, splitCmsParagraphs } from '../cms/contentBlocks'
import { buildHomeFaqSchema, getHomeClosingFaqItems } from '../cms/homeFaqSchema'
import type { CmsBlockItem, CmsPageContent, CmsSiteSettings } from '../cms/types'
import { getOrderedCaseStudies } from '../data/caseStudyStories'
import type { CaseStudy } from '../data/caseStudies'

const primaryBookingCtaLabel = 'Call Your Shot'
const defaultHeroGradient = 'linear-gradient(180deg,#FF7AA8 0%,#FF4D7D 45%,#FFB199 100%)'
const heroFirstWordDelayMs = 420
const heroWordStepMs = 90
const heroWordDurationMs = 430

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

function getStoryLogoForHome(story: Pick<CaseStudy, 'id' | 'logoUrl'>) {
  return story.logoUrl || storyLogoById[story.id] || '/logo-gg.png'
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
    thumbnailUrl?: string
    imageAlt: string
    videoUrl?: string
    videoPoster?: string
    embedUrl?: string
  }
  story?: CaseStudy
  index: number
  lang: BrandLang
  featured?: boolean
}) {
  const [active, setActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hoverTimerRef = useRef<number | null>(null)
  const tileTokenRef = useRef(`explore-${index}-${stage.href}-${stage.label}`)
  const rawVideoUrl = stage.videoUrl?.trim() || stage.embedUrl?.trim() || ''
  const imageLooksLikeVideo = stage.imageUrl ? isEmbeddableUrl(stage.imageUrl) || isDirectVideoUrl(stage.imageUrl) : false
  const mediaUrl = rawVideoUrl || (imageLooksLikeVideo ? stage.imageUrl || '' : '')
  const posterUrl = stage.videoPoster || stage.thumbnailUrl || (imageLooksLikeVideo ? '' : stage.imageUrl) || (story?.id ? storyLogoById[story.id] : '') || '/logo-gg.png'
  const directVideo = Boolean(mediaUrl && isDirectVideoUrl(mediaUrl))
  const videoSrc = directVideo ? extractIframeSrc(mediaUrl) : ''
  const storyHref = resolveStoryHref(lang, stage.href, story?.id)
  const backdrop = mediaBackdrops[index % mediaBackdrops.length]
  const posterIsLogo = /(^|\/)logo[-_]/i.test(posterUrl)

  useEffect(() => {
    const onStop = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (detail !== tileTokenRef.current) deactivatePreview()
    }

    window.addEventListener('gg99:stop-explore-preview', onStop)
    return () => window.removeEventListener('gg99:stop-explore-preview', onStop)
  }, [])

  function activatePreview() {
    if (!videoSrc) return
    window.dispatchEvent(new CustomEvent('gg99:stop-explore-preview', { detail: tileTokenRef.current }))
    setActive(true)
    const video = videoRef.current
    if (!video) return
    if (!video.src) {
      video.src = videoSrc
      video.load()
    }
    video.muted = true
    try {
      video.currentTime = 0
    } catch {
      // Keep current time if the browser has not loaded metadata yet.
    }
    void video.play().catch(() => {
      setActive(false)
    })
  }

  function schedulePreview() {
    if (!videoSrc) return
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = window.setTimeout(activatePreview, 150)
  }

  function deactivatePreview() {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
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

  function handleTileClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (!videoSrc || !window.matchMedia('(hover: none)').matches) return
    if (!active) {
      event.preventDefault()
      activatePreview()
    }
  }

  return (
    <a
      href={storyHref}
      aria-label={`${stage.label}${story ? ` - ${story.brandName}` : ''}`}
      onClick={handleTileClick}
      onMouseEnter={schedulePreview}
      onMouseLeave={deactivatePreview}
      onFocus={schedulePreview}
      onBlur={deactivatePreview}
      className={[
        'home-explore-tile group flex h-full min-h-0 flex-col overflow-hidden bg-white text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
        featured ? 'md:col-span-2 md:row-span-2' : '',
      ].join(' ')}
    >
      <div className="home-explore-media relative min-h-0 flex-1 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${backdrop}`} aria-hidden="true" />
        {directVideo && (
          <video
            ref={videoRef}
            muted
            playsInline
            preload="none"
            aria-hidden="true"
            onEnded={deactivatePreview}
            className={`relative h-full w-full object-cover transition duration-500 ${active ? 'opacity-100' : 'opacity-0'} group-hover:scale-[1.04]`}
          />
        )}
        <img
          src={posterUrl}
          alt=""
          className={`pointer-events-none absolute inset-0 h-full w-full transition duration-500 group-hover:scale-[1.04] ${
            active ? 'opacity-0' : 'opacity-100'
          } ${posterIsLogo ? 'object-contain p-8' : 'object-cover'}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" aria-hidden="true" />
        {videoSrc && (
          <span className="absolute right-3 top-3 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-black/55 px-2 text-white shadow-lg backdrop-blur-md ring-1 ring-white/10">
            <Play size={15} fill="currentColor" strokeWidth={2.2} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className={`${featured ? 'p-4 md:p-5' : 'p-3 md:p-3.5'} bg-white text-on-surface`}>
        <h3 className={`${featured ? 'text-[20px] md:text-[24px]' : 'text-[15px] md:text-[16px]'} line-clamp-2 font-extrabold leading-tight text-on-surface transition-colors group-hover:text-primary`}>
          {stage.label}
        </h3>
        {stage.detail && (
          <p className="mt-1.5 line-clamp-2 text-[12px] font-semibold leading-relaxed text-on-surface-variant md:text-[13px]">
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
      imageUrl: item.thumbnailUrl || story?.backgroundImageUrl || item.imageUrl,
      thumbnailUrl: item.thumbnailUrl || item.imageUrl,
      imageAlt: item.imageAlt || item.title,
      videoUrl: item.videoUrl || story?.videoUrl,
      videoPoster: item.videoPoster,
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
  const revealOrderByIndex = [0, 1, 2, 4, 3, 5]

  return (
    <div className="space-y-5">
      <div data-reveal="explore-frame" className="home-explore-grid grid auto-rows-[minmax(120px,1fr)] grid-cols-2 gap-1 overflow-hidden rounded-[24px] bg-white p-1 shadow-[0_24px_70px_rgba(219,39,119,0.12)] md:grid-cols-3 md:auto-rows-[minmax(170px,1fr)]">
        {visibleStages.map((stage, index) => (
          <div
            key={`${stage.label}-${index}`}
            data-reveal="explore-tile"
            data-tile-direction={index === 0 ? 'center' : index === 1 || index === 2 ? 'right' : 'bottom'}
            style={{ '--ri': revealOrderByIndex[index] ?? index } as CSSProperties}
            className={`h-full ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
          >
            <ExploreTile
              stage={stage}
              story={stage.story}
              index={index}
              lang={lang}
              featured={index === 0}
            />
          </div>
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

function PeopleSection({ block }: { block?: ReturnType<typeof getCmsBlock> }) {
  const members = (block?.items ?? []).filter((item) => item.published !== false).slice(0, 6)
  if (!block || !members.length) return null
  const closingLine1 = block.closingLine1 || 'We quit our 9-5 and started our own business.'
  const closingLine2 = block.closingLine2 || "Isn't it your turn now?"

  return (
    <section className="px-5 py-12 md:py-16 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeader title={block.heading || 'The One People'} intro={block.body} />
        <div className="people-card-grid grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-7">
          {members.map((member, index) => {
            return (
              <article
                key={`${member.title}-${index}`}
                data-reveal="people-card"
                style={{ '--ri': index } as CSSProperties}
                className="people-card group min-w-0 overflow-hidden rounded-[20px] border border-white/70 bg-white/85 shadow-[0_18px_42px_rgba(80,20,50,0.12)] backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_rgba(219,39,119,0.18)] md:rounded-[28px]"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                  <img src={member.imageUrl || member.photoUrl || '/logo-gg.png'} alt={member.imageAlt || member.title} className="h-full w-full object-cover transition duration-300 group-hover:opacity-0" />
                  <img src={member.funPhotoUrl || member.backgroundImageUrl || member.imageUrl || '/logo-gg.png'} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 group-hover:opacity-100" />
                </div>
                <div className="p-3 text-left md:p-5">
                  <h3 className="text-[14px] font-extrabold leading-tight text-on-surface sm:text-[16px] md:text-[18px]">{member.title}</h3>
                  {member.label && <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{member.label}</p>}
                  {member.body && <p className="mt-2 line-clamp-3 text-[12px] font-semibold leading-relaxed text-on-surface-variant md:mt-3 md:text-[14px]">{member.body}</p>}
                </div>
              </article>
            )
          })}
        </div>
        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="home-people-closing-one text-[24px] italic leading-tight text-on-surface/85 md:text-[28px]">{closingLine1}</p>
          <p className="home-people-closing-two mt-3 bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[28px] font-semibold leading-tight text-transparent md:text-[44px]">
            {closingLine2}
          </p>
          <ArrowDown className="mx-auto mt-5 animate-bounce text-primary" size={22} aria-hidden="true" />
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
  const closingTitle = block.heading || 'So, ready to be our plus one?'
  const closingCharacterCount = countStaggerCharacters(closingTitle)
  const closingFollowDelay = Math.max(360, closingCharacterCount * 18 + 220)

  return (
    <section className="closing-section px-0 py-0">
      <div className="closing-banner relative flex min-h-[420px] items-center overflow-hidden px-5 py-16 text-center md:min-h-[540px] lg:px-10" style={style}>
        <div className="absolute inset-0 closing-banner-bg" aria-hidden="true" />
        {logos.length > 0 && (
          <div className="closing-logo-rail absolute inset-x-0 top-7 h-12 overflow-hidden opacity-70">
            <div className="closing-logo-marquee flex w-max items-center gap-12">
              {[...logos, ...logos].map((logo, index) => (
                <img key={`${logo}-${index}`} src={logo} alt="" aria-hidden="true" className="h-8 w-auto max-w-[128px] object-contain brightness-0 invert opacity-70" />
              ))}
            </div>
          </div>
        )}
        <div className="closing-content relative mx-auto w-full max-w-[1200px]" data-reveal="closing-content">
          <h2 className="home-hero-title-serif text-[34px] font-semibold leading-tight text-white md:text-[44px]">
            <StaggeredText text={closingTitle} className="inline" charClassName="closing-char" nowrap={false} />
          </h2>
          {block.subtitle && (
            <p
              className="closing-follow mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-white/82 md:text-lg"
              style={{ '--closing-delay': `${closingFollowDelay}ms` } as CSSProperties}
            >
              {block.subtitle}
            </p>
          )}
          <button
            type="button"
            onClick={() => openBookingModal('closing-banner')}
            className="closing-follow mt-8 inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-extrabold text-primary shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition hover:scale-105 hover:shadow-[0_24px_70px_rgba(0,0,0,0.25)]"
            style={{ '--closing-delay': `${closingFollowDelay + 120}ms` } as CSSProperties}
          >
            {resolvePrimaryBookingCtaLabel(block.ctaLabel)}
          </button>
          {faqItems.length > 0 && (
            <div className="closing-faq mx-auto mt-9 grid max-w-3xl gap-3 text-left">
              {faqItems.map((item, index) => {
                const open = openFaqIndex === index
                return (
                  <div
                    key={`${item.question}-${index}`}
                    className="closing-faq-item overflow-hidden rounded-2xl border border-white/22 bg-white/14 text-white shadow-[0_18px_46px_rgba(0,0,0,0.12)] backdrop-blur-xl"
                    style={{ '--ri': index, '--closing-delay': `${closingFollowDelay + 180 + index * 80}ms` } as CSSProperties}
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
  const [heroReady, setHeroReady] = useState(false)

  const c = compactHomeByLang[lang]
  const homeMeta = cmsPage?.meta ?? homeMetaByLang[lang]
  const heroBlock = getCmsBlock(cmsPage, 'hero')
  const whatIsBlock = getCmsBlock(cmsPage, 'what-is')
  const packagesBlock = getCmsBlock(cmsPage, 'packages')
  const peopleBlock = getCmsBlock(cmsPage, 'people')
  const closingBlock = getCmsBlock(cmsPage, 'closing')
  const storiesBlock = getCmsBlock(theOnePage, 'stories')
  const storyTargets = getOrderedCaseStudies(storiesBlock)
  const heroLines = splitCmsParagraphs(heroBlock?.body)
  const heroLineOne = heroBlock?.heading?.trim() || 'The One by gg99'
  const heroLineTwo = heroBlock?.subtitle?.trim() || heroLines[0] || 'The only one digital agency you needed'
  const isDefaultHeroTitle = heroLineOne.toLowerCase() === 'the one by gg99'
  const heroTextMode = heroBlock?.textColor ?? 'light'
  const showHeroDivider = heroBlock?.dividerShow !== false
  const heroWordCount = countStaggerWords(heroLineOne)
  const heroDelays = getHeroAnimationDelays(heroWordCount, showHeroDivider)
  const closingFaqItems = getHomeClosingFaqItems(cmsPage)
  const homeSchemas = [organizationSchema, websiteSchema, homeWebPageSchema, buildHomeFaqSchema(cmsPage)].filter(Boolean)
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
      hideHeaderCta
      flushTop
      resolveNavHref={(href, label) => (href === '/packages' || label.toLowerCase().includes('packages') ? '#packages' : href)}
    >
      <SeoHead meta={homeMeta} schema={homeSchemas} lang={lang} />

      <section className={`home-hero relative flex min-h-[52vh] items-center overflow-hidden md:min-h-[58vh] ${heroReady ? 'is-ready' : ''}`} style={heroBackgroundStyle(heroBlock)}>
        <div className="absolute inset-0 tech-grid opacity-35 pointer-events-none" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-surface-container" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-5 pb-10 pt-28 text-center lg:px-10">
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
              className="home-hero-divider mt-5 h-px bg-white/45"
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
            style={{ '--hero-delay': `${heroDelays.cta}ms` } as CSSProperties}
            className="home-hero-item btn-shine cta-idle mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-7 py-3.5 font-bold text-white shadow-[0_16px_36px_rgba(219,39,119,0.28)] hover:opacity-95"
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

      <PeopleSection block={peopleBlock} />
      <ClosingBanner block={closingBlock} stories={storyTargets} faqItems={closingFaqItems} />
    </BrandLayout>
  )
}
