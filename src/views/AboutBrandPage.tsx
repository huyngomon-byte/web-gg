'use client'

import { Building2, HelpCircle, Network, Orbit, Sparkles } from 'lucide-react'
import {
  aboutMetaByLang,
  compactAboutByLang,
  localizedPath,
  organizationSchema,
  theOnePackagesByLang,
  websiteSchema,
  type BrandLang,
} from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { CmsIcon } from '../components/CmsIcon'
import { SeoHead } from '../components/SeoHead'
import { getCmsBlock, splitCmsParagraphs } from '../cms/contentBlocks'
import type { CmsBlockItem, CmsPageContent, CmsSiteSettings } from '../cms/types'

const cardIcons = [Building2, Orbit, Network]

export default function AboutBrandPage({ lang = 'vi', cmsPage, siteSettings }: { lang?: BrandLang; cmsPage?: CmsPageContent | null; siteSettings?: CmsSiteSettings | null }) {
  const c = compactAboutByLang[lang]
  const meta = cmsPage?.meta ?? aboutMetaByLang[lang]
  const packages = theOnePackagesByLang[lang].packages
  const heroBlock = getCmsBlock(cmsPage, 'hero')
  const cardsBlock = getCmsBlock(cmsPage, 'cards')
  const heroParagraphs = splitCmsParagraphs(heroBlock?.body)
  const cardItems: CmsBlockItem[] = cardsBlock?.items?.length
    ? cardsBlock.items
    : c.cards.map((card) => ({ title: card.title, body: card.text }))
  const cardsHeading = cardsBlock?.heading?.trim().toLowerCase() === 'about cards'
    ? lang === 'vi' ? 'GG99 xây gì' : 'What GG99 Builds'
    : cardsBlock?.heading || (lang === 'vi' ? 'GG99 xây gì' : 'What GG99 Builds')

  return (
    <BrandLayout lang={lang} siteSettings={siteSettings}>
      <SeoHead meta={meta} schema={[organizationSchema, websiteSchema]} lang={lang} />

      <article>
        <section className="relative overflow-hidden px-5 lg:px-10 py-14 md:py-20">
          <div className="absolute inset-0 tech-grid opacity-80 pointer-events-none" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />
          <div className="relative max-w-5xl mx-auto grid lg:grid-cols-[1fr_0.75fr] gap-8 items-center">
            <div>
              <h1 className="text-[40px] sm:text-[56px] md:text-[72px] font-extrabold text-on-surface leading-[1.06]">
                {heroBlock?.heading ?? c.hero.h1}
              </h1>
              {heroParagraphs.length ? (
                <div className="mt-6 grid max-w-2xl gap-3 text-lg leading-relaxed text-on-surface-variant md:text-xl">
                  {heroParagraphs.map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl">
                  {c.hero.intro}
                </p>
              )}
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={localizedPath(lang, '/the-one')} className="btn-shine inline-flex px-5 py-3 rounded-xl bg-primary text-on-primary gg-btn-primary font-bold">
                  The One
                </a>
                <a href={localizedPath(lang, '/')} className="inline-flex px-5 py-3 rounded-xl border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors">
                  {lang === 'vi' ? 'Trang chủ' : 'Homepage'}
                </a>
              </div>
            </div>
            <div className="rounded-2xl bg-inverse-surface p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
              <div className="relative">
                {heroBlock?.imageUrl ? (
                  <img src={heroBlock.imageUrl} alt={heroBlock.imageAlt || 'GG99'} className="mb-5 h-14 w-auto object-contain" />
                ) : (
                  <Sparkles size={28} className="text-primary-fixed-dim mb-5" />
                )}
                <h2 className="text-[24px] md:text-[30px] font-extrabold text-white leading-tight">
                  The One by gg99
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  {lang === 'vi'
                    ? 'Một thực thể thương hiệu rõ ràng cho người dùng, Google và các công cụ tìm kiếm AI.'
                    : 'A clear brand entity for users, Google and AI search.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 lg:px-10 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto space-y-10">
            <section>
              <h2 className="text-[28px] md:text-[34px] font-extrabold text-on-surface mb-6">
                {cardsHeading}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {cardItems.map((card, index) => {
                  const Icon = cardIcons[index]
                  return (
                    <article key={`${card.title}-${index}`} className="glass-card card-hover rounded-2xl p-6">
                      <span className="icon-chip h-11 w-11 mb-4">
                        {card.imageUrl ? (
                          <img src={card.imageUrl} alt={card.imageAlt || card.title} className="h-6 w-6 object-contain" />
                        ) : (
                          <CmsIcon name={card.icon} fallback={Icon} size={20} />
                        )}
                      </span>
                      <h3 className="text-lg font-extrabold text-on-surface">{card.title}</h3>
                      <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">{card.body}</p>
                    </article>
                  )
                })}
              </div>
            </section>

            <section>
              <h2 className="text-[28px] md:text-[34px] font-extrabold text-on-surface mb-6">
                {lang === 'vi' ? 'Quy trình' : 'Process'}
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                {c.process.map((step, index) => (
                  <article key={step.title} className="glass-card card-hover rounded-2xl p-5">
                    <div className="text-[11px] font-extrabold tracking-widest text-primary mb-3">{String(index + 1).padStart(2, '0')}</div>
                    <h3 className="font-extrabold text-on-surface mb-2">{step.title}</h3>
                    <p className="text-sm text-on-surface-variant">{step.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[28px] md:text-[34px] font-extrabold text-on-surface mb-6">
                The One Packages
              </h2>
              <nav className="grid sm:grid-cols-3 gap-3">
                {packages.map((item) => {
                  return (
                    <a
                      key={item.name}
                      href={localizedPath(lang, item.href)}
                      className="glass-card card-hover rounded-2xl px-5 py-4 font-bold text-on-surface hover:text-primary transition-colors"
                    >
                      {item.name}
                    </a>
                  )
                })}
              </nav>
            </section>

            <section className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <HelpCircle size={24} className="text-primary" />
                <h2 className="text-[24px] md:text-[30px] font-extrabold text-on-surface">
                  {lang === 'vi' ? 'Câu hỏi thường gặp' : 'FAQ'}
                </h2>
              </div>
              <div className="space-y-3">
                {c.faq.map((item) => (
                  <details key={item.q} className="rounded-xl border border-outline-variant/40 bg-surface/70 p-4 group">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-bold text-on-surface">
                      {item.q}
                      <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </section>
      </article>
    </BrandLayout>
  )
}
