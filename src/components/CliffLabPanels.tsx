"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { buildGreiasPostmanCollection } from "@/lib/postmanCollection";
import { StudyNote } from "@/lib/studyNotesStore";

export type CliffSectionId = "01" | "02" | "03" | "04";

export function CliffLabPanelContent({
  section,
}: {
  section: CliffSectionId;
}) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] =
    useState<StudyNote["category"]>("SUGGESTION");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const res = await fetch("/api/study-notes", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { notes: StudyNote[] };
        setNotes(data.notes);
      }
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (section === "03") {
      void loadNotes();
    }
  }, [section, loadNotes]);

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

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoteError(null);
    if (noteContent.trim().length < 4) {
      setNoteError("Please write at least 4 characters.");
      return;
    }

    setIsSavingNote(true);
    try {
      const res = await fetch("/api/study-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: noteCategory,
          author: "Perseu B.",
          content: noteContent,
        }),
      });
      const payload = (await res.json()) as {
        notes?: StudyNote[];
        error?: { message: string };
      };
      if (!res.ok) {
        setNoteError(payload.error?.message ?? "Unable to save note.");
        return;
      }
      if (payload.notes) {
        setNotes(payload.notes);
      }
      setNoteContent("");
    } catch {
      setNoteError("Network error while saving study note.");
    } finally {
      setIsSavingNote(false);
    }
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
              <span className="text-ivory">Onboarding (`POST /api/accounts`):</span>{" "}
              Rejects repeated-digit Tax IDs (`111.111.111-11`), negative
              deposits, or &gt; $100,000.00 (`HTTP 422`).
            </li>
            <li>
              <span className="text-ivory">Pix (`$0.00` fee) & Wire (`$2.50` fee):</span>{" "}
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
    return (
      <div key="panel-03" className="space-y-5 text-sm text-stone">
        {/* Clean Study Notes / Suggestions Form ONLY */}
        <form
          onSubmit={handleCreateNote}
          className="space-y-3 border border-graphite-700 bg-obsidian-950 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="studyNoteInput"
              className="font-mono text-[10px] tracking-[0.2em] text-ivory uppercase"
            >
              STUDY NOTES & SUGGESTIONS
            </label>
            <select
              value={noteCategory}
              onChange={(e) =>
                setNoteCategory(e.target.value as StudyNote["category"])
              }
              aria-label="Note category"
              data-testid="study-note-category"
              className="border border-graphite-700 bg-obsidian-900 px-2.5 py-1 font-mono text-[11px] text-stone focus:outline-none"
            >
              <option value="SUGGESTION">SUGGESTION</option>
              <option value="NOTE">STUDY NOTE</option>
              <option value="BUG_IDEA">TEST IDEA</option>
            </select>
          </div>

          <textarea
            id="studyNoteInput"
            rows={3}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write a study observation, test idea, or improvement suggestion..."
            data-testid="study-note-input"
            className="w-full border border-graphite-700 bg-obsidian-900 px-3 py-2 font-sans text-xs text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
          />

          {noteError && (
            <p className="font-mono text-xs text-terracotta">{noteError}</p>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] text-ash">
              Session log (`POST /api/study-notes`)
            </span>
            <button
              type="submit"
              disabled={isSavingNote}
              data-testid="submit-study-note-btn"
              className="border border-ivory bg-ivory px-4 py-1.5 font-mono text-xs font-medium text-obsidian-900 hover:bg-fillet disabled:opacity-60"
            >
              <span>{isSavingNote ? "Saving..." : "Save Entry"}</span>
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
            RECENT ENTRIES
          </p>
          {notesLoading ? (
            <p className="font-mono text-xs text-ash">Loading notes...</p>
          ) : (
            <ul
              data-testid="study-notes-list"
              className="max-h-52 space-y-2 overflow-y-auto pr-1"
            >
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="border border-graphite-700 bg-obsidian-950 px-3.5 py-2.5 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-ash">
                    <span className="text-sage">{n.category}</span>
                    <span>{n.createdAt.slice(0, 10)}</span>
                  </div>
                  <p className="mt-1 text-stone">{n.content}</p>
                </li>
              ))}
            </ul>
          )}
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