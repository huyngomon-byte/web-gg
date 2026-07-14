import type { Metadata } from 'next'
import { absoluteUrl, logoUrl, type PageMeta } from '../brandContent'

export function createMetadata(meta: PageMeta | undefined, _lang = 'en'): Metadata {
  const title = meta?.title ?? 'The One - GG99'
  const description =
    meta?.description ??
    'GG99 is The One growth partner for brand, website, CRM, automation and performance marketing.'
  const path = meta?.path ?? '/'
  const canonical = absoluteUrl(path)
  const image = meta?.ogImage ? absoluteUrl(meta.ogImage) : logoUrl
  const ogTitle = meta?.ogTitle ?? title
  const ogDescription = meta?.ogDescription ?? description

  return {
    title,
    description,
    metadataBase: new URL('https://www.gg99.vn'),
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
    alternates: {
      canonical,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: 'The One',
      images: [{ url: image }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export function JsonLd({ items }: { items: unknown[] }) {
  return (
    <>
      {items.filter(Boolean).map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          data-gg99-schema="true"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(item) }}
        />
      ))}
    </>
  )
}

export function safeJsonLdStringify(value: unknown) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    switch (character) {
      case '<':
        return '\\u003c'
      case '>':
        return '\\u003e'
      case '&':
        return '\\u0026'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
      default:
        return character
    }
  })
}
