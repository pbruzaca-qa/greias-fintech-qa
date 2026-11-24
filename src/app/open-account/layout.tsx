import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Open Digital Account",
  description:
    "Simulate digital bank onboarding with client and server-side validation, Tax ID rules, and idempotency protection.",
};

export default function OpenAccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}