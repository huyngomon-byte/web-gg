import { expect, test } from '@playwright/test'
import {
  buildPackageComparisonGroups,
  getPackageFeaturePresentation,
  groupPackageFeatures,
  isSinglePackageMetricValue,
  normalizePackagePrice,
  resolvePackageModule,
  resolvePackageTone,
  resolvePackageTones,
  resolvePackageValueKind,
  type PackageFeatureRow,
} from '../src/components/PackageCards'

test.describe('package information architecture', () => {
  test('resolves duplicate CMS tiers into a stable unique public hierarchy', () => {
    expect(resolvePackageTone({ title: 'The One Scale' }, 'package-scale', 0)).toBe('scale')
    expect(resolvePackageTone({ title: 'The One System' }, 'package-system', 2)).toBe('system')
    expect(resolvePackageTone({ title: 'The One Start' }, 'package-start', 1)).toBe('start')
    expect(resolvePackageTone({ title: 'The One Start', packageTier: 'system' }, 'package-start', 2)).toBe('start')
    expect(resolvePackageTones(
      [
        { title: 'Foundation', packageTier: 'system' },
        { title: 'Growth', packageTier: 'system' },
        { title: 'Enterprise', packageTier: 'system' },
      ],
      ['foundation', 'growth', 'enterprise'],
    )).toEqual(['system', 'start', 'scale'])
  })

  test('groups explicit and legacy features into the four stable modules', () => {
    expect(resolvePackageModule({ text: 'Anything', module: 'growth' })).toBe('growth')
    expect(resolvePackageModule({ label: 'CAPACITY', text: '45 content units/month' })).toBe('output')
    expect(resolvePackageModule({ label: 'CONTENT ENGINE', text: 'Strategy and production' })).toBe('content')
    expect(resolvePackageModule({ label: 'WEBSITE SYSTEM', text: 'Unlimited landing pages' })).toBe('web')
    expect(resolvePackageModule({ label: 'PERFORMANCE MEDIA', text: 'Based on ad spend' })).toBe('growth')

    const groups = groupPackageFeatures([
      { text: '45 content units/month', module: 'output' },
      { text: 'Content production', module: 'content' },
      { text: 'Booking website', module: 'web' },
      { text: 'Performance media', module: 'growth' },
    ])
    expect(groups.map(({ module }) => module)).toEqual(['output', 'content', 'web', 'growth'])
  })

  test('builds one aligned comparison model without inventing missing plan values', () => {
    const groups = buildPackageComparisonGroups([
      {
        tone: 'start',
        item: {
          title: 'Start',
          comparisonRows: [
            { label: 'Landing pages', value: 'Up to 10', module: 'web' },
            { label: 'Event execution', value: 'No access', availability: 'excluded', module: 'growth' },
          ],
        },
      },
      {
        tone: 'system',
        item: {
          title: 'System',
          comparisonRows: [{ label: 'Landing pages', value: 'Unlimited', module: 'web' }],
        },
      },
    ], 'en')

    expect(groups.map(({ module }) => module)).toEqual(['web', 'growth'])
    expect(groups[0].rows[0].values.start?.value).toBe('Up to 10')
    expect(groups[0].rows[0].values.system?.value).toBe('Unlimited')
    expect(groups[1].rows[0].values.system).toBeUndefined()
  })

  test('preserves semantic emphasis and normalizes legacy price copy', () => {
    const row: PackageFeatureRow = {
      group: 'Website system',
      label: 'booking/sales website',
      text: 'Booking/sales website, unlimited landing pages.',
      featured: true,
    }
    const presentation = getPackageFeaturePresentation(row)
    expect(presentation.group).toBe('Website System')
    expect(presentation.emphasisSource).toBe('explicit')
    expect(presentation.parts.emphasis).toBe('Booking/sales website')
    expect(Object.values(presentation.parts).join('')).toBe(row.text)

    expect(normalizePackagePrice('MONTHLY SETUP', 'From 30,000,000 VND/month', '', 'system')).toEqual({
      priceLabel: 'From',
      priceValue: '30,000,000 VND',
      priceSuffix: '/month',
      priceSupportingText: 'All-in-one: content + web + ads',
      pricePanelSupportingText: '',
    })
    expect(normalizePackagePrice('From', 'Custom package — based on project scope.', 'Approved scope note', 'scale')).toEqual({
      priceLabel: 'Custom',
      priceValue: 'Custom package',
      priceSuffix: '',
      priceSupportingText: '',
      pricePanelSupportingText: 'Approved scope note',
    })

    expect(resolvePackageValueKind('60/month')).toBe('quantity')
    expect(resolvePackageValueKind('Unlimited')).toBe('unlimited')
    expect(resolvePackageValueKind('Full access')).toBe('full')
    expect(resolvePackageValueKind('On-site')).toBe('onsite')
    expect(resolvePackageValueKind('No access', 'excluded')).toBe('none')
  })

  test('classifies only truly atomic metric values as single-line chips', () => {
    for (const value of ['45', '60', 'Unlimited', 'On-site']) {
      expect(isSinglePackageMetricValue(value), value).toBe(true)
    }
    for (const value of ['Up to 10 pages', 'Full access', 'No access']) {
      expect(isSinglePackageMetricValue(value), value).toBe(false)
    }
  })
})

test.describe('homepage package cards', () => {
  test('keeps every metric value intact at all Round 4 acceptance widths', async ({ page }) => {
    test.setTimeout(120_000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    const inspectVisibleMetrics = async (width: number, tone = 'all') => {
      const result = await page.locator('.package-metric:visible').evaluateAll((metrics) => metrics.map((metric) => {
        const value = metric.querySelector<HTMLElement>('.package-metric-value')
        if (!value) return { brokenTokens: ['missing .package-metric-value'], css: null, single: false, text: '' }

        const brokenTokens: string[] = []
        const walker = document.createTreeWalker(value, NodeFilter.SHOW_TEXT)
        let node = walker.nextNode() as Text | null
        while (node) {
          for (const match of node.data.matchAll(/\S+/g)) {
            const range = document.createRange()
            range.setStart(node, match.index ?? 0)
            range.setEnd(node, (match.index ?? 0) + match[0].length)
            const lineTops = new Set(
              Array.from(range.getClientRects())
                .filter((rect) => rect.width > 0 && rect.height > 0)
                .map((rect) => Math.round(rect.top * 10) / 10),
            )
            if (lineTops.size > 1) brokenTokens.push(match[0])
          }
          node = walker.nextNode() as Text | null
        }

        const style = getComputedStyle(value)
        return {
          brokenTokens,
          css: {
            hyphens: style.hyphens,
            overflowWrap: style.overflowWrap,
            wordBreak: style.wordBreak,
            whiteSpace: style.whiteSpace,
          },
          single: value.classList.contains('package-metric-value--single'),
          text: (value.textContent ?? '').trim(),
        }
      }))

      expect(result.length, `visible metric count at ${width}px (${tone})`).toBeGreaterThan(0)
      expect(
        result.flatMap(({ brokenTokens, text }) => brokenTokens.map((token) => `${text}: ${token}`)),
        `mid-word wrapping at ${width}px (${tone})`,
      ).toEqual([])

      for (const metric of result) {
        expect(metric.css, `${metric.text} CSS at ${width}px`).not.toBeNull()
        expect(metric.css!.overflowWrap, `${metric.text} overflow-wrap at ${width}px`).toBe('normal')
        expect(metric.css!.wordBreak, `${metric.text} word-break at ${width}px`).toBe('keep-all')
        expect(metric.css!.hyphens, `${metric.text} hyphens at ${width}px`).toBe('none')
        if (['45', '60', 'Unlimited', 'On-site'].includes(metric.text)) {
          expect(metric.single, `${metric.text} single-line class at ${width}px`).toBe(true)
          expect(metric.css!.whiteSpace, `${metric.text} white-space at ${width}px`).toBe('nowrap')
        }
      }

      // Production CMS data is allowed to replace the checked-in metric values.
      // Exercise every audited value inside a real chip so the original
      // Unlimited regression remains covered even when a local fixture uses ∞.
      const probes = await page.locator('.package-metric:visible').first().evaluate(async (metric) => {
        const value = metric.querySelector<HTMLElement>('.package-metric-value')!
        const originalText = value.textContent
        const originalClass = value.className
        const samples = ['45', '60', 'Up to 10 pages', 'Unlimited', 'Full access', 'No access', 'On-site']
        const singleValues = new Set(['45', '60', 'Unlimited', 'On-site'])
        const output = []

        for (const sample of samples) {
          value.textContent = sample
          value.classList.toggle('package-metric-value--single', singleValues.has(sample))
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

          const brokenTokens: string[] = []
          const textNode = value.firstChild as Text
          for (const match of textNode.data.matchAll(/\S+/g)) {
            const tokenRange = document.createRange()
            tokenRange.setStart(textNode, match.index ?? 0)
            tokenRange.setEnd(textNode, (match.index ?? 0) + match[0].length)
            const tokenLines = new Set(Array.from(tokenRange.getClientRects()).map((rect) => Math.round(rect.top * 10) / 10))
            if (tokenLines.size > 1) brokenTokens.push(match[0])
          }

          const wholeRange = document.createRange()
          wholeRange.selectNodeContents(value)
          output.push({
            brokenTokens,
            lineCount: new Set(Array.from(wholeRange.getClientRects()).map((rect) => Math.round(rect.top * 10) / 10)).size,
            sample,
            single: singleValues.has(sample),
          })
        }

        value.textContent = originalText
        value.className = originalClass
        return output
      })
      expect(
        probes.flatMap(({ brokenTokens, sample }) => brokenTokens.map((token) => `${sample}: ${token}`)),
        `audited chip probes at ${width}px (${tone})`,
      ).toEqual([])
      expect(
        probes.filter(({ single }) => single).every(({ lineCount }) => lineCount === 1),
        `single-value chip probes at ${width}px (${tone})`,
      ).toBe(true)
    }

    for (const width of [1920, 1440, 1280, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: width <= 768 ? 844 : 1000 })
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))

      if (width === 768) {
        const selector = page.getByTestId('package-tier-selector')
        for (const tone of ['start', 'system', 'scale']) {
          await selector.getByRole('button', { name: new RegExp(tone, 'i') }).click()
          await inspectVisibleMetrics(width, tone)
        }
      } else {
        await inspectVisibleMetrics(width)
        if (width === 390) {
          const visibleTones = await page.locator('[data-testid="package-card"]:visible').evaluateAll((cards) => (
            cards.map((card) => card.getAttribute('data-package-tone'))
          ))
          expect(visibleTones).toEqual(['start', 'system', 'scale'])
        }
      }
    }
  })

  test('renders the three-tier highlight language without changing accessible copy', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    const card = (tone: string) => page.locator(`[data-testid="package-card"][data-package-tone="${tone}"]`)
    const feature = (tone: string, text: RegExp) => card(tone).getByTestId('package-feature-row').filter({ hasText: text })

    await expect(feature('start', /45 content units/i).locator('.hl-num')).toHaveText(['45', '15 reels'])
    const startSeparators = feature('start', /content strategy/i).locator('.sep')
    await expect(startSeparators).toHaveCount(3)
    await expect(startSeparators.first()).not.toHaveAttribute('aria-hidden', 'true')
    await expect(feature('start', /content strategy/i).locator('.package-feature-text')).toContainText('Content strategy, calendar · production · posting · optimization')
    await expect(feature('start', /basic booking website/i).locator('.hl-num')).toHaveText('10 landing pages')
    await expect(feature('start', /performance marketing/i).locator('.hl-mark--gold')).toHaveText('% of actual ad spend')
    await expect(card('start').getByTestId('package-alignment-microcopy').locator('b, strong')).toHaveText('live in weeks')

    await expect(feature('system', /60 content units/i).locator('.hl-num')).toHaveText(['60', '20 reels'])
    await expect(feature('system', /content strategy/i).locator('.sep')).toHaveCount(3)
    await expect(feature('system', /content strategy/i).locator('.package-feature-text')).toContainText('Content strategy, calendar · production · posting · optimization')
    await expect(feature('system', /e-commerce management/i).locator('.hl-mark--web')).toHaveText('Shopee · TikTok Shop · Lazada')
    await expect(feature('system', /booking\/sales website/i).locator('.hl-num')).toHaveText('unlimited')
    await expect(feature('system', /performance marketing/i).locator('.hl-mark--gold')).toHaveText('% of actual ad spend')
    await expect(card('system').getByTestId('package-alignment-microcopy').locator('b, strong')).toHaveText('content + web + ads')

    const systemBase = feature('scale', /everything included/i)
    await expect(systemBase.locator('b, strong').first()).toHaveText('Everything')
    await expect(systemBase.locator('.hl-mark--system')).toHaveText('The One System')
    const onsite = feature('scale', /on-site event planning/i).locator('strong span, b span').first()
    await expect(onsite).toHaveText('On-site')
    expect(await onsite.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(255, 194, 75)')
    await expect(feature('scale', /campaign strategy/i).locator('.sep')).toHaveCount(2)
    const savings = page.getByTestId('package-scale-savings').locator('.package-savings-value')
    await expect(savings).toHaveText('cheaper')
    await expect(savings).not.toHaveClass(/hl-num/)
    expect(await savings.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(255, 194, 75)')
    await expect(card('scale').getByTestId('package-alignment-microcopy').locator('b, strong')).toHaveText('your target')

    const compareHighlights = page.getByTestId('package-compare-all').locator('.hl-num')
    expect(await compareHighlights.count()).toBeGreaterThan(0)
    await expect(compareHighlights.filter({ hasText: /unlimited/i }).first()).toBeAttached()
    await expect(compareHighlights.filter({ hasText: /10/ }).first()).toBeAttached()

    const process = page.getByTestId('package-process')
    const firstProcessStep = process.locator('.package-process-step').first()
    await expect(firstProcessStep.locator('strong').filter({ hasText: /^goals$/i })).toHaveCount(1)
    await expect(firstProcessStep.locator('.hl-mark--system')).toContainText('right package')
    await expect(page.getByTestId('package-recommendation').locator('.hl-mark--system')).toContainText('recommend the right package')

    const terms = page.getByTestId('package-terms-block')
    const unhighlightedTermNumbers = await terms.evaluate((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const misses: string[] = []
      let node = walker.nextNode() as Text | null
      while (node) {
        if (/\d+(?:[.,]\d+)?%?/.test(node.data) && !node.parentElement?.closest('.hl-num')) {
          misses.push(node.data.trim())
        }
        node = walker.nextNode() as Text | null
      }
      return misses.filter(Boolean)
    })
    expect(unhighlightedTermNumbers).toEqual([])

    for (const mark of await page.locator('#packages .hl-mark').all()) {
      await expect(mark).not.toHaveAttribute('aria-hidden', 'true')
      expect((await mark.textContent())?.trim().length).toBeGreaterThan(0)
    }
  })

  test('shares all eight pricing rows at 1440, 1280 and 1024px', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    for (const width of [1440, 1280, 1024]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
      const geometry = await page.getByTestId('package-card').evaluateAll((shells) => shells.map((shell) => {
        const article = shell.querySelector<HTMLElement>('.package-card')!
        const rect = (selector: string) => article.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
        const card = article.getBoundingClientRect()
        const name = rect('.package-card-name')
        const icon = rect('.package-tone-icon')
        const price = rect('[data-testid="package-price"]')
        const micro = rect('[data-testid="package-alignment-microcopy"]')
        const cta = rect('[data-testid="package-cta"]')
        const metrics = rect('[data-testid="package-metric-rail"]')
        const modules = rect('[data-testid="package-service-modules"]')
        const footer = rect('.package-stories-row')
        return {
          cardTop: card.top,
          cardBottom: card.bottom,
          nameTop: name.top,
          iconWidth: icon.width,
          iconHeight: icon.height,
          priceTop: price.top,
          priceHeight: price.height,
          microTop: micro.top,
          microHeight: micro.height,
          ctaTop: cta.top,
          ctaHeight: cta.height,
          metricsTop: metrics.top,
          modulesTop: modules.top,
          footerBottom: footer.bottom,
        }
      }))

      for (const key of ['cardTop', 'cardBottom', 'nameTop', 'priceTop', 'microTop', 'ctaTop', 'metricsTop', 'modulesTop', 'footerBottom'] as const) {
        const values = geometry.map((row) => row[key])
        expect(Math.max(...values) - Math.min(...values), `${key} at ${width}px`).toBeLessThanOrEqual(1)
      }
      expect(geometry.every(({ priceHeight }) => priceHeight >= 127 && priceHeight <= 129)).toBe(true)
      expect(geometry.every(({ microHeight }) => microHeight >= 23 && microHeight <= 25)).toBe(true)
      expect(geometry.every(({ ctaHeight }) => ctaHeight >= 51 && ctaHeight <= 53)).toBe(true)
      expect(geometry.every(({ iconWidth, iconHeight }) => iconWidth >= 39 && iconWidth <= 41 && iconHeight >= 39 && iconHeight <= 41)).toBe(true)

      const overflowingMarks = await page.locator('[data-testid="package-card"] .hl-mark').evaluateAll((marks) => marks.flatMap((mark) => {
        const markRect = mark.getBoundingClientRect()
        const cardRect = mark.closest('.package-card')?.getBoundingClientRect()
        return cardRect && (markRect.left < cardRect.left - 1 || markRect.right > cardRect.right + 1)
          ? [(mark.textContent ?? '').trim()]
          : []
      }))
      expect(overflowingMarks, `highlight mark overflow at ${width}px`).toEqual([])
    }

    await expect(page.locator('[data-package-tone="system"] .package-card-description').last()).toHaveText('Content, website and paid media running as one stable system.')
    await expect(page.locator('[data-package-tone="scale"] .package-card-description').last()).toHaveText('For strong growth: big campaigns, events, expansion or revenue targets.')
    await expect(page.getByTestId('package-alignment-microcopy')).toHaveText([
      'The essentials, live in weeks',
      'All-in-one: content + web + ads',
      'Scoped around your target',
    ])
  })

  test('uses stable desktop hover motion and spotlight without layout shift', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    const systemShell = page.locator('[data-testid="package-card"][data-package-tone="system"]')
    const systemCard = systemShell.locator('.package-card')
    await systemShell.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    const before = await page.evaluate(() => ({ height: document.documentElement.scrollHeight }))
    const shellBefore = await systemShell.boundingBox()

    await systemCard.hover()
    await page.waitForTimeout(250)
    const hovered = await systemCard.evaluate((card) => {
      const style = getComputedStyle(card)
      const matrix = new DOMMatrixReadOnly(style.transform)
      return { y: matrix.m42, duration: style.transitionDuration }
    })
    expect(hovered.y).toBeGreaterThanOrEqual(-6.75)
    expect(hovered.y).toBeLessThanOrEqual(-5.25)
    expect(hovered.duration).toContain('0.22s')
    await expect(page.locator('[data-testid="package-card"][data-package-tone="start"] .package-card')).toHaveCSS('opacity', '0.88')
    expect(await systemCard.evaluate((card) => getComputedStyle(card, '::after').animationPlayState)).toBe('paused')

    const featureRow = systemShell.locator('.package-feature-row:not([data-availability="excluded"])').first()
    const featureText = featureRow.locator('.package-feature-text')
    expect(await featureText.evaluate((element) => getComputedStyle(element).transitionDuration)).toContain('0.15s')
    await featureRow.hover()
    expect(await featureText.evaluate((element) => getComputedStyle(element).transitionDuration)).toContain('0.22s')

    await page.mouse.move(4, 4)
    await page.waitForTimeout(180)
    expect(await featureText.evaluate((element) => getComputedStyle(element).transitionDuration)).toContain('0.15s')
    const after = await systemCard.evaluate((card) => new DOMMatrixReadOnly(getComputedStyle(card).transform).m42)
    expect(Math.abs(after)).toBeLessThanOrEqual(0.75)
    const shellAfter = await systemShell.boundingBox()
    const pageAfter = await page.evaluate(() => ({ height: document.documentElement.scrollHeight }))
    expect(Math.abs((shellAfter?.height ?? 0) - (shellBefore?.height ?? 0))).toBeLessThanOrEqual(1)
    expect(Math.abs(pageAfter.height - before.height)).toBeLessThanOrEqual(1)
  })

  test('renders compact summaries, metric rails, grouped modules and one shared matrix', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/#packages')
    await page.waitForLoadState('networkidle')

    const cards = page.getByTestId('package-card')
    await expect(cards).toHaveCount(3)
    await expect(cards.nth(0)).toHaveAttribute('data-package-tone', 'start')
    await expect(cards.nth(1)).toHaveAttribute('data-package-tone', 'system')
    await expect(cards.nth(2)).toHaveAttribute('data-package-tone', 'scale')
    await expect(cards.nth(1)).toHaveAttribute('data-featured', 'true')
    await expect(page.getByTestId('package-grid')).toHaveAttribute('data-mobile-order-ready', 'true')
    await expect(page.getByTestId('package-tier-selector')).toBeHidden()
    await expect(page.getByTestId('package-metric-rail')).toHaveCount(3)
    await expect(page.getByTestId('package-service-modules')).toHaveCount(3)

    for (const tone of ['start', 'system', 'scale']) {
      const card = cards.filter({ has: page.locator(`[data-package-tone="${tone}"]`) }).or(page.locator(`[data-testid="package-card"][data-package-tone="${tone}"]`)).last()
      await expect(card.getByTestId('package-price')).toHaveCount(1)
      await expect(card.getByTestId('package-cta')).toHaveCount(1)
      await expect(card.getByTestId('package-metric')).toHaveCount(3)
      await expect(card.getByRole('link', { name: /view all stories/i })).toHaveAttribute('href', /\/the-one#.+/)
    }

    await expect(page.getByTestId('package-compare-all')).toHaveCount(1)
    await expect(page.getByTestId('package-compare-all').getByRole('heading', { name: 'Compare all packages' })).toBeVisible()
    expect(await page.locator('.package-compare-table tbody').count()).toBeGreaterThan(1)
    await expect(page.getByTestId('package-comparison-row').first()).toBeVisible()
    await expect(page.getByTestId('package-comparison-toggle')).toHaveCount(0)
    await expect(page.getByTestId('package-comparison-panel')).toHaveCount(0)
    await expect(page.getByRole('columnheader', { name: 'The One Start' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'The One System' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'The One Scale' })).toBeVisible()

    const packageInner = await page.locator('#packages .packages-section-inner').boundingBox()
    expect(packageInner).not.toBeNull()
    expect(packageInner!.width).toBeLessThanOrEqual(1153)

    const aligned = await page.locator('.package-compare-table').evaluate((table) => {
      const headers = Array.from(table.querySelectorAll('thead th')).map((cell) => {
        const rect = cell.getBoundingClientRect()
        return { left: rect.left, right: rect.right }
      })
      const rows = Array.from(table.querySelectorAll('tr.package-compare-service-row'))
      return rows.every((row) => Array.from(row.children).every((cell, index) => {
        const rect = cell.getBoundingClientRect()
        return Math.abs(rect.left - headers[index].left) <= 2
          && Math.abs(rect.right - headers[index].right) <= 2
      }))
    })
    expect(aligned).toBe(true)

    const systemColumnBackgrounds = await page.locator('.package-compare-table th[data-package-tone="system"], .package-compare-table td[data-package-tone="system"]').evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell).backgroundColor))
    expect(systemColumnBackgrounds.length).toBeGreaterThan(1)
    expect(systemColumnBackgrounds.every((background) => /rgba\(255, 45, 135, 0\.07\)/.test(background))).toBe(true)

    const process = page.getByTestId('package-process')
    await expect(process).toBeVisible()
    await expect(process).toHaveAttribute('data-highlight-tone', 'magenta')
    await expect(process.locator('.package-process-step')).toHaveCount(3)
    await expect(process.locator('.package-process-emphasis')).toHaveCount(3)
    await expect(process.locator('.package-process-package-mark')).toHaveCount(1)
    await expect(process.locator('.package-process-cadence')).toHaveCount(1)
    expect(await process.locator('.package-process-number').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(20)
    await expect(process).toContainText('Align on goals')
    const recommendation = page.getByTestId('package-recommendation')
    await expect(recommendation).toBeVisible()
    await expect(recommendation).toHaveAttribute('data-highlight-tone', 'magenta')
    await expect(recommendation).toContainText('Not sure which package fits?')
    await expect(recommendation.locator('.package-recommendation-highlight')).toHaveCount(1)
    await expect(recommendation.getByRole('button')).toBeVisible()
    const savings = page.getByTestId('package-scale-savings')
    await expect(savings).toHaveCount(1)
    await expect(savings).toContainText('Might be cheaper than The One Start')
    await expect(savings.locator('strong')).toHaveText('cheaper')

    const termsBlock = page.getByTestId('package-terms-block')
    await expect(termsBlock).toHaveAttribute('data-highlight-tone', 'gold')
    await expect(termsBlock.locator('.package-terms-highlights li')).toHaveCount(4)
    const terms = page.getByTestId('package-terms-disclosure')
    await expect(terms).toBeVisible()
    await expect(terms).not.toHaveAttribute('open', '')
    await terms.locator('summary').click()
    await expect(terms).toHaveAttribute('open', '')
    await expect(terms.getByRole('note')).toBeVisible()

    const systemCta = page.locator('[data-testid="package-card"][data-package-tone="system"]').getByTestId('package-cta')
    await systemCta.click()
    await expect(page.locator('#booking-modal-title')).toBeVisible()
  })

  test('keeps the tablet selector keyboard-accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 900, height: 844 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    const selector = page.getByTestId('package-tier-selector')
    const start = selector.getByRole('button', { name: /start/i })
    const system = selector.getByRole('button', { name: /system/i })
    const scale = selector.getByRole('button', { name: /scale/i })
    await expect(system).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-testid="package-card"][data-mobile-active="true"]')).toHaveAttribute('data-package-tone', 'system')

    await start.click()
    await expect(start).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-testid="package-card"][data-mobile-active="true"]')).toHaveAttribute('data-package-tone', 'start')
    await expect(page.locator('.package-compare-table [data-package-tone="start"][data-mobile-active="true"]').first()).toBeAttached()

    await start.press('End')
    await expect(scale).toBeFocused()
    await expect(scale).toHaveAttribute('aria-pressed', 'true')
    await scale.press('ArrowRight')
    await expect(start).toBeFocused()
    await expect(start).toHaveAttribute('aria-pressed', 'true')
  })

  test('shows all plans and a service-first comparison stack below 768px', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('package-tier-selector')).toBeHidden()
    await expect(page.getByTestId('package-card')).toHaveCount(3)
    const cards = await page.getByTestId('package-card').evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        tone: element.getAttribute('data-package-tone'),
        top: rect.top,
        width: rect.width,
      }
    }))
    expect(cards.map(({ tone }) => tone)).toEqual(['start', 'system', 'scale'])
    expect([...cards].sort((left, right) => left.top - right.top).map(({ tone }) => tone)).toEqual(['system', 'start', 'scale'])
    expect(cards.every(({ width }) => width > 0)).toBe(true)

    const systemCard = page.locator('[data-testid="package-card"][data-package-tone="system"]')
    await expect(systemCard.locator('.package-card--featured')).toHaveCSS('transform', 'none')
    const mobilePriceSize = await systemCard.locator('.package-price-value').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
    expect(mobilePriceSize).toBeGreaterThanOrEqual(28)
    expect(mobilePriceSize).toBeLessThanOrEqual(36)

    await expect(page.locator('.package-compare-table-wrap')).toBeHidden()
    const stack = page.getByTestId('package-comparison-stack')
    await expect(stack).toBeVisible()
    const serviceCards = stack.getByTestId('package-comparison-service-card')
    expect(await serviceCards.count()).toBeGreaterThanOrEqual(3)
    const toneOrder = await serviceCards.first().getByTestId('package-comparison-plan-row').evaluateAll((rows) => rows.map((row) => row.getAttribute('data-package-tone')))
    expect(toneOrder).toEqual(['start', 'system', 'scale'])

    const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1)
  })

  test('exposes mobile service modules as accessible disclosures without viewport-driven DOM changes', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })

    const systemCard = page.locator('[data-testid="package-card"][data-package-tone="system"]')
    const toggles = systemCard.locator('.package-service-module-toggle')
    await expect(toggles).toHaveCount(4)
    await expect(toggles.nth(0)).toHaveAttribute('aria-expanded', 'true')
    await expect(toggles.nth(1)).toHaveAttribute('aria-expanded', 'false')
    const targetId = await toggles.nth(1).getAttribute('aria-controls')
    expect(targetId).toBeTruthy()

    await toggles.nth(1).click()
    await expect(toggles.nth(0)).toHaveAttribute('aria-expanded', 'false')
    await expect(toggles.nth(1)).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator(`#${targetId}`)).toHaveClass(/is-open/)
  })

  test('keeps semantic feedback but removes motion when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    const startCard = page.locator('[data-testid="package-card"][data-package-tone="start"] .package-card')
    await startCard.scrollIntoViewIfNeeded()
    const borderBefore = await startCard.evaluate((card) => getComputedStyle(card).borderColor)
    await startCard.hover()
    const state = await startCard.evaluate((card) => {
      const style = getComputedStyle(card)
      return { transform: style.transform, border: style.borderColor }
    })
    expect(state.transform).toBe('none')
    expect(state.border).not.toBe(borderBefore)
    expect(await page.locator('.package-card--featured').evaluate((card) => getComputedStyle(card, '::after').animationName)).toBe('none')
  })
})

test.describe('package touch states', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('uses color-only active feedback without spotlight or geometry changes', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(true)

    const systemShell = page.locator('[data-testid="package-card"][data-package-tone="system"]')
    const metric = systemShell.locator('.package-metric:not([data-metric-kind="none"])').first()
    await metric.scrollIntoViewIfNeeded()
    const box = await metric.boundingBox()
    expect(box).not.toBeNull()
    const before = await metric.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      rect: element.getBoundingClientRect().toJSON(),
      scrollHeight: document.documentElement.scrollHeight,
    }))

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await expect.poll(() => metric.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(before.background)
    const active = await metric.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      transform: getComputedStyle(element).transform,
      rect: element.getBoundingClientRect().toJSON(),
      scrollHeight: document.documentElement.scrollHeight,
      siblingOpacity: getComputedStyle(document.querySelector('[data-package-tone="start"] .package-card')!).opacity,
    }))
    await page.mouse.up()

    expect(active.background).not.toBe(before.background)
    expect(active.transform).toBe('none')
    expect(active.siblingOpacity).toBe('1')
    expect(Math.abs(active.rect.top - before.rect.top)).toBeLessThanOrEqual(1)
    expect(Math.abs(active.rect.height - before.rect.height)).toBeLessThanOrEqual(1)
    expect(Math.abs(active.scrollHeight - before.scrollHeight)).toBeLessThanOrEqual(1)
  })
})
