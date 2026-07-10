import { useState, useEffect, useCallback } from 'react'
import { useRef } from 'react'
import { type Lang } from '../i18n'
import type { CmsLocalizedSiteSettings } from '../cms/types'

/* ─── Types ─────────────────────────────────────────── */
export type BookingModalCopy = Partial<CmsLocalizedSiteSettings['booking']>

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  lang?: Lang
  copy?: BookingModalCopy
}

/* ─── i18n ──────────────────────────────────────────── */
const STR = {
  vi: {
    locale: 'vi-VN',
    title: 'Congratulations - almost there darling!',
    subtitle: 'Schedule your first date with The One.',
    intro: 'Chọn ngày và khung thời gian bạn mong muốn. The One - GG99 sẽ liên hệ để xác nhận lịch tư vấn phù hợp.',
    frameLabel: 'Khung thời gian mong muốn',
    checking: 'Đang kiểm tra lịch…',
    booked: 'Đã kín lịch',
    continue: 'Tiếp tục đăng ký tư vấn →',
    continueDisabled: 'Chọn ngày và khung thời gian để tiếp tục',
    change: 'Đổi',
    name: 'Họ và tên',
    namePh: 'Nguyễn Văn A',
    phone: 'Số điện thoại',
    phonePh: '0912345678',
    phoneTitle: 'Số điện thoại phải đủ 10 chữ số',
    phoneErr: (n: number) => `Cần đủ 10 số (${n}/10)`,
    email: 'Email',
    emailPh: 'email@congty.vn',
    company: 'Tên công ty / doanh nghiệp',
    companyPh: 'Công ty ABC',
    need: 'Nhu cầu tư vấn',
    needPlaceholder: '-- Chọn nhu cầu --',
    note: 'Ghi chú thêm',
    notePh: 'Mô tả ngắn về tình trạng doanh nghiệp hiện tại…',
    back: '‹ Quay lại',
    submit: 'Gửi đăng ký →',
    submitting: 'Đang gửi…',
    errUnknown: 'Lỗi không xác định',
    errGeneric: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    availabilityError: 'Không thể kiểm tra lịch lúc này. Vui lòng thử lại sau.',
    privacyConsent: 'Tôi đồng ý để The One - GG99 sử dụng thông tin này nhằm liên hệ và xác nhận lịch tư vấn.',
    privacyLink: 'Chính sách bảo mật',
    thanks: 'Cảm ơn bạn!',
    success1: 'The One - GG99 đã nhận thông tin đăng ký tư vấn.',
    success2: 'Đội ngũ của chúng tôi sẽ liên hệ lại để xác nhận lịch phù hợp.',
    softCtaLabel: 'Chưa sẵn sàng gọi? Nhắn Zalo làm quen trước đã →',
    softCtaHref: 'https://zalo.me/smoothgg',
    addMore: 'Đăng ký thêm',
    close: 'Đóng',
    days: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    needs: [
      'Tư vấn tổng quát',
      'Vận hành thương mại điện tử (Shopee, TikTok Shop…)',
      'Mạng xã hội & tăng trưởng (TikTok, nội dung, KOC)',
      'Vận hành doanh nghiệp (quy trình, nhân sự)',
      'Website & hệ thống số',
      'Quản trị dữ liệu & bảng báo cáo',
      'Khác',
    ],
  },
  en: {
    locale: 'en-US',
    title: 'Congratulations - almost there darling!',
    subtitle: 'Schedule your first date with The One.',
    intro: 'Choose your preferred date and time. The One - GG99 will reach out to confirm a suitable consultation slot.',
    frameLabel: 'Preferred time slot',
    checking: 'Checking availability…',
    booked: 'Fully booked',
    continue: 'Continue to register →',
    continueDisabled: 'Select a date and time slot to continue',
    change: 'Change',
    name: 'Full name',
    namePh: 'John Smith',
    phone: 'Phone number',
    phonePh: '0912345678',
    phoneTitle: 'Phone number must be 10 digits',
    phoneErr: (n: number) => `Needs 10 digits (${n}/10)`,
    email: 'Email',
    emailPh: 'email@company.com',
    company: 'Company / business name',
    companyPh: 'ABC Company',
    need: 'Consultation need',
    needPlaceholder: '-- Select a need --',
    note: 'Additional note',
    notePh: 'Briefly describe your current business situation…',
    back: '‹ Back',
    submit: 'Submit →',
    submitting: 'Sending…',
    errUnknown: 'Unknown error',
    errGeneric: 'Something went wrong. Please try again.',
    availabilityError: 'Availability could not be checked right now. Please try again later.',
    privacyConsent: 'I agree that The One - GG99 may use this information to contact me and confirm the consultation.',
    privacyLink: 'Privacy policy',
    thanks: 'Thank you!',
    success1: 'The One - GG99 has received your consultation request.',
    success2: 'Our team will contact you to confirm a suitable time.',
    softCtaLabel: 'Not ready to call yet? Say hi on Zalo first →',
    softCtaHref: 'https://zalo.me/smoothgg',
    addMore: 'Book another',
    close: 'Close',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    needs: [
      'General consultation',
      'Ecommerce Operation (Shopee, TikTok Shop…)',
      'Social & Growth (TikTok, Content, KOC)',
      'Business Operation (Process, HR)',
      'Website & Digital System',
      'Data Management & Dashboard',
      'Other',
    ],
  },
  ko: {
    locale: 'ko-KR',
    title: 'Congratulations - almost there darling!',
    subtitle: 'Schedule your first date with The One.',
    intro: '원하시는 날짜와 시간대를 선택하세요. The One - GG99이 적합한 상담 일정을 확인하기 위해 연락드립니다.',
    frameLabel: '희망 시간대',
    checking: '예약 가능 여부 확인 중…',
    booked: '예약 마감',
    continue: '상담 신청 계속하기 →',
    continueDisabled: '계속하려면 날짜와 시간대를 선택하세요',
    change: '변경',
    name: '이름',
    namePh: '홍길동',
    phone: '전화번호',
    phonePh: '01012345678',
    phoneTitle: '전화번호는 숫자 10자리여야 합니다',
    phoneErr: (n: number) => `10자리가 필요합니다 (${n}/10)`,
    email: '이메일',
    emailPh: 'email@company.com',
    company: '회사 / 사업체명',
    companyPh: 'ABC 회사',
    need: '상담 분야',
    needPlaceholder: '-- 상담 분야 선택 --',
    note: '추가 메모',
    notePh: '현재 비즈니스 상황을 간단히 설명해 주세요…',
    back: '‹ 뒤로',
    submit: '신청 제출 →',
    submitting: '전송 중…',
    errUnknown: '알 수 없는 오류',
    errGeneric: '오류가 발생했습니다. 다시 시도해 주세요.',
    availabilityError: '현재 예약 가능 여부를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    privacyConsent: 'The One - GG99이 상담 연락 및 일정 확인을 위해 이 정보를 사용하는 데 동의합니다.',
    privacyLink: '개인정보 처리방침',
    thanks: '감사합니다!',
    success1: 'The One - GG99이 상담 신청 정보를 받았습니다.',
    success2: '저희 팀이 적합한 일정을 확인하기 위해 연락드리겠습니다.',
    softCtaLabel: '아직 통화가 부담스럽다면 Zalo로 먼저 인사해 주세요 →',
    softCtaHref: 'https://zalo.me/smoothgg',
    addMore: '추가 예약',
    close: '닫기',
    days: ['일', '월', '화', '수', '목', '금', '토'],
    needs: [
      '일반 상담',
      'Ecommerce 운영 (Shopee, TikTok Shop…)',
      'Social & Growth (TikTok, Content, KOC)',
      'Business 운영 (프로세스, 인사)',
      'Website & 디지털 시스템',
      '데이터 관리 & 대시보드',
      '기타',
    ],
  },
} as const

type Str = (typeof STR)[Lang]

/* ─── Constants ─────────────────────────────────────── */
const TIME_FRAMES = [
  { id: 'slot_08_10', label: '8-10',   range: '08:00 – 10:00', icon: '🕗' },
  { id: 'slot_10_12', label: '10-12',  range: '10:00 – 12:00', icon: '🕙' },
  { id: 'slot_14_16', label: '14-16',  range: '14:00 – 16:00', icon: '🕑' },
  { id: 'slot_16_18', label: '16-18',  range: '16:00 – 18:00', icon: '🕓' },
  { id: 'slot_20_22', label: '20-22',  range: '20:00 – 22:00', icon: '🕗' },
  { id: 'slot_22_24', label: '22-24',  range: '22:00 – 24:00', icon: '🕙' },
]
/* ─── Helpers ───────────────────────────────────────── */
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function isPast(d: Date) {
  const today = new Date(); today.setHours(0,0,0,0)
  return d < today
}
function isSunday(d: Date) { return d.getDay() === 0 }

function formatDate(ds: string, locale: string) {
  const [y, m, d] = ds.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(locale, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function lockBodyScroll() {
  const body = document.body
  const currentLocks = Number(body.dataset.gg99ScrollLocks ?? '0')

  if (currentLocks === 0) {
    body.dataset.gg99PreviousOverflow = body.style.overflow
  }

  body.dataset.gg99ScrollLocks = String(currentLocks + 1)
  body.style.overflow = 'hidden'

  return () => {
    const remainingLocks = Math.max(0, Number(body.dataset.gg99ScrollLocks ?? '1') - 1)
    if (remainingLocks > 0) {
      body.dataset.gg99ScrollLocks = String(remainingLocks)
      return
    }

    body.style.overflow = body.dataset.gg99PreviousOverflow ?? ''
    delete body.dataset.gg99ScrollLocks
    delete body.dataset.gg99PreviousOverflow
  }
}

/* ─── Calendar ──────────────────────────────────────── */
function CalendarPicker({ selected, onSelect, locale, days }: { selected: string | null; onSelect: (d: string) => void; locale: string; days: readonly string[] }) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const firstDay   = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const atMinMonth  = year === today.getFullYear() && month === today.getMonth()
  const monthLabel = new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  const cells: (Date | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i))

  return (
    <div className="select-none" role="group" aria-label="Choose a consultation date">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={atMinMonth}
          aria-label="Show previous month"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-30"
        ><span aria-hidden="true">‹</span></button>
        <span className="font-bold text-sm text-on-surface capitalize" aria-live="polite" aria-atomic="true">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Show next month"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg text-primary transition-colors hover:bg-surface-container-low"
        ><span aria-hidden="true">›</span></button>
      </div>

      <div className="grid grid-cols-7 mb-1" aria-hidden="true">
        {days.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-primary/50 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={i} aria-hidden="true" />
          const ds = toDateStr(date)
          const disabled = isPast(date) || isSunday(date)
          const isSelected = ds === selected
          const isToday = toDateStr(date) === toDateStr(today)
          return (
            <button
              key={ds}
              type="button"
              onClick={() => !disabled && onSelect(ds)}
              disabled={disabled}
              aria-label={formatDate(ds, locale)}
              aria-pressed={isSelected}
              className={[
                'h-11 w-full rounded-lg text-sm font-medium transition-all',
                disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-surface-container-low cursor-pointer',
                isSelected ? '!bg-primary !text-on-primary shadow-md' : '',
                isToday && !isSelected ? 'ring-1 ring-primary/40 text-primary font-bold' : '',
                !disabled && !isSelected ? 'text-on-surface' : '',
              ].join(' ')}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main modal ────────────────────────────────────── */
export function BookingModal({ isOpen, onClose, lang = 'en', copy }: BookingModalProps) {
  const base = STR[lang] ?? STR.vi
  const t: Str = {
    ...base,
    title: copy?.title || base.title,
    subtitle: copy?.subtitle || base.subtitle,
    intro: copy?.intro || base.intro,
    frameLabel: copy?.frameLabel || base.frameLabel,
    continue: copy?.continueLabel || base.continue,
    continueDisabled: copy?.continueDisabledLabel || base.continueDisabled,
    submit: copy?.submitLabel || base.submit,
    thanks: copy?.successTitle || base.thanks,
    success1: copy?.successMessage || base.success1,
    success2: copy?.successFollowup || base.success2,
    softCtaLabel: copy?.softCtaLabel || base.softCtaLabel,
    softCtaHref: copy?.softCtaHref || base.softCtaHref,
    needs: copy?.needs?.length ? copy.needs : base.needs,
  } as Str
  const [step, setStep]         = useState<1 | 2 | 3>(1)
  const [selectedDate, setDate] = useState<string | null>(null)
  const [selectedFrame, setFrame] = useState<string | null>(null)
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [availLoading, setAvailLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')

  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', need: '', note: '' })
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const startedAtRef = useRef(Date.now())
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const successHeadingRef = useRef<HTMLHeadingElement>(null)
  const previousStepRef = useRef(step)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    startedAtRef.current = Date.now()
    setIdempotencyKey(crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  }, [isOpen])

  // Fetch availability when date changes
  useEffect(() => {
    if (!selectedDate) return
    const controller = new AbortController()
    setAvailability({})
    setAvailabilityError('')
    setAvailLoading(true)
    fetch(`/api/availability?date=${selectedDate}`, {
      signal: controller.signal,
    })
      .then(async r => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(data.error || t.availabilityError)
        return data
      })
      .then(data => {
        const map: Record<string, boolean> = {}
        ;(data.frames ?? []).forEach((f: { id: string; available: boolean }) => {
          map[f.id] = f.available
        })
        setAvailability(map)
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        const map: Record<string, boolean> = {}
        TIME_FRAMES.forEach(f => { map[f.id] = false })
        setAvailability(map)
        setAvailabilityError(err instanceof Error ? err.message : t.availabilityError)
      })
      .finally(() => {
        if (!controller.signal.aborted) setAvailLoading(false)
      })

    return () => controller.abort()
  }, [selectedDate, t.availabilityError])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCloseRef.current()
      return
    }

    if (event.key !== 'Tab') return
    const controls = dialogRef.current
      ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          (control) => control.getClientRects().length > 0,
        )
      : []

    if (controls.length === 0) {
      event.preventDefault()
      dialogRef.current?.focus()
      return
    }

    const first = controls[0]
    const last = controls[controls.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const unlockBodyScroll = lockBodyScroll()
    closeButtonRef.current?.focus()
    const focusDialog = window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(focusDialog)
      document.removeEventListener('keydown', handleKeyDown)
      unlockBodyScroll()
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
      window.requestAnimationFrame(() => {
        if (previouslyFocused?.isConnected) previouslyFocused.focus()
      })
    }
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    const previousStep = previousStepRef.current
    previousStepRef.current = step
    if (!isOpen || previousStep === step) return

    const focusCurrentStep = () => {
      if (step === 2) nameInputRef.current?.focus()
      else if (step === 3) successHeadingRef.current?.focus()
      else closeButtonRef.current?.focus()
    }
    focusCurrentStep()
    const focusStep = window.requestAnimationFrame(focusCurrentStep)
    return () => window.cancelAnimationFrame(focusStep)
  }, [isOpen, step])

  if (!isOpen) return null

  const canContinue = !!selectedDate && !!selectedFrame
  const frameObj = TIME_FRAMES.find(f => f.id === selectedFrame)
  const stepAnnouncement = step === 1
    ? 'Booking step 1 of 2: choose a date and time.'
    : step === 2
      ? 'Booking step 2 of 2: enter your contact details.'
      : 'Booking confirmed.'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate || !selectedFrame || !frameObj) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: selectedDate,
          timeFrame: frameObj.label,
          timeRange: frameObj.range,
          website,
          consent,
          startedAt: startedAtRef.current,
          idempotencyKey,
          challengeToken: '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.errUnknown)
      setStep(3)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : t.errGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep(1); setDate(null); setFrame(null)
    setForm({ name: '', phone: '', email: '', company: '', need: '', note: '' })
    setConsent(false)
    setWebsite('')
    setAvailabilityError('')
    startedAtRef.current = Date.now()
    setIdempotencyKey(crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
    setSubmitError('')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        aria-describedby="booking-modal-description"
        tabIndex={-1}
        className="relative w-full sm:max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[rgba(226,191,176,0.3)] bg-surface/80 backdrop-blur-sm">
          <div>
            <h2 id="booking-modal-title" className="font-extrabold text-base text-on-surface">{t.title}</h2>
            <p id="booking-modal-description" className="text-xs text-primary/70 mt-0.5">{t.subtitle}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xl text-primary transition-colors hover:bg-surface-container-low"
          ><span aria-hidden="true">×</span></button>
        </div>

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {stepAnnouncement}
        </p>

        {/* Step bar */}
        {step < 3 && (
          <div className="flex gap-1.5 px-6 pt-4" aria-hidden="true">
            {[1, 2].map(s => (
              <div key={s} className={['h-1 flex-1 rounded-full transition-all', step >= s ? 'bg-primary' : 'bg-primary/15'].join(' ')} />
            ))}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 76px)' }}>

          {/* ── Step 1: Date + Time frame ── */}
          {step === 1 && (
            <div className="px-6 pb-6 pt-4">
              <p className="text-xs text-on-surface/60 mb-4 leading-relaxed">
                {t.intro}
              </p>

              <CalendarPicker selected={selectedDate} onSelect={(d) => { setDate(d); setFrame(null); setAvailability({}) }} locale={t.locale} days={t.days} />

              {selectedDate && (
                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-primary/60 mb-3">
                    {t.frameLabel} — {formatDate(selectedDate, t.locale)}
                  </div>
                  {availLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-primary/60 text-sm" role="status" aria-live="polite">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                      </svg>
                      {t.checking}
                    </div>
                  ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TIME_FRAMES.map(tf => {
                      const isSel = selectedFrame === tf.id
                      const isBooked = availability[tf.id] === false
                      return (
                        <button
                          key={tf.id}
                          type="button"
                          onClick={() => !isBooked && setFrame(tf.id)}
                          disabled={isBooked}
                          aria-pressed={isSel}
                          aria-label={`${tf.label}, ${isBooked ? t.booked : tf.range}`}
                          className={[
                            'flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all text-center',
                            isBooked
                              ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                              : isSel
                              ? 'bg-primary border-primary text-on-primary shadow-md'
                              : 'border-outline-variant/50 bg-surface hover:border-primary/40 hover:bg-surface-container-low text-on-surface',
                          ].join(' ')}
                        >
                          <span aria-hidden="true" className={['text-2xl', isBooked ? 'grayscale opacity-40' : ''].join(' ')}>{tf.icon}</span>
                          <span className="font-bold text-sm leading-tight">{tf.label}</span>
                          <span className={['text-[10px] leading-tight', isBooked ? 'text-gray-300' : isSel ? 'text-on-primary/80' : 'text-on-surface/50'].join(' ')}>
                            {isBooked ? t.booked : tf.range}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  )}
                  {availabilityError && (
                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700" role="alert">
                      {availabilityError}
                    </p>
                  )}
                </div>
              )}

              {t.softCtaLabel && t.softCtaHref && (
                <a
                  href={t.softCtaHref}
                  target={/^https?:\/\//i.test(t.softCtaHref) ? '_blank' : undefined}
                  rel={/^https?:\/\//i.test(t.softCtaHref) ? 'noreferrer' : undefined}
                  className="mt-5 flex min-h-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-xs font-extrabold leading-relaxed text-primary transition hover:bg-primary/10"
                >
                  {t.softCtaLabel}
                </a>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canContinue}
                className={[
                  'mt-6 w-full py-3.5 rounded-xl font-bold text-sm transition-all',
                  canContinue
                    ? 'bg-primary text-on-primary gg-btn-primary shadow-md hover:opacity-90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                ].join(' ')}
              >
                {canContinue ? t.continue : t.continueDisabled}
              </button>
            </div>
          )}

          {/* ── Step 2: Form ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
              {/* Summary chip */}
              <div className="flex items-center gap-3 mb-5 p-3 bg-surface-container-low rounded-xl border border-primary/15">
                <span className="text-xl">{frameObj?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-on-surface truncate">{formatDate(selectedDate!, t.locale)}</div>
                  <div className="text-xs text-primary font-semibold">{frameObj?.label} · {frameObj?.range}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex min-h-11 flex-shrink-0 items-center px-2 text-xs text-primary underline underline-offset-2 hover:opacity-70"
                >{t.change}</button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block col-span-2 sm:col-span-1">
                    <span className="text-xs font-semibold text-on-surface/70 mb-1 block">{t.name} <span className="text-primary">*</span></span>
                    <input
                      ref={nameInputRef}
                      required
                      maxLength={80}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder={t.namePh}
                      className="w-full px-3 py-3 rounded-xl border border-outline-variant/50 bg-surface text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </label>
                  <label className="block col-span-2 sm:col-span-1">
                    <span className="text-xs font-semibold text-on-surface/70 mb-1 block">{t.phone} <span className="text-primary">*</span></span>
                    <input
                      required
                      type="tel"
                      maxLength={15}
                      value={form.phone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setForm(f => ({ ...f, phone: val }))
                      }}
                      pattern="\d{10}"
                      title={t.phoneTitle}
                      placeholder={t.phonePh}
                      className={[
                        'w-full px-3 py-3 rounded-xl border bg-surface text-sm focus:outline-none transition-colors',
                        form.phone.length > 0 && form.phone.length < 10
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-outline-variant/50 focus:border-primary',
                      ].join(' ')}
                    />
                    {form.phone.length > 0 && form.phone.length < 10 && (
                      <span className="text-[11px] text-red-600 mt-0.5 block" role="alert">{t.phoneErr(form.phone.length)}</span>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-on-surface/70 mb-1 block">{t.email} <span className="text-primary">*</span></span>
                  <input
                    required
                    type="email"
                    maxLength={254}
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder={t.emailPh}
                    className="w-full px-3 py-3 rounded-xl border border-outline-variant/50 bg-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-on-surface/70 mb-1 block">{t.company}</span>
                  <input
                    maxLength={120}
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder={t.companyPh}
                    className="w-full px-3 py-3 rounded-xl border border-outline-variant/50 bg-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-on-surface/70 mb-1 block">{t.need}</span>
                  <select
                    value={form.need}
                    onChange={e => setForm(f => ({ ...f, need: e.target.value }))}
                    className="w-full px-3 py-3 rounded-xl border border-outline-variant/50 bg-surface text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
                  >
                    <option value="">{t.needPlaceholder}</option>
                    {t.needs.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-on-surface/70 mb-1 block">{t.note}</span>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder={t.notePh}
                    className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </label>

                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label>
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                    />
                  </label>
                </div>

                <label className="flex items-start gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-3 text-xs leading-relaxed text-on-surface/70">
                  <input
                    required
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span>
                    {t.privacyConsent}{' '}
                    <a href="/chinh-sach-bao-mat" target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
                      {t.privacyLink}
                    </a>
                  </span>
                </label>
              </div>

              {submitError && (
                <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700" role="alert" aria-live="assertive">
                  {submitError}
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl border-2 border-outline-variant/50 text-sm font-semibold text-on-surface/60 hover:border-primary/30 transition-colors"
                >
                  {t.back}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !consent}
                  aria-busy={submitting}
                  className="flex-1 py-3 rounded-xl bg-primary text-on-primary gg-btn-primary font-bold text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70" />
                      </svg>
                      {t.submitting}
                    </>
                  ) : t.submit}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="px-6 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-3xl">
                ✅
              </div>
              <h3 ref={successHeadingRef} tabIndex={-1} className="text-xl font-extrabold text-on-surface mb-3 focus:outline-none">{t.thanks}</h3>
              <p className="text-sm text-on-surface/60 leading-relaxed mb-2">
                {t.success1}
              </p>
              <p className="text-sm text-on-surface/60 leading-relaxed mb-5">
                {t.success2}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-low rounded-xl mb-6">
                <span className="text-lg">{frameObj?.icon}</span>
                <span className="text-sm font-semibold text-primary">
                  {frameObj?.label} · {formatDate(selectedDate!, t.locale)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={reset}
                  className="min-h-11 px-6 py-2.5 rounded-xl border-2 border-primary/20 text-sm font-semibold text-primary hover:bg-surface-container-low transition-colors"
                >
                  {t.addMore}
                </button>
                <button
                  onClick={() => { reset(); onClose() }}
                  className="min-h-11 px-6 py-2.5 rounded-xl bg-primary text-on-primary gg-btn-primary text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
