import { expect, test } from '@playwright/test'
import { safeJsonLdStringify } from '../src/app/seo'

test('escapes script-breaking characters in JSON-LD', () => {
  const serialized = safeJsonLdStringify({ value: '</script><script>alert(1)</script>&\u2028' })
  expect(serialized).not.toContain('</script>')
  expect(serialized).toContain('\\u003c/script\\u003e')
  expect(serialized).toContain('\\u0026')
  expect(serialized).toContain('\\u2028')
})

test('serves defensive browser headers and a disclosure contact', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(response.headers()['content-security-policy']).toContain("object-src 'none'")
  expect(response.headers()['x-frame-options']).toBe('DENY')
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(response.headers()['x-powered-by']).toBeUndefined()

  const securityTxt = await request.get('/.well-known/security.txt')
  expect(securityTxt.status()).toBe(200)
  expect(await securityTxt.text()).toContain('Contact: mailto:smooth@gg99.vn')
})

test('fails closed on unauthenticated admin and malformed public API requests', async ({ request }) => {
  const upload = await request.post('/api/admin/upload')
  expect([401, 503]).toContain(upload.status())

  const content = await request.post('/api/admin/content', {
    data: { action: 'save-page', data: {} },
    headers: { 'Content-Type': 'application/json' },
  })
  expect([401, 503]).toContain(content.status())

  const cleanup = await request.get('/api/internal/cleanup')
  expect(cleanup.status()).toBe(401)

  const booking = await request.post('/api/book', {
    data: {},
    headers: { 'Content-Type': 'application/json' },
  })
  expect(booking.status()).toBe(400)

  const hostileOrigin = await request.post('/api/book', {
    data: {},
    headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' },
  })
  expect(hostileOrigin.status()).toBe(403)

  const oversized = await request.post('/api/book', {
    data: { note: 'x'.repeat(20_000) },
    headers: { 'Content-Type': 'application/json' },
  })
  expect(oversized.status()).toBe(413)
})
