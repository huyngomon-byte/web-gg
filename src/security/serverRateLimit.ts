import 'server-only'

import { createHash } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse, type NextRequest } from 'next/server'
import { getFirebaseAdminDb } from '../cms/firebaseAdmin'

type RateLimitOptions = {
  scope: string
  limit: number
  windowSeconds: number
  extraKey?: string
}

type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
}

const developmentCounters = new Map<string, { count: number; resetAt: number }>()

function requestIdentity(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown'
  const ja4 = request.headers.get('x-vercel-ja4-digest') || ''
  const userAgent = request.headers.get('user-agent')?.slice(0, 160) || ''
  return `${ip}|${ja4}|${userAgent}`
}

function keyHash(value: string) {
  const secret = process.env.SECURITY_HASH_SECRET || process.env.REVALIDATE_SECRET || 'development-only'
  return createHash('sha256').update(`${secret}|${value}`).digest('hex')
}

export async function checkRateLimit(request: NextRequest, options: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000
  const windowStart = Math.floor(now / windowMs) * windowMs
  const resetAt = windowStart + windowMs
  const identity = keyHash(`${options.scope}|${requestIdentity(request)}|${options.extraKey ?? ''}`)
  const documentId = `${options.scope.replace(/[^a-z0-9_-]/gi, '-')}-${windowStart}-${identity.slice(0, 32)}`
  const db = getFirebaseAdminDb()
  const isVercelRuntime = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview'

  if (!db || !isVercelRuntime) {
    if (isVercelRuntime) {
      return { allowed: false, limit: options.limit, remaining: 0, resetAt }
    }
    const current = developmentCounters.get(documentId) ?? { count: 0, resetAt }
    current.count += 1
    developmentCounters.set(documentId, current)
    return {
      allowed: current.count <= options.limit,
      limit: options.limit,
      remaining: Math.max(0, options.limit - current.count),
      resetAt,
    }
  }

  const ref = db.collection('securityRateLimits').doc(documentId)
  const count = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    const nextCount = Number(snapshot.data()?.count ?? 0) + 1
    transaction.set(
      ref,
      {
        scope: options.scope,
        count: nextCount,
        windowStart: new Date(windowStart),
        expiresAt: new Date(resetAt + 24 * 60 * 60 * 1000),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    return nextCount
  })

  return {
    allowed: count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - count),
    resetAt,
  }
}

export function rateLimitResponse(result: RateLimitResult) {
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
  return NextResponse.json(
    { ok: false, error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  )
}
