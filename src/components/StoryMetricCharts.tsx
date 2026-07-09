'use client'

import { memo, useEffect, useId, useRef } from 'react'
import type { CaseStudyMetric } from '../data/caseStudies'

// Round 9 Part B: five self-drawn SVG/CSS chart tiles for the story carousel.
// Honest-data rule: curves only illustrate rhythm — no axes, no invented numbers;
// every visible figure comes straight from the CMS metric.

function parseNumericValue(raw: string): { prefix: string; num: number; suffix: string; decimals: number } | null {
  const match = raw.trim().match(/^([^0-9]*)([\d.,]+)(.*)$/)
  if (!match) return null
  const numeric = Number.parseFloat(match[2].replace(/,/g, ''))
  if (!Number.isFinite(numeric)) return null
  const decimalPart = match[2].split('.')[1]
  return { prefix: match[1], num: numeric, suffix: match[3], decimals: decimalPart ? decimalPart.length : 0 }
}

function CountUpValue({ raw, activated, className }: { raw: string; activated: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)

  // Round 11 §6.3: the counter writes textContent directly inside rAF — no React
  // re-render per animation frame, no layout reads in the loop.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const parsed = parseNumericValue(raw)
    if (!parsed) {
      el.textContent = raw
      return
    }
    if (!activated) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = raw
      return
    }
    let rafId = 0
    const start = performance.now()
    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals })
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 900)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = parsed.prefix + formatter.format(parsed.num * eased) + parsed.suffix
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [activated, raw])

  const parsed = parseNumericValue(raw)
  return (
    <span ref={ref} className={className}>
      {parsed ? parsed.prefix + (0).toFixed(parsed.decimals) + parsed.suffix : raw}
    </span>
  )
}

// Round 10 D.2: a leading minus means "a decrease that is good" (CAC, CPA, cancellations) —
// those rows/bars flip to the amber gradient + a down marker so shorter never reads as worse.
function isDownGoodValue(raw: string | undefined) {
  return /^[−-]/.test((raw ?? '').trim())
}

// Round 10: multi-row bars come from the CMS "series" field: "Label:Value|Label:Value|...".
function parseSeries(raw: string | undefined) {
  if (!raw?.trim()) return null
  const rows = raw
    .split('|')
    .map((part) => {
      const splitIndex = part.lastIndexOf(':')
      if (splitIndex < 0) return { label: part.trim(), value: '' }
      return { label: part.slice(0, splitIndex).trim(), value: part.slice(splitIndex + 1).trim() }
    })
    .filter((row) => row.label || row.value)
  return rows.length >= 2 ? rows : null
}

function parseComparableNumber(raw: string | undefined) {
  if (!raw) return null
  const parsed = parseNumericValue(raw)
  return parsed ? parsed.num : null
}

export const BigStatTile = memo(function BigStatTile({ metric, activated }: { metric: CaseStudyMetric; activated: boolean }) {
  return (
    <div className="story-chart-bignum">
      <svg className="story-chart-spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,28 C18,26 30,20 46,18 C62,16 74,10 100,4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <CountUpValue raw={metric.value} activated={activated} className="story-chart-bignum-value" />
      <span className="story-chart-label">{metric.shortLabel?.trim() || metric.label}</span>
    </div>
  )
})

export function BeforeAfterTile({ metric, activated }: { metric: CaseStudyMetric; activated: boolean }) {
  const from = metric.from?.trim() || ''
  const to = metric.to?.trim() || metric.value
  const fromNum = parseComparableNumber(from)
  const toNum = parseComparableNumber(to)
  const max = fromNum !== null && toNum !== null ? Math.max(fromNum, toNum) : null
  const fromWidth = max && fromNum !== null ? Math.max(8, (fromNum / max) * 100) : 40
  const toWidth = max && toNum !== null ? Math.max(8, (toNum / max) * 100) : 100
  const downGood = isDownGoodValue(to) || (fromNum !== null && toNum !== null && toNum < fromNum)

  return (
    <div className="story-chart-beforeafter">
      <div className="story-chart-ba-row">
        <span className="story-chart-ba-value">{from || '—'}</span>
        <span className="story-chart-ba-bar is-before" style={{ width: `${fromWidth}%` }} />
      </div>
      <span className="story-chart-ba-arrow" aria-hidden="true">→</span>
      <div className="story-chart-ba-row">
        <span className="story-chart-ba-value is-after">{to}{downGood ? ' ▼' : ''}</span>
        <span
          className={`story-chart-ba-bar is-after ${downGood ? 'is-down' : ''} ${activated ? 'is-grown' : ''}`}
          style={{ width: activated ? `${toWidth}%` : '0%' }}
        />
      </div>
      <span className="story-chart-label">{metric.shortLabel?.trim() || metric.label}</span>
    </div>
  )
}

export function DonutTile({ metric, activated }: { metric: CaseStudyMetric; activated: boolean }) {
  const gradientId = useId()
  const percent = Math.max(0, Math.min(100, metric.percent ?? parseComparableNumber(metric.value) ?? 0))
  const radius = 42
  const circumference = 2 * Math.PI * radius

  return (
    <div className="story-chart-donut">
      <svg viewBox="0 0 100 100" role="img" aria-label={`${metric.value} ${metric.label}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2E88" />
            <stop offset="100%" stopColor="#FF9A3D" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={activated ? circumference * (1 - percent / 100) : circumference}
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <CountUpValue raw={metric.value} activated={activated} className="story-chart-donut-value" />
      <span className="story-chart-label">{metric.shortLabel?.trim() || metric.label}</span>
    </div>
  )
}

export function HBarCompareTile({ metric, activated }: { metric: CaseStudyMetric; activated: boolean }) {
  const series = parseSeries(metric.series)
  const ownNum = parseComparableNumber(metric.value)
  const benchNum = parseComparableNumber(metric.benchmarkValue)
  const max = ownNum !== null && benchNum !== null ? Math.max(ownNum, benchNum) : null
  const ownWidth = max && ownNum !== null ? Math.max(12, (ownNum / max) * 100) : 100
  const benchWidth = max && benchNum !== null ? Math.max(12, (benchNum / max) * 100) : 52

  // Round 10: "series" mode — N labelled rows in one grouped chart (year-vs-year,
  // funnels, channel mixes). Rows with a leading minus flip to the down-is-good style.
  if (series) {
    const numbers = series.map((row) => Math.abs(parseComparableNumber(row.value) ?? 0))
    const maxNumber = Math.max(...numbers, 1)
    return (
      <div className="story-chart-bars">
        {series.map((row, rowIndex) => {
          const down = isDownGoodValue(row.value)
          const width = Math.max(10, (numbers[rowIndex] / maxNumber) * 100)
          return (
            <div key={`${metric.label}-series-${rowIndex}`} className="story-chart-bars-row">
              <span className="story-chart-bars-name">{row.label}</span>
              <span
                className={`story-chart-bars-bar ${down ? 'is-down' : 'is-own'}`}
                style={{ width: activated ? `${width}%` : '0%', transitionDelay: `${rowIndex * 140}ms` }}
              />
              <span className="story-chart-ba-value is-after">{row.value}{down ? ' ▼' : ''}</span>
            </div>
          )
        })}
        <span className="story-chart-label">{metric.shortLabel?.trim() || metric.label}</span>
      </div>
    )
  }

  return (
    <div className="story-chart-bars">
      <div className="story-chart-bars-row">
        <span className="story-chart-bars-name">The One</span>
        <span className={`story-chart-bars-bar is-own ${activated ? 'is-grown' : ''}`} style={{ width: activated ? `${ownWidth}%` : '0%' }} />
        <span className="story-chart-ba-value is-after">{metric.value}</span>
      </div>
      <div className="story-chart-bars-row">
        <span className="story-chart-bars-name">{metric.benchmarkLabel?.trim() || 'Industry'}</span>
        <span className={`story-chart-bars-bar is-bench ${activated ? 'is-grown' : ''}`} style={{ width: activated ? `${benchWidth}%` : '0%', transitionDelay: '180ms' }} />
        <span className="story-chart-ba-value">{metric.benchmarkValue?.trim() || ''}</span>
      </div>
      <span className="story-chart-label">{metric.shortLabel?.trim() || metric.label}</span>
    </div>
  )
}

export function TrendLineTile({ metric, activated }: { metric: CaseStudyMetric; activated: boolean }) {
  const gradientId = useId()
  const from = metric.from?.trim() || ''
  const to = metric.to?.trim() || metric.value

  return (
    <div className="story-chart-trend">
      <svg viewBox="0 0 160 72" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${gradientId}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF2E88" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FF9A3D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gradientId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF2E88" />
            <stop offset="100%" stopColor="#FF9A3D" />
          </linearGradient>
        </defs>
        <path
          d="M6,62 C40,58 64,48 92,34 C116,22 134,14 154,8 L154,70 L6,70 Z"
          fill={`url(#${gradientId}-fill)`}
          opacity={activated ? 1 : 0}
          style={{ transition: 'opacity 500ms ease 500ms' }}
        />
        <path
          className={`story-chart-trend-line ${activated ? 'is-drawn' : ''}`}
          d="M6,62 C40,58 64,48 92,34 C116,22 134,14 154,8"
          fill="none"
          stroke={`url(#${gradientId}-line)`}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="6" cy="62" r="3.5" fill="#FF2E88" opacity={activated ? 1 : 0} style={{ transition: 'opacity 300ms ease' }} />
        <circle cx="154" cy="8" r="3.5" fill="#FF9A3D" opacity={activated ? 1 : 0} style={{ transition: 'opacity 300ms ease 700ms' }} />
      </svg>
      <div className="story-chart-trend-ends">
        {from && <span>{from}</span>}
        <span className="story-chart-ba-value is-after">{to}</span>
      </div>
      <span className="story-chart-label">{metric.shortLabel?.trim() || metric.label}</span>
    </div>
  )
}

export const StoryMetricChart = memo(function StoryMetricChart({ metric, activated }: { metric: CaseStudyMetric; activated: boolean }) {
  let chart
  switch (metric.display) {
    case 'beforeafter':
      chart = <BeforeAfterTile metric={metric} activated={activated} />
      break
    case 'donut':
      chart = <DonutTile metric={metric} activated={activated} />
      break
    case 'bars':
      chart = <HBarCompareTile metric={metric} activated={activated} />
      break
    case 'trend':
      chart = <TrendLineTile metric={metric} activated={activated} />
      break
    default:
      chart = <BigStatTile metric={metric} activated={activated} />
  }

  return (
    <>
      {chart}
      {metric.chartCaption?.trim() && <span className="story-chart-caption">{metric.chartCaption}</span>}
    </>
  )
})
