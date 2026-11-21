"use client";

import React, { useState } from "react";
import { useEnvironment } from "@/components/EnvironmentProvider";
import { GreiasCardVisual } from "@/components/GreiasCardVisual";
import {
  AccountSnapshot,
  ApiErrorPayload,
  CardActionSuccessResponse,
  CardCredentialsPayload,
} from "@/lib/types";
import {
  formatCents,
  validateCardPurchaseInput,
  validateInvoiceLimitInput,
} from "@/lib/validation";

interface SmartCardControlPanelProps {
  onViewStatement: () => void;
}

function makeKey(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function SmartCardControlPanel({
  onViewStatement,
}: SmartCardControlPanelProps) {
  const { snapshot, setSnapshot } = useEnvironment();

  // Revealed credentials (ephemeral UI state)
  const [credentials, setCredentials] =
    useState<CardCredentialsPayload | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [copiedPan, setCopiedPan] = useState(false);

  // Card status toggle
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Invoice limit form
  const [limitInput, setLimitInput] = useState(() =>
    snapshot ? (snapshot.card.invoiceLimitCents / 100).toFixed(2) : "5000.00"
  );
  const [limitError, setLimitError] = useState<string | null>(null);
  const [limitSuccess, setLimitSuccess] = useState<string | null>(null);
  const [isSavingLimit, setIsSavingLimit] = useState(false);

  // Invoice payment
  const [isPayingInvoice, setIsPayingInvoice] = useState(false);

  // Purchase simulator
  const [merchantName, setMerchantName] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseFieldErrors, setPurchaseFieldErrors] = useState<
    Record<string, string>
  >({});
  const [purchaseKey, setPurchaseKey] = useState(() => makeKey("card_buy"));
  const [isSimulatingPurchase, setIsSimulatingPurchase] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  // General card error banner
  const [cardError, setCardError] = useState<string | null>(null);

  if (!snapshot) return null;

  const { card } = snapshot;
  const bypassClientValidation =
    snapshot.chaos.enabled && snapshot.chaos.bypassClientValidation;

  const availableCreditCents = Math.max(
    0,
    card.invoiceLimitCents - card.currentInvoiceCents
  );
  const usagePct =
    card.invoiceLimitCents > 0
      ? Math.min(
          100,
          Math.round((card.currentInvoiceCents / card.invoiceLimitCents) * 100)
        )
      : 100;

  const handleRevealToggle = async () => {
    setCardError(null);
    if (credentials) {
      setCredentials(null);
      setCopiedPan(false);
      return;
    }

    setIsRevealing(true);
    try {
      const res = await fetch("/api/card/credentials", { method: "POST" });
      const payload = (await res.json()) as CardCredentialsPayload &
        ApiErrorPayload;
      if (!res.ok) {
        setCardError(
          `HTTP ${res.status} (${payload.error?.code ?? "ERROR"}) — ${
            payload.error?.message ?? "Unable to reveal card credentials."
          }`
        );
        return;
      }
      setCredentials(payload);
    } catch {
      setCardError("Network error while calling /api/card/credentials.");
    } finally {
      setIsRevealing(false);
    }
  };

  const handleCopyPan = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(credentials.pan.replace(/\s+/g, ""));
      setCopiedPan(true);
      setTimeout(() => setCopiedPan(false), 2000);
    } catch {
      setCopiedPan(false);
    }
  };

  const handleStatusToggle = async () => {
    setCardError(null);
    setPurchaseNotice(null);
    setIsTogglingStatus(true);
    const nextStatus = card.status === "ACTIVE" ? "FROZEN" : "ACTIVE";

    try {
      const res = await fetch("/api/card/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await res.json()) as {
        snapshot: AccountSnapshot;
      } & ApiErrorPayload;

      if (!res.ok) {
        setCardError(
          `HTTP ${res.status} (${payload.error?.code ?? "ERROR"}) — ${
            payload.error?.message ?? "Unable to update card status."
          }`
        );
        return;
      }
      setSnapshot(payload.snapshot);
    } catch {
      setCardError("Network error while calling /api/card/status.");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleLimitSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);
    setLimitError(null);
    setLimitSuccess(null);

    if (!bypassClientValidation) {
      const check = validateInvoiceLimitInput(limitInput);
      if (!check.valid) {
        setLimitError(check.errors.invoiceLimitInput ?? "Invalid limit.");
        return;
      }
    }

    setIsSavingLimit(true);
    try {
      const res = await fetch("/api/card/limit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceLimitInput: limitInput }),
      });
      const payload = (await res.json()) as {
        snapshot: AccountSnapshot;
      } & ApiErrorPayload;

      if (!res.ok) {
        setLimitError(
          `HTTP ${res.status} — ${
            payload.error?.details?.invoiceLimitInput ??
            payload.error?.message ??
            "Failed to update limit."
          }`
        );
        return;
      }

      setSnapshot(payload.snapshot);
      setLimitInput((payload.snapshot.card.invoiceLimitCents / 100).toFixed(2));
      setLimitSuccess(
        `Invoice limit updated to ${formatCents(
          payload.snapshot.card.invoiceLimitCents
        )}.`
      );
    } catch {
      setLimitError("Network error while calling /api/card/limit.");
    } finally {
      setIsSavingLimit(false);
    }
  };

  const handlePayInvoice = async () => {
    setCardError(null);
    setPurchaseNotice(null);
    setIsPayingInvoice(true);
    try {
      const res = await fetch("/api/card/pay-invoice", {
        method: "POST",
        headers: {
          "Idempotency-Key": makeKey("pay_inv"),
        },
      });
      const payload = (await res.json()) as CardActionSuccessResponse &
        ApiErrorPayload;

      if (!res.ok) {
        setCardError(
          `HTTP ${res.status} (${payload.error?.code ?? "ERROR"}) — ${
            payload.error?.message ?? "Unable to pay invoice."
          }`
        );
        return;
      }

      setSnapshot(payload.snapshot);
      setPurchaseNotice({
        kind: "success",
        text: `Invoice paid (${formatCents(
          payload.paidCents ?? 0
        )}). Available card credit restored.`,
      });
    } catch {
      setCardError("Network error while calling /api/card/pay-invoice.");
    } finally {
      setIsPayingInvoice(false);
    }
  };

  const handleSimulatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);
    setPurchaseNotice(null);

    if (!bypassClientValidation) {
      const check = validateCardPurchaseInput({
        merchantName,
        amountInput: purchaseAmount,
      });
      if (!check.valid) {
        setPurchaseFieldErrors(check.errors);
        return;
      }
    }

    setPurchaseFieldErrors({});
    setIsSimulatingPurchase(true);

    try {
      const res = await fetch("/api/card/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": purchaseKey,
        },
        body: JSON.stringify({
          merchantName,
          amountInput: purchaseAmount,
        }),
      });

      const payload = (await res.json()) as CardActionSuccessResponse &
        ApiErrorPayload;

      if (!res.ok) {
        if (payload.error?.details) {
          setPurchaseFieldErrors(payload.error.details);
        }
        if (payload.error?.snapshot) {
          setSnapshot(payload.error.snapshot);
        }
        setPurchaseNotice({
          kind: "error",
          text: `HTTP ${res.status} (${payload.error?.code ?? "DECLINED"}) — ${
            payload.error?.message ?? "Purchase declined."
          }`,
        });
        setPurchaseKey(makeKey("card_buy"));
        return;
      }

      setSnapshot(payload.snapshot);
      setPurchaseNotice({
        kind: "success",
        text: `Approved ${formatCents(
          Math.abs(payload.entry?.amountCents ?? 0)
        )} at ${merchantName.trim()} (${payload.entry?.id ?? "CARD"}).`,
      });
      setPurchaseAmount("");
      setPurchaseKey(makeKey("card_buy"));
    } catch {
      setPurchaseNotice({
        kind: "error",
        text: "Network error while calling /api/card/purchase.",
      });
    } finally {
      setIsSimulatingPurchase(false);
    }
  };

  return (
    <div className="space-y-6">
      {bypassClientValidation && (
        <div
          role="note"
          data-testid="card-chaos-bypass-warning"
          className="border border-amber bg-amber/10 px-4 py-3 font-mono text-xs text-amber"
        >
          <span>
            [CHAOS MONKEY ACTIVE] Client-side validation is bypassed. Invalid
            card limits or purchase amounts will hit the server directly.
          </span>
        </div>
      )}

      {cardError && (
        <div
          role="alert"
          data-testid="card-error-banner"
          className="border border-terracotta bg-terracotta/10 px-4 py-3 font-mono text-xs text-terracotta"
        >
          <span>{cardError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Visual Card + Security Controls */}
        <div className="space-y-5 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs tracking-[0.22em] text-stone uppercase">
              VIRTUAL / PHYSICAL TWIN
            </h2>
            <span
              data-testid="card-status-badge"
              className={`font-mono text-[11px] ${
                card.status === "ACTIVE" ? "text-sage" : "text-terracotta"
              }`}
            >
              {`STATUS: ${card.status}`}
            </span>
          </div>

          <GreiasCardVisual
            holderName={card.holderName}
            last4={card.last4}
            validThru={card.validThru}
            status={card.status}
            variant="compact"
            showCvvSlot={true}
            revealedPan={credentials?.pan ?? null}
            revealedCvv={credentials?.cvv ?? null}
          />

          {/* Freeze & Reveal Buttons */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void handleStatusToggle()}
              disabled={isTogglingStatus}
              data-testid="toggle-freeze-card-btn"
              className={`border px-4 py-2.5 font-mono text-xs tracking-wider uppercase transition-colors disabled:opacity-60 ${
                card.status === "ACTIVE"
                  ? "border-graphite-700 bg-obsidian-900 text-ivory hover:border-graphite-600 hover:bg-charcoal-800"
                  : "border-sage bg-sage/15 text-sage hover:bg-sage/25"
              }`}
            >
              <span>
                {isTogglingStatus
                  ? "Updating..."
                  : card.status === "ACTIVE"
                    ? "Freeze Card"
                    : "Unfreeze Card"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleRevealToggle()}
              disabled={isRevealing}
              data-testid="toggle-reveal-credentials-btn"
              className="border border-graphite-700 bg-obsidian-900 px-4 py-2.5 font-mono text-xs tracking-wider text-ivory uppercase transition-colors hover:border-graphite-600 hover:bg-charcoal-800 disabled:opacity-60"
            >
              <span>
                {isRevealing
                  ? "Fetching..."
                  : credentials
                    ? "Hide Credentials"
                    : "Reveal Credentials"}
              </span>
            </button>
          </div>

          {credentials && (
            <div
              data-testid="revealed-credentials-box"
              className="flex items-center justify-between border border-graphite-700 bg-charcoal-850 px-4 py-3 font-mono text-xs"
            >
              <div>
                <p className="text-[10px] text-ash uppercase">
                  FICTIONAL FULL PAN
                </p>
                <p className="mt-0.5 text-ivory">{credentials.pan}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyPan()}
                data-testid="copy-pan-btn"
                className="border border-graphite-700 bg-obsidian-900 px-3 py-1 text-[11px] text-stone hover:border-graphite-600 hover:text-ivory"
              >
                <span>{copiedPan ? "Copied" : "Copy PAN"}</span>
              </button>
            </div>
          )}

          {/* Invoice Summary Box */}
          <div className="space-y-4 border border-graphite-700 bg-obsidian-900 p-5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[10px] tracking-[0.2em] text-ash uppercase">
                INVOICE UTILIZATION
              </span>
              <span className="text-stone">{`${usagePct}%`}</span>
            </div>

            <div className="h-1.5 w-full bg-charcoal-800">
              <div
                className={`h-full transition-all ${
                  availableCreditCents === 0 ? "bg-terracotta" : "bg-sage"
                }`}
                style={{ width: `${usagePct}%` }}
              />
            </div>

            <dl className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div>
                <dt className="text-[10px] text-ash uppercase">CURRENT</dt>
                <dd
                  data-testid="card-current-invoice"
                  className="mt-1 text-ivory"
                >
                  {formatCents(card.currentInvoiceCents)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">LIMIT</dt>
                <dd
                  data-testid="card-invoice-limit"
                  className="mt-1 text-stone"
                >
                  {formatCents(card.invoiceLimitCents)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-ash uppercase">AVAILABLE</dt>
                <dd
                  data-testid="card-available-credit"
                  className="mt-1 text-sage"
                >
                  {formatCents(availableCreditCents)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => void handlePayInvoice()}
              disabled={isPayingInvoice || card.currentInvoiceCents === 0}
              data-testid="pay-invoice-btn"
              className="w-full border border-graphite-700 bg-obsidian-950 py-2 font-mono text-xs tracking-wider text-ivory uppercase transition-colors hover:border-graphite-600 hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                {isPayingInvoice
                  ? "Paying Invoice..."
                  : `Pay Current Invoice (${formatCents(
                      card.currentInvoiceCents
                    )})`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Invoice Limit Config + Purchase Simulator */}
        <div className="space-y-6 lg:col-span-7">
          {/* Adjust Invoice Limit */}
          <form
            onSubmit={handleLimitSave}
            noValidate
            data-testid="invoice-limit-form"
            className="space-y-4 border border-graphite-700 bg-obsidian-900 p-6"
          >
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
                LIMIT CONTROLS // PATCH /api/card/limit
              </p>
              <h3 className="mt-1 font-serif text-xl text-ivory">
                Adjust Invoice Limit
              </h3>
              <p className="mt-1 text-xs text-stone">
                Set an invoice cap between $100.00 and $25,000.00. Setting it
                below your current invoice immediately blocks new purchases.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1 space-y-1.5">
                <label
                  htmlFor="invoiceLimitInput"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  New Limit (USD)
                </label>
                <input
                  id="invoiceLimitInput"
                  type="text"
                  inputMode="decimal"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  data-testid="input-invoice-limit"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2 font-mono text-sm text-ivory focus:border-graphite-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingLimit}
                data-testid="save-invoice-limit-btn"
                className="border border-ivory bg-ivory px-5 py-2 font-serif text-sm font-medium text-obsidian-900 hover:bg-fillet disabled:opacity-60"
              >
                <span>{isSavingLimit ? "Saving..." : "Update Limit"}</span>
              </button>
            </div>

            {limitError && (
              <p
                data-testid="error-invoice-limit"
                className="font-mono text-xs text-terracotta"
              >
                {limitError}
              </p>
            )}
            {limitSuccess && (
              <p
                data-testid="success-invoice-limit"
                className="font-mono text-xs text-sage"
              >
                {limitSuccess}
              </p>
            )}
          </form>

          {/* Simulate Card Purchase */}
          <form
            onSubmit={handleSimulatePurchase}
            noValidate
            data-testid="card-purchase-form"
            className="space-y-5 border border-graphite-700 bg-obsidian-900 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
                  AUTHORIZATION SANDBOX // POST /api/card/purchase
                </p>
                <h3 className="mt-1 font-serif text-xl text-ivory">
                  Simulate Card Purchase
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMerchantName("Obsidian Coffee Lab");
                    setPurchaseAmount("18.50");
                    setPurchaseFieldErrors({});
                  }}
                  data-testid="preset-purchase-small"
                  className="border border-graphite-700 bg-obsidian-950 px-2.5 py-1 font-mono text-[11px] text-stone hover:border-graphite-600 hover:text-ivory"
                >
                  <span>Coffee ($18.50)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMerchantName("Helios Hardware Corp");
                    setPurchaseAmount("4500.00");
                    setPurchaseFieldErrors({});
                  }}
                  data-testid="preset-purchase-high"
                  className="border border-graphite-700 bg-obsidian-950 px-2.5 py-1 font-mono text-[11px] text-stone hover:border-graphite-600 hover:text-ivory"
                >
                  <span>High-Value ($4,500)</span>
                </button>
              </div>
            </div>

            {purchaseNotice && (
              <div
                role={purchaseNotice.kind === "error" ? "alert" : "status"}
                data-testid="card-purchase-notice"
                className={`border px-4 py-3 font-mono text-xs ${
                  purchaseNotice.kind === "success"
                    ? "border-sage/60 bg-sage/10 text-sage"
                    : "border-terracotta bg-terracotta/10 text-terracotta"
                }`}
              >
                <span>{purchaseNotice.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="cardMerchantName"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Merchant Name *
                </label>
                <input
                  id="cardMerchantName"
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="e.g., Kinetic Cloud Store"
                  data-testid="input-card-merchant"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-sans text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {purchaseFieldErrors.merchantName && (
                  <p
                    data-testid="error-card-merchant"
                    className="font-mono text-xs text-terracotta"
                  >
                    {purchaseFieldErrors.merchantName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cardPurchaseAmount"
                  className="block font-mono text-xs tracking-[0.14em] text-stone uppercase"
                >
                  Purchase Amount (USD) *
                </label>
                <input
                  id="cardPurchaseAmount"
                  type="text"
                  inputMode="decimal"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="149.90"
                  data-testid="input-card-amount"
                  className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
                />
                {purchaseFieldErrors.amountInput && (
                  <p
                    data-testid="error-card-amount"
                    className="font-mono text-xs text-terracotta"
                  >
                    {purchaseFieldErrors.amountInput}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-graphite-700 pt-4">
              <button
                type="button"
                onClick={onViewStatement}
                className="font-mono text-xs text-stone underline hover:text-ivory"
              >
                Inspect attempts in Live Statement →
              </button>

              <button
                type="submit"
                disabled={isSimulatingPurchase}
                data-testid="submit-card-purchase-btn"
                className="border border-ivory bg-ivory px-6 py-2.5 font-serif text-sm font-medium text-obsidian-900 transition-colors hover:bg-fillet disabled:cursor-wait disabled:opacity-60"
              >
                <span>
                  {isSimulatingPurchase
                    ? "Authorizing..."
                    : "Authorize Purchase →"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}