import { useEffect } from 'react'
import { whenIntroGone } from './useIntroGate'

type RevealDirection = 'down' | 'up'

const DIRECTION_HYSTERESIS_PX = 10
const ROW_TOLERANCE_PX = 28
const SCENE_REARM_MARGIN = 0.18

function isRendered(element: HTMLElement) {
  return element.getClientRects().length > 0
}

function ownedSceneSteps(scene: HTMLElement) {
  const candidates = [
    ...(scene.matches('[data-reveal]') ? [scene] : []),
    ...Array.from(scene.querySelectorAll<HTMLElement>('[data-reveal]')),
  ]

  return candidates.filter((element) => {
    const owner = element === scene ? scene : element.closest<HTMLElement>('[data-reveal-scene]')
    return owner === scene
  })
}

function sceneSteps(scene: HTMLElement) {
  return ownedSceneSteps(scene).filter(isRendered)
}

function sortSceneSteps(scene: HTMLElement) {
  return sceneSteps(scene)
    .map((element, domIndex) => {
      const rect = element.getBoundingClientRect()
      return {
        element,
        domIndex,
        phase: Number.parseFloat(element.dataset.revealPhase ?? '0') || 0,
        top: rect.top,
        left: rect.left,
      }
    })
    .sort((left, right) => {
      const phaseDelta = left.phase - right.phase
      if (phaseDelta) return phaseDelta

      const topDelta = left.top - right.top
      if (Math.abs(topDelta) > ROW_TOLERANCE_PX) return topDelta

      return left.left - right.left || left.domIndex - right.domIndex
    })
    .map(({ element }) => element)
}

/**
 * Shared scroll reveal engine.
 *
 * - Legacy pages stay one-shot.
 * - Homepage sections marked with `data-reveal-scene` replay after leaving the
 *   viewport, and reverse their visual order/direction when entered from below.
 * - The fallback only reveals elements near the viewport; it never pre-runs the
 *   rest of the page.
 */
export function useScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let openingStartedAt = 0

    const prepareOpeningDelay = (element: HTMLElement) => {
      if (element.dataset.revealOpen === undefined) return
      const inOpeningWindow =
        openingStartedAt > 0
        && performance.now() - openingStartedAt < 2500
        && window.scrollY < 200
      if (!inOpeningWindow) element.style.setProperty('--rd', '0ms')
    }

    const revealLegacy = (element: HTMLElement) => {
      prepareOpeningDelay(element)
      element.dataset.revealDirection = 'down'
      element.classList.add('is-visible')
      element.dataset.revealed = 'true'
    }

    const revealScene = (scene: HTMLElement, direction: RevealDirection) => {
      const ordered = sortSceneSteps(scene)
      const sequence = direction === 'up' ? [...ordered].reverse() : ordered
      const rendered = new Set(ordered)
      const requestedStepMs = Number.parseFloat(scene.dataset.revealStepMs ?? '')
      const stepMs = Number.isFinite(requestedStepMs) && requestedStepMs >= 0
        ? Math.min(500, requestedStepMs)
        : Math.max(42, Math.min(76, Math.floor(820 / Math.max(1, sequence.length))))

      scene.dataset.revealPlayed = 'true'
      scene.dataset.revealDirection = direction
      scene.style.setProperty('--scene-step-ms', `${stepMs}ms`)

      sequence.forEach((element, order) => {
        prepareOpeningDelay(element)
        element.dataset.revealDirection = direction
        element.style.setProperty('--rdi', String(order))
        element.style.setProperty('--reveal-delay', `${order * stepMs}ms`)
        element.style.setProperty('--scene-step-ms', `${stepMs}ms`)
        element.classList.add('is-visible')
        element.dataset.revealed = 'true'
      })

      // Responsive-only items (for example the extra mobile thread replies)
      // must not remain opacity-gated when a later interaction or breakpoint
      // makes them visible. They skip the entrance timeline while hidden, then
      // inherit the scene's completed state.
      ownedSceneSteps(scene).forEach((element) => {
        if (rendered.has(element)) return
        element.dataset.revealDirection = direction
        element.classList.add('is-visible')
        element.dataset.revealed = 'true'
      })
    }

    const resetScene = (scene: HTMLElement) => {
      ownedSceneSteps(scene).forEach((element) => {
        element.classList.remove('is-visible')
        delete element.dataset.revealed
        delete element.dataset.revealDirection
        element.style.removeProperty('--rdi')
        element.style.removeProperty('--reveal-delay')
      })
      delete scene.dataset.revealPlayed
      delete scene.dataset.revealDirection
    }

    const revealPendingSceneSteps = (scene: HTMLElement) => {
      const pending = ownedSceneSteps(scene).filter((element) => element.dataset.revealed === undefined)
      if (!pending.length) return

      const direction = scene.dataset.revealDirection === 'up' ? 'up' : 'down'
      const pendingSet = new Set(pending)
      const ordered = sortSceneSteps(scene).filter((element) => pendingSet.has(element))
      const sequence = direction === 'up' ? [...ordered].reverse() : ordered
      const rendered = new Set(ordered)
      const stepMs = Math.max(42, Math.min(64, Math.floor(360 / Math.max(1, sequence.length))))

      sequence.forEach((element, order) => {
        prepareOpeningDelay(element)
        // Newly mounted carousel content belongs to an entrance that already
        // finished; do not inherit a stale section/opening base delay.
        element.style.setProperty('--rd', '0ms')
        element.dataset.revealDirection = direction
        element.style.setProperty('--rdi', String(order))
        element.style.setProperty('--reveal-delay', `${order * stepMs}ms`)
        element.classList.add('is-visible')
        element.dataset.revealed = 'true'
      })

      pending.forEach((element) => {
        if (rendered.has(element)) return
        element.style.setProperty('--rd', '0ms')
        element.dataset.revealDirection = direction
        element.classList.add('is-visible')
        element.dataset.revealed = 'true'
      })
    }

    const revealEverythingStatically = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
        element.classList.add('is-visible')
        element.dataset.revealed = 'true'
      })
    }

    if (reduced || !('IntersectionObserver' in window)) {
      revealEverythingStatically()
      return
    }

    let cancelled = false
    let legacyObserver: IntersectionObserver | null = null
    let sceneObserver: IntersectionObserver | null = null
    let mutationObserver: MutationObserver | null = null
    let rescueTimer = 0
    let scrollFrame = 0
    let directionAnchorY = window.scrollY
    let scrollDirection: RevealDirection = 'down'

    const observePending = () => {
      if (!legacyObserver || !sceneObserver) return

      document.querySelectorAll<HTMLElement>('[data-reveal-scene]').forEach((scene) => {
        sceneObserver?.observe(scene)
        if (scene.dataset.revealPlayed !== undefined) revealPendingSceneSteps(scene)
      })

      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])').forEach((element) => {
        if (!element.closest('[data-reveal-scene]')) legacyObserver?.observe(element)
      })
    }

    const revealNearViewport = () => {
      const upperBound = -window.innerHeight * 0.15
      const lowerBound = window.innerHeight * 1.15

      document.querySelectorAll<HTMLElement>('[data-reveal-scene]:not([data-reveal-played])').forEach((scene) => {
        const rect = scene.getBoundingClientRect()
        if (rect.bottom >= upperBound && rect.top <= lowerBound) revealScene(scene, scrollDirection)
      })

      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])').forEach((element) => {
        if (element.closest('[data-reveal-scene]')) return
        const rect = element.getBoundingClientRect()
        if (rect.bottom >= upperBound && rect.top <= lowerBound) revealLegacy(element)
      })
    }

    const updateScrollState = () => {
      scrollFrame = 0
      const currentY = window.scrollY
      const delta = currentY - directionAnchorY
      if (Math.abs(delta) >= DIRECTION_HYSTERESIS_PX) {
        scrollDirection = delta > 0 ? 'down' : 'up'
        directionAnchorY = currentY
      }

      const rearmDistance = window.innerHeight * SCENE_REARM_MARGIN
      document.querySelectorAll<HTMLElement>('[data-reveal-scene][data-reveal-played]').forEach((scene) => {
        if (scene.dataset.revealOnce !== undefined) return
        const rect = scene.getBoundingClientRect()
        if (rect.bottom < -rearmDistance || rect.top > window.innerHeight + rearmDistance) resetScene(scene)
      })
    }

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState)
    }

    whenIntroGone(() => {
      if (cancelled) return
      openingStartedAt = performance.now()

      legacyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            revealLegacy(entry.target as HTMLElement)
            legacyObserver?.unobserve(entry.target)
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
      )

      sceneObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const scene = entry.target as HTMLElement
            if (scene.dataset.revealPlayed !== undefined) return
            revealScene(scene, scrollDirection)
          })
        },
        { threshold: 0.04, rootMargin: '-8% 0px -8% 0px' },
      )

      observePending()
      mutationObserver = new MutationObserver(observePending)
      mutationObserver.observe(document.body, { childList: true, subtree: true })
      window.addEventListener('scroll', onScroll, { passive: true })

      // Fail-safe for delayed layout/font loading. Only the current viewport and
      // its immediate margin are eligible, so lower sections keep their entrance.
      rescueTimer = window.setTimeout(() => {
        if (!cancelled) revealNearViewport()
      }, 4200)
    })

    return () => {
      cancelled = true
      if (rescueTimer) window.clearTimeout(rescueTimer)
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
      window.removeEventListener('scroll', onScroll)
      legacyObserver?.disconnect()
      sceneObserver?.disconnect()
      mutationObserver?.disconnect()
    }
  }, [])
}
