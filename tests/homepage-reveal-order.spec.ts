import { expect, test, type Locator, type Page } from '@playwright/test'

type RevealStep = {
  delayMs: number
  direction: string | null
  order: number
  phase: number
  reveal: string | null
  testId: string | null
  text: string
  tone: string | null
}

type SceneSnapshot = {
  stepMs: number
  steps: RevealStep[]
}

async function waitForIntroToFinish(page: Page) {
  await page.locator('.intro-loader').waitFor({ state: 'hidden', timeout: 10_000 })
}

async function waitForTwoFrames(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
  }))
}

async function sceneSnapshot(sceneLocator: Locator): Promise<SceneSnapshot> {
  return sceneLocator.evaluate((root) => {
    const scene = root as HTMLElement
    const steps = Array.from(scene.querySelectorAll<HTMLElement>('[data-reveal]'))
      .filter((element) => element.closest('[data-reveal-scene]') === scene)
      .map((element) => ({
        delayMs: Number.parseFloat(element.style.getPropertyValue('--reveal-delay')),
        direction: element.dataset.revealDirection ?? null,
        order: Number.parseInt(element.style.getPropertyValue('--rdi'), 10),
        phase: Number.parseFloat(element.dataset.revealPhase ?? '0') || 0,
        reveal: element.getAttribute('data-reveal'),
        testId: element.getAttribute('data-testid'),
        text: (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
        tone: element.getAttribute('data-package-tone'),
      }))

    return {
      stepMs: Number.parseFloat(scene.style.getPropertyValue('--scene-step-ms')),
      steps,
    }
  })
}

function expectValidSequence(snapshot: SceneSnapshot) {
  expect(snapshot.steps.length).toBeGreaterThan(5)
  expect(snapshot.stepMs).toBe(100)

  const byOrder = [...snapshot.steps].sort((left, right) => left.order - right.order)
  expect(byOrder.map((step) => step.order)).toEqual(
    Array.from({ length: snapshot.steps.length }, (_, index) => index),
  )
  expect(byOrder.map((step) => step.phase)).toEqual(
    [...byOrder]
      .map((step) => step.phase)
      .sort((left, right) => left - right),
  )

  for (const step of snapshot.steps) {
    expect(step.direction).toBe('down')
    expect(step.delayMs).toBeCloseTo(step.order * snapshot.stepMs, 5)
  }
}

test.describe('Homepage one-shot package reveal', () => {
  test('stays armed offscreen, staggers once, and does not replay after leaving the section', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIntroToFinish(page)

    const packages = page.locator('#packages[data-reveal-scene][data-reveal-once]')
    await expect(packages).toBeAttached()
    await expect(page.getByTestId('package-card')).toHaveCount(3)
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(10)

    // The old global rescue timer revealed the whole page after 4.2 seconds.
    // Staying at the hero must leave this distant scene fully armed instead.
    await page.waitForTimeout(4_500)
    await expect(packages).not.toHaveAttribute('data-reveal-played', 'true')
    await expect(packages.locator('[data-reveal][data-revealed]')).toHaveCount(0)

    await packages.scrollIntoViewIfNeeded()
    await expect(packages).toHaveAttribute('data-reveal-played', 'true')
    await expect(packages).toHaveAttribute('data-reveal-direction', 'down')

    const down = await sceneSnapshot(packages)
    expectValidSequence(down)

    const downCards = down.steps.filter((step) => step.testId === 'package-card')
    expect(downCards).toHaveLength(3)
    expect(downCards.map((step) => step.tone).sort()).toEqual(['scale', 'start', 'system'])
    const orderedCards = [...downCards].sort((left, right) => left.order - right.order)
    expect(orderedCards[1].delayMs - orderedCards[0].delayMs).toBe(100)
    expect(orderedCards[2].delayMs - orderedCards[1].delayMs).toBe(100)
    const downTitle = down.steps.find((step) => step.reveal === 'words' && step.text.includes('The One Packages'))
    expect(downTitle).toBeDefined()
    expect(downTitle!.order).toBeLessThan(Math.min(...downCards.map((step) => step.order)))

    // Once played, leaving the section must preserve the completed state. The
    // previous bidirectional behavior removed these attributes and replayed it.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await waitForTwoFrames(page)
    await expect(packages).not.toBeInViewport()
    await expect(packages).toHaveAttribute('data-reveal-played', 'true')
    await expect(packages).toHaveAttribute('data-reveal-direction', 'down')
    expect(await sceneSnapshot(packages)).toEqual(down)

    await packages.scrollIntoViewIfNeeded()
    await expect(packages).toHaveAttribute('data-reveal-played', 'true')
    await expect(packages).toHaveAttribute('data-reveal-direction', 'down')
    expect(await sceneSnapshot(packages)).toEqual(down)
  })

  test('keeps every reveal step static and readable for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const packages = page.locator('#packages[data-reveal-scene][data-reveal-once]')
    await expect(packages).toBeAttached()
    await expect(packages.locator('[data-reveal]').first()).toHaveAttribute('data-revealed', 'true')

    const state = await packages.evaluate((root) => {
      const scene = root as HTMLElement
      const steps = Array.from(scene.querySelectorAll<HTMLElement>('[data-reveal]'))
        .filter((element) => element.closest('[data-reveal-scene]') === scene)
      const words = Array.from(scene.querySelectorAll<HTMLElement>('.rw-word'))
      const cards = Array.from(scene.querySelectorAll<HTMLElement>('[data-testid="package-card"]'))

      return {
        cardsStatic: cards.length === 3 && cards.every((card) => {
          const style = window.getComputedStyle(card)
          return style.animationName === 'none'
            && style.transform === 'none'
            && Number.parseFloat(style.opacity) > 0.99
        }),
        stepCount: steps.length,
        stepsVisible: steps.every((element) => {
          const style = window.getComputedStyle(element)
          return element.classList.contains('is-visible')
            && element.dataset.revealed === 'true'
            && Number.parseFloat(style.opacity) > 0.99
            && style.visibility === 'visible'
        }),
        wordsVisible: words.length > 0 && words.every((word) => Number.parseFloat(window.getComputedStyle(word).opacity) > 0.99),
      }
    })

    expect(state.stepCount).toBeGreaterThan(5)
    expect(state.cardsStatic).toBe(true)
    expect(state.stepsVisible).toBe(true)
    expect(state.wordsVisible).toBe(true)
    await expect(packages.getByRole('heading', { name: 'The One Packages' })).toBeVisible()
    await expect(page.getByTestId('package-card')).toHaveCount(3)
  })
})
