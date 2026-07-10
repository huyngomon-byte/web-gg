'use client'

import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight, Check, ChevronDown, Megaphone, Rocket, Workflow } from 'lucide-react'
import { localizedPath, type BrandLang } from '../brandContent'
import type { CmsBlockItem } from '../cms/types'
import { CmsIcon } from './CmsIcon'
import { openBookingModal } from './openBookingModal'

const packageIcons = [Rocket, Workflow, Megaphone]
function resolvePackageId(item: CmsBlockItem) {
  const hash = item.href?.match(/#([^#?]+)/)?.[1]
  // `#packages` is the shared homepage-section destination, not a card id.
  if (hash && hash !== 'packages') return decodeURIComponent(hash)
  return item.title
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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

type NormalizedPackageDeliverable =
  | { type: 'metric'; value: string; body: string }
  | { type: 'task'; title: string; body: string }

function normalizePackageDeliverables(lines: string[]): NormalizedPackageDeliverable[] {
  return lines.map((line) => {
    const metricMatch = line.match(/^(\d+\s+content units\/month)(?:\s+\((.+)\))?$/i)
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

function isMetricDeliverable(deliverable: NormalizedPackageDeliverable): deliverable is Extract<NormalizedPackageDeliverable, { type: 'metric' }> {
  return deliverable.type === 'metric'
}

function getPackageContent(item: CmsBlockItem) {
  const parsed = parsePackageBody(item.body)
  const fallbackDeliverables = normalizePackageDeliverables(parsed.bullets)
  const fallbackFeatures = fallbackDeliverables.map((deliverable) => {
    if (isMetricDeliverable(deliverable)) {
      return {
        label: 'CONTENT ENGINE',
        text: [deliverable.value, deliverable.body].filter(Boolean).join(' - '),
      }
    }
    return {
      label: deliverable.title.toUpperCase(),
      text: deliverable.body,
    }
  })

  return {
    subtitle: item.subtitle?.trim() || parsed.subtitle,
    features: item.features?.filter((feature) => feature.label?.trim() || feature.text.trim()) ?? fallbackFeatures,
    priceLabel: item.priceLabel?.trim() || 'MONTHLY SETUP',
    priceValue: item.priceValue?.trim() || parsed.price,
  }
}

type PackageFeatureRow = { text: string; group?: string; label?: string; featured?: boolean }

function isContentMetricRow(row: PackageFeatureRow) {
  return /content units?/i.test(row.text)
}

function rowGroupName(row: PackageFeatureRow) {
  const source = row.group?.trim() || row.label?.trim() || ''
  if (!source) return 'Deliverables'
  // Legacy labels are stored UPPERCASE; show them in title case.
  return source.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
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

// Round 7 A4: compact card shows the content chip + up to 4 featured rows; every
// row (in admin-defined order, grouped only by its own "group" field) lives in
// the expander. No auto-assignment of rows to groups.
function organizePackageFeatures(features: PackageFeatureRow[]) {
  const rows = features.filter((row) => row.text.trim())
  const metricRow = rows.find(isContentMetricRow)
  const listRows = rows.filter((row) => row !== metricRow)
  const flagged = listRows.filter((row) => row.featured === true)
  // Round 8 A4.1: CMS decides how many rows are featured (no hard cap); fallback caps at 4.
  const compactRows = flagged.length ? flagged : listRows.slice(0, 4)

  const groups: Array<{ name: string; rows: PackageFeatureRow[] }> = []
  for (const row of listRows) {
    const name = rowGroupName(row)
    const existing = groups.find((group) => group.name === name)
    if (existing) existing.rows.push(row)
    else groups.push({ name, rows: [row] })
  }

  return { metricRow, compactRows, groups, totalRows: listRows.length }
}

function isSystemPackage(item: CmsBlockItem, index: number) {
  return index === 1 || /system/i.test(item.title)
}

function PackageSelectionControl({
  checked,
  name,
  packageId,
  packageTitle,
  onSelect,
}: {
  checked: boolean
  name: string
  packageId: string
  packageTitle: string
  onSelect: () => void
}) {
  return (
    <label
      className={[
        'mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors',
        checked
          ? 'border-primary/45 bg-primary/10 text-primary'
          : 'border-outline-variant/60 bg-white/45 text-on-surface-variant hover:border-primary/30 hover:bg-primary/5',
      ].join(' ')}
    >
      <input
        type="radio"
        name={name}
        value={packageId}
        checked={checked}
        onChange={onSelect}
        aria-label={`Choose ${packageTitle} package`}
        data-testid="package-radio"
        className="h-5 w-5 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
      <span className="text-xs font-extrabold">
        {checked ? 'Selected package' : 'Select this package'}
      </span>
    </label>
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
  const cardIds = useMemo(() => items.map(resolvePackageId), [items])
  const radioGroupName = `package-selection-${useId().replace(/:/g, '')}`
  const systemIndex = Math.max(0, items.findIndex(isSystemPackage))
  const [selectedIndex, setSelectedIndex] = useState(systemIndex)
  const [highlightedId, setHighlightedId] = useState('')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const chooseLabel = lang === 'vi' ? 'Chọn The One này' : 'Pick this One'
  const caseStudyLabel = lang === 'vi' ? 'Xem tất cả stories' : 'View all stories'

  useEffect(() => {
    setSelectedIndex(systemIndex)
  }, [systemIndex])

  useEffect(() => {
    const syncHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (!hash) return
      const nextIndex = cardIds.indexOf(hash)
      if (nextIndex < 0) return
      setSelectedIndex(nextIndex)
      setHighlightedId(hash)
      window.setTimeout(() => setHighlightedId(''), 800)
    }

    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [cardIds])

  if (layout === 'horizontal') {
    // Round 7 A4: compact "5-line" glass cards on the wave background —
    // icon + name · subtitle · content chip · max 4 featured rows · price · 2 CTAs,
    // with the full grouped deliverable list inside an in-card expander.
    return (
      <div role="radiogroup" aria-label="Choose a package" className={`grid items-stretch gap-5 lg:grid-cols-3 ${className}`}>
        {items.map((item, index) => {
          const { subtitle, features, priceLabel, priceValue } = getPackageContent(item)
          const { metricRow, compactRows, groups, totalRows } = organizePackageFeatures(features)
          const system = isSystemPackage(item, index)
          const id = cardIds[index]
          const highlight = highlightedId === id
          const expanded = Boolean(expandedIds[id])
          const Icon = packageIcons[index] ?? Rocket
          const caseStudyLink = localizedPath(lang, '/the-one')

          const selected = selectedIndex === index

          // Round 12 A4.1 (3rd report): the gradient border + scale + pink shadow
          // used to be hardcoded on the System card, so clicking Start/Scale
          // changed state without any visible response. Emphasis is now driven
          // ONLY by `selected`; the badge alone stays tied to System.
          return (
            <div
              key={`${item.title}-${index}-horizontal`}
              data-reveal="pkg-card"
              data-reveal-phase="2"
              data-testid="package-card"
              data-package-id={id}
              data-selected={selected ? 'true' : 'false'}
              data-system-package={system ? 'true' : 'false'}
              style={{ '--ri': index } as CSSProperties}
              className={[
                'rounded-[22px] p-[2px] transition-[transform,box-shadow] duration-[250ms]',
                system ? 'pkg-card-spring' : '',
                selected ? 'bg-gradient-to-r from-primary via-tertiary to-secondary md:scale-[1.02]' : 'bg-transparent',
              ].join(' ')}
            >
              <article
                id={id}
                className={[
                  // Round 8 A4.2: denser frost so text stays readable over the wave; emphasis by border, never by background.
                  'glass-panel glass-panel--frost relative flex h-full scroll-mt-32 flex-col p-6 transition duration-[250ms]',
                  selected ? 'shadow-[0_24px_60px_-24px_rgba(219,39,119,0.55)]' : '',
                  highlight ? 'is-anchor-highlighted' : '',
                ].join(' ')}
              >
                {system && (
                  <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white shadow-lg">
                    {item.label || 'Most Popular'}
                  </span>
                )}
                {/* Round 12 A3.3: internal cascade — each block carries --pi; CSS turns
                    that into a 60ms/step transition-delay after the card reveals. */}
                <div className="pkg-rv flex items-center gap-3" style={{ '--pi': 0 } as CSSProperties}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.imageAlt || item.title} className="h-7 w-7 object-contain" />
                    ) : (
                      <CmsIcon name={item.icon} fallback={Icon} size={22} />
                    )}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#3d1226]">{item.title}</h3>
                </div>
                {subtitle && <p className="pkg-rv mt-3 text-sm font-semibold leading-relaxed text-[#7a5566]" style={{ '--pi': 1 } as CSSProperties}>{subtitle}</p>}
                <PackageSelectionControl
                  checked={selected}
                  name={radioGroupName}
                  packageId={id}
                  packageTitle={item.title}
                  onSelect={() => setSelectedIndex(index)}
                />
                {metricRow && (
                  // Round 8 A4.2: solid chip — same style on all three cards, no gradient text.
                  <span className="pkg-rv mt-4 w-fit rounded-full border border-[#F9C1D6] bg-[#FFF1F5] px-3 py-1.5 text-xs font-extrabold text-[#B3124B]" style={{ '--pi': 2 } as CSSProperties}>
                    {metricRow.text}
                  </span>
                )}
                {compactRows.length > 0 && (
                  <ul className="package-card-features mt-4 grid gap-2">
                    {compactRows.map((row, rowIndex) => (
                      <li key={`${item.title}-featured-${rowIndex}`} className="pkg-rv flex items-start gap-2 text-[13px] font-semibold leading-snug text-[#3d1226]" style={{ '--pi': 3 + rowIndex } as CSSProperties}>
                        <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                        <span>{row.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {totalRows > compactRows.length && (
                  <button
                    type="button"
                    onClick={() => setExpandedIds((current) => ({ ...current, [id]: !current[id] }))}
                    aria-expanded={expanded}
                    style={{ '--pi': 3 + compactRows.length } as CSSProperties}
                    className="package-card-expander pkg-rv mt-3 inline-flex w-fit items-center gap-1 text-xs font-extrabold text-primary transition-colors hover:text-primary/70"
                  >
                    {expanded ? 'Hide full deliverables' : 'See full deliverables'}
                    <ChevronDown size={14} strokeWidth={3} className={`transition-transform duration-[250ms] ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                )}
                <div className={`package-card-details pkg-acc grid transition-[grid-template-rows] duration-[250ms] ${expanded ? 'is-open grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="mt-3 grid gap-3 rounded-2xl border border-white/70 bg-white/55 p-3.5">
                      {(() => {
                        let accRow = 0
                        return groups.map((group) => (
                          <div key={`${item.title}-group-${group.name}`}>
                            <p className="pkg-acc-row text-[10px] font-black uppercase tracking-[0.14em] text-primary/80" style={{ '--pi': accRow++ } as CSSProperties}>{group.name}</p>
                            <ul className="mt-1.5 grid gap-1.5">
                              {group.rows.map((row, rowIndex) => (
                                <li key={`${item.title}-${group.name}-${rowIndex}`} className="pkg-acc-row flex items-start gap-2 text-[12px] font-semibold leading-relaxed text-[#7a5566]" style={{ '--pi': accRow++ } as CSSProperties}>
                                  <Check size={13} strokeWidth={3} className="mt-0.5 shrink-0 text-primary/70" aria-hidden="true" />
                                  {row.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                </div>
                {priceValue && (
                  <div className="package-card-price pkg-rv mt-5 rounded-2xl border border-primary/15 bg-[#FFF8F4] p-3.5" style={{ '--pi': 4 + compactRows.length } as CSSProperties}>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7a5566]">{priceLabel}</p>
                    <p className="home-price-shimmer mt-1 text-2xl font-extrabold text-[#B3124B]">
                      {priceValue}
                    </p>
                  </div>
                )}
                <div className="package-card-actions pkg-rv mt-auto flex flex-col gap-2 pt-5" style={{ '--pi': 5 + compactRows.length } as CSSProperties}>
                  <button
                    type="button"
                    onClick={openBookingModal}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-primary bg-white/30 px-4 py-2.5 text-sm font-extrabold text-primary transition hover:bg-primary hover:text-white"
                  >
                    {normalizePackageCtaLabel(item.ctaText, chooseLabel)}
                  </button>
                  {caseStudyLink && (
                    <a
                      href={caseStudyLink}
                      className="inline-flex items-center justify-center gap-2 px-2 py-2 text-sm font-extrabold text-primary transition-colors hover:text-primary/70"
                    >
                      {normalizePackageStoryLabel(item.caseStudyLabel, caseStudyLabel)}
                      <ArrowRight size={15} />
                    </a>
                  )}
                </div>
              </article>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div role="radiogroup" aria-label="Choose a package" className={`grid gap-5 md:grid-cols-3 ${className}`}>
      {items.map((item, index) => {
        const { subtitle, features, priceLabel, priceValue } = getPackageContent(item)
        const selected = selectedIndex === index
        const system = isSystemPackage(item, index)
        const id = cardIds[index]
        const highlight = highlightedId === id
        const Icon = packageIcons[index] ?? Rocket
        const caseStudyLink = localizedPath(lang, '/the-one')

        return (
          <div
            key={`${item.title}-${index}`}
            data-reveal="pkg-card"
            data-reveal-phase="2"
            data-testid="package-card"
            data-package-id={id}
            data-selected={selected ? 'true' : 'false'}
            data-system-package={system ? 'true' : 'false'}
            style={{ '--ri': index } as CSSProperties}
            className={system ? 'pkg-card-spring' : undefined}
          >
          <article
            id={id}
            className={[
              'home-package-card package-card glass-card card-hover relative flex scroll-mt-32 flex-col overflow-hidden rounded-2xl p-6 transition duration-300',
              selected ? 'is-selected' : '',
              system ? 'home-package-featured md:-translate-y-2' : '',
              highlight ? 'is-anchor-highlighted' : '',
            ].join(' ')}
          >
            {system && (
              <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white shadow-lg">
                {item.label || 'Most Popular'}
              </span>
            )}
            <span className="pkg-rv icon-chip mb-5 h-12 w-12" style={{ '--pi': 0 } as CSSProperties}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.imageAlt || item.title} className="h-7 w-7 object-contain" />
              ) : (
                <CmsIcon name={item.icon} fallback={Icon} size={22} />
              )}
            </span>
            <h3 className="pkg-rv text-xl font-extrabold text-on-surface" style={{ '--pi': 1 } as CSSProperties}>{item.title}</h3>
            {subtitle && <p className="pkg-rv mt-3 text-sm font-semibold leading-relaxed text-on-surface-variant" style={{ '--pi': 2 } as CSSProperties}>{subtitle}</p>}
            <PackageSelectionControl
              checked={selected}
              name={radioGroupName}
              packageId={id}
              packageTitle={item.title}
              onSelect={() => setSelectedIndex(index)}
            />
            {features.length > 0 && (
              <div className="mt-4 grid gap-2">
                {features.map((feature, featureIndex) => (
                  <div key={`${item.title}-feature-${featureIndex}-${feature.label}`} className="pkg-rv group/task rounded-2xl border border-outline-variant/45 bg-white/60 p-3 transition hover:border-primary/30 hover:bg-primary/5" style={{ '--pi': 3 + featureIndex } as CSSProperties}>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">{feature.label}</p>
                    <p className="mt-1 text-[12px] font-semibold leading-relaxed text-on-surface-variant">{feature.text}</p>
                  </div>
                ))}
              </div>
            )}
            {priceValue && (
              <div className="pkg-rv mt-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-white via-primary/5 to-secondary/10 p-3" style={{ '--pi': 4 + features.length } as CSSProperties}>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">{priceLabel}</p>
                <p className="home-price-shimmer mt-1 text-lg font-black text-primary">
                  {priceValue}
                </p>
              </div>
            )}
            <div className="pkg-rv mt-auto flex flex-col gap-2 pt-5" style={{ '--pi': 5 + features.length } as CSSProperties}>
              <button
                type="button"
                onClick={openBookingModal}
                className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-primary bg-white/20 px-4 py-2.5 text-sm font-extrabold text-primary transition hover:bg-primary hover:text-white"
              >
                {normalizePackageCtaLabel(item.ctaText, chooseLabel)}
              </button>
              {caseStudyLink && (
                <a
                  href={caseStudyLink}
                  className="inline-flex items-center justify-center gap-2 px-2 py-2 text-sm font-extrabold text-primary transition-colors hover:text-primary/70"
                >
                  {normalizePackageStoryLabel(item.caseStudyLabel, caseStudyLabel)}
                  <ArrowRight size={15} />
                </a>
              )}
            </div>
          </article>
          </div>
        )
      })}
    </div>
  )
}
