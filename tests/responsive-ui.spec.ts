import { expect, test, type Page } from '@playwright/test'

const responsiveWidths = [1440, 1280, 1025, 1024, 1023, 900, 899, 768, 767, 430, 390, 360, 320]

async function openAt(page: Page, path: string, width: number, height = 900) {
  await page.setViewportSize({ width, height })
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#main-content')).toBeVisible()
  await page.waitForTimeout(120)
}

async function expectNoPageOverflow(page: Page, width: number) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    client: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }))

  expect(dimensions.viewport).toBe(width)
  expect(dimensions.document, `page overflow at ${width}px`).toBeLessThanOrEqual(dimensions.client + 1)
}

async function packageCardBoxes(page: Page) {
  return page.getByTestId('package-card').evaluateAll((cards) => cards.map((card) => {
    const rect = card.getBoundingClientRect()
    return {
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      tone: card.getAttribute('data-package-tone'),
      top: rect.top,
      width: rect.width,
    }
  }))
}

test.describe('responsive UI matrix', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('keeps Homepage and The One Stories inside every supported viewport', async ({ page }) => {
    test.setTimeout(180_000)

    for (const path of ['/', '/the-one']) {
      for (const width of responsiveWidths) {
        await openAt(page, path, width)
        await expectNoPageOverflow(page, width)
        await expect(page.locator('h1')).toHaveCount(1)
      }
    }
  })

  test('keeps Homepage mobile content complete and immediately readable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openAt(page, '/', 390, 844)

    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).not.toHaveCSS('opacity', '0')
    await expect(page.getByText('From 0 VND/month', { exact: true })).toHaveCount(0)

    const packageCards = page.getByTestId('package-card')
    await expect(packageCards).toHaveCount(3)
    await expect(page.locator('[data-testid="package-card"][data-featured="true"]')).toHaveAttribute('data-package-tone', 'system')
    await expect(page.getByTestId('package-cta')).toHaveCount(3)
    await expect(page.getByTestId('package-comparison-toggle')).toHaveCount(3)
    for (let index = 0; index < 3; index += 1) {
      await expect(page.getByTestId('package-cta').nth(index)).toBeVisible()
      await expect(page.getByTestId('package-comparison-toggle').nth(index)).toBeVisible()
    }

    const visualOrder = (await packageCardBoxes(page))
      .sort((left, right) => left.top - right.top)
      .map(({ tone }) => tone)
    expect(visualOrder).toEqual(['system', 'start', 'scale'])

    const redFlagReplies = page.getByTestId('red-flag-reply')
    expect(await redFlagReplies.count()).toBeGreaterThan(3)
    await expect(redFlagReplies.filter({ visible: true })).toHaveCount(3)
    await expect(page.getByRole('button', { name: /show \d+ more replies/i })).toBeVisible()

    const initialScroll = await page.evaluate(() => window.scrollY)
    await page.waitForTimeout(8_500)
    expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll)
  })

  test('uses three columns from 900px and a System-first stack below 900px', async ({ page }) => {
    test.setTimeout(90_000)

    for (const width of [1024, 1023, 900, 899, 768, 767, 390]) {
      await openAt(page, '/#packages', width, width < 900 ? 844 : 900)
      await expect(page.getByTestId('package-grid')).toBeVisible()
      await expect(page.getByTestId('package-grid')).toHaveAttribute(
        'data-mobile-order',
        width < 900 ? 'system-first' : 'standard',
      )
      await expect(page.getByTestId('package-card')).toHaveCount(3)
      await expectNoPageOverflow(page, width)

      const boxes = await packageCardBoxes(page)
      expect(boxes.every(({ left, right, width: cardWidth }) => (
        left >= -1 && right <= width + 1 && cardWidth > 0
      ))).toBe(true)

      if (width >= 900) {
        const byTone = Object.fromEntries(boxes.map((box) => [box.tone, box]))
        expect(byTone.start.left).toBeLessThan(byTone.system.left)
        expect(byTone.system.left).toBeLessThan(byTone.scale.left)
        expect(Math.max(...boxes.map(({ top }) => top)) - Math.min(...boxes.map(({ top }) => top))).toBeLessThanOrEqual(48)
        expect(boxes.every(({ width: cardWidth }) => cardWidth < width / 2)).toBe(true)
      } else {
        const byVisualPosition = [...boxes].sort((left, right) => left.top - right.top)
        expect(byVisualPosition.map(({ tone }) => tone)).toEqual(['system', 'start', 'scale'])
        expect(Math.max(...boxes.map(({ left }) => left)) - Math.min(...boxes.map(({ left }) => left))).toBeLessThanOrEqual(2)
        expect(boxes.every(({ width: cardWidth }) => cardWidth >= width - 48)).toBe(true)
        for (let index = 1; index < byVisualPosition.length; index += 1) {
          expect(byVisualPosition[index].top).toBeGreaterThanOrEqual(byVisualPosition[index - 1].bottom - 1)
        }

        const ctas = page.getByTestId('package-cta')
        for (let index = 0; index < 3; index += 1) await expect(ctas.nth(index)).toBeVisible()
      }
    }
  })

  test('keeps the Stories feed and Instagram-style pagination compact at every breakpoint', async ({ page }) => {
    for (const width of [1440, 1024, 768, 767, 430, 390, 360]) {
      await openAt(page, '/the-one', width, width <= 390 ? 844 : 900)

      const firstPost = page.locator('article.story-post').first()
      const postBox = await firstPost.boundingBox()
      expect(postBox).not.toBeNull()
      expect(postBox!.width).toBeLessThanOrEqual(width >= 1024 ? 661 : width >= 768 ? 641 : width)

      const firstDot = firstPost.locator('.story-carousel-dot').first()
      const dotBox = await firstDot.boundingBox()
      expect(dotBox).not.toBeNull()
      expect(dotBox!.width).toBeGreaterThanOrEqual(24)
      expect(dotBox!.width).toBeLessThanOrEqual(28)
      expect(dotBox!.height).toBeGreaterThanOrEqual(24)
      expect(dotBox!.height).toBeLessThanOrEqual(28)

      const dotIndicatorBox = await firstDot.locator('.story-carousel-dot-indicator').boundingBox()
      expect(dotIndicatorBox).not.toBeNull()
      expect(dotIndicatorBox!.width).toBeLessThanOrEqual(7)
      expect(dotIndicatorBox!.height).toBeLessThanOrEqual(7)

      const dotRail = firstPost.locator('.story-carousel-dots')
      const dotRailBox = await dotRail.boundingBox()
      expect(dotRailBox).not.toBeNull()
      expect(dotRailBox!.width).toBeLessThanOrEqual(postBox!.width)
      expect(dotRailBox!.height).toBeLessThanOrEqual(28)
      await expect(firstPost.locator('.story-carousel-toggle')).toHaveCount(0)

      if (width <= 767) {
        await expect(page.locator('header .ig-script-title', { hasText: 'The One Stories' })).toBeVisible()
      }
    }

    await openAt(page, '/the-one', 390, 844)
    const firstPost = page.locator('article.story-post').first()
    await firstPost.scrollIntoViewIfNeeded()
    await firstPost.getByRole('button', { name: 'About this story' }).click()
    const detail = page.getByTestId('story-detail-dialog')
    await expect(detail).toBeVisible()
    const detailBox = await detail.boundingBox()
    expect(detailBox).not.toBeNull()
    expect(detailBox!.width).toBeLessThanOrEqual(390)
    expect(detailBox!.y).toBeGreaterThanOrEqual(10)
    expect(detailBox!.height).toBeLessThanOrEqual(834)
  })
})
