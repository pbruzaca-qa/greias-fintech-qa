"use client";

import Link from "next/link";
import React from "react";
import { EyeLogo } from "./EyeLogo";
import { useEnvironment } from "./EnvironmentProvider";

export function SiteHeader() {
  const { resetEnvironment, isResetting, statusBanner, clearStatusBanner } =
    useEnvironment();

  return (
    <header className="sticky top-0 z-30 border-b border-graphite-700 bg-obsidian-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
        {/* Brand */}
        <Link
          href="/"
          data-testid="brand-home-link"
          className="flex items-center gap-3 rounded-sm py-1 text-ivory transition-opacity hover:opacity-90"
        >
          <EyeLogo className="h-7 w-7" />
          <span className="font-serif text-base tracking-[0.28em] text-ivory sm:text-lg">
            GRÉIAS
          </span>
        </Link>

        {/* Center Educational Notice */}
        <div
          data-testid="educational-notice"
          className="order-3 w-full border border-graphite-700 bg-obsidian-900/90 px-3 py-1.5 text-center font-serif text-xs text-stone lg:order-2 lg:w-auto lg:px-5"
        >
          Educational environment. All operations are fictional.
        </div>

        {/* Right Controls */}
        <div className="order-2 flex items-center gap-2.5 lg:order-3">
          <button
            type="button"
            onClick={() => void resetEnvironment()}
            disabled={isResetting}
            data-testid="reset-environment-btn"
            className="border border-graphite-700 bg-obsidian-900 px-3 py-1.5 font-serif text-xs text-ivory transition-colors hover:border-graphite-600 hover:bg-charcoal-800 disabled:cursor-wait disabled:opacity-60 sm:px-4"
          >
            {isResetting ? "Resetting..." : "Reset environment"}
          </button>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Gréias Lab cliff — Coming soon"
            data-testid="back-to-cliff-btn"
            className="cursor-not-allowed border border-graphite-700/70 bg-obsidian-950 px-3 py-1.5 font-serif text-xs text-ash opacity-65 sm:px-4"
          >
            ← Back to the cliff
          </button>
        </div>
      </div>

      {/* Live Reset Announcement */}
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