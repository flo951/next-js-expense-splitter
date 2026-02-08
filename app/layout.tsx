/* @jsxImportSource react */

import type { Metadata } from 'next'
import EmotionRegistry from './EmotionRegistry'
import RootLayoutClient from './LayoutClient'

export const metadata: Metadata = {
  title: 'Splitify',
  description: 'Split expenses with friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon-apple-touch.png" />
        <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/images/icon-192.png" type="image/png" />
      </head>
      <body>
        <EmotionRegistry>
          <RootLayoutClient>{children}</RootLayoutClient>
        </EmotionRegistry>
      </body>
    </html>
  )
}
