/**
 * Coordinates page animations with the intro loader.
 *
 * IntroLoader renders from a layout effect, so callers may run before
 * `.intro-loader` exists in the DOM. This hook gives the loader a short mount
 * window before deciding there is no intro; otherwise hero animations can run
 * behind the logo overlay and appear already finished when the homepage is
 * revealed.
 */
let resolved = false
const queue: Array<() => void> = []
let watching = false

const introMountGraceMs = 320
const introFallbackMs = 9000

function flush() {
  resolved = true
  const pending = queue.splice(0)
  pending.forEach((fn) => fn())
}

export function whenIntroGone(cb: () => void) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    cb()
    return
  }
  if (resolved) {
    cb()
    return
  }

  queue.push(cb)

  const reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    flush()
    return
  }

  if (watching) return
  watching = true

  let hasSeenIntro = Boolean(document.querySelector('.intro-loader'))

  const mo = new MutationObserver(() => {
    const intro = document.querySelector('.intro-loader')
    if (intro) {
      hasSeenIntro = true
      return
    }
    if (hasSeenIntro) {
      mo.disconnect()
      flush()
    }
  })
  mo.observe(document.body, { childList: true, subtree: true })

  window.setTimeout(() => {
    if (!resolved && !hasSeenIntro && !document.querySelector('.intro-loader')) {
      mo.disconnect()
      flush()
    }
  }, introMountGraceMs)

  window.setTimeout(() => {
    if (!resolved) {
      mo.disconnect()
      flush()
    }
  }, introFallbackMs)
}
