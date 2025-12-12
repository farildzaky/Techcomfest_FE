import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./globals.css";
import CookieConsent from '../components/CookieConsent';

export const metadata: Metadata = {
  title: "Inkluzi",
  description: "Search nutrition with generative AI",
  metadataBase: new URL('https://inkluzi.my.id'),
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