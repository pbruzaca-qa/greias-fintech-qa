"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { EyeLogo } from "./EyeLogo";
import { useEnvironment } from "./EnvironmentProvider";

export function SiteHeader() {
  const pathname = usePathname();
  const { resetEnvironment, isResetting, statusBanner, clearStatusBanner } =
    useEnvironment();

  const isLabHome = pathname === "/";

  if (isLabHome) {
    return (
      <header className="sticky top-0 z-30 border-b border-graphite-700 bg-obsidian-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Link
            href="/"
            data-testid="lab-brand-link"
            className="flex items-center gap-3 rounded-sm py-1 text-ivory transition-opacity hover:opacity-90"
          >
            <EyeLogo className="h-7 w-7" />
            <span className="font-mono text-xs tracking-[0.26em] text-ivory uppercase sm:text-sm">
              GRÉIAS LAB — FINTECH QA
            </span>
          </Link>

          <div
            data-testid="educational-notice"
            className="border border-graphite-700 bg-obsidian-900/90 px-3 py-1.5 text-center font-serif text-xs text-stone sm:px-5"
          >
            Educational environment. All operations are fictional.
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-graphite-700 bg-obsidian-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <Link
          href="/bank"
          data-testid="brand-home-link"
          className="flex items-center gap-3 rounded-sm py-1 text-ivory transition-opacity hover:opacity-90"
        >
          <EyeLogo className="h-7 w-7" />
          <span className="font-serif text-base tracking-[0.28em] text-ivory sm:text-lg">
            GRÉIAS
          </span>
        </Link>

        <div
          data-testid="educational-notice"
          className="order-3 w-full border border-graphite-700 bg-obsidian-900/90 px-3 py-1.5 text-center font-serif text-xs text-stone lg:order-2 lg:w-auto lg:px-5"
        >
          Educational environment. All operations are fictional.
        </div>

        <div className="order-2 flex items-center gap-2.5 lg:order-3">
          <button
            type="button"
            onClick={() => void resetEnvironment()}
            disabled={isResetting}
            data-testid="reset-environment-btn"
            className="border border-graphite-700 bg-obsidian-900 px-3 py-1.5 font-serif text-xs text-ivory transition-colors hover:border-graphite-600 hover:bg-charcoal-800 disabled:cursor-wait disabled:opacity-60 sm:px-4"
          >
            <span>{isResetting ? "Resetting..." : "Reset environment"}</span>
          </button>

          <Link
            href="/"
            data-testid="back-to-study-hub-btn"
            className="border border-graphite-700 bg-obsidian-900 px-3 py-1.5 font-serif text-xs text-ivory transition-colors hover:border-graphite-600 hover:bg-charcoal-800 sm:px-4"
          >
            ← Back to Study Hub
          </Link>
        </div>
      </div>

      {statusBanner && (
        <div
          role="status"
          aria-live="polite"
          data-testid="reset-status-banner"
          className="border-t border-graphite-700 bg-charcoal-850 px-4 py-2 text-center font-mono text-xs text-sage"
        >
          <span>{statusBanner}</span>
          <button
            type="button"
            onClick={clearStatusBanner}
            aria-label="Dismiss notification"
            className="ml-4 text-stone underline hover:text-ivory"
          >
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
}