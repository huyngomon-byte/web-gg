import { expect, test } from '@playwright/test'

test.describe('homepage package card selection', () => {
  test('keeps exactly one package selected with native mouse and keyboard controls', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const response = await page.goto('/#packages')
    const initialHtml = await response?.text()

    const cards = page.getByTestId('package-card')
    const radios = page.getByTestId('package-radio')
    await expect(cards).toHaveCount(3)
    await expect(radios).toHaveCount(3)
    expect(initialHtml).toBeDefined()
    expect(initialHtml).not.toContain('From 0 VND/month')
    await expect(page.getByText('From 0 VND/month', { exact: true })).toHaveCount(0)
    expect(await page.content()).not.toContain('From 0 VND/month')
    await expect(page.locator('[data-testid="package-card"] article[role="button"]')).toHaveCount(0)

    const radioTarget = await radios.first().locator('..').boundingBox()
    expect(radioTarget?.height).toBeGreaterThanOrEqual(44)

    async function expectSelected(expectedIndex: number) {
      for (let index = 0; index < 3; index += 1) {
        await expect(cards.nth(index)).toHaveAttribute('data-selected', index === expectedIndex ? 'true' : 'false')
        if (index === expectedIndex) await expect(radios.nth(index)).toBeChecked()
        else await expect(radios.nth(index)).not.toBeChecked()
      }
      await expect(page.locator('[data-testid="package-card"][data-selected="true"]')).toHaveCount(1)
      await expect(page.locator('[data-testid="package-radio"]:checked')).toHaveCount(1)
    }

    await expectSelected(1)

    await radios.nth(0).click()
    await expectSelected(0)

    await radios.nth(2).focus()
    await page.keyboard.press('Space')
    await expectSelected(2)

    await page.keyboard.press('ArrowRight')
    await expectSelected(0)

    await page.keyboard.press('ArrowLeft')
    await expectSelected(2)
  })
})
