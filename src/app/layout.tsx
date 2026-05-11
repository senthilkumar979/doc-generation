import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Suspense } from 'react'

import { RouteProgressProvider } from '@/components/navigation/route-progress-provider'
import { GooeyToaster } from '@/components/ui/gooey-toaster'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DocRail',
  description: 'API-first document generation for teams.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <Suspense fallback={null}>
          <RouteProgressProvider>
            <div className="flex flex-1 flex-col">{children}</div>
          </RouteProgressProvider>
        </Suspense>
        <GooeyToaster />
      </body>
    </html>
  )
}
