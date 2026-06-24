// src/app/layout.tsx
import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crypto Weather — Bitcoin Forecast',
  description: 'Bitcoin price forecasts inspired by Apple Weather. Real-time BTC conditions, 7-day outlook, and confidence scoring.',
  keywords: ['bitcoin', 'crypto', 'forecast', 'weather', 'BTC', 'price'],
  openGraph: {
    title: 'Crypto Weather',
    description: 'Bitcoin market conditions, forecast like weather.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
