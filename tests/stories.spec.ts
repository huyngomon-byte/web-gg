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
      title: 'PHINOI',
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

  test('keeps every metric, limits slides to two tiles, and exposes explicit autoplay controls', async ({ page }) => {
    const firstPost = page.locator('article.story-post').first()
    await firstPost.scrollIntoViewIfNeeded()

    const dots = firstPost.locator('.story-carousel-dot')
    const slideCount = await dots.count()
    expect(slideCount).toBeGreaterThan(1)

    const toggle = firstPost.getByRole('button', { name: /carousel autoplay is disabled by reduced-motion settings/i })
    await expect(toggle).toBeDisabled()

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

    await detail.getByRole('button', { name: 'Book a consultation' }).click()
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
