# GG99 Security Hardening - Implementation Report

Date: 2026-07-10

Production: `https://www.gg99.vn`
Final verified deployment: `dpl_5whFRzQ9NUwJuRYJ2htby1Jneu62`

## 1. Executive status

The application-level P0 hardening work is implemented and active in production.
The CMS now uses role claims and authenticated server APIs, Firestore client writes
are denied, Cloudinary unsigned uploads are retired, booking requests are validated
and rate-limited, and browser security headers are enforced.

Controls that require account ownership or a higher paid/platform permission are
listed in section 8. They were not bypassed or simulated.

## 2. Live controls completed

### Identity and CMS

- Firebase custom claim authorization is active: `admin` and `superadmin`.
- The current CMS owner account has the `superadmin` claim.
- Public admin email allowlists were removed from source and Vercel environments.
- CMS mutations now go through `/api/admin/content` with revoked-token checks.
- Seed requires `superadmin`, recent authentication and an exact confirmation phrase.
- Payload size, depth, key count, string length, ID, status and URL protocols are validated.
- Every CMS write creates an append-only audit entry containing actor, target,
  action, before/after hashes, server timestamp and request ID.
- Admin revalidation and upload responses use `Cache-Control: no-store`.

### Firestore

- Production ruleset deployed: `8698d062-93f3-4b50-9915-90ddf1244781`.
- Anonymous reads of CMS collections are denied.
- Admin role tokens can read CMS collections.
- All Firebase client writes to CMS collections are denied.
- Operational collections are denied to every client.
- Server Admin SDK writes remain available and were verified after deployment.
- A daily authenticated retention cleanup removes expired rate-limit, booking,
  reservation and availability-cache records.

### Media

- Browser-side unsigned upload code was removed.
- The legacy Cloudinary preset was changed from unsigned to signed-only.
- Legacy public Cloudinary variables were removed from Vercel.
- Upload preparation requires a valid Firebase admin token.
- Upload signatures expire after five minutes and bind folder, random public ID,
  allowed formats, tags and timestamp.
- Files upload directly to Cloudinary, avoiding Vercel request-body limits.
- Cloudinary enforces the actual decoded format; the server then retrieves the asset
  through the Admin API and verifies asset ID, public ID, resource type, format,
  bytes, dimensions, page count and folder-specific aspect requirements.
- Images are restricted to JPEG, PNG, WebP and AVIF. Videos are restricted to
  MP4, WebM and OGG. SVG and raw upload paths are not accepted.
- Verified uploads create a CMS audit event.

### Booking and availability

- Legacy root Vercel functions were replaced with Next route handlers.
- Date is validated as a real date in the next 90 days; Sunday is rejected.
- Time slots use a server allowlist.
- Contact fields are normalized, length-limited and stripped of control characters.
- Requests require JSON, have an enforced byte limit, consent, honeypot, minimum
  form-fill time and an idempotency key.
- Same-origin browser submissions are enforced.
- Rate limits apply by hashed network identity and hashed contact identity.
- Firestore transaction reservations prevent duplicate requests and slot races.
- Calendar availability is cached for 30 seconds.
- Calendar conflicts are rechecked before insert.
- Calendar failure returns 503; the UI no longer reports a false success.
- PII is not written to application logs.
- The old client-selected visitor ID and fake-busy inference were removed.

### Browser and content security

- Enforced CSP limits scripts, styles, fonts, images, media, frames and connections.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and
  `frame-ancestors 'none'` are active.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, COOP and CORP are active.
- Next's `X-Powered-By` header is disabled.
- JSON-LD escapes script-breaking characters, ampersands and Unicode separators.
- `/admin` and `/api/admin` are disallowed in robots metadata.
- `/.well-known/security.txt` publishes the disclosure address and policy.
- Alternate brand domains redirect to the canonical `https://www.gg99.vn` host.

### Supply chain and CI

- GitHub Actions use read-only permissions where possible.
- Checkout, Node setup, CodeQL, Gitleaks and dependency review actions are pinned
  to full commit SHAs.
- CI runs install, high-severity audit gate, build, public-bundle secret scan and E2E.
- CodeQL runs on push, PR and weekly schedule.
- Gitleaks runs on push, PR and weekly schedule.
- Dependency review runs on pull requests.
- Dependabot checks npm and GitHub Actions weekly.
- Public bundle scan fails if an admin allowlist, unsigned preset or server-secret
  identifier is found in generated JavaScript.

## 3. Verification evidence

| Check | Result |
|---|---|
| Next production build | Pass, 46 routes |
| Legacy Vite build | Pass, 22 static SEO routes |
| TypeScript | Pass |
| Public bundle security scan | Pass, 34 JavaScript files |
| Playwright | 13/13 pass |
| Responsive desktop/mobile boundary matrix | Pass |
| Keyboard, focus trap and booking dialog accessibility | Pass |
| Live homepage console errors | None |
| Live visible broken images | None |
| Live horizontal overflow | 0 px |
| Anonymous Firestore CMS read | 403 |
| Admin Firestore CMS read | 200 |
| Admin Firebase client write | 403 |
| Server CMS save after rules deployment | 200 with audit request ID |
| CMS upload prepare with superadmin claim | 200, signed contract present |
| Invalid signed Cloudinary file | Signature accepted, file rejected 400 |
| Legacy unsigned Cloudinary upload | Blocked |
| Availability against Google Calendar | 200 |
| Hostile booking origin | 403 |
| Unauthenticated cleanup route | 401 |
| Authenticated cleanup route | 200 |
| Temporary maintenance route after migration | 404 |
| npm production audit high/critical | 0 high, 0 critical |

## 4. Dependency residuals

`npm audit` reports moderate-only findings in two upstream chains:

- Next bundles an older PostCSS version. The reported path requires untrusted CSS
  to be stringified; GG99 does not accept user CSS. The proposed npm force-fix
  incorrectly downgrades Next to 9.x.
- Firebase Admin 13.7 transitively includes UUID 9 through Google libraries. The
  affected UUID APIs are not called by GG99. Firebase Admin 14.1 was tested but
  currently crashes on Vercel Node 24 because `jwks-rsa` CommonJS requires
  `jose` ESM. The compatible 13.7 line is pinned until upstream resolves this.

CI blocks any future high or critical advisory and Dependabot will surface a
compatible upstream fix.

## 5. Backup and rollback

- Pre-hardening Firestore backup:
  `backups/firestore-backup-2026-07-10T08-36-41-450Z.json` (git-ignored).
- Backup SHA-256:
  `B50ECC619E582A941C5FCA68A0DF85214253FBE07D6FC531AE8A95C6BAF281BE`.
- Pre-hardening production deployment:
  `dpl_Fu8TTrK2tUuRuBX13QbxEKzawcdA`.
- Final verified deployment:
  `dpl_5whFRzQ9NUwJuRYJ2htby1Jneu62`.
- Application rollback can use Vercel Instant Rollback to the prior deployment.
- Firestore rules are versioned in `firestore.rules`; prior rules remain available
  as immutable Firebase rulesets.
- Content rollback currently uses the JSON backup plus CMS audit hashes. A managed,
  cross-project encrypted backup remains an owner-level follow-up.

## 6. Daily retention job

- Vercel Cron path: `/api/internal/cleanup`.
- Schedule: `17 3 * * *` (UTC).
- Authorization: dedicated encrypted `CRON_SECRET` bearer header.
- Work is idempotent and bounded to 2,000 documents per collection per run.
- The first authenticated smoke run completed successfully.

## 7. Operational checklist

Weekly:

- Review Vercel 401/403/429/5xx spikes and cron failures.
- Review `cmsAuditLogs`, Cloudinary usage and Google Calendar errors.
- Review failed GitHub workflows and Dependabot PRs.

Monthly:

- Apply compatible dependency updates after build and E2E.
- Review Vercel project members and GitHub collaborators.
- Review DNS records and unused Vercel aliases.
- Verify the Firestore backup script and checksum a fresh export.

Quarterly:

- Run a restore drill in a non-production Firebase project.
- Re-certify CMS administrators and custom claims.
- Run an authorized staging penetration test.

## 8. Owner actions still required

These actions require account-owner proof, a higher permission, or a new vendor key.
They must not be automated with the credentials currently available.

P0 account actions:

1. Change the CMS password because it has been shared in project conversations.
2. Verify the CMS email address, then update rules/API policy to require
   `email_verified == true`.
3. Enable MFA/passkeys for GitHub, Vercel, Google/Firebase and Cloudinary.
4. Rotate Firebase Admin, Google Calendar, Cloudinary and revalidation credentials
   in a coordinated maintenance window.

P1 platform actions:

1. Repository owner enables branch protection on `main`: PR required, one approval,
   required CI checks, no force push and no branch deletion. The connected GitHub
   identity has push but not repository-admin permission.
2. Upgrade Vercel or enable a plan that supports custom Firewall/WAF rules. The
   current plan returns `IP Bypass is unavailable for this plan`; application-level
   Firestore limits are active in the meantime.
3. Add Cloudflare Turnstile keys and render the widget before enabling
   `TURNSTILE_SECRET_KEY`; the server verifier is already implemented but remains
   disabled without a client token.
4. Configure a managed encrypted Firestore export to a separate project/account.
   The current service account cannot create TTL policies or managed backups.
5. Evaluate Google Workload Identity Federation/Vercel OIDC to replace long-lived
   Firebase and Calendar private keys.

## 9. External implementation references

- Firebase rules deployment and rulesets:
  https://firebase.google.com/docs/rules/manage-deploy
- Firestore TTL behavior:
  https://firebase.google.com/docs/firestore/ttl
- Cloudinary signed uploads and signatures:
  https://cloudinary.com/documentation/signatures
- Cloudinary upload preset security:
  https://cloudinary.com/documentation/upload_presets
- Vercel Cron authentication:
  https://vercel.com/docs/cron-jobs/manage-cron-jobs
