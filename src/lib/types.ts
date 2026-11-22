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

export interface CardCredentialsPayload {
  cardId: string;
  holderName: string;
  pan: string;
  last4: string;
  validThru: string;
  cvv: string;
}

export type LedgerEntryType =
  | "DEPOSIT"
  | "PIX_OUT"
  | "WIRE_OUT"
  | "CARD_PURCHASE"
  | "INVOICE_PAYMENT";

export interface LedgerEntry {
  id: string;
  accountId: string;
  type: LedgerEntryType;
  description: string;
  amountCents: number;
  feeCents?: number;
  balanceAfterCents?: number;
  recipientName?: string;
  recipientTarget?: string;
  status: "COMPLETED" | "DECLINED" | "FAILED";
  createdAt: string;
}

export interface TransferLimitsSummary {
  perTxLimitCents: number;
  dailyLimitCents: number;
  dailyUsedCents: number;
  dailyRemainingCents: number;
  wireFeeCents: number;
}

export interface ChaosConfig {
  enabled: boolean;
  latencyMs: 0 | 1500 | 3500;
  forceServerError: boolean;
  forceGatewayTimeout: boolean;
  forceRateLimit: boolean;
  bypassClientValidation: boolean;
  staleBalanceDesync: boolean;
  disableIdempotency: boolean;
}

export interface AccountSnapshot {
  account: DigitalAccount;
  card: GreiasCard;
  recentEntries: LedgerEntry[];
  limits: TransferLimitsSummary;
  chaos: ChaosConfig;
}

export type PixKeyType = "EMAIL" | "TAX_ID" | "EVP";

export interface TransferReceipt {
  transactionId: string;
  rail: "PIX" | "WIRE";
  recipientName: string;
  recipientTarget: string;
  amountCents: number;
  feeCents: number;
  totalDebitedCents: number;
  balanceAfterCents: number;
  memo?: string;
  createdAt: string;
}

export interface TransferSuccessResponse {
  receipt: TransferReceipt;
  snapshot: AccountSnapshot;
  idempotentReplay?: boolean;
}

export interface CardActionSuccessResponse {
  entry?: LedgerEntry;
  paidCents?: number;
  snapshot: AccountSnapshot;
  idempotentReplay?: boolean;
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
    chaosInjected?: boolean;
    snapshot?: AccountSnapshot;
  };
}