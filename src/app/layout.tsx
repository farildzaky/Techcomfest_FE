import type { Metadata } from "next";
import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
