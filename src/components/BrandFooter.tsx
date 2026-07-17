'use client'

import type { BrandLang } from '../brandContent'
import { getLocalizedSiteSettings } from '../cms/siteSettings'
import type { CmsSiteSettings } from '../cms/types'
import { ChatIcon } from './ChatIcon'

const fallbackSolutionLinks = [
  { label: 'The One Start', href: '/#packages' },
  { label: 'The One System', href: '/#packages' },
  { label: 'The One Scale', href: '/#packages' },
]

const fallbackExploreLinks = [
  { label: 'About The One', href: '/about' },
  { label: 'The One Stories', href: '/the-one' },
  { label: 'Insights', href: '/insights' },
]

export function BrandFooter({
  lang = 'en',
  siteSettings,
  continuousAtmosphere = false,
}: {
  lang?: BrandLang
  siteSettings?: CmsSiteSettings | null
  continuousAtmosphere?: boolean
}) {
  const footer = getLocalizedSiteSettings(siteSettings, lang === 'en' ? lang : 'en').footer
  const logoSrc = footer.logoSrc === '/logo-gg.png' ? '/avatars/logo-gg.png' : footer.logoSrc
  const brandName = footer.brandName.trim() || 'The One — GG99'
  const positioning = footer.tagline.trim() || footer.description.trim() || 'One partner. One system. One growth direction.'
  const configuredSolutionLinks = footer.solutionLinks.filter((item) => item.visible !== false).slice(0, 3)
  const configuredExploreLinks = footer.navigationLinks.filter((item) => item.visible !== false)
  const solutionLinks = (configuredSolutionLinks.length
    ? configuredSolutionLinks
    : fallbackSolutionLinks
  ).map((item) => ({ ...item, href: '/#packages' }))
  const exploreLinks = configuredExploreLinks.length
    ? configuredExploreLinks
    : fallbackExploreLinks

  return (
    <footer
      className={`brand-footer-v2${continuousAtmosphere ? ' brand-footer-v2--continuous-atmosphere' : ''}`}
      data-testid="site-footer"
      data-atmosphere-continuation={continuousAtmosphere ? 'true' : undefined}
    >
      <div className="brand-footer-wave" aria-hidden="true" />

      <div className="brand-footer-main">
        <section className="brand-footer-brand-block" aria-labelledby="footer-brand-name">
          <a className="brand-footer-brand" href="/" aria-label="The One GG99 home">
            {logoSrc && <img src={logoSrc} alt="" className="brand-footer-logo" />}
            <span id="footer-brand-name">{brandName}</span>
          </a>

          <p className="brand-footer-positioning">{positioning}</p>

          <ul className="brand-footer-contact-list" aria-label="Contact The One GG99">
            {footer.email && (
              <li>
                <a className="brand-footer-link brand-footer-contact-link" href={`mailto:${footer.email}`}>
                  <span aria-hidden="true">@</span>
                  <span>{footer.email}</span>
                </a>
              </li>
            )}
            {footer.chatUrl && (
              <li>
                <a
                  className="brand-footer-link brand-footer-contact-link"
                  href={footer.chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ChatIcon app="zalo" size={16} />
                  <span>{footer.chatLabel?.trim() || 'Zalo'}</span>
                </a>
              </li>
            )}
          </ul>
        </section>

        <div className="brand-footer-nav-grid">
          <nav aria-labelledby="footer-solutions-heading">
            <h2 id="footer-solutions-heading" className="brand-footer-heading">{footer.solutionsHeading || 'Solutions'}</h2>
            <ul className="brand-footer-link-list">
              {solutionLinks.map((item) => (
                <li key={item.label}>
                  <a className="brand-footer-link" href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-explore-heading">
            <h2 id="footer-explore-heading" className="brand-footer-heading">{footer.navigationHeading || 'Explore'}</h2>
            <ul className="brand-footer-link-list">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <a className="brand-footer-link" href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="brand-footer-legal">
        <div className="brand-footer-legal-copy">
          {footer.copyright && <p>{footer.copyright}</p>}
          {(footer.companyName || footer.taxCode) && (
            <p className="brand-footer-company">
              {footer.companyName}
              {footer.companyName && footer.taxCode && <span aria-hidden="true"> &middot; </span>}
              {footer.taxCode && <span>Tax ID: {footer.taxCode}</span>}
            </p>
          )}
        </div>

        <nav className="brand-footer-legal-links" aria-label="Legal">
          {footer.privacyHref && <a className="brand-footer-link" href={footer.privacyHref}>{footer.privacyLabel || 'Privacy'}</a>}
          {footer.termsHref && <a className="brand-footer-link" href={footer.termsHref}>{footer.termsLabel || 'Terms'}</a>}
        </nav>
      </div>
    </footer>
  )
}
