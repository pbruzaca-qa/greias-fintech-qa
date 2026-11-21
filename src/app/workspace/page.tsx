"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { useEnvironment } from "@/components/EnvironmentProvider";
import { GreiasCardVisual } from "@/components/GreiasCardVisual";
import { InstantTransfersPanel } from "@/components/InstantTransfersPanel";
import { LiveStatementPanel } from "@/components/LiveStatementPanel";
import { formatCents } from "@/lib/validation";

type WorkspaceTab = "overview" | "transfers" | "card" | "statement";

const VALID_TABS: WorkspaceTab[] = ["overview", "transfers", "card", "statement"];

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { snapshot, isLoading, refreshSnapshot } = useEnvironment();

  const rawModule = searchParams.get("module") as WorkspaceTab | null;
  const activeTab: WorkspaceTab =
    rawModule && VALID_TABS.includes(rawModule) ? rawModule : "overview";

  const selectTab = (tab: WorkspaceTab) => {
    if (tab === "overview") {
      router.push("/workspace");
    } else {
      router.push(`/workspace?module=${tab}`);
    }
  };

  if (isLoading && !snapshot) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-8">
        <p className="font-mono text-xs tracking-widest text-stone uppercase">
          Loading account state from /api/account...
        </p>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-8">
        <div className="border border-terracotta bg-terracotta/10 p-6">
          <p className="font-mono text-xs text-terracotta">
            Unable to load account snapshot. If Chaos Monkey HTTP 500 is active,
            disable it or retry.
          </p>
          <button
            type="button"
            onClick={() => void refreshSnapshot()}
            className="mt-4 border border-graphite-700 bg-obsidian-900 px-4 py-2 font-mono text-xs text-ivory hover:border-graphite-600"
          >
            Retry /api/account
          </button>
        </div>
      </div>
    );
  }

  const { account, card, recentEntries, limits, chaos } = snapshot;
  const dailyPct = Math.min(
    100,
    Math.round((limits.dailyUsedCents / limits.dailyLimitCents) * 100)
  );

  return (
    <div className="mx-auto max-w-[1360px] space-y-7 px-4 py-8 sm:px-8 sm:py-10">
      {/* Top Account Cockpit Bar */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-graphite-700 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-[10px] tracking-[0.26em] text-ash uppercase">
              DIGITAL BANKING WORKSPACE
            </span>
            {account.isDefaultSeed && (
              <span className="border border-graphite-700 bg-charcoal-850 px-2 py-0.5 font-mono text-[10px] tracking-wider text-sage uppercase">
                SEED DEFAULT
              </span>
            )}
            {chaos.enabled && (
              <span className="border border-amber bg-amber/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-amber uppercase">
                CHAOS ACTIVE
              </span>
            )}
          </div>
          <h1
            data-testid="workspace-account-holder"
            className="mt-2 font-serif text-3xl font-semibold text-ivory sm:text-4xl"
          >
            {account.fullName}
          </h1>
          <p className="mt-1 font-mono text-xs text-stone">
            Branch {account.branchCode} • Account {account.accountNumber} •{" "}
            {account.email}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
              DAILY TRANSFER LIMIT
            </p>
            <p
              data-testid="workspace-daily-remaining"
              className="mt-1 font-mono text-sm text-stone"
            >
              {formatCents(limits.dailyRemainingCents)} left of{" "}
              {formatCents(limits.dailyLimitCents)}
            </p>
            <div className="mt-1.5 h-1 w-40 bg-charcoal-800">
              <div
                className="h-full bg-sage transition-all"
                style={{ width: `${dailyPct}%` }}
              />
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="font-mono text-[10px] tracking-[0.24em] text-ash uppercase">
              AVAILABLE BALANCE
            </p>
            <p
              data-testid="workspace-balance"
              className="mt-1 font-mono text-3xl font-medium text-ivory"
            >
              {formatCents(account.balanceCents)}
            </p>
          </div>
        </div>
      </div>

      {/* Banking Navigation Tabs */}
      <nav
        aria-label="Banking modules"
        className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite-700 pb-4"
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectTab("overview")}
            data-testid="tab-overview"
            className={`border px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
              activeTab === "overview"
                ? "border-ivory bg-ivory text-obsidian-900"
                : "border-graphite-700 bg-obsidian-900 text-stone hover:border-graphite-600 hover:text-ivory"
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => selectTab("transfers")}
            data-testid="tab-transfers"
            className={`border px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
              activeTab === "transfers"
                ? "border-ivory bg-ivory text-obsidian-900"
                : "border-graphite-700 bg-obsidian-900 text-stone hover:border-graphite-600 hover:text-ivory"
            }`}
          >
            <span className={activeTab === "transfers" ? "mr-1.5" : "mr-1.5 text-sage"}>
              01
            </span>
            Instant Transfers
          </button>

          <button
            type="button"
            onClick={() => selectTab("card")}
            data-testid="tab-card"
            className={`border px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
              activeTab === "card"
                ? "border-ivory bg-ivory text-obsidian-900"
                : "border-graphite-700 bg-obsidian-900 text-stone hover:border-graphite-600 hover:text-ivory"
            }`}
          >
            <span className={activeTab === "card" ? "mr-1.5" : "mr-1.5 text-sage"}>
              02
            </span>
            Smart Card
          </button>

          <button
            type="button"
            onClick={() => selectTab("statement")}
            data-testid="tab-statement"
            className={`border px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
              activeTab === "statement"
                ? "border-ivory bg-ivory text-obsidian-900"
                : "border-graphite-700 bg-obsidian-900 text-stone hover:border-graphite-600 hover:text-ivory"
            }`}
          >
            <span className={activeTab === "statement" ? "mr-1.5" : "mr-1.5 text-sage"}>
              03
            </span>
            Live Statement
          </button>
        </div>

        <Link
          href="/open-account"
          className="font-mono text-xs text-stone underline hover:text-ivory"
        >
          + Open another account
        </Link>
      </nav>

      {/* TAB CONTENT */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Card Column */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs tracking-[0.22em] text-stone uppercase">
                GREIAS CARD
              </h2>
              <span className="font-mono text-[11px] text-sage">
                STATUS: {card.status}
              </span>
            </div>

            <GreiasCardVisual
              holderName={card.holderName}
              last4={card.last4}
              validThru={card.validThru}
              status={card.status}
              variant="compact"
            />

            <div className="grid grid-cols-2 gap-3 border border-graphite-700 bg-obsidian-900 p-4 font-mono text-xs">
              <div>
                <p className="text-[10px] text-ash uppercase">INVOICE LIMIT</p>
                <p className="mt-1 text-ivory">
                  {formatCents(card.invoiceLimitCents)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ash uppercase">CURRENT INVOICE</p>
                <p className="mt-1 text-ivory">
                  {formatCents(card.currentInvoiceCents)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions + Recent Ledger */}
          <div className="space-y-6 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => selectTab("transfers")}
                className="border border-graphite-700 bg-obsidian-900 p-4 text-left transition-colors hover:border-graphite-600 hover:bg-charcoal-850"
              >
                <span className="font-serif text-xl text-sage">01</span>
                <h3 className="mt-2 font-mono text-xs tracking-widest text-ivory uppercase">
                  INSTANT TRANSFERS
                </h3>
                <p className="mt-1 text-xs text-stone">
                  Send Pix ($0.00 fee) or Wire ($2.50 fee).
                </p>
                <p className="mt-3 font-mono text-[10px] tracking-wider text-sage uppercase">
                  OPEN MODULE →
                </p>
              </button>

              <button
                type="button"
                onClick={() => selectTab("card")}
                className="border border-graphite-700 bg-obsidian-900 p-4 text-left transition-colors hover:border-graphite-600 hover:bg-charcoal-850"
              >
                <span className="font-serif text-xl text-sage">02</span>
                <h3 className="mt-2 font-mono text-xs tracking-widest text-ivory uppercase">
                  SMART CARD CONTROL
                </h3>
                <p className="mt-1 text-xs text-stone">
                  Freeze, reveal PAN/CVV & test purchase limits.
                </p>
                <p className="mt-3 font-mono text-[10px] tracking-wider text-ash uppercase">
                  PLANNED — BLOCK 3
                </p>
              </button>

              <button
                type="button"
                onClick={() => selectTab("statement")}
                className="border border-graphite-700 bg-obsidian-900 p-4 text-left transition-colors hover:border-graphite-600 hover:bg-charcoal-850"
              >
                <span className="font-serif text-xl text-sage">03</span>
                <h3 className="mt-2 font-mono text-xs tracking-widest text-ivory uppercase">
                  LIVE STATEMENT
                </h3>
                <p className="mt-1 text-xs text-stone">
                  Inspect full synchronized account ledger.
                </p>
                <p className="mt-3 font-mono text-[10px] tracking-wider text-sage uppercase">
                  OPEN MODULE →
                </p>
              </button>
            </div>

            <div className="border border-graphite-700 bg-obsidian-900">
              <div className="flex items-center justify-between border-b border-graphite-700 px-5 py-3">
                <h2 className="font-mono text-xs tracking-[0.2em] text-ivory uppercase">
                  RECENT ACTIVITY
                </h2>
                <button
                  type="button"
                  onClick={() => selectTab("statement")}
                  className="font-mono text-[11px] text-stone underline hover:text-ivory"
                >
                  View full statement →
                </button>
              </div>

              {recentEntries.length === 0 ? (
                <p className="px-5 py-6 font-mono text-xs text-ash">
                  No transactions recorded for this account yet.
                </p>
              ) : (
                <ul
                  data-testid="workspace-ledger-list"
                  className="divide-y divide-graphite-700/70"
                >
                  {recentEntries.slice(0, 5).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-4 px-5 py-3.5"
                    >
                      <div>
                        <p className="text-sm text-ivory">{entry.description}</p>
                        <p className="font-mono text-[10px] text-ash uppercase">
                          {entry.type} • {entry.status} •{" "}
                          {entry.createdAt.slice(0, 10)}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span
                          className={`text-sm ${
                            entry.amountCents >= 0 ? "text-sage" : "text-ivory"
                          }`}
                        >
                          {entry.amountCents >= 0 ? "+" : ""}
                          {formatCents(entry.amountCents)}
                        </span>
                        {entry.feeCents && entry.feeCents > 0 ? (
                          <p className="text-[10px] text-ash">
                            Fee: -{formatCents(entry.feeCents)}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "transfers" && (
        <InstantTransfersPanel
          onViewStatement={() => selectTab("statement")}
        />
      )}

      {activeTab === "card" && (
        <div className="grid grid-cols-1 gap-8 border border-graphite-700 bg-obsidian-900 p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <GreiasCardVisual
              holderName={card.holderName}
              last4={card.last4}
              validThru={card.validThru}
              status={card.status}
              variant="compact"
            />
          </div>
          <div className="flex flex-col justify-between space-y-4 lg:col-span-7">
            <div className="space-y-3">
              <p className="font-mono text-[10px] tracking-[0.26em] text-ash uppercase">
                MODULE 02 // SCHEDULED FOR BLOCK 3
              </p>
              <h2 className="font-serif text-2xl text-ivory">
                Smart Card Control
              </h2>
              <p className="text-sm leading-relaxed text-stone">
                Interactive freeze/unfreeze controls, full PAN & CVV reveal,
                invoice limit adjustments, and a simulated card checkout
                verifier will be delivered in Block 3.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => selectTab("transfers")}
                className="border border-ivory bg-ivory px-5 py-2 font-serif text-xs font-medium text-obsidian-900 hover:bg-fillet"
              >
                Go to Instant Transfers →
              </button>
              <button
                type="button"
                onClick={() => selectTab("statement")}
                className="border border-graphite-700 px-5 py-2 font-serif text-xs text-ivory hover:border-graphite-600"
              >
                View Live Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "statement" && <LiveStatementPanel />}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-8">
          <p className="font-mono text-xs tracking-widest text-stone uppercase">
            Initializing workspace...
          </p>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}