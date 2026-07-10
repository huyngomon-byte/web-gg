import { google } from 'googleapis'
import { NextResponse, type NextRequest } from 'next/server'
import { getFirebaseAdminDb } from '../../../cms/firebaseAdmin'
import { checkRateLimit, rateLimitResponse } from '../../../security/serverRateLimit'

export const runtime = 'nodejs'

const TIME_FRAMES = [
  { id: 'slot_08_10', label: '8-10', startH: '08:00', endH: '10:00' },
  { id: 'slot_10_12', label: '10-12', startH: '10:00', endH: '12:00' },
  { id: 'slot_14_16', label: '14-16', startH: '14:00', endH: '16:00' },
  { id: 'slot_16_18', label: '16-18', startH: '16:00', endH: '18:00' },
  { id: 'slot_20_22', label: '20-22', startH: '20:00', endH: '22:00' },
  { id: 'slot_22_24', label: '22-24', startH: '22:00', endH: '23:59' },
] as const

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

function todayInVietnam() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function validateDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toISOString().slice(0, 10) === value
}

function recurringBusyIds(dayOfWeek: number) {
  if (dayOfWeek === 1) return new Set(['slot_08_10', 'slot_10_12'])
  if (dayOfWeek === 2) return new Set(['slot_08_10', 'slot_10_12', 'slot_14_16', 'slot_16_18'])
  return new Set<string>()
}

export async function GET(request: NextRequest) {
  const rateLimit = await checkRateLimit(request, { scope: 'availability-ip', limit: 30, windowSeconds: 60 })
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit)

  const date = request.nextUrl.searchParams.get('date') ?? ''
  const today = todayInVietnam()
  if (!validateDate(date) || date < today || date > addDays(today, 90)) return jsonError(400, 'The selected date is invalid.')

  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  if (dayOfWeek === 0) {
    return NextResponse.json({ frames: [] }, { headers: { 'Cache-Control': 'private, max-age=30' } })
  }

  const db = getFirebaseAdminDb()
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = process.env
  if (!db || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
    return jsonError(503, 'Availability is temporarily unavailable.')
  }

  const cacheRef = db.collection('bookingAvailabilityCache').doc(date)
  const cached = await cacheRef.get()
  const cachedData = cached.data()
  const cacheExpiry = cachedData?.expiresAt?.toDate?.().getTime?.() ?? 0
  if (cacheExpiry > Date.now() && Array.isArray(cachedData?.frames)) {
    return NextResponse.json(
      { frames: cachedData.frames },
      { headers: { 'Cache-Control': 'private, max-age=20', 'X-Availability-Cache': 'HIT' } },
    )
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })
    const calendar = google.calendar({ version: 'v3', auth })
    const eventsResult = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: `${date}T00:00:00+07:00`,
      timeMax: `${date}T23:59:59+07:00`,
      singleEvents: true,
    })
    const events = eventsResult.data.items ?? []
    const recurring = recurringBusyIds(dayOfWeek)
    const frames = TIME_FRAMES.map((frame) => {
      const frameStart = new Date(`${date}T${frame.startH}:00+07:00`).getTime()
      const frameEnd = new Date(`${date}T${frame.endH}:00+07:00`).getTime()
      const booked = events.some((event) => {
        const eventStart = new Date(event.start?.dateTime ?? event.start?.date ?? '').getTime()
        const eventEnd = new Date(event.end?.dateTime ?? event.end?.date ?? '').getTime()
        return eventStart < frameEnd && eventEnd > frameStart
      })
      return { ...frame, available: !recurring.has(frame.id) && !booked }
    })

    await cacheRef.set({ frames, expiresAt: new Date(Date.now() + 30_000), updatedAt: new Date() })
    return NextResponse.json(
      { frames },
      { headers: { 'Cache-Control': 'private, max-age=20', 'X-Availability-Cache': 'MISS' } },
    )
  } catch (error) {
    console.error(JSON.stringify({ event: 'availability_failed', date, error: error instanceof Error ? error.message : 'unknown' }))
    return jsonError(503, 'Availability is temporarily unavailable.')
  }
}
