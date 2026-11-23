"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEnvironment } from "./EnvironmentProvider";
import {
  StudyHubPanelContent,
  StudyHubSectionId,
} from "./StudyHubPanels";

interface HubItem {
  id: StudyHubSectionId;
  title: string;
}

const HUB_ITEMS: HubItem[] = [
  { id: "01", title: "ABOUT & HOW TO USE" },
  { id: "02", title: "BUSINESS RULES" },
  { id: "03", title: "STUDY TRACKS" },
  { id: "04", title: "QA GUIDE" },
  { id: "05", title: "QA BOARD" },
  { id: "06", title: "DESIGN SPECS" },
  { id: "07", title: "LAB COMMS" },
];

export function StudyHubDrawer() {
  const { isStudyHubOpen, setIsStudyHubOpen, studyHubTriggerRef } =
    useEnvironment();
  const [activeSection, setActiveSection] = useState<StudyHubSectionId>("01");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isStudyHubOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsStudyHubOpen(false);
        studyHubTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStudyHubOpen, setIsStudyHubOpen, studyHubTriggerRef]);

  const handleClose = () => {
    setIsStudyHubOpen(false);
    studyHubTriggerRef.current?.focus();
  };

  if (!isStudyHubOpen) return null;

  const activeMeta =
    HUB_ITEMS.find((i) => i.id === activeSection) ?? HUB_ITEMS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-hub-title"
      data-testid="study-hub-drawer"
      className="fixed inset-0 z-50 flex justify-start bg-black/75 backdrop-blur-[1px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="flex h-full w-full max-w-3xl flex-col border-r border-graphite-700 bg-obsidian-900 text-ivory shadow-2xl">
        <div className="flex items-start justify-between border-b border-graphite-700 px-6 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.24em] text-sage uppercase">
              GRÉIAS LAB // STUDY HUB
            </p>
            <h2
              id="study-hub-title"
              className="mt-1 font-serif text-2xl text-ivory"
            >
              {activeMeta.title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            data-testid="study-hub-close"
            className="border border-graphite-700 px-2.5 py-1 font-mono text-xs text-stone hover:border-graphite-600 hover:text-ivory"
          >
            ESC
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          <nav
            aria-label="Study Hub sections"
            className="w-full shrink-0 divide-y divide-graphite-700/50 border-b border-graphite-700 bg-obsidian-950/70 md:w-56 md:border-b-0 md:border-r"
          >
            {HUB_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  data-testid={`study-hub-tab-${item.id}`}
                  className={`group relative flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-charcoal-850 focus-visible:bg-charcoal-850 ${
                    isActive ? "bg-charcoal-850" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 h-full w-[2.5px] transition-opacity duration-150 ${
                      isActive
                        ? "bg-sage opacity-100"
                        : "bg-sage opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                    }`}
                  />
                  <span className="font-mono text-[10px] tracking-wider text-stone group-hover:text-ivory">
                    {item.id}
                  </span>
                  <span
                    className="h-2.5 w-px bg-graphite-700"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[10px] tracking-[0.14em] text-ivory uppercase">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex-1 overflow-y-auto p-6">
            <StudyHubPanelContent section={activeSection} />
          </div>
        </div>
      </div>
    </div>
  );
}