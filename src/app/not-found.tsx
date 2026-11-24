import Link from "next/link";
import React from "react";
import { EyeLogo } from "@/components/EyeLogo";

export default function NotFoundPage() {
  return (
    <div
      data-testid="not-found-page"
      className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-16 sm:px-8"
    >
      <div className="w-full max-w-xl border border-graphite-700 bg-obsidian-900/90 p-8 sm:p-10">
        <div className="flex items-center justify-between border-b border-graphite-700/80 pb-5">
          <div className="flex items-center gap-3">
            <EyeLogo className="h-6 w-6" />
            <span className="font-mono text-[11px] tracking-[0.28em] text-sage uppercase">
              HTTP 404 // ROUTE NOT FOUND
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
            GRÉIAS QA
          </span>
        </div>

        <div className="space-y-4 pt-7">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
            This route does not exist.
          </h1>
          <p className="font-serif text-base leading-relaxed text-stone">
            The requested endpoint or page is outside the simulated banking
            environment. Return to the main ledger or jump back into your QA
            workspace.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            data-testid="not-found-home-cta"
            className="inline-flex items-center gap-3 border border-ivory bg-ivory px-6 py-3 font-serif text-sm font-medium text-obsidian-900 transition-colors hover:bg-fillet"
          >
            <span>Return to Home</span>
            <span aria-hidden="true">→</span>
          </Link>

          <Link
            href="/workspace"
            data-testid="not-found-workspace-cta"
            className="inline-flex items-center border border-graphite-700 bg-obsidian-900 px-6 py-3 font-serif text-sm text-ivory transition-colors hover:border-graphite-600 hover:bg-charcoal-800"
          >
            Open Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}