'use client'

import type { CSSProperties } from 'react'
import { ArrowDown, Building2, HelpCircle, Network, Orbit, Sparkles } from 'lucide-react'
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

function memberRotation(index: number) {
  const rotations = ['-4deg', '3deg', '-2deg', '4deg', '-3deg', '2deg']
  return rotations[index % rotations.length]
}

function AboutPeopleSection({ block }: { block?: ReturnType<typeof getCmsBlock> }) {
  const members = block?.items?.filter((item) => item.title?.trim()).slice(0, 6) ?? []
  if (!block || members.length === 0) return null

  return (
    <section className="py-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">The One People</p>
        <h2 className="mt-3 text-[28px] font-extrabold leading-tight text-on-surface md:text-[38px]">{block.heading || 'The One People'}</h2>
        {block.body && <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">{block.body}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, index) => (
          <article
            key={`${member.title}-${index}`}
            className="people-polaroid group bg-white p-3 shadow-[0_20px_48px_rgba(80,20,50,0.13)] transition duration-300"
            style={{ '--photo-rotation': memberRotation(index) } as CSSProperties}
          >
            <div className="relative aspect-square overflow-hidden bg-surface-container-low">
              <img src={member.imageUrl || member.photoUrl || '/logo-gg.png'} alt={member.imageAlt || member.title} className="h-full w-full object-cover transition duration-300 group-hover:opacity-0" />
              <img src={member.funPhotoUrl || member.backgroundImageUrl || member.imageUrl || '/logo-gg.png'} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 group-hover:opacity-100" />
            </div>
            <div className="px-1 pb-2 pt-4 text-center">
              <h3 className="people-signature text-[24px] leading-none text-on-surface">{member.title}</h3>
              {member.label && <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{member.label}</p>}
              {member.body && <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-relaxed text-on-surface-variant">{member.body}</p>}
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-3xl text-center">
        {block.closingLine1 && <p className="home-people-closing-one text-[22px] italic leading-tight text-on-surface/85 md:text-[26px]">{block.closingLine1}</p>}
        {block.closingLine2 && (
          <p className="home-people-closing-two mt-3 bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[26px] font-semibold leading-tight text-transparent md:text-[40px]">
            {block.closingLine2}
          </p>
        )}
        <ArrowDown className="mx-auto mt-5 animate-bounce text-primary" size={22} aria-hidden="true" />
      </div>
    </section>
  )
}

export default function AboutBrandPage({ lang = 'vi', cmsPage, homePage, siteSettings }: { lang?: BrandLang; cmsPage?: CmsPageContent | null; homePage?: CmsPageContent | null; siteSettings?: CmsSiteSettings | null }) {
  const c = compactAboutByLang[lang]
  const meta = cmsPage?.meta ?? aboutMetaByLang[lang]
  const packages = theOnePackagesByLang[lang].packages
  const heroBlock = getCmsBlock(cmsPage, 'hero')
  const cardsBlock = getCmsBlock(cmsPage, 'cards')
  const peopleBlock = getCmsBlock(homePage, 'people')
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

            <AboutPeopleSection block={peopleBlock} />

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
