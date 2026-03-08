import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://clawdesktop.vn'),
  title: 'ClawDesktop.vn - Cài OpenClaw chỉ 3 phút, full tiếng Việt, không code',
  description: 'ClawX Desktop VN – Trợ lý AI tự động chạy Zalo, Shopee, ngân hàng ngay trên máy bạn. Không cần terminal, không cần code. Hàng nghìn người Việt đang dùng.',
  generator: 'v0.app',
  icons: { icon: '/logo.svg' },
  openGraph: {
    title: 'ClawDesktop.vn - Cài OpenClaw chỉ 3 phút, full tiếng Việt, không code',
    description: 'ClawX Desktop VN – Trợ lý AI tự động chạy Zalo, Shopee, ngân hàng ngay trên máy bạn. Không cần terminal, không cần code. Hàng nghìn người Việt đang dùng.',
    type: 'website',
    locale: 'vi_VN',
    images: [{ url: '/banner.png', width: 1200, height: 630, alt: 'ClawDesktop.VN - Trợ lý AI tự chủ cho người Việt' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClawDesktop.vn - Cài OpenClaw chỉ 3 phút, full tiếng Việt, không code',
    description: 'ClawX Desktop VN – Trợ lý AI tự động chạy Zalo, Shopee, ngân hàng ngay trên máy bạn.',
    images: ['/banner.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
