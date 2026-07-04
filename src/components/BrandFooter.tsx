'use client'

import { MapPin } from 'lucide-react'
import { localizedPath, type BrandLang } from '../brandContent'
import { getLocalizedSiteSettings } from '../cms/siteSettings'
import type { CmsSiteSettings } from '../cms/types'
import { ChatIcon } from './ChatIcon'
import { openBookingModal } from './openBookingModal'

function isContactHref(href: string) {
  const normalized = href.trim().toLowerCase()
  return normalized === '#contact' || normalized === '/contact' || normalized.endsWith('/contact')
}

export function BrandFooter({ lang = 'vi', siteSettings }: { lang?: BrandLang; siteSettings?: CmsSiteSettings | null }) {
  const footer = getLocalizedSiteSettings(siteSettings, lang).footer
  const solutionLinks = footer.solutionLinks.filter((item) => item.label.trim() && item.href.trim())
  const navLinks = footer.navigationLinks.filter((item) => item.label.trim() && item.href.trim())
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

  return (
    <footer className="relative border-t border-outline-variant/40 bg-gradient-to-b from-surface to-surface-container-low before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-primary before:via-tertiary before:to-secondary">
      <div className="max-w-6xl mx-auto px-5 lg:px-10 pt-10 pb-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {footer.logoSrc && <img src={footer.logoSrc} alt={footer.logoAlt || footer.brandName} className="h-12 w-auto flex-shrink-0" />}
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

            <div className="border-t border-primary/10 pt-4 space-y-1">
              {footer.companyName && <p className="text-xs font-bold text-on-surface/75 leading-snug">{footer.companyName}</p>}
              {footer.taxCode && <p className="text-xs text-on-surface/50">MST: {footer.taxCode}</p>}
              {footer.companyAddress && <p className="text-xs text-on-surface/50 leading-relaxed">{footer.companyAddress}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:contents">
            <div>
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

            <div>
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

          <div className="hidden md:block">
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
        <div className="max-w-6xl mx-auto px-5 lg:px-10 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
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
