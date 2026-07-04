import type { Metadata } from 'next'
import { Grand_Hotel, Inter, Sora } from 'next/font/google'
import '../index.css'
import { homeMetaByLang, logoUrl, siteUrl } from '../brandContent'
import { AppShell } from './AppShell'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-body',
})

const sora = Sora({
  subsets: ['latin', 'latin-ext'],
  weight: ['800'],
  display: 'swap',
  variable: '--font-heading',
})

const grandHotel = Grand_Hotel({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-script',
})

export const metadata: Metadata = {
  title: {
    default: homeMetaByLang.en.title,
    template: '%s',
  },
  description: homeMetaByLang.en.description,
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logo-gg.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: homeMetaByLang.en.ogTitle ?? homeMetaByLang.en.title,
    description: homeMetaByLang.en.ogDescription ?? homeMetaByLang.en.description,
    images: [{ url: logoUrl }],
    siteName: 'The One - GG99',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} ${grandHotel.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
