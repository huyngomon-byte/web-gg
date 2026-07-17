import { expect, test } from '@playwright/test'
import {
  buildPackageComparisonGroups,
  getPackageFeaturePresentation,
  groupPackageFeatures,
  normalizePackagePrice,
  resolvePackageModule,
  resolvePackageTone,
  resolvePackageTones,
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
    })
    expect(normalizePackagePrice('From', 'Custom package — based on project scope.', 'Approved scope note', 'scale')).toEqual({
      priceLabel: 'Custom',
      priceValue: 'Custom package',
      priceSuffix: '',
      priceSupportingText: 'Approved scope note',
    })
  })
})

test.describe('homepage package cards', () => {
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

    const systemColumnBackgrounds = await page.locator('.package-compare-table th[data-package-tone="system"], .package-compare-table td[data-package-tone="system"]').evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell).backgroundImage))
    expect(systemColumnBackgrounds.length).toBeGreaterThan(1)
    expect(systemColumnBackgrounds.every((background) => background !== 'none')).toBe(true)

    const process = page.getByTestId('package-process')
    await expect(process).toBeVisible()
    await expect(process).toHaveAttribute('data-highlight-tone', 'magenta')
    await expect(process.locator('.package-process-step')).toHaveCount(3)
    await expect(process.locator('.package-process-highlight')).toHaveCount(3)
    expect(await process.locator('.package-process-number').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(20)
    await expect(process).toContainText('Align on goals')
    const recommendation = page.getByTestId('package-recommendation')
    await expect(recommendation).toBeVisible()
    await expect(recommendation).toHaveAttribute('data-highlight-tone', 'magenta')
    await expect(recommendation).toContainText('Not sure which package fits?')
    await expect(recommendation.locator('.package-recommendation-highlight')).toHaveCount(1)
    await expect(recommendation.getByRole('button')).toBeVisible()
    await expect(page.getByText(/might be cheaper than/i)).toHaveCount(0)

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
})
