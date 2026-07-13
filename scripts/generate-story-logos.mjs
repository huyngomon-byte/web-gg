import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const OUTPUT_DIR = path.join(ROOT, 'public', 'story-logos')
const CANVAS_SIZE = 384
const SAFE_AREA = 28
const CONTENT_SIZE = CANVAS_SIZE - SAFE_AREA * 2

const logos = {
  phinoi: 'logo-phinoi.png',
  cotacuti: 'logo-cotacuti.png',
  inkaholic: 'logo-inkaholic.png',
  qandabook: 'logo-qandabook.png',
  curnon: 'logo-curnon.png',
  annita: 'logo-annita.png',
  gg: 'logo-gg.png',
}

await mkdir(OUTPUT_DIR, { recursive: true })

for (const [name, sourceName] of Object.entries(logos)) {
  const source = path.join(ROOT, 'public', sourceName)
  const output = path.join(OUTPUT_DIR, `${name}.webp`)
  const trimmed = await sharp(source).trim().toBuffer()

  await sharp(trimmed)
    .resize(CONTENT_SIZE, CONTENT_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .extend({
      top: SAFE_AREA,
      bottom: SAFE_AREA,
      left: SAFE_AREA,
      right: SAFE_AREA,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ lossless: true, effort: 6 })
    .toFile(output)
}

console.log(`Generated ${Object.keys(logos).length} normalized Story logos in ${OUTPUT_DIR}`)
