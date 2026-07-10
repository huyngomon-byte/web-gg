'use client'

import type { CSSProperties } from 'react'
import { AtSign, Facebook, Instagram, MapPin, Music2 } from 'lucide-react'
import { localizedPath, type BrandLang } from '../brandContent'
import { getLocalizedSiteSettings } from '../cms/siteSettings'
import type { CmsSiteSettings } from '../cms/types'
import { ChatIcon } from './ChatIcon'
import { openBookingModal } from './openBookingModal'

function isContactHref(href: string) {
  const normalized = href.trim().toLowerCase()
  return normalized === '#contact' || normalized === '/contact' || normalized.endsWith('/contact')
}

function normalizeSocialHref(href: string | undefined) {
  const trimmed = href?.trim() ?? ''
  return /^ttps:\/\//i.test(trimmed) ? `h${trimmed}` : trimmed
}

export function BrandFooter({ lang = 'en', siteSettings }: { lang?: BrandLang; siteSettings?: CmsSiteSettings | null }) {
  const contentLang: BrandLang = lang === 'en' ? lang : 'en'
  const footer = getLocalizedSiteSettings(siteSettings, contentLang).footer
  const solutionLinks = footer.solutionLinks.filter((item) => item.visible !== false && item.label.trim() && item.href.trim())
  const navLinks = footer.navigationLinks.filter((item) => item.visible !== false && item.label.trim() && item.href.trim())
  const hasLegalLinks =
    Boolean(footer.privacyLabel.trim() && footer.privacyHref.trim()) ||
    Boolean(footer.termsLabel.trim() && footer.termsHref.trim())
  const linkClass = 'inline-flex min-h-11 items-center text-sm text-on-surface/75 hover:text-primary transition-colors'

  function renderFooterLink(item: { href: string; label: string }) {
    if (isContactHref(item.href)) {
      return (
        <button type="button" onClick={openBookingModal} className={`${linkClass} text-left`}>
          {item.label}
        </button>
      )
    }

    return (
      <a href={localizedPath(contentLang, item.href)} className={linkClass}>
        {item.label}
      </a>
    )
  }

  const socials = footer.socials ?? {}
  const socialLinks = [
    { key: 'facebook', href: normalizeSocialHref(socials.facebook), label: 'Facebook', icon: <Facebook size={16} /> },
    { key: 'instagram', href: normalizeSocialHref(socials.instagram), label: 'Instagram', icon: <Instagram size={16} /> },
    { key: 'tiktok', href: normalizeSocialHref(socials.tiktok), label: 'TikTok', icon: <Music2 size={16} /> },
    { key: 'threads', href: normalizeSocialHref(socials.threads), label: 'Threads', icon: <AtSign size={16} /> },
    { key: 'zalo', href: normalizeSocialHref(socials.zalo), label: 'Zalo', icon: <ChatIcon app="zalo" size={16} /> },
  ].filter((item) => Boolean(item.href))

  return (
    <footer className="brand-footer-v2 relative overflow-hidden border-t border-outline-variant/40 bg-[#FFFDFB] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-primary before:via-tertiary before:to-secondary">
      <span className="brand-footer-watermark" aria-hidden="true">The One</span>
      <div className="brand-footer-wave" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-5 lg:px-10 pt-10 pb-8">
        {/* Round 12 A2.4: footer joins the page cascade — serif line → button → columns L→R → bottom bar */}
        {footer.ctaHeading?.trim() && (
          <div className="mb-10 border-b border-primary/10 pb-9">
            <p data-reveal="soft" className="font-serif text-[30px] leading-tight text-[#3d1226] md:text-[42px]">{footer.ctaHeading}</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div data-reveal="soft" style={{ '--ri': 2 } as CSSProperties}>
            <div className="flex items-center gap-3 mb-3">
              {footer.logoSrc && <img src={footer.logoSrc === '/logo-gg.png' ? '/avatars/logo-gg.png' : footer.logoSrc} alt={footer.logoAlt || footer.brandName} className="h-12 w-auto flex-shrink-0" />}
              <div>
                {footer.brandName && <div className="font-extrabold text-[15px] text-primary leading-tight">{footer.brandName}</div>}
                {footer.tagline && <div className="text-[11px] text-primary/75 tracking-wide mt-0.5">{footer.tagline}</div>}
              </div>
            </div>
            {footer.description && (
              <p className="text-[13px] text-on-surface/75 leading-relaxed mb-4 max-w-[320px]">
                {footer.description}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 md:hidden">
              {footer.email && (
                <a href={`mailto:${footer.email}`} className="flex min-h-11 items-center gap-1.5 text-xs text-on-surface/75 transition-colors hover:text-primary">
                  <span aria-hidden="true">@</span> {footer.email}
                </a>
              )}
              {footer.chatUrl && (
                <a href={footer.chatUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1.5 text-xs text-on-surface/75 transition-colors hover:text-primary">
                  <ChatIcon app="zalo" size={14} /> {footer.chatLabel}
                </a>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 bg-white text-on-surface/70 transition-colors hover:border-primary hover:text-primary"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
            <div className="mb-4 hidden items-center gap-3 sm:flex">
              <img src="/qr-gg99.png" alt="Zalo QR code" className="h-24 w-24 rounded-lg border border-primary/10 bg-white object-contain sm:h-20 sm:w-20" />
              {footer.qrCaption?.trim() && <p className="max-w-[140px] text-xs font-bold leading-snug text-on-surface/75">{footer.qrCaption}</p>}
            </div>

            <div className="border-t border-primary/10 pt-4 space-y-1">
              {footer.companyName && <p className="text-xs font-bold text-on-surface/75 leading-snug">{footer.companyName}</p>}
              {footer.taxCode && <p className="text-xs text-on-surface/70">TAX ID: {footer.taxCode}</p>}
              {footer.companyAddress && <p className="text-xs text-on-surface/70 leading-relaxed">{footer.companyAddress}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:contents">
            <div data-reveal="soft" style={{ '--ri': 3 } as CSSProperties}>
              {footer.solutionsHeading && (
                <h2 className="font-bold text-[11px] uppercase tracking-widest text-primary mb-3">
                  {footer.solutionsHeading}
                </h2>
              )}
              <ul className="space-y-2.5">
                {solutionLinks.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    {renderFooterLink(item)}
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal="soft" style={{ '--ri': 4 } as CSSProperties}>
              {footer.navigationHeading && (
                <h2 className="font-bold text-[11px] uppercase tracking-widest text-primary mb-3">
                  {footer.navigationHeading}
                </h2>
              )}
              <ul className="space-y-2.5">
                {navLinks.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    {renderFooterLink(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div data-reveal="soft" style={{ '--ri': 5 } as CSSProperties} className="hidden md:block">
            {footer.contactHeading && (
              <h2 className="font-bold text-[11px] uppercase tracking-widest text-primary mb-3">
                {footer.contactHeading}
              </h2>
            )}
            <ul className="space-y-2.5">
              {footer.email && (
                <li>
                  <a href={`mailto:${footer.email}`} className="flex min-h-11 items-center gap-1.5 text-sm text-on-surface/75 transition-colors hover:text-primary">
                    <span aria-hidden="true">@</span> {footer.email}
                  </a>
                </li>
              )}
              {footer.chatUrl && (
                <li>
                  <a href={footer.chatUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1.5 text-sm text-on-surface/75 transition-colors hover:text-primary">
                    <ChatIcon app="zalo" size={16} /> {footer.chatLabel}
                  </a>
                </li>
              )}
              {footer.address && (
                <li className="flex min-h-11 items-start gap-1.5 text-sm text-on-surface/75">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /> {footer.address}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary/10">
        <div data-reveal="soft" style={{ '--ri': 6 } as CSSProperties} className="max-w-6xl mx-auto px-5 lg:px-10 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          {footer.copyright && <p className="text-[11px] text-on-surface/70">{footer.copyright}</p>}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {hasLegalLinks && (
              <>
              {footer.privacyLabel && footer.privacyHref && (
                <a href={footer.privacyHref} className="inline-flex min-h-11 items-center text-[11px] text-on-surface/70 transition-colors hover:text-primary">
                  {footer.privacyLabel}
                </a>
              )}
              {footer.termsLabel && footer.termsHref && (
                <a href={footer.termsHref} className="inline-flex min-h-11 items-center text-[11px] text-on-surface/70 transition-colors hover:text-primary">
                  {footer.termsLabel}
                </a>
              )}
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
