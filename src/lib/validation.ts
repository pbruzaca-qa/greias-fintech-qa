export interface OnboardingInput {
  fullName: string;
  email: string;
  documentId: string;
  initialDepositInput: string;
  acceptedTerms: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  parsedDepositCents: number;
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