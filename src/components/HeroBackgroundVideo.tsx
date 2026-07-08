'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type HeroVideoSources = {
  mp4?: string
  webm?: string
  mobileMp4?: string
  mobileWebm?: string
  poster?: string
}

type ActiveSources = {
  mp4?: string
  webm?: string
}

function prefersStaticHero() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}

// Spec section 5: video lives only inside the hero frame, object-fit cover,
// bottom 80px fades into the aurora background, scrim over the headline area.
export function HeroBackgroundVideo({ sources }: { sources: HeroVideoSources }) {
  const cleanupRef = useRef<(() => void) | null>(null)
  const [active, setActive] = useState<ActiveSources | null>(null)

  useEffect(() => {
    if (prefersStaticHero()) return
    const mobile = window.matchMedia('(max-width: 767px)').matches
    setActive(
      mobile
        ? { mp4: sources.mobileMp4 || sources.mp4, webm: sources.mobileWebm || sources.webm }
        : { mp4: sources.mp4, webm: sources.webm },
    )
    // Source choice is made once on mount; CMS URL changes arrive via full page render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Callback ref: the <video> renders conditionally, so attach the pause-offscreen
  // observer exactly when the element enters the DOM (an effect keyed on state can
  // miss the attachment and leave the video without resume-on-return).
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    cleanupRef.current?.()
    cleanupRef.current = null
    if (!video) return
    let inView = true
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1]
      // Ignore the zero-sized entry the observer can fire while the hero is still laying out;
      // pausing on it would strand the video paused before it ever became visible.
      if (!entry.isIntersecting && entry.boundingClientRect.height === 0) return
      inView = entry.isIntersecting
      if (entry.isIntersecting) void video.play().catch(() => undefined)
      else video.pause()
    })
    observer.observe(video)
    // Browsers (Energy Saver, tab switches) can pause the video on their own;
    // resume when the tab becomes visible again while the hero is on screen.
    const onVisible = () => {
      if (!document.hidden && inView && video.paused) void video.play().catch(() => undefined)
    }
    document.addEventListener('visibilitychange', onVisible)
    cleanupRef.current = () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  useEffect(() => () => cleanupRef.current?.(), [])

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 80px), transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black calc(100% - 80px), transparent 100%)',
      }}
    >
      {sources.poster && (
        // Poster paints immediately (SSR) and is the permanent fallback for
        // reduced-motion / Data Saver, where the <video> never mounts.
        <img src={sources.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {active && (
        <video
          ref={attachVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={sources.poster || undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {active.webm && <source src={active.webm} type="video/webm" />}
          {active.mp4 && <source src={active.mp4} type="video/mp4" />}
        </video>
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(rgba(40,10,25,.25), transparent 50%)' }} />
    </div>
  )
}
