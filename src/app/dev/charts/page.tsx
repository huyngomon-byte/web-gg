import type { Metadata } from 'next'
import { DevChartsGallery } from './DevChartsGallery'

export const metadata: Metadata = {
  title: 'Chart tiles preview — internal',
  robots: { index: false, follow: false },
}

// Round 10 E: internal gallery so the PO can approve chart colors before content goes live.
export default function Page() {
  return <DevChartsGallery />
}
