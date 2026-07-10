export const PHINOI_DISPLAY_NAME = 'PHINƠI'

// Covers the known legacy forms without touching identifiers and URLs such as
// `phinoi`, `phinoi.vn` or `phinoi.com`.
const PHINOI_DISPLAY_VARIANTS = /PHIN(?:O\u031B|Ơ|O|Æ(?:\u00a0|\s)?)I|\bPHI[ -]NOI\b/gi

export function normalizePhinoiText(value: string) {
  return value.normalize('NFC').replace(PHINOI_DISPLAY_VARIANTS, (match) => (
    match === match.toLowerCase() ? match : PHINOI_DISPLAY_NAME
  ))
}

export function brandDisplayFontClass(value: string | undefined) {
  return value && normalizePhinoiText(value).includes(PHINOI_DISPLAY_NAME)
    ? 'font-brand-vietnamese'
    : ''
}
