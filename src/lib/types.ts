export type AccountTier = "STANDARD" | "BLACK_QA";

export interface DigitalAccount {
  id: string;
  fullName: string;
  cardHolderName: string;
  email: string;
  documentId: string;
  branchCode: string;
  accountNumber: string;
  balanceCents: number;
  currency: "USD";
  tier: AccountTier;
  createdAt: string;
  isDefaultSeed: boolean;
}

export interface GreiasCard {
  id: string;
  accountId: string;
  holderName: string;
  last4: string;
  validThru: string;
  status: "ACTIVE" | "FROZEN";
  invoiceLimitCents: number;
  currentInvoiceCents: number;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  type: "DEPOSIT" | "PIX_OUT" | "WIRE_OUT" | "CARD_PURCHASE";
  description: string;
  amountCents: number; // positive credit, negative debit
  status: "COMPLETED" | "DECLINED" | "FAILED";
  createdAt: string;
}

export interface ChaosConfig {
  enabled: boolean;
  latencyMs: 0 | 1500 | 3500;
  forceServerError: boolean;
  bypassClientValidation: boolean;
}

export interface AccountSnapshot {
  account: DigitalAccount;
  card: GreiasCard;
  recentEntries: LedgerEntry[];
  chaos: ChaosConfig;
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
    chaosInjected?: boolean;
  };
}