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
}

function resolveHeaderCtaLabel(label: string) {
  const trimmed = label.trim()
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return !trimmed || /book a (free )?consultation|dat lich tu van/.test(normalized)
    ? 'Call Your Shot'
    : trimmed
}

export function BrandLayout({ children, lang = 'en', siteSettings, hideHeaderCta = false, flushTop = false }: BrandLayoutProps) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const localizedSettings = getLocalizedSiteSettings(siteSettings, lang)
  const header = localizedSettings.header
  const navItems = header.navLinks.filter((item) => item.label.trim() && item.href.trim())
  const homeHref = localizedPath(lang, '/')
  const headerCtaLabel = resolveHeaderCtaLabel(header.ctaLabel)
  const showHeaderCopy = Boolean(header.brandName.trim() || header.tagline.trim())
  const showHeaderCta = !hideHeaderCta

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} lang={lang === 'vi' ? 'vi' : 'en'} />

      <header className="fixed inset-x-0 top-4 z-50 px-3 sm:px-5">
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 rounded-full border border-white/70 bg-white/[0.82] px-4 shadow-[0_18px_48px_rgba(219,39,119,0.12)] backdrop-blur-xl sm:px-6 lg:px-8">
          <a href={homeHref} className="flex min-w-0 items-center gap-2.5">
            {header.logoSrc && <img src={header.logoSrc} alt={header.logoAlt || header.brandName} className="h-12 w-auto shrink-0" />}
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

          {isDesktop && (
          <div className="items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={localizedPath(lang, item.href)}
                className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {showHeaderCta && (
              <button
                onClick={() => setBookingOpen(true)}
                className="btn-shine hidden rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary gg-btn-primary glow-orange hover:opacity-90 lg:inline-flex"
              >
                {headerCtaLabel}
              </button>
            )}
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
                href={localizedPath(lang, item.href)}
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
                className="btn-shine mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary gg-btn-primary glow-orange"
              >
                {headerCtaLabel}
              </button>
            )}
          </div>
        </div>
        )}
      </header>

      <main className={flushTop ? 'mesh' : 'pt-24 mesh'}>{children}</main>
      <BrandFooter lang={lang} siteSettings={siteSettings} />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={lang === 'vi' ? 'Len dau trang' : 'Back to top'}
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
