import './globals.css'
import 'react-day-picker/dist/style.css'
import type { Metadata } from 'next'
import { Manrope, Playfair_Display } from 'next/font/google'
import { AuthProvider } from '@/hooks/use-auth'
import { Toaster } from '@/components/ui/toaster'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'MeetingMind - AI-Powered Meeting Transcription',
  description:
    'Transform your meetings with AI-powered transcription, summaries, and insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
