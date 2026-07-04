'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import { BookingModal } from '../components/BookingModal'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useCardSpotlight } from '../hooks/useCardSpotlight'
import { useScrollParallax } from '../hooks/useScrollParallax'
import { ChatIcon, type ChatApp } from '../components/ChatIcon'
import { BrandFooter } from '../components/BrandFooter'
import { getLocalizedSiteSettings } from '../cms/siteSettings'
import type { CmsSiteSettings } from '../cms/types'

type AboutLang = 'vi' | 'en'

const content = {
  vi: {
    seo: {
      title: 'Giới thiệu The One - GG99 - GG99',
      description: 'Tìm hiểu về The One - GG99 - GG99, đơn vị đồng hành cùng doanh nghiệp trong vận hành, tối ưu chi phí, ecommerce, marketing và quản trị dữ liệu.',
    },
    navLinks: [
      { label: 'The One Packages', href: '/packages' },
      { label: 'The One Story', href: '/about' },
      { label: 'The One Stories', href: '/the-one' },
    ],
    tagline: 'Đối tác vận hành & tăng trưởng',
    navCta: 'Đặt lịch tư vấn',
    chat: { app: 'zalo' as ChatApp, url: 'https://zalo.me/0965650416', label: 'Zalo' },
    heroBadge: 'Về The One - GG99',
    heroTitle1: 'Giới thiệu',
    heroTitle2: 'The One - GG99',
    heroSub: 'We build better ways for businesses to grow.',
    heroDesc: 'The One - GG99 được thành lập với mục tiêu đồng hành cùng các doanh nghiệp trong quá trình vận hành, tối ưu và tăng trưởng. Thông qua hệ sinh thái GG99, chúng tôi giúp doanh nghiệp nhìn rõ vấn đề, chuẩn hóa quy trình, kiểm soát nguồn lực và đưa ra quyết định dựa trên dữ liệu thực tế.',
    stats: [
      { val: '50+', label: 'Dự án triển khai' },
      { val: '30+', label: 'Doanh nghiệp đồng hành' },
      { val: '6', label: 'Lĩnh vực vận hành' },
    ],
    storyBadge: 'Câu chuyện của chúng tôi',
    storyTitle1: 'Bắt đầu từ một',
    storyTitle2: 'câu hỏi đơn giản',
    storyQuote: '"Làm thế nào để doanh nghiệp vận hành gọn hơn, hiệu quả hơn và ít phụ thuộc vào cảm tính hơn?"',
    storyP1: 'Rất nhiều doanh nghiệp có sản phẩm tốt, đội ngũ tốt và tiềm năng tăng trưởng lớn — nhưng lại gặp khó khăn trong quản lý công việc hằng ngày: dữ liệu rời rạc, quy trình thiếu rõ ràng, chi phí khó kiểm soát, nhân sự chồng chéo và các kênh bán hàng chưa được tối ưu đồng bộ.',
    storyP2: 'Chúng tôi tạo ra GG99 để trở thành một đối tác đồng hành cùng doanh nghiệp trong hành trình đó — không chỉ tư vấn, mà còn cùng phân tích, triển khai và tối ưu theo từng giai đoạn phát triển.',
    beliefBadge: 'Triết lý',
    beliefTitle: 'Chúng tôi tin vào điều gì?',
    beliefDesc: 'Tăng trưởng bền vững không chỉ đến từ việc bán được nhiều hơn — mà còn đến từ việc xây dựng một hệ thống vận hành rõ ràng hơn. Công nghệ, marketing hay dashboard không phải đích đến cuối cùng. Chúng là công cụ để doanh nghiệp vận hành rõ hơn, nhanh hơn và có cơ sở hơn.',
    beliefs: [
      { icon: '🔍', label: 'Rõ ràng trong vận hành', desc: 'Hệ thống rõ ràng tạo ra nền tảng cho mọi quyết định.' },
      { icon: '📊', label: 'Dữ liệu hỗ trợ quyết định', desc: 'Số liệu thực tế thay thế cảm tính trong từng bước.' },
      { icon: '⚖️', label: 'Tối ưu theo quy mô', desc: 'Giải pháp phù hợp từng giai đoạn, không áp đặt mô hình cứng.' },
      { icon: '🔧', label: 'Triển khai thực tế', desc: 'Không chỉ tư vấn — chúng tôi cùng xây và vận hành.' },
      { icon: '🤝', label: 'Đồng hành dài hạn', desc: 'Mối quan hệ đối tác bền vững hơn là dự án một lần.' },
    ],
    howBadge: 'Quy trình',
    howTitle: 'Cách The One - GG99 làm việc',
    steps: [
      { num: '01', icon: '🔍', title: 'Hiểu hiện trạng', desc: 'Lắng nghe và phân tích cách doanh nghiệp đang thực sự vận hành, không dựa trên giả định.' },
      { num: '02', icon: '🎯', title: 'Xác định điểm nghẽn', desc: 'Tìm ra đúng chỗ đang mất thời gian, chi phí và hiệu suất trong hệ thống.' },
      { num: '03', icon: '🔧', title: 'Thiết kế giải pháp', desc: 'Xây dựng mô hình vận hành phù hợp với giai đoạn và nguồn lực thực tế của doanh nghiệp.' },
      { num: '04', icon: '⚙️', title: 'Đồng hành tối ưu', desc: 'Cùng vận hành, đo KPI và cải thiện liên tục — không rời đi sau khi bàn giao.' },
    ],
    diffBadge: 'Điểm khác biệt',
    diffTitle1: 'Điều làm chúng tôi',
    diffTitle2: 'khác biệt',
    diffP1: 'The One - GG99 không chỉ nhìn doanh nghiệp qua từng phần riêng lẻ như marketing, website, nhân sự hay dữ liệu. Chúng tôi nhìn doanh nghiệp như một',
    diffBold: 'hệ thống tổng thể',
    diffP1end: ', nơi mỗi hoạt động đều có liên kết với nhau.',
    diffP2: 'Từ cách chi tiền, cách phân bổ nhân sự, cách vận hành kênh bán hàng đến cách theo dõi hiệu quả cuối cùng — tất cả được kết nối và tối ưu cùng một lúc.',
    whoBadge: 'Đối tượng',
    whoTitle: 'Chúng tôi đồng hành cùng ai?',
    who: [
      { icon: '🛒', label: 'Doanh nghiệp đang phát triển ecommerce' },
      { icon: '⚙️', label: 'Đội ngũ cần chuẩn hóa quy trình' },
      { icon: '📊', label: 'Chủ doanh nghiệp cần dashboard quản trị' },
      { icon: '💰', label: 'Công ty muốn tối ưu chi phí' },
      { icon: '🤝', label: 'Doanh nghiệp cần đối tác vận hành dài hạn' },
    ],
    visionBadge: 'Tầm nhìn',
    visionTitle: 'Tầm nhìn của chúng tôi',
    visionHighlight: 'đối tác vận hành và tăng trưởng đáng tin cậy',
    visionP1: 'The One - GG99 hướng tới việc trở thành',
    visionP1end: 'cho các doanh nghiệp hiện đại.',
    visionP2: 'Chúng tôi mong muốn giúp nhiều doanh nghiệp Việt Nam xây dựng được hệ thống quản trị rõ ràng hơn, ra quyết định tốt hơn và phát triển bền vững hơn.',
    ctaTitle: 'Bắt đầu từ một cuộc trò chuyện',
    ctaDesc: 'Mỗi doanh nghiệp đều có một bài toán riêng. Hãy bắt đầu bằng một buổi trao đổi để cùng The One - GG99 tìm ra hướng triển khai phù hợp.',
    ctaBtn: 'Đặt lịch tư vấn miễn phí →',
    footerLinks: [
      { label: 'Trang chủ', href: '/' },
      { label: 'Giải pháp', href: '/#solutions' },
      { label: 'Giới thiệu', href: '/gioi-thieu' },
      { label: 'Liên hệ', href: '/#contact' },
    ],
    copyright: '© 2026 The One - GG99',
  },
  en: {
    seo: {
      title: 'About The One - GG99 - GG99',
      description: 'Learn about The One - GG99 - GG99, your partner in business operations, cost optimization, ecommerce, marketing and data management.',
    },
    navLinks: [
      { label: 'The One Packages', href: '/en/packages' },
      { label: 'The One Story', href: '/en/about' },
      { label: 'The One Stories', href: '/en/the-one' },
    ],
    tagline: 'Operations & Growth Partner',
    navCta: 'Call Your Shot',
    chat: { app: 'whatsapp' as ChatApp, url: 'https://wa.me/84965650416', label: 'WhatsApp' },
    heroBadge: 'About The One - GG99',
    heroTitle1: 'About',
    heroTitle2: 'The One - GG99',
    heroSub: 'We build better ways for businesses to grow.',
    heroDesc: 'The One - GG99 was founded with the mission of partnering with businesses through their operations, optimization, and growth journey. Through the GG99 ecosystem, we help businesses gain clarity on their challenges, standardize processes, control resources, and make decisions based on real data.',
    stats: [
      { val: '50+', label: 'Projects delivered' },
      { val: '30+', label: 'Businesses partnered' },
      { val: '6', label: 'Operation areas' },
    ],
    storyBadge: 'Our Story',
    storyTitle1: 'It started with',
    storyTitle2: 'a simple question',
    storyQuote: '"How can businesses operate leaner, smarter, and with less guesswork?"',
    storyP1: 'Many businesses have great products, strong teams, and real growth potential — yet struggle with day-to-day management: fragmented data, unclear processes, hard-to-control costs, overlapping roles, and sales channels that aren\'t running in sync.',
    storyP2: 'We built GG99 to be a true operational partner on that journey — not just advising, but analyzing, implementing, and optimizing alongside you at every stage of growth.',
    beliefBadge: 'Our Philosophy',
    beliefTitle: 'What do we believe in?',
    beliefDesc: 'Sustainable growth isn\'t just about selling more — it\'s about building a clearer operating system. Technology, marketing, and dashboards aren\'t the end goal. They\'re tools that help businesses run clearer, faster, and with more confidence.',
    beliefs: [
      { icon: '🔍', label: 'Operational clarity', desc: 'A clear system is the foundation for every good decision.' },
      { icon: '📊', label: 'Data-driven decisions', desc: 'Real numbers replace guesswork at every step.' },
      { icon: '⚖️', label: 'Optimize by scale', desc: 'Solutions fit each stage — no one-size-fits-all model.' },
      { icon: '🔧', label: 'Real implementation', desc: 'Not just consulting — we build and run alongside you.' },
      { icon: '🤝', label: 'Long-term partnership', desc: 'Lasting partnerships matter more than one-off projects.' },
    ],
    howBadge: 'Our Process',
    howTitle: 'How The One - GG99 works',
    steps: [
      { num: '01', icon: '🔍', title: 'Understand current state', desc: 'Listen and analyze how your business actually operates today — no assumptions.' },
      { num: '02', icon: '🎯', title: 'Identify bottlenecks', desc: 'Pinpoint exactly where time, money, and efficiency are being lost in the system.' },
      { num: '03', icon: '🔧', title: 'Design the solution', desc: 'Build an operating model suited to your current stage and real resources.' },
      { num: '04', icon: '⚙️', title: 'Implement & optimize together', desc: 'Co-run operations, track KPIs, and continuously improve — we don\'t hand off and leave.' },
    ],
    diffBadge: 'What Sets Us Apart',
    diffTitle1: 'What makes us',
    diffTitle2: 'different',
    diffP1: 'The One - GG99 doesn\'t view businesses through isolated lenses — marketing here, website there, HR somewhere else. We see the business as',
    diffBold: 'one connected system',
    diffP1end: ', where every activity links to the next.',
    diffP2: 'From how money is spent, how people are allocated, how sales channels run, to how performance is tracked — everything is connected and optimized together.',
    whoBadge: 'Who We Serve',
    whoTitle: 'Who do we partner with?',
    who: [
      { icon: '🛒', label: 'Businesses growing their ecommerce' },
      { icon: '⚙️', label: 'Teams that need process standardization' },
      { icon: '📊', label: 'Founders who need a management dashboard' },
      { icon: '💰', label: 'Companies looking to optimize costs' },
      { icon: '🤝', label: 'Businesses that need a long-term ops partner' },
    ],
    visionBadge: 'Our Vision',
    visionTitle: 'Our vision',
    visionHighlight: 'the most trusted operations & growth partner',
    visionP1: 'The One - GG99 aims to become',
    visionP1end: 'for modern businesses.',
    visionP2: 'We want to help more Vietnamese businesses build clearer management systems, make better decisions, and grow sustainably.',
    ctaTitle: 'Start with a conversation',
    ctaDesc: 'Every business has its own puzzle. Let\'s start with a quick chat so The One - GG99 can find the right path forward for you.',
    ctaBtn: 'Call Your Shot',
    footerLinks: [
      { label: 'Home', href: '/en' },
      { label: 'Solutions', href: '/en#solutions' },
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/en#contact' },
    ],
    copyright: '© 2026 The One - GG99',
  },
}

export default function AboutTemplate({ lang, siteSettings }: { lang: AboutLang; siteSettings?: CmsSiteSettings | null }) {
  const c = content[lang]
  const { header } = getLocalizedSiteSettings(siteSettings, lang)
  const showHeaderCopy = Boolean(header.brandName.trim() || header.tagline.trim())
  const [bookingOpen, setBookingOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useScrollReveal()
  useCardSpotlight()
  useScrollParallax()

  useEffect(() => {
    document.title = c.seo.title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', c.seo.description)
    document.documentElement.lang = lang
  }, [lang, c.seo])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const viAboutHref = '/gioi-thieu'
  const enAboutHref = '/about'

  return (
    <>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} lang={lang} />

      {/* ── Navbar ── */}
      <header className="fixed w-full top-0 z-50 bg-surface/92 border-b border-outline-variant/30 shadow-sm">
        <nav className="flex justify-between items-center px-5 lg:px-10 max-w-6xl mx-auto h-14">
          <a href={lang === 'en' ? '/en' : '/'} className="flex items-center gap-2.5">
            {header.logoSrc && <img src={header.logoSrc} alt={header.logoAlt || header.brandName} className="h-16 w-auto" />}
            {showHeaderCopy && (
              <div className="hidden sm:block">
                {header.brandName && <div className="font-extrabold text-base text-primary leading-tight">{header.brandName}</div>}
                {header.tagline && <div className="text-[10px] text-on-surface-variant tracking-wider uppercase opacity-70">{header.tagline}</div>}
              </div>
            )}
          </a>
          <div className="hidden md:flex items-center gap-7">
            {c.navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  (lang === 'vi' && link.href === '/about') ||
                  (lang === 'en' && link.href === '/en/about')
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* VI/EN switcher */}
            <div className="flex items-center gap-0.5 text-[11px] font-extrabold tracking-wider whitespace-nowrap">
              <a
                href={viAboutHref}
                className={`px-1.5 sm:px-2 py-1 rounded-md transition-colors ${
                  lang === 'vi' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                VI
              </a>
              <span className="text-on-surface-variant/30 select-none">|</span>
              <a
                href={enAboutHref}
                className={`px-1.5 sm:px-2 py-1 rounded-md transition-colors ${
                  lang === 'en' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                EN
              </a>
              <span className="text-on-surface-variant/30 select-none">|</span>
              <a
                href="/ko"
                className="px-1.5 sm:px-2 py-1 rounded-md transition-colors text-on-surface-variant hover:text-primary"
              >
                <span className="sm:hidden">KR</span>
                <span className="hidden sm:inline">한국어</span>
              </a>
            </div>
            <button
              onClick={() => setBookingOpen(true)}
              className="btn-shine bg-primary text-on-primary gg-btn-primary text-xs px-2.5 py-1.5 sm:text-sm sm:px-4 sm:py-2 rounded-lg font-bold glow-orange hover:opacity-90 whitespace-nowrap"
            >
              {header.ctaLabel || c.navCta}
            </button>
          </div>
        </nav>
      </header>

      <main className="pt-14">
        <section className="relative overflow-hidden py-14 md:py-20 px-5 lg:px-10 bg-gradient-to-b from-surface to-surface-container-low">
          <div className="absolute inset-0 tech-grid opacity-70 pointer-events-none" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />
          <div className="relative max-w-4xl mx-auto">
            <span className="badge mb-4 block w-fit">{c.heroBadge}</span>
            <h1 className="text-[38px] md:text-[60px] font-extrabold text-on-surface leading-[1.08]">
              {lang === 'en' ? 'About The One - GG99' : 'Giới thiệu The One - GG99'}
            </h1>
            <p className="mt-5 text-lg font-bold text-primary">{c.heroSub}</p>
            <p className="mt-4 text-[15px] md:text-base text-on-surface-variant leading-relaxed max-w-3xl">
              {c.heroDesc}
            </p>
          </div>
        </section>

        {/* ── Our Story ── */}
        <section className="py-16 md:py-20 px-5 lg:px-10">
          <div className="max-w-3xl mx-auto">
            <span className="badge mb-4 block w-fit">{c.storyBadge}</span>
            <h2 className="text-[28px] md:text-[36px] font-bold text-on-surface leading-tight mb-6">
              {c.storyTitle1}{' '}<span className="text-primary">{c.storyTitle2}</span>
            </h2>
            <blockquote className="border-l-4 border-primary pl-5 mb-6">
              <p className="text-[16px] text-on-surface font-semibold italic leading-relaxed">{c.storyQuote}</p>
            </blockquote>
            <div className="space-y-4 text-[15px] text-on-surface-variant leading-relaxed">
              <p>{c.storyP1}</p>
              <p>{c.storyP2}</p>
            </div>
          </div>
        </section>

        {/* ── What We Believe ── */}
        <section className="py-16 md:py-20 px-5 lg:px-10 bg-gradient-to-b from-surface-container-low to-surface">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <span className="badge mb-3 block w-fit mx-auto">{c.beliefBadge}</span>
              <h2 className="text-[28px] md:text-[34px] font-bold text-on-surface mb-4">{c.beliefTitle}</h2>
              <p className="text-[15px] text-on-surface-variant max-w-2xl mx-auto leading-relaxed">{c.beliefDesc}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {c.beliefs.map((b, i) => (
                <div key={b.label} data-reveal="flip" style={{ ["--ri"]: i } as CSSProperties} className="card-hover glass-card rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-3 card-icon">{b.icon}</div>
                  <h3 className="font-bold text-sm text-on-surface mb-2">{b.label}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How We Work ── */}
        <section className="py-16 md:py-20 px-5 lg:px-10 bg-inverse-surface relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
          <div className="scroll-orb scroll-orb--orange scroll-orb--screen" data-parallax="0.28" style={{ width: '440px', height: '440px', top: '0%', left: '30%' }} aria-hidden="true" />
          <div className="scroll-orb scroll-orb--blue scroll-orb--screen" data-parallax="0.16" style={{ width: '340px', height: '340px', bottom: '-8%', right: '8%' }} aria-hidden="true" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <span className="badge mb-3 block w-fit mx-auto" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffb693' }}>
                {c.howBadge}
              </span>
              <h2 className="text-[28px] md:text-[34px] font-bold text-white">{c.howTitle}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {c.steps.map((s, i) => (
                <div key={s.num} data-reveal="fly-right" style={{ ["--ri"]: i } as CSSProperties} className="card-hover bg-white/[0.07] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.11]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="card-icon w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl flex-shrink-0">{s.icon}</div>
                    <span className="text-[11px] font-extrabold text-primary-fixed-dim tracking-widest">{s.num}</span>
                  </div>
                  <h3 className="font-bold text-white text-[15px] mb-2">{s.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What Makes Us Different ── */}
        <section className="py-16 md:py-20 px-5 lg:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🛒', label: 'Ecommerce', color: 'bg-primary-fixed' },
                  { icon: '📱', label: 'Marketing', color: 'bg-surface-variant' },
                  { icon: '👥', label: 'HR', color: 'bg-surface-variant' },
                  { icon: '💰', label: 'Finance', color: 'bg-primary-fixed' },
                  { icon: '📊', label: 'Dashboard', color: 'bg-surface-variant' },
                  { icon: '🔗', label: lang === 'en' ? 'Connected System' : 'Liên kết hệ thống', color: 'bg-primary-fixed' },
                ].map((item) => (
                  <div key={item.label} className={`${item.color} rounded-xl p-4 flex items-center gap-3`}>
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-bold text-on-surface">{item.label}</span>
                  </div>
                ))}
              </div>
              <div>
                <span className="badge mb-4 block w-fit">{c.diffBadge}</span>
                <h2 className="text-[28px] md:text-[34px] font-bold text-on-surface leading-tight mb-6">
                  {c.diffTitle1}{' '}<span className="text-primary">{c.diffTitle2}</span>
                </h2>
                <p className="text-[15px] text-on-surface-variant leading-relaxed mb-4">
                  {c.diffP1} <strong className="text-on-surface">{c.diffBold}</strong>{c.diffP1end}
                </p>
                <p className="text-[15px] text-on-surface-variant leading-relaxed">{c.diffP2}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who We Work With ── */}
        <section className="py-16 md:py-20 px-5 lg:px-10 bg-gradient-to-b from-surface-container to-surface-container-low">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <span className="badge mb-3 block w-fit mx-auto">{c.whoBadge}</span>
              <h2 className="text-[28px] md:text-[34px] font-bold text-on-surface">{c.whoTitle}</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {c.who.map((w, i) => (
                <div key={w.label} data-reveal="spin" style={{ ["--ri"]: i } as CSSProperties} className="card-hover glass-card rounded-2xl px-6 py-5 flex items-center gap-4">
                  <span className="text-2xl card-icon">{w.icon}</span>
                  <span className="font-semibold text-[15px] text-on-surface">{w.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Vision ── */}
        <section className="py-16 md:py-20 px-5 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="badge mb-4 block w-fit mx-auto">{c.visionBadge}</span>
            <h2 className="text-[28px] md:text-[36px] font-bold text-on-surface mb-6">{c.visionTitle}</h2>
            <div className="rounded-2xl p-8 md:p-10 text-left relative overflow-hidden bg-gradient-to-br from-surface-container-low to-surface-container">
              <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgb(var(--c-primary)), transparent)' }} />
              <p className="text-[16px] md:text-[17px] text-on-surface leading-relaxed font-medium relative z-10">
                {c.visionP1}{' '}
                <span className="text-primary font-bold">{c.visionHighlight}</span>{' '}
                {c.visionP1end}
              </p>
              <p className="text-[15px] text-on-surface-variant leading-relaxed mt-4 relative z-10">{c.visionP2}</p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-10 md:py-14 px-5 lg:px-10">
          <div className="max-w-6xl mx-auto bg-primary rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at center, white 2px, transparent 0)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10">
              <h2 className="text-[26px] md:text-[34px] font-extrabold text-white mb-3">{c.ctaTitle}</h2>
              <p className="text-white/75 text-[15px] max-w-lg mx-auto mb-7 leading-relaxed">{c.ctaDesc}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="btn-shine inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-bold hover:bg-surface-container-low text-[15px]"
                >
                  {c.ctaBtn}
                </button>
                <a
                  href={c.chat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 text-white border-2 border-white/30 px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-colors text-[15px]"
                >
                  <ChatIcon app={c.chat.app} size={20} /> {c.chat.label}
                </a>
              </div>
              <div className="flex justify-center mt-4">
                <a href="mailto:smooth@gg99.vn" className="text-white/60 hover:text-white text-xs transition-colors">
                  ✉️ smooth@gg99.vn
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BrandFooter lang={lang} siteSettings={siteSettings} />

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={[
          'fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full bg-primary text-on-primary gg-btn-primary shadow-lg flex items-center justify-center transition-all duration-300',
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
        ].join(' ')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  )
}
