import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import ErrorBoundary from "@/app/components/ErrorBoundary";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Kid Arcade - Game Matematika Seru untuk PAUD-SD!',
  description: 'Koleksi 63 game edukasi matematika untuk PAUD, TK, & SD Kelas 1-6. Belajar perkalian, pecahan, bangun ruang, geometri, dan lainnya dengan cara SUPER SERU!',
  keywords: 'game matematika, belajar matematika SD, game edukasi anak, game PAUD, game TK, kelas 1-6, perkalian, pecahan, bangun datar, luas keliling, gratis, anak 3-12 tahun',
  authors: [{ name: 'Kid Arcade Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Kid Arcade - 63 Game Matematika Seru untuk Anak!',
    description: 'Game edukasi matematika GRATIS untuk PAUD, TK & SD. Belajar sambil bermain!',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Kid Arcade',
  },
  icons: { icon: '🎮', shortcut: '🎮', apple: '🎮' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
        
        {/* Next Generation Ecosystem - Watermark halus */}
        <footer className="fixed bottom-2 right-3 z-50 opacity-30 hover:opacity-80 transition-opacity duration-300">
          <a 
            href="https://xgeneration.netlify.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Powered by Next Generation Ecosystem"
          >
            🚀 Next Generation Ecosystem
          </a>
        </footer>
      </body>
    </html>
  );
}