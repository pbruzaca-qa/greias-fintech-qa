import { PixKeyType } from "./types";

export interface OnboardingInput {
  fullName: string;
  email: string;
  documentId: string;
  initialDepositInput: string;
  acceptedTerms: boolean;
}

export interface PixTransferInput {
  keyType: PixKeyType;
  pixKey: string;
  recipientName: string;
  amountInput: string;
  memo?: string;
}

export interface WireTransferInput {
  bankCode: string;
  branchCode: string;
  accountNumber: string;
  beneficiaryName: string;
  beneficiaryDocumentId: string;
  amountInput: string;
  memo?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  parsedDepositCents: number;
}

export interface TransferValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  parsedAmountCents: number;
}

export function formatCents(cents: number): string {
  const isNegative = cents < 0;
  const absDollars = Math.abs(cents) / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absDollars);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatDocumentId(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function toCardHolderName(fullName: string): string {
  const parts = fullName.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PERSEU B.";
  if (parts.length === 1) return parts[0].slice(0, 18);
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${first} ${lastInitial}.`.slice(0, 18);
}

export function parseDollarInputToCents(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const [whole, frac = ""] = trimmed.split(".");
  const paddedFrac = (frac + "00").slice(0, 2);
  const cents = Number(whole) * 100 + Number(paddedFrac);
  if (!Number.isSafeInteger(cents)) return null;
  return cents;
}

export function validateOnboardingInput(input: OnboardingInput): ValidationResult {
  const errors: Record<string, string> = {};

  const name = input.fullName.trim();
  if (name.length < 3) {
    errors.fullName = "Full name must contain at least 3 characters.";
  } else if (name.length > 80) {
    errors.fullName = "Full name must not exceed 80 characters.";
  } else if (!/^[\p{L}\s.'-]+$/u.test(name)) {
    errors.fullName = "Full name contains unsupported characters.";
  }

  const email = input.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address (e.g., name@domain.com).";
  }

  const digits = input.documentId.replace(/\D/g, "");
  if (digits.length !== 11) {
    errors.documentId = "Fictional Tax ID must contain exactly 11 digits.";
  } else if (/^(\d)\1{10}$/.test(digits)) {
    errors.documentId = "Repeated single-digit Tax IDs are not permitted.";
  }

  const parsedCents = parseDollarInputToCents(input.initialDepositInput);
  if (parsedCents === null) {
    errors.initialDepositInput =
      "Enter a valid non-negative amount with up to 2 decimal places (e.g., 1500.00).";
  } else if (parsedCents < 0) {
    errors.initialDepositInput = "Initial deposit cannot be negative.";
  } else if (parsedCents > 10_000_000) {
    errors.initialDepositInput = "Initial fictional deposit cannot exceed $100,000.00.";
  }

  if (!input.acceptedTerms) {
    errors.acceptedTerms =
      "You must acknowledge that this is an educational environment with fictional operations.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    parsedDepositCents: parsedCents ?? 0,
  };
}

export function lookupSandboxPixRecipient(
  keyType: PixKeyType,
  rawKey: string
): string | null {
  const normalized = rawKey.trim().toLowerCase();
  if (keyType === "EMAIL" && normalized === "kinetic@sandbox.greias.test") {
    return "Kinetic Sandbox Merchant";
  }
  if (keyType === "TAX_ID" && rawKey.replace(/\D/g, "") === "98765432110") {
    return "Artemis Clearing House";
  }
  if (
    keyType === "EVP" &&
    normalized === "550e8400-e29b-41d4-a716-446655440000"
  ) {
    return "Athena Treasury Node";
  }
  return null;
}

export function validatePixTransferInput(
  input: PixTransferInput
): TransferValidationResult {
  const errors: Record<string, string> = {};
  const key = input.pixKey.trim();

  if (input.keyType === "EMAIL") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(key)) {
      errors.pixKey = "Enter a valid destination email Pix key.";
    }
  } else if (input.keyType === "TAX_ID") {
    const digits = key.replace(/\D/g, "");
    if (digits.length !== 11) {
      errors.pixKey = "Tax ID Pix key must contain exactly 11 digits.";
    } else if (/^(\d)\1{10}$/.test(digits)) {
      errors.pixKey = "Repeated single-digit Tax IDs are not valid Pix keys.";
    }
  } else if (input.keyType === "EVP") {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        key
      )
    ) {
      errors.pixKey =
        "Random key (EVP) must follow UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000).";
    }
  } else {
    errors.keyType = "Unsupported Pix key type.";
  }

  const recipient = input.recipientName.trim();
  if (recipient.length < 2) {
    errors.recipientName = "Recipient name must contain at least 2 characters.";
  } else if (recipient.length > 80) {
    errors.recipientName = "Recipient name must not exceed 80 characters.";
  }

  const trimmedAmount = input.amountInput.trim();
  const parsedCents =
    trimmedAmount === "" ? null : parseDollarInputToCents(trimmedAmount);
  if (parsedCents === null) {
    errors.amountInput =
      "Enter a valid amount with up to 2 decimal places (e.g., 250.00).";
  } else if (parsedCents <= 0) {
    errors.amountInput = "Transfer amount must be greater than $0.00.";
  }

  if (input.memo && input.memo.trim().length > 140) {
    errors.memo = "Memo must not exceed 140 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    parsedAmountCents: parsedCents ?? 0,
  };
}

export function validateWireTransferInput(
  input: WireTransferInput
): TransferValidationResult {
  const errors: Record<string, string> = {};

  const bankDigits = input.bankCode.trim();
  if (!/^\d{3,9}$/.test(bankDigits)) {
    errors.bankCode = "Bank / Routing code must contain 3 to 9 digits.";
  }

  const branch = input.branchCode.trim();
  if (!/^\d{3,6}(-\d)?$/.test(branch)) {
    errors.branchCode = "Branch must contain 3 to 6 digits (e.g., 0042).";
  }

  const acct = input.accountNumber.trim();
  const acctDigits = acct.replace(/\D/g, "");
  if (!/^[\d-]{4,14}$/.test(acct) || acctDigits.length < 4) {
    errors.accountNumber =
      "Account number must contain at least 4 digits (e.g., 90421-3).";
  }

  const beneficiary = input.beneficiaryName.trim();
  if (beneficiary.length < 2) {
    errors.beneficiaryName =
      "Beneficiary name must contain at least 2 characters.";
  } else if (beneficiary.length > 80) {
    errors.beneficiaryName = "Beneficiary name must not exceed 80 characters.";
  }

  const docDigits = input.beneficiaryDocumentId.replace(/\D/g, "");
  if (docDigits.length !== 11) {
    errors.beneficiaryDocumentId =
      "Beneficiary Tax ID must contain exactly 11 digits.";
  } else if (/^(\d)\1{10}$/.test(docDigits)) {
    errors.beneficiaryDocumentId =
      "Repeated single-digit Tax IDs are not permitted.";
  }

  const trimmedAmount = input.amountInput.trim();
  const parsedCents =
    trimmedAmount === "" ? null : parseDollarInputToCents(trimmedAmount);
  if (parsedCents === null) {
    errors.amountInput =
      "Enter a valid amount with up to 2 decimal places (e.g., 500.00).";
  } else if (parsedCents <= 0) {
    errors.amountInput = "Transfer amount must be greater than $0.00.";
  }

  if (input.memo && input.memo.trim().length > 140) {
    errors.memo = "Memo must not exceed 140 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    parsedAmountCents: parsedCents ?? 0,
  };
}