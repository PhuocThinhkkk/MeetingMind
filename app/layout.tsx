import './globals.css';
import 'react-day-picker/dist/style.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/use-auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MeetingMind - AI-Powered Meeting Transcription',
  description: 'Transform your meetings with AI-powered transcription, summaries, and insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
