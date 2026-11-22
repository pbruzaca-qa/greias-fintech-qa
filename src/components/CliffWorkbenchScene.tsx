"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { CliffLabPanelContent, CliffSectionId } from "./CliffLabPanels";

interface MenuEntry {
  id: CliffSectionId;
  title: string;
  subtitle: string;
}

const MENU_ITEMS: MenuEntry[] = [
  {
    id: "01",
    title: "ABOUT & HOW TO USE",
    subtitle: "Overview of Gréias Lab & Bank workspace",
  },
  {
    id: "02",
    title: "BUSINESS RULES",
    subtitle: "Fintech source of truth & Postman Collection",
  },
  {
    id: "03",
    title: "STUDY LOG",
    subtitle: "Study notes & improvement suggestions",
  },
  {
    id: "04",
    title: "QA GUIDE",
    subtitle: "DevTools F12, Chaos Monkey & test drills",
  },
];

export function CliffWorkbenchScene() {
  const [activeSection, setActiveSection] = useState<CliffSectionId | null>(
    null
  );
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastOpenedId = useRef<CliffSectionId | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!activeSection) return;
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const idToRestore = lastOpenedId.current;
        setActiveSection(null);
        if (idToRestore) {
          triggerRefs.current[idToRestore]?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSection]);

  const handleOpen = (id: CliffSectionId) => {
    lastOpenedId.current = id;
    setActiveSection(id);
  };

  const handleClose = () => {
    const idToRestore = lastOpenedId.current;
    setActiveSection(null);
    if (idToRestore) {
      triggerRefs.current[idToRestore]?.focus();
    }
  };

  const activeMeta = MENU_ITEMS.find((item) => item.id === activeSection);

  return (
    <div className="relative min-h-[calc(100vh-58px)] overflow-hidden bg-obsidian-950">
      {/* MONOCHROME EDITORIAL ENGRAVING SVG + CSS SCENE */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 820"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="orbitalHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F2EFE9" stopOpacity="0.22" />
              <stop offset="55%" stopColor="#8E8B85" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="skyEngrave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080808" />
              <stop offset="60%" stopColor="#101010" />
              <stop offset="100%" stopColor="#181818" />
            </linearGradient>
            <linearGradient id="cloudIvory" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8D4CC" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#73706A" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="seaMonochrome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D1D1D" />
              <stop offset="50%" stopColor="#111111" />
              <stop offset="100%" stopColor="#080808" />
            </linearGradient>
            <radialGradient id="lampBeam" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#F2EFE9" stopOpacity="0.34" />
              <stop offset="60%" stopColor="#D8D4CC" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Night Sky */}
          <rect width="1440" height="820" fill="url(#skyEngrave)" />

          {/* Subtle Star Field */}
          <g fill="#A6A29A" opacity="0.4">
            <circle cx="95" cy="78" r="0.9" />
            <circle cx="290" cy="54" r="1.1" />
            <circle cx="480" cy="96" r="0.8" />
            <circle cx="675" cy="48" r="1" />
            <circle cx="845" cy="118" r="0.9" />
            <circle cx="1030" cy="68" r="1.1" />
            <circle cx="1210" cy="130" r="0.8" />
          </g>

          {/* Stylized Drifting Engraving Clouds */}
          <g className="greias-cloud-drift" fill="url(#cloudIvory)">
            <path d="M290 470 Q340 385 430 405 Q475 340 565 365 Q615 275 710 305 Q765 200 885 225 Q965 130 1095 160 L1215 470 Z" />
            <path
              d="M360 470 Q425 415 510 432 Q575 375 660 398 Q740 318 845 348 L960 470 Z"
              fill="#0E0E0E"
              opacity="0.72"
            />
          </g>

          {/* Orbital Crosshair Moon & Trajectory (Image 3/4 inspiration) */}
          <g>
            <circle cx="315" cy="215" r="145" fill="url(#orbitalHalo)" />
            <circle
              cx="315"
              cy="215"
              r="142"
              fill="none"
              stroke="#73706A"
              strokeOpacity="0.4"
              strokeWidth="0.9"
            />
            <line
              x1="150"
              y1="215"
              x2="480"
              y2="215"
              stroke="#73706A"
              strokeOpacity="0.32"
              strokeWidth="0.8"
            />
            <line
              x1="315"
              y1="52"
              x2="315"
              y2="378"
              stroke="#73706A"
              strokeOpacity="0.32"
              strokeWidth="0.8"
            />
            {/* Primary Moon Sphere */}
            <circle
              cx="315"
              cy="215"
              r="24"
              fill="#141414"
              stroke="#A6A29A"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            <path
              d="M333 199 A 24 24 0 0 1 301 235 A 20 20 0 0 0 333 199 Z"
              fill="#F2EFE9"
              fillOpacity="0.55"
            />
            {/* Secondary Satellite */}
            <circle
              cx="392"
              cy="170"
              r="4"
              fill="#A6A29A"
              fillOpacity="0.65"
            />
            {/* Orbital Arc */}
            <path
              d="M339 208 Q 620 120 890 132"
              fill="none"
              stroke="#A6A29A"
              strokeOpacity="0.35"
              strokeWidth="0.9"
            />
          </g>

          {/* Ocean Horizon */}
          <rect x="0" y="468" width="840" height="352" fill="url(#seaMonochrome)" />

          {/* Moonlit Water Shimmer */}
          <g className="greias-water-shimmer" fill="#D8D4CC" fillOpacity="0.18">
            <rect x="230" y="482" width="120" height="2" rx="1" />
            <rect x="200" y="505" width="185" height="2.2" rx="1" />
            <rect x="220" y="532" width="150" height="2" rx="1" />
            <rect x="185" y="564" width="210" height="2.5" rx="1" />
            <rect x="215" y="602" width="165" height="2.2" rx="1" />
            <rect x="175" y="646" width="225" height="2.6" rx="1" />
            <rect x="210" y="698" width="145" height="2.2" rx="1" />
          </g>

          {/* Distant Lighthouse Promontory */}
          <path
            d="M495 470 L570 452 L630 426 L685 454 L735 470 Z"
            fill="#141414"
          />
          <rect x="625" y="394" width="9" height="34" fill="#262626" />
          <circle cx="629.5" cy="392" r="2.8" fill="#F2EFE9" opacity="0.85" />

          {/* Sea Stacks Left */}
          <path d="M128 575 L152 496 L182 575 Z" fill="#0B0B0B" />
          <path d="M178 582 L198 532 L218 582 Z" fill="#121212" />

          {/* Main Cliff Rock Formation Right */}
          <path
            d="M525 820 L615 660 L725 572 L815 472 L1085 278 L1320 92 L1440 42 L1440 820 Z"
            fill="#0C0C0C"
            stroke="#242424"
            strokeWidth="1"
          />
          <path
            d="M665 820 L742 652 L855 616 L1440 616 L1440 820 Z"
            fill="#141414"
          />

          {/* Concrete Terrace, Canopy & G—L Pillar */}
          <polygon
            points="695,604 1345,604 1385,624 665,624"
            fill="#282828"
            stroke="#525252"
            strokeWidth="1"
          />
          <rect
            x="1282"
            y="312"
            width="88"
            height="292"
            fill="#1D1D1D"
            stroke="#333333"
            strokeWidth="1"
          />
          {/* Engraved G—L Pillar Text */}
          <g fill="#73706A" fontFamily="monospace" fontSize="9" letterSpacing="2">
            <text x="1302" y="366">G — L</text>
            <text x="1302" y="392" fontSize="7">DISCIPLINE</text>
            <text x="1302" y="405" fontSize="7">OBSERVATION</text>
            <text x="1302" y="418" fontSize="7">BETTER</text>
            <text x="1302" y="431" fontSize="7">SYSTEMS</text>
          </g>

          {/* Canopy Roof & Posts */}
          <polygon
            points="672,306 1045,240 1320,312 950,356"
            fill="#181818"
            stroke="#525252"
            strokeWidth="1.2"
          />
          <rect x="742" y="348" width="12" height="256" fill="#171717" />
          <rect x="1210" y="316" width="14" height="288" fill="#151515" />
          <line
            x1="1215"
            y1="322"
            x2="1125"
            y2="415"
            stroke="#2B2B2B"
            strokeWidth="8"
          />

          {/* Hanging Lamp + Light Cone */}
          <line x1="1085" y1="318" x2="1085" y2="394" stroke="#525252" strokeWidth="2" />
          <path d="M1066 408 L1104 408 L1095 394 L1075 394 Z" fill="#2B2B2B" />
          <circle cx="1085" cy="409" r="4.8" fill="#F2EFE9" />
          <polygon points="1070,409 1100,409 1198,564 972,564" fill="url(#lampBeam)" />

          {/* Workbench Desk & Coiled Cables */}
          <rect
            x="930"
            y="510"
            width="325"
            height="14"
            fill="#2A2A2A"
            stroke="#525252"
            strokeWidth="0.8"
          />
          <rect x="952" y="524" width="14" height="80" fill="#1C1C1C" />
          <rect x="1220" y="524" width="14" height="80" fill="#1C1C1C" />
          {/* Coiled Cables Right */}
          <g fill="none" stroke="#525252" strokeWidth="1.6">
            <ellipse cx="1218" cy="564" rx="14" ry="24" />
            <ellipse cx="1221" cy="566" rx="10" ry="20" />
          </g>
          {/* Stool & Storage Crate */}
          <rect x="974" y="556" width="44" height="7" fill="#262626" />
          <line x1="982" y1="563" x2="977" y2="604" stroke="#222222" strokeWidth="4" />
          <line x1="1010" y1="563" x2="1015" y2="604" stroke="#222222" strokeWidth="4" />
          <rect x="1128" y="576" width="46" height="28" fill="#1B1B1B" stroke="#333333" strokeWidth="1" />

          {/* Steps Bottom Right */}
          <g fill="#181818" stroke="#333333" strokeWidth="0.8">
            <rect x="1245" y="624" width="150" height="24" />
            <rect x="1215" y="648" width="180" height="26" />
            <rect x="1185" y="674" width="210" height="28" />
            <rect x="1155" y="702" width="240" height="32" />
          </g>

          {/* Retro CRT Monitor on Workbench */}
          <rect x="1078" y="496" width="16" height="14" fill="#262626" />
          <rect x="1058" y="507" width="56" height="3" fill="#3D3D3D" />
          {/* CRT Chassis */}
          <rect
            x="1028"
            y="428"
            width="116"
            height="70"
            rx="4"
            fill="#191919"
            stroke="#8E8B85"
            strokeWidth="1.4"
          />
          {/* CRT Inner Screen */}
          <rect
            x="1036"
            y="435"
            width="92"
            height="54"
            rx="2"
            fill="#0A0A0A"
            stroke="#333333"
            strokeWidth="1"
          />
          {/* CRT Screen Graphics (Sage Green Terminal + Radar Reticle) */}
          <g className="greias-monitor-pulse">
            <line x1="1044" y1="448" x2="1076" y2="448" stroke="#9CB4A3" strokeOpacity="0.7" strokeWidth="1.2" />
            <line x1="1044" y1="455" x2="1068" y2="455" stroke="#9CB4A3" strokeOpacity="0.45" strokeWidth="1" />
            <line x1="1044" y1="462" x2="1074" y2="462" stroke="#9CB4A3" strokeOpacity="0.45" strokeWidth="1" />
            <rect x="1044" y="470" width="5" height="7" fill="#9CB4A3" fillOpacity="0.85" />
            <circle cx="1104" cy="462" r="14" fill="none" stroke="#9CB4A3" strokeOpacity="0.6" strokeWidth="0.9" />
            <circle cx="1104" cy="462" r="2.2" fill="#9CB4A3" />
            <line x1="1104" y1="444" x2="1104" y2="480" stroke="#9CB4A3" strokeOpacity="0.35" strokeWidth="0.8" />
            <line x1="1086" y1="462" x2="1122" y2="462" stroke="#9CB4A3" strokeOpacity="0.35" strokeWidth="0.8" />
          </g>

          {/* Pointer Line to CRT Terminal */}
          <polyline
            points="916,442 982,442 1016,466"
            fill="none"
            stroke="#A6A29A"
            strokeWidth="1.1"
          />
          <circle cx="1016" cy="466" r="3" fill="#F2EFE9" />
        </svg>

        {/* Left Scrim for Menu Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/90 via-obsidian-950/35 to-transparent lg:via-transparent" />
      </div>

      {/* Subtle Corner Microtexts (Desktop XL, English, Monochrome) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-6 z-10 hidden justify-between font-mono text-[9px] leading-relaxed tracking-[0.22em] text-ash uppercase xl:flex"
      >
        <p className="max-w-[140px]">
          TESTING IS A WAY OF CARING FOR TOMORROW.
        </p>
        <p className="text-right">
          SYSTEMS / PEOPLE / TRUST / TIME
        </p>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 bottom-6 z-10 hidden justify-between font-mono text-[9px] leading-relaxed tracking-[0.22em] text-ash uppercase xl:flex"
      >
        <p className="max-w-[150px]">
          QUALITY SUSTAINS NEW HORIZONS.
        </p>
        <p className="max-w-[140px] text-right">
          EVEN THE INVISIBLE MUST WORK.
        </p>
      </div>

      {/* FOREGROUND INTERACTIVE UI */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-58px)] max-w-[1360px] flex-col justify-between gap-10 px-4 py-10 sm:px-8 lg:flex-row lg:items-center lg:py-16">
        {/* Left Navigation Menu (01..04) */}
        <nav
          aria-label="Gréias Lab sections"
          className="w-full max-w-md space-y-2"
        >
          <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-ash uppercase">
            WORKBENCH HUB // SELECT A MODULE
          </p>

          {MENU_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  triggerRefs.current[item.id] = el;
                }}
                type="button"
                onClick={() => handleOpen(item.id)}
                data-testid={`cliff-menu-${item.id}`}
                aria-expanded={isActive}
                className={`group relative flex w-full items-center gap-5 border border-graphite-700/70 bg-obsidian-900/85 px-5 py-3.5 text-left backdrop-blur-sm transition-colors hover:border-graphite-600 hover:bg-charcoal-850/95 focus-visible:bg-charcoal-850/95 ${
                  isActive ? "border-graphite-600 bg-charcoal-850/95" : ""
                }`}
              >
                {/* Sage-green vertical left bar ONLY on hover, focus, or active */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-full w-[3px] transition-opacity duration-150 ${
                    isActive
                      ? "bg-sage opacity-100"
                      : "bg-sage opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                />

                <span className="font-mono text-xs tracking-widest text-stone group-hover:text-ivory">
                  {item.id}
                </span>
                <span className="h-5 w-px bg-graphite-700" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs tracking-[0.22em] text-ivory uppercase">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ash group-hover:text-stone">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Workbench Terminal CTA (Click to Enter Gréias Fintech Bank) */}
        <div className="flex flex-col items-start gap-3 lg:items-end lg:self-center lg:pr-28">
          <Link
            href="/bank"
            data-testid="workbench-terminal-btn"
            className="group inline-flex items-center gap-4 border border-graphite-600 bg-obsidian-950/90 px-5 py-3 font-mono text-xs tracking-[0.22em] text-ivory uppercase shadow-2xl backdrop-blur-sm transition-colors hover:border-ivory hover:bg-charcoal-850"
          >
            <span>[ WORKBENCH TERMINAL ]</span>
            <span aria-hidden="true" className="text-stone group-hover:text-ivory">
              →
            </span>
          </Link>
          <p className="font-mono text-[10px] tracking-[0.2em] text-stone uppercase">
            LAUNCH GRÉIAS DIGITAL BANK (/bank)
          </p>
        </div>
      </div>

      {/* SECTION MODAL */}
      {activeSection && activeMeta && (
        <div
          key={`modal-${activeSection}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cliff-modal-title"
          data-testid="cliff-section-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="flex max-h-[88vh] w-full max-w-2xl flex-col border border-graphite-700 bg-obsidian-900 text-ivory shadow-2xl">
            <div className="flex items-start justify-between border-b border-graphite-700 px-6 py-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.24em] text-sage uppercase">
                  {`GRÉIAS LAB // MODULE ${activeMeta.id}`}
                </p>
                <h2
                  id="cliff-modal-title"
                  className="mt-1 font-serif text-2xl text-ivory"
                >
                  {activeMeta.title}
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleClose}
                data-testid="cliff-modal-close"
                className="border border-graphite-700 px-2.5 py-1 font-mono text-xs text-stone hover:border-graphite-600 hover:text-ivory"
              >
                ESC
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <CliffLabPanelContent section={activeSection} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}