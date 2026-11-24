import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import React from "react";
import { ChaosMonkeyDrawer } from "@/components/ChaosMonkeyDrawer";
import { ConstellationBackdrop } from "@/components/ConstellationBackdrop";
import { EnvironmentProvider } from "@/components/EnvironmentProvider";
import { QaUtilityBar } from "@/components/QaUtilityBar";
import { SiteHeader } from "@/components/SiteHeader";
import { StudyHubDrawer } from "@/components/StudyHubDrawer";
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
  metadataBase: new URL("https://greias-fintech-qa.vercel.app"),
  title: {
    default: "GRÉIAS — Simulated Digital Bank for Fintech QA",
    template: "%s | GRÉIAS",
  },
  description:
    "A fully simulated digital bank built for real-world fintech QA practice, API testing, and chaos engineering drills.",
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
        <ConstellationBackdrop />
        <EnvironmentProvider>
          <div className="pointer-events-none sticky top-0 z-30">
            <SiteHeader />
            <QaUtilityBar />
          </div>
          <main className="relative z-10 flex-1">{children}</main>
          <StudyHubDrawer />
          <ChaosMonkeyDrawer />
        </EnvironmentProvider>
      </body>
    </html>
  );
}