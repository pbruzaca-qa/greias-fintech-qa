"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { buildGreiasPostmanCollection } from "@/lib/postmanCollection";

export type CliffSectionId = "01" | "02" | "03" | "04";

interface StudyTrackItem {
  id: string;
  title: string;
  detail: string;
}

interface StudyTrack {
  code: string;
  title: string;
  focus: string;
  items: StudyTrackItem[];
}

const STUDY_TRACKS_STORAGE_KEY = "greias-lab-study-tracks-v1";

const STUDY_TRACKS: StudyTrack[] = [
  {
    code: "TRACK 01",
    title: "Manual & Boundary QA",
    focus: "Business rules, cents precision, and UI edge cases",
    items: [
      {
        id: "t1-onboarding",
        title: "Onboarding limits (/open-account)",
        detail:
          "Test repeated-digit Tax ID (111.111.111-11), negative deposits, and deposits above $100,000.00.",
      },
      {
        id: "t1-transfers",
        title: "Cents & transfer ceilings (Pix vs. Wire)",
        detail:
          "Verify $0.00 Pix fee vs. $2.50 Wire fee, $5,000.00 per-transfer cap, $10,000.00 daily limit, and self-transfer block.",
      },
      {
        id: "t1-card",
        title: "Smart Card lifecycle (/workspace)",
        detail:
          "Freeze the card, attempt a simulated purchase (verify 422 + DECLINED ledger entry), update invoice limit, and pay invoice.",
      },
      {
        id: "t1-dom",
        title: "Accessibility & DOM resilience",
        detail:
          "Navigate tabs and modals via keyboard (Tab / Esc) and test Pix / Wire switching with browser translation on (BUG-GRE-001).",
      },
    ],
  },
  {
    code: "TRACK 02",
    title: "API & Contract Testing",
    focus: "HTTP status codes, security masking, and idempotency",
    items: [
      {
        id: "t2-postman",
        title: "Import live REST collection",
        detail:
          "Download the 13-route Postman Collection from Module 02 and validate HTTP 200, 201, 400, and 422 contracts.",
      },
      {
        id: "t2-security",
        title: "Audit PAN / CVV masking",
        detail:
          "Inspect GET /api/account in DevTools Network to confirm full card numbers and CVV never leak before reveal (BUG-GRE-003).",
      },
      {
        id: "t2-idempotency",
        title: "Verify Idempotency-Key behavior",
        detail:
          "Send POST /api/transfers/pix twice with the same Idempotency-Key header and confirm only one debit is executed.",
      },
    ],
  },
  {
    code: "TRACK 03",
    title: "Chaos Engineering & Bug Hunting",
    focus: "Fault injection, race conditions, and state truth",
    items: [
      {
        id: "t3-bypass",
        title: "Server-side barrier (Bypass Client Validation)",
        detail:
          "Enable client bypass in Chaos Monkey and submit invalid inputs to prove the backend enforces HTTP 422.",
      },
      {
        id: "t3-outages",
        title: "Outage & timeout resilience (500 / 504 / 429)",
        detail:
          "Trigger server errors, gateway timeouts, and rate limits during transfers and confirm zero phantom debits in Live Statement.",
      },
      {
        id: "t3-race",
        title: "Reproduce race condition",
        detail:
          "Combine Latency (+3500ms) + Disable Idempotency and double-click Send Pix to observe duplicate debit risk.",
      },
      {
        id: "t3-desync",
        title: "Hunt UI desync (Stale Balance)",
        detail:
          "Enable Stale Balance UI Desync, execute a transaction, and compare header balance against GET /api/account.",
      },
    ],
  },
  {
    code: "TRACK 04",
    title: "E2E Automation & Evidence Portfolio",
    focus: "Repeatable suites and structured defect reports",
    items: [
      {
        id: "t4-e2e",
        title: "Deterministic E2E flow",
        detail:
          "Write an automated test calling POST /api/reset first, driving actions via stable data-testid hooks, and asserting on /api/statement.",
      },
      {
        id: "t4-report",
        title: "Portfolio bug report (BUG-GRE standard)",
        detail:
          "Document a discovered failure with reproduction steps, expected vs. actual behavior, Network evidence, and severity.",
      },
    ],
  },
];

const TOTAL_TRACK_ITEMS = STUDY_TRACKS.reduce(
  (sum, track) => sum + track.items.length,
  0
);

function readCompletedTracks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STUDY_TRACKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeCompletedTracks(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STUDY_TRACKS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota errors
  }
}

export function CliffLabPanelContent({
  section,
}: {
  section: CliffSectionId;
}) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    if (section === "03") {
      setCompletedIds(readCompletedTracks());
    }
  }, [section]);

  const handleDownloadPostman = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const collection = buildGreiasPostmanCollection(origin);
    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "greias-fintech-qa.postman_collection.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleTrackItem = (itemId: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      writeCompletedTracks(next);
      return next;
    });
  };

  const handleResetProgress = () => {
    setCompletedIds([]);
    writeCompletedTracks([]);
  };

  if (section === "01") {
    return (
      <div
        key="panel-01"
        className="space-y-5 text-sm leading-relaxed text-stone"
      >
        <p className="text-ivory">
          <strong className="font-medium">Gréias Lab — Fintech QA</strong> is the
          study workbench connected to{" "}
          <strong className="font-medium">Gréias Fintech</strong>, a simulated
          digital bank built for manual, exploratory, API, and E2E QA practice.
        </p>

        <div className="border border-graphite-700 bg-obsidian-950 p-4 font-mono text-xs">
          <p className="text-[10px] tracking-[0.2em] text-sage uppercase">
            HOW TO USE THIS ENVIRONMENT
          </p>
          <ul className="mt-2.5 space-y-2 text-stone">
            <li>
              <span className="text-ivory">1. Review Rules & Guides:</span> Use
              the left menu modules before running test sessions.
            </li>
            <li>
              <span className="text-ivory">2. Launch the Bank:</span> Select{" "}
              <span className="text-ivory">[ WORKBENCH TERMINAL ] →</span> to
              enter Gréias Digital Bank (`/bank`).
            </li>
            <li>
              <span className="text-ivory">3. Educational Notice:</span> All
              balances, accounts, cards, and transfers are strictly fictional.
            </li>
          </ul>
        </div>

        <div className="pt-1">
          <Link
            href="/bank"
            data-testid="panel-01-open-bank"
            className="inline-flex items-center gap-2 border border-ivory bg-ivory px-5 py-2.5 font-serif text-xs font-medium text-obsidian-900 hover:bg-fillet"
          >
            <span>Open Workbench Terminal</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  if (section === "02") {
    return (
      <div key="panel-02" className="space-y-5 text-sm text-stone">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-graphite-700 bg-obsidian-950 p-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-sage uppercase">
              API & EXTERNAL PRACTICE
            </p>
            <p className="mt-1 text-xs text-stone">
              Import all 13 live routes directly into Postman or Insomnia.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPostman}
            data-testid="download-postman-btn"
            className="border border-ivory bg-ivory px-4 py-2 font-mono text-xs font-medium text-obsidian-900 hover:bg-fillet"
          >
            <span>Download Postman Collection (.json)</span>
          </button>
        </div>

        <div className="space-y-3 border border-graphite-700 bg-obsidian-950 p-4 font-mono text-xs">
          <p className="text-[10px] tracking-[0.2em] text-ash uppercase">
            IMPLEMENTED FINTECH RULES (SOURCE OF TRUTH)
          </p>
          <ul className="space-y-2 leading-relaxed">
            <li>
              <span className="text-ivory">Seed Account:</span> Perseu B. •
              $12,500.00 • Pix `perseu.b@greias.fintech.test` • Tax ID
              `394.812.059-42`.
            </li>
            <li>
              <span className="text-ivory">
                Onboarding (`POST /api/accounts`):
              </span>{" "}
              Rejects repeated-digit Tax IDs (`111.111.111-11`), negative
              deposits, or &gt; $100,000.00 (`HTTP 422`).
            </li>
            <li>
              <span className="text-ivory">
                Pix (`$0.00` fee) & Wire (`$2.50` fee):
              </span>{" "}
              Max `$5,000.00` per transfer, `$10,000.00` daily limit, blocks
              self-transfers, and enforces `Idempotency-Key`.
            </li>
            <li>
              <span className="text-ivory">Smart Card:</span> PAN/CVV never leak
              on `GET /api/account`; frozen cards or over-limit purchases return
              `422` and log `DECLINED` in `Live Statement`.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (section === "03") {
    const completedCount = completedIds.length;
    const progressPct =
      TOTAL_TRACK_ITEMS > 0
        ? Math.round((completedCount / TOTAL_TRACK_ITEMS) * 100)
        : 0;

    return (
      <div key="panel-03" className="space-y-5 text-sm text-stone">
        {/* Curriculum Header & Browser-Local Progress */}
        <div className="space-y-3 border border-graphite-700 bg-obsidian-950 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-md space-y-1">
              <p className="font-mono text-[10px] tracking-[0.2em] text-sage uppercase">
                CURATED QA CURRICULUM
              </p>
              <p className="text-xs leading-relaxed text-stone">
                Structured practice tracks mapped to real Gréias Fintech
                capabilities. Check items off as you test — progress stays
                private in this browser.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                data-testid="study-tracks-progress"
                className="font-mono text-xs tabular-nums text-ivory"
              >
                <span>{`${completedCount} / ${TOTAL_TRACK_ITEMS} completed`}</span>
              </span>
              <button
                type="button"
                onClick={handleResetProgress}
                disabled={completedCount === 0}
                data-testid="study-tracks-reset"
                className="border border-graphite-700 px-2.5 py-1 font-mono text-[10px] text-stone transition-colors hover:border-graphite-600 hover:text-ivory disabled:opacity-40"
              >
                <span>Reset progress</span>
              </button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="h-[2px] w-full bg-graphite-700/80"
          >
            <div
              className="h-full bg-sage transition-[width] duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 4 Curated Study Tracks */}
        <div className="space-y-4">
          {STUDY_TRACKS.map((track) => (
            <section
              key={track.code}
              className="border border-graphite-700 bg-obsidian-950 p-4"
            >
              <div className="border-b border-graphite-700/70 pb-2.5">
                <p className="font-mono text-[10px] tracking-[0.2em] text-sage uppercase">
                  <span>{track.code}</span>
                </p>
                <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-base text-ivory">
                    <span>{track.title}</span>
                  </h3>
                  <span className="font-mono text-[10px] text-ash">
                    <span>{track.focus}</span>
                  </span>
                </div>
              </div>

              <ul className="mt-3 space-y-2.5">
                {track.items.map((item) => {
                  const isChecked = completedIds.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label className="group flex cursor-pointer items-start gap-3 rounded-[2px] p-1.5 transition-colors hover:bg-obsidian-900/70">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTrackItem(item.id)}
                          data-testid={`track-item-${item.id}`}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-sage ${
                            isChecked
                              ? "border-sage bg-sage text-obsidian-950"
                              : "border-graphite-600 bg-obsidian-900 group-hover:border-stone"
                          }`}
                        >
                          {isChecked && (
                            <svg
                              viewBox="0 0 12 12"
                              fill="none"
                              className="h-2.5 w-2.5"
                            >
                              <path
                                d="M2.5 6.2L4.8 8.5L9.5 3.5"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>

                        <span className="space-y-0.5">
                          <span
                            className={`block font-mono text-xs transition-colors ${
                              isChecked
                                ? "text-stone line-through decoration-ash/80"
                                : "text-ivory"
                            }`}
                          >
                            <span>{item.title}</span>
                          </span>
                          <span className="block text-xs leading-relaxed text-ash">
                            <span>{item.detail}</span>
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div key="panel-04" className="space-y-4 text-sm text-stone">
      <p className="text-ivory">
        Combine <strong className="font-medium">Chrome DevTools (F12)</strong>,{" "}
        <strong className="font-medium">Postman</strong>, and{" "}
        <strong className="font-medium">Chaos Monkey</strong> inside the bank to
        verify UI behavior against real API truth.
      </p>

      <div className="space-y-2.5 border border-graphite-700 bg-obsidian-950 p-4 font-mono text-xs">
        <p className="text-[10px] tracking-[0.2em] text-sage uppercase">
          CORE QA DRILLS (`GRE-001` TO `GRE-016`)
        </p>
        <ul className="space-y-2">
          <li>
            <span className="text-ivory">1. Client vs. Server (`422`):</span>{" "}
            Enable `Bypass Client Validation` and send negative amounts or
            `111.111.111-11`.
          </li>
          <li>
            <span className="text-ivory">
              2. Outage & Timeout (`500 / 504 / 429`):
            </span>{" "}
            Trigger failures in Chaos Monkey and confirm zero phantom debits.
          </li>
          <li>
            <span className="text-ivory">3. Race Condition:</span> Enable
            `Latency +3500ms` + `Disable Idempotency` and double-click `Send Pix`.
          </li>
          <li>
            <span className="text-ivory">4. UI Desync Bug Hunting:</span>{" "}
            Enable `Stale Balance UI Desync` and compare header vs. `GET
            /api/account`.
          </li>
        </ul>
      </div>
    </div>
  );
}