"use client";

import React, { useEffect, useState } from "react";
import { useEnvironment } from "@/components/EnvironmentProvider";
import { buildGreiasPostmanCollection } from "@/lib/postmanCollection";

export type StudyHubSectionId =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07";

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

const QA_STORIES = [
  {
    id: "STORY-01",
    title: "Digital Account Onboarding (KYC)",
    status: "READY FOR QA",
    criteria: [
      "Reject repeated-digit Tax IDs (e.g., 111.111.111-11) with HTTP 422.",
      "Reject negative or > $100,000.00 opening deposits.",
      "Prevent duplicate creation via Idempotency-Key.",
    ],
    tests: "GRE-002, GRE-003",
  },
  {
    id: "STORY-02",
    title: "Instant Transfers (Pix & Wire)",
    status: "READY FOR QA",
    criteria: [
      "Pix ($0.00 fee) & Wire ($2.50 fee included in balance check).",
      "Enforce $5,000/tx and $10,000/day limits; block self-transfers.",
      "Zero phantom debits on HTTP 500/504/429 outages.",
    ],
    tests: "GRE-005 to GRE-008, GRE-014",
  },
  {
    id: "STORY-03",
    title: "Smart Card Security & Invoice Caps",
    status: "READY FOR QA",
    criteria: [
      "Never expose PAN/CVV in GET /api/account; reveal only via POST /api/card/credentials.",
      "Frozen cards or over-limit purchases return 422 and log DECLINED in Statement.",
      "Pay Current Invoice debits checking balance atomically.",
    ],
    tests: "GRE-009 to GRE-012",
  },
  {
    id: "STORY-04",
    title: "Live Statement, Filters & Export",
    status: "READY FOR QA",
    criteria: [
      "Server-side filter via GET /api/statement?type=&status=&q=.",
      "Inspector modal closes with Esc and restores button focus.",
      "CSV & JSON exports match filtered table rows.",
    ],
    tests: "GRE-013, GRE-015",
  },
];

const DESIGN_TOKENS = [
  { name: "Obsidian Primary", hex: "#0A0A0A", usage: "Main page background" },
  { name: "Obsidian Secondary", hex: "#0E0E0E", usage: "Hero & footer bands" },
  { name: "Matte Charcoal", hex: "#161616", usage: "Card & panel surfaces" },
  { name: "Dark Graphite", hex: "#1E1E1E", usage: "Hover & metallic depth" },
  { name: "Border Graphite", hex: "#333333", usage: "1px hairline dividers" },
  { name: "Ivory High Contrast", hex: "#F2EFE9", usage: "Headings & primary CTA" },
  { name: "Stone Gray", hex: "#A6A29A", usage: "Body & subtitles" },
  { name: "Muted Ash", hex: "#73706A", usage: "Micro-labels & metadata" },
  { name: "Surgical Sage", hex: "#9CB4A3", usage: "Eye pupil, 01–03, active focus" },
];

export function StudyHubPanelContent({
  section,
}: {
  section: StudyHubSectionId;
}) {
  const { chaos } = useEnvironment();
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
      <div key="hub-01" className="space-y-4 text-sm leading-relaxed text-stone">
        <p className="text-ivory">
          <strong className="font-medium">Gréias — Fintech QA</strong> is a
          simulated digital bank built for real-world manual, exploratory, API,
          and E2E QA practice.
        </p>

        <div className="border border-graphite-700 bg-obsidian-950 p-4 font-mono text-xs">
          <p className="text-[10px] tracking-[0.2em] text-sage uppercase">
            WORKFLOW INSIDE THIS SANDBOX
          </p>
          <ul className="mt-2.5 space-y-2 text-stone">
            <li>
              <span className="text-ivory">1. Read Specs:</span> Check{" "}
              <span className="text-ivory">02 Business Rules</span> &{" "}
              <span className="text-ivory">05 QA Board</span> before testing.
            </li>
            <li>
              <span className="text-ivory">2. Inspect Network:</span> Keep{" "}
              <span className="text-ivory">DevTools (F12)</span> open to verify
              HTTP `201`, `422`, `429`, `500`, and `504` responses.
            </li>
            <li>
              <span className="text-ivory">3. Fault Injection:</span> Use{" "}
              <span className="text-ivory">QA // Chaos Monkey</span> (bottom
              right) to practice resilience and bug hunting.
            </li>
            <li>
              <span className="text-ivory">4. Reset Anytime:</span> Use{" "}
              <span className="text-ivory">Reset environment</span> in the
              header to restore the `Perseu B.` baseline.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (section === "02") {
    return (
      <div key="hub-02" className="space-y-4 text-sm text-stone">
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

        <div className="space-y-2.5 border border-graphite-700 bg-obsidian-950 p-4 font-mono text-xs">
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
              <span className="text-ivory">Onboarding (`POST /api/accounts`):</span>{" "}
              Rejects repeated-digit Tax IDs (`111.111.111-11`), negative
              deposits, or &gt; $100,000.00 (`HTTP 422`).
            </li>
            <li>
              <span className="text-ivory">Pix (`$0.00` fee) & Wire (`$2.50` fee):</span>{" "}
              Max `$5,000.00`/tx, `$10,000.00`/day, blocks self-transfers, and
              enforces `Idempotency-Key`.
            </li>
            <li>
              <span className="text-ivory">Smart Card:</span> PAN/CVV never leak
              on `GET /api/account`; frozen or over-limit purchases return `422`
              and log `DECLINED` in `Live Statement`.
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
      <div key="hub-03" className="space-y-5 text-sm text-stone">
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

  if (section === "04") {
    return (
      <div key="hub-04" className="space-y-4 text-sm text-stone">
        <p className="text-ivory">
          Combine <strong className="font-medium">Chrome DevTools (F12)</strong>,{" "}
          <strong className="font-medium">Postman</strong>, and{" "}
          <strong className="font-medium">Chaos Monkey</strong> to verify UI
          claims against server truth.
        </p>

        <div className="space-y-2.5 border border-graphite-700 bg-obsidian-950 p-4 font-mono text-xs">
          <p className="text-[10px] tracking-[0.2em] text-sage uppercase">
            CORE QA DRILLS (`GRE-001` TO `GRE-016`)
          </p>
          <ul className="space-y-2">
            <li>
              <span className="text-ivory">1. Client vs. Server (`422`):</span>{" "}
              Enable `Bypass Client Validation` and submit negative amounts or
              `111.111.111-11`.
            </li>
            <li>
              <span className="text-ivory">2. Outage & Timeout (`500 / 504 / 429`):</span>{" "}
              Trigger failures in Chaos Monkey and confirm zero phantom debits.
            </li>
            <li>
              <span className="text-ivory">3. Race Condition:</span> Enable
              `Latency +3500ms` + `Disable Idempotency` and double-click `Send Pix`.
            </li>
            <li>
              <span className="text-ivory">4. UI Desync Bug Hunting:</span>{" "}
              Enable `Stale Balance UI Desync` and compare header vs. `GET /api/account`.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (section === "05") {
    return (
      <div key="hub-05" className="space-y-3 text-xs text-stone">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
          ACTIVE QA BOARD // USER STORIES & ACCEPTANCE CRITERIA
        </p>
        <div className="space-y-3">
          {QA_STORIES.map((story) => (
            <div
              key={story.id}
              data-testid={`qa-story-${story.id}`}
              className="border border-graphite-700 bg-obsidian-950 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-sage">
                  {story.id}
                </span>
                <span className="border border-graphite-700 px-2 py-0.5 font-mono text-[9px] tracking-wider text-stone uppercase">
                  {story.status}
                </span>
              </div>
              <h3 className="mt-1.5 font-serif text-base text-ivory">
                {story.title}
              </h3>
              <ul className="mt-2 space-y-1 text-xs text-stone">
                {story.criteria.map((c, idx) => (
                  <li key={idx}>• {c}</li>
                ))}
              </ul>
              <p className="mt-2.5 font-mono text-[10px] text-ash">
                Catalog ref: {story.tests}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === "06") {
    return (
      <div key="hub-06" className="space-y-4 text-xs text-stone">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
          OFFICIAL DESIGN TOKENS // UI QA REFERENCE
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DESIGN_TOKENS.map((t) => (
            <div
              key={t.hex}
              className="flex items-center gap-3 border border-graphite-700 bg-obsidian-950 p-2.5"
            >
              <span
                aria-hidden="true"
                className="h-6 w-6 shrink-0 border border-graphite-600"
                style={{ backgroundColor: t.hex }}
              />
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-ivory">
                  {t.name} <span className="text-ash">({t.hex})</span>
                </p>
                <p className="truncate text-[11px] text-stone">{t.usage}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-graphite-700 bg-obsidian-950 p-4 font-mono text-[11px]">
          <p className="text-[10px] tracking-[0.2em] text-sage uppercase">
            TYPOGRAPHY & INTERACTION RULES
          </p>
          <ul className="mt-2 space-y-1.5 text-stone">
            <li>• Headings: Playfair Display • Body: Inter • Data/IDs: JetBrains Mono.</li>
            <li>• Cardholder seed always displays `PERSEU B.` (`VALID THRU 08/30`).</li>
            <li>• Focus rings remain visible (`#9CB4A3`); modals restore trigger focus on `Esc`.</li>
          </ul>
        </div>
      </div>
    );
  }

  // 07 LAB COMMS (Pênfredo, Dino & Ênio reacting dynamically to Chaos state!)
  const dynamicComms = [
    ...(chaos.enabled && chaos.forceServerError
      ? [
          {
            sender: "Ênio // Simulated Dev",
            tag: "INCIDENT ALERT",
            tone: "text-terracotta",
            text: "Chaos 500 outage is active on /api/*. Verify that transfers and card purchases fail cleanly without phantom debits.",
          },
        ]
      : []),
    ...(chaos.enabled && chaos.forceGatewayTimeout
      ? [
          {
            sender: "Dino // Test Data & Ops",
            tag: "CLEARING 504",
            tone: "text-terracotta",
            text: "HTTP 504 Gateway Timeout is injected. Check DevTools Network status code and confirm statement stays unchanged.",
          },
        ]
      : []),
    ...(chaos.enabled && chaos.disableIdempotency
      ? [
          {
            sender: "Pênfredo // Product Owner",
            tag: "RACE WARNING",
            tone: "text-amber",
            text: "Idempotency guard is OFF. Any double-click under latency will reproduce a concurrent double-debit anomaly.",
          },
        ]
      : []),
    ...(chaos.enabled && chaos.staleBalanceDesync
      ? [
          {
            sender: "Ênio // Simulated Dev",
            tag: "UI DESYNC",
            tone: "text-amber",
            text: "Stale Balance mode is active: workspace header freezes visually while GET /api/account still holds the true server balance.",
          },
        ]
      : []),
    {
      sender: "Pênfredo // Product Owner",
      tag: "REQUIREMENT",
      tone: "text-sage",
      text: "Priority check: Wire transfers carry a $2.50 fee that must count toward insufficient-funds validation against total balance.",
    },
    {
      sender: "Dino // Test Data & Ops",
      tag: "SEED DATA",
      tone: "text-stone",
      text: "Use `kinetic@sandbox.greias.test` or `987.654.321-10` for quick Pix directory lookup, and `Reset environment` between test suites.",
    },
    {
      sender: "Ênio // Simulated Dev",
      tag: "SECURITY",
      tone: "text-stone",
      text: "GET /api/account intentionally masks card credentials. Full PAN and CVV are served exclusively by POST /api/card/credentials.",
    },
  ];

  return (
    <div key="hub-07" className="space-y-3 text-xs text-stone">
      <p className="font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
        LAB COMMS // PÊNFREDO, DINO & ÊNIO
      </p>
      <div className="space-y-2.5">
        {dynamicComms.map((msg, idx) => (
          <div
            key={idx}
            className="border border-graphite-700 bg-obsidian-950 p-3.5"
          >
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-ivory">{msg.sender}</span>
              <span className={msg.tone}>{msg.tag}</span>
            </div>
            <p className="mt-1.5 leading-relaxed text-stone">{msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}