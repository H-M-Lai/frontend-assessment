import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppToaster } from "@/components/shared/AppToaster";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Content Review Console",
  description: "Internal content review and publishing dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DashboardLayout>{children}</DashboardLayout>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
