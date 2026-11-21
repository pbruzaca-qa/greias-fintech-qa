"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useEnvironment } from "@/components/EnvironmentProvider";
import {
  ApiErrorPayload,
  DigitalAccount,
  LedgerEntry,
  TransferLimitsSummary,
} from "@/lib/types";
import { formatCents } from "@/lib/validation";

interface StatementPayload {
  account: DigitalAccount;
  entries: LedgerEntry[];
  limits: TransferLimitsSummary;
}

export function LiveStatementPanel() {
  const { snapshot } = useEnvironment();
  const [data, setData] = useState<StatementPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadStatement = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/statement", { cache: "no-store" });
      const payload = (await res.json()) as StatementPayload & ApiErrorPayload;
      if (!res.ok) {
        setErrorMsg(
          `HTTP ${res.status} — ${
            payload.error?.message ?? "Unable to load statement."
          }`
        );
        return;
      }
      setData(payload);
    } catch {
      setErrorMsg("Network error while calling /api/statement.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatement();
  }, [loadStatement, snapshot?.account.balanceCents, snapshot?.account.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-graphite-700 bg-obsidian-900 p-5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.24em] text-ash uppercase">
            REAL-TIME LEDGER // GET /api/statement
          </p>
          <h2 className="mt-1 font-serif text-2xl text-ivory">
            Live Statement
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-stone">
            Entries: {data?.entries.length ?? 0}
          </span>
          <button
            type="button"
            onClick={() => void loadStatement()}
            disabled={isLoading}
            data-testid="refresh-statement-btn"
            className="border border-graphite-700 bg-obsidian-950 px-4 py-2 font-mono text-xs text-ivory hover:border-graphite-600 disabled:opacity-60"
          >
            {isLoading ? "Syncing..." : "Refresh Ledger"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          data-testid="statement-error"
          className="border border-terracotta bg-terracotta/10 px-4 py-3 font-mono text-xs text-terracotta"
        >
          {errorMsg}
        </div>
      )}

      <div className="border border-graphite-700 bg-obsidian-900">
        {isLoading && !data ? (
          <p className="px-6 py-8 font-mono text-xs text-stone">
            Synchronizing ledger from /api/statement...
          </p>
        ) : !data || data.entries.length === 0 ? (
          <p className="px-6 py-8 font-mono text-xs text-ash">
            No transactions recorded for this account yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table
              data-testid="live-statement-table"
              className="w-full border-collapse text-left"
            >
              <thead>
                <tr className="border-b border-graphite-700 bg-charcoal-850 font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
                  <th className="px-5 py-3">Transaction ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Description / Target</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/70 text-sm">
                {data.entries.map((entry) => (
                  <tr
                    key={entry.id}
                    data-testid={`statement-row-${entry.id}`}
                    className="hover:bg-charcoal-850/40"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-stone">
                      <div>{entry.id}</div>
                      <div className="text-[10px] text-ash">
                        {entry.createdAt.replace("T", " ").slice(0, 19)} UTC
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-fillet">
                      {entry.type}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-ivory">{entry.description}</div>
                      {entry.recipientTarget && (
                        <div className="font-mono text-[11px] text-ash">
                          {entry.recipientTarget}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs">
                      <span
                        className={
                          entry.status === "COMPLETED"
                            ? "text-sage"
                            : "text-terracotta"
                        }
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono">
                      <span
                        className={
                          entry.amountCents >= 0 ? "text-sage" : "text-ivory"
                        }
                      >
                        {entry.amountCents >= 0 ? "+" : ""}
                        {formatCents(entry.amountCents)}
                      </span>
                      {entry.feeCents && entry.feeCents > 0 ? (
                        <div className="text-[10px] text-ash">
                          Fee: -{formatCents(entry.feeCents)}
                        </div>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-xs text-stone">
                      {entry.balanceAfterCents !== undefined
                        ? formatCents(entry.balanceAfterCents)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}