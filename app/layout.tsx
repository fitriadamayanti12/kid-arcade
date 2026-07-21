import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from '@/app/components/ErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Kid Arcade - Game Edukasi Anak',
  description: '15 Game Edukasi Seru: Puzzle, Memory, Timer, Bubble Math, Hitung Benda, Pecahan Pizza, Adventure, Detektif, Ninja Math, Scrabble, Craft, Racer & lebih banyak!',
  keywords: 'game edukasi, matematika anak, game anak SD, belajar matematika, game seru',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎮</text></svg>',
  },
};

// PERBAIKAN: viewport dipisahkan dari metadata
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
        <ErrorBoundary>
          <div id="app-root" className="flex-1 flex flex-col">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}