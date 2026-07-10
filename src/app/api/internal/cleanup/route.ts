import { timingSafeEqual } from 'node:crypto'
import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { NextResponse, type NextRequest } from 'next/server'
import { getFirebaseAdminDb } from '../../../../cms/firebaseAdmin'

export const runtime = 'nodejs'
export const maxDuration = 60

const COLLECTIONS = [
  'securityRateLimits',
  'bookingReservations',
  'bookingRequests',
  'bookingAvailabilityCache',
] as const
const BATCH_SIZE = 200
const MAX_BATCHES_PER_COLLECTION = 10

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET ?? ''
  const provided = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  if (!secret || provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

async function deleteExpired(db: Firestore, collectionName: string) {
  let deleted = 0
  for (let batchIndex = 0; batchIndex < MAX_BATCHES_PER_COLLECTION; batchIndex += 1) {
    const snapshot = await db
      .collection(collectionName)
      .where('expiresAt', '<=', new Date())
      .limit(BATCH_SIZE)
      .get()
    if (snapshot.empty) break

    const batch = db.batch()
    for (const document of snapshot.docs) batch.delete(document.ref)
    await batch.commit()
    deleted += snapshot.size
    if (snapshot.size < BATCH_SIZE) break
  }
  return deleted
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const db = getFirebaseAdminDb()
  if (!db) {
    return NextResponse.json(
      { ok: false, error: 'Firestore Admin is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const entries = await Promise.all(
      COLLECTIONS.map(async (collectionName) => [collectionName, await deleteExpired(db, collectionName)] as const),
    )
    const deleted = Object.fromEntries(entries)
    await db.collection('cmsAuditLogs').add({
      action: 'retention-cleanup',
      target: 'operational-collections',
      deleted,
      createdAt: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ ok: true, deleted }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error(JSON.stringify({
      event: 'retention_cleanup_failed',
      error: error instanceof Error ? error.message : 'unknown',
    }))
    return NextResponse.json(
      { ok: false, error: 'Retention cleanup failed.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
