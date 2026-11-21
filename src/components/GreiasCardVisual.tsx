import React from "react";
import { EyeLogo } from "./EyeLogo";

interface GreiasCardVisualProps {
  holderName?: string;
  last4?: string;
  validThru?: string;
  variant?: "hero" | "compact";
  status?: "ACTIVE" | "FROZEN";
  revealedPan?: string | null;
  revealedCvv?: string | null;
  showCvvSlot?: boolean;
}

export function GreiasCardVisual({
  holderName = "PERSEU B.",
  last4 = "4821",
  validThru = "08/30",
  variant = "hero",
  status = "ACTIVE",
  revealedPan = null,
  revealedCvv = null,
  showCvvSlot = false,
}: GreiasCardVisualProps) {
  const isHero = variant === "hero";

  return (
    <div className="relative select-none">
      {isHero && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 right-8 h-56 w-56 rounded-full opacity-25 blur-sm"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(216,212,204,0.22) 0%, rgba(30,30,30,0.4) 55%, transparent 72%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-7 left-1/2 h-16 w-[92%] -translate-x-1/2 rounded-sm border-t border-graphite-700/70 bg-gradient-to-b from-charcoal-800/80 via-obsidian-900 to-obsidian-950 shadow-[0_-10px_40px_rgba(0,0,0,0.9)]"
          />
        </>
      )}

      <div
        data-testid="greias-card-visual"
        className={`relative overflow-hidden rounded-xl border border-silver/30 greias-brushed-metal shadow-[0_28px_70px_rgba(0,0,0,0.9)] transition-transform duration-500 ${
          isHero
            ? "aspect-[1.586/1] w-full max-w-[450px] p-6 sm:p-7 lg:-rotate-[4deg]"
            : "aspect-[1.586/1] w-full max-w-[380px] p-5 sm:p-6"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl border border-fillet/20"
        />

        {status === "FROZEN" && (
          <div
            data-testid="card-frozen-overlay"
            className="absolute inset-0 z-20 flex items-center justify-center bg-obsidian-950/75 backdrop-blur-[1px]"
          >
            <span className="border border-graphite-600 bg-charcoal-850 px-3 py-1 font-mono text-xs tracking-[0.25em] text-stone uppercase">
              CARD FROZEN
            </span>
          </div>
        )}

        <svg
          viewBox="0 0 220 180"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-5 h-[78%] w-[52%] opacity-75"
        >
          <path
            d="M42 26L76 42L96 68L128 84L142 114L168 156"
            stroke="#8E8B85"
            strokeOpacity="0.45"
            strokeWidth="0.9"
          />
          <path
            d="M96 68L102 104L74 128"
            stroke="#8E8B85"
            strokeOpacity="0.4"
            strokeWidth="0.9"
          />
          <path
            d="M128 84L146 92L142 114"
            stroke="#8E8B85"
            strokeOpacity="0.35"
            strokeWidth="0.8"
          />
          <circle cx="42" cy="26" r="1.2" fill="#D8D4CC" />
          <circle cx="76" cy="42" r="1.4" fill="#D8D4CC" />
          <circle cx="96" cy="68" r="2" fill="#F2EFE9" />
          <circle cx="128" cy="84" r="1.4" fill="#D8D4CC" />
          <circle cx="146" cy="92" r="1.1" fill="#A6A29A" />
          <circle cx="102" cy="104" r="1.5" fill="#D8D4CC" />
          <circle cx="74" cy="128" r="1.3" fill="#A6A29A" />
          <circle cx="142" cy="114" r="1.5" fill="#D8D4CC" />
          <circle cx="156" cy="134" r="2.2" fill="#F2EFE9" />
          <circle cx="168" cy="156" r="1.3" fill="#A6A29A" />
          <circle cx="58" cy="66" r="0.7" fill="#73706A" />
          <circle cx="170" cy="48" r="0.7" fill="#73706A" />
          <circle cx="188" cy="96" r="0.8" fill="#8E8B85" />
          <circle cx="122" cy="144" r="0.7" fill="#73706A" />
        </svg>

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EyeLogo className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="font-serif text-sm tracking-[0.3em] text-ivory sm:text-base">
                GRÉIAS
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.28em] text-stone uppercase">
              CARD
            </span>
          </div>

          <div className="my-auto flex items-center gap-3.5 pt-2">
            <div
              aria-hidden="true"
              className="relative h-8 w-11 rounded-[4px] border border-fillet/60 bg-gradient-to-br from-fillet/80 via-silver/70 to-graphite-700 shadow-inner"
            >
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-obsidian-900/45" />
              <div className="absolute inset-y-0 left-1/3 w-px bg-obsidian-900/45" />
              <div className="absolute inset-y-0 right-1/3 w-px bg-obsidian-900/45" />
              <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-obsidian-900/45" />
            </div>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-5 w-5 text-silver"
            >
              <path
                d="M7 9.5C8.2 10.9 8.2 13.1 7 14.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M10.5 7.5C12.5 10 12.5 14 10.5 16.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M14 5.5C16.8 9.2 16.8 14.8 14 18.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1.5">
              <p
                data-testid="card-pan-display"
                className="font-mono text-xs tracking-[0.2em] text-ivory/90 sm:text-sm"
              >
                {revealedPan ?? `•••• •••• •••• ${last4}`}
              </p>
              <div className="space-y-0.5">
                <p
                  data-testid="card-holder-name"
                  className="font-mono text-[11px] tracking-[0.2em] text-fillet uppercase sm:text-xs"
                >
                  {holderName}
                </p>
                <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.18em] text-ash uppercase">
                  <span>
                    VALID THRU{" "}
                    <span className="ml-1 text-stone">{validThru}</span>
                  </span>
                  {showCvvSlot && (
                    <span data-testid="card-cvv-display">
                      CVV{" "}
                      <span className="ml-1 text-stone">
                        {revealedCvv ?? "•••"}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
