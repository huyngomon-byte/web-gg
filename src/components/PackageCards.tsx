'use client'

import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight, Check, ChevronDown, Megaphone, Rocket, Workflow, X } from 'lucide-react'
import { localizedPath, type BrandLang } from '../brandContent'
import type { CmsBlockItem, CmsPackageComparisonRow } from '../cms/types'
import { CmsIcon } from './CmsIcon'
import { openBookingModal } from './openBookingModal'

export type PackageTone = 'start' | 'system' | 'scale'
const packageToneOrder = ['start', 'system', 'scale'] as const

export type PackageFeatureRow = {
  text: string
  group?: string
  label?: string
  featured?: boolean
  availability?: 'included' | 'excluded'
}

type PackageFeatureTextParts = {
  before: string
  emphasis: string
  after: string
}

export type PackageFeaturePresentation = {
  group: string
  emphasisSource: 'explicit' | 'leading' | 'none'
  parts: PackageFeatureTextParts
}

type NormalizedPackageDeliverable =
  | { type: 'metric'; value: string; body: string }
  | { type: 'task'; title: string; body: string }

const packageIcons = {
  start: Rocket,
  system: Workflow,
  scale: Megaphone,
} satisfies Record<PackageTone, typeof Rocket>

function safelyDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function packageToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'package'
}

function resolvePackageId(item: CmsBlockItem, index: number) {
  const hash = item.href?.match(/#([^#?]+)/)?.[1]
  // `#packages` targets the shared homepage section, not an individual card.
  if (hash) {
    const decodedHash = safelyDecodeURIComponent(hash)
    if (decodedHash && decodedHash !== 'packages') return decodedHash
  }

  const stableSource = item.id?.trim() || item.title
  const token = packageToken(stableSource)
  return token === 'package' ? `package-${index + 1}` : token
}

function parsePackageBody(body: string | undefined) {
  const lines = String(body || '').split(/\n+/).map((line) => line.trim()).filter(Boolean)
  const subtitle = lines[0] || ''
  const hasPrice = /^price:/i.test(lines[lines.length - 1] || '')
  const price = hasPrice ? lines[lines.length - 1].replace(/^price:\s*/i, '') : ''
  const bullets = lines.slice(1, hasPrice ? -1 : undefined)
  return { subtitle, price, bullets }
}

function packageDeliverableTitle(line: string) {
  if (/content strategy|content calendar|production/i.test(line)) return 'Content engine'
  if (/booking|sales website|landing pages|website/i.test(line)) return 'Website system'
  if (/performance marketing|ad spend|media planning/i.test(line)) return 'Performance media'
  if (/everything included/i.test(line)) return 'System base'
  if (/on-site events|event execution/i.test(line)) return 'Event ops'
  if (/campaign strategy|creative direction/i.test(line)) return 'Campaign growth'
  return 'Growth task'
}

function normalizePackageDeliverables(lines: string[]): NormalizedPackageDeliverable[] {
  return lines.map((line) => {
    const metricMatch = line.match(/^(\d+\s+content units?\/month)(?:[\s,]+\(?(.+?)\)?)?$/i)
    if (metricMatch) {
      return {
        type: 'metric' as const,
        value: metricMatch[1],
        body: metricMatch[2] ?? '',
      }
    }
    return {
      type: 'task' as const,
      title: packageDeliverableTitle(line),
      body: line.replace(/\.$/, ''),
    }
  })
}

function isMetricDeliverable(
  deliverable: NormalizedPackageDeliverable,
): deliverable is Extract<NormalizedPackageDeliverable, { type: 'metric' }> {
  return deliverable.type === 'metric'
}

function isContentMetricRow(row: PackageFeatureRow) {
  return /content units?/i.test(row.text)
}

function getPackageContent(item: CmsBlockItem) {
  const parsed = parsePackageBody(item.body)
  const fallbackDeliverables = normalizePackageDeliverables(parsed.bullets)
  const fallbackFeatures: PackageFeatureRow[] = fallbackDeliverables.map((deliverable) => {
    if (isMetricDeliverable(deliverable)) {
      return {
        label: 'CONTENT ENGINE',
        text: [deliverable.value, deliverable.body].filter(Boolean).join(' - '),
        availability: 'included',
      }
    }
    return {
      label: deliverable.title.toUpperCase(),
      text: deliverable.body,
      availability: 'included',
    }
  })

  const cmsFeatures = item.features?.filter((feature) => feature.label?.trim() || feature.text.trim()) ?? []
  const rows: PackageFeatureRow[] = cmsFeatures.length ? cmsFeatures : fallbackFeatures
  const featureCapacity = rows.find(isContentMetricRow)
  const parsedCapacity = !featureCapacity
    ? fallbackFeatures.find(isContentMetricRow)
    : undefined

  return {
    subtitle: item.subtitle?.trim() || parsed.subtitle,
    capacity: featureCapacity ?? parsedCapacity,
    features: rows.filter((row) => row !== featureCapacity && !isContentMetricRow(row)),
    priceLabel: item.priceLabel?.trim() || 'From',
    priceValue: item.priceValue?.trim() || parsed.price,
    priceSupportingText: item.priceSupportingText?.trim() || '',
    ctaMicrocopy: item.ctaMicrocopy?.trim() || '',
  }
}

export function normalizePackagePrice(
  priceLabel: string,
  priceValue: string,
  priceSupportingText: string,
  tone: PackageTone,
) {
  const normalizedLabel = !priceLabel || /^monthly setup$/i.test(priceLabel) || (tone === 'scale' && /^from$/i.test(priceLabel))
    ? tone === 'scale' ? 'Custom' : 'From'
    : priceLabel
  const normalizedValue = /^from$/i.test(normalizedLabel)
    ? priceValue.replace(/^from\s+/i, '').trim()
    : priceValue
  let normalizedSupportingText = priceSupportingText || (tone === 'system'
    ? 'All-in-one: content + web + ads'
    : '')
  let displayValue = normalizedValue

  if (tone === 'scale') {
    const customPrice = normalizedValue.match(/^(.+?)\s+[\u2013\u2014-]\s+(.+)$/)
    if (customPrice) {
      displayValue = customPrice[1].trim()
      if (!normalizedSupportingText) normalizedSupportingText = customPrice[2].trim()
    }
  }

  const suffixMatch = displayValue.match(/^(.+?)(\/(?:month|tháng))$/i)

  return {
    priceLabel: normalizedLabel,
    priceValue: suffixMatch?.[1].trim() || displayValue,
    priceSuffix: suffixMatch?.[2] || '',
    priceSupportingText: normalizedSupportingText,
  }
}

function rowGroupName(row: PackageFeatureRow) {
  const source = row.group?.trim() || row.label?.trim() || ''
  if (!source) return 'Deliverables'
  // Legacy labels are stored UPPERCASE; show them in title case.
  return source.toLowerCase().replace(/(^|\s)\S/g, (character) => character.toUpperCase())
}

export function resolvePackageTone(
  item: Pick<CmsBlockItem, 'title' | 'packageTier'>,
  packageId: string,
  index: number,
): PackageTone {
  const stableKey = `${packageId} ${item.title}`.toLowerCase()
  if (/\bscale\b/.test(stableKey)) return 'scale'
  if (/\bsystem\b/.test(stableKey)) return 'system'
  if (/\bstart(?:er)?\b/.test(stableKey)) return 'start'
  if (item.packageTier) return item.packageTier
  return packageToneOrder[index] ?? 'start'
}

export function resolvePackageTones(
  items: Array<Pick<CmsBlockItem, 'title' | 'packageTier'>>,
  packageIds: string[],
) {
  const requested = items.map((item, index) => resolvePackageTone(item, packageIds[index] ?? '', index))
  if (items.length !== packageToneOrder.length) return requested

  const assigned: Array<PackageTone | undefined> = Array(items.length).fill(undefined)
  const available = new Set<PackageTone>(packageToneOrder)

  // Stable package names/anchors define the public hierarchy even if a stale
  // CMS tier field is duplicated or misassigned.
  items.forEach((item, index) => {
    const stableKey = `${packageIds[index] ?? ''} ${item.title}`.toLowerCase()
    const stableTone = packageToneOrder.find((tone) => (
      tone === 'start'
        ? /\bstart(?:er)?\b/.test(stableKey)
        : new RegExp(`\\b${tone}\\b`).test(stableKey)
    ))
    if (stableTone && available.has(stableTone)) {
      assigned[index] = stableTone
      available.delete(stableTone)
    }
  })

  requested.forEach((tone, index) => {
    if (!assigned[index] && available.has(tone)) {
      assigned[index] = tone
      available.delete(tone)
    }
  })

  assigned.forEach((tone, index) => {
    if (tone) return
    const positionalTone = packageToneOrder[index]
    const fallbackTone = available.has(positionalTone) ? positionalTone : available.values().next().value
    assigned[index] = fallbackTone ?? positionalTone
    available.delete(assigned[index]!)
  })

  return assigned as PackageTone[]
}

function splitExactPhrase(text: string, phrase: string): PackageFeatureTextParts | null {
  const normalizedPhrase = phrase.trim()
  if (!normalizedPhrase) return null
  const index = text.toLocaleLowerCase().indexOf(normalizedPhrase.toLocaleLowerCase())
  if (index < 0) return null
  return {
    before: text.slice(0, index),
    emphasis: text.slice(index, index + normalizedPhrase.length),
    after: text.slice(index + normalizedPhrase.length),
  }
}

function splitLeadingMeaningfulClause(text: string): PackageFeatureTextParts | null {
  const start = text.search(/\S/)
  if (start < 0) return null
  const content = text.slice(start)
  const boundary = /(?:,|;|:|\s+[\u2013\u2014]\s+|\s+\()/.exec(content)
  const end = start + (boundary?.index ?? content.length)
  const emphasis = text.slice(start, end).trimEnd()
  if (!emphasis) return null
  return {
    before: text.slice(0, start),
    emphasis,
    after: text.slice(start + emphasis.length),
  }
}

export function getPackageFeaturePresentation(
  row: PackageFeatureRow,
  important = row.featured === true,
): PackageFeaturePresentation {
  // `label` is a legacy group fallback when no explicit `group` exists. It only
  // becomes inline emphasis when both fields exist, preserving old CMS meaning.
  const explicitPhrase = row.group?.trim() ? row.label?.trim() ?? '' : ''
  const explicitParts = explicitPhrase ? splitExactPhrase(row.text, explicitPhrase) : null
  if (explicitParts) {
    return { group: rowGroupName(row), emphasisSource: 'explicit', parts: explicitParts }
  }

  const leadingParts = important ? splitLeadingMeaningfulClause(row.text) : null
  if (leadingParts) {
    return { group: rowGroupName(row), emphasisSource: 'leading', parts: leadingParts }
  }

  return {
    group: rowGroupName(row),
    emphasisSource: 'none',
    parts: { before: '', emphasis: '', after: row.text },
  }
}

function fallbackExcludedFeatures(lang: BrandLang): PackageFeatureRow[] {
  if (lang === 'vi') {
    return [
      { label: 'ECOMMERCE OPS', text: 'Vận hành thương mại điện tử (Shopee, TikTok Shop, Lazada...)', availability: 'excluded' },
      { label: 'WEBSITE SYSTEM', text: 'Landing page không giới hạn', availability: 'excluded' },
    ]
  }

  return [
    { label: 'ECOMMERCE OPS', text: 'E-commerce management (Shopee, TikTok Shop, Lazada...)', availability: 'excluded' },
    { label: 'WEBSITE SYSTEM', text: 'Unlimited landing pages', availability: 'excluded' },
  ]
}

function withStartExclusions(features: PackageFeatureRow[], tone: PackageTone, lang: BrandLang) {
  if (tone !== 'start') return features

  const nextRows = [...features]
  for (const fallback of fallbackExcludedFeatures(lang)) {
    const semanticMatch = /e-?commerce|shopee|tiktok shop|lazada/i.test(fallback.text)
      ? /e-?commerce|shopee|tiktok shop|lazada/i
      : /unlimited landing pages|landing page không giới hạn/i
    if (!nextRows.some((row) => semanticMatch.test(row.text))) nextRows.push(fallback)
  }
  return nextRows
}

function PackageFeatureRowView({
  row,
  tone,
  style,
}: {
  row: PackageFeatureRow
  tone: PackageTone
  style?: CSSProperties
}) {
  const presentation = getPackageFeaturePresentation(row)
  const availability = row.availability ?? 'included'
  const included = availability === 'included'
  const systemBase = tone === 'scale' && /everything included in the one system/i.test(row.text)

  return (
    <li
      className={`package-feature-row pkg-rv${systemBase ? ' package-feature-row--system-base' : ''}`}
      style={style}
      data-testid="package-feature-row"
      data-feature-group={presentation.group}
      data-featured={row.featured === true ? 'true' : 'false'}
      data-availability={availability}
      data-system-base={systemBase ? 'true' : 'false'}
    >
      <span className="package-feature-status" aria-hidden="true">
        {included ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}
      </span>
      <span className="sr-only">{included ? 'Included: ' : 'Not included: '}</span>
      <span className="package-feature-copy">
        <span className="package-feature-group">{presentation.group}</span>
        <span className="package-feature-text">
          {presentation.parts.emphasis ? (
            <>
              {presentation.parts.before}
              <strong
                data-testid="package-feature-emphasis"
                data-emphasis-source={presentation.emphasisSource}
                className="package-feature-emphasis"
              >
                {presentation.parts.emphasis}
              </strong>
              {presentation.parts.after}
            </>
          ) : row.text}
        </span>
      </span>
    </li>
  )
}

function normalizePackageCtaLabel(value: string | undefined, fallback: string) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed || /choose this package|chọn gói này/i.test(trimmed)) return fallback
  return trimmed
}

function normalizePackageStoryLabel(value: string | undefined, fallback: string) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed || /see case studies|xem chuyện tình|stories\s*[?�→]/i.test(trimmed)) return fallback
  return trimmed
}

function packageBadgeLabel(item: CmsBlockItem, tone: PackageTone, lang: BrandLang) {
  if (tone === 'start') return ''
  const customLabel = item.label?.trim()
  if (tone === 'scale') return customLabel || 'Custom'
  if (!customLabel) return 'Most Popular'
  if (lang === 'en' && /được chọn nhiều nhất|most popular/i.test(customLabel)) return 'Most Popular'
  return customLabel
}

function fallbackComparisonRows(tone: PackageTone, lang: BrandLang): CmsPackageComparisonRow[] {
  const isVi = lang === 'vi'
  const labels = isVi
    ? ['Landing pages', 'Vận hành thương mại điện tử', 'Tổ chức sự kiện']
    : ['Landing pages', 'E-commerce ops', 'Event execution']

  if (tone === 'start') {
    return [
      { label: labels[0], value: isVi ? '10 trang' : '10 pages', availability: 'included' },
      { label: labels[1], value: isVi ? 'Không bao gồm' : 'No access', availability: 'excluded' },
      { label: labels[2], value: isVi ? 'Không bao gồm' : 'No access', availability: 'excluded' },
    ]
  }

  if (tone === 'system') {
    return [
      { label: labels[0], value: isVi ? 'Không giới hạn' : 'Unlimited', availability: 'included' },
      { label: labels[1], value: isVi ? 'Toàn quyền' : 'Full access', availability: 'included' },
      { label: labels[2], value: isVi ? 'Không bao gồm' : 'No access', availability: 'excluded' },
    ]
  }

  return [
    { label: labels[0], value: isVi ? 'Không giới hạn' : 'Unlimited', availability: 'included' },
    { label: labels[1], value: isVi ? 'Toàn quyền' : 'Full access', availability: 'included' },
    { label: labels[2], value: isVi ? 'Tại sự kiện' : 'On-site', availability: 'included' },
  ]
}

function packageComparisonRows(item: CmsBlockItem, tone: PackageTone, lang: BrandLang) {
  const cmsRows = item.comparisonRows?.filter((row) => row.label.trim() && row.value.trim()) ?? []
  const rows = cmsRows.length ? cmsRows : fallbackComparisonRows(tone, lang)
  return rows.map((row) => ({
    ...row,
    availability: row.availability ?? (/^(?:✗|×)|no access|not included|không bao gồm/i.test(row.value)
      ? 'excluded'
      : 'included'),
  }))
}

function Capacity({ row }: { row: PackageFeatureRow }) {
  const match = row.text.match(/^(.+?content units?\/month)(?:,\s*|\s+[\u2013\u2014-]\s*|\s+)(.+)$/i)
  const main = match?.[1]?.trim() || row.text
  const supporting = match?.[2]?.trim() || ''

  return (
    <div className="package-metric-chip pkg-rv" data-testid="package-capacity">
      <span className="package-capacity-icon" aria-hidden="true">✦</span>
      <span className="sr-only">Package capacity: </span>
      <span className="package-capacity-copy">
        <strong>{main}</strong>
        {supporting && <span>{supporting}</span>}
      </span>
    </div>
  )
}

function PackageComparison({
  item,
  tone,
  lang,
  panelId,
  expanded,
  onToggle,
}: {
  item: CmsBlockItem
  tone: PackageTone
  lang: BrandLang
  panelId: string
  expanded: boolean
  onToggle: () => void
}) {
  const rows = packageComparisonRows(item, tone, lang)
  const toggleLabel = lang === 'vi' ? 'So sánh chi tiết' : 'Compare details'
  const panelLabel = lang === 'vi' ? 'Mức độ dịch vụ' : 'Service access'

  return (
    <div className="package-comparison pkg-rv" data-testid="package-comparison">
      <button
        type="button"
        className="package-comparison-toggle"
        data-testid="package-comparison-toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>{toggleLabel}</span>
        <ChevronDown className={expanded ? 'is-expanded' : ''} size={16} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <div
        id={panelId}
        className={`package-comparison-panel${expanded ? ' is-open' : ''}`}
        data-testid="package-comparison-panel"
        data-expanded={expanded ? 'true' : 'false'}
      >
        <h4 className="package-comparison-title">{panelLabel}</h4>
        <dl className="package-comparison-list">
          {rows.map((row, index) => {
            const availability = row.availability ?? 'included'
            const included = availability === 'included'
            const value = row.value.replace(/^[✓✗×]\s*/, '')
            return (
              <div
                key={`${row.label}-${index}`}
                className="package-comparison-row"
                data-availability={availability}
              >
                <dt>{row.label}</dt>
                <dd>
                  <span className="package-comparison-status" aria-hidden="true">
                    {included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                  <span className="sr-only">{included ? 'Included: ' : 'Not included: '}</span>
                  <span>{value}</span>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </div>
  )
}

export function PackageCards({
  items,
  lang = 'en',
  className = '',
  layout = 'horizontal',
}: {
  items: CmsBlockItem[]
  lang?: BrandLang
  className?: string
  layout?: 'cards' | 'horizontal'
}) {
  const componentId = useId().replace(/:/g, '')
  const cardIds = useMemo(() => items.map(resolvePackageId), [items])
  const [highlightedId, setHighlightedId] = useState('')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [viewportOrder, setViewportOrder] = useState({ mobile: false, ready: false })
  const chooseLabel = lang === 'vi' ? 'Chọn The One này' : 'Pick this One'
  const caseStudyLabel = lang === 'vi' ? 'Xem tất cả stories' : 'View all stories'

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 899px)')
    const syncViewportOrder = () => setViewportOrder({ mobile: mediaQuery.matches, ready: true })
    syncViewportOrder()
    mediaQuery.addEventListener('change', syncViewportOrder)
    return () => mediaQuery.removeEventListener('change', syncViewportOrder)
  }, [])

  useEffect(() => {
    let highlightTimer: number | undefined
    const syncHash = () => {
      const hash = safelyDecodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (!hash || !cardIds.includes(hash)) return
      setHighlightedId(hash)
      if (highlightTimer) window.clearTimeout(highlightTimer)
      highlightTimer = window.setTimeout(() => setHighlightedId(''), 800)
    }

    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => {
      window.removeEventListener('hashchange', syncHash)
      if (highlightTimer) window.clearTimeout(highlightTimer)
    }
  }, [cardIds])

  const cardTones = useMemo(() => resolvePackageTones(items, cardIds), [cardIds, items])
  const cards = useMemo(() => items.map((item, sourceIndex) => {
    const id = cardIds[sourceIndex]
    return {
      item,
      id,
      sourceIndex,
      tone: cardTones[sourceIndex] ?? packageToneOrder[sourceIndex] ?? 'start',
    }
  }), [cardIds, cardTones, items])

  const orderedCards = useMemo(() => {
    if (!viewportOrder.mobile) return cards
    return [...cards].sort((left, right) => Number(right.tone === 'system') - Number(left.tone === 'system'))
  }, [cards, viewportOrder.mobile])

  return (
    <div
      className={`package-grid grid items-stretch gap-5 ${className}`.trim()}
      data-testid="package-grid"
      data-package-layout={layout}
      data-mobile-order-ready={viewportOrder.ready ? 'true' : 'false'}
      data-mobile-order={viewportOrder.mobile ? 'system-first' : 'standard'}
    >
      {orderedCards.map(({ item, id, sourceIndex, tone }, visualIndex) => {
        const {
          subtitle,
          capacity,
          features: sourceFeatures,
          priceLabel,
          priceValue,
          priceSupportingText,
          ctaMicrocopy,
        } = getPackageContent(item)
        const normalizedPrice = normalizePackagePrice(priceLabel, priceValue, priceSupportingText, tone)
        const features = withStartExclusions(sourceFeatures, tone, lang)
        const featured = tone === 'system'
        const highlight = highlightedId === id
        const expanded = Boolean(expandedIds[id])
        const Icon = packageIcons[tone]
        const badgeLabel = packageBadgeLabel(item, tone, lang)
        const headingId = `${componentId}-${packageToken(id)}-title`
        const comparisonPanelId = `${componentId}-${packageToken(id)}-comparison`
        const caseStudyLink = localizedPath(lang, '/the-one')

        return (
          <div
            key={`${id}-${sourceIndex}`}
            className={`package-card-shell${featured ? ' package-card-shell--featured pkg-card-spring' : ''}${highlight ? ' is-anchor-highlighted' : ''}`}
            data-reveal="pkg-card"
            data-reveal-phase="2"
            data-testid="package-card"
            data-package-id={id}
            data-package-tone={tone}
            data-featured={featured ? 'true' : 'false'}
            style={{ '--ri': visualIndex } as CSSProperties}
          >
            <article
              id={id}
              className={`package-card home-package-card${featured ? ' package-card--featured home-package-featured' : ''}${highlight ? ' is-anchor-highlighted' : ''}`}
              data-package-tone={tone}
              data-featured={featured ? 'true' : 'false'}
              aria-labelledby={headingId}
            >
              {badgeLabel && (
                <span className="package-card-badge pkg-rv" style={{ '--pi': 0 } as CSSProperties}>
                  {badgeLabel}
                </span>
              )}

              <div className="package-card-heading pkg-rv" style={{ '--pi': 1 } as CSSProperties}>
                <span className="package-tone-icon" aria-hidden="true">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="package-tone-image" />
                  ) : (
                    <CmsIcon name={item.icon} fallback={Icon} size={22} />
                  )}
                </span>
                <div>
                  <h3 id={headingId} className="package-card-name">{item.title}</h3>
                  {subtitle && <p className="package-card-description">{subtitle}</p>}
                </div>
              </div>

              {normalizedPrice.priceValue && (
                <div
                  className="package-card-price pkg-rv"
                  data-testid="package-price"
                  style={{ '--pi': 2 } as CSSProperties}
                >
                  {normalizedPrice.priceLabel && <p className="package-price-label">{normalizedPrice.priceLabel}</p>}
                  <p className="package-price-value">
                    <span>{normalizedPrice.priceValue}</span>
                    {normalizedPrice.priceSuffix && (
                      <span className="package-price-suffix">{normalizedPrice.priceSuffix}</span>
                    )}
                  </p>
                  {normalizedPrice.priceSupportingText && (
                    <p className="package-price-supporting">{normalizedPrice.priceSupportingText}</p>
                  )}
                </div>
              )}

              <div className="package-card-cta-block pkg-rv" style={{ '--pi': 3 } as CSSProperties}>
                <button
                  type="button"
                  className="package-cta"
                  data-testid="package-cta"
                  onClick={() => openBookingModal(`package-${tone}`)}
                >
                  {normalizePackageCtaLabel(item.ctaText, chooseLabel)}
                </button>
                {ctaMicrocopy && <p className="package-cta-microcopy">{ctaMicrocopy}</p>}
              </div>

              {capacity && <Capacity row={capacity} />}

              {features.length > 0 && (
                <ul className="package-card-features">
                  {features.map((feature, featureIndex) => (
                    <PackageFeatureRowView
                      key={`${id}-feature-${featureIndex}-${feature.label ?? feature.group ?? ''}`}
                      row={feature}
                      tone={tone}
                      style={{ '--pi': 4 + featureIndex } as CSSProperties}
                    />
                  ))}
                </ul>
              )}

              <PackageComparison
                item={item}
                tone={tone}
                lang={lang}
                panelId={comparisonPanelId}
                expanded={expanded}
                onToggle={() => setExpandedIds((current) => ({ ...current, [id]: !current[id] }))}
              />

              <a className="package-stories-link pkg-rv" href={caseStudyLink}>
                {normalizePackageStoryLabel(item.caseStudyLabel, caseStudyLabel)}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </article>
          </div>
        )
      })}
    </div>
  )
}
