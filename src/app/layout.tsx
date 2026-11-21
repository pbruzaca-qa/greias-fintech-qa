import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import React from "react";
import { ChaosMonkeyDrawer } from "@/components/ChaosMonkeyDrawer";
import { EnvironmentProvider } from "@/components/EnvironmentProvider";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "GRÉIAS — Simulated Digital Bank for Fintech QA",
  description:
    "A fully simulated digital bank built for real-world fintech QA practice. Educational environment. All operations are fictional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-obsidian-950 font-sans text-ivory antialiased">
        <EnvironmentProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <ChaosMonkeyDrawer />
        </EnvironmentProvider>
      </body>
    </html>
  );
}