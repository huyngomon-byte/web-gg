import { useEffect } from 'react'
import { whenIntroGone } from './useIntroGate'

/**
 * Scroll reveal bằng IntersectionObserver (nhẹ, không re-render React).
 * Gắn `data-reveal` (hoặc data-reveal="left|right|scale") + class `reveal`
 * lên element muốn animate. Stagger bằng inline style transitionDelay.
 *
 * - Chỉ dùng transform/opacity (GPU), mượt trên mobile.
 * - Tôn trọng prefers-reduced-motion (hiện ngay, không animate).
 * - Bắt đầu quan sát sau khi intro biến mất (qua whenIntroGone).
 */
export function useScrollReveal() {
  useEffect(() => {
    const reduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Round 12 A2: elements in the opening cascade carry data-reveal-open plus an
    // inline --rd delay tuned to follow the hero sequence. That delay only makes
    // sense right after the intro while the user is at the top of the page —
    // otherwise (reload mid-page, scrolling back up later) strip it so the
    // element reveals with the normal stagger.
    let openingStartedAt = 0
    const revealElement = (el: Element) => {
      const html = el as HTMLElement
      if (html.dataset.revealOpen !== undefined) {
        const inOpeningWindow =
          openingStartedAt > 0 && performance.now() - openingStartedAt < 2500 && window.scrollY < 200
        if (!inOpeningWindow) html.style.setProperty('--rd', '0ms')
      }
      el.classList.add('is-visible')
      html.dataset.revealed = 'true'
    }

    const revealAll = () =>
      document
        .querySelectorAll('[data-reveal]')
        .forEach(revealElement)

    if (reduced || !('IntersectionObserver' in window)) {
      revealAll()
      return
    }

    let cancelled = false
    let io: IntersectionObserver | null = null
    let mutationObserver: MutationObserver | null = null
    let rescueTimer = 0

    const observePending = () => {
      if (!io) return
      document
        .querySelectorAll('[data-reveal]:not([data-revealed])')
        .forEach((el) => io!.observe(el))
    }

    whenIntroGone(() => {
      if (cancelled) return
      openingStartedAt = performance.now()
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealElement(entry.target)
              io?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
      )
      observePending()
      mutationObserver = new MutationObserver(observePending)
      mutationObserver.observe(document.body, { childList: true, subtree: true })
      rescueTimer = window.setTimeout(() => {
        if (!cancelled) revealAll()
      }, 4200)
    })

    return () => {
      cancelled = true
      if (rescueTimer) window.clearTimeout(rescueTimer)
      io?.disconnect()
      mutationObserver?.disconnect()
    }
  }, [])
}
