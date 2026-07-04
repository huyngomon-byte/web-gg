'use client'

import { useState } from 'react'
import { BrandFooter } from '../components/BrandFooter'
import { BookingModal } from '../components/BookingModal'
import { getLocalizedSiteSettings } from '../cms/siteSettings'
import type { CmsSiteSettings } from '../cms/types'

interface Section {
  title: string
  content: React.ReactNode
}

interface LegalPageProps {
  title: string
  sections: Section[]
  siteSettings?: CmsSiteSettings | null
}

function LegalPage({ title, sections, siteSettings }: LegalPageProps) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const { header } = getLocalizedSiteSettings(siteSettings, 'vi')
  const showHeaderCopy = Boolean(header.brandName.trim() || header.tagline.trim())

  return (
    <>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} lang="vi" />
      {/* Navbar minimal */}
      <header className="fixed w-full top-0 z-50 bg-surface/92 border-b border-outline-variant/30 shadow-sm">
        <nav className="flex justify-between items-center px-5 lg:px-10 max-w-6xl mx-auto h-14">
          <a href="/" className="flex items-center gap-2.5">
            {header.logoSrc && <img src={header.logoSrc} alt={header.logoAlt || header.brandName} className="h-16 w-auto" />}
            {showHeaderCopy && (
              <div className="hidden sm:block">
                {header.brandName && <div className="font-extrabold text-base text-primary leading-tight">{header.brandName}</div>}
                {header.tagline && <div className="text-[10px] text-on-surface/50 tracking-wider uppercase">{header.tagline}</div>}
              </div>
            )}
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              className="text-sm font-semibold text-primary hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              ← Trang chủ
            </a>
          </div>
        </nav>
      </header>

      <main className="pt-14 bg-gradient-to-b from-[#fff5f7] via-surface to-surface-container-low">
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-5 lg:px-10 pt-12 pb-6">
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 bg-secondary-container/20 text-secondary">
            The One - GG99 · GG99.vn
          </div>
          <h1 className="bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-[26px] font-extrabold leading-tight text-transparent md:text-[34px]">{title}</h1>
          <p className="text-sm text-on-surface/50 mt-2">
            Cập nhật: tháng 5/2026 · Công ty TNHH MTV Thế Hệ Vàng Việt Nam
          </p>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-5 lg:px-10 pb-16">
          <div className="bg-surface/70 backdrop-blur-sm rounded-2xl border border-outline-variant/40 p-6 md:p-10 space-y-8">
            {sections.map((s, i) => (
              <div key={i}>
                <h2 className="text-base font-bold text-primary mb-3 flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary-container/20 text-secondary text-[11px] font-extrabold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {s.title}
                </h2>
                <div className="text-sm text-on-surface/75 leading-relaxed pl-8 space-y-2">
                  {s.content}
                </div>
              </div>
            ))}
          </div>

          {/* Company info */}
          <div className="mt-6 px-6 py-4 rounded-xl border border-outline-variant/40 bg-surface/80">
            <p className="text-[11px] font-bold text-on-surface/70 uppercase tracking-wide mb-1">
              Công ty TNHH MTV Thế Hệ Vàng Việt Nam
            </p>
            <p className="text-xs text-on-surface/55 leading-relaxed">
              MST: 0111274327
            </p>
            <p className="text-xs text-on-surface/55 leading-relaxed">
              Địa chỉ: Số 4/146 đường Phạm Ngọc Thạch, Phường Đống Đa, Thành phố Hà Nội, Việt Nam
            </p>
            <p className="text-xs text-on-surface/55 mt-0.5">Email: smooth@gg99.vn</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href="/"
              className="px-6 py-2.5 rounded-xl border-2 border-primary/20 text-sm font-semibold text-primary hover:bg-surface-container-low transition-colors"
            >
              ← Quay lại trang chủ
            </a>
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary gg-btn-primary text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Liên hệ tư vấn →
            </button>
          </div>
        </div>
      </main>

      <BrandFooter siteSettings={siteSettings} />
    </>
  )
}

/* ─── Privacy Policy ────────────────────────────────── */
export function PrivacyPage({ siteSettings }: { siteSettings?: CmsSiteSettings | null }) {
  return (
    <LegalPage
      siteSettings={siteSettings}
      title="Chính sách bảo mật"
      sections={[
        {
          title: 'Thông tin chúng tôi thu thập',
          content: (
            <>
              <p>Khi người dùng liên hệ, đăng ký tư vấn hoặc đặt lịch tư vấn trên website, chúng tôi có thể thu thập:</p>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>Họ tên, số điện thoại, email</li>
                <li>Tên công ty/thương hiệu</li>
                <li>Nội dung cần tư vấn, thời gian đặt lịch</li>
                <li>Thông tin người dùng chủ động cung cấp</li>
              </ul>
              <p className="mt-2">Website cũng có thể ghi nhận một số thông tin kỹ thuật cơ bản như trình duyệt, thiết bị, thời gian truy cập để cải thiện trải nghiệm người dùng.</p>
            </>
          ),
        },
        {
          title: 'Mục đích sử dụng thông tin',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Liên hệ tư vấn và hỗ trợ khách hàng</li>
              <li>Xác nhận lịch tư vấn</li>
              <li>Gửi báo giá, đề xuất dịch vụ hoặc tài liệu liên quan</li>
              <li>Chăm sóc khách hàng và xử lý yêu cầu/khiếu nại</li>
              <li>Cải thiện chất lượng website và dịch vụ</li>
              <li>Thực hiện nghĩa vụ pháp lý nếu có yêu cầu từ cơ quan có thẩm quyền</li>
            </ul>
          ),
        },
        {
          title: 'Lưu trữ và bảo mật thông tin',
          content: (
            <>
              <p>Chúng tôi lưu trữ thông tin trong thời gian cần thiết cho mục đích tư vấn, chăm sóc khách hàng, quản lý hợp đồng hoặc theo quy định pháp luật.</p>
              <p className="mt-2">The One - GG99 áp dụng các biện pháp phù hợp để bảo vệ thông tin cá nhân. Tuy nhiên, việc truyền tải dữ liệu qua Internet không thể bảo đảm an toàn tuyệt đối trong mọi trường hợp.</p>
            </>
          ),
        },
        {
          title: 'Chia sẻ thông tin',
          content: (
            <>
              <p>Chúng tôi không bán hoặc trao đổi thông tin cá nhân của người dùng cho bên thứ ba.</p>
              <p className="mt-2">Thông tin có thể được chia sẻ trong phạm vi cần thiết với nhân sự nội bộ, đơn vị hỗ trợ kỹ thuật, công cụ đặt lịch, email, CRM hoặc đối tác liên quan để phục vụ tư vấn/cung cấp dịch vụ.</p>
            </>
          ),
        },
        {
          title: 'Quyền của người dùng',
          content: (
            <>
              <p>Người dùng có quyền yêu cầu kiểm tra, chỉnh sửa, cập nhật hoặc xóa thông tin cá nhân đã cung cấp, trừ trường hợp pháp luật yêu cầu tiếp tục lưu trữ.</p>
              <p className="mt-2">Mọi yêu cầu vui lòng gửi về: <a href="mailto:smooth@gg99.vn" className="text-primary underline underline-offset-2">smooth@gg99.vn</a></p>
            </>
          ),
        },
        {
          title: 'Cookie và liên kết bên thứ ba',
          content: (
            <>
              <p>Website có thể sử dụng cookie hoặc công cụ phân tích để cải thiện trải nghiệm người dùng và đo lường hiệu quả website.</p>
              <p className="mt-2">Website cũng có thể chứa liên kết đến các nền tảng như Google Calendar, Zalo hoặc mạng xã hội. Người dùng nên tham khảo chính sách riêng của các nền tảng đó khi truy cập.</p>
            </>
          ),
        },
        {
          title: 'Thay đổi chính sách',
          content: (
            <p>Chúng tôi có thể cập nhật Chính sách bảo mật này khi cần thiết. Phiên bản mới sẽ được đăng tải trên website và có hiệu lực kể từ ngày cập nhật.</p>
          ),
        },
      ]}
    />
  )
}

/* ─── Terms of Service ──────────────────────────────── */
export function TermsPage({ siteSettings }: { siteSettings?: CmsSiteSettings | null }) {
  return (
    <LegalPage
      siteSettings={siteSettings}
      title="Điều khoản sử dụng"
      sections={[
        {
          title: 'Mục đích website',
          content: (
            <>
              <p>Website GG99.vn được sử dụng để giới thiệu thông tin về The One - GG99 và các dịch vụ:</p>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>Ecommerce Operation</li>
                <li>Social Growth</li>
                <li>Business Operation</li>
                <li>Website & Digital System</li>
                <li>Tư vấn, vận hành, marketing và các giải pháp hỗ trợ tăng trưởng doanh nghiệp</li>
              </ul>
              <p className="mt-2">Thông tin trên website chỉ mang tính giới thiệu và tham khảo. Nội dung dịch vụ chi tiết, phạm vi, chi phí và trách nhiệm các bên sẽ được xác lập trong hợp đồng hoặc thỏa thuận riêng.</p>
            </>
          ),
        },
        {
          title: 'Đăng ký tư vấn',
          content: (
            <>
              <p>Người dùng có thể gửi thông tin liên hệ hoặc đặt lịch tư vấn thông qua website.</p>
              <p className="mt-2">Việc gửi form hoặc đặt lịch không đồng nghĩa với việc hai bên đã giao kết hợp đồng. Hợp đồng chỉ được xác lập khi có xác nhận, báo giá hoặc thỏa thuận riêng giữa The One - GG99 và khách hàng.</p>
            </>
          ),
        },
        {
          title: 'Trách nhiệm của người dùng',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Cung cấp thông tin chính xác khi liên hệ</li>
              <li>Không sử dụng website cho mục đích gian lận, phá hoại, spam hoặc vi phạm pháp luật</li>
              <li>Không sao chép, sử dụng trái phép nội dung, hình ảnh hoặc giao diện website</li>
              <li>Không yêu cầu The One - GG99 thực hiện các công việc vi phạm pháp luật hoặc quyền lợi bên thứ ba</li>
            </ul>
          ),
        },
        {
          title: 'Giá dịch vụ và thanh toán',
          content: (
            <p>Mọi thông tin về giá trên website chỉ mang tính tham khảo. Giá thực tế phụ thuộc vào phạm vi công việc, thời gian và yêu cầu cụ thể. Phương thức thanh toán, tiến độ và các điều kiện tài chính sẽ được quy định trong báo giá hoặc hợp đồng riêng.</p>
          ),
        },
        {
          title: 'Hủy, hoàn phí và thay đổi dịch vụ',
          content: (
            <>
              <p>Do đặc thù dịch vụ tư vấn, vận hành, thiết kế và marketing được triển khai theo yêu cầu riêng, chính sách hủy và hoàn phí sẽ áp dụng theo từng hợp đồng cụ thể.</p>
              <p className="mt-2">Nếu phát sinh công việc ngoài phạm vi đã thống nhất, hai bên sẽ trao đổi và xác nhận phụ lục bổ sung trước khi thực hiện.</p>
            </>
          ),
        },
        {
          title: 'Sở hữu trí tuệ',
          content: (
            <>
              <p>Nội dung trên website — văn bản, hình ảnh, logo, giao diện, thiết kế — thuộc quyền sở hữu hoặc quyền sử dụng hợp pháp của The One - GG99.</p>
              <p className="mt-2">Người dùng không được sao chép, chỉnh sửa hoặc sử dụng lại các nội dung này cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.</p>
            </>
          ),
        },
        {
          title: 'Miễn trừ trách nhiệm',
          content: (
            <p>The One - GG99 nỗ lực đảm bảo thông tin chính xác nhưng không cam kết đầy đủ trong mọi trường hợp. Chúng tôi không chịu trách nhiệm đối với thiệt hại từ việc sử dụng sai thông tin, lỗi kỹ thuật, gián đoạn hệ thống hoặc nội dung từ website bên thứ ba được liên kết.</p>
          ),
        },
        {
          title: 'Khiếu nại và liên hệ',
          content: (
            <>
              <p>Mọi thắc mắc, yêu cầu hoặc khiếu nại vui lòng liên hệ: <a href="mailto:smooth@gg99.vn" className="text-primary underline underline-offset-2">smooth@gg99.vn</a></p>
              <p className="mt-2">The One - GG99 sẽ tiếp nhận và phản hồi trong thời gian hợp lý. Hai bên ưu tiên giải quyết tranh chấp thông qua trao đổi thiện chí.</p>
            </>
          ),
        },
        {
          title: 'Thay đổi điều khoản',
          content: (
            <p>The One - GG99 có thể cập nhật Điều khoản sử dụng này khi cần thiết. Phiên bản mới sẽ được đăng tải trên website và có hiệu lực kể từ ngày cập nhật.</p>
          ),
        },
      ]}
    />
  )
}
