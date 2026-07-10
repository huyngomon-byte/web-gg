import { expect, test, type Locator, type Page } from '@playwright/test'

type RevealStep = {
  delayMs: number
  direction: string | null
  order: number
  phase: number
  reveal: string | null
  testId: string | null
  text: string
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
      }))

    return {
      stepMs: Number.parseFloat(scene.style.getPropertyValue('--scene-step-ms')),
      steps,
    }
  })
}

function expectValidSequence(snapshot: SceneSnapshot, direction: 'down' | 'up') {
  expect(snapshot.steps.length).toBeGreaterThan(5)
  expect(snapshot.stepMs).toBeGreaterThan(0)

  const byOrder = [...snapshot.steps].sort((left, right) => left.order - right.order)
  expect(byOrder.map((step) => step.order)).toEqual(
    Array.from({ length: snapshot.steps.length }, (_, index) => index),
  )
  expect(byOrder.map((step) => step.phase)).toEqual(
    [...byOrder]
      .map((step) => step.phase)
      .sort(direction === 'down' ? (left, right) => left - right : (left, right) => right - left),
  )

  for (const step of snapshot.steps) {
    expect(step.direction).toBe(direction)
    expect(step.delayMs).toBeCloseTo(step.order * snapshot.stepMs, 5)
  }
}

test.describe('Homepage bidirectional scene reveal', () => {
  test('does not pre-run distant scenes and reverses their sequence on upward entry', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIntroToFinish(page)

    const packages = page.locator('#packages[data-reveal-scene]')
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
    expectValidSequence(down, 'down')

    const downCards = down.steps.filter((step) => step.testId === 'package-card')
    expect(downCards).toHaveLength(3)
    expect(downCards.map((step) => step.order)).toEqual(
      [...downCards].map((step) => step.order).sort((left, right) => left - right),
    )
    const downTitle = down.steps.find((step) => step.reveal === 'words' && step.text.includes('The One Packages'))
    expect(downTitle).toBeDefined()
    expect(downTitle!.order).toBeLessThan(Math.min(...downCards.map((step) => step.order)))

    const sceneBottom = await packages.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return rect.bottom + window.scrollY
    })

    // Move well beyond the scene so it rearms, then approach it from below in
    // two scrolls. The first scroll establishes an upward direction while the
    // scene is still outside the observer margin; the second enters the scene.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect.poll(() => packages.getAttribute('data-reveal-played')).toBeNull()

    await page.evaluate((bottom) => {
      window.scrollTo(0, bottom + window.innerHeight * 0.55)
    }, sceneBottom)
    await waitForTwoFrames(page)
    await expect(packages).not.toBeInViewport()

    await page.evaluate((bottom) => {
      window.scrollTo(0, Math.max(0, bottom - window.innerHeight * 0.35))
    }, sceneBottom)
    await expect(packages).toHaveAttribute('data-reveal-played', 'true')
    await expect(packages).toHaveAttribute('data-reveal-direction', 'up')

    const up = await sceneSnapshot(packages)
    expectValidSequence(up, 'up')
    expect(up.steps).toHaveLength(down.steps.length)
    up.steps.forEach((step, domIndex) => {
      expect(step.reveal).toBe(down.steps[domIndex].reveal)
    })

    const upCards = up.steps.filter((step) => step.testId === 'package-card')
    expect(upCards.map((step) => step.order)).toEqual(
      [...upCards].map((step) => step.order).sort((left, right) => right - left),
    )
  })

  test('keeps every reveal step static and readable for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const packages = page.locator('#packages[data-reveal-scene]')
    await expect(packages).toBeAttached()
    await expect(packages.locator('[data-reveal]').first()).toHaveAttribute('data-revealed', 'true')

    const state = await packages.evaluate((root) => {
      const scene = root as HTMLElement
      const steps = Array.from(scene.querySelectorAll<HTMLElement>('[data-reveal]'))
        .filter((element) => element.closest('[data-reveal-scene]') === scene)
      const words = Array.from(scene.querySelectorAll<HTMLElement>('.rw-word'))

      return {
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
    expect(state.stepsVisible).toBe(true)
    expect(state.wordsVisible).toBe(true)
    await expect(packages.getByRole('heading', { name: 'The One Packages' })).toBeVisible()
    await expect(page.getByTestId('package-card')).toHaveCount(3)
  })
})
