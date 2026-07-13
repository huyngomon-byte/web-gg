import { expect, test } from '@playwright/test'
import type { CmsBlock } from '../src/cms/types'
import { getOrderedCaseStudies } from '../src/data/caseStudyStories'

test('treats the CMS story and metric collections as authoritative', () => {
  const oneStoryBlock: CmsBlock = {
    id: 'stories',
    heading: 'Stories',
    body: '',
    items: [{
      id: 'phinoi',
      title: 'PHINƠI',
      keyMetrics: [{ value: '+1', label: 'CMS-only metric', tileAnchor: 'center-low' }],
    }],
  }

  const stories = getOrderedCaseStudies(oneStoryBlock)
  expect(stories).toHaveLength(1)
  expect(stories[0].id).toBe('phinoi')
  expect(stories[0].keyMetrics).toHaveLength(1)
  expect(stories[0].keyMetrics[0]).toMatchObject({ value: '+1', label: 'CMS-only metric', tileAnchor: 'center-low' })
  expect(getOrderedCaseStudies({ ...oneStoryBlock, items: [] })).toEqual([])
})

test.describe('The One Stories', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/the-one')
  })

  test('has one page heading, labelled story articles, and focusable anchor navigation', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('The One Stories')

    const posts = page.locator('article.story-post')
    const postCount = await posts.count()
    expect(postCount).toBeGreaterThan(0)

    for (let index = 0; index < postCount; index += 1) {
      const post = posts.nth(index)
      const labelledBy = await post.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()
      await expect(post.locator(`h2#${labelledBy}`)).toHaveCount(1)
    }

    const storyLinks = page.locator('.ig-stories-row a[href^="#"]')
    await expect(storyLinks).toHaveCount(postCount)
    const accessibleNames = await storyLinks.evaluateAll((links) => links.map((link) => link.getAttribute('aria-label') || ''))
    expect(accessibleNames.every((name) => /^View .+ case study$/.test(name))).toBe(true)
    expect(new Set(accessibleNames).size).toBe(accessibleNames.length)

    const firstLink = storyLinks.first()
    const targetId = (await firstLink.getAttribute('href'))?.slice(1)
    expect(targetId).toBeTruthy()
    await firstLink.click()
    await expect(page).toHaveURL(new RegExp(`#${targetId}$`))
    await expect(page.locator(`#${targetId}`)).toBeFocused()
  })

  test('uses a dark network stage while keeping logos, client media, and live data crisp', async ({ page }) => {
    await expect(page.getByRole('banner')).toHaveClass(/is-dark-page/)
    await expect(page.locator('.stories-dark-stage')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.locator('.flow-wave-dark--stories')).toHaveCSS('opacity', '1')
    await expect(page.locator('.flow-wave-canvas--stories')).toHaveCount(1)
    await expect(page.locator('.stories-tray')).toHaveCSS('background-color', 'rgba(255, 252, 253, 0.96)')

    const firstRing = page.locator('.ig-story-ring').nth(1)
    const firstLogo = firstRing.locator('.story-brand-logo')
    await expect(firstLogo).toHaveAttribute('src', /\/story-logos\/phinoi\.webp$/)
    await expect(firstRing.locator('.ig-story-ring-inner')).not.toHaveCSS('background-color', 'rgb(255, 255, 255)')
    expect(await firstLogo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThanOrEqual(384)

    const firstPost = page.locator('article.story-post').first()
    await firstPost.scrollIntoViewIfNeeded()
    const postSurface = await firstPost.evaluate((element) => getComputedStyle(element).backgroundColor)
    expect(postSurface).toMatch(/^rgba?\(255, 25[0-5], 25[0-5]/)

    const frame = firstPost.locator('.story-media-frame')
    const track = firstPost.locator('.story-slide-track')
    const image = firstPost.locator('.story-slide-image').first()
    const dataTile = firstPost.locator('.story-glass-tile').first()
    await expect(frame).toHaveCSS('transform', 'none')
    await expect(track).toHaveCSS('transform', 'none')
    await expect(image).toHaveCSS('object-fit', 'contain')
    await expect(image).toHaveCSS('filter', 'none')
    await expect(image).toHaveAttribute('sizes', /660px/)
    await expect(dataTile).toHaveCSS('backdrop-filter', 'none')
    await expect(dataTile).toHaveCSS('transform', 'none')
    await expect(dataTile.locator('.story-chart-bignum-value')).toHaveCSS('font-weight', '800')

    const summary = firstPost.locator('.story-summary-glass')
    await expect(summary).toHaveCSS('color', 'rgb(43, 23, 33)')
    await expect(summary.locator('.story-summary-copy')).toHaveCSS('color', 'rgb(43, 23, 33)')
    await expect(summary.locator('.story-summary-kicker')).toHaveCSS('color', 'rgb(165, 15, 70)')
    expect(await summary.evaluate((element) => getComputedStyle(element).backgroundImage)).toContain('rgba(255, 250, 252, 0.97)')
  })

  test('keeps every metric, limits slides to two tiles, and uses manual navigation only', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const firstPost = page.locator('article.story-post').first()
    await firstPost.scrollIntoViewIfNeeded()

    const dots = firstPost.locator('.story-carousel-dot')
    const slideCount = await dots.count()
    expect(slideCount).toBeGreaterThan(1)

    await expect(firstPost.locator('.story-carousel-toggle')).toHaveCount(0)
    await expect(firstPost.getByRole('button', { name: /^(play|pause) carousel$/i })).toHaveCount(0)
    await expect(dots.first()).toHaveAttribute('aria-pressed', 'true')
    await page.waitForTimeout(5_500)
    await expect(dots.first()).toHaveAttribute('aria-pressed', 'true')

    let carouselMetricCount = 0
    for (let index = 0; index < slideCount; index += 1) {
      await dots.nth(index).click()
      await expect(dots.nth(index)).toHaveAttribute('aria-pressed', 'true')
      const activeMetrics = firstPost.locator('.story-slide-unit.is-active .story-chart-tile')
      const activeMetricCount = await activeMetrics.count()
      expect(activeMetricCount).toBeLessThanOrEqual(2)
      carouselMetricCount += activeMetricCount
    }

    await firstPost.getByRole('button', { name: 'About this story' }).click()
    const detail = page.getByTestId('story-detail-dialog')
    await expect(detail).toBeVisible()
    const detailMetricCount = await detail.locator('[data-testid="story-detail-metrics"] > div').count()
    expect(detailMetricCount).toBe(carouselMetricCount)
  })

  test('opens case details before booking and never turns missing social links into booking buttons', async ({ page }) => {
    const firstPost = page.locator('article.story-post').first()
    await firstPost.scrollIntoViewIfNeeded()
    await firstPost.getByRole('button', { name: 'About this story' }).click()

    const detail = page.getByTestId('story-detail-dialog')
    await expect(detail).toBeVisible()
    await expect(detail.getByRole('heading', { name: /case study$/i })).toBeVisible()
    await expect(detail.getByRole('heading', { name: 'Challenge', exact: true })).toBeVisible()
    await expect(detail.getByRole('heading', { name: 'Solution', exact: true })).toBeVisible()
    await expect(detail.getByRole('heading', { name: 'Result', exact: true })).toBeVisible()
    await expect(page.locator('#booking-modal-title')).toHaveCount(0)

    const bookingCta = detail.getByRole('button', { name: 'Schedule Our Date' })
    await expect(bookingCta).toHaveClass(/booking-cta-enhanced/)
    await expect(bookingCta.locator('.booking-cta-note')).toHaveText('Free 30-min founder call · No commitment')
    await bookingCta.click()
    await expect(detail).toHaveCount(0)
    await expect(page.locator('#booking-modal-title')).toBeVisible()

    await expect(page.locator('.story-social-row button')).toHaveCount(0)
    await expect(page.locator('a[href^="ttps://"]')).toHaveCount(0)
  })
})

test('The One Stories keeps its H1 at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/the-one')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toContainText('The One Stories')
})
