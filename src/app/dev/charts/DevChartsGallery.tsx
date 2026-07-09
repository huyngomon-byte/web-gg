'use client'

import type { CaseStudyMetric } from '../../../data/caseStudies'
import { BeforeAfterTile, BigStatTile, DonutTile, HBarCompareTile, TrendLineTile } from '../../../components/StoryMetricCharts'

const samples: Array<{ name: string; metric: CaseStudyMetric; render: 'bignum' | 'beforeafter' | 'donut' | 'bars' | 'bars-series' | 'trend' }> = [
  { name: 'BigStat', render: 'bignum', metric: { value: '326K+', label: 'multi-channel orders' } },
  { name: 'BeforeAfter (up)', render: 'beforeafter', metric: { value: '19.2%', from: '1.6%', to: '19.2%', label: 'message-to-order CVR' } },
  { name: 'BeforeAfter (down-is-good)', render: 'beforeafter', metric: { value: '32%', from: '70%', to: '32%', label: 'marketplace dependence' } },
  { name: 'Donut', render: 'donut', metric: { value: '82%', percent: 82, label: 'revenue via TikTok Shop' } },
  { name: 'HBarCompare (benchmark)', render: 'bars', metric: { value: '2×', benchmarkLabel: 'Industry', benchmarkValue: '1x', label: 'marketplace CVR vs industry' } },
  {
    name: 'HBarCompare (series + inverted row)',
    render: 'bars-series',
    metric: {
      value: '+53%',
      label: '2024 vs 2023',
      series: 'Orders:+35%|Products:+53%|Traffic:+22%|CAC:−12%',
      chartCaption: 'Per operating dashboard, 2023-2026',
    },
  },
  { name: 'TrendLine', render: 'trend', metric: { value: '×35', from: '×1', to: '×35', label: 'revenue index over 20 months' } },
]

function renderTile(sample: (typeof samples)[number]) {
  switch (sample.render) {
    case 'beforeafter':
      return <BeforeAfterTile metric={sample.metric} activated />
    case 'donut':
      return <DonutTile metric={sample.metric} activated />
    case 'bars':
    case 'bars-series':
      return <HBarCompareTile metric={sample.metric} activated />
    case 'trend':
      return <TrendLineTile metric={sample.metric} activated />
    default:
      return <BigStatTile metric={sample.metric} activated />
  }
}

export function DevChartsGallery() {
  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#24131e,#624056)] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-extrabold text-white">Story chart tiles — color/token preview</h1>
        <p className="mt-2 text-sm font-semibold text-white/70">
          Internal page (noindex). Brand tokens: fill #FF2E88 → #FF9A3D · down-is-good #FF9A3D → #FFD166 · track white 25-40%.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {samples.map((sample) => (
            <div key={sample.name}>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-white/60">{sample.name}</p>
              <div className="story-glass-tile story-chart-tile tone-on-medium max-w-[300px]">
                {renderTile(sample)}
                {sample.metric.chartCaption && <span className="story-chart-caption">{sample.metric.chartCaption}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
