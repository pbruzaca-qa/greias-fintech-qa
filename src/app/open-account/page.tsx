"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useEnvironment } from "@/components/EnvironmentProvider";
import { AccountSnapshot, ApiErrorPayload } from "@/lib/types";
import { formatDocumentId, validateOnboardingInput } from "@/lib/validation";

export default function OpenAccountPage() {
  const router = useRouter();
  const { snapshot, setSnapshot } = useEnvironment();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [initialDepositInput, setInitialDepositInput] = useState("2500.00");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-form-attempt idempotency key to prevent duplicate creation on slow networks
  const idempotencyKey = useMemo(
    () => `acct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  const bypassClientValidation =
    snapshot?.chaos.enabled && snapshot.chaos.bypassClientValidation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!bypassClientValidation) {
      const check = validateOnboardingInput({
        fullName,
        email,
        documentId,
        initialDepositInput,
        acceptedTerms,
      });

      if (!check.valid) {
        setFieldErrors(check.errors);
        return;
      }
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          fullName,
          email,
          documentId,
          initialDepositInput,
          acceptedTerms,
        }),
      });

      const payload = (await res.json()) as AccountSnapshot & ApiErrorPayload;

      if (!res.ok) {
        if (payload.error?.details) {
          setFieldErrors(payload.error.details);
        }
        setServerError(
          `HTTP ${res.status} — ${
            payload.error?.message ?? "Account creation failed."
          }`
        );
        return;
      }

      setSnapshot(payload);
      router.push("/workspace");
    } catch {
      setServerError("Network error while communicating with /api/accounts.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[920px] px-4 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-graphite-700 pb-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.26em] text-ash uppercase">
            DIGITAL ONBOARDING // SIMULATED KYC
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ivory sm:text-4xl">
            Open Digital Account
          </h1>
          <p className="mt-2 font-serif text-base text-stone">
            Create a fictional digital account or inspect client vs. server
            validation rules.
          </p>
        </div>

        <Link
          href="/workspace"
          data-testid="use-seed-account-link"
          className="border border-graphite-700 bg-obsidian-900 px-4 py-2 font-serif text-xs text-ivory transition-colors hover:border-graphite-600 hover:bg-charcoal-800"
        >
          Use Default Seed Account (Perseu B.) →
        </Link>
      </div>

      {bypassClientValidation && (
        <div
          role="note"
          data-testid="chaos-bypass-warning"
          className="mb-6 border border-amber bg-amber/10 px-4 py-3 font-mono text-xs text-amber"
        >
          [CHAOS MONKEY ACTIVE] Client-side validation is bypassed. Form will
          submit directly to POST /api/accounts to test HTTP 422 server rules.
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          data-testid="onboarding-server-error"
          className="mb-6 border border-terracotta bg-terracotta/10 px-4 py-3 font-mono text-xs text-terracotta"
        >
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        data-testid="open-account-form"
        className="space-y-6 border border-graphite-700 bg-obsidian-900 p-6 sm:p-8"
      >
        {/* Full Name */}
        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="block font-mono text-xs tracking-[0.16em] text-stone uppercase"
          >
            Full Name *
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Helena Vance"
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
            data-testid="input-full-name"
            className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-sans text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
          />
          {fieldErrors.fullName && (
            <p
              id="fullName-error"
              data-testid="error-full-name"
              className="font-mono text-xs text-terracotta"
            >
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        {/* Email & Document ID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block font-mono text-xs tracking-[0.16em] text-stone uppercase"
            >
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="helena@fictional.test"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              data-testid="input-email"
              className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-sans text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
            />
            {fieldErrors.email && (
              <p
                id="email-error"
                data-testid="error-email"
                className="font-mono text-xs text-terracotta"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="documentId"
              className="block font-mono text-xs tracking-[0.16em] text-stone uppercase"
            >
              Fictional Tax ID (11 Digits) *
            </label>
            <input
              id="documentId"
              name="documentId"
              type="text"
              inputMode="numeric"
              value={documentId}
              onChange={(e) => setDocumentId(formatDocumentId(e.target.value))}
              placeholder="000.000.000-00"
              aria-invalid={Boolean(fieldErrors.documentId)}
              aria-describedby={
                fieldErrors.documentId ? "documentId-error" : undefined
              }
              data-testid="input-document-id"
              className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
            />
            {fieldErrors.documentId && (
              <p
                id="documentId-error"
                data-testid="error-document-id"
                className="font-mono text-xs text-terracotta"
              >
                {fieldErrors.documentId}
              </p>
            )}
          </div>
        </div>

        {/* Initial Deposit */}
        <div className="space-y-2">
          <label
            htmlFor="initialDeposit"
            className="block font-mono text-xs tracking-[0.16em] text-stone uppercase"
          >
            Initial Fictional Deposit (USD)
          </label>
          <input
            id="initialDeposit"
            name="initialDeposit"
            type="text"
            inputMode="decimal"
            value={initialDepositInput}
            onChange={(e) => setInitialDepositInput(e.target.value)}
            placeholder="2500.00"
            aria-invalid={Boolean(fieldErrors.initialDepositInput)}
            aria-describedby={
              fieldErrors.initialDepositInput ? "deposit-error" : "deposit-hint"
            }
            data-testid="input-initial-deposit"
            className="w-full border border-graphite-700 bg-obsidian-950 px-4 py-2.5 font-mono text-sm text-ivory placeholder:text-ash focus:border-graphite-600 focus:outline-none"
          />
          <p id="deposit-hint" className="font-mono text-[11px] text-ash">
            Allowed range: $0.00 to $100,000.00 (up to 2 decimal places).
          </p>
          {fieldErrors.initialDepositInput && (
            <p
              id="deposit-error"
              data-testid="error-initial-deposit"
              className="font-mono text-xs text-terracotta"
            >
              {fieldErrors.initialDepositInput}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-2 border-t border-graphite-700 pt-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              aria-invalid={Boolean(fieldErrors.acceptedTerms)}
              data-testid="checkbox-accept-terms"
              className="mt-1 h-4 w-4 accent-[#9CB4A3]"
            />
            <span className="text-sm text-stone">
              I understand that Gréias is an educational fintech QA sandbox and
              all balances, card numbers, and operations are strictly fictional.
            </span>
          </label>
          {fieldErrors.acceptedTerms && (
            <p
              data-testid="error-accept-terms"
              className="font-mono text-xs text-terracotta"
            >
              {fieldErrors.acceptedTerms}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Link
            href="/"
            className="border border-graphite-700 px-5 py-2.5 font-serif text-sm text-stone transition-colors hover:border-graphite-600 hover:text-ivory"
          >
            ← Back to Landing
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="submit-open-account-btn"
            className="border border-ivory bg-ivory px-6 py-2.5 font-serif text-sm font-medium text-obsidian-900 transition-colors hover:bg-fillet disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Creating Account..." : "Create Fictional Account →"}
          </button>
        </div>
      </form>
    </div>
  );
}