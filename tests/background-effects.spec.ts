import { expect, test, type Locator } from '@playwright/test'

type DecorationStyle = {
  animationName: string
  animationPlayState: string
  backgroundColor: string
  backgroundImage: string
}

async function readDecorationStyles(stage: Locator): Promise<DecorationStyle[]> {
  return stage.locator([
    '.red-flags-stage-motion',
    '.red-flags-stage-aurora',
    '.red-flags-stage-signal',
  ].join(',')).evaluateAll((elements) => elements.flatMap((element) => (
    [null, '::before', '::after'].map((pseudo) => {
      const style = window.getComputedStyle(element, pseudo)
      return {
        animationName: style.animationName,
        animationPlayState: style.animationPlayState,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
      }
    })
  )))
}

function hasRunningAnimation(styles: DecorationStyle[]) {
  return styles.some((style) => {
    const names = style.animationName.split(',').map((value) => value.trim())
    const states = style.animationPlayState.split(',').map((value) => value.trim())
    return names.some((name) => name && name !== 'none')
      && states.some((state) => state !== 'paused')
  })
}

test.describe('CSS-only background stages', () => {
  test('keeps Sounds Familiar CSS-only, on the shared wave, and motion-safe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const stage = page.getByTestId('red-flags-stage')
    const decoration = stage.locator('.red-flags-stage-motion')
    await expect(stage).toHaveCount(1)
    await expect(stage).toBeAttached()
    await expect(decoration).toHaveCount(1)
    await expect(decoration).toHaveAttribute('aria-hidden', 'true')
    await expect(decoration.locator('.red-flags-stage-aurora')).toHaveCount(1)
    await expect(decoration.locator('.red-flags-stage-signal')).toHaveCount(1)

    await expect(stage.locator('video, source, picture, canvas')).toHaveCount(0)
    await expect(page.locator('.flow-wave-canvas--home')).toHaveCount(1)
    await expect(page.locator('canvas')).toHaveCount(1)

    const movingStyles = await readDecorationStyles(stage)
    expect(movingStyles.some((style) => (
      style.backgroundImage !== 'none'
      || !['rgba(0, 0, 0, 0)', 'transparent'].includes(style.backgroundColor)
    ))).toBe(true)
    expect(movingStyles.every((style) => !style.backgroundImage.includes('url('))).toBe(true)
    expect(hasRunningAnimation(movingStyles)).toBe(true)

    await stage.scrollIntoViewIfNeeded()
    await expect(page.locator('.closing-portal-section video')).toHaveCount(0)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect.poll(async () => hasRunningAnimation(await readDecorationStyles(stage))).toBe(false)
  })

  test('keeps the shared Homepage atmosphere static and both video stages poster-only for Save Data', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        get: () => ({ saveData: true }),
      })
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const shell = page.locator('.brand-atmosphere-shell[data-continuous-atmosphere="true"]')
    const canvas = page.locator('.flow-wave-canvas--home')
    await expect(shell).toHaveCount(1)
    await expect(canvas).toHaveCount(1)
    await expect(canvas).toHaveAttribute('data-motion', 'static', { timeout: 8_000 })
    await expect(page.locator('.home-hero video')).toHaveCount(0)
    await expect(page.locator('.home-hero picture img')).toHaveCount(1)

    const portal = page.locator('.closing-portal-section')
    await portal.scrollIntoViewIfNeeded()
    await page.waitForTimeout(700)
    await expect(portal.locator('video')).toHaveCount(0)
    await expect(portal.locator('.closing-portal-poster')).toHaveCount(1)
  })

  test('uses one dark Stories canvas, no video background, and a static reduced-motion frame', async ({ page }) => {
    test.setTimeout(45_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/the-one', { waitUntil: 'domcontentloaded' })

    const lightLayer = page.locator('.flow-wave-light--stories')
    const darkLayer = page.locator('.flow-wave-dark--stories')
    const canvas = page.locator('.flow-wave-canvas--stories')
    const stage = page.locator('.stories-dark-stage')

    await expect(lightLayer).toHaveCount(1)
    await expect(darkLayer).toHaveCount(1)
    await expect(canvas).toHaveCount(1)
    await expect(page.locator('canvas')).toHaveCount(1)
    await expect(page.locator('video, audio, source[type^="video/"], source[type^="audio/"]')).toHaveCount(0)
    await expect(lightLayer).toHaveAttribute('aria-hidden', 'true')
    await expect(darkLayer).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas).toHaveCSS('pointer-events', 'none')
    await expect(lightLayer).toHaveCSS('opacity', '0')
    await expect(darkLayer).toHaveCSS('opacity', '1')

    const [darkBackground, stageBackground] = await Promise.all([
      darkLayer.evaluate((element) => getComputedStyle(element).backgroundImage),
      stage.evaluate((element) => getComputedStyle(element).backgroundImage),
    ])
    expect(darkBackground).toContain('linear-gradient')
    expect(stageBackground).toContain('linear-gradient')
    expect(darkBackground).not.toContain('url(')
    expect(stageBackground).not.toContain('url(')

    await expect.poll(
      async () => canvas.getAttribute('data-motion'),
      { timeout: 15_000 },
    ).toMatch(/^(animated|static)$/)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(canvas).toHaveAttribute('data-motion', 'static', { timeout: 15_000 })

    const firstStoryTile = page.locator('.story-chart-tile').first()
    await expect(firstStoryTile).toHaveCSS('animation-name', 'none')
  })

  test('keeps the Stories CSS fallback and skips WebGL when Save Data is enabled', async ({ page }) => {
    await page.addInitScript(() => {
      const runtimeWindow = window as typeof window & { __gg99WebglContextCalls: number }
      runtimeWindow.__gg99WebglContextCalls = 0
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        get: () => ({ saveData: true }),
      })

      const originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = (function (
        this: HTMLCanvasElement,
        contextId: string,
        ...args: unknown[]
      ) {
        if (contextId === 'webgl' || contextId === 'webgl2') {
          runtimeWindow.__gg99WebglContextCalls += 1
        }
        return Reflect.apply(originalGetContext, this, [contextId, ...args])
      }) as typeof HTMLCanvasElement.prototype.getContext
    })

    await page.goto('/the-one', { waitUntil: 'domcontentloaded' })

    const canvas = page.locator('.flow-wave-canvas--stories')
    await expect(canvas).toHaveCount(1)
    await expect(canvas).toHaveAttribute('data-motion', 'static', { timeout: 8_000 })
    await expect(page.locator('.flow-wave-dark--stories')).toHaveCSS('opacity', '1')
    await expect(page.locator('video, audio, source[type^="video/"], source[type^="audio/"]')).toHaveCount(0)
    await page.waitForTimeout(900)

    const webglCalls = await page.evaluate(() => (
      window as typeof window & { __gg99WebglContextCalls: number }
    ).__gg99WebglContextCalls)
    expect(webglCalls).toBe(0)
  })
})
