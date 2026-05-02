import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OYMO – تتبع رحلة الليزر',
  description: 'تابعي رحلتك لإزالة الشعر بالليزر',
}

import { headers } from 'next/headers'
import { getSettingBool } from '@/lib/settings'
import { redirect } from 'next/navigation'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  // Fast database check (cached) instead of an HTTP fetch in middleware
  if (!pathname.startsWith('/admin') && pathname !== '/maintenance' && !pathname.startsWith('/_next')) {
    const isMaintenance = await getSettingBool('maintenance_mode')
    if (isMaintenance) {
      redirect('/maintenance')
    }
  }

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster
          position="top-center"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: '#111111',
              border: '1px solid #1F1F1F',
              color: '#FFFFFF',
              fontFamily: 'Cairo, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
