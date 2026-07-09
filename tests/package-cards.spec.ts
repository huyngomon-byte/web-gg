import { expect, test } from '@playwright/test'

test.describe('homepage package card selection', () => {
  test('keeps exactly one selected card through click and keyboard matrix', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/#packages')

    const cards = page.getByTestId('package-card')
    await expect(cards).toHaveCount(3)

    async function expectSelected(expectedIndex: number) {
      for (let index = 0; index < 3; index += 1) {
        await expect(cards.nth(index)).toHaveAttribute('data-selected', index === expectedIndex ? 'true' : 'false')
      }
      await expect(page.locator('[data-testid="package-card"][data-selected="true"]')).toHaveCount(1)
    }

    await expectSelected(1)
    await cards.first().scrollIntoViewIfNeeded()

    const matrix = Array.from({ length: 10 }, () => [0, 2, 1]).flat()
    for (const index of matrix) {
      const article = cards.nth(index).locator('article[role="button"]')
      await article.scrollIntoViewIfNeeded()
      await article.click({ position: { x: 72, y: 72 } })
      await expectSelected(index)
    }

    await cards.nth(0).locator('article[role="button"]').focus()
    await page.keyboard.press('Enter')
    await expectSelected(0)

    await cards.nth(2).locator('article[role="button"]').focus()
    await page.keyboard.press('Space')
    await expectSelected(2)
  })
})
