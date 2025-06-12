import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css"; // Import RainbowKit styles

import { Providers } from "@/components/Providers"; // Import our Providers component
import Footer from "@/components/Footer"; // Import the Footer
import Header from "@/components/Header"; // Import the Header

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AfterMint Marketplace",
  description: "NFT Marketplace on BasedAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning for theme changes server/client mismatch */}
      <body className={`${inter.className} flex flex-col min-h-screen bg-theme-background text-theme-text-primary`}>
        <Providers>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
} 