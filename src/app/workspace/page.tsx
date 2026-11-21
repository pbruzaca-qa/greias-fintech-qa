"use client";

import Link from "next/link";
import React from "react";
import { useEnvironment } from "@/components/EnvironmentProvider";
import { GreiasCardVisual } from "@/components/GreiasCardVisual";
import { formatCents } from "@/lib/validation";

export default function WorkspacePage() {
  const { snapshot, isLoading, refreshSnapshot } = useEnvironment();

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

  const { account, card, recentEntries, chaos } = snapshot;

  return (
    <div className="mx-auto max-w-[1360px] space-y-8 px-4 py-10 sm:px-8">
      {/* Top Account Strip */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-graphite-700 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.26em] text-ash uppercase">
              ACCOUNT WORKSPACE
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

        <div className="text-left sm:text-right">
          <p className="font-mono text-[10px] tracking-[0.24em] text-ash uppercase">
            AVAILABLE FICTIONAL BALANCE
          </p>
          <p
            data-testid="workspace-balance"
            className="mt-1 font-mono text-3xl font-medium text-ivory"
          >
            {formatCents(account.balanceCents)}
          </p>
        </div>
      </div>

      {/* Main Grid: Card + Modules Status */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Card Column */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs tracking-[0.22em] text-stone uppercase">
              GREIAS CARD PREVIEW
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

        {/* Modules & Ledger Preview Column */}
        <div className="space-y-6 lg:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border border-graphite-700 bg-obsidian-900 p-4">
              <span className="font-serif text-xl text-sage">01</span>
              <h3 className="mt-2 font-mono text-xs tracking-widest text-ivory uppercase">
                INSTANT TRANSFERS
              </h3>
              <p className="mt-1 text-xs text-stone">
                Pix & Wire flows with edge-case validations.
              </p>
              <p className="mt-3 font-mono text-[10px] tracking-wider text-ash uppercase">
                PLANNED — BLOCK 2
              </p>
            </div>

            <div className="border border-graphite-700 bg-obsidian-900 p-4">
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
            </div>

            <div className="border border-graphite-700 bg-obsidian-900 p-4">
              <span className="font-serif text-xl text-sage">03</span>
              <h3 className="mt-2 font-mono text-xs tracking-widest text-ivory uppercase">
                LIVE STATEMENT
              </h3>
              <p className="mt-1 text-xs text-stone">
                Filterable real-time ledger & export.
              </p>
              <p className="mt-3 font-mono text-[10px] tracking-wider text-ash uppercase">
                CORE ACTIVE / BLOCK 2–4
              </p>
            </div>
          </div>

          {/* Baseline Ledger Preview */}
          <div className="border border-graphite-700 bg-obsidian-900">
            <div className="flex items-center justify-between border-b border-graphite-700 px-5 py-3">
              <h2 className="font-mono text-xs tracking-[0.2em] text-ivory uppercase">
                SEED LEDGER PREVIEW
              </h2>
              <Link
                href="/open-account"
                className="font-mono text-[11px] text-stone underline hover:text-ivory"
              >
                Open another account
              </Link>
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
                {recentEntries.map((entry) => (
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
                    <span
                      className={`font-mono text-sm ${
                        entry.amountCents >= 0 ? "text-sage" : "text-ivory"
                      }`}
                    >
                      {entry.amountCents >= 0 ? "+" : ""}
                      {formatCents(entry.amountCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}