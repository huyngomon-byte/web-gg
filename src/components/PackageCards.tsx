'use client'

import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight, Check, Megaphone, Rocket, Workflow, X } from 'lucide-react'
import { localizedPath, type BrandLang } from '../brandContent'
import type {
  CmsBlockItem,
  CmsPackageComparisonRow,
  CmsPackageMetric,
  CmsPackageModuleId,
} from '../cms/types'
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
  module?: CmsPackageModuleId
  statusLabel?: string
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

export type PackageValueKind = 'quantity' | 'unlimited' | 'full' | 'none' | 'onsite' | 'neutral'

const packageIcons = {
  start: Rocket,
  system: Workflow,
  scale: Megaphone,
} satisfies Record<PackageTone, typeof Rocket>

export const packageModuleOrder = ['output', 'content', 'web', 'growth'] as const satisfies readonly CmsPackageModuleId[]

const packageModuleCopy: Record<BrandLang, Record<CmsPackageModuleId, string>> = {
  en: {
    output: 'Output & Cadence',
    content: 'Content Engine',
    web: 'Web & Commerce',
    growth: 'Growth & Activation',
  },
  vi: {
    output: 'Sản lượng & Nhịp vận hành',
    content: 'Hệ thống nội dung',
    web: 'Web & Thương mại',
    growth: 'Tăng trưởng & Kích hoạt',
  },
}

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

function normalizePackageDescription(value: string, tone: PackageTone, lang: BrandLang) {
  if (lang !== 'en') return value
  const normalized = value.trim()
  if (
    tone === 'system'
    && normalized.toLocaleLowerCase() === 'for brands that need content, website and paid media running as one stable system.'
  ) {
    return 'Content, website and paid media running as one stable system.'
  }
  if (
    tone === 'scale'
    && normalized.toLocaleLowerCase() === 'for brands ready for strong growth: large campaigns, event execution, branch expansion or specific revenue targets.'
  ) {
    return 'For strong growth: big campaigns, events, expansion or revenue targets.'
  }
  return value
}

export function resolvePackageValueKind(
  value: string,
  availability: 'included' | 'excluded' | 'unlisted' = 'included',
): PackageValueKind {
  const normalized = value.trim().toLocaleLowerCase()
  if (
    availability !== 'included'
    || /^(?:no access|not included|none|không bao gồm|chưa công bố|—)$/i.test(normalized)
  ) return 'none'
  if (/on[- ]site|tại sự kiện/i.test(normalized)) return 'onsite'
  if (/full access|toàn quyền/i.test(normalized)) return 'full'
  if (/unlimited|không giới hạn|∞/i.test(normalized)) return 'unlimited'
  if (/\d|\bup to\b|\bminimum\b|\btối đa\b|\btối thiểu\b/i.test(normalized)) return 'quantity'
  return 'neutral'
}

function getPackageContent(item: CmsBlockItem, tone: PackageTone, lang: BrandLang) {
  const parsed = parsePackageBody(item.body)
  const savingsNotePattern = /might be cheaper than|có thể rẻ hơn/i
  const savingsNote = item.features?.find((feature) => savingsNotePattern.test(feature.text))?.text
    || parsed.bullets.find((line) => savingsNotePattern.test(line))
    || (tone === 'scale'
      ? lang === 'vi' ? 'Có thể rẻ hơn The One Start 😉' : 'Might be cheaper than The One Start 😉'
      : '')
  const fallbackDeliverables = normalizePackageDeliverables(
    parsed.bullets.filter((line) => !savingsNotePattern.test(line)),
  )
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

  const cmsFeatures = item.features?.filter((feature) => (
    (feature.label?.trim() || feature.text.trim())
    && !savingsNotePattern.test(feature.text)
  )) ?? []
  const rows: PackageFeatureRow[] = cmsFeatures.length ? cmsFeatures : fallbackFeatures
  const featureCapacity = rows.find(isContentMetricRow)
  const parsedCapacity = !featureCapacity
    ? fallbackFeatures.find(isContentMetricRow)
    : undefined
  const capacity = featureCapacity ?? parsedCapacity
  const cmsMetrics = item.packageMetrics?.filter((metric) => metric.value.trim() && metric.label.trim()) ?? []
  const capacityMetrics: CmsPackageMetric[] = capacity
    ? (() => {
        const match = capacity.text.match(/^(\d+[+]?)\s+(.+?)(?:,|\s+\(|\s+[\u2013\u2014-]\s+|$)/i)
        return match
          ? [{ value: match[1].trim(), label: match[2].trim() }]
          : [{ value: capacity.text, label: '' }]
      })()
    : []
  const comparisonMetrics = (item.comparisonRows?.length ? item.comparisonRows : fallbackComparisonRows(tone, lang))
    .filter((row) => row.label.trim() && row.value.trim())
    .map((row) => ({ value: row.value.replace(/^[✓✗×]\s*/, ''), label: row.label }))
  const fallbackMetrics = [...capacityMetrics, ...comparisonMetrics]
    .filter((metric, index, all) => all.findIndex((candidate) => (
      candidate.value.toLocaleLowerCase() === metric.value.toLocaleLowerCase()
      && candidate.label.toLocaleLowerCase() === metric.label.toLocaleLowerCase()
    )) === index)
    .slice(0, 3)

  return {
    subtitle: normalizePackageDescription(item.subtitle?.trim() || parsed.subtitle, tone, lang),
    metrics: cmsMetrics.length ? cmsMetrics : fallbackMetrics,
    features: rows,
    savingsNote,
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
  let normalizedSupportingText = tone === 'system'
    ? priceSupportingText || 'All-in-one: content + web + ads'
    : ''
  let pricePanelSupportingText = tone === 'scale' ? priceSupportingText : ''
  let displayValue = normalizedValue

  if (tone === 'scale') {
    const customPrice = normalizedValue.match(/^(.+?)\s+[\u2013\u2014-]\s+(.+)$/)
    if (customPrice) {
      displayValue = customPrice[1].trim()
      if (!pricePanelSupportingText) pricePanelSupportingText = customPrice[2].trim()
    }
  }

  const suffixMatch = displayValue.match(/^(.+?)(\/(?:month|tháng))$/i)

  return {
    priceLabel: normalizedLabel,
    priceValue: suffixMatch?.[1].trim() || displayValue,
    priceSuffix: suffixMatch?.[2] || '',
    priceSupportingText: normalizedSupportingText,
    pricePanelSupportingText,
  }
}

function packageAlignmentMicrocopy(
  tone: PackageTone,
  lang: BrandLang,
  systemSupportingText: string,
) {
  if (tone === 'system') return systemSupportingText
  if (tone === 'start') return lang === 'vi' ? 'Nền tảng thiết yếu, sẵn sàng trong vài tuần' : 'The essentials, live in weeks'
  return lang === 'vi' ? 'Thiết kế theo đúng mục tiêu của bạn' : 'Scoped around your target'
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
  // Three public tiers are the supported homepage contract. For one to three
  // records, resolve duplicates into a unique deterministic set. More than
  // three records cannot be unique within this taxonomy, so preserve source
  // intent instead of silently dropping content.
  if (items.length > packageToneOrder.length) return requested

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

export function resolvePackageModule(
  row: Pick<PackageFeatureRow, 'text' | 'group' | 'label' | 'module'>,
): CmsPackageModuleId {
  if (row.module && packageModuleOrder.includes(row.module)) return row.module

  const source = `${row.group ?? ''} ${row.label ?? ''} ${row.text}`.toLocaleLowerCase()
  if (/capacity|content units?|short[- ]form|reels?|cadence|output|sản lượng|nhịp vận hành/.test(source)) return 'output'
  if (/content engine|content strategy|content calendar|production|publishing|posting|system base|everything included|hệ thống nội dung/.test(source)) return 'content'
  if (/website|landing page|e-?commerce|commerce|shopee|tiktok shop|lazada|booking|sales site|thương mại|trang đích/.test(source)) return 'web'
  if (/performance|campaign|event|activation|media|ad spend|marketing|growth|deliverables|tăng trưởng|sự kiện|kích hoạt/.test(source)) return 'growth'
  return 'output'
}

export function groupPackageFeatures(features: PackageFeatureRow[]) {
  return packageModuleOrder
    .map((module) => ({ module, rows: features.filter((row) => resolvePackageModule(row) === module) }))
    .filter((group) => group.rows.length > 0)
}

function PackageFeatureRowView({
  row,
  tone,
  lang,
  module,
  style,
}: {
  row: PackageFeatureRow
  tone: PackageTone
  lang: BrandLang
  module: CmsPackageModuleId
  style?: CSSProperties
}) {
  const presentation = getPackageFeaturePresentation(row)
  const availability = row.availability ?? 'included'
  const included = availability === 'included'
  const systemBase = tone === 'scale' && /everything included in the one system|bao gồm toàn bộ the one system/i.test(row.text)
  const moduleTitle = packageModuleCopy[lang][module]
  const detailLabel = packageToken(presentation.group) === packageToken(moduleTitle) ? '' : presentation.group
  const statusLabel = row.statusLabel?.trim() || (included
    ? lang === 'vi' ? 'Bao gồm' : 'Included'
    : lang === 'vi' ? 'Không bao gồm' : 'No access')

  return (
    <li
      className={`package-feature-row pkg-rv${systemBase ? ' package-feature-row--system-base' : ''}`}
      style={style}
      data-testid="package-feature-row"
      data-package-module={module}
      data-feature-group={presentation.group}
      data-featured={row.featured === true ? 'true' : 'false'}
      data-availability={availability}
      data-value-kind={resolvePackageValueKind(statusLabel, availability)}
      data-system-base={systemBase ? 'true' : 'false'}
    >
      <span className="package-feature-status" aria-hidden="true">
        {included ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}
      </span>
      <span className="sr-only">
        {included
          ? lang === 'vi' ? 'Bao gồm: ' : 'Included: '
          : lang === 'vi' ? 'Không bao gồm: ' : 'Not included: '}
      </span>
      <span className="package-feature-copy">
        {detailLabel && <span className="package-feature-group">{detailLabel}</span>}
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
      <span className="package-feature-value" aria-hidden="true">{statusLabel}</span>
    </li>
  )
}

function PackageSavingsNote({ text }: { text: string }) {
  if (!text) return null
  const match = text.match(/cheaper|rẻ hơn/i)
  if (!match || match.index === undefined) {
    return <p className="package-scale-savings">{text}</p>
  }
  return (
    <p className="package-scale-savings" data-testid="package-scale-savings">
      {text.slice(0, match.index)}
      <strong>{match[0]}</strong>
      {text.slice(match.index + match[0].length)}
    </p>
  )
}

function PackageServiceModules({
  features,
  savingsNote,
  tone,
  lang,
}: {
  features: PackageFeatureRow[]
  savingsNote: string
  tone: PackageTone
  lang: BrandLang
}) {
  const groups = groupPackageFeatures(features)
  const moduleComponentId = useId().replace(/:/g, '')
  const [openModule, setOpenModule] = useState<CmsPackageModuleId>('output')
  const activeModule = groups.some((group) => group.module === openModule) ? openModule : groups[0]?.module ?? 'output'

  return (
    <div className="package-service-modules" data-testid="package-service-modules">
      {groups.map(({ module, rows }, moduleIndex) => (
        (() => {
          const panelId = `${moduleComponentId}-${module}-panel`
          const expanded = activeModule === module
          return (
            <section
              key={module}
              className="package-service-module pkg-rv"
              data-package-module={module}
              style={{ '--pi': 6 + moduleIndex } as CSSProperties}
            >
              <h4 className="package-service-module-heading package-service-module-heading--desktop">
                <span aria-hidden="true" />
                {packageModuleCopy[lang][module]}
              </h4>
              <button
                type="button"
                className="package-service-module-toggle"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenModule(module)}
              >
                <span>{packageModuleCopy[lang][module]}</span>
                <span aria-hidden="true">{expanded ? '−' : '+'}</span>
              </button>
              <div
                id={panelId}
                className={`package-service-module-panel${expanded ? ' is-open' : ''}`}
                data-expanded={expanded ? 'true' : 'false'}
              >
                <ul className="package-card-features package-service-module-list">
                  {rows.map((feature, featureIndex) => (
                    <PackageFeatureRowView
                      key={`${module}-${featureIndex}-${feature.label ?? feature.group ?? ''}`}
                      row={feature}
                      tone={tone}
                      lang={lang}
                      module={module}
                      style={{ '--pi': 7 + moduleIndex + featureIndex } as CSSProperties}
                    />
                  ))}
                </ul>
              </div>
            </section>
          )
        })()
      ))}
      {tone === 'scale' && <PackageSavingsNote text={savingsNote} />}
    </div>
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
      { label: labels[0], value: isVi ? 'Tối đa 10 trang' : 'Up to 10 pages', availability: 'included', module: 'web' },
      { label: labels[1], value: isVi ? 'Không bao gồm' : 'No access', availability: 'excluded', module: 'web' },
      { label: labels[2], value: isVi ? 'Không bao gồm' : 'No access', availability: 'excluded', module: 'growth' },
    ]
  }

  if (tone === 'system') {
    return [
      { label: labels[0], value: isVi ? 'Không giới hạn' : 'Unlimited', availability: 'included', module: 'web' },
      { label: labels[1], value: isVi ? 'Toàn quyền' : 'Full access', availability: 'included', module: 'web' },
      { label: labels[2], value: isVi ? 'Không bao gồm' : 'No access', availability: 'excluded', module: 'growth' },
    ]
  }

  return [
    { label: labels[0], value: isVi ? 'Không giới hạn' : 'Unlimited', availability: 'included', module: 'web' },
    { label: labels[1], value: isVi ? 'Toàn quyền' : 'Full access', availability: 'included', module: 'web' },
    { label: labels[2], value: isVi ? 'Tại sự kiện' : 'On-site', availability: 'included', module: 'growth' },
  ]
}

function packageComparisonRows(item: CmsBlockItem, tone: PackageTone, lang: BrandLang) {
  const cmsRows = item.comparisonRows?.filter((row) => row.label.trim() && row.value.trim()) ?? []
  const rows = cmsRows.length ? cmsRows : fallbackComparisonRows(tone, lang)
  return rows.map((row) => ({
    ...row,
    module: row.module ?? resolvePackageModule({ label: row.label, text: row.value }),
    availability: row.availability ?? (/^(?:✗|×)|no access|not included|không bao gồm/i.test(row.value)
      ? 'excluded'
      : 'included'),
  }))
}

function PackageMetricRail({ metrics, lang }: { metrics: CmsPackageMetric[]; lang: BrandLang }) {
  return (
    <dl
      className="package-metric-rail pkg-rv"
      data-testid="package-metric-rail"
      aria-label={lang === 'vi' ? 'Chỉ số chính của gói' : 'Package highlights'}
      style={{ '--pi': 4 } as CSSProperties}
    >
      {metrics.slice(0, 3).map((metric, index) => (
        <div
          className="package-metric"
          data-testid="package-metric"
          data-metric-kind={resolvePackageValueKind(metric.value)}
          key={`${metric.value}-${metric.label}-${index}`}
        >
          <dt>{metric.label || (lang === 'vi' ? 'Quy mô gói' : 'Package capacity')}</dt>
          <dd>{metric.value}</dd>
        </div>
      ))}
    </dl>
  )
}

type PackageComparisonValue = {
  value: string
  availability: 'included' | 'excluded'
}

export type PackageComparisonGroup = {
  module: CmsPackageModuleId
  title: string
  rows: Array<{
    key: string
    label: string
    values: Partial<Record<PackageTone, PackageComparisonValue>>
  }>
}

function comparisonRowKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildPackageComparisonGroups(
  plans: Array<{ item: CmsBlockItem; tone: PackageTone }>,
  lang: BrandLang,
): PackageComparisonGroup[] {
  const grouped = new Map<CmsPackageModuleId, Map<string, PackageComparisonGroup['rows'][number]>>()

  for (const { item, tone } of plans) {
    for (const row of packageComparisonRows(item, tone, lang)) {
      const module = row.module ?? 'output'
      const moduleRows = grouped.get(module) ?? new Map<string, PackageComparisonGroup['rows'][number]>()
      const key = comparisonRowKey(row.label) || `${module}-${moduleRows.size + 1}`
      const normalized = moduleRows.get(key) ?? { key, label: row.label, values: {} }
      if (!normalized.values[tone]) {
        normalized.values[tone] = {
          value: row.value.replace(/^[✓✗×]\s*/, ''),
          availability: row.availability ?? 'included',
        }
      }
      moduleRows.set(key, normalized)
      grouped.set(module, moduleRows)
    }
  }

  return packageModuleOrder.flatMap((module) => {
    const rows = Array.from(grouped.get(module)?.values() ?? [])
    return rows.length ? [{ module, title: packageModuleCopy[lang][module], rows }] : []
  })
}

type PackageCardModel = {
  item: CmsBlockItem
  id: string
  sourceIndex: number
  tone: PackageTone
}

function PackageCompareAll({
  cards,
  activeTone,
  lang,
  headingId,
}: {
  cards: PackageCardModel[]
  activeTone: PackageTone
  lang: BrandLang
  headingId: string
}) {
  const groups = buildPackageComparisonGroups(cards, lang)
  if (!groups.length) return null
  const copy = lang === 'vi'
    ? {
        eyebrow: 'ĐẶT CẠNH NHAU',
        heading: 'So sánh tất cả gói',
        body: 'Xem chính xác phạm vi của từng gói.',
        service: 'Hạng mục',
        notListed: 'Chưa công bố',
      }
    : {
        eyebrow: 'SIDE BY SIDE',
        heading: 'Compare all packages',
        body: 'See exactly what each package covers.',
        service: 'Service',
        notListed: 'Not listed',
      }

  return (
    <section className="package-compare-all pkg-rv" data-testid="package-compare-all" aria-labelledby={headingId}>
      <header className="package-compare-header">
        <div>
          <p>{copy.eyebrow}</p>
          <h3 id={headingId}>{copy.heading}</h3>
          <span>{copy.body}</span>
        </div>
      </header>
      <div className="package-compare-table-wrap">
        <table className="package-compare-table">
          <colgroup>
            <col className="package-compare-service-column" />
            {cards.map(({ tone, id }) => (
              <col key={`${id}-compare-column`} data-package-tone={tone} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col">{copy.service}</th>
              {cards.map(({ item, tone, id }) => (
                <th
                  key={`${id}-compare-heading`}
                  scope="col"
                  data-package-tone={tone}
                  data-mobile-active={activeTone === tone ? 'true' : 'false'}
                >
                  {item.title}
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.module} data-package-module={group.module}>
                <tr className="package-compare-group-row" data-package-module={group.module}>
                  <th scope="rowgroup" colSpan={cards.length + 1}>{group.title}</th>
                </tr>
                {group.rows.map((row) => (
                  <tr
                    className="package-compare-service-row"
                    data-testid="package-comparison-row"
                    data-package-module={group.module}
                    key={`${group.module}-${row.key}`}
                  >
                    <th scope="row">{row.label}</th>
                    {cards.map(({ item, tone, id }) => {
                      const cell = row.values[tone]
                      const included = cell?.availability !== 'excluded'
                      return (
                        <td
                          key={`${id}-${row.key}`}
                          data-package-tone={tone}
                          data-package-label={item.title}
                          data-mobile-active={activeTone === tone ? 'true' : 'false'}
                          data-availability={cell?.availability ?? 'unlisted'}
                          data-value-kind={resolvePackageValueKind(cell?.value ?? '—', cell?.availability ?? 'unlisted')}
                        >
                          {cell ? (
                            <>
                              <span className="package-comparison-status" aria-hidden="true">
                                {included ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                              </span>
                              <span className="sr-only">
                                {included
                                  ? lang === 'vi' ? 'Bao gồm: ' : 'Included: '
                                  : lang === 'vi' ? 'Không bao gồm: ' : 'Not included: '}
                              </span>
                              <span>{cell.value}</span>
                            </>
                          ) : <span className="package-compare-unlisted" aria-label={copy.notListed}>—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </div>
      <div className="package-compare-mobile" data-testid="package-comparison-stack">
        {groups.map((group) => {
          const groupId = `${headingId}-${group.module}`
          return (
            <section
              className="package-compare-mobile-group"
              data-package-module={group.module}
              key={`${group.module}-mobile`}
              aria-labelledby={groupId}
            >
              <h4 id={groupId}>{group.title}</h4>
              <div className="package-compare-mobile-services">
                {group.rows.map((row) => (
                  <article
                    className="package-compare-mobile-service"
                    data-testid="package-comparison-service-card"
                    data-package-module={group.module}
                    key={`${group.module}-${row.key}-mobile`}
                  >
                    <h5>{row.label}</h5>
                    <dl>
                      {cards.map(({ item, tone, id }) => {
                        const cell = row.values[tone]
                        const included = cell?.availability !== 'excluded'
                        return (
                          <div
                            className="package-compare-mobile-plan"
                            data-testid="package-comparison-plan-row"
                            data-package-tone={tone}
                            data-availability={cell?.availability ?? 'unlisted'}
                            data-value-kind={resolvePackageValueKind(cell?.value ?? '—', cell?.availability ?? 'unlisted')}
                            key={`${id}-${row.key}-mobile`}
                          >
                            <dt>{item.title}</dt>
                            <dd>
                              {cell ? (
                                <>
                                  <span className="package-comparison-status" aria-hidden="true">
                                    {included ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                                  </span>
                                  <span className="sr-only">
                                    {included
                                      ? lang === 'vi' ? 'Bao gồm: ' : 'Included: '
                                      : lang === 'vi' ? 'Không bao gồm: ' : 'Not included: '}
                                  </span>
                                  <span>{cell.value}</span>
                                </>
                              ) : <span className="package-compare-unlisted" aria-label={copy.notListed}>—</span>}
                            </dd>
                          </div>
                        )
                      })}
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </section>
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
  const [selectedTone, setSelectedTone] = useState<PackageTone>('system')
  const chooseLabel = lang === 'vi' ? 'Chọn The One này' : 'Pick this One'
  const caseStudyLabel = lang === 'vi' ? 'Xem tất cả stories' : 'View all stories'

  const cardTones = useMemo(() => resolvePackageTones(items, cardIds), [cardIds, items])
  const cards = useMemo<PackageCardModel[]>(() => items
    .map((item, sourceIndex) => ({
      item,
      id: cardIds[sourceIndex],
      sourceIndex,
      tone: cardTones[sourceIndex] ?? packageToneOrder[sourceIndex] ?? 'start',
    }))
    .sort((left, right) => {
      const toneDifference = packageToneOrder.indexOf(left.tone) - packageToneOrder.indexOf(right.tone)
      return toneDifference || left.sourceIndex - right.sourceIndex
    }), [cardIds, cardTones, items])
  const activeTone = cards.some((card) => card.tone === selectedTone)
    ? selectedTone
    : cards[0]?.tone ?? 'system'

  useEffect(() => {
    let highlightTimer: number | undefined
    const syncHash = () => {
      const hash = safelyDecodeURIComponent(window.location.hash.replace(/^#/, ''))
      const matchingCard = cards.find((card) => card.id === hash)
      if (!matchingCard) return
      setHighlightedId(hash)
      setSelectedTone(matchingCard.tone)
      if (highlightTimer) window.clearTimeout(highlightTimer)
      highlightTimer = window.setTimeout(() => setHighlightedId(''), 800)
    }

    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => {
      window.removeEventListener('hashchange', syncHash)
      if (highlightTimer) window.clearTimeout(highlightTimer)
    }
  }, [cards])

  const selectorLabel = lang === 'vi' ? 'Chọn gói để xem chi tiết' : 'Choose a package to view details'
  const comparisonHeadingId = `${componentId}-compare-title`

  return (
    <div className="package-plans" data-testid="package-plans">
      <div className="package-tier-selector" role="group" aria-label={selectorLabel} data-testid="package-tier-selector">
        {cards.map(({ item, tone, id }, selectorIndex) => (
          <button
            key={`${id}-selector`}
            id={`${componentId}-${packageToken(id)}-selector`}
            type="button"
            className="package-tier-selector-button"
            data-package-tone={tone}
            aria-pressed={activeTone === tone}
            aria-controls={id}
            onClick={() => setSelectedTone(tone)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const nextIndex = event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? cards.length - 1
                  : (selectorIndex + (event.key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length
              const nextCard = cards[nextIndex]
              if (!nextCard) return
              setSelectedTone(nextCard.tone)
              window.requestAnimationFrame(() => {
                document.getElementById(`${componentId}-${packageToken(nextCard.id)}-selector`)?.focus()
              })
            }}
          >
            <span>{tone === 'start' ? 'Start' : tone === 'system' ? 'System' : 'Scale'}</span>
            <small>{item.title}</small>
          </button>
        ))}
      </div>

      <div
        className={`package-grid grid items-stretch gap-5 ${className}`.trim()}
        data-testid="package-grid"
        data-package-layout={layout}
        data-mobile-order-ready="true"
        data-mobile-order="system-first-mobile-stack"
      >
        {cards.map(({ item, id, sourceIndex, tone }, visualIndex) => {
          const {
            subtitle,
            metrics,
            features,
            savingsNote,
            priceLabel,
            priceValue,
            priceSupportingText,
            ctaMicrocopy,
          } = getPackageContent(item, tone, lang)
          const normalizedPrice = normalizePackagePrice(priceLabel, priceValue, priceSupportingText, tone)
          const alignmentMicrocopy = packageAlignmentMicrocopy(
            tone,
            lang,
            normalizedPrice.priceSupportingText,
          )
          const featured = tone === 'system'
          const highlight = highlightedId === id
          const Icon = packageIcons[tone]
          const badgeLabel = packageBadgeLabel(item, tone, lang)
          const headingId = `${componentId}-${packageToken(id)}-title`
          const caseStudyLink = item.caseStudyLink?.trim() || localizedPath(lang, '/the-one')
          const ctaHref = item.ctaHref?.trim()
          const ctaLabel = normalizePackageCtaLabel(item.ctaText, chooseLabel)

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
              data-mobile-active={activeTone === tone ? 'true' : 'false'}
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

                <div className="package-card-summary">
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
                    </div>
                  </div>

                  <p
                    className="package-card-description pkg-rv"
                    style={{ '--pi': 2 } as CSSProperties}
                    aria-hidden={subtitle ? undefined : 'true'}
                  >
                    {subtitle || '\u00a0'}
                  </p>

                  <div
                    className="package-card-price pkg-rv"
                    data-testid="package-price"
                    style={{ '--pi': 3 } as CSSProperties}
                  >
                    {normalizedPrice.priceLabel && <p className="package-price-label">{normalizedPrice.priceLabel}</p>}
                    {normalizedPrice.priceValue && (
                      <p className="package-price-value">
                        <span>{normalizedPrice.priceValue}</span>
                        {normalizedPrice.priceSuffix && (
                          <span className="package-price-suffix">{normalizedPrice.priceSuffix}</span>
                        )}
                      </p>
                    )}
                    {normalizedPrice.pricePanelSupportingText && (
                      <p className="package-price-panel-note">{normalizedPrice.pricePanelSupportingText}</p>
                    )}
                  </div>

                  <p
                    className="package-price-supporting pkg-rv"
                    data-testid="package-alignment-microcopy"
                    style={{ '--pi': 4 } as CSSProperties}
                  >
                    {alignmentMicrocopy || '\u00a0'}
                  </p>

                  <div className="package-card-cta-block pkg-rv" style={{ '--pi': 5 } as CSSProperties}>
                    {ctaHref ? (
                      <a className="package-cta" data-testid="package-cta" href={ctaHref}>{ctaLabel}</a>
                    ) : (
                      <button
                        type="button"
                        className="package-cta"
                        data-testid="package-cta"
                        onClick={() => openBookingModal(`package-${tone}`)}
                      >
                        {ctaLabel}
                      </button>
                    )}
                    {ctaMicrocopy && <p className="package-cta-microcopy">{ctaMicrocopy}</p>}
                  </div>

                  <PackageMetricRail metrics={metrics} lang={lang} />
                </div>

                <PackageServiceModules features={features} savingsNote={savingsNote} tone={tone} lang={lang} />

                <div className="package-stories-row pkg-rv" style={{ '--pi': 12 } as CSSProperties}>
                  <a className="package-stories-link" href={caseStudyLink}>
                    {normalizePackageStoryLabel(item.caseStudyLabel, caseStudyLabel)}
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </div>
          )
        })}
      </div>

      <PackageCompareAll cards={cards} activeTone={activeTone} lang={lang} headingId={comparisonHeadingId} />
    </div>
  )
}
