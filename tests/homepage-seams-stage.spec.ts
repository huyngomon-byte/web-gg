import { expect, test } from '@playwright/test'

test('keeps Homepage seams soft and the Sounds Familiar stage media-free', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const stage = page.getByTestId('red-flags-stage')
  const motion = stage.locator('.red-flags-stage-motion')
  await expect(stage).toBeAttached()
  await expect(stage.getByTestId('red-flags-feed')).toHaveCount(1)
  await expect(stage.getByTestId('red-flags-root-post')).toHaveCount(1)
  await expect(motion).toHaveAttribute('aria-hidden', 'true')
  await expect(motion.locator('video, canvas, img')).toHaveCount(0)
  await expect(motion.locator(':scope > span')).toHaveCount(2)
  await expect(page.locator('.flow-wave-canvas--home')).toHaveCount(1)

  const runningMotion = await motion.locator(':scope > span').evaluateAll((layers) => layers.map((layer) => {
    const style = getComputedStyle(layer)
    return {
      name: style.animationName,
      duration: Number.parseFloat(style.animationDuration) || 0,
    }
  }))
  expect(runningMotion.every(({ name }) => name !== 'none')).toBe(true)
  expect(runningMotion.every(({ duration }) => duration >= 22)).toBe(true)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reducedMotion = await motion.locator(':scope > span').evaluateAll((layers) => layers.map((layer) => getComputedStyle(layer).animationName))
  expect(reducedMotion).toEqual(['none', 'none'])

  const atmosphere = page.locator('.brand-atmosphere-shell[data-continuous-atmosphere="true"]')
  const footer = atmosphere.getByTestId('site-footer')
  await expect(atmosphere).toHaveCount(1)
  await expect(atmosphere.locator(':scope > #main-content')).toHaveCount(1)
  await expect(footer).toHaveCount(1)
  await expect(footer).toHaveCSS('border-top-width', '0px')
  await expect(page.locator('.flow-wave-canvas--home')).toHaveCount(1)

  const heroTransition = page.getByTestId('hero-transition')
  await expect(heroTransition).toBeAttached()
  await expect(heroTransition).toHaveAttribute('aria-hidden', 'true')
  await expect(heroTransition).toHaveCSS('pointer-events', 'none')

  const packageBackground = await page.locator('#packages').evaluate((element) => {
    const style = getComputedStyle(element)
    return { color: style.backgroundColor, image: style.backgroundImage }
  })
  expect(packageBackground.color).toBe('rgba(0, 0, 0, 0)')
  expect(packageBackground.image).toContain('gradient')

  const boundaries = [
    'hero-featured',
    'featured-red-flags',
    'red-flags-packages',
    'packages-people',
    'people-faq',
    'faq-portal',
  ]
  for (const boundary of boundaries) {
    const bridge = page.locator(`[data-zone-boundary="${boundary}"]`)
    await expect(bridge).toHaveCount(1)
    await expect(bridge).toHaveAttribute('aria-hidden', 'true')
    await expect(bridge).toHaveCSS('pointer-events', 'none')
    await expect(bridge.locator('video, canvas, img')).toHaveCount(0)
    const overlay = await bridge.evaluate((element) => {
      const box = element.getBoundingClientRect()
      const style = getComputedStyle(element, '::before')
      const top = Number.parseFloat(style.top)
      const height = Number.parseFloat(style.height)
      return {
        background: style.backgroundImage,
        bottom: top + height,
        layoutHeight: box.height,
        top,
      }
    })
    expect(overlay.layoutHeight).toBeLessThanOrEqual(1)
    expect(overlay.top).toBeLessThan(0)
    expect(overlay.bottom).toBeGreaterThan(0)
    expect(overlay.background).toContain('linear-gradient')
  }

  const peopleBackground = await page.getByTestId('people-section').evaluate((element) => getComputedStyle(element).backgroundImage)
  expect(peopleBackground).toContain('radial-gradient')

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  const forcedColorBridges = await page.locator('[data-zone-boundary]').evaluateAll((bridges) => bridges.map((bridge) => getComputedStyle(bridge, '::before').backgroundImage))
  expect(forcedColorBridges).toEqual(boundaries.map(() => 'none'))
  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'reduce' })

  const faq = page.locator('.closing-section--portal-connected')
  const portal = page.locator('.closing-portal-section--connected')
  const faqBridge = page.getByTestId('faq-portal-bridge')
  await expect(faqBridge).toHaveAttribute('aria-hidden', 'true')
  await expect(faqBridge).toHaveCSS('pointer-events', 'none')
  const seamGeometry = await Promise.all([
    faq.evaluate((element) => element.getBoundingClientRect().bottom),
    portal.evaluate((element) => element.getBoundingClientRect().top),
    faqBridge.evaluate((element) => element.getBoundingClientRect().height),
    faq.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingBottom)),
  ])
  expect(Math.abs(seamGeometry[0] - seamGeometry[1])).toBeLessThanOrEqual(1)
  expect(seamGeometry[2]).toBeLessThanOrEqual(1)
  expect(seamGeometry[3]).toBeLessThanOrEqual(112)

  const portalFadeHeight = await page.locator('.closing-portal-section').evaluate((element) => Number.parseFloat(getComputedStyle(element, '::after').height))
  expect(portalFadeHeight).toBeGreaterThan(120)

  const legalRule = await page.locator('.brand-footer-legal').evaluate((element) => {
    const style = getComputedStyle(element, '::before')
    return { height: Number.parseFloat(style.height), background: style.backgroundImage }
  })
  expect(legalRule.height).toBe(1)
  expect(legalRule.background).toContain('linear-gradient')
})
