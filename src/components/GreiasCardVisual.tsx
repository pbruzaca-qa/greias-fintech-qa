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

const CARD_FIELD_STARS: Array<{
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
}> = [
  // Left & upper-center spread (keeping logo, chip, and PAN area uncluttered)
  { cx: 34, cy: 62, r: 0.65, fill: "#8E8B85", opacity: 0.36 },
  { cx: 78, cy: 48, r: 0.75, fill: "#A6A29A", opacity: 0.4 },
  { cx: 122, cy: 34, r: 0.7, fill: "#8E8B85", opacity: 0.38 },
  { cx: 148, cy: 76, r: 0.85, fill: "#D8D4CC", opacity: 0.44 },
  { cx: 134, cy: 132, r: 0.7, fill: "#8E8B85", opacity: 0.36 },
  { cx: 28, cy: 156, r: 0.65, fill: "#8E8B85", opacity: 0.34 },
  { cx: 168, cy: 196, r: 0.75, fill: "#A6A29A", opacity: 0.38 },
  { cx: 196, cy: 214, r: 0.65, fill: "#8E8B85", opacity: 0.34 },
  { cx: 184, cy: 46, r: 0.8, fill: "#A6A29A", opacity: 0.42 },
  { cx: 216, cy: 92, r: 0.7, fill: "#8E8B85", opacity: 0.38 },
  { cx: 204, cy: 148, r: 0.8, fill: "#D8D4CC", opacity: 0.44 },

  // Right field around the Perseus constellation
  { cx: 238, cy: 38, r: 0.75, fill: "#A6A29A", opacity: 0.42 },
  { cx: 256, cy: 124, r: 0.7, fill: "#8E8B85", opacity: 0.4 },
  { cx: 236, cy: 186, r: 0.8, fill: "#A6A29A", opacity: 0.44 },
  { cx: 274, cy: 218, r: 0.7, fill: "#8E8B85", opacity: 0.38 },
  { cx: 308, cy: 42, r: 0.85, fill: "#D8D4CC", opacity: 0.48 },
  { cx: 326, cy: 114, r: 0.75, fill: "#A6A29A", opacity: 0.44 },
  { cx: 318, cy: 164, r: 0.7, fill: "#8E8B85", opacity: 0.42 },
  { cx: 344, cy: 204, r: 0.85, fill: "#D8D4CC", opacity: 0.46 },
  { cx: 356, cy: 58, r: 0.75, fill: "#A6A29A", opacity: 0.44 },
  { cx: 352, cy: 138, r: 0.8, fill: "#D8D4CC", opacity: 0.48 },
  { cx: 294, cy: 192, r: 0.65, fill: "#8E8B85", opacity: 0.38 },
];

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
          style={{
            background:
              "linear-gradient(120deg, rgba(242,239,233,0.025) 0%, transparent 40%, rgba(10,10,10,0.2) 100%)",
          }}
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

        {/* Full-card visible small scattered stars */}
        <svg
          viewBox="0 0 380 240"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {CARD_FIELD_STARS.map((star, index) => (
            <circle
              key={index}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill={star.fill}
              opacity={star.opacity}
            />
          ))}
        </svg>

        {/* Perseus Constellation highlight with ultra-thin broken guide lines */}
        <svg
          viewBox="0 0 220 180"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-4 h-[82%] w-[56%] opacity-80"
        >
          <defs>
            <radialGradient id="greias-card-star-metal" cx="35%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#F2EFE9" />
              <stop offset="55%" stopColor="#D8D4CC" />
              <stop offset="100%" stopColor="#73706A" />
            </radialGradient>
            <radialGradient id="greias-card-star-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F2EFE9" stopOpacity="0.24" />
              <stop offset="55%" stopColor="#D8D4CC" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#8E8B85" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d="M130 19L121 32"
            stroke="#A6A29A"
            strokeOpacity="0.22"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="2.5 3.5"
          />
          <path
            d="M117 39L109 54"
            stroke="#A6A29A"
            strokeOpacity="0.25"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="3.5 3 1.5 3.5"
          />
          <path
            d="M104 61L93 71"
            stroke="#A6A29A"
            strokeOpacity="0.22"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="2.5 3"
          />
          <path
            d="M89 78L78 120"
            stroke="#A6A29A"
            strokeOpacity="0.24"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="4 3.5 2 4"
          />
          <path
            d="M77 129L74 147"
            stroke="#A6A29A"
            strokeOpacity="0.22"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="3 3.5"
          />
          <path
            d="M75 155L80 165"
            stroke="#A6A29A"
            strokeOpacity="0.2"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
          <path
            d="M111 58L119 59"
            stroke="#A6A29A"
            strokeOpacity="0.2"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="2 2.5"
          />
          <path
            d="M126 59L146 57"
            stroke="#A6A29A"
            strokeOpacity="0.18"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="3 4"
          />
          <path
            d="M123 63L126 85"
            stroke="#A6A29A"
            strokeOpacity="0.24"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="3 3.5 1.5 3"
          />
          <path
            d="M127 93L130 112"
            stroke="#A6A29A"
            strokeOpacity="0.24"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="3 3.5"
          />

          <circle cx="107" cy="58" r="5" fill="url(#greias-card-star-halo)" />
          <circle cx="131" cy="117" r="4.5" fill="url(#greias-card-star-halo)" />

          <circle cx="132" cy="16" r="1.15" fill="url(#greias-card-star-metal)" />
          <circle cx="119" cy="35" r="1.25" fill="url(#greias-card-star-metal)" />
          <circle cx="107" cy="58" r="2.0" fill="url(#greias-card-star-metal)" />
          <circle cx="122" cy="59" r="1.1" fill="#D8D4CC" />
          <circle cx="150" cy="57" r="1.05" fill="#A6A29A" />
          <circle cx="90" cy="74" r="1.3" fill="url(#greias-card-star-metal)" />
          <circle cx="126" cy="89" r="1.1" fill="#D8D4CC" />
          <circle cx="131" cy="117" r="1.85" fill="url(#greias-card-star-metal)" />
          <circle cx="77" cy="125" r="1.4" fill="url(#greias-card-star-metal)" />
          <circle cx="74" cy="151" r="1.2" fill="url(#greias-card-star-metal)" />
          <circle cx="81" cy="168" r="1.35" fill="url(#greias-card-star-metal)" />
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