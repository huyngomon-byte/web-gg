import { createHash } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { google } from 'googleapis'
import { NextResponse, type NextRequest } from 'next/server'
import { getFirebaseAdminDb } from '../../../cms/firebaseAdmin'
import { checkRateLimit, rateLimitResponse } from '../../../security/serverRateLimit'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 16_384
const BOOKING_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const TIME_MAP = {
  '8-10': { startH: '08:00', endH: '10:00' },
  '10-12': { startH: '10:00', endH: '12:00' },
  '14-16': { startH: '14:00', endH: '16:00' },
  '16-18': { startH: '16:00', endH: '18:00' },
  '20-22': { startH: '20:00', endH: '22:00' },
  '22-24': { startH: '22:00', endH: '23:59' },
} as const

type TimeFrame = keyof typeof TIME_MAP

type BookingPayload = {
  date: string
  timeFrame: TimeFrame
  timeRange: string
  name: string
  phone: string
  email: string
  company: string
  need: string
  note: string
  website: string
  consent: boolean
  startedAt: number
  idempotencyKey: string
  challengeToken: string
}

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength + 1)
}

function dateInTimeZone(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toISOString().slice(0, 10) === value
}

function validatePayload(value: unknown): { ok: true; value: BookingPayload } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'Invalid booking request.' }
  const body = value as Record<string, unknown>
  const date = cleanText(body.date, 10)
  const timeFrame = cleanText(body.timeFrame, 8) as TimeFrame
  const name = cleanText(body.name, 80)
  const phone = cleanText(body.phone, 30)
  const email = cleanText(body.email, 254).toLowerCase()
  const company = cleanText(body.company, 120)
  const need = cleanText(body.need, 160)
  const note = cleanText(body.note, 1000)
  const website = cleanText(body.website, 200)
  const idempotencyKey = cleanText(body.idempotencyKey, 80)
  const challengeToken = cleanText(body.challengeToken, 4096)
  const startedAt = Number(body.startedAt)
  const consent = body.consent === true
  const today = dateInTimeZone()

  if (website) return { ok: false, error: 'Invalid booking request.' }
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1_500 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    return { ok: false, error: 'Please reopen the booking form and try again.' }
  }
  if (!consent) return { ok: false, error: 'Please accept the privacy notice before submitting.' }
  if (!isRealDate(date) || date < today || date > addDays(today, 90)) return { ok: false, error: 'The selected date is invalid.' }
  const [year, month, day] = date.split('-').map(Number)
  if (new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0) return { ok: false, error: 'Sundays are not available.' }
  if (!(timeFrame in TIME_MAP)) return { ok: false, error: 'The selected time slot is invalid.' }
  if (name.length < 2 || name.length > 80) return { ok: false, error: 'Please enter a valid name.' }
  if (!/^\+?[0-9]{8,15}$/.test(phone.replace(/[\s().-]/g, ''))) return { ok: false, error: 'Please enter a valid phone number.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return { ok: false, error: 'Please enter a valid email address.' }
  if (company.length > 120 || need.length > 160 || note.length > 1000) return { ok: false, error: 'One or more fields are too long.' }
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(idempotencyKey)) return { ok: false, error: 'The request identifier is invalid.' }

  return {
    ok: true,
    value: {
      date,
      timeFrame,
      timeRange: cleanText(body.timeRange, 40),
      name,
      phone,
      email,
      company,
      need,
      note,
      website: '',
      consent,
      startedAt,
      idempotencyKey,
      challengeToken,
    },
  }
}

function securityHash(value: string) {
  const secret = process.env.SECURITY_HASH_SECRET || process.env.REVALIDATE_SECRET || ''
  return createHash('sha256').update(`${secret}|${value}`).digest('hex')
}

function requestIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    const host = new URL(origin).hostname
    return host === 'www.gg99.vn' || host === 'localhost' || host === '127.0.0.1'
  } catch {
    return false
  }
}

async function verifyChallenge(request: NextRequest, token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  const body = new URLSearchParams({ secret, response: token, remoteip: requestIp(request) })
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(8_000),
  })
  const result = (await response.json().catch(() => null)) as { success?: boolean } | null
  return Boolean(response.ok && result?.success)
}

function calendarAuth() {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) return null
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  })
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return jsonError(403, 'Origin is not allowed.')
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return jsonError(415, 'Content-Type must be application/json.')
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) return jsonError(413, 'Request body is too large.')

  const ipLimit = await checkRateLimit(request, { scope: 'booking-ip', limit: 3, windowSeconds: 60 * 60 })
  if (!ipLimit.allowed) return rateLimitResponse(ipLimit)

  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) return jsonError(413, 'Request body is too large.')
  let requestBody: unknown = null
  try {
    requestBody = JSON.parse(rawBody)
  } catch {
    return jsonError(400, 'Invalid booking request.')
  }
  const parsed = validatePayload(requestBody)
  if (!parsed.ok) return jsonError(400, parsed.error)
  const payload = parsed.value

  if (!(await verifyChallenge(request, payload.challengeToken))) return jsonError(403, 'Bot verification failed. Please try again.')

  const contactLimit = await checkRateLimit(request, {
    scope: 'booking-contact',
    limit: 5,
    windowSeconds: 24 * 60 * 60,
    extraKey: securityHash(`${payload.email}|${payload.phone}`),
  })
  if (!contactLimit.allowed) return rateLimitResponse(contactLimit)

  const db = getFirebaseAdminDb()
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const auth = calendarAuth()
  if (!db || !calendarId || !auth) return jsonError(503, 'Booking is temporarily unavailable. Please try again later.')

  const idempotencyHash = securityHash(payload.idempotencyKey)
  const reservationId = `${payload.date}_${payload.timeFrame.replace(/[^a-z0-9-]/gi, '-')}`
  const requestRef = db.collection('bookingRequests').doc(idempotencyHash)
  const reservationRef = db.collection('bookingReservations').doc(reservationId)
  const now = Date.now()
  const pendingExpiry = new Date(now + 10 * 60 * 1000)

  const reservationResult = await db.runTransaction(async (transaction) => {
    const [requestSnapshot, reservationSnapshot] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(reservationRef),
    ])
    const previousRequest = requestSnapshot.data()
    if (previousRequest?.status === 'confirmed') return 'duplicate' as const
    if (previousRequest?.status === 'pending') return 'processing' as const

    const existingReservation = reservationSnapshot.data()
    const existingExpiry = existingReservation?.expiresAt?.toDate?.().getTime?.() ?? 0
    if (existingReservation?.status === 'confirmed' || (existingReservation?.status === 'pending' && existingExpiry > now)) {
      return 'conflict' as const
    }

    const common = {
      status: 'pending',
      date: payload.date,
      timeFrame: payload.timeFrame,
      idempotencyHash,
      contactHash: securityHash(`${payload.email}|${payload.phone}`),
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: pendingExpiry,
    }
    transaction.set(requestRef, common)
    transaction.set(reservationRef, common)
    return 'created' as const
  })

  if (reservationResult === 'duplicate') {
    return NextResponse.json({ ok: true, duplicate: true }, { headers: { 'Cache-Control': 'no-store' } })
  }
  if (reservationResult === 'processing') return jsonError(409, 'This booking request is already being processed.')
  if (reservationResult === 'conflict') return jsonError(409, 'This time slot is no longer available. Please choose another slot.')

  const times = TIME_MAP[payload.timeFrame]
  const startDateTime = `${payload.date}T${times.startH}:00+07:00`
  const endDateTime = `${payload.date}T${times.endH}:00+07:00`

  try {
    const calendar = google.calendar({ version: 'v3', auth })
    const existing = await calendar.events.list({
      calendarId,
      timeMin: startDateTime,
      timeMax: endDateTime,
      singleEvents: true,
      maxResults: 1,
    })
    if ((existing.data.items ?? []).length > 0) {
      await Promise.all([requestRef.delete(), reservationRef.delete()])
      return jsonError(409, 'This time slot is no longer available. Please choose another slot.')
    }

    const event = await calendar.events.insert({
      calendarId,
      sendUpdates: 'none',
      requestBody: {
        summary: `Consultation request - ${payload.name}`,
        description: [
          `Name: ${payload.name}`,
          `Phone: ${payload.phone}`,
          `Email: ${payload.email}`,
          payload.company ? `Company: ${payload.company}` : null,
          payload.need ? `Need: ${payload.need}` : null,
          payload.note ? `Note: ${payload.note}` : null,
          `Preferred slot: ${payload.timeFrame} (${payload.timeRange})`,
        ].filter(Boolean).join('\n'),
        start: { dateTime: startDateTime, timeZone: BOOKING_TIME_ZONE },
        end: { dateTime: endDateTime, timeZone: BOOKING_TIME_ZONE },
        colorId: '5',
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
      },
    })

    const confirmed = {
      status: 'confirmed',
      eventId: event.data.id ?? null,
      confirmedAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(now + 180 * 24 * 60 * 60 * 1000),
    }
    const batch = db.batch()
    batch.set(requestRef, confirmed, { merge: true })
    batch.set(reservationRef, confirmed, { merge: true })
    batch.delete(db.collection('bookingAvailabilityCache').doc(payload.date))
    await batch.commit()

    console.info(JSON.stringify({ event: 'booking_created', reservationId, requestId: idempotencyHash.slice(0, 12) }))
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    await Promise.allSettled([requestRef.delete(), reservationRef.delete()])
    console.error(JSON.stringify({ event: 'booking_failed', reservationId, error: error instanceof Error ? error.message : 'unknown' }))
    return jsonError(503, 'Booking could not be completed. Please try again later.')
  }
}
