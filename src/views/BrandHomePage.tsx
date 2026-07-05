'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowDown,
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

function CaseStudyPreviewPopover({ story, lang }: { story: CaseStudy; lang: BrandLang }) {
  const images = getCaseStudyGallery(story)
  const [activeImage, setActiveImage] = useState(0)
  const href = resolveStoryHref(lang, story.id, story.id)

  useEffect(() => {
    setActiveImage(0)
    if (images.length < 2) return
    const interval = window.setInterval(() => {
      setActiveImage((index) => (index + 1) % images.length)
    }, 2200)
    return () => window.clearInterval(interval)
  }, [story.id, images.length])

  return (
    <article className="pointer-events-auto overflow-hidden rounded-[20px] bg-[#141414] text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] ring-1 ring-white/18">
      <div className="relative aspect-video overflow-hidden bg-black">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent" aria-hidden="true" />
        {images.length > 1 && (
          <div className="absolute bottom-3 left-4 flex gap-1.5" aria-hidden="true">
            {images.map((imageUrl, index) => (
              <span key={`${story.id}-dot-${imageUrl}-${index}`} className={`h-1.5 rounded-full transition-all ${activeImage === index ? 'w-5 bg-white' : 'w-1.5 bg-white/45'}`} />
            ))}
          </div>
        )}
      </div>
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/55">{story.category}</p>
            <h3 className="mt-2 line-clamp-2 text-[22px] font-extrabold leading-tight text-white">{story.brandName}</h3>
          </div>
          <img src={getStoryLogoForHome(story)} alt="" aria-hidden="true" className="h-10 w-10 shrink-0 rounded-full bg-white/92 object-contain p-1.5" />
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-relaxed text-white/70">{story.shortDescription}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-white/62">
          <span>{story.period}</span>
          {story.services.slice(0, 2).map((service) => (
            <span key={`${story.id}-${service}`} className="rounded-full bg-white/10 px-2.5 py-1">
              {service}
            </span>
          ))}
        </div>
        <a
          href={href}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#141414] transition hover:bg-primary hover:text-white"
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
  const [previewStory, setPreviewStory] = useState<CaseStudy | null>(null)

  useEffect(() => {
    if (showcaseStories.length < 2) return
    const interval = window.setInterval(() => {
      setBannerIndex((index) => (index + 1) % showcaseStories.length)
    }, 3600)
    return () => window.clearInterval(interval)
  }, [showcaseStories.length])

  if (!showcaseStories.length) return null

  const activeBannerIndex = bannerIndex % showcaseStories.length
  const activeStory = showcaseStories[activeBannerIndex] ?? showcaseStories[0]

  function moveRail(direction: -1 | 1) {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: direction * Math.max(280, rail.clientWidth * 0.82), behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-visible bg-surface-container px-5 py-8 md:py-12 lg:px-10" onMouseLeave={() => setPreviewStory(null)}>
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title="The One Stories"
          intro={lang === 'vi' ? 'Nhung case study dang chay trong he thong The One.' : 'Case studies moving through The One system.'}
        />

        <button
          type="button"
          data-reveal="scale"
          onMouseEnter={() => setPreviewStory(activeStory)}
          onFocus={() => setPreviewStory(activeStory)}
          onClick={() => setPreviewStory(activeStory)}
          className="group relative block aspect-[16/8] w-full overflow-hidden rounded-[24px] bg-[#190b12] text-left shadow-[0_24px_70px_rgba(80,20,50,0.18)] outline-none ring-1 ring-white/65 transition duration-500 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:aspect-[16/6]"
          aria-label={`Preview ${activeStory.brandName}`}
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
                  className={`absolute inset-0 h-full w-full transition duration-700 group-hover:scale-[1.025] ${
                    isLogoLikeImage(thumbnail) ? 'bg-[linear-gradient(135deg,#fff7fb,#ffd8e8)] object-contain p-12 md:p-20' : 'object-cover'
                  } ${index === activeBannerIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              )
            })()
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/68">Featured case</p>
            <h2 className="mt-2 max-w-2xl text-[30px] font-extrabold leading-tight md:text-[48px]">{activeStory.brandName}</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-white/76 md:text-base">{activeStory.caption || activeStory.shortDescription}</p>
          </div>
        </button>

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
          <div ref={railRef} className="case-study-rail flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2">
            {showcaseStories.map((story, index) => (
              <button
                key={`${story.id}-rail`}
                type="button"
                data-reveal="tile-in"
                data-tile-direction={index % 2 ? 'right' : 'bottom'}
                style={{ '--ri': index } as CSSProperties}
                onMouseEnter={() => setPreviewStory(story)}
                onFocus={() => setPreviewStory(story)}
                onClick={() => setPreviewStory(story)}
                className="group relative aspect-[16/10] shrink-0 basis-[82%] snap-start overflow-hidden rounded-[16px] bg-[#180b11] text-left shadow-[0_14px_40px_rgba(80,20,50,0.13)] outline-none ring-1 ring-white/70 transition duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:basis-[calc((100%_-_8px)/2)] md:basis-[calc((100%_-_16px)/3)] lg:basis-[calc((100%_-_24px)/4)]"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/12 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="line-clamp-1 text-[17px] font-extrabold leading-tight">{story.brandName}</h3>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-white/70">{story.headline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {previewStory && (
        <>
          <div className="pointer-events-none fixed left-1/2 top-1/2 z-[80] hidden w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 md:block">
            <CaseStudyPreviewPopover story={previewStory} lang={lang} />
          </div>
          <div className="fixed inset-0 z-[80] flex items-end bg-black/42 p-4 backdrop-blur-sm md:hidden" onClick={() => setPreviewStory(null)}>
            <div className="mx-auto w-full max-w-[420px]" onClick={(event) => event.stopPropagation()}>
              <CaseStudyPreviewPopover story={previewStory} lang={lang} />
            </div>
          </div>
        </>
      )}
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
            const avatarImages = getPeopleAvatarImages(member)
            const carouselDuration = `${Math.max(avatarImages.length, 1) * 2200}ms`
            return (
              <article
                key={`${member.title}-${index}`}
                data-reveal="people-card"
                style={{ '--ri': index } as CSSProperties}
                className="people-card group min-w-0 overflow-hidden rounded-[20px] border border-white/70 bg-white/85 shadow-[0_18px_42px_rgba(80,20,50,0.12)] backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_rgba(219,39,119,0.18)] md:rounded-[28px]"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                  {avatarImages.length === 1 ? (
                    <img src={avatarImages[0]} alt={member.imageAlt || member.title} className="h-full w-full object-cover" />
                  ) : (
                    avatarImages.map((imageUrl, avatarIndex) => (
                      <img
                        key={`${member.title}-${imageUrl}-${avatarIndex}`}
                        src={imageUrl}
                        alt={avatarIndex === 0 ? member.imageAlt || member.title : ''}
                        aria-hidden={avatarIndex === 0 ? undefined : true}
                        className="people-avatar-slide"
                        style={{
                          '--avatar-delay': `${avatarIndex * 2200}ms`,
                          '--avatar-duration': carouselDuration,
                        } as CSSProperties}
                      />
                    ))
                  )}
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

      <CaseStudyShowcase stories={storyTargets} lang={lang} />

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
