'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Bookmark, Check, ChevronRight, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { compactTheOneByLang, organizationSchema, websiteSchema, type BrandLang } from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { openBookingModal } from '../components/openBookingModal'
import { SeoHead } from '../components/SeoHead'
import { getCmsBlock } from '../cms/contentBlocks'
import type { CmsPageContent, CmsSiteSettings } from '../cms/types'
import { getOrderedCaseStudies } from '../data/caseStudyStories'
import type { CaseStudy, CaseStudyMetric } from '../data/caseStudies'
import { useScrollReveal } from '../hooks/useScrollReveal'

type SocialKey = 'instagram' | 'facebook' | 'tiktok'

const socialPlatforms: Array<{ key: SocialKey; label: string }> = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
]

const storyLogoById: Record<string, string> = {
  phinoi: '/logo-phinoi.png',
  'cota-cuti': '/logo-cotacuti.png',
  inkaholic: '/logo-inkaholic.png',
  'qanda-books': '/logo-qandabook.png',
  curnon: '/logo-curnon.png',
}

const appGradients = [
  'linear-gradient(145deg,#ff3d8f,#ff6f61)',
  'linear-gradient(145deg,#ff8a3d,#ffd166)',
  'linear-gradient(145deg,#c026d3,#fb7185)',
  'linear-gradient(145deg,#ef4444,#f59e0b)',
  'linear-gradient(145deg,#ec4899,#f97316)',
  'linear-gradient(145deg,#7c3aed,#f472b6)',
  'linear-gradient(145deg,#f43f5e,#fbbf24)',
  'linear-gradient(145deg,#db2777,#fb923c)',
]

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

function likeStorageKey(id: string) {
  return `gg99:liked-story:${id}`
}

function buildMetricApps(story: CaseStudy) {
  const metrics = story.keyMetrics.filter((metric) => metric.value.trim() || metric.label.trim())
  const serviceApps: CaseStudyMetric[] = story.services.map((service) => ({ value: initials(service), label: service }))
  return [...metrics, ...serviceApps].slice(0, 8)
}

function StoryRing({
  story,
  viewed,
  onClick,
}: {
  story: CaseStudy
  viewed: boolean
  onClick: (story: CaseStudy) => void
}) {
  return (
    <button type="button" onClick={() => onClick(story)} className="group min-w-[76px] text-center">
      <span className={`ig-story-ring mx-auto ${viewed ? 'is-viewed' : ''}`}>
        <span className="ig-story-ring-inner">
          <img src={getStoryLogo(story)} alt={getDisplayName(story)} className="h-full w-full rounded-full object-contain" />
        </span>
      </span>
      <span className="mt-2 block truncate text-[11px] font-bold text-on-surface-variant group-hover:text-primary">
        {getDisplayName(story)}
      </span>
    </button>
  )
}

function StoriesBar({
  heading,
  stories,
  viewedStories,
  onStoryClick,
}: {
  heading: string
  stories: CaseStudy[]
  viewedStories: Set<string>
  onStoryClick: (story: CaseStudy) => void
}) {
  return (
    <section className="sticky top-24 z-30 border-y border-white/65 bg-white/[0.72] px-4 py-4 shadow-[0_14px_40px_rgba(219,39,119,0.08)] backdrop-blur-xl">
      <div className="mx-auto max-w-[700px]">
        <h1 className="ig-script-title text-center text-[46px] leading-none text-on-surface md:text-[58px]">{heading}</h1>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
          {stories.map((story) => (
            <StoryRing key={story.id} story={story} viewed={viewedStories.has(story.id)} onClick={onStoryClick} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SocialMenu({ story }: { story: CaseStudy }) {
  return (
    <details className="group relative">
      <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-low">
        <MoreHorizontal size={20} />
      </summary>
      <div className="absolute right-0 top-10 z-20 min-w-40 overflow-hidden rounded-2xl border border-outline-variant/45 bg-white p-1 text-sm font-bold shadow-xl">
        {socialPlatforms.map((platform) => {
          const href = story.socialLinks?.[platform.key]?.trim()
          return href ? (
            <a key={platform.key} href={href} target="_blank" rel="noreferrer" className="block rounded-xl px-3 py-2 text-on-surface-variant hover:bg-primary/10 hover:text-primary">
              {platform.label}
            </a>
          ) : (
            <span key={platform.key} className="block rounded-xl px-3 py-2 text-on-surface-variant/45">
              {platform.label}
            </span>
          )
        })}
      </div>
    </details>
  )
}

function IPhoneStoryScreen({ story, index }: { story: CaseStudy; index: number }) {
  const metricApps = buildMetricApps(story)
  const screenStyle: CSSProperties = story.screenBackground?.imageUrl
    ? { backgroundImage: `linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0.04)), url("${story.screenBackground.imageUrl.replace(/"/g, '%22')}")` }
    : { backgroundImage: story.screenBackground?.gradient || 'linear-gradient(145deg,#ffe4ec 0%,#ff6f91 54%,#ffd166 100%)' }

  return (
    <div className="ig-phone-shell" data-reveal="scale" style={{ '--ri': index } as CSSProperties}>
      <div className="ig-phone-screen" style={screenStyle}>
        <div className="ig-status-bar">
          <span>9:41</span>
          <span>5G</span>
        </div>
        <div className="grid grid-cols-4 gap-3 px-3 pt-5">
          {metricApps.map((metric, metricIndex) => (
            <div
              key={`${story.id}-app-${metricIndex}`}
              className="ig-app-icon-wrap"
              style={{ '--ri': metricIndex, '--app-bg': appGradients[metricIndex % appGradients.length] } as CSSProperties}
            >
              <span className="ig-app-icon">
                <span className="text-[12px] font-extrabold leading-none text-white">{metric.value || initials(metric.label)}</span>
              </span>
              <span className="ig-app-label">{metric.label}</span>
            </div>
          ))}
        </div>
        <div className="mx-3 mt-5 rounded-[22px] bg-white/86 p-4 text-left shadow-[0_16px_36px_rgba(0,0,0,0.12)] backdrop-blur">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary">{story.category}</p>
          <p className="mt-2 line-clamp-4 text-[12px] font-semibold leading-relaxed text-on-surface">{story.shortDescription}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {story.services.slice(0, 4).map((service) => (
              <span key={service} className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                {service}
              </span>
            ))}
          </div>
        </div>
        <div className="ig-dock">
          {['Ops', 'Ads', 'Data', 'Web'].map((label, dockIndex) => (
            <span key={label} className="ig-dock-icon" style={{ background: appGradients[(dockIndex + 3) % appGradients.length] }}>
              {label.slice(0, 1)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function InstagramPost({
  story,
  index,
  highlighted,
  onShare,
}: {
  story: CaseStudy
  index: number
  highlighted: boolean
  onShare: (story: CaseStudy) => void
}) {
  const seedLikes = parseLikes(story.likesSeed, 980 + index * 397)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(seedLikes)

  useEffect(() => {
    const stored = window.localStorage.getItem(likeStorageKey(story.id))
    const isLiked = stored === '1'
    setLiked(isLiked)
    setLikes(seedLikes + (isLiked ? 1 : 0))
  }, [seedLikes, story.id])

  function toggleLike() {
    setLiked((current) => {
      const next = !current
      window.localStorage.setItem(likeStorageKey(story.id), next ? '1' : '0')
      setLikes(seedLikes + (next ? 1 : 0))
      return next
    })
  }

  return (
    <article
      id={story.id}
      data-reveal="scale"
      style={{ '--ri': index } as CSSProperties}
      className={`story-post scroll-mt-32 overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_70px_rgba(219,39,119,0.12)] transition duration-500 ${highlighted ? 'is-highlighted' : ''}`}
    >
      <header className="flex items-center gap-3 border-b border-outline-variant/35 px-4 py-3">
        <img src={getStoryLogo(story)} alt={getDisplayName(story)} className="h-10 w-10 rounded-full border border-outline-variant/45 object-contain" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-extrabold text-on-surface">{getAccountName(story)}</p>
            {story.verified && <Check size={14} className="rounded-full bg-primary p-0.5 text-white" />}
            <span className="text-xs font-bold text-on-surface-variant">.</span>
            <span className="truncate text-xs font-bold text-on-surface-variant">{story.period}</span>
          </div>
          <p className="truncate text-xs font-semibold text-on-surface-variant">{story.headline}</p>
        </div>
        <SocialMenu story={story} />
      </header>

      <div className="bg-[#fff8fb] p-3 sm:p-5">
        <IPhoneStoryScreen story={story} index={index} />
      </div>

      <footer className="px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleLike} aria-label={liked ? 'Unlike' : 'Like'} className={`transition-colors ${liked ? 'text-primary' : 'text-on-surface hover:text-primary'}`}>
              <Heart size={25} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button type="button" onClick={openBookingModal} aria-label="Comment" className="text-on-surface transition-colors hover:text-primary">
              <MessageCircle size={25} />
            </button>
            <button type="button" onClick={() => onShare(story)} aria-label="Share" className="text-on-surface transition-colors hover:text-primary">
              <Send size={24} />
            </button>
          </div>
          <button type="button" onClick={() => onShare(story)} aria-label="Bookmark" className="text-on-surface transition-colors hover:text-primary">
            <Bookmark size={24} />
          </button>
        </div>
        <p className="mt-3 text-sm font-extrabold text-on-surface">Liked by {compactNumber(likes)} people</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface">
          <span className="font-extrabold">{getAccountName(story)}</span>{' '}
          {story.caption || story.shortDescription}
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">{story.category}</p>
      </footer>
    </article>
  )
}

function FinalStoryCta({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openBookingModal}
      data-reveal="scale"
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
  )
}

export default function TheOnePage({ lang = 'vi', cmsPage, siteSettings }: { lang?: BrandLang; cmsPage?: CmsPageContent | null; siteSettings?: CmsSiteSettings | null }) {
  const c = compactTheOneByLang[lang]
  const heroBlock = getCmsBlock(cmsPage, 'hero')
  const storiesBlock = getCmsBlock(cmsPage, 'stories')
  const orderedCaseStudies = useMemo(() => getOrderedCaseStudies(storiesBlock), [storiesBlock])
  const [viewedStories, setViewedStories] = useState<Set<string>>(() => new Set())
  const [highlightedId, setHighlightedId] = useState('')
  const [toast, setToast] = useState('')
  const storyHeading = heroBlock?.heading?.trim() || 'The One Stories'
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

  const storiesById = useMemo(() => new Map(orderedCaseStudies.map((story) => [story.id, story])), [orderedCaseStudies])

  function handleStoryClick(story: CaseStudy) {
    window.sessionStorage.setItem(storyStorageKey(story.id), '1')
    setViewedStories((current) => new Set(current).add(story.id))
    window.history.replaceState(null, '', `#${encodeURIComponent(story.id)}`)
    document.getElementById(story.id)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    setHighlightedId(story.id)
    window.setTimeout(() => setHighlightedId(''), 1200)
  }

  async function handleShare(story: CaseStudy) {
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
    <BrandLayout lang={lang} siteSettings={siteSettings} flushTop>
      <SeoHead meta={cmsPage?.meta ?? c.meta} schema={[organizationSchema, websiteSchema]} lang={lang} />

      <article className="min-h-screen bg-[linear-gradient(180deg,#fff5f7_0%,#ffe4ec_35%,#fff1c8_100%)] pb-16 pt-24">
        <StoriesBar heading={storyHeading} stories={orderedCaseStudies} viewedStories={viewedStories} onStoryClick={handleStoryClick} />

        <section className="mx-auto mt-8 grid max-w-[700px] gap-7 px-3 sm:px-5">
          {orderedCaseStudies.map((story, index) => (
            <InstagramPost
              key={story.id}
              story={storiesById.get(story.id) || story}
              index={index}
              highlighted={highlightedId === story.id}
              onShare={handleShare}
            />
          ))}
          <FinalStoryCta label={finalCtaLabel} />
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
