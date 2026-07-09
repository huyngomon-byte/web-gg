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

export function BrandFooter({ lang = 'en', siteSettings }: { lang?: BrandLang; siteSettings?: CmsSiteSettings | null }) {
  const footer = getLocalizedSiteSettings(siteSettings, lang).footer
  const solutionLinks = footer.solutionLinks.filter((item) => item.visible !== false && item.label.trim() && item.href.trim())
  const navLinks = footer.navigationLinks.filter((item) => item.visible !== false && item.label.trim() && item.href.trim())
  const hasLegalLinks =
    Boolean(footer.privacyLabel.trim() && footer.privacyHref.trim()) ||
    Boolean(footer.termsLabel.trim() && footer.termsHref.trim())
  const linkClass = 'text-sm text-on-surface/70 hover:text-primary transition-colors'

  function renderFooterLink(item: { href: string; label: string }) {
    if (isContactHref(item.href)) {
      return (
        <button type="button" onClick={openBookingModal} className={`${linkClass} text-left`}>
          {item.label}
        </button>
      )
    }

    return (
      <a href={localizedPath(lang, item.href)} className={linkClass}>
        {item.label}
      </a>
    )
  }

  const socials = footer.socials ?? {}
  const socialLinks = [
    { key: 'facebook', href: socials.facebook, label: 'Facebook', icon: <Facebook size={16} /> },
    { key: 'instagram', href: socials.instagram, label: 'Instagram', icon: <Instagram size={16} /> },
    { key: 'tiktok', href: socials.tiktok, label: 'TikTok', icon: <Music2 size={16} /> },
    { key: 'threads', href: socials.threads, label: 'Threads', icon: <AtSign size={16} /> },
    { key: 'zalo', href: socials.zalo, label: 'Zalo', icon: <ChatIcon app="zalo" size={16} /> },
  ].filter((item) => item.href?.trim())

  return (
    <footer className="relative overflow-hidden border-t border-outline-variant/40 bg-[#FFFDFB] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-primary before:via-tertiary before:to-secondary">
      {/* Round 8 A6: oversized watermark, barely there */}
      {footer.logoSrc && (
        <img
          src={footer.logoSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-auto opacity-[0.04] md:h-80"
        />
      )}
      <div className="relative max-w-6xl mx-auto px-5 lg:px-10 pt-10 pb-8">
        {/* Round 12 A2.4: footer joins the page cascade — serif line → button → columns L→R → bottom bar */}
        {footer.ctaHeading?.trim() && (
          <div className="mb-10 flex flex-col gap-5 border-b border-primary/10 pb-9 md:flex-row md:items-center md:justify-between">
            <p data-reveal="soft" className="font-serif text-[30px] leading-tight text-[#3d1226] md:text-[42px]">{footer.ctaHeading}</p>
            <button
              type="button"
              onClick={openBookingModal}
              data-reveal="soft"
              style={{ '--ri': 1 } as CSSProperties}
              className="btn-shine cta-idle inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary px-6 py-3 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(219,39,119,0.24)] hover:opacity-95"
            >
              Schedule Our Date
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div data-reveal="soft" style={{ '--ri': 2 } as CSSProperties}>
            <div className="flex items-center gap-3 mb-3">
              {footer.logoSrc && <img src={footer.logoSrc === '/logo-gg.png' ? '/avatars/logo-gg.png' : footer.logoSrc} alt={footer.logoAlt || footer.brandName} className="h-12 w-auto flex-shrink-0" />}
              <div>
                {footer.brandName && <div className="font-extrabold text-[15px] text-primary leading-tight">{footer.brandName}</div>}
                {footer.tagline && <div className="text-[11px] text-primary/60 tracking-wide mt-0.5">{footer.tagline}</div>}
              </div>
            </div>
            {footer.description && (
              <p className="text-[13px] text-on-surface/60 leading-relaxed mb-4 max-w-[320px]">
                {footer.description}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 md:hidden">
              {footer.email && (
                <a href={`mailto:${footer.email}`} className="text-xs text-on-surface/60 hover:text-primary transition-colors flex items-center gap-1.5">
                  <span aria-hidden="true">@</span> {footer.email}
                </a>
              )}
              {footer.chatUrl && (
                <a href={footer.chatUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-on-surface/60 hover:text-primary transition-colors flex items-center gap-1.5">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 bg-white text-on-surface/60 transition-colors hover:border-primary hover:text-primary"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
            <div className="mb-4 flex items-center gap-3">
              <img src="/qr-gg99.png" alt="Zalo QR code" className="h-[72px] w-[72px] rounded-lg border border-primary/10 bg-white object-contain" />
              {footer.qrCaption?.trim() && <p className="max-w-[140px] text-xs font-bold leading-snug text-on-surface/60">{footer.qrCaption}</p>}
            </div>

            <div className="border-t border-primary/10 pt-4 space-y-1">
              {footer.companyName && <p className="text-xs font-bold text-on-surface/75 leading-snug">{footer.companyName}</p>}
              {footer.taxCode && <p className="text-xs text-on-surface/50">TAX ID: {footer.taxCode}</p>}
              {footer.companyAddress && <p className="text-xs text-on-surface/50 leading-relaxed">{footer.companyAddress}</p>}
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
                  <a href={`mailto:${footer.email}`} className="text-sm text-on-surface/70 hover:text-primary transition-colors flex items-center gap-1.5">
                    <span aria-hidden="true">@</span> {footer.email}
                  </a>
                </li>
              )}
              {footer.chatUrl && (
                <li>
                  <a href={footer.chatUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface/70 hover:text-primary transition-colors flex items-center gap-1.5">
                    <ChatIcon app="zalo" size={16} /> {footer.chatLabel}
                  </a>
                </li>
              )}
              {footer.address && (
                <li className="text-sm text-on-surface/70 flex items-start gap-1.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /> {footer.address}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary/10">
        <div data-reveal="soft" style={{ '--ri': 6 } as CSSProperties} className="max-w-6xl mx-auto px-5 lg:px-10 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          {footer.copyright && <p className="text-[11px] text-on-surface/45">{footer.copyright}</p>}
          {hasLegalLinks && (
            <div className="flex gap-5">
              {footer.privacyLabel && footer.privacyHref && (
                <a href={footer.privacyHref} className="text-[11px] text-on-surface/50 hover:text-primary transition-colors">
                  {footer.privacyLabel}
                </a>
              )}
              {footer.termsLabel && footer.termsHref && (
                <a href={footer.termsHref} className="text-[11px] text-on-surface/50 hover:text-primary transition-colors">
                  {footer.termsLabel}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
