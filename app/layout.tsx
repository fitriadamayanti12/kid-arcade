import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import ErrorBoundary from "@/app/components/ErrorBoundary";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Kid Arcade - 76 Game Matematika Seru & Gratis untuk PAUD-SD!',
  description: 'Koleksi 76 game edukasi matematika GRATIS. Powered by Next Generation Ecosystem.',
  keywords: 'game matematika, belajar matematika SD, game edukasi anak, Next Generation Ecosystem',
  authors: [{ name: 'Kid Arcade Team', url: 'https://xgeneration.netlify.app' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Kid Arcade - 76 Game Matematika Seru untuk Anak!',
    description: 'Game edukasi matematika GRATIS. Powered by Next Generation Ecosystem.',
    type: 'website', locale: 'id_ID', siteName: 'Kid Arcade',
  },
  icons: { icon: '🎮', shortcut: '🎮', apple: '🎮' },
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}