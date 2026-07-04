'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import { i18n, type Lang } from './i18n'
import { clients } from './content'
import { BookingModal } from './components/BookingModal'
import { CountUp } from './components/CountUp'
import { HeroEcosystem } from './components/HeroEcosystem'
import { ChatIcon } from './components/ChatIcon'
import { useScrollReveal } from './hooks/useScrollReveal'
import { useCardSpotlight } from './hooks/useCardSpotlight'
import { useScrollParallax } from './hooks/useScrollParallax'

function LangSwitcher({ lang }: { lang: Lang }) {
  return (
    <div className="flex items-center gap-0.5 text-[11px] font-extrabold tracking-wider whitespace-nowrap">
      <a
        href="/"
        className={`px-1.5 sm:px-2 py-1 rounded-md transition-colors ${
          lang === 'vi'
            ? 'text-primary bg-primary/10'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        VI
      </a>
      <span className="text-on-surface-variant/30 select-none">|</span>
      <a
        href="/en"
        className={`px-1.5 sm:px-2 py-1 rounded-md transition-colors ${
          lang === 'en'
            ? 'text-primary bg-primary/10'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        EN
      </a>
      <span className="text-on-surface-variant/30 select-none">|</span>
      <a
        href="/ko"
        className={`px-1.5 sm:px-2 py-1 rounded-md transition-colors ${
          lang === 'ko'
            ? 'text-primary bg-primary/10'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span className="sm:hidden">KR</span>
        <span className="hidden sm:inline">한국어</span>
      </a>
    </div>
  )
}

export default function PageTemplate({ lang }: { lang: Lang }) {
  const c = i18n[lang]
  const [bookingOpen, setBookingOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  // Scroll-reveal cho hero/section/card (chạy sau khi intro xong)
  useScrollReveal()
  // Spotlight chuột cho card (desktop)
  useCardSpotlight()
  // Parallax theo scroll (chiều sâu)
  useScrollParallax()

  // SEO
  useEffect(() => {
    document.documentElement.lang = c.seo.lang
    document.title = c.seo.title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', c.seo.description)

    // hreflang
    ;['vi', 'en', 'ko'].forEach((l) => {
      const existing = document.querySelector(`link[hreflang="${l}"]`)
      if (existing) existing.remove()
    })
    const viLink = document.createElement('link')
    viLink.rel = 'alternate'
    viLink.hreflang = 'vi'
    viLink.href = 'https://www.gg99.vn/'
    document.head.appendChild(viLink)

    const enLink = document.createElement('link')
    enLink.rel = 'alternate'
    enLink.hreflang = 'en'
    enLink.href = 'https://www.gg99.vn/en'
    document.head.appendChild(enLink)

    const koLink = document.createElement('link')
    koLink.rel = 'alternate'
    koLink.hreflang = 'ko'
    koLink.href = 'https://www.gg99.vn/ko'
    document.head.appendChild(koLink)

    return () => {
      document.querySelector('link[hreflang="vi"]')?.remove()
      document.querySelector('link[hreflang="en"]')?.remove()
      document.querySelector('link[hreflang="ko"]')?.remove()
    }
  }, [lang, c.seo])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll to hash section after page load (e.g. navigating from /gioi-thieu to /#process)
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const tryScroll = (attempts = 0) => {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else if (attempts < 10) {
        setTimeout(() => tryScroll(attempts + 1), 80)
      }
    }
    tryScroll()
  }, [])

  const homeHref = lang === 'en' ? '/en' : lang === 'ko' ? '/ko' : '/'

  return (
    <>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} lang={lang} />

      {/* ── Navbar ── */}
      <header className="fixed w-full top-0 z-50 bg-surface/92 border-b border-outline-variant/30 shadow-sm">
        <nav className="flex justify-between items-center px-5 lg:px-10 max-w-6xl mx-auto h-14">
          <a href={homeHref} className="flex items-center gap-2.5">
            <img src="/logo-gg.png" alt={c.company.name} className="h-16 w-auto" />
            <div className="hidden sm:block">
              <div className="font-extrabold text-base text-primary leading-tight">
                {c.company.name}
              </div>
              <div className="text-[10px] text-on-surface-variant tracking-wider uppercase opacity-70">
                {c.company.tagline}
              </div>
            </div>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {c.nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: lang switcher + CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitcher lang={lang} />
            <button
              onClick={() => setBookingOpen(true)}
              className="btn-shine bg-primary text-on-primary gg-btn-primary text-xs px-2.5 py-1.5 sm:text-sm sm:px-4 sm:py-2 rounded-lg font-bold glow-orange hover:opacity-90 whitespace-nowrap"
            >
              {c.ui.navCta}
            </button>
          </div>
        </nav>
      </header>

      <main className="pt-14 mesh">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Nền tech: grid + aura cam + aura lạnh + noise (depth, premium) */}
          <div className="absolute inset-0 tech-grid opacity-90 pointer-events-none" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />
          <div
            className="hero-aura"
            style={{ width: '540px', height: '540px', top: '-160px', right: '-60px' }}
            aria-hidden="true"
          />
          <div
            className="hero-aura--cool hero-aura hidden md:block"
            style={{ width: '440px', height: '440px', bottom: '-180px', left: '-80px', top: 'auto' }}
            aria-hidden="true"
          />
          {/* glow orbs trôi theo scroll (parallax) */}
          <div className="scroll-orb scroll-orb--orange" data-parallax="0.22" style={{ width: '360px', height: '360px', top: '-40px', right: '6%' }} aria-hidden="true" />
          <div className="scroll-orb scroll-orb--blue" data-parallax="0.34" style={{ width: '300px', height: '300px', bottom: '-60px', left: '4%' }} aria-hidden="true" />
          {/* dải ánh sáng quét ngang hero */}
          <div className="hero-sweep" aria-hidden="true" />
          <div className="relative py-8 md:py-12 px-5 lg:px-10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="badge mb-4 block w-fit" data-reveal style={{ animationDelay: '0ms' }}>{c.hero.badge}</span>
              <h1 className="font-extrabold leading-[1.15] mb-4">
                <span className="block text-[28px] sm:text-[34px] md:text-[40px] text-on-surface" data-reveal style={{ animationDelay: '70ms' }}>
                  {c.hero.headline}
                </span>
                <span className="block text-[28px] sm:text-[34px] md:text-[40px] gg-grad-text" data-reveal style={{ animationDelay: '170ms' }}>
                  {c.hero.headlineHighlight}
                </span>
              </h1>
              <p className="text-base text-on-surface-variant mb-5 max-w-lg leading-relaxed whitespace-pre-line" data-reveal style={{ animationDelay: '290ms' }}>
                {c.hero.subtext}
              </p>
              <div className="flex flex-wrap gap-3 mb-5" data-reveal style={{ animationDelay: '400ms' }}>
                <button
                  onClick={() => setBookingOpen(true)}
                  className="btn-shine cta-idle px-6 py-3 bg-primary text-on-primary gg-btn-primary rounded-xl font-bold glow-orange hover:opacity-90"
                >
                  {c.ui.heroCta1}
                </button>
                <a
                  href={c.company.chat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border-2 border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-low transition-colors flex items-center gap-2"
                >
                  <ChatIcon app={c.company.chat.app} size={20} /> {c.company.chat.label}
                </a>
              </div>
              <div className="flex gap-8" data-reveal style={{ animationDelay: '500ms' }}>
                {c.hero.stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-primary">
                      <CountUp value={s.value} />
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual — hệ sinh thái GG99 (logo + tag orbit, framer-motion) */}
            <div className="mt-4 lg:mt-0" data-parallax="0.07">
              <HeroEcosystem />
            </div>
          </div>
          </div>
        </section>

        {/* ── Client Logos Marquee ── */}
        <section
          className="overflow-hidden relative bg-surface dark:bg-surface-container-low border-y border-outline-variant/20"
          style={{
            padding: '14px 0',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        >
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {[...clients, ...clients, ...clients, ...clients].map((c, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 relative overflow-hidden"
                  style={{ width: `${c.slotW}px`, height: '56px' }}
                >
                  <img
                    src={c.logo}
                    alt={c.name}
                    draggable={false}
                    style={{
                      position: 'absolute',
                      width: `${c.imgW}px`,
                      height: `${c.imgH}px`,
                      left: `${c.imgL}px`,
                      top: `${c.imgT}px`,
                      opacity: 0.85,
                      userSelect: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who Is This For ── */}
        <section className="py-5 md:py-7 px-5 lg:px-10 bg-surface-container">
          <div className="max-w-3xl mx-auto text-center mb-5">
            <span className="badge mb-3 block w-fit mx-auto" data-reveal>{c.whoIsThisFor.badge}</span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-on-surface" data-reveal style={{ animationDelay: '80ms' }}>
              {c.whoIsThisFor.headline}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
            {c.whoIsThisFor.cards.map((card, i) => (
              <div
                key={card.title}
                data-reveal="vortex"
                style={{ ["--ri"]: i } as CSSProperties}
                className="card-hover glass-card rounded-2xl p-6 border border-outline-variant/50 flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-[11px] font-extrabold text-primary tracking-wide">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <div className="text-xl mb-2 card-icon">{card.icon}</div>
                  <h3 className="font-bold text-[15px] text-on-surface mb-1.5 leading-snug">{card.title}</h3>
                  <p className="text-sm text-on-surface/60 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pain Points ── */}
        <section className="py-5 md:py-7 px-5 lg:px-10 bg-surface-container-low">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-4">
              <span className="badge mb-2 block w-fit mx-auto" data-reveal>{c.painPoints.sectionLabel}</span>
              <h2 className="text-[26px] md:text-[30px] font-bold text-on-surface" data-reveal style={{ animationDelay: '80ms' }}>
                {c.painPoints.headline}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {c.painPoints.items.map((item, i) => (
                <div
                  key={item}
                  data-reveal={i % 2 === 0 ? 'fly-left' : 'fly-right'}
                  style={{ ["--ri"]: i } as CSSProperties}
                  className="card-hover glass-card px-4 py-3 rounded-xl flex items-center gap-3"
                >
                  <span className="text-tertiary font-bold text-base flex-shrink-0">!</span>
                  <p className="text-sm text-on-surface">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Solutions ── */}
        <section
          id="solutions"
          className="py-8 md:py-12 bg-inverse-surface relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '36px 36px',
            }}
          ></div>
          {/* moving light line rất nhẹ */}
          <div className="tech-scanline" aria-hidden="true" />
          {/* glow orbs trôi theo scroll */}
          <div className="scroll-orb scroll-orb--orange scroll-orb--screen" data-parallax="0.3" style={{ width: '460px', height: '460px', top: '0%', left: '28%' }} aria-hidden="true" />
          <div className="scroll-orb scroll-orb--blue scroll-orb--screen" data-parallax="0.18" style={{ width: '360px', height: '360px', bottom: '-10%', right: '6%' }} aria-hidden="true" />
          <div className="max-w-6xl mx-auto px-5 lg:px-10 relative z-10">
            <div className="text-center mb-8">
              <span
                className="badge mb-3 block w-fit mx-auto"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#ffb693' }}
                data-reveal
              >
                {c.solutions.sectionLabel}
              </span>
              <h2 className="text-[26px] md:text-[32px] font-bold text-white" data-reveal style={{ animationDelay: '80ms' }}>
                {c.solutions.headline}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {c.solutions.pillars.map((p, i) => (
                <div
                  key={p.num}
                  id={`solution-${p.num}`}
                  data-reveal="flip-y"
                  style={{ scrollMarginTop: "72px", ["--ri"]: i } as CSSProperties}
                  className="card-hover bg-white/[0.07] p-6 rounded-2xl border border-white/10 hover:bg-white/[0.11]"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="card-icon w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                      {p.icon}
                    </div>
                    <div>
                      <div className="text-[10px] text-primary-fixed-dim font-bold uppercase tracking-widest mb-1">
                        {p.num}
                      </div>
                      <h4 className="font-bold text-white text-base leading-tight">{p.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{p.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/70 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How We Work ── */}
        <section id="process" className="py-6 md:py-9 px-5 lg:px-10 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div data-reveal="fly-left">
              <span className="badge mb-3 block w-fit">{c.howSection.sectionLabel}</span>
              <h2 className="text-[26px] md:text-[30px] font-bold text-on-surface mb-3">
                {c.howSection.headline}
              </h2>
              <div className="glow-line w-40 mb-1" data-reveal="line" aria-hidden="true" />
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="btn-shine inline-flex items-center gap-2 bg-primary text-on-primary gg-btn-primary px-6 py-3 rounded-xl font-bold glow-orange hover:opacity-90 text-sm"
                >
                  {c.howSection.ctaLabel}
                </button>
                <a
                  href={c.company.chat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-outline-variant text-on-surface-variant px-6 py-3 rounded-xl font-bold hover:bg-surface-container-low transition-colors text-sm"
                >
                  <ChatIcon app={c.company.chat.app} size={20} /> {c.company.chat.label}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {c.howSection.steps.map((s, i) => (
                <div
                  key={s.title}
                  data-reveal="fly-right"
                  style={{ ["--ri"]: i } as CSSProperties}
                  className="card-hover glass-card p-4 rounded-xl"
                >
                  <div className="text-2xl mb-2 card-icon">{s.icon}</div>
                  <h4 className="font-bold text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-on-surface-variant">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Us ── */}
        <section id="why-us" className="py-6 md:py-8 px-5 lg:px-10 bg-surface-container-low">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-4">
              <span className="badge mb-3 block w-fit mx-auto" data-reveal>{c.whyUs.sectionLabel}</span>
              <h2 className="text-[26px] md:text-[30px] font-bold text-on-surface" data-reveal style={{ animationDelay: '80ms' }}>
                {c.whyUs.headline}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              {c.whyUs.reasons.map((r, i) => (
                <div
                  key={r.title}
                  data-reveal="spin"
                  style={{ ["--ri"]: i } as CSSProperties}
                  className={`card-hover glass-card p-4 rounded-xl${r.featured ? ' border-primary/20 border-2 card-featured' : ''}`}
                >
                  <div className="text-xl mb-2 card-icon">{r.icon}</div>
                  <h3 className="font-bold text-sm mb-1">{r.title}</h3>
                  <p className="text-on-surface-variant text-xs">{r.desc}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
              {c.whyUs.stats.map((s, i) => (
                <div
                  key={s.label}
                  data-reveal="flip"
                  style={{ ["--ri"]: i } as CSSProperties}
                  className="card-hover glass-card p-3 rounded-xl"
                >
                  <div className="text-lg font-extrabold text-primary">
                    <CountUp value={s.value} />
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="contact" className="py-6 md:py-8 px-5 lg:px-10">
          <div data-reveal="scale" className="max-w-6xl mx-auto bg-primary dark:bg-gradient-to-br dark:from-[#7a3409] dark:to-[#491f06] rounded-2xl p-8 md:p-10 text-center relative overflow-hidden dark:border dark:border-primary/30">
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at center, white 2px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            ></div>
            {/* light orb trôi theo scroll */}
            <div
              className="scroll-orb scroll-orb--screen"
              data-parallax="0.22"
              style={{ width: '420px', height: '420px', top: '-30%', left: '8%', background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 64%)' }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <h2 className="text-[26px] md:text-[34px] font-extrabold text-white mb-3">
                {c.cta.headline}
              </h2>
              <p className="text-white/75 text-sm max-w-lg mx-auto mb-5">{c.cta.subtext}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="btn-shine cta-pulse inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-surface-container-low"
                >
                  {c.ui.ctaBtn1}
                </button>
                <a
                  href={c.company.chat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 text-white border-2 border-white/30 px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
                >
                  <ChatIcon app={c.company.chat.app} size={20} /> {c.company.chat.label}
                </a>
              </div>
              <div className="flex justify-center mt-4">
                <a
                  href={`mailto:${c.company.email}`}
                  className="text-white/60 hover:text-white text-xs transition-colors"
                >
                  ✉️ {c.company.email}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gradient-to-b from-surface to-surface-container-low border-t border-outline-variant/40">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 pt-10 pb-8">

          {/* ── Mobile: stacked clean layout / Desktop: 4-col grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">

            {/* Col 1: Brand */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/logo-gg.png" alt={c.company.name} className="h-12 w-auto flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-[15px] text-primary leading-tight">{c.company.name}</div>
                  <div className="text-[11px] text-primary/60 tracking-wide mt-0.5">{c.company.tagline}</div>
                </div>
              </div>
              <p className="text-[13px] text-on-surface/60 leading-relaxed mb-4 max-w-[240px] whitespace-pre-line">
                {c.ui.footerDesc}
              </p>

              {/* Contact — mobile only (inline row) */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 md:hidden">
                <a href={`mailto:${c.company.email}`} className="text-xs text-on-surface/60 hover:text-primary transition-colors flex items-center gap-1">
                  <span>✉️</span> {c.company.email}
                </a>
                <a href={c.company.chat.url} target="_blank" rel="noopener noreferrer" className="text-xs text-on-surface/60 hover:text-primary transition-colors flex items-center gap-1.5">
                  <ChatIcon app={c.company.chat.app} size={14} /> {c.company.chat.label}
                </a>
              </div>

              {/* Legal info */}
              <div className="border-t border-primary/10 pt-4 space-y-1">
                <p className="text-xs font-bold text-on-surface/75 leading-snug">Công ty TNHH MTV Thế Hệ Vàng Việt Nam</p>
                <p className="text-xs text-on-surface/50">MST: 0111274327</p>
                <p className="text-xs text-on-surface/50 leading-relaxed">Số 4/146 Phạm Ngọc Thạch, Đống Đa, Hà Nội</p>
              </div>
            </div>

            {/* Mobile: 2-col grid for links */}
            <div className="grid grid-cols-2 gap-6 md:contents">

              {/* Col 2: Solutions */}
              <div>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-primary mb-3">
                  {c.ui.footerColSolutions}
                </h4>
                <ul className="space-y-2">
                  {c.footerSolutions.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} className="text-sm text-on-surface/70 hover:text-primary transition-colors">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Navigation */}
              <div>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-primary mb-3">
                  {c.ui.footerColNav}
                </h4>
                <ul className="space-y-2">
                  {c.nav.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="text-sm text-on-surface/70 hover:text-primary transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Col 4: Contact — desktop only */}
            <div className="hidden md:block">
              <h4 className="font-bold text-[11px] uppercase tracking-widest text-primary mb-3">
                {c.ui.footerColContact}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href={`mailto:${c.company.email}`} className="text-sm text-on-surface/70 hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>✉️</span> {c.company.email}
                  </a>
                </li>
                <li>
                  <a href={c.company.chat.url} target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface/70 hover:text-primary transition-colors flex items-center gap-1.5">
                    <ChatIcon app={c.company.chat.app} size={16} /> {c.company.chat.label}
                  </a>
                </li>
                <li className="text-sm text-on-surface/70 flex items-start gap-1.5">
                  <span className="mt-0.5">📍</span> {c.company.address}
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary/10">
          <div className="max-w-6xl mx-auto px-5 lg:px-10 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-[11px] text-on-surface/45">{c.ui.copyright}</p>
            <div className="flex gap-5">
              <a href="/chinh-sach-bao-mat" className="text-[11px] text-on-surface/50 hover:text-primary transition-colors">
                {c.ui.privacy}
              </a>
              <a href="/dieu-khoan-dich-vu" className="text-[11px] text-on-surface/50 hover:text-primary transition-colors">
                {c.ui.terms}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Scroll to top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={c.ui.scrollTop}
        className={[
          'fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full bg-primary text-on-primary gg-btn-primary shadow-lg flex items-center justify-center transition-all duration-300',
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
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
