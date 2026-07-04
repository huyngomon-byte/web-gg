'use client'

import { BadgeCheck, Mail } from 'lucide-react'
import {
  contactMeta,
  organizationSchema,
  packagesMetaByLang,
  servicesMeta,
  theOnePackagesByLang,
  websiteSchema,
  type BrandLang,
} from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { PackageCards } from '../components/PackageCards'
import { SeoHead } from '../components/SeoHead'
import { getCmsBlock, splitCmsParagraphs } from '../cms/contentBlocks'
import type { CmsBlockItem, CmsPageContent, CmsSiteSettings } from '../cms/types'
import { useScrollReveal } from '../hooks/useScrollReveal'

export function PackagesPage({ lang = 'vi', cmsPage, siteSettings }: { lang?: BrandLang; cmsPage?: CmsPageContent | null; siteSettings?: CmsSiteSettings | null }) {
  useScrollReveal()

  const c = theOnePackagesByLang[lang]
  const meta = cmsPage?.meta ?? packagesMetaByLang[lang]
  const introBlock = getCmsBlock(cmsPage, 'intro')
  const packageBlock = getCmsBlock(cmsPage, 'packages')
  const introParagraphs = splitCmsParagraphs(introBlock?.body)
  const packageItems: CmsBlockItem[] = packageBlock?.items?.length
    ? packageBlock.items
    : c.packages.map((item, index) => ({
      title: item.name,
      body: `${item.title}\n${item.text}`,
      icon: ['🚀', '⚙️', '📣'][index],
      href: item.href,
    }))

  return (
    <BrandLayout lang={lang} siteSettings={siteSettings}>
      <SeoHead meta={meta} schema={[organizationSchema, websiteSchema]} lang={lang} />

      <article>
        <section className="relative flex min-h-[30vh] items-center overflow-hidden bg-[linear-gradient(135deg,#fff5f7_0%,#ffe4ec_48%,#fff1c8_100%)] px-5 py-12 lg:px-10">
          <div className="absolute inset-0 tech-grid opacity-55 pointer-events-none" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />
          <div className="relative max-w-5xl mx-auto">
            <h1 className="text-[40px] sm:text-[56px] md:text-[72px] font-extrabold text-on-surface leading-[1.06]">
              {introBlock?.heading ?? c.h1}
            </h1>
            {introParagraphs.length ? (
              <div className="mt-5 grid max-w-2xl gap-3 text-base leading-relaxed text-on-surface-variant md:text-lg">
                {introParagraphs.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <>
                <p className="mt-5 text-xl md:text-2xl font-bold text-primary">{c.subtitle}</p>
                <p className="mt-5 max-w-2xl text-base md:text-lg text-on-surface-variant leading-relaxed">{c.intro}</p>
              </>
            )}
          </div>
        </section>

        <section className="px-5 pb-16 pt-10 md:pb-24 lg:px-10">
          <div className="max-w-6xl mx-auto">
            {packageBlock?.body && (
              <div className="mb-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
                {packageBlock.body}
              </div>
            )}
            <PackageCards items={packageItems} lang={lang} />
          </div>
        </section>
      </article>
    </BrandLayout>
  )
}

export function ServicesPage({ cmsPage, siteSettings }: { cmsPage?: CmsPageContent | null; siteSettings?: CmsSiteSettings | null }) {
  const introBlock = getCmsBlock(cmsPage, 'intro')
  return (
    <BrandLayout lang="en" siteSettings={siteSettings}>
      <SeoHead meta={cmsPage?.meta ?? servicesMeta} schema={[organizationSchema, websiteSchema]} lang="en" />
      <section className="relative overflow-hidden px-5 lg:px-10 py-14 md:py-20">
        <div className="absolute inset-0 tech-grid opacity-80 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto">
          {introBlock && (
            <div className="mb-8 rounded-2xl border border-outline-variant/40 bg-surface/70 p-5">
              <h1 className="text-3xl font-extrabold text-on-surface md:text-5xl">{introBlock.heading}</h1>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-on-surface-variant">{introBlock.body}</p>
            </div>
          )}
          <h1 className="text-[40px] sm:text-[56px] md:text-[72px] font-extrabold text-on-surface leading-[1.06]">Services</h1>
          <p className="mt-5 max-w-2xl text-lg text-on-surface-variant leading-relaxed">
            GG99 provides brand identity, website development, CRM, marketing automation and performance marketing through the The One growth system.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {['Brand', 'Website development', 'CRM', 'Marketing automation', 'Performance marketing'].map((item) => (
              <article key={item} className="glass-card rounded-2xl p-4">
                <BadgeCheck size={18} className="text-primary mb-3" />
                <h2 className="text-sm font-extrabold text-on-surface">{item}</h2>
              </article>
            ))}
          </div>
        </div>
      </section>
    </BrandLayout>
  )
}

export function ContactPage({ cmsPage, siteSettings }: { cmsPage?: CmsPageContent | null; siteSettings?: CmsSiteSettings | null }) {
  const introBlock = getCmsBlock(cmsPage, 'intro')
  return (
    <BrandLayout lang="en" siteSettings={siteSettings}>
      <SeoHead meta={cmsPage?.meta ?? contactMeta} schema={[organizationSchema, websiteSchema]} lang="en" />
      <section className="relative overflow-hidden px-5 lg:px-10 py-14 md:py-20">
        <div className="absolute inset-0 tech-grid opacity-80 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto">
          {introBlock && (
            <div className="mb-8 rounded-2xl border border-outline-variant/40 bg-surface/70 p-5">
              <h1 className="text-3xl font-extrabold text-on-surface md:text-5xl">{introBlock.heading}</h1>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-on-surface-variant">{introBlock.body}</p>
            </div>
          )}
          <h1 className="text-[40px] sm:text-[56px] md:text-[72px] font-extrabold text-on-surface leading-[1.06]">Contact GG99</h1>
          <p className="mt-5 max-w-2xl text-lg text-on-surface-variant leading-relaxed">
            Contact GG99, also known as The One, to build your brand, website, CRM, automation and performance marketing in one ecosystem.
          </p>
          <a href="mailto:smooth@gg99.vn" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-on-primary gg-btn-primary">
            <Mail size={18} /> smooth@gg99.vn
          </a>
        </div>
      </section>
    </BrandLayout>
  )
}
