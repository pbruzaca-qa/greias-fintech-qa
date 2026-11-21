import {
  AccountSnapshot,
  ChaosConfig,
  DigitalAccount,
  GreiasCard,
  LedgerEntry,
} from "./types";
import { formatDocumentId, toCardHolderName } from "./validation";

interface GreiasMemoryStore {
  activeAccountId: string;
  accounts: Record<string, DigitalAccount>;
  cardsByAccountId: Record<string, GreiasCard>;
  ledgerByAccountId: Record<string, LedgerEntry[]>;
  idempotencyCache: Record<string, AccountSnapshot>;
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
      status: "COMPLETED",
      createdAt: "2026-02-10T16:40:00.000Z",
    },
    {
      id: "tx_seed_002",
      accountId: DEFAULT_ACCOUNT_ID,
      type: "PIX_OUT",
      description: "Instant Transfer — Kinetic Sandbox",
      amountCents: -108_000,
      status: "COMPLETED",
      createdAt: "2026-02-09T11:15:00.000Z",
    },
    {
      id: "tx_seed_001",
      accountId: DEFAULT_ACCOUNT_ID,
      type: "DEPOSIT",
      description: "Initial QA Seed Balance",
      amountCents: 1_400_000,
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

export function getActiveSnapshot(): AccountSnapshot {
  const store = getStore();
  const account = store.accounts[store.activeAccountId] ?? store.accounts[DEFAULT_ACCOUNT_ID];
  const card = store.cardsByAccountId[account.id];
  const recentEntries = (store.ledgerByAccountId[account.id] ?? []).slice(0, 10);

  return {
    account: { ...account },
    card: { ...card },
    recentEntries: recentEntries.map((entry) => ({ ...entry })),
    chaos: { ...store.chaos },
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
    bypassClientValidation: next.bypassClientValidation ?? store.chaos.bypassClientValidation,
  };

  // Automatically enable master switch if any fault option is turned on
  if (
    next.enabled === undefined &&
    (updated.latencyMs > 0 || updated.forceServerError || updated.bypassClientValidation)
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