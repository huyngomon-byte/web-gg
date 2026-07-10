import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, rateLimitResponse } from '../../../security/serverRateLimit'

const MAX_REQUEST_BYTES = 8_192

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(request, { scope: 'revalidate-secret', limit: 20, windowSeconds: 60 })
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit)
  const configuredSecret = process.env.REVALIDATE_SECRET
  const providedSecret = request.headers.get('x-revalidate-secret')

  if (!configuredSecret) {
    return jsonResponse({ ok: false, error: 'Revalidation is not configured.' }, 503)
  }

  if (providedSecret !== configuredSecret) {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 401)
  }

  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return jsonResponse({ ok: false, error: 'Content-Type must be application/json.' }, 415)
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) return jsonResponse({ ok: false, error: 'Request body is too large.' }, 413)
  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
    return jsonResponse({ ok: false, error: 'Request body is too large.' }, 413)
  }
  let body: { path?: string; tag?: string } = {}
  try {
    body = JSON.parse(rawBody) as { path?: string; tag?: string }
  } catch {
    return jsonResponse({ ok: false, error: 'The revalidation request is invalid.' }, 400)
  }

  const path = typeof body.path === 'string' && /^\/(?!\/).{0,255}$/.test(body.path) ? body.path : undefined
  const tag = typeof body.tag === 'string' && /^[a-zA-Z0-9:_-]{1,120}$/.test(body.tag) ? body.tag : undefined

  if (!path && !tag) {
    return jsonResponse({ ok: false, error: 'A valid path or tag is required.' }, 400)
  }

  if (path) revalidatePath(path)
  if (tag) revalidateTag(tag, 'max')

  return jsonResponse({ ok: true, path: path ?? null, tag: tag ?? null })
}
