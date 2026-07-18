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

async function packageGroupDocumentBox(page: Page, name: string) {
  return page.locator(`[data-rv-group="${name}"]`).evaluate((group) => {
    const rect = group.getBoundingClientRect()
    return { height: rect.height, top: rect.top + window.scrollY, viewportHeight: window.innerHeight }
  })
}

async function scrollPackageGroupIntoView(page: Page, name: string, direction: 'down' | 'up') {
  const box = await packageGroupDocumentBox(page, name)
  const y = direction === 'down'
    ? box.top - box.viewportHeight * 0.52
    : box.top + box.height - box.viewportHeight * 0.52
  await page.evaluate((scrollY) => window.scrollTo(0, Math.max(0, scrollY)), y)
  await waitForTwoFrames(page)
}

async function resetPackageGroupAboveViewport(page: Page, name: string) {
  const box = await packageGroupDocumentBox(page, name)
  const resetState = await page.locator(`[data-rv-group="${name}"]`).evaluate((group, scrollY) => (
    new Promise<{ durations: string[]; sawReset: boolean }>((resolve) => {
      const finish = (sawReset: boolean) => {
        observer.disconnect()
        window.clearTimeout(timeout)
        const items = [
          ...(group.classList.contains('rv-item') ? [group as HTMLElement] : []),
          ...Array.from(group.querySelectorAll<HTMLElement>('.rv-item')),
        ].filter((item) => item.closest('[data-rv-group]') === group)
        resolve({
          durations: items.map((item) => getComputedStyle(item).transitionDuration),
          sawReset,
        })
      }
      const observer = new MutationObserver(() => {
        if (group.classList.contains('rv-reset')) finish(true)
      })
      const timeout = window.setTimeout(() => finish(false), 2_000)
      observer.observe(group, { attributeFilter: ['class'], attributes: true })
      window.scrollTo(0, Math.max(0, scrollY))
    })
  ), box.top + box.height + box.viewportHeight * 0.2)
  await waitForTwoFrames(page)
  return resetState
}

test.describe('Homepage grouped bidirectional package reveal', () => {
  test('owns an independent, sequential timeline for every Round 4 group', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })

    const packages = page.locator('#packages')
    expect(await packages.getAttribute('data-reveal-once')).toBeNull()
    expect(await packages.getAttribute('data-reveal-scene')).toBeNull()
    expect(await packages.getAttribute('data-reveal-step-ms')).toBeNull()
    await expect(page.getByTestId('package-card')).toHaveCount(3)
    await expect(packages).toHaveAttribute('data-rv-ready', 'true')

    const expectedMinimumItems: Record<string, number> = {
      header: 4,
      'card-start': 10,
      'card-system': 10,
      'card-scale': 10,
      compare: 8,
      process: 7,
      confidence: 5,
      terms: 7,
    }
    const groupNames = await packages.locator('[data-rv-group]').evaluateAll((groups) => (
      groups.map((group) => group.getAttribute('data-rv-group'))
    ))
    expect(groupNames).toEqual(Object.keys(expectedMinimumItems))

    for (const [name, minimumItems] of Object.entries(expectedMinimumItems)) {
      const group = packages.locator(`[data-rv-group="${name}"]`)
      const snapshot = await group.evaluate((root) => {
        const items = [
          ...(root.classList.contains('rv-item') ? [root as HTMLElement] : []),
          ...Array.from(root.querySelectorAll<HTMLElement>('.rv-item')),
        ].filter((item) => item.closest('[data-rv-group]') === root)
        return items.map((item) => ({
          delay: Number.parseInt(item.dataset.rvDelayMs ?? '', 10),
          index: Number.parseInt(item.style.getPropertyValue('--rv-i'), 10),
          legacyIndex: item.style.getPropertyValue('--pi'),
          order: Number.parseInt(item.dataset.rvOrder ?? '', 10),
        }))
      })
      expect(snapshot.length, `${name} item count`).toBeGreaterThanOrEqual(minimumItems)
      expect(Math.min(...snapshot.map(({ order }) => order)), `${name} local order starts at zero`).toBe(0)
      expect(snapshot.every(({ index, order }) => index === Math.min(order, 7)), `${name} capped local indices`).toBe(true)
      const maximumLocalIndex = Math.min(Math.max(...snapshot.map(({ order }) => order)), 7)
      expect(new Set(snapshot.map(({ index }) => index)), `${name} local index range`).toEqual(
        new Set(Array.from({ length: maximumLocalIndex + 1 }, (_, index) => index)),
      )
      expect(snapshot.every(({ legacyIndex }) => legacyIndex === ''), `${name} legacy delays`).toBe(true)
      expect(snapshot.every(({ delay }) => Number.isFinite(delay)), `${name} explicit delays`).toBe(true)
      expect(Math.min(...snapshot.map(({ delay }) => delay)), `${name} starts immediately`).toBe(0)
      expect(snapshot.map(({ delay, order }) => ({ delay, order })).sort((left, right) => left.order - right.order), `${name} delays follow local order`).toEqual(
        [...snapshot]
          .map(({ delay, order }) => ({ delay, order }))
          .sort((left, right) => left.delay - right.delay || left.order - right.order),
      )
      expect(Math.max(...snapshot.map(({ delay }) => delay)), `${name} delay cap`).toBeLessThanOrEqual(480)
    }

    const groupDelays = async (name: string) => packages.locator(`[data-rv-group="${name}"]`).evaluate((root) => {
      const items = [
        ...(root.classList.contains('rv-item') ? [root as HTMLElement] : []),
        ...Array.from(root.querySelectorAll<HTMLElement>('.rv-item')),
      ].filter((item) => item.closest('[data-rv-group]') === root)
      return items
        .map((item) => ({
          delay: Number.parseInt(item.dataset.rvDelayMs ?? '', 10),
          order: Number.parseInt(item.dataset.rvOrder ?? '', 10),
        }))
        .sort((left, right) => left.order - right.order)
        .map(({ delay }) => delay)
    })
    expect(await groupDelays('header')).toEqual([0, 80, 160, 240])
    expect(await groupDelays('process')).toEqual([0, 60, 140, 200, 260, 320, 380])
    expect(await groupDelays('confidence')).toEqual([0, 60, 120, 180, 240])
    expect(await groupDelays('terms')).toEqual([0, 60, 120, 180, 240, 300, 360])
    for (const [tone, baseMs] of [['start', 0], ['system', 90], ['scale', 180]] as const) {
      const delays = await groupDelays(`card-${tone}`)
      const uniqueDelays = [...new Set(delays)]
      expect(uniqueDelays.slice(0, 9), `${tone} card opening sequence`).toEqual([0, 50, 100, 140, 180, 220, 260, 300, 340])
      expect(uniqueDelays.slice(9).every((delay) => delay >= 400 && delay <= 480), `${tone} card row sequence`).toBe(true)
      await expect(packages.locator(`[data-rv-group="card-${tone}"]`)).toHaveAttribute('data-rv-base-ms', String(baseMs))
    }

    await expect(packages.locator('.packages-section-header .rv-item').nth(0)).toContainText('PRICING')
    await expect(packages.locator('.packages-section-header .rv-item').nth(1)).toContainText('The One Packages')
    await expect(packages.locator('.packages-section-header .home-gradient-underline.rv-item')).toHaveCount(1)
    await expect(packages.locator('[data-rv-group="process"] .package-process-connector')).toHaveCount(2)
    await expect(packages.locator('[data-rv-group="terms"] .package-terms-highlights > li.rv-item')).toHaveCount(4)
  })

  test('re-arms after a full exit and enters from the current scroll direction', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIntroToFinish(page)
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; } #packages { --rv-dur: 10000ms !important; }' })

    const name = 'compare'
    const group = page.locator(`[data-rv-group="${name}"]`)
    const items = group.locator('.rv-item')
    await expect(items.first()).toBeAttached()

    const box = await packageGroupDocumentBox(page, name)
    await page.evaluate(
      (scrollY) => window.scrollTo(0, Math.max(0, scrollY)),
      box.top - box.viewportHeight * 1.25,
    )
    await waitForTwoFrames(page)
    await expect(group.locator('.rv-item.rv-in')).toHaveCount(0)

    // Reverse from inside the first class mutation. This runs before the next
    // animation frame even on a loaded CI runner, so later stagger items are
    // guaranteed to still be pending without altering the production delays.
    await group.evaluate((root) => {
      const first = root.querySelector<HTMLElement>('.rv-item')
      if (!first) throw new Error('Missing first reveal item')
      const observer = new MutationObserver(() => {
        if (!first.classList.contains('rv-in')) return
        observer.disconnect()
        root.setAttribute('data-test-interrupt-origin', root.dataset.rvDirection ?? '')
        window.scrollBy(0, -32)
      })
      observer.observe(first, { attributes: true, attributeFilter: ['class'] })
    })
    await scrollPackageGroupIntoView(page, name, 'down')
    await expect(items.first()).toHaveClass(/rv-in/)
    await expect(group).not.toHaveClass(/rv-reset/)
    await expect(group).toHaveAttribute('data-test-interrupt-origin', 'down')
    await expect(items.first()).toHaveAttribute('data-rv-reveal-direction', 'down')
    expect(await items.first().evaluate((element) => {
      const translate = getComputedStyle(element).translate
      if (translate === 'none') return 0
      const parts = translate.split(/\s+/)
      return Number.parseFloat(parts[1] ?? parts[0])
    })).toBeGreaterThan(0)

    // Interrupt an in-flight stagger: revealed items keep their frozen entry
    // direction, while items whose due time has not arrived use the new one.
    await expect(group).toHaveAttribute('data-rv-direction', 'up')
    await expect(items.last()).toHaveClass(/rv-in/)
    await expect(items.first()).toHaveAttribute('data-rv-reveal-direction', 'down')
    await expect(items.last()).toHaveAttribute('data-rv-reveal-direction', 'up')

    const resetState = await resetPackageGroupAboveViewport(page, name)
    expect(resetState.sawReset).toBe(true)
    expect(resetState.durations.every((duration) => /^0s(?:, 0s)*$/.test(duration))).toBe(true)
    await expect(group).toHaveAttribute('data-rv-state', 'armed')
    await expect(group.locator('.rv-item.rv-in')).toHaveCount(0)

    await scrollPackageGroupIntoView(page, name, 'up')
    await expect(items.first()).toHaveClass(/rv-in/)
    await expect(group).not.toHaveClass(/rv-reset/)
    expect(await group.evaluate((element) => getComputedStyle(element).getPropertyValue('--rv-dir').trim())).toBe('-24px')
    expect(await items.first().evaluate((element) => {
      const translate = getComputedStyle(element).translate
      if (translate === 'none') return 0
      const parts = translate.split(/\s+/)
      return Number.parseFloat(parts[1] ?? parts[0])
    })).toBeLessThan(0)

    // A second full cycle proves this is a re-armed group, not a one-off replay.
    const secondBox = await packageGroupDocumentBox(page, name)
    await page.evaluate(
      (scrollY) => window.scrollTo(0, Math.max(0, scrollY)),
      secondBox.top - secondBox.viewportHeight * 1.25,
    )
    await waitForTwoFrames(page)
    await expect(group).toHaveAttribute('data-rv-state', 'armed')
    await scrollPackageGroupIntoView(page, name, 'down')
    await expect(items.last()).toHaveClass(/rv-in/)
    expect(await group.evaluate((element) => getComputedStyle(element).getPropertyValue('--rv-dir').trim())).toBe('24px')
  })

  test('shows groups already in view immediately when the page reloads mid-section', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.addInitScript(() => {
      ;(window as Window & { __round4RevealTransitions?: string[] }).__round4RevealTransitions = []
      const recordRevealMotion = (event: Event) => {
        const target = event.target
        if (!(target instanceof HTMLElement) || !target.classList.contains('rv-item')) return
        const group = target.closest<HTMLElement>('[data-rv-group]')?.dataset.rvGroup
        if (group) (window as Window & { __round4RevealTransitions?: string[] }).__round4RevealTransitions?.push(group)
      }
      document.addEventListener('transitionrun', recordRevealMotion, true)
      document.addEventListener('animationstart', recordRevealMotion, true)
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIntroToFinish(page)

    const process = page.locator('[data-rv-group="process"]')
    await process.scrollIntoViewIfNeeded()
    await waitForTwoFrames(page)
    const scrollBeforeReload = await page.evaluate(() => window.scrollY)
    expect(scrollBeforeReload).toBeGreaterThan(1_000)

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(process).toBeAttached()
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1_000)
    await page.waitForTimeout(550)

    const state = await page.locator('#packages').evaluate((root) => {
      const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-rv-group]'))
        .filter((group) => {
          const rect = group.getBoundingClientRect()
          return rect.top < window.innerHeight && rect.bottom > 0
        })
      return {
        groups: groups.map((group) => group.dataset.rvGroup),
        immediatelyVisible: groups.every((group) => {
          const items = [
            ...(group.classList.contains('rv-item') ? [group] : []),
            ...Array.from(group.querySelectorAll<HTMLElement>('.rv-item')),
          ].filter((item) => item.closest('[data-rv-group]') === group)
          return items.every((item) => (
            item.classList.contains('rv-in')
            && Number.parseFloat(getComputedStyle(item).opacity) > 0.99
            && ['none', '0px', '0px 0px'].includes(getComputedStyle(item).translate)
          ))
        }),
        transitions: (window as Window & { __round4RevealTransitions?: string[] }).__round4RevealTransitions ?? [],
      }
    })
    expect(state.groups.length).toBeGreaterThan(0)
    expect(state.groups).toContain('process')
    expect(state.immediatelyVisible).toBe(true)
    expect(state.transitions.filter((name) => state.groups.includes(name))).toEqual([])
  })

  test('re-arms a hidden tablet card after the packages section fully exits', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 900, height: 800 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })
    await waitForIntroToFinish(page)
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })

    const packages = page.locator('#packages')
    const selector = page.getByTestId('package-tier-selector')
    const system = page.locator('[data-rv-group="card-system"]')
    await expect(system).toBeVisible()
    await expect(system.locator('.rv-item').last()).toHaveClass(/rv-in/)

    await selector.getByRole('button', { name: /start/i }).click()
    await expect(system).toBeHidden()

    const sectionBox = await packages.evaluate((element) => ({
      bottom: element.offsetTop + element.offsetHeight,
      viewportHeight: window.innerHeight,
    }))
    await page.evaluate(
      ({ bottom, viewportHeight }) => window.scrollTo(0, bottom + viewportHeight * 0.2),
      sectionBox,
    )
    await expect(system).toHaveAttribute('data-rv-state', 'armed')
    await expect(system.locator('.rv-item.rv-in')).toHaveCount(0)

    await packages.scrollIntoViewIfNeeded()
    await selector.getByRole('button', { name: /system/i }).click()
    await expect(system).toBeVisible()
    await expect(system.locator('.rv-item').first()).toHaveClass(/rv-in/)
    await expect(system).toHaveAttribute('data-rv-state', /running|complete/)
  })

  test('does not flicker while crossing one entry boundary five times', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIntroToFinish(page)
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })

    const group = page.locator('[data-rv-group="process"]')
    const box = await packageGroupDocumentBox(page, 'process')
    const outsideY = box.top - box.viewportHeight * 0.886
    const insideY = box.top - box.viewportHeight * 0.876
    await page.evaluate((scrollY) => window.scrollTo(0, Math.max(0, scrollY)), outsideY)
    await waitForTwoFrames(page)
    await expect(group).toHaveAttribute('data-rv-state', 'armed')

    const revealedCounts: number[] = []
    for (let cycle = 0; cycle < 5; cycle += 1) {
      await page.evaluate((scrollY) => window.scrollTo(0, Math.max(0, scrollY)), insideY)
      await waitForTwoFrames(page)
      revealedCounts.push(await group.locator('.rv-item.rv-in').count())
      await expect(group).not.toHaveClass(/rv-reset/)

      await page.evaluate((scrollY) => window.scrollTo(0, Math.max(0, scrollY)), outsideY)
      await waitForTwoFrames(page)
      revealedCounts.push(await group.locator('.rv-item.rv-in').count())
      await expect(group).not.toHaveClass(/rv-reset/)
    }

    expect(revealedCounts.some((count) => count > 0)).toBe(true)
    expect(revealedCounts.every((count, index) => index === 0 || count >= revealedCounts[index - 1])).toBe(true)
    await expect(group.locator('.rv-item').last()).toHaveClass(/rv-in/)
    await expect(group).toHaveAttribute('data-rv-state', 'complete')
    await expect(group).toHaveAttribute('data-rv-direction', 'down')
  })

  test('uses a short opacity-only fallback for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/#packages', { waitUntil: 'domcontentloaded' })

    const groups = page.locator('#packages [data-rv-group]')
    expect(await groups.count()).toBe(8)
    let sawOpacityFade = false
    for (const group of await groups.all()) {
      await group.scrollIntoViewIfNeeded()
      await expect.poll(() => group.evaluate((root) => {
        const items = [
          ...(root.classList.contains('rv-item') ? [root as HTMLElement] : []),
          ...Array.from(root.querySelectorAll<HTMLElement>('.rv-item')),
        ].filter((item) => item.closest('[data-rv-group]') === root)
        return items.length > 0 && items.every((item) => item.classList.contains('rv-in'))
      })).toBe(true)
      const motion = await group.evaluate((root) => {
        const items = [
          ...(root.classList.contains('rv-item') ? [root as HTMLElement] : []),
          ...Array.from(root.querySelectorAll<HTMLElement>('.rv-item')),
        ].filter((item) => item.closest('[data-rv-group]') === root)
        return items.map((item) => {
          const style = getComputedStyle(item)
          return {
            animationDuration: style.animationDuration.split(',').map((value) => Number.parseFloat(value) * (value.includes('ms') ? 1 : 1000)),
            animationName: style.animationName,
            translate: style.translate,
          }
        })
      })
      expect(motion.every(({ translate }) => ['none', '0px', '0px 0px'].includes(translate))).toBe(true)
      expect(motion.every(({ animationName }) => animationName === 'none' || animationName.split(', ').every((name) => name === 'packageRvFade'))).toBe(true)
      expect(motion.every(({ animationDuration }) => animationDuration.every((value) => value <= 150))).toBe(true)
      sawOpacityFade ||= motion.some(({ animationName }) => animationName.includes('packageRvFade'))
    }
    expect(sawOpacityFade).toBe(true)
  })
})

test.describe('Homepage grouped package reveal on touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('uses 16px travel, keeps local stagger indices and does not replay on tap', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIntroToFinish(page)

    const name = 'card-system'
    const group = page.locator(`[data-rv-group="${name}"]`)
    const box = await packageGroupDocumentBox(page, name)
    await page.evaluate(
      (scrollY) => window.scrollTo(0, Math.max(0, scrollY)),
      box.top - box.viewportHeight * 1.2,
    )
    await waitForTwoFrames(page)
    await scrollPackageGroupIntoView(page, name, 'down')
    await expect(group.locator('.rv-item').last()).toHaveClass(/rv-in/)
    expect(await group.evaluate((element) => getComputedStyle(element).getPropertyValue('--rv-dir').trim())).toBe('16px')

    const indices = await group.evaluate((root) => {
      const items = [
        ...(root.classList.contains('rv-item') ? [root as HTMLElement] : []),
        ...Array.from(root.querySelectorAll<HTMLElement>('.rv-item')),
      ].filter((item) => item.closest('[data-rv-group]') === root)
      return items.map((item) => ({
        index: Number.parseInt(item.style.getPropertyValue('--rv-i'), 10),
        order: Number.parseInt(item.dataset.rvOrder ?? '', 10),
      }))
    })
    expect(indices.every(({ index, order }) => index === Math.min(order, 7))).toBe(true)

    const before = await group.evaluate((element) => ({
      direction: getComputedStyle(element).getPropertyValue('--rv-dir').trim(),
      revealed: (element.matches('.rv-item.rv-in') ? 1 : 0) + element.querySelectorAll('.rv-item.rv-in').length,
    }))
    await group.locator('.package-metric').first().tap()
    await waitForTwoFrames(page)
    const after = await group.evaluate((element) => ({
      direction: getComputedStyle(element).getPropertyValue('--rv-dir').trim(),
      revealed: (element.matches('.rv-item.rv-in') ? 1 : 0) + element.querySelectorAll('.rv-item.rv-in').length,
    }))
    expect(after).toEqual(before)
  })
})

test.describe('Threads-style Red Flags reveal direction', () => {
  test('keeps the thread layout and reverses its reveal rhythm when entered from below', async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIntroToFinish(page)

    const stage = page.getByTestId('red-flags-stage')
    await expect(stage.getByTestId('red-flags-feed')).toHaveCount(1)
    await expect(stage.locator('.thread-line')).toHaveCount(1)

    // Arm the scene well above the viewport first, then enter while scrolling
    // downward. This avoids an observer/startup race under a fully parallel run.
    await page.evaluate((testId) => {
      const section = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
      if (!section) return
      window.scrollTo(0, Math.max(0, section.offsetTop - window.innerHeight * 1.25))
    }, 'red-flags-stage')
    await waitForTwoFrames(page)
    await page.evaluate((testId) => {
      const section = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
      if (!section) return
      window.scrollTo(0, section.offsetTop - window.innerHeight * 0.28)
    }, 'red-flags-stage')
    await expect(stage).toHaveAttribute('data-reveal-direction', 'down', { timeout: 10_000 })
    const down = await sceneSnapshot(stage)
    const downRoot = down.steps.find((step) => step.testId === 'red-flags-root-post')
    const downReplies = down.steps.filter((step) => step.testId === 'red-flag-reply')
    expect(downRoot).toBeDefined()
    expect(downReplies.length).toBeGreaterThan(2)
    expect(downRoot!.order).toBeLessThan(downReplies.at(-1)!.order)

    await page.evaluate((testId) => {
      const section = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
      if (!section) return
      window.scrollTo(0, section.offsetTop + section.offsetHeight + window.innerHeight)
    }, 'red-flags-stage')
    await waitForTwoFrames(page)
    await expect(stage).not.toHaveAttribute('data-reveal-played', 'true')

    await page.evaluate((testId) => {
      const section = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
      if (!section) return
      window.scrollTo(0, section.offsetTop + section.offsetHeight - window.innerHeight * 0.18)
    }, 'red-flags-stage')
    await expect(stage).toHaveAttribute('data-reveal-direction', 'up')
    const up = await sceneSnapshot(stage)
    const upRoot = up.steps.find((step) => step.testId === 'red-flags-root-post')
    const upReplies = up.steps.filter((step) => step.testId === 'red-flag-reply')
    expect(upRoot).toBeDefined()
    expect(upRoot!.order).toBeGreaterThan(upReplies.at(-1)!.order)
  })
})
