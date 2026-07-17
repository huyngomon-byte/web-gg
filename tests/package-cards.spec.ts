import { expect, test } from '@playwright/test'
import {
  getPackageFeaturePresentation,
  normalizePackagePrice,
  resolvePackageTone,
  resolvePackageTones,
  type PackageFeatureRow,
} from '../src/components/PackageCards'

test.describe('package feature semantics', () => {
  test('resolves package tone from stable identity before display order', () => {
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

  test('uses an explicit CMS label as emphasis only when a semantic group exists', () => {
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
  })

  test('safely emphasizes a featured leading clause while preserving exact text', () => {
    const row: PackageFeatureRow = {
      group: 'Campaign growth',
      text: 'Campaign strategy, creative direction, media planning',
      featured: true,
    }
    const presentation = getPackageFeaturePresentation(row)

    expect(presentation.emphasisSource).toBe('leading')
    expect(presentation.parts.emphasis).toBe('Campaign strategy')
    expect(Object.values(presentation.parts).join('')).toBe(row.text)
  })

  test('keeps a legacy label as its group rather than treating it as inline markup', () => {
    const row: PackageFeatureRow = {
      label: 'CONTENT ENGINE',
      text: 'Content strategy, calendar and production',
      featured: true,
    }
    const presentation = getPackageFeaturePresentation(row)

    expect(presentation.group).toBe('Content Engine')
    expect(presentation.emphasisSource).toBe('leading')
    expect(presentation.parts.emphasis).toBe('Content strategy')
    expect(Object.values(presentation.parts).join('')).toBe(row.text)
  })

  test('leaves an ordinary feature row untouched', () => {
    const row: PackageFeatureRow = {
      group: 'Reporting',
      text: 'Weekly performance reporting',
    }
    const presentation = getPackageFeaturePresentation(row)

    expect(presentation.emphasisSource).toBe('none')
    expect(Object.values(presentation.parts).join('')).toBe(row.text)
  })

  test('normalizes legacy price copy without duplicating labels or supporting text', () => {
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
  test('renders three independent tiers with the featured System hierarchy and booking links intact', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/#packages')
    await page.waitForLoadState('networkidle')

    const section = page.locator('#packages')
    const cards = page.getByTestId('package-card')
    await expect(page.getByTestId('package-grid')).toHaveAttribute('data-mobile-order-ready', 'true')
    await expect(cards).toHaveCount(3)
    await expect(cards.nth(0)).toHaveAttribute('data-package-tone', 'start')
    await expect(cards.nth(1)).toHaveAttribute('data-package-tone', 'system')
    await expect(cards.nth(2)).toHaveAttribute('data-package-tone', 'scale')

    await expect(section.getByRole('radiogroup')).toHaveCount(0)
    await expect(section.getByRole('radio')).toHaveCount(0)
    await expect(section.getByTestId('package-radio')).toHaveCount(0)
    await expect(section.locator('[data-selected]')).toHaveCount(0)
    await expect(page.locator('[data-testid="package-card"][data-featured="true"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="package-card"][data-featured="true"]')).toHaveAttribute('data-package-tone', 'system')
    await expect(page.getByTestId('package-capacity')).toHaveCount(2)

    await expect(cards.nth(0).locator('.package-price-label')).toHaveText('From')
    await expect(cards.nth(1).locator('.package-price-label')).toHaveText('From')
    await expect(cards.nth(2).locator('.package-price-label')).toHaveText('Custom')
    await expect(cards.nth(0).locator('.package-price-value')).not.toHaveText(/^From\b/i)
    await expect(cards.nth(1).locator('.package-price-value')).not.toHaveText(/^From\b/i)
    await expect(cards.nth(1).locator('.package-price-supporting')).toHaveText('All-in-one: content + web + ads')
    await expect(cards.nth(2).locator('.package-price-value')).toHaveText('Custom package')
    await expect(cards.nth(2).locator('.package-price-supporting')).toHaveText(/based on project scope/i)

    const hierarchy = await cards.nth(0).evaluate((card) => ({
      name: Number.parseFloat(getComputedStyle(card.querySelector<HTMLElement>('.package-card-name')!).fontSize),
      price: Number.parseFloat(getComputedStyle(card.querySelector<HTMLElement>('.package-price-value')!).fontSize),
      suffix: Number.parseFloat(getComputedStyle(card.querySelector<HTMLElement>('.package-price-suffix')!).fontSize),
      rowBackground: getComputedStyle(card.querySelector<HTMLElement>('[data-testid="package-feature-row"]')!).backgroundColor,
    }))
    expect(hierarchy.price).toBeGreaterThan(hierarchy.name)
    expect(hierarchy.suffix).toBeLessThan(hierarchy.price)
    expect(hierarchy.rowBackground).toBe('rgba(0, 0, 0, 0)')

    const systemColors = await cards.nth(1).evaluate((card) => ({
      badge: getComputedStyle(card.querySelector<HTMLElement>('.package-card-badge')!).color,
      cta: getComputedStyle(card.querySelector<HTMLElement>('.package-cta')!).color,
      supporting: getComputedStyle(card.querySelector<HTMLElement>('.package-price-supporting')!).color,
    }))
    expect(systemColors.badge).toBe('rgb(22, 7, 15)')
    expect(systemColors.cta).toBe('rgb(22, 7, 15)')
    expect(systemColors.supporting).toBe('rgb(255, 45, 135)')

    await expect(page.getByText('From 0 VND/month', { exact: true })).toHaveCount(0)
    expect(await page.content()).not.toContain('From 0 VND/month')

    const packageTerms = page.getByRole('note', { name: 'Important package terms' })
    await expect(packageTerms).toBeVisible()
    await expect(packageTerms.locator('.package-terms-emphasis')).not.toHaveCount(0)

    for (let index = 0; index < 3; index += 1) {
      const card = cards.nth(index)
      const price = card.getByTestId('package-price')
      const cta = card.getByTestId('package-cta')
      const capacity = card.getByTestId('package-capacity')
      const firstFeature = card.getByTestId('package-feature-row').first()
      const tone = await card.getAttribute('data-package-tone')

      await expect(price).toHaveCount(1)
      await expect(cta).toHaveCount(1)
      await expect(capacity).toHaveCount(tone === 'scale' ? 0 : 1)
      await expect(firstFeature).toBeAttached()

      const anatomyIsOrdered = await card.evaluate((root, packageTone) => {
        const find = (testId: string) => root.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
        const priceNode = find('package-price')
        const ctaNode = find('package-cta')
        const capacityNode = find('package-capacity')
        const featureNode = find('package-feature-row')
        if (!priceNode || !ctaNode || !featureNode) return false
        const precedes = (left: HTMLElement, right: HTMLElement) => (
          Boolean(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING)
        )
        return precedes(priceNode, ctaNode)
          && (packageTone === 'scale'
            ? precedes(ctaNode, featureNode)
            : Boolean(capacityNode) && precedes(ctaNode, capacityNode!) && precedes(capacityNode!, featureNode))
      }, tone)
      expect(anatomyIsOrdered, `package card ${index + 1} anatomy order`).toBe(true)

      const storyLink = card.getByRole('link', { name: /view all stories/i })
      await expect(storyLink).toHaveCount(1)
      await expect(storyLink).toHaveAttribute('href', /\/the-one\/?$/)
    }

    const start = cards.filter({ has: page.getByText('The One Start', { exact: true }) })
    const excluded = start.locator('[data-testid="package-feature-row"][data-availability="excluded"]')
    await expect(excluded).toHaveCount(2)
    await expect(excluded.nth(0)).toContainText(/e-commerce management/i)
    await expect(excluded.nth(1)).toContainText(/unlimited landing pages/i)
    for (let index = 0; index < 2; index += 1) {
      await expect(excluded.nth(index)).toContainText(/not included/i)
    }

    await expect(page.getByTestId('package-comparison-toggle')).toHaveCount(3)
    await expect(page.getByTestId('package-comparison-panel')).toHaveCount(3)
    for (let index = 0; index < 3; index += 1) {
      const toggle = page.getByTestId('package-comparison-toggle').nth(index)
      const panel = page.getByTestId('package-comparison-panel').nth(index)
      const panelId = await panel.getAttribute('id')
      expect(panelId).toBeTruthy()
      await expect(toggle).toHaveAttribute('aria-controls', panelId!)
      await expect(toggle).toBeHidden()
      await expect(panel).toBeVisible()
    }

    const systemCta = cards.filter({ has: page.getByText('The One System', { exact: true }) }).getByTestId('package-cta')
    await systemCta.click()
    await expect(page.locator('#booking-modal-title')).toBeVisible()
    await page.getByRole('button', { name: 'Close booking dialog' }).click()

    await cards.first().getByRole('link', { name: /view all stories/i }).click()
    await expect(page).toHaveURL(/\/the-one\/?$/)
  })

  test('keeps every CTA visible and exposes comparison details as mobile accordions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })

    const cards = page.getByTestId('package-card')
    const ctas = page.getByTestId('package-cta')
    const toggles = page.getByTestId('package-comparison-toggle')
    const panels = page.getByTestId('package-comparison-panel')
    await expect(page.getByTestId('package-grid')).toHaveAttribute('data-mobile-order-ready', 'true')
    await expect(page.getByTestId('package-grid')).toHaveAttribute('data-mobile-order', 'system-first')
    await expect(cards).toHaveCount(3)
    await expect(cards.nth(0)).toHaveAttribute('data-package-tone', 'system')
    await expect(cards.nth(1)).toHaveAttribute('data-package-tone', 'start')
    await expect(cards.nth(2)).toHaveAttribute('data-package-tone', 'scale')
    await expect(ctas).toHaveCount(3)
    await expect(toggles).toHaveCount(3)
    await expect(panels).toHaveCount(3)

    for (let index = 0; index < 3; index += 1) {
      await expect(ctas.nth(index)).toBeVisible()
      await expect(toggles.nth(index)).toBeVisible()
      await expect(toggles.nth(index)).toHaveAttribute('aria-expanded', 'false')
      await expect(panels.nth(index)).toBeHidden()
      const target = await toggles.nth(index).boundingBox()
      expect(target?.height).toBeGreaterThanOrEqual(44)
    }

    await toggles.first().click()
    await expect(toggles.first()).toHaveAttribute('aria-expanded', 'true')
    await expect(panels.first()).toBeVisible()
    await expect(panels.nth(1)).toBeHidden()
  })

  test('keeps package content legible in forced-colors and increased-contrast modes', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })

    const systemPrice = page.locator('[data-testid="package-card"][data-package-tone="system"] .package-price-value')
    await expect(systemPrice).toBeVisible()
    const forcedStyles = await systemPrice.evaluate((element) => {
      const style = getComputedStyle(element)
      return { backgroundImage: style.backgroundImage, color: style.color, opacity: style.opacity }
    })
    expect(forcedStyles.backgroundImage).toBe('none')
    expect(forcedStyles.color).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(forcedStyles.opacity)).toBeGreaterThan(0.99)

    await page.emulateMedia({ forcedColors: 'none', contrast: 'more', reducedMotion: 'reduce' })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(systemPrice).toBeVisible()
    const contrastStyles = await systemPrice.evaluate((element) => {
      const card = element.closest<HTMLElement>('.package-card')!
      return {
        cardBackground: getComputedStyle(card).backgroundColor,
        color: getComputedStyle(element).color,
      }
    })
    expect(contrastStyles.cardBackground).not.toBe('rgb(255, 255, 255)')
    expect(contrastStyles.color).not.toBe('rgba(0, 0, 0, 0)')
  })
})
