"use client";

import React, { useState } from "react";
import { useEnvironment } from "@/components/EnvironmentProvider";
import {
  ApiErrorPayload,
  PixKeyType,
  TransferReceipt,
  TransferSuccessResponse,
} from "@/lib/types";
import {
  formatCents,
  formatDocumentId,
  lookupSandboxPixRecipient,
  parseDollarInputToCents,
  validatePixTransferInput,
  validateWireTransferInput,
} from "@/lib/validation";

interface InstantTransfersPanelProps {
  onViewStatement: () => void;
}

function generateIdempotencyKey(rail: "pix" | "wire"): string {
  return `${rail}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function InstantTransfersPanel({
  onViewStatement,
}: InstantTransfersPanelProps) {
  const { snapshot, setSnapshot } = useEnvironment();
  const [rail, setRail] = useState<"PIX" | "WIRE">("PIX");

  // Pix state
  const [keyType, setKeyType] = useState<PixKeyType>("EMAIL");
  const [pixKey, setPixKey] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [pixAmount, setPixAmount] = useState("");
  const [pixMemo, setPixMemo] = useState("");

  // Wire state
  const [bankCode, setBankCode] = useState("260");
  const [branchCode, setBranchCode] = useState("0042");
  const [accountNumber, setAccountNumber] = useState("90421-3");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryDocumentId, setBeneficiaryDocumentId] = useState("");
  const [wireAmount, setWireAmount] = useState("");
  const [wireMemo, setWireMemo] = useState("");

  // Submission state
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    generateIdempotencyKey("pix")
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

  if (!snapshot) return null;

  const bypassClientValidation =
    snapshot.chaos.enabled && snapshot.chaos.bypassClientValidation;
  const wireFeeCents = snapshot.limits.wireFeeCents;

  const parsedWireCents = parseDollarInputToCents(wireAmount) ?? 0;
  const wireTotalPreview =
    parsedWireCents > 0 ? parsedWireCents + wireFeeCents : 0;

  const handlePixKeyChange = (val: string) => {
    const formatted = keyType === "TAX_ID" ? formatDocumentId(val) : val;
    setPixKey(formatted);
    const match = lookupSandboxPixRecipient(keyType, formatted);
    if (match) {
      setRecipientName(match);
    }
  };

  const handleKeyTypeChange = (nextType: PixKeyType) => {
    setKeyType(nextType);
    setPixKey("");
    setFieldErrors({});
  };

  const handleSwitchRail = (nextRail: "PIX" | "WIRE") => {
    setRail(nextRail);
    setFieldErrors({});
    setServerError(null);
    setReceipt(null);
    setIdempotencyKey(
      generateIdempotencyKey(nextRail === "PIX" ? "pix" : "wire")
    );
  };

  const handleStartNewTransfer = () => {
    setReceipt(null);
    setServerError(null);
    setFieldErrors({});
    setPixAmount("");
    setPixMemo("");
    setWireAmount("");
    setWireMemo("");
    setIdempotencyKey(generateIdempotencyKey(rail === "PIX" ? "pix" : "wire"));
  };

  const handlePixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!bypassClientValidation) {
      const check = validatePixTransferInput({
        keyType,
        pixKey,
        recipientName,
        amountInput: pixAmount,
        memo: pixMemo,
      });
      if (!check.valid) {
        setFieldErrors(check.errors);
        return;
      }
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transfers/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          keyType,
          pixKey,
          recipientName,
          amountInput: pixAmount,
          memo: pixMemo,
        }),
      });

      const payload = (await res.json()) as TransferSuccessResponse &
        ApiErrorPayload;

      if (!res.ok) {
        if (payload.error?.details) {
          setFieldErrors(payload.error.details);
        }
        setServerError(
          `HTTP ${res.status} (${payload.error?.code ?? "ERROR"}) — ${
            payload.error?.message ?? "Pix transfer failed."
          }`
        );
        return;
      }

      setSnapshot(payload.snapshot);
      setReceipt(payload.receipt);
      setIdempotencyKey(generateIdempotencyKey("pix"));
    } catch {
      setServerError("Network error while calling /api/transfers/pix.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!bypassClientValidation) {
      const check = validateWireTransferInput({
        bankCode,
        branchCode,
        accountNumber,
        beneficiaryName,
        beneficiaryDocumentId,
        amountInput: wireAmount,
        memo: wireMemo,
      });
      if (!check.valid) {
        setFieldErrors(check.errors);
        return;
      }
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transfers/wire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          bankCode,
          branchCode,
          accountNumber,
          beneficiaryName,
          beneficiaryDocumentId,
          amountInput: wireAmount,
          memo: wireMemo,
        }),
      });

      const payload = (await res.json()) as TransferSuccessResponse &
        ApiErrorPayload;

      if (!res.ok) {
        if (payload.error?.details) {
          setFieldErrors(payload.error.details);
        }
        setServerError(
          `HTTP ${res.status} (${payload.error?.code ?? "ERROR"}) — ${
            payload.error?.message ?? "Wire transfer failed."
          }`
        );
        return;
      }

      setSnapshot(payload.snapshot);
      setReceipt(payload.receipt);
      setIdempotencyKey(generateIdempotencyKey("wire"));
    } catch {
      setServerError("Network error while calling /api/transfers/wire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Form / Receipt Column */}
      <div className="space-y-5 lg:col-span-8">
        {/* Rail Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 border border-graphite-700 bg-obsidian-900 p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSwitchRail("PIX")}
              data-testid="rail-pix-btn"
              className={`border px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                rail === "PIX"
                  ? "border-ivory bg-ivory text-obsidian-900"
                  : "border-graphite-700 bg-obsidian-950 text-stone hover:border-graphite-600 hover:text-ivory"
              }`}
            >
              <span>Pix Transfer ($0.00 Fee)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRail("WIRE")}
              data-testid="rail-wire-btn"
              className={`border px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                rail === "WIRE"
                  ? "border-ivory bg-ivory text-obsidian-900"
                  : "border-graphite-700 bg-obsidian-950 text-stone hover:border-graphite-600 hover:text-ivory"
              }`}
            >
              <span>Wire Transfer ($2.50 Fee)</span>
            </button>
          </div>

          <span className="font-mono text-[10px] tracking-wider text-ash uppercase">
            IDEMPOTENCY: {idempotencyKey.slice(0, 16)}...
          </span>
        </div>

        {bypassClientValidation && (
          <div
            role="note"
            data-testid="transfers-chaos-bypass-warning"
            className="border border-amber bg-amber/10 px-4 py-3 font-mono text-xs text-amber"
          >
            <span>
              [CHAOS MONKEY ACTIVE] Client-side validation is bypassed. Invalid
              inputs will hit the backend directly to test HTTP 422 responses.
            </span>
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            data-testid="transfer-server-error"
            className="border border-terracotta bg-terracotta/10 px-4 py-3 font-mono text-xs text-terracotta"
          >
            <span>{serverError}</span>
          </div>
        )}

        {/* Receipt View */}
        {receipt ? (
          <div
            key="receipt-view"
            data-testid="transfer-receipt"
            className="space-y-6 border border-sage/60 bg-obsidian-900 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-graphite-700 pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.24em] text-sage uppercase">
                  TRANSFER COMPLETED // RECEIPT
                </p>
                <h2 className="mt-1 font-serif text-2xl text-ivory">
                  <span>{receipt.rail} Transfer Confirmed</span>
                </h2>
              </div>
              <span className="border border-sage/50 bg-sage/10 px-3 py-1 font-mono text-xs text-sage">
                {receipt.transactionId}
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-4 font-mono text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[10px] text-ash uppercase">RECIPIENT</dt>
                <dd className="mt-1 text-ivory">{receipt.recipientName}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">DESTINATION</dt>
                <dd className="mt-1 break-all text-stone">
                  {receipt.recipientTarget}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">
                  PRINCIPAL AMOUNT
                </dt>
                <dd className="mt-1 text-ivory">
                  {formatCents(receipt.amountCents)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">FEE CHARGED</dt>
                <dd className="mt-1 text-stone">
                  {formatCents(receipt.feeCents)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">
                  TOTAL DEBITED
                </dt>
                <dd className="mt-1 text-ivory">
                  {formatCents(receipt.totalDebitedCents)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">
                  BALANCE AFTER
                </dt>
                <dd className="mt-1 text-sage">
                  {formatCents(receipt.balanceAfterCents)}
                </dd>
              </div>
            </dl>

            {receipt.memo && (
              <div className="border-t border-graphite-700 pt-3 font-mono text-xs">
                <span className="text-[10px] text-ash uppercase">MEMO: </span>
                <span className="text-stone">{receipt.memo}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartNewTransfer}
                data-testid="new-transfer-btn"
                className="border border-ivory bg-ivory px-5 py-2.5 font-serif text-xs font-medium text-obsidian-900 hover:bg-fillet"
              >
                <span>Send another transfer</span>
              </button>
              <button
                type="button"
                onClick={onViewStatement}
                data-testid="receipt-view-statement-btn"
                className="border border-graphite-700 px-5 py-2.5 font-serif text-xs text-ivory hover:border-graphite-600"
              >
                <span>View in Live Statement →</span>
              </button>
            </div>
          </div>
        ) : rail === "PIX" ? (
          /* PIX FORM */
          <form
            key="pix-form"
            onSubmit={handlePixSubmit}
            noValidate
            data-testid="pix-transfer-form"
            className="space-y-5 border border-graphite-700 bg-obsidian-900 p-6 sm:p-7"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor="pixKeyType"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Key Type *
                </label>
                <select
                  id="pixKeyType"
                  value={keyType}
                  onChange={(e) =>
                    handleKeyTypeChange(e.target.value as PixKeyType)
                  }
                  data-testid="select-pix-key-type"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-3 py-2.5 font-mono text-xs text-ivory focus:border-graphite-600 focus:outline-none"
                >
                  <option value="EMAIL">Email</option>
                  <option value="TAX_ID">Tax ID (11 digits)</option>
                  <option value="EVP">Random Key (EVP)</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="pixKey"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Destination Pix Key *
                </label>
                <input
                  id="pixKey"
                  type="text"
                  value={pixKey}
                  onChange={(e) => handlePixKeyChange(e.target.value)}
                  placeholder={
                    keyType === "EMAIL"
                      ? "kinetic@sandbox.greias.test"
                      : keyType === "TAX_ID"
                        ? "987.654.321-10"
                        : "550e8400-e29b-41d4-a716-446655440000"
                  }
                  aria-invalid={Boolean(fieldErrors.pixKey)}
                  data-testid="input-pix-key"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.pixKey && (
                  <p
                    data-testid="error-pix-key"
                    className="font-mono text-xs text-terracotta"
                  >
                    {fieldErrors.pixKey}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="pixRecipient"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Recipient Name *
                </label>
                <input
                  id="pixRecipient"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient full name"
                  aria-invalid={Boolean(fieldErrors.recipientName)}
                  data-testid="input-pix-recipient"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-sans text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.recipientName && (
                  <p
                    data-testid="error-pix-recipient"
                    className="font-mono text-xs text-terracotta"
                  >
                    {fieldErrors.recipientName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="pixAmount"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Amount (USD) *
                </label>
                <input
                  id="pixAmount"
                  type="text"
                  inputMode="decimal"
                  value={pixAmount}
                  onChange={(e) => setPixAmount(e.target.value)}
                  placeholder="250.00"
                  aria-invalid={Boolean(fieldErrors.amountInput)}
                  data-testid="input-pix-amount"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.amountInput && (
                  <p
                    data-testid="error-pix-amount"
                    className="font-mono text-xs text-terracotta"
                  >
                    {fieldErrors.amountInput}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="pixMemo"
                className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
              >
                Memo / Description (Optional)
              </label>
              <input
                id="pixMemo"
                type="text"
                value={pixMemo}
                onChange={(e) => setPixMemo(e.target.value)}
                placeholder="QA settlement test"
                data-testid="input-pix-memo"
                className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-sans text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
              />
              {fieldErrors.memo && (
                <p className="font-mono text-xs text-terracotta">
                  {fieldErrors.memo}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-graphite-700 pt-4">
              <p className="font-mono text-xs text-stone">
                <span>Fee: </span>
                <span className="text-sage">$0.00</span>
                <span> • Settlement: Instant</span>
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="submit-pix-btn"
                className="border border-ivory bg-ivory px-6 py-2.5 font-serif text-sm font-medium text-obsidian-900 transition-colors hover:bg-fillet disabled:cursor-wait disabled:opacity-60"
              >
                <span>
                  {isSubmitting ? "Processing Pix..." : "Send Pix Transfer →"}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* WIRE FORM */
          <form
            key="wire-form"
            onSubmit={handleWireSubmit}
            noValidate
            data-testid="wire-transfer-form"
            className="space-y-5 border border-graphite-700 bg-obsidian-900 p-6 sm:p-7"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor="wireBankCode"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Bank / Routing *
                </label>
                <input
                  id="wireBankCode"
                  type="text"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  placeholder="260"
                  data-testid="input-wire-bank"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.bankCode && (
                  <p className="font-mono text-xs text-terracotta">
                    {fieldErrors.bankCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="wireBranchCode"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Branch *
                </label>
                <input
                  id="wireBranchCode"
                  type="text"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  placeholder="0042"
                  data-testid="input-wire-branch"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.branchCode && (
                  <p className="font-mono text-xs text-terracotta">
                    {fieldErrors.branchCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="wireAccountNumber"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Account Number *
                </label>
                <input
                  id="wireAccountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="90421-3"
                  data-testid="input-wire-account"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.accountNumber && (
                  <p className="font-mono text-xs text-terracotta">
                    {fieldErrors.accountNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="wireBeneficiaryName"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Beneficiary Name *
                </label>
                <input
                  id="wireBeneficiaryName"
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Orchid Treasury Ltd."
                  data-testid="input-wire-beneficiary"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-sans text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.beneficiaryName && (
                  <p className="font-mono text-xs text-terracotta">
                    {fieldErrors.beneficiaryName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="wireBeneficiaryDoc"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Beneficiary Tax ID *
                </label>
                <input
                  id="wireBeneficiaryDoc"
                  type="text"
                  inputMode="numeric"
                  value={beneficiaryDocumentId}
                  onChange={(e) =>
                    setBeneficiaryDocumentId(formatDocumentId(e.target.value))
                  }
                  placeholder="987.654.321-10"
                  data-testid="input-wire-doc"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.beneficiaryDocumentId && (
                  <p className="font-mono text-xs text-terracotta">
                    {fieldErrors.beneficiaryDocumentId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="wireAmount"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Amount (USD) *
                </label>
                <input
                  id="wireAmount"
                  type="text"
                  inputMode="decimal"
                  value={wireAmount}
                  onChange={(e) => setWireAmount(e.target.value)}
                  placeholder="500.00"
                  data-testid="input-wire-amount"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.amountInput && (
                  <p
                    data-testid="error-wire-amount"
                    className="font-mono text-xs text-terracotta"
                  >
                    {fieldErrors.amountInput}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="wireMemo"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Memo (Optional)
                </label>
                <input
                  id="wireMemo"
                  type="text"
                  value={wireMemo}
                  onChange={(e) => setWireMemo(e.target.value)}
                  placeholder="Invoice #402"
                  data-testid="input-wire-memo"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-sans text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {fieldErrors.memo && (
                  <p className="font-mono text-xs text-terracotta">
                    {fieldErrors.memo}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-graphite-700 pt-4">
              <p className="font-mono text-xs text-stone">
                <span>Fee: </span>
                <span className="text-ivory">{formatCents(wireFeeCents)}</span>
                {wireTotalPreview > 0 && (
                  <span className="ml-2">
                    • Total debit:{" "}
                    <span className="text-ivory">
                      {formatCents(wireTotalPreview)}
                    </span>
                  </span>
                )}
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="submit-wire-btn"
                className="border border-ivory bg-ivory px-6 py-2.5 font-serif text-sm font-medium text-obsidian-900 transition-colors hover:bg-fillet disabled:cursor-wait disabled:opacity-60"
              >
                <span>
                  {isSubmitting ? "Processing Wire..." : "Send Wire Transfer →"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right QA Sandbox Helper Sidebar */}
      <aside className="space-y-5 lg:col-span-4">
        <div className="border border-graphite-700 bg-obsidian-900 p-5">
          <p className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
            TRANSFER RULES & LIMITS
          </p>
          <dl className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <dt className="text-stone">Per-Transaction Max</dt>
              <dd className="text-ivory">
                {formatCents(snapshot.limits.perTxLimitCents)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Daily Limit</dt>
              <dd className="text-ivory">
                {formatCents(snapshot.limits.dailyLimitCents)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Used Today</dt>
              <dd className="text-stone">
                {formatCents(snapshot.limits.dailyUsedCents)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-graphite-700 pt-2">
              <dt className="text-stone">Remaining Today</dt>
              <dd className="text-sage">
                {formatCents(snapshot.limits.dailyRemainingCents)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border border-graphite-700 bg-obsidian-900 p-5">
          <p className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
            SANDBOX TEST KEYS (CLICK TO FILL)
          </p>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                handleSwitchRail("PIX");
                setKeyType("EMAIL");
                setPixKey("kinetic@sandbox.greias.test");
                setRecipientName("Kinetic Sandbox Merchant");
              }}
              data-testid="quickfill-pix-email"
              className="w-full border border-graphite-700 bg-obsidian-950 px-3 py-2 text-left font-mono text-[11px] text-stone hover:border-graphite-600 hover:text-ivory"
            >
              EMAIL: kinetic@sandbox.greias.test
            </button>
            <button
              type="button"
              onClick={() => {
                handleSwitchRail("PIX");
                setKeyType("TAX_ID");
                setPixKey("987.654.321-10");
                setRecipientName("Artemis Clearing House");
              }}
              data-testid="quickfill-pix-taxid"
              className="w-full border border-graphite-700 bg-obsidian-950 px-3 py-2 text-left font-mono text-[11px] text-stone hover:border-graphite-600 hover:text-ivory"
            >
              TAX ID: 987.654.321-10
            </button>
            <button
              type="button"
              onClick={() => {
                handleSwitchRail("PIX");
                setKeyType("EVP");
                setPixKey("550e8400-e29b-41d4-a716-446655440000");
                setRecipientName("Athena Treasury Node");
              }}
              data-testid="quickfill-pix-evp"
              className="w-full border border-graphite-700 bg-obsidian-950 px-3 py-2 text-left font-mono text-[11px] text-stone hover:border-graphite-600 hover:text-ivory"
            >
              EVP: 550e8400-...-446655440000
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
