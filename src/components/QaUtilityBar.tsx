"use client";

import React from "react";
import { useEnvironment } from "./EnvironmentProvider";

export function QaUtilityBar() {
  const {
    chaos,
    isStudyHubOpen,
    setIsStudyHubOpen,
    studyHubTriggerRef,
    isChaosOpen,
    setIsChaosOpen,
    chaosTriggerRef,
  } = useEnvironment();

  return (
    <div className="pointer-events-none">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-2 px-4 pt-3 sm:px-8">
        <button
          ref={studyHubTriggerRef}
          type="button"
          onClick={() => setIsStudyHubOpen(true)}
          data-testid="study-hub-toggle"
          aria-expanded={isStudyHubOpen}
          className="pointer-events-auto inline-flex items-center gap-2 border border-graphite-700/80 bg-obsidian-900/95 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-stone uppercase shadow-md backdrop-blur-sm transition-colors hover:border-graphite-600 hover:text-ivory"
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sage" />
          <span>QA // Study Hub</span>
        </button>

        <button
          ref={chaosTriggerRef}
          type="button"
          onClick={() => setIsChaosOpen(true)}
          data-testid="chaos-drawer-toggle"
          aria-expanded={isChaosOpen}
          className={`pointer-events-auto inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] uppercase shadow-md backdrop-blur-sm transition-colors ${
            chaos.enabled
              ? "border-amber bg-charcoal-850/95 text-amber hover:bg-charcoal-800"
              : "border-graphite-700/80 bg-obsidian-900/95 text-stone hover:border-graphite-600 hover:text-ivory"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              chaos.enabled ? "bg-amber" : "bg-ash"
            }`}
          />
          <span>
            {chaos.enabled ? "QA // Chaos Active" : "QA // Chaos Monkey"}
          </span>
        </button>
      </div>
    </div>
  );
}