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

    const revealElement = (el: Element) => {
      el.classList.add('is-visible')
      ;(el as HTMLElement).dataset.revealed = 'true'
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

    const observePending = () => {
      if (!io) return
      document
        .querySelectorAll('[data-reveal]:not([data-revealed])')
        .forEach((el) => io!.observe(el))
    }

    whenIntroGone(() => {
      if (cancelled) return
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
    })

    return () => {
      cancelled = true
      io?.disconnect()
      mutationObserver?.disconnect()
    }
  }, [])
}
