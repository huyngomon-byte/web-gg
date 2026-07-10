import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from './firebaseAdmin'

export type AdminRole = 'admin' | 'superadmin'

export type AdminActor = {
  uid: string
  email: string
  role: AdminRole
  emailVerified: boolean
  authTime: number
}

type AdminAuthOptions = {
  requireSuperadmin?: boolean
  requireRecentLoginSeconds?: number
}

type AdminAuthResult =
  | { ok: true; actor: AdminActor }
  | { ok: false; response: NextResponse }

function error(status: number, message: string) {
  return NextResponse.json(
    { ok: false, error: message },
    { status, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function authenticateAdminRequest(
  request: NextRequest,
  options: AdminAuthOptions = {},
): Promise<AdminAuthResult> {
  if (!isFirebaseAdminConfigured()) {
    return { ok: false, response: error(503, 'Firebase Admin is not configured on the server.') }
  }

  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : ''
  if (!token || token.length > 16_384) {
    return { ok: false, response: error(401, 'The authentication token is missing or invalid.') }
  }

  const auth = await getFirebaseAdminAuth()
  if (!auth) {
    return { ok: false, response: error(503, 'Firebase Admin is not configured on the server.') }
  }

  try {
    const decoded = await auth.verifyIdToken(token, true)
    const role = decoded.role
    if (role !== 'admin' && role !== 'superadmin') {
      return { ok: false, response: error(403, 'This account does not have an admin role.') }
    }
    if (options.requireSuperadmin && role !== 'superadmin') {
      return { ok: false, response: error(403, 'This action requires the superadmin role.') }
    }

    const authTime = Number(decoded.auth_time ?? 0)
    if (
      options.requireRecentLoginSeconds &&
      (!authTime || Math.floor(Date.now() / 1000) - authTime > options.requireRecentLoginSeconds)
    ) {
      return { ok: false, response: error(401, 'Please sign in again before performing this sensitive action.') }
    }

    return {
      ok: true,
      actor: {
        uid: decoded.uid,
        email: String(decoded.email ?? '').toLowerCase(),
        role,
        emailVerified: Boolean(decoded.email_verified),
        authTime,
      },
    }
  } catch {
    return { ok: false, response: error(401, 'The authentication token is invalid or expired.') }
  }
}
