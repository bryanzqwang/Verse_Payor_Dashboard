import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Verse Payor Dashboard',
  description: 'Dashboard for healthcare insurance executives',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <Nav />
        {children}
      </body>
    </html>
  )
}