"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { CliffLabPanelContent, CliffSectionId } from "./CliffLabPanels";

interface MenuEntry {
  id: CliffSectionId;
  title: string;
}

const MENU_ITEMS: MenuEntry[] = [
  { id: "01", title: "ABOUT & HOW TO USE" },
  { id: "02", title: "BUSINESS RULES" },
  { id: "03", title: "STUDY TRACKS" },
  { id: "04", title: "QA GUIDE" },
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
    <div className="hero-backdrop flex flex-col justify-center">
      {/* Desktop 16:9 Locked Background Image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 z-0 hidden -translate-y-1/2 lg:block"
        style={{
          width: "max(100%, calc((100vh - 58px) * 16 / 9))",
          aspectRatio: "16 / 9",
        }}
      >
        <img
          src="/images/cliff-desktop.jpg"
          alt=""
          className="h-full w-full select-none object-fill"
          style={{ filter: "contrast(1.04) brightness(0.98)" }}
        />
      </div>

      {/* Subtle Atmospheric Animation Overlays (Horizon Mist + Water Glint) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      >
        <div
          className="greias-mist-drift absolute left-[8%] top-[43%] h-24 w-[42%] rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(242,239,233,0.14) 0%, transparent 72%)",
          }}
        />
        <div
          className="greias-water-glint absolute bottom-[12%] left-[12%] h-28 w-[34%] rounded-full blur-xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(216,212,204,0.16) 0%, transparent 72%)",
          }}
        />
      </div>

      {/* Desktop Workbench Callout + Clickable Monitor Screen Box */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
        style={{
          width: "max(100%, calc((100vh - 58px) * 16 / 9))",
          aspectRatio: "16 / 9",
        }}
      >
        {/* Clickable sage frame inset cleanly inside the PC monitor screen */}
        <Link
          href="/bank"
          aria-label="Open Gréias Digital Bank via monitor"
          tabIndex={-1}
          style={{ left: "71.9%", top: "59.1%", width: "6.2%", height: "6.3%" }}
          className="pointer-events-auto absolute flex items-center justify-center rounded-[2px] transition-opacity hover:opacity-100"
        >
          <span className="greias-monitor-pulse flex h-full w-full items-center justify-center rounded-[2px] border border-sage/45 bg-sage/5">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
              className="h-[62%] w-[62%] opacity-90"
            >
              <path
                d="M11 8.5C13.6 6.8 16.7 6 20 6C23.3 6 26.4 6.8 29 8.5"
                stroke="#9CB4A3"
                strokeOpacity="0.7"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              <path
                d="M11 31.5C13.6 33.2 16.7 34 20 34C23.3 34 26.4 33.2 29 31.5"
                stroke="#9CB4A3"
                strokeOpacity="0.7"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              <path
                d="M6.5 20C10.2 14.2 14.8 11.5 20 11.5C25.2 11.5 29.8 14.2 33.5 20C29.8 25.8 25.2 28.5 20 28.5C14.8 28.5 10.2 25.8 6.5 20Z"
                stroke="#9CB4A3"
                strokeOpacity="0.9"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="20" r="2.8" fill="#9CB4A3" />
            </svg>
          </span>
        </Link>

        {/* Positioned Workbench Terminal CTA + Pointer Line */}
        <div
          style={{ right: "28.1%", top: "56.8%" }}
          className="pointer-events-auto absolute flex items-start"
        >
          <Link
            href="/bank"
            data-testid="workbench-terminal-btn"
            className="group inline-flex items-center gap-2.5 border border-graphite-600/90 bg-obsidian-950/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-ivory uppercase shadow-2xl backdrop-blur-sm transition-colors hover:border-sage hover:bg-charcoal-850"
          >
            <span
              aria-hidden="true"
              className="greias-monitor-pulse h-1.5 w-1.5 rounded-full bg-sage"
            />
            <span>[ WORKBENCH TERMINAL ]</span>
            <span
              aria-hidden="true"
              className="text-stone transition-transform group-hover:translate-x-0.5 group-hover:text-ivory"
            >
              →
            </span>
          </Link>

          {/* Technical Leader Line pointing toward the monitor */}
          <svg
            viewBox="0 0 84 34"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none -ml-px mt-3 h-8 w-16 shrink-0"
          >
            <polyline
              points="0,4 34,4 74,28"
              stroke="#A6A29A"
              strokeOpacity="0.85"
              strokeWidth="1"
            />
            <circle cx="74" cy="28" r="2.5" fill="#F2EFE9" />
          </svg>
        </div>
      </div>

      {/* FOREGROUND COMPACT LEFT MENU + MOBILE CTA */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1360px] flex-col justify-between gap-8 px-4 py-8 sm:px-8">
        <nav
          aria-label="Gréias Lab sections"
          className="w-full max-w-[198px] divide-y divide-graphite-700/40 border-y border-graphite-700/40 bg-obsidian-950/45 backdrop-blur-sm"
        >
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
                className={`group relative flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-obsidian-900/75 focus-visible:bg-obsidian-900/75 ${
                  isActive ? "bg-obsidian-900/80" : ""
                }`}
              >
                {/* Sage-green left vertical bar ONLY on hover, focus, or active */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-full w-[2.5px] transition-opacity duration-150 ${
                    isActive
                      ? "bg-sage opacity-100"
                      : "bg-sage opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                />

                <span className="font-mono text-[9.5px] tracking-wider text-stone group-hover:text-ivory">
                  {item.id}
                </span>
                <span className="h-2.5 w-px bg-graphite-700/80" aria-hidden="true" />
                <span className="font-mono text-[9.5px] tracking-[0.14em] text-ivory uppercase">
                  {item.title}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Mobile / Tablet CTA */}
        <div className="lg:hidden">
          <Link
            href="/bank"
            data-testid="workbench-terminal-btn-mobile"
            className="group inline-flex items-center gap-3 border border-graphite-600 bg-obsidian-950/85 px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-ivory uppercase backdrop-blur-sm transition-colors hover:border-sage"
          >
            <span
              aria-hidden="true"
              className="greias-monitor-pulse h-1.5 w-1.5 rounded-full bg-sage"
            />
            <span>[ WORKBENCH TERMINAL ]</span>
            <span aria-hidden="true" className="text-stone">
              →
            </span>
          </Link>
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