// Round 10: purge money/ROAS/CPA/AOV absolute values (Part B) and enter the
// per-client 4-slide chart plan from Part C (EN labels). Backup first!
// Usage: node --env-file=.env.local scripts/round10-cms-data.mjs
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})
const db = getFirestore(app)

const metricPlans = {
  INKAHOLIC: {
    featuredStats: [
      { value: '5+ years', label: 'of uninterrupted end-to-end operation' },
      { value: '326K+', label: 'multi-channel orders' },
    ],
    keyMetrics: [
      { value: '5+ years', label: 'end-to-end operation', shortLabel: 'end-to-end operation', featured: true, slide: 1, display: 'bignum' },
      { value: '326K+', label: 'multi-channel orders · 6.9M+ traffic', shortLabel: 'multi-channel orders', featured: true, slide: 1, display: 'bignum' },
      { value: '81%', label: 'Channel #1 changed hands', slide: 2, display: 'bars', series: 'Shopee 2022:80%|TikTok Shop 2025:81%', chartCaption: 'Share of online revenue by channel' },
      { value: '×2.1', label: 'TikTok Shop channel scale in a single year', slide: 2, display: 'bignum' },
      { value: '2×', label: 'marketplace CVR vs category benchmark', slide: 3, display: 'bars', benchmarkLabel: 'Industry', benchmarkValue: '1x' },
      { value: '2.4', from: '1.6', to: '2.4', label: 'items per order after bundle optimization (+50%)', shortLabel: 'items per order (+50%)', slide: 3, display: 'beforeafter' },
      { value: '+35%', label: 'revenue · +58% orders YoY 2024', slide: 3, display: 'bignum' },
      { value: '1,000+', label: 'KOL/KOC bookings · 90M+ tracked views', slide: 4, display: 'bignum' },
      { value: '886K+', label: 'products sold across 5 years', slide: 4, display: 'bignum' },
      { value: '193K+', label: 'community followers · 2.6M TikTok likes', slide: 4, display: 'bignum' },
    ],
  },
  'QANDA Books': {
    featuredStats: [
      { value: '+293%', label: 'GMV from ads at the exam-season peak' },
      { value: '~80%', label: 'of ecommerce revenue via TikTok Shop' },
    ],
    keyMetrics: [
      { value: '+293%', label: 'GMV from ads at the exam-season peak', shortLabel: 'GMV from ads at peak', featured: true, slide: 1, display: 'bignum' },
      { value: '~80%', label: 'of ecommerce revenue via TikTok Shop', featured: true, slide: 1, display: 'bignum' },
      { value: '+293%', from: '×1', to: '+293%', label: 'exam-season GMV curve, repeatable', shortLabel: 'exam-season GMV curve', slide: 2, display: 'trend', chartCaption: 'Monthly GMV-from-ads index, Jan-May 2025' },
      { value: '+266%', label: 'orders from ads in the same window', slide: 2, display: 'bignum' },
      { value: '203M', label: 'paid impressions tracked', slide: 2, display: 'bignum' },
      { value: '83%', percent: 83, label: 'of underperforming ad videos cut within 48h', shortLabel: 'weak ads cut within 48h', slide: 3, display: 'donut' },
      { value: '18%', percent: 18, label: 'top videos carry ~50% of the ad budget', shortLabel: 'top videos take ~50% budget', slide: 3, display: 'donut' },
      { value: '+132%', label: '48h discipline on cost and conversion', shortLabel: 'CPA down, CVR up', slide: 3, display: 'bars', series: 'CPA:−36%|CVR:+132%' },
      { value: '321', from: '120', to: '321', label: 'active KOC channels (+168%)', shortLabel: 'active KOC channels', slide: 4, display: 'beforeafter' },
      { value: '46%', label: 'KOC revenue share vs ~29% top competitor', shortLabel: 'KOC share vs competitor', slide: 4, display: 'bars', benchmarkLabel: 'Competitor', benchmarkValue: '29%' },
    ],
  },
  'ANNITA STUDIOS': {
    featuredStats: [
      { value: '×11', label: 'peak-month revenue vs first ad-sales month' },
      { value: '×12', label: 'message-to-order conversion rate' },
    ],
    keyMetrics: [
      { value: '×11', label: 'peak-month revenue vs first ad-sales month', shortLabel: 'peak-month revenue', featured: true, slide: 1, display: 'bignum' },
      { value: '×12', label: 'message-to-order conversion rate', shortLabel: 'message-to-order CVR', featured: true, slide: 1, display: 'bignum' },
      { value: '19.2%', from: '1.6%', to: '19.2%', label: 'message-to-order CVR at peak', slide: 2, display: 'beforeafter' },
      { value: '5,900+', label: 'ad conversations · +280% end vs start', shortLabel: 'ad conversations', slide: 2, display: 'bignum' },
      { value: '2.8M+', label: 'reach · 9.4M+ impressions in 12 months', shortLabel: 'reach in 12 months', slide: 2, display: 'bignum' },
      { value: '−92%', label: 'ad cost per revenue over the engagement', shortLabel: 'ad cost per revenue', slide: 3, display: 'bignum' },
      { value: '~50%', percent: 50, label: 'of yearly ad revenue from the Q4 party season', shortLabel: 'ad revenue from Q4 season', slide: 3, display: 'donut' },
      { value: '×11', label: 'revenue index at peak', slide: 3, display: 'bignum', chartCaption: 'Monthly revenue index, 03/2023 = 100' },
      { value: '62%', label: 'channel mix at handover', shortLabel: 'channel mix Q4/2023', slide: 4, display: 'bars', series: 'Facebook:62%|Instagram:15%|WhatsApp:12%|Offline:11%', chartCaption: '28 months end-to-end · local team self-run since 05/2025' },
      { value: '50K+', label: 'followers across 3 channels — active after handover', shortLabel: 'followers, 3 channels', slide: 4, display: 'bignum' },
    ],
    caption: 'From launch to a self-sustaining social commerce system: message-to-order CVR ×12, ad cost per revenue down 92%, and an engine the local team now runs on their own.',
  },
  CURNON: {
    featuredStats: [
      { value: '+53%', label: 'products sold (2024 vs 2023)' },
      { value: '36+ months', label: 'of continuous partnership' },
    ],
    keyMetrics: [
      { value: '+53%', label: 'products sold (2024 vs 2023)', featured: true, slide: 1, display: 'bignum' },
      { value: '36+ months', label: 'of continuous partnership', featured: true, slide: 1, display: 'bignum' },
      { value: '+53%', label: '2024 vs 2023, across the funnel', shortLabel: '2024 vs 2023', slide: 2, display: 'bars', series: 'Orders:+35%|Products:+53%|Traffic:+22%|CAC:−12%', chartCaption: 'Per operating dashboard · CAC down is good' },
      { value: '84%', from: '73%', to: '84%', label: 'online revenue share, holding ~80%', shortLabel: 'online revenue share', slide: 3, display: 'beforeafter' },
      { value: '~70%', percent: 70, label: 'of online revenue through the website', shortLabel: 'online revenue via website', slide: 3, display: 'donut' },
      { value: '+32%', label: 'blended ROAS efficiency (H1 2026 vs 2024)', shortLabel: 'ROAS efficiency', slide: 3, display: 'bignum' },
      { value: '13,800+', label: 'influencer engine funnel', shortLabel: 'influencer engine', slide: 4, display: 'bars', series: 'Database:13,800|Re-contacted:5,000|Collaborations:2,400|Managed KOL:210' },
      { value: '123', from: '41', to: '123', label: 'earring SKUs — ×3 in one year', shortLabel: 'earring SKUs ×3', slide: 4, display: 'beforeafter' },
      { value: '500+', label: 'zero-fee KOC videos', slide: 4, display: 'bignum' },
      { value: '400K+', label: 'multi-platform ecosystem followers', slide: 4, display: 'bignum' },
    ],
  },
  'cota.cuti': {
    featuredStats: [
      { value: '×35', label: 'peak monthly revenue growth' },
      { value: '×19', label: 'within the first 4 operating months' },
    ],
    keyMetrics: [
      { value: '×35', label: 'peak monthly revenue growth', featured: true, slide: 1, display: 'bignum' },
      { value: '×19', label: 'within the first 4 operating months', featured: true, slide: 1, display: 'bignum' },
      { value: '×35', from: '×1', to: '×35', label: 'revenue curve over 20 months', shortLabel: '20-month revenue curve', slide: 2, display: 'trend', chartCaption: 'Revenue index, Oct 2024 → Jul 2025 · ×19 by Jan 2025' },
      { value: '×3.6', label: 'Q4 revenue YoY · ×10 peak-month volume', shortLabel: 'Q4 YoY revenue', slide: 2, display: 'bignum' },
      { value: '82%', percent: 82, label: 'of revenue from TikTok Shop, built from zero', shortLabel: 'revenue via TikTok Shop', slide: 3, display: 'donut', chartCaption: 'Shopee ~16% of the remainder' },
      { value: '20,668', label: 'products sold in 20 months', slide: 3, display: 'bignum' },
      { value: '150+', label: 'commercial SKUs from 59 R&D designs', shortLabel: 'commercial SKUs', slide: 3, display: 'bignum' },
      { value: '~70%', percent: 70, label: 'gross margin held stable', slide: 4, display: 'donut' },
      { value: '37.2K', label: 'TikTok followers · 1.5M likes', slide: 4, display: 'bignum' },
      { value: '100+', label: 'KOL/KOC bookings managed', slide: 4, display: 'bignum' },
    ],
  },
  PHINƠI: {
    featuredStats: [
      { value: '≈50%', label: 'of full-year 2025 revenue achieved in 6 low-season months of 2026' },
      { value: '×3', label: 'projected 2026 revenue vs 2025' },
    ],
    keyMetrics: [
      { value: '≈50%', label: 'of FY2025 revenue achieved in 6 low-season months', shortLabel: 'FY25 revenue in 6 low months', featured: true, slide: 1, display: 'bignum' },
      { value: '×3', label: 'projected 2026 revenue vs 2025', featured: true, slide: 1, display: 'bignum' },
      { value: '36%', percent: 36, label: 'website became the #1 revenue channel, from zero', shortLabel: 'website now channel #1', slide: 2, display: 'donut' },
      { value: '32%', from: '70%', to: '32%', label: 'marketplace dependence reduced', slide: 2, display: 'beforeafter' },
      { value: '−74%', label: 'Shopee cancellation rate', slide: 3, display: 'bignum' },
      { value: '+27%', label: 'average order value', slide: 3, display: 'bignum' },
      { value: '+84%', label: 'monthly revenue vs first project month', slide: 3, display: 'bignum' },
      { value: '200+', label: 'TikTok micro-KOLs operated', slide: 4, display: 'bignum' },
      { value: '5.8M+', label: 'users reached through TikTok Ads', slide: 4, display: 'bignum' },
      { value: '×4', label: 'peak monthly revenue during gifting season', slide: 4, display: 'bignum' },
    ],
  },
}

const ref = db.collection('sitePages').doc('the-one')
const data = (await ref.get()).data()
const stories = data.blocks.find((b) => b.id === 'stories')

for (const item of stories.items ?? []) {
  const plan = metricPlans[item.title]
  if (!plan) {
    console.log('no plan for', item.title)
    continue
  }
  item.keyMetrics = plan.keyMetrics
  item.featuredStats = plan.featuredStats
  if (plan.caption) item.caption = plan.caption
  console.log(item.title, '-> metrics:', item.keyMetrics.length, '| featured stats updated')
}

await ref.set(data)
console.log('the-one saved')
