import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { BookingCtaContent } from './BookingCtaContent'
import { BookingModal } from './BookingModal'
import { BrandFooter } from './BrandFooter'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { localizedPath, type BrandLang } from '../brandContent'
import { getLocalizedSiteSettings } from '../cms/siteSettings'
import type { CmsSiteSettings } from '../cms/types'

type BrandLayoutProps = {
  children: ReactNode
  /**
   * A single decorative atmosphere shared by main and footer. Passing the
   * layer here keeps fixed negative-z canvases inside one stacking context;
   * older pages may continue rendering their background inside `children`.
   */
  atmosphereLayer?: ReactNode
  lang?: BrandLang
  siteSettings?: CmsSiteSettings | null
  hideHeaderCta?: boolean
  flushTop?: boolean
  transparentBackground?: boolean
  chromeTone?: 'auto' | 'dark'
  mobileHeaderTitle?: string
  floatingCtaRevealSelector?: string
  resolveNavHref?: (href: string, label: string) => string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function lockBodyScroll() {
  const body = document.body
  const currentLocks = Number(body.dataset.gg99ScrollLocks ?? '0')

  if (currentLocks === 0) {
    body.dataset.gg99PreviousOverflow = body.style.overflow
  }

  body.dataset.gg99ScrollLocks = String(currentLocks + 1)
  body.style.overflow = 'hidden'

  return () => {
    const remainingLocks = Math.max(0, Number(body.dataset.gg99ScrollLocks ?? '1') - 1)
    if (remainingLocks > 0) {
      body.dataset.gg99ScrollLocks = String(remainingLocks)
      return
    }

    body.style.overflow = body.dataset.gg99PreviousOverflow ?? ''
    delete body.dataset.gg99ScrollLocks
    delete body.dataset.gg99PreviousOverflow
  }
}

export function BrandLayout({
  children,
  atmosphereLayer,
  lang = 'en',
  siteSettings,
  hideHeaderCta = false,
  flushTop = false,
  transparentBackground = false,
  chromeTone = 'auto',
  mobileHeaderTitle,
  floatingCtaRevealSelector,
  resolveNavHref,
}: BrandLayoutProps) {
  // Round 12 A2: one reveal system for every page that renders this layout —
  // the footer carries data-reveal, so the hook must live here, not per-view.
  useScrollReveal()
  const [bookingOpen, setBookingOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [showFloatingCta, setShowFloatingCta] = useState(!floatingCtaRevealSelector)
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerOnHero, setHeaderOnHero] = useState(true)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLElement>(null)
  const restoreMenuFocusRef = useRef(true)
  const contentLang: BrandLang = lang === 'en' ? lang : 'en'
  const localizedSettings = getLocalizedSiteSettings(siteSettings, contentLang)
  const header = localizedSettings.header
  const navItems = header.navLinks.filter((item) => item.visible !== false && item.label.trim() && item.href.trim())
  const homeHref = localizedPath(contentLang, '/')
  const showHeaderCopy = Boolean(header.brandName.trim() || header.tagline.trim())
  const showHeaderCta = !hideHeaderCta
  const hasContinuousAtmosphere = Boolean(atmosphereLayer)

  function getNavHref(href: string, label: string) {
    const resolved = resolveNavHref?.(href, label) ?? href
    return localizedPath(contentLang, resolved)
  }

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!floatingCtaRevealSelector) {
      setShowFloatingCta(true)
      return
    }

    const sync = () => {
      const marker = document.querySelector(floatingCtaRevealSelector)
      const closingBand = document.querySelector('.closing-portal-section')
      const closingRect = closingBand?.getBoundingClientRect()
      const closingVisible = closingRect ? closingRect.top < window.innerHeight * 0.82 && closingRect.bottom > window.innerHeight * 0.12 : false
      if (!marker) {
        setShowFloatingCta(window.scrollY > 420 && !closingVisible)
        return
      }
      const markerBottom = marker.getBoundingClientRect().bottom + window.scrollY
      setShowFloatingCta(window.scrollY > markerBottom - 4 && !closingVisible)
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [floatingCtaRevealSelector])

  useEffect(() => {
    const sync = () => setHeaderOnHero(window.scrollY < 220)
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      if (media.matches) {
        restoreMenuFocusRef.current = false
        setMenuOpen(false)
      }
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const openBooking = () => setBookingOpen(true)
    window.addEventListener('gg99:open-booking', openBooking)
    return () => window.removeEventListener('gg99:open-booking', openBooking)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    restoreMenuFocusRef.current = true
    const unlockBodyScroll = lockBodyScroll()
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusFirstMenuControl = () => {
      const firstMenuControl = mobileMenuRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      ;(firstMenuControl ?? menuButtonRef.current)?.focus()
    }
    focusFirstMenuControl()
    const focusMenu = window.requestAnimationFrame(focusFirstMenuControl)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
        return
      }

      if (event.key !== 'Tab') return
      const menuControls = mobileMenuRef.current
        ? Array.from(mobileMenuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : []
      const controls = [menuButtonRef.current, ...menuControls].filter(
        (control): control is HTMLElement => Boolean(control && control.getClientRects().length),
      )

      if (controls.length === 0) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !controls.includes(active as HTMLElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !controls.includes(active as HTMLElement))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(focusMenu)
      document.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
      if (restoreMenuFocusRef.current) {
        const focusTarget = previouslyFocused?.isConnected ? previouslyFocused : menuButtonRef.current
        focusTarget?.focus()
        window.requestAnimationFrame(() => {
          focusTarget?.focus()
        })
      }
    }
  }, [menuOpen])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-white focus:px-5 focus:py-2 focus:text-sm focus:font-extrabold focus:text-primary focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} lang="en" copy={localizedSettings.booking} />

      {showHeaderCta && (
        <button
          onClick={() => setBookingOpen(true)}
          className={`header-floating-cta booking-cta-enhanced btn-shine cta-idle z-[60] hidden rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(219,39,119,0.28)] transition hover:opacity-95 glow-orange lg:inline-flex ${showFloatingCta ? 'is-visible' : 'is-hidden'}`}
        >
          <BookingCtaContent />
        </button>
      )}

      <header className={`fixed inset-x-0 top-4 z-50 px-3 sm:px-5 lg:absolute ${headerOnHero ? 'is-on-hero' : 'is-off-hero'} ${chromeTone === 'dark' ? 'is-dark-page' : ''}`}>
        <nav className="site-nav-pill relative mx-auto flex h-16 max-w-[1200px] items-center gap-6 rounded-full border px-4 shadow-[0_18px_48px_rgba(219,39,119,0.12)] backdrop-blur-xl transition-[background,border-color,box-shadow,color] duration-300 sm:px-6 lg:px-8">
          <a href={homeHref} className="flex min-w-0 items-center gap-2.5">
            {header.logoSrc && <img src={header.logoSrc === '/logo-gg.png' ? '/avatars/logo-gg.png' : header.logoSrc} alt={header.logoAlt || header.brandName} className="h-12 w-auto shrink-0" />}
            {showHeaderCopy && (
              <div className={`${mobileHeaderTitle ? 'hidden md:block' : 'hidden sm:block'} min-w-0`}>
                {header.brandName && <div className="truncate text-base font-extrabold leading-tight text-primary">{header.brandName}</div>}
                {header.tagline && (
                  <div className="truncate text-[10px] uppercase tracking-wider text-on-surface-variant opacity-70">
                    {header.tagline}
                  </div>
                )}
              </div>
            )}
          </a>
          {mobileHeaderTitle && (
            <div className="pointer-events-none absolute left-1/2 max-w-[calc(100vw-156px)] -translate-x-1/2 md:hidden">
              <div className="ig-script-title truncate text-center text-[clamp(26px,8vw,30px)] leading-none text-primary">{mobileHeaderTitle}</div>
            </div>
          )}

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={getNavHref(item.href, item.label)}
                className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/45 bg-white text-on-surface shadow-sm transition-colors hover:border-primary hover:text-primary lg:hidden"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
        <nav
          ref={mobileMenuRef}
          id="mobile-navigation"
          aria-label="Primary navigation"
          className="mx-auto mt-2 max-w-[1200px] overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_22px_60px_rgba(219,39,119,0.16)] backdrop-blur-xl transition-all duration-300 lg:hidden"
        >
          <div className="grid gap-1 p-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={getNavHref(item.href, item.label)}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            {showHeaderCta && (
              <button
                type="button"
                onClick={() => {
                  menuButtonRef.current?.focus()
                  restoreMenuFocusRef.current = false
                  setMenuOpen(false)
                  setBookingOpen(true)
                }}
                className="booking-cta-enhanced btn-shine cta-idle mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(219,39,119,0.24)] glow-orange"
              >
                <BookingCtaContent />
              </button>
            )}
          </div>
        </nav>
        )}
      </header>

      {hasContinuousAtmosphere ? (
        <div className="brand-atmosphere-shell flow-wave-host" data-continuous-atmosphere="true">
          <div className="brand-atmosphere-layer" aria-hidden="true">
            {atmosphereLayer}
          </div>
          <main
            id="main-content"
            tabIndex={-1}
            className={`${flushTop ? '' : 'pt-24 '}${transparentBackground ? 'flow-wave-main' : 'mesh'} focus:outline-none`}
          >
            {children}
          </main>
          <BrandFooter lang={contentLang} siteSettings={siteSettings} continuousAtmosphere />
        </div>
      ) : (
        <>
          <main id="main-content" tabIndex={-1} className={`${flushTop ? '' : 'pt-24 '}${transparentBackground ? 'flow-wave-host' : 'mesh'} focus:outline-none`}>{children}</main>
          <BrandFooter lang={contentLang} siteSettings={siteSettings} />
        </>
      )}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
        aria-label="Back to top"
        className={[
          'fixed bottom-6 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-all duration-300 gg-btn-primary',
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        ].join(' ')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  )
}
