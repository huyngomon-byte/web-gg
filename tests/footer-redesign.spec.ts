import { expect, test } from '@playwright/test'

const solutionLabels = ['The One Start', 'The One System', 'The One Scale']

test.describe('compact English footer', () => {
  test('uses the approved hierarchy and destinations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    const footer = page.getByTestId('site-footer')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()
    await expect(footer.getByText('One partner. One system. One growth direction.')).toBeVisible()

    const solutions = footer.getByRole('navigation', { name: 'Solutions' })
    for (const label of solutionLabels) {
      await expect(solutions.getByRole('link', { name: label })).toHaveAttribute('href', '/#packages')
    }

    const explore = footer.locator('nav[aria-labelledby="footer-explore-heading"]')
    await expect(explore.getByRole('link', { name: 'About The One' })).toHaveAttribute('href', '/about')
    await expect(explore.getByRole('link', { name: 'The One Stories' })).toHaveAttribute('href', '/the-one')
    await expect(explore.getByRole('link', { name: 'Insights' })).toHaveAttribute('href', '/insights')

    await expect(footer.getByText('See you on our first date?')).toHaveCount(0)
    await expect(footer.locator('img[src*="qr"]')).toHaveCount(0)
    await expect(footer.getByRole('navigation', { name: 'Legal' })).toBeVisible()
    await expect(footer.locator('a[href="/vi"], a[href="/en"]')).toHaveCount(0)
  })

  test('keeps links touch-friendly and the footer compact', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/the-one')

    const footer = page.getByTestId('site-footer')
    await footer.scrollIntoViewIfNeeded()

    const links = footer.locator('a')
    for (let index = 0; index < await links.count(); index += 1) {
      const box = await links.nth(index).boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
      expect(box?.width).toBeGreaterThanOrEqual(44)
    }

    const mobileHeight = await footer.evaluate((element) => element.getBoundingClientRect().height)
    expect(mobileHeight).toBeLessThanOrEqual(480)

    await page.setViewportSize({ width: 1440, height: 900 })
    const desktopHeight = await footer.evaluate((element) => element.getBoundingClientRect().height)
    expect(desktopHeight).toBeGreaterThanOrEqual(240)
    expect(desktopHeight).toBeLessThanOrEqual(360)
  })
})
