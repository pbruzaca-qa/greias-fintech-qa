"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  totalCount: number;
  limits: TransferLimitsSummary;
}

function escapeCsvCell(value: string | number | undefined): string {
  const str = value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function LiveStatementPanel() {
  const { snapshot } = useEnvironment();
  const [data, setData] = useState<StatementPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters sent to GET /api/statement
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Transaction Inspector Modal
  const [inspectedEntry, setInspectedEntry] = useState<LedgerEntry | null>(
    null
  );
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  const loadStatement = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery.trim() !== "") params.set("q", searchQuery.trim());

      const qs = params.toString();
      const url = qs ? `/api/statement?${qs}` : "/api/statement";

      const res = await fetch(url, { cache: "no-store" });
      const payload = (await res.json()) as StatementPayload & ApiErrorPayload;
      if (!res.ok) {
        setErrorMsg(
          `HTTP ${res.status} (${payload.error?.code ?? "ERROR"}) — ${
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
  }, [typeFilter, statusFilter, searchQuery]);

  const latestEntryId = snapshot?.recentEntries[0]?.id ?? "";

  useEffect(() => {
    void loadStatement();
  }, [
    loadStatement,
    snapshot?.account.balanceCents,
    snapshot?.account.id,
    snapshot?.card.currentInvoiceCents,
    latestEntryId,
  ]);

  useEffect(() => {
    if (!inspectedEntry) return;
    modalCloseBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInspectedEntry(null);
        lastTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectedEntry]);

  const closeInspector = () => {
    setInspectedEntry(null);
    lastTriggerRef.current?.focus();
  };

  const handleClearFilters = () => {
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
  };

  const handleExportJson = () => {
    if (!data) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      educationalEnvironment: true,
      accountHolder: data.account.fullName,
      accountNumber: data.account.accountNumber,
      filters: {
        type: typeFilter,
        status: statusFilter,
        query: searchQuery.trim() || null,
      },
      totalEntries: data.entries.length,
      entries: data.entries,
    };
    triggerDownload(
      `greias-statement-${Date.now()}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
  };

  const handleExportCsv = () => {
    if (!data) return;
    const headers = [
      "transaction_id",
      "created_at_utc",
      "type",
      "status",
      "description",
      "recipient_name",
      "recipient_target",
      "amount_usd",
      "fee_usd",
      "balance_after_usd",
    ];
    const rows = data.entries.map((entry) =>
      [
        escapeCsvCell(entry.id),
        escapeCsvCell(entry.createdAt),
        escapeCsvCell(entry.type),
        escapeCsvCell(entry.status),
        escapeCsvCell(entry.description),
        escapeCsvCell(entry.recipientName),
        escapeCsvCell(entry.recipientTarget),
        escapeCsvCell((entry.amountCents / 100).toFixed(2)),
        escapeCsvCell(
          entry.feeCents ? (entry.feeCents / 100).toFixed(2) : "0.00"
        ),
        escapeCsvCell(
          entry.balanceAfterCents !== undefined
            ? (entry.balanceAfterCents / 100).toFixed(2)
            : ""
        ),
      ].join(",")
    );
    triggerDownload(
      `greias-statement-${Date.now()}.csv`,
      [headers.join(","), ...rows].join("\n"),
      "text/csv;charset=utf-8"
    );
  };

  const hasActiveFilters =
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    searchQuery.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Header + Export Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-graphite-700 bg-obsidian-900 p-5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.24em] text-ash uppercase">
            REAL-TIME LEDGER // GET /api/statement
          </p>
          <h2 className="mt-1 font-serif text-2xl text-ivory">
            Live Statement
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            data-testid="statement-count-badge"
            className="mr-2 font-mono text-xs text-stone"
          >
            <span>
              {data
                ? `Showing ${data.entries.length} of ${data.totalCount}`
                : "Entries: 0"}
            </span>
          </span>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!data || data.entries.length === 0}
            data-testid="export-statement-csv-btn"
            className="border border-graphite-700 bg-obsidian-950 px-3 py-2 font-mono text-xs text-stone hover:border-graphite-600 hover:text-ivory disabled:opacity-40"
          >
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            disabled={!data || data.entries.length === 0}
            data-testid="export-statement-json-btn"
            className="border border-graphite-700 bg-obsidian-950 px-3 py-2 font-mono text-xs text-stone hover:border-graphite-600 hover:text-ivory disabled:opacity-40"
          >
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => void loadStatement()}
            disabled={isLoading}
            data-testid="refresh-statement-btn"
            className="border border-graphite-700 bg-obsidian-950 px-4 py-2 font-mono text-xs text-ivory hover:border-graphite-600 disabled:opacity-60"
          >
            <span>{isLoading ? "Syncing..." : "Refresh Ledger"}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-3 border border-graphite-700 bg-obsidian-900 p-4 sm:grid-cols-12">
        <div className="sm:col-span-5">
          <label
            htmlFor="statementSearch"
            className="mb-1 block font-mono text-[10px] tracking-[0.18em] text-ash uppercase"
          >
            Search ID / Description / Recipient
          </label>
          <input
            id="statementSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., E2E-PIX, Kinetic, Frozen..."
            data-testid="statement-search-input"
            className="w-full border border-graphite-700 bg-obsidian-950 px-3 py-2 font-mono text-xs text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="statementTypeFilter"
            className="mb-1 block font-mono text-[10px] tracking-[0.18em] text-ash uppercase"
          >
            Operation Type
          </label>
          <select
            id="statementTypeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            data-testid="statement-filter-type"
            className="w-full border border-graphite-700 bg-obsidian-950 px-3 py-2 font-mono text-xs text-ivory focus:border-graphite-600 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">DEPOSIT</option>
            <option value="PIX_OUT">PIX_OUT</option>
            <option value="WIRE_OUT">WIRE_OUT</option>
            <option value="CARD_PURCHASE">CARD_PURCHASE</option>
            <option value="INVOICE_PAYMENT">INVOICE_PAYMENT</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="statementStatusFilter"
            className="mb-1 block font-mono text-[10px] tracking-[0.18em] text-ash uppercase"
          >
            Status
          </label>
          <select
            id="statementStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="statement-filter-status"
            className="w-full border border-graphite-700 bg-obsidian-950 px-3 py-2 font-mono text-xs text-ivory focus:border-graphite-600 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="DECLINED">DECLINED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <div className="flex items-end sm:col-span-2">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            data-testid="statement-clear-filters-btn"
            className="w-full border border-graphite-700 bg-obsidian-950 px-3 py-2 font-mono text-xs text-stone hover:border-graphite-600 hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Clear</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          data-testid="statement-error"
          className="border border-terracotta bg-terracotta/10 px-4 py-3 font-mono text-xs text-terracotta"
        >
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Ledger Table */}
      <div className="border border-graphite-700 bg-obsidian-900">
        {isLoading && !data ? (
          <p className="px-6 py-8 font-mono text-xs text-stone">
            Synchronizing ledger from /api/statement...
          </p>
        ) : !data || data.entries.length === 0 ? (
          <div className="space-y-2 px-6 py-8">
            <p
              data-testid="statement-empty-state"
              className="font-mono text-xs text-ash"
            >
              {hasActiveFilters
                ? "No transactions match your current filters."
                : "No transactions recorded for this account yet."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="font-mono text-xs text-sage underline"
              >
                <span>Reset filters</span>
              </button>
            )}
          </div>
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
                  <th className="px-5 py-3 text-right">Inspect</th>
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
                        {`${entry.createdAt.replace("T", " ").slice(0, 19)} UTC`}
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
                          entry.status !== "COMPLETED"
                            ? "text-ash line-through"
                            : entry.amountCents >= 0
                              ? "text-sage"
                              : "text-ivory"
                        }
                      >
                        {`${entry.amountCents >= 0 ? "+" : ""}${formatCents(entry.amountCents)}`}
                      </span>
                      {entry.feeCents && entry.feeCents > 0 ? (
                        <div className="text-[10px] text-ash">
                          {`Fee: -${formatCents(entry.feeCents)}`}
                        </div>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-xs text-stone">
                      {entry.balanceAfterCents !== undefined
                        ? formatCents(entry.balanceAfterCents)
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          lastTriggerRef.current = e.currentTarget;
                          setInspectedEntry(entry);
                        }}
                        data-testid={`inspect-tx-${entry.id}`}
                        className="border border-graphite-700 bg-obsidian-950 px-2.5 py-1 font-mono text-[11px] text-stone hover:border-graphite-600 hover:text-ivory"
                      >
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Inspector Modal */}
      {inspectedEntry && (
        <div
          key={inspectedEntry.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tx-inspector-title"
          data-testid="tx-inspector-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[1px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeInspector();
          }}
        >
          <div className="w-full max-w-xl border border-graphite-700 bg-obsidian-900 p-6 text-ivory shadow-2xl">
            <div className="flex items-start justify-between border-b border-graphite-700 pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
                  LEDGER ENTRY INSPECTOR
                </p>
                <h3
                  id="tx-inspector-title"
                  className="mt-1 font-serif text-2xl text-ivory"
                >
                  {inspectedEntry.id}
                </h3>
              </div>
              <button
                ref={modalCloseBtnRef}
                type="button"
                onClick={closeInspector}
                data-testid="tx-inspector-close"
                className="border border-graphite-700 px-2.5 py-1 font-mono text-xs text-stone hover:border-graphite-600 hover:text-ivory"
              >
                ESC
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-4 font-mono text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[10px] text-ash uppercase">TYPE</dt>
                <dd className="mt-1 text-ivory">{inspectedEntry.type}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">STATUS</dt>
                <dd
                  className={`mt-1 ${
                    inspectedEntry.status === "COMPLETED"
                      ? "text-sage"
                      : "text-terracotta"
                  }`}
                >
                  {inspectedEntry.status}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">AMOUNT</dt>
                <dd className="mt-1 text-ivory">
                  {formatCents(inspectedEntry.amountCents)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">
                  BALANCE AFTER
                </dt>
                <dd className="mt-1 text-stone">
                  {inspectedEntry.balanceAfterCents !== undefined
                    ? formatCents(inspectedEntry.balanceAfterCents)
                    : "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] text-ash uppercase">DESCRIPTION</dt>
                <dd className="mt-1 text-ivory">
                  {inspectedEntry.description}
                </dd>
              </div>
              {inspectedEntry.recipientTarget && (
                <div className="sm:col-span-2">
                  <dt className="text-[10px] text-ash uppercase">TARGET</dt>
                  <dd className="mt-1 break-all text-stone">
                    {inspectedEntry.recipientTarget}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-5 border-t border-graphite-700 pt-4">
              <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
                RAW JSON PAYLOAD
              </p>
              <pre className="max-h-48 overflow-auto border border-graphite-700 bg-obsidian-950 p-3 font-mono text-[11px] text-stone">
                {JSON.stringify(inspectedEntry, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}