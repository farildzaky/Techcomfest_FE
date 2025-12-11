import type { Metadata } from "next";

import "./globals.css";
import CookieConsent from '../components/CookieConsent'; 

export const metadata: Metadata = {
  title: "Inkluzi",
  description: "Search nutrition with generative AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiasd">
        {children}
        {/* --- PANGGIL DI SINI --- */}
        <CookieConsent /> 
      </body>
    </html>
  );
}