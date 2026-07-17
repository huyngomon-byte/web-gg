'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { getHomepageVideoDeliveryWidth, retargetCloudinaryVideoWidth } from '../lib/cloudinaryVideo'

export type HeroVideoSources = {
  mp4?: string
  webm?: string
  mobileMp4?: string
  mobileWebm?: string
  poster?: string
  mobilePoster?: string
  posterSrcSet?: string
  mobilePosterSrcSet?: string
}

type ActiveSources = {
  mp4?: string
  webm?: string
}

function prefersStaticHero() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return true
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}

function HeroPosterPicture({
  sources,
  imageClassName,
}: {
  sources: HeroVideoSources
  imageClassName: string
}) {
  if (!sources.poster && !sources.mobilePoster) return null

  return (
    <picture>
      {sources.mobilePoster && (
        <source
          media="(max-width: 767px)"
          srcSet={sources.mobilePosterSrcSet || sources.mobilePoster}
          sizes="100vw"
        />
      )}
      <img
        src={sources.poster || sources.mobilePoster}
        srcSet={sources.posterSrcSet}
        sizes="100vw"
        alt=""
        className={imageClassName}
      />
    </picture>
  )
}

/**
 * A static, flipped continuation of the hero poster for the first content
 * zone. It deliberately reuses the poster rather than mounting a second
 * video, and therefore remains safe for reduced motion, Data Saver and weak
 * devices. Position and height belong to the consuming transition zone.
 */
export function HeroPosterReflection({
  sources,
  className = '',
  style,
}: {
  sources: HeroVideoSources
  className?: string
  style?: CSSProperties
}) {
  if (!sources.poster && !sources.mobilePoster) return null

  return (
    <div
      aria-hidden="true"
      className={`hero-poster-reflection pointer-events-none relative overflow-hidden ${className}`.trim()}
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.58), rgba(0,0,0,0.2) 48%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.58), rgba(0,0,0,0.2) 48%, transparent 100%)',
        ...style,
      }}
    >
      <HeroPosterPicture
        sources={sources}
        imageClassName="hero-poster-reflection__image absolute inset-0 h-full w-full scale-y-[-1] object-cover object-[center_82%] opacity-30 blur-[2px] saturate-[.75]"
      />
      <span className="hero-poster-reflection__veil absolute inset-0 bg-gradient-to-b from-[#5a2c47]/15 via-[#301225]/50 to-transparent" />
    </div>
  )
}

// Spec section 5: video lives only inside the hero frame, object-fit cover,
// bottom 80px fades into the aurora background, scrim over the headline area.
export function HeroBackgroundVideo({ sources }: { sources: HeroVideoSources }) {
  const cleanupRef = useRef<(() => void) | null>(null)
  const [active, setActive] = useState<ActiveSources | null>(null)
  const [activePoster, setActivePoster] = useState(sources.poster)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const deliveryWidth = getHomepageVideoDeliveryWidth(window.innerWidth, window.devicePixelRatio, mobile)
    setActivePoster((mobile ? sources.mobilePoster : sources.poster) || sources.poster || sources.mobilePoster)
    if (prefersStaticHero()) return
    const selected = mobile
      ? { mp4: sources.mobileMp4 || sources.mp4, webm: sources.mobileWebm || sources.webm }
      : { mp4: sources.mp4, webm: sources.webm }
    setActive({
      mp4: retargetCloudinaryVideoWidth(selected.mp4, deliveryWidth),
      webm: retargetCloudinaryVideoWidth(selected.webm, deliveryWidth),
    })
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
        WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - clamp(140px, 16svh, 220px)), transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black calc(100% - clamp(140px, 16svh, 220px)), transparent 100%)',
      }}
    >
      {(sources.poster || sources.mobilePoster) && (
        // Poster paints immediately (SSR) and is the permanent fallback for
        // reduced-motion / Data Saver, where the <video> never mounts.
        <HeroPosterPicture
          sources={sources}
          imageClassName="absolute inset-0 h-full w-full object-cover [object-position:center_65%]"
        />
      )}
      {active && (
        <video
          ref={attachVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={activePoster || undefined}
          className="absolute inset-0 h-full w-full object-cover [object-position:center_65%]"
        >
          {active.webm && <source src={active.webm} type="video/webm" />}
          {active.mp4 && <source src={active.mp4} type="video/mp4" />}
        </video>
      )}
    </div>
  )
}
