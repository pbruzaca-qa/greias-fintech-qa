"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEnvironment } from "./EnvironmentProvider";

export function ChaosMonkeyDrawer() {
  const { snapshot, updateChaos } = useEnvironment();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const chaos = snapshot?.chaos ?? {
    enabled: false,
    latencyMs: 0 as const,
    forceServerError: false,
    bypassClientValidation: false,
  };

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const applyPatch = async (patch: Parameters<typeof updateChaos>[0]) => {
    setIsSaving(true);
    try {
      await updateChaos(patch);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Discrete Floating QA Trigger */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          data-testid="chaos-drawer-toggle"
          aria-expanded={isOpen}
          className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${
            chaos.enabled
              ? "border-amber bg-charcoal-850 text-amber hover:bg-charcoal-800"
              : "border-graphite-700 bg-obsidian-900/95 text-stone hover:border-graphite-600 hover:text-ivory"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              chaos.enabled ? "bg-amber" : "bg-ash"
            }`}
          />
          <span>{chaos.enabled ? "QA // Chaos Active" : "QA // Chaos Monkey"}</span>
        </button>
      </div>

      {/* Modal / Side Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chaos-drawer-title"
          data-testid="chaos-drawer"
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-[1px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-graphite-700 bg-obsidian-900 p-6 text-ivory shadow-2xl">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-start justify-between border-b border-graphite-700 pb-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
                    QA FAULT INJECTION
                  </p>
                  <h2
                    id="chaos-drawer-title"
                    className="mt-1 font-serif text-2xl text-ivory"
                  >
                    Chaos Monkey
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleClose}
                  data-testid="chaos-drawer-close"
                  className="border border-graphite-700 px-2.5 py-1 font-mono text-xs text-stone hover:border-graphite-600 hover:text-ivory"
                >
                  ESC
                </button>
              </div>

              <p className="font-sans text-xs leading-relaxed text-stone">
                Simulate adverse network and validation conditions to verify how
                Gréias behaves under failure. By default, strict fintech rules
                apply.
              </p>

              {/* Master Switch */}
              <div className="flex items-center justify-between border border-graphite-700 bg-charcoal-850 p-4">
                <div>
                  <p className="font-mono text-xs tracking-wider text-ivory uppercase">
                    Chaos Mode
                  </p>
                  <p className="mt-0.5 text-xs text-ash">
                    Master switch for active fault injections
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={chaos.enabled}
                  disabled={isSaving}
                  data-testid="chaos-master-toggle"
                  onClick={() => void applyPatch({ enabled: !chaos.enabled })}
                  className={`border px-3 py-1 font-mono text-xs uppercase transition-colors ${
                    chaos.enabled
                      ? "border-amber bg-amber/15 text-amber"
                      : "border-graphite-700 bg-obsidian-900 text-stone"
                  }`}
                >
                  {chaos.enabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Artificial Latency */}
              <div className="space-y-2 border border-graphite-700 bg-charcoal-850 p-4">
                <p className="font-mono text-xs tracking-wider text-ivory uppercase">
                  Artificial Latency
                </p>
                <p className="text-xs text-ash">
                  Test loading spinners, disabled buttons, and double-click
                  idempotency.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {([0, 1500, 3500] as const).map((ms) => (
                    <button
                      key={ms}
                      type="button"
                      disabled={isSaving}
                      data-testid={`chaos-latency-${ms}`}
                      onClick={() =>
                        void applyPatch({
                          latencyMs: ms,
                          enabled: ms > 0 ? true : chaos.enabled,
                        })
                      }
                      className={`border py-1.5 font-mono text-xs transition-colors ${
                        chaos.latencyMs === ms
                          ? "border-sage bg-sage/15 text-sage"
                          : "border-graphite-700 bg-obsidian-900 text-stone hover:border-graphite-600"
                      }`}
                    >
                      {ms === 0 ? "0 ms" : `+${ms} ms`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Force HTTP 500 */}
              <div className="flex items-center justify-between border border-graphite-700 bg-charcoal-850 p-4">
                <div className="pr-4">
                  <p className="font-mono text-xs tracking-wider text-ivory uppercase">
                    Force HTTP 500 Outage
                  </p>
                  <p className="mt-0.5 text-xs text-ash">
                    API endpoints fail with simulated server error (except
                    /api/reset).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={chaos.forceServerError}
                  disabled={isSaving}
                  data-testid="chaos-force-500-toggle"
                  onClick={() =>
                    void applyPatch({
                      forceServerError: !chaos.forceServerError,
                      enabled: !chaos.forceServerError ? true : chaos.enabled,
                    })
                  }
                  className={`shrink-0 border px-3 py-1 font-mono text-xs uppercase ${
                    chaos.forceServerError
                      ? "border-terracotta bg-terracotta/15 text-terracotta"
                      : "border-graphite-700 bg-obsidian-900 text-stone"
                  }`}
                >
                  {chaos.forceServerError ? "ACTIVE" : "OFF"}
                </button>
              </div>

              {/* Bypass Client Validation */}
              <div className="flex items-center justify-between border border-graphite-700 bg-charcoal-850 p-4">
                <div className="pr-4">
                  <p className="font-mono text-xs tracking-wider text-ivory uppercase">
                    Bypass Client Validation
                  </p>
                  <p className="mt-0.5 text-xs text-ash">
                    Submits raw invalid inputs to verify HTTP 422 server
                    defense.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={chaos.bypassClientValidation}
                  disabled={isSaving}
                  data-testid="chaos-bypass-client-toggle"
                  onClick={() =>
                    void applyPatch({
                      bypassClientValidation: !chaos.bypassClientValidation,
                      enabled: !chaos.bypassClientValidation
                        ? true
                        : chaos.enabled,
                    })
                  }
                  className={`shrink-0 border px-3 py-1 font-mono text-xs uppercase ${
                    chaos.bypassClientValidation
                      ? "border-amber bg-amber/15 text-amber"
                      : "border-graphite-700 bg-obsidian-900 text-stone"
                  }`}
                >
                  {chaos.bypassClientValidation ? "ACTIVE" : "OFF"}
                </button>
              </div>
            </div>

            <div className="border-t border-graphite-700 pt-4">
              <button
                type="button"
                disabled={isSaving}
                data-testid="chaos-disable-all-btn"
                onClick={() =>
                  void applyPatch({
                    enabled: false,
                    latencyMs: 0,
                    forceServerError: false,
                    bypassClientValidation: false,
                  })
                }
                className="w-full border border-graphite-700 bg-obsidian-950 py-2 font-mono text-xs tracking-wider text-stone uppercase hover:border-graphite-600 hover:text-ivory"
              >
                Restore Normal Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}