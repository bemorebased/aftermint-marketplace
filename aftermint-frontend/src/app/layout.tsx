import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ClientOnlyNetworkBanner from '@/components/ClientOnlyNetworkBanner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AfterMint - NFT Marketplace",
  description: "Discover, buy, and sell NFTs on the BasedAI blockchain",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="theme-dark" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link rel="preload" href="/fonts/Bedstead-Regular.otf" as="font" type="font/otf" crossOrigin="" />
        <link rel="preload" href="/fonts/Orbitron-Regular.ttf" as="font" type="font/ttf" crossOrigin="" />
        <link rel="preload" href="/fonts/SpartanMB-Regular.otf" as="font" type="font/otf" crossOrigin="" />
      </head>
      <body className={`${inter.className} theme-dark bg-theme-background text-theme-text-primary flex flex-col min-h-screen pb-14`}>
        <ErrorBoundary>
          <Providers>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <ClientOnlyNetworkBanner />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
