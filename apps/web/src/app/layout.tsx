import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import { Navbar } from "@/components/v2/Navbar";
import { Footer as FooterV2 } from "@/components/v2/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

/**
 * Font Loading Disabled
 *
 * Next.js 16.0.3 Turbopack has a known bug with Google Fonts loader.
 * Using system fonts instead for reliability and performance.
 *
 * Font stack: Inter (system), -apple-system, BlinkMacSystemFont, Segoe UI, etc.
 */

export const metadata: Metadata = {
  title: "Tulumbak İzmir Baklava | Geleneksel Lezzet",
  description: "İzmir'in en taze ve lezzetli baklavalarını online sipariş edin. Geleneksel tariflerle hazırlanan taze baklava çeşitleri.",
  keywords: "baklava, tulumbak, İzmir baklava, online baklava, tatlı sipariş",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Google Fonts - TulumBak Design System */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Montserrat:wght@700&family=Nunito:wght@400;600&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body antialiased"
      >
        <AuthProvider>
          <Toaster position="top-right" />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <FooterV2 />
        </AuthProvider>
      </body>
    </html>
  );
}
