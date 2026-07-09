import { useEffect, useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { BookingModal } from './BookingModal'
import { BrandFooter } from './BrandFooter'
import { localizedPath, type BrandLang } from '../brandContent'
import { getLocalizedSiteSettings } from '../cms/siteSettings'
import type { CmsSiteSettings } from '../cms/types'

type BrandLayoutProps = {
  children: ReactNode
  lang?: BrandLang
  siteSettings?: CmsSiteSettings | null
  hideHeaderCta?: boolean
  flushTop?: boolean
  transparentBackground?: boolean
  mobileHeaderTitle?: string
  floatingCtaRevealSelector?: string
  resolveNavHref?: (href: string, label: string) => string
}

function resolveHeaderCtaLabel(label: string) {
  const trimmed = label.trim()
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return !trimmed || /book a (free )?consultation|dat lich tu van|call your shot/.test(normalized)
    ? 'Schedule Our Date'
    : trimmed
}

export function BrandLayout({
  children,
  lang = 'en',
  siteSettings,
  hideHeaderCta = false,
  flushTop = false,
  transparentBackground = false,
  mobileHeaderTitle,
  floatingCtaRevealSelector,
  resolveNavHref,
}: BrandLayoutProps) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [showFloatingCta, setShowFloatingCta] = useState(!floatingCtaRevealSelector)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const localizedSettings = getLocalizedSiteSettings(siteSettings, lang)
  const header = localizedSettings.header
  const navItems = header.navLinks.filter((item) => item.visible !== false && item.label.trim() && item.href.trim())
  const homeHref = localizedPath(lang, '/')
  const headerCtaLabel = resolveHeaderCtaLabel(header.ctaLabel)
  const showHeaderCopy = Boolean(header.brandName.trim() || header.tagline.trim())
  const showHeaderCta = !hideHeaderCta

  function getNavHref(href: string, label: string) {
    const resolved = resolveNavHref?.(href, label) ?? href
    return localizedPath(lang, resolved)
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
      if (!marker) {
        setShowFloatingCta(window.scrollY > 420)
        return
      }
      setShowFloatingCta(marker.getBoundingClientRect().bottom < 0)
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
    const media = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      setIsDesktop(media.matches)
      if (media.matches) setMenuOpen(false)
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} lang={lang === 'vi' ? 'vi' : 'en'} copy={localizedSettings.booking} />

      {showHeaderCta && (
        <button
          onClick={() => setBookingOpen(true)}
          className={`header-floating-cta btn-shine cta-idle z-[60] hidden rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(219,39,119,0.28)] transition hover:opacity-95 glow-orange lg:inline-flex ${showFloatingCta ? 'is-visible' : 'is-hidden'}`}
        >
          {headerCtaLabel}
        </button>
      )}

      <header className="fixed inset-x-0 top-4 z-50 px-3 sm:px-5 lg:absolute">
        <nav className="relative mx-auto flex h-16 max-w-[1200px] items-center gap-6 rounded-full border border-white/70 bg-white/[0.82] px-4 shadow-[0_18px_48px_rgba(219,39,119,0.12)] backdrop-blur-xl sm:px-6 lg:px-8 lg:pr-48">
          <a href={homeHref} className="flex min-w-0 items-center gap-2.5">
            {header.logoSrc && <img src={header.logoSrc === '/logo-gg.png' ? '/avatars/logo-gg.png' : header.logoSrc} alt={header.logoAlt || header.brandName} className="h-12 w-auto shrink-0" />}
            {showHeaderCopy && (
              <div className="hidden min-w-0 sm:block">
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
            <div className="pointer-events-none absolute left-1/2 max-w-[calc(100vw-156px)] -translate-x-1/2 sm:hidden">
              <div className="ig-script-title truncate text-center text-[clamp(26px,8vw,30px)] leading-none text-primary">{mobileHeaderTitle}</div>
            </div>
          )}

          {isDesktop && (
          <div className="items-center gap-7 lg:flex">
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
          )}

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            {!isDesktop && (
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/45 bg-white text-on-surface shadow-sm transition-colors hover:border-primary hover:text-primary lg:hidden"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            )}
          </div>
        </nav>

        {menuOpen && !isDesktop && (
        <div className="mx-auto mt-2 max-w-[1200px] overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_22px_60px_rgba(219,39,119,0.16)] backdrop-blur-xl transition-all duration-300 lg:hidden">
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
                  setMenuOpen(false)
                  setBookingOpen(true)
                }}
                className="btn-shine cta-idle mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(219,39,119,0.24)] glow-orange"
              >
                {headerCtaLabel}
              </button>
            )}
          </div>
        </div>
        )}
      </header>

      <main className={`${flushTop ? '' : 'pt-24 '}${transparentBackground ? '' : 'mesh'}`}>{children}</main>
      <BrandFooter lang={lang} siteSettings={siteSettings} />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
