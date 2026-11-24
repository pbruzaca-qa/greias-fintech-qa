import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Banking Workspace",
  description:
    "Interactive fintech QA cockpit with instant Pix & Wire transfers, smart card controls, live statement ledger, and Chaos Monkey drills.",
};

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}