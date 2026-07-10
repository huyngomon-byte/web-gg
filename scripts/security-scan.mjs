import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(process.cwd(), '.next', 'static')
const forbidden = [
  ['public Cloudinary upload preset', /NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET|VITE_CLOUDINARY_UPLOAD_PRESET/],
  ['public admin allowlist', /NEXT_PUBLIC_ADMIN_EMAILS|VITE_ADMIN_EMAILS|admin@gg99\.vn/i],
  ['server secret name', /CLOUDINARY_API_SECRET|FIREBASE_ADMIN_PRIVATE_KEY|GOOGLE_PRIVATE_KEY/],
]

async function listJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await listJavaScriptFiles(path))
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(path)
  }
  return files
}

const files = await listJavaScriptFiles(root)
const violations = []
for (const file of files) {
  const source = await readFile(file, 'utf8')
  for (const [label, pattern] of forbidden) {
    if (pattern.test(source)) violations.push(`${label} found in ${file.slice(root.length + 1)}`)
  }
}

if (violations.length) {
  console.error(`Public bundle security scan failed:\n${violations.join('\n')}`)
  process.exit(1)
}

console.log(`Public bundle security scan passed (${files.length} JavaScript files checked).`)
