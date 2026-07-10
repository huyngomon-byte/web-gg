import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { authenticateAdminRequest } from '../../../../cms/adminAuth'
import { checkRateLimit, rateLimitResponse } from '../../../../security/serverRateLimit'

const MAX_REQUEST_BYTES = 8_192

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(request, { scope: 'admin-revalidate', limit: 30, windowSeconds: 60 })
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit)
  const authentication = await authenticateAdminRequest(request)
  if (!authentication.ok) return authentication.response

  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return jsonResponse({ ok: false, error: 'Content-Type must be application/json.' }, 415)
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) return jsonResponse({ ok: false, error: 'Request body is too large.' }, 413)
  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
    return jsonResponse({ ok: false, error: 'Request body is too large.' }, 413)
  }
  let body: { paths?: unknown } = {}
  try {
    body = JSON.parse(rawBody) as { paths?: unknown }
  } catch {
    return jsonResponse({ ok: false, error: 'The revalidation request is invalid.' }, 400)
  }
  const paths = Array.isArray(body.paths)
    ? body.paths
        .filter((path): path is string => typeof path === 'string' && /^\/(?!\/).{0,255}$/.test(path))
        .slice(0, 40)
    : []

  for (const path of paths) revalidatePath(path)

  return jsonResponse({ ok: true, paths })
}
