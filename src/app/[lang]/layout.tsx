import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Locale } from "@/../i18n-config";
import "@/app/globals.css";

import Header from '@/components/topbar/Header'
import ErrorBoundary from '@/components/ErrorBoundary'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrP Tools - Roblox Management Platform",
  description: "Professional tools for Roblox group management and administration",
  keywords: ["roblox", "management", "tools", "administration"],
  authors: [{ name: "TrP Tools Team" }],
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const RootLayout = async ({
  params,
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) => {
  const cookieStore = await cookies()
  const preferredTheme = cookieStore.get('preferredTheme')?.value || 'dim'

  const { lang } = await params;

  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${preferredTheme}`}>
        <ErrorBoundary>
          <Header params={params} />
          <main>
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}

export default RootLayout
