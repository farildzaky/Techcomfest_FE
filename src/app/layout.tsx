import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./globals.css";
import CookieConsent from '../components/CookieConsent';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#E87E2F',
};

export const metadata: Metadata = {
  title: "Inkluzi",
  description: "Membantu sekolah memastikan setiap menu MBG memenuhi standar keamanan gizi dan sesuai kebutuhan siswa disabilitas dengan analisis AI.",
  metadataBase: new URL('https://inkluzi.my.id'),
  keywords: ['MBG', 'gizi', 'sekolah inklusif', 'menu bergizi', 'disabilitas', 'nutrisi'],
  authors: [{ name: 'Inkluzi Team' }],
  icons: {
    icon: '/favicon.ico?v=2',
  },
  openGraph: {
    title: 'Inkluzi - Validasi Gizi untuk Sekolah Inklusif',
    description: 'Membantu sekolah memastikan setiap menu MBG memenuhi standar keamanan gizi dan sesuai kebutuhan siswa disabilitas dengan analisis AI.',
    url: 'https://inkluzi.my.id',
    siteName: 'Inkluzi',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkluzi - Validasi Gizi untuk Sekolah Inklusif',
    description: 'Membantu sekolah memastikan setiap menu MBG memenuhi standar keamanan gizi dan sesuai kebutuhan siswa disabilitas dengan analisis AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="preload"
          href="/fonts/SatoshiBold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SatoshiMedium.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="antialiased">
        {children}
        <SpeedInsights />
        <CookieConsent />
      </body>
    </html>
  );
}