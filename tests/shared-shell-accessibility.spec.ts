import { expect, test } from '@playwright/test'

test.describe('shared shell accessibility', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('supports skip navigation, contained mobile-menu focus, and an accessible booking dialog', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/the-one')

    const skipLink = page.locator('a[href="#main-content"]')
    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
    await page.waitForTimeout(200)

    await expect(page.locator('a[href="/vi"]')).toHaveCount(0)

    const menuButton = page.locator('button[aria-controls="mobile-navigation"]')
    const openMenu = async () => {
      await expect.poll(async () => {
        if (await menuButton.getAttribute('aria-expanded') !== 'true') {
          await menuButton.click()
          await page.waitForTimeout(100)
        }
        return menuButton.getAttribute('aria-expanded')
      }).toBe('true')
    }
    await openMenu()

    const mobileMenu = page.getByRole('navigation', { name: 'Primary navigation' })
    await expect(mobileMenu).toBeVisible()
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
    await expect.poll(async () => page.evaluate(() => document.activeElement?.closest('#mobile-navigation') !== null)).toBe(true)

    await page.keyboard.press('Escape')
    await expect(mobileMenu).toBeHidden()
    await expect(menuButton).toBeFocused()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')

    await openMenu()
    await mobileMenu.getByRole('button', { name: 'Schedule Our Date' }).click()

    const dialog = page.getByRole('dialog', { name: /almost there darling/i })
    const closeButton = dialog.getByRole('button', { name: 'Close booking dialog' })
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(closeButton).toBeFocused()
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

    await page.keyboard.press('Shift+Tab')
    await expect.poll(async () => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(menuButton).toBeFocused()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
})
