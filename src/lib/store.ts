import {
  AccountSnapshot,
  ChaosConfig,
  DigitalAccount,
  GreiasCard,
  LedgerEntry,
  PixKeyType,
  TransferLimitsSummary,
  TransferReceipt,
  TransferSuccessResponse,
} from "./types";
import { formatDocumentId, toCardHolderName } from "./validation";

export const PER_TX_LIMIT_CENTS = 500_000; // $5,000.00
export const DAILY_LIMIT_CENTS = 1_000_000; // $10,000.00
export const WIRE_FEE_CENTS = 250; // $2.50

interface GreiasMemoryStore {
  activeAccountId: string;
  accounts: Record<string, DigitalAccount>;
  cardsByAccountId: Record<string, GreiasCard>;
  ledgerByAccountId: Record<string, LedgerEntry[]>;
  idempotencyCache: Record<string, AccountSnapshot>;
  transferIdempotencyCache: Record<string, TransferSuccessResponse>;
  chaos: ChaosConfig;
}

const DEFAULT_ACCOUNT_ID = "acc_perseu_b";

function createSeedState(): GreiasMemoryStore {
  const seedAccount: DigitalAccount = {
    id: DEFAULT_ACCOUNT_ID,
    fullName: "Perseu B.",
    cardHolderName: "PERSEU B.",
    email: "perseu.b@greias.fintech.test",
    documentId: "394.812.059-42",
    branchCode: "0001-9",
    accountNumber: "48210-7",
    balanceCents: 1_250_000, // $12,500.00
    currency: "USD",
    tier: "BLACK_QA",
    createdAt: "2026-01-15T09:00:00.000Z",
    isDefaultSeed: true,
  };

  const seedCard: GreiasCard = {
    id: "card_greias_4821",
    accountId: DEFAULT_ACCOUNT_ID,
    holderName: "PERSEU B.",
    last4: "4821",
    validThru: "08/30",
    status: "ACTIVE",
    invoiceLimitCents: 500_000, // $5,000.00
    currentInvoiceCents: 124_000, // $1,240.00
  };

  const seedEntries: LedgerEntry[] = [
    {
      id: "tx_seed_003",
      accountId: DEFAULT_ACCOUNT_ID,
      type: "CARD_PURCHASE",
      description: "Cloud Infrastructure Lab (Card •••• 4821)",
      amountCents: -42_000,
      balanceAfterCents: 1_250_000,
      status: "COMPLETED",
      createdAt: "2026-02-10T16:40:00.000Z",
    },
    {
      id: "tx_seed_002",
      accountId: DEFAULT_ACCOUNT_ID,
      type: "PIX_OUT",
      description: "Instant Transfer — Kinetic Sandbox",
      amountCents: -108_000,
      balanceAfterCents: 1_292_000,
      recipientName: "Kinetic Sandbox",
      recipientTarget: "kinetic@sandbox.greias.test",
      status: "COMPLETED",
      createdAt: "2026-02-09T11:15:00.000Z",
    },
    {
      id: "tx_seed_001",
      accountId: DEFAULT_ACCOUNT_ID,
      type: "DEPOSIT",
      description: "Initial QA Seed Balance",
      amountCents: 1_400_000,
      balanceAfterCents: 1_400_000,
      status: "COMPLETED",
      createdAt: "2026-01-15T09:05:00.000Z",
    },
  ];

  return {
    activeAccountId: DEFAULT_ACCOUNT_ID,
    accounts: { [DEFAULT_ACCOUNT_ID]: seedAccount },
    cardsByAccountId: { [DEFAULT_ACCOUNT_ID]: seedCard },
    ledgerByAccountId: { [DEFAULT_ACCOUNT_ID]: seedEntries },
    idempotencyCache: {},
    transferIdempotencyCache: {},
    chaos: {
      enabled: false,
      latencyMs: 0,
      forceServerError: false,
      bypassClientValidation: false,
    },
  };
}

const globalForGreias = globalThis as unknown as {
  __greiasStore?: GreiasMemoryStore;
};

function getStore(): GreiasMemoryStore {
  if (!globalForGreias.__greiasStore) {
    globalForGreias.__greiasStore = createSeedState();
  }
  return globalForGreias.__greiasStore;
}

function computeDailyLimits(
  entries: LedgerEntry[],
  todayPrefix: string
): TransferLimitsSummary {
  const dailyUsedCents = entries.reduce((sum, entry) => {
    if (
      entry.status === "COMPLETED" &&
      (entry.type === "PIX_OUT" || entry.type === "WIRE_OUT") &&
      entry.createdAt.startsWith(todayPrefix)
    ) {
      return sum + Math.abs(entry.amountCents);
    }
    return sum;
  }, 0);

  return {
    perTxLimitCents: PER_TX_LIMIT_CENTS,
    dailyLimitCents: DAILY_LIMIT_CENTS,
    dailyUsedCents,
    dailyRemainingCents: Math.max(0, DAILY_LIMIT_CENTS - dailyUsedCents),
    wireFeeCents: WIRE_FEE_CENTS,
  };
}

export function getActiveSnapshot(): AccountSnapshot {
  const store = getStore();
  const account =
    store.accounts[store.activeAccountId] ?? store.accounts[DEFAULT_ACCOUNT_ID];
  const card = store.cardsByAccountId[account.id];
  const allEntries = store.ledgerByAccountId[account.id] ?? [];
  const todayPrefix = new Date().toISOString().slice(0, 10);

  return {
    account: { ...account },
    card: { ...card },
    recentEntries: allEntries.slice(0, 10).map((entry) => ({ ...entry })),
    limits: computeDailyLimits(allEntries, todayPrefix),
    chaos: { ...store.chaos },
  };
}

export function getStatementEntries(): {
  account: DigitalAccount;
  entries: LedgerEntry[];
  limits: TransferLimitsSummary;
} {
  const store = getStore();
  const account =
    store.accounts[store.activeAccountId] ?? store.accounts[DEFAULT_ACCOUNT_ID];
  const entries = store.ledgerByAccountId[account.id] ?? [];
  const todayPrefix = new Date().toISOString().slice(0, 10);

  return {
    account: { ...account },
    entries: entries.map((entry) => ({ ...entry })),
    limits: computeDailyLimits(entries, todayPrefix),
  };
}

export function getChaosConfig(): ChaosConfig {
  return { ...getStore().chaos };
}

export function updateChaosConfig(next: Partial<ChaosConfig>): ChaosConfig {
  const store = getStore();
  const updated: ChaosConfig = {
    enabled: next.enabled ?? store.chaos.enabled,
    latencyMs: next.latencyMs ?? store.chaos.latencyMs,
    forceServerError: next.forceServerError ?? store.chaos.forceServerError,
    bypassClientValidation:
      next.bypassClientValidation ?? store.chaos.bypassClientValidation,
  };

  if (
    next.enabled === undefined &&
    (updated.latencyMs > 0 ||
      updated.forceServerError ||
      updated.bypassClientValidation)
  ) {
    updated.enabled = true;
  }

  store.chaos = updated;
  return { ...store.chaos };
}

export function resetEnvironment(resetChaos = false): AccountSnapshot {
  const currentChaos = getStore().chaos;
  const fresh = createSeedState();
  if (!resetChaos) {
    fresh.chaos = { ...currentChaos };
  }
  globalForGreias.__greiasStore = fresh;
  return getActiveSnapshot();
}

export function getCachedIdempotentAccount(key: string): AccountSnapshot | null {
  const store = getStore();
  return store.idempotencyCache[key] ?? null;
}

export function createDigitalAccount(params: {
  fullName: string;
  email: string;
  documentId: string;
  initialDepositCents: number;
  idempotencyKey?: string | null;
}): AccountSnapshot {
  const store = getStore();

  if (params.idempotencyKey && store.idempotencyCache[params.idempotencyKey]) {
    return store.idempotencyCache[params.idempotencyKey];
  }

  const accountCount = Object.keys(store.accounts).length;
  const suffix = String(10000 + accountCount * 137).slice(-5);
  const accountId = `acc_${Date.now()}_${accountCount}`;
  const cardLast4 = String(4821 + accountCount).slice(-4);
  const nowIso = new Date().toISOString();

  const newAccount: DigitalAccount = {
    id: accountId,
    fullName: params.fullName.trim(),
    cardHolderName: toCardHolderName(params.fullName),
    email: params.email.trim().toLowerCase(),
    documentId: formatDocumentId(params.documentId),
    branchCode: "0001-9",
    accountNumber: `${suffix}-3`,
    balanceCents: params.initialDepositCents,
    currency: "USD",
    tier: "BLACK_QA",
    createdAt: nowIso,
    isDefaultSeed: false,
  };

  const newCard: GreiasCard = {
    id: `card_${accountId}`,
    accountId,
    holderName: newAccount.cardHolderName,
    last4: cardLast4,
    validThru: "08/30",
    status: "ACTIVE",
    invoiceLimitCents: 500_000,
    currentInvoiceCents: 0,
  };

  const entries: LedgerEntry[] =
    params.initialDepositCents > 0
      ? [
          {
            id: `tx_open_${Date.now()}`,
            accountId,
            type: "DEPOSIT",
            description: "Opening Deposit (Fictional)",
            amountCents: params.initialDepositCents,
            balanceAfterCents: params.initialDepositCents,
            status: "COMPLETED",
            createdAt: nowIso,
          },
        ]
      : [];

  store.accounts[accountId] = newAccount;
  store.cardsByAccountId[accountId] = newCard;
  store.ledgerByAccountId[accountId] = entries;
  store.activeAccountId = accountId;

  const snapshot = getActiveSnapshot();
  if (params.idempotencyKey) {
    store.idempotencyCache[params.idempotencyKey] = snapshot;
  }

  return snapshot;
}

export type TransferDomainResult =
  | { ok: true; data: TransferSuccessResponse }
  | { ok: false; status: number; code: string; message: string };

export function executePixTransfer(params: {
  keyType: PixKeyType;
  pixKey: string;
  recipientName: string;
  amountCents: number;
  memo?: string;
  idempotencyKey?: string | null;
}): TransferDomainResult {
  const store = getStore();

  if (
    params.idempotencyKey &&
    store.transferIdempotencyCache[params.idempotencyKey]
  ) {
    return {
      ok: true,
      data: {
        ...store.transferIdempotencyCache[params.idempotencyKey],
        idempotentReplay: true,
      },
    };
  }

  const account =
    store.accounts[store.activeAccountId] ?? store.accounts[DEFAULT_ACCOUNT_ID];
  const entries = store.ledgerByAccountId[account.id] ?? [];
  const todayPrefix = new Date().toISOString().slice(0, 10);
  const limits = computeDailyLimits(entries, todayPrefix);

  // Self-transfer check
  const normalizedKey = params.pixKey.trim().toLowerCase();
  if (
    params.keyType === "EMAIL" &&
    normalizedKey === account.email.toLowerCase()
  ) {
    return {
      ok: false,
      status: 422,
      code: "SELF_TRANSFER_NOT_ALLOWED",
      message: "Cannot send a Pix transfer to your own account email.",
    };
  }
  if (
    params.keyType === "TAX_ID" &&
    params.pixKey.replace(/\D/g, "") === account.documentId.replace(/\D/g, "")
  ) {
    return {
      ok: false,
      status: 422,
      code: "SELF_TRANSFER_NOT_ALLOWED",
      message: "Cannot send a Pix transfer to your own Tax ID.",
    };
  }

  // Limits check
  if (params.amountCents > limits.perTxLimitCents) {
    return {
      ok: false,
      status: 422,
      code: "LIMIT_EXCEEDED",
      message: "Transfer exceeds the $5,000.00 per-transaction limit.",
    };
  }
  if (params.amountCents > limits.dailyRemainingCents) {
    return {
      ok: false,
      status: 422,
      code: "LIMIT_EXCEEDED",
      message: "Transfer exceeds your $10,000.00 daily cumulative transfer limit.",
    };
  }

  // Balance check
  if (params.amountCents > account.balanceCents) {
    return {
      ok: false,
      status: 422,
      code: "INSUFFICIENT_FUNDS",
      message: "Insufficient balance to complete this Pix transfer.",
    };
  }

  // Commit debit atomically
  const newBalance = account.balanceCents - params.amountCents;
  account.balanceCents = newBalance;

  const nowIso = new Date().toISOString();
  const txId = `E2E-PIX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const formattedTarget =
    params.keyType === "TAX_ID"
      ? formatDocumentId(params.pixKey)
      : params.pixKey.trim();

  const cleanMemo = params.memo?.trim();
  const newEntry: LedgerEntry = {
    id: txId,
    accountId: account.id,
    type: "PIX_OUT",
    description: cleanMemo
      ? `Pix to ${params.recipientName.trim()} — ${cleanMemo}`
      : `Pix to ${params.recipientName.trim()}`,
    amountCents: -params.amountCents,
    feeCents: 0,
    balanceAfterCents: newBalance,
    recipientName: params.recipientName.trim(),
    recipientTarget: formattedTarget,
    status: "COMPLETED",
    createdAt: nowIso,
  };

  store.ledgerByAccountId[account.id] = [newEntry, ...entries];

  const receipt: TransferReceipt = {
    transactionId: txId,
    rail: "PIX",
    recipientName: params.recipientName.trim(),
    recipientTarget: formattedTarget,
    amountCents: params.amountCents,
    feeCents: 0,
    totalDebitedCents: params.amountCents,
    balanceAfterCents: newBalance,
    memo: cleanMemo || undefined,
    createdAt: nowIso,
  };

  const responseData: TransferSuccessResponse = {
    receipt,
    snapshot: getActiveSnapshot(),
  };

  if (params.idempotencyKey) {
    store.transferIdempotencyCache[params.idempotencyKey] = responseData;
  }

  return { ok: true, data: responseData };
}

export function executeWireTransfer(params: {
  bankCode: string;
  branchCode: string;
  accountNumber: string;
  beneficiaryName: string;
  beneficiaryDocumentId: string;
  amountCents: number;
  memo?: string;
  idempotencyKey?: string | null;
}): TransferDomainResult {
  const store = getStore();

  if (
    params.idempotencyKey &&
    store.transferIdempotencyCache[params.idempotencyKey]
  ) {
    return {
      ok: true,
      data: {
        ...store.transferIdempotencyCache[params.idempotencyKey],
        idempotentReplay: true,
      },
    };
  }

  const account =
    store.accounts[store.activeAccountId] ?? store.accounts[DEFAULT_ACCOUNT_ID];
  const entries = store.ledgerByAccountId[account.id] ?? [];
  const todayPrefix = new Date().toISOString().slice(0, 10);
  const limits = computeDailyLimits(entries, todayPrefix);

  // Self-transfer check (same branch & account number)
  const normBranch = params.branchCode.replace(/\D/g, "");
  const normSelfBranch = account.branchCode.replace(/\D/g, "");
  const normAcct = params.accountNumber.replace(/\D/g, "");
  const normSelfAcct = account.accountNumber.replace(/\D/g, "");
  if (normBranch === normSelfBranch && normAcct === normSelfAcct) {
    return {
      ok: false,
      status: 422,
      code: "SELF_TRANSFER_NOT_ALLOWED",
      message: "Cannot wire funds to the same source branch and account number.",
    };
  }

  // Limits check (principal amount)
  if (params.amountCents > limits.perTxLimitCents) {
    return {
      ok: false,
      status: 422,
      code: "LIMIT_EXCEEDED",
      message: "Transfer exceeds the $5,000.00 per-transaction limit.",
    };
  }
  if (params.amountCents > limits.dailyRemainingCents) {
    return {
      ok: false,
      status: 422,
      code: "LIMIT_EXCEEDED",
      message: "Transfer exceeds your $10,000.00 daily cumulative transfer limit.",
    };
  }

  // Balance check including $2.50 Wire fee
  const totalDebit = params.amountCents + WIRE_FEE_CENTS;
  if (totalDebit > account.balanceCents) {
    return {
      ok: false,
      status: 422,
      code: "INSUFFICIENT_FUNDS",
      message:
        "Insufficient balance for transfer amount plus $2.50 Wire fee.",
    };
  }

  // Commit debit atomically
  const newBalance = account.balanceCents - totalDebit;
  account.balanceCents = newBalance;

  const nowIso = new Date().toISOString();
  const txId = `WIRE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const targetLabel = `Bank ${params.bankCode.trim()} • ${params.branchCode.trim()} / ${params.accountNumber.trim()}`;
  const cleanMemo = params.memo?.trim();

  const newEntry: LedgerEntry = {
    id: txId,
    accountId: account.id,
    type: "WIRE_OUT",
    description: cleanMemo
      ? `Wire to ${params.beneficiaryName.trim()} — ${cleanMemo}`
      : `Wire to ${params.beneficiaryName.trim()}`,
    amountCents: -params.amountCents,
    feeCents: WIRE_FEE_CENTS,
    balanceAfterCents: newBalance,
    recipientName: params.beneficiaryName.trim(),
    recipientTarget: targetLabel,
    status: "COMPLETED",
    createdAt: nowIso,
  };

  store.ledgerByAccountId[account.id] = [newEntry, ...entries];

  const receipt: TransferReceipt = {
    transactionId: txId,
    rail: "WIRE",
    recipientName: params.beneficiaryName.trim(),
    recipientTarget: targetLabel,
    amountCents: params.amountCents,
    feeCents: WIRE_FEE_CENTS,
    totalDebitedCents: totalDebit,
    balanceAfterCents: newBalance,
    memo: cleanMemo || undefined,
    createdAt: nowIso,
  };

  const responseData: TransferSuccessResponse = {
    receipt,
    snapshot: getActiveSnapshot(),
  };

  if (params.idempotencyKey) {
    store.transferIdempotencyCache[params.idempotencyKey] = responseData;
  }

  return { ok: true, data: responseData };
}