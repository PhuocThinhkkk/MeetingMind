import './globals.css';
import 'react-day-picker/dist/style.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MeetingMind - AI-Powered Meeting Transcription',
  description: 'Transform your meetings with AI-powered transcription, summaries, and insights',
};

/**
 * Root application layout that wraps page content with the authentication provider and applies the global Inter font.
 *
 * @param children - The page or component tree to render; it will be wrapped by `AuthProvider`.
 * @returns The root HTML structure (html lang="en") with a body that applies the Inter font and contains the authenticated children.
 */
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
        <Toaster/>
      </body>
    </html>
  );
}
