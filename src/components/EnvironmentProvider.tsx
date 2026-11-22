"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AccountSnapshot, ChaosConfig } from "@/lib/types";

const DEFAULT_CHAOS: ChaosConfig = {
  enabled: false,
  latencyMs: 0,
  forceServerError: false,
  forceRateLimit: false,
  bypassClientValidation: false,
  staleBalanceDesync: false,
};

interface EnvironmentContextValue {
  snapshot: AccountSnapshot | null;
  chaos: ChaosConfig;
  isLoading: boolean;
  isResetting: boolean;
  statusBanner: string | null;
  refreshSnapshot: () => Promise<void>;
  resetEnvironment: () => Promise<void>;
  updateChaos: (patch: Partial<ChaosConfig>) => Promise<void>;
  setSnapshot: React.Dispatch<React.SetStateAction<AccountSnapshot | null>>;
  clearStatusBanner: () => void;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export function EnvironmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshotState] = useState<AccountSnapshot | null>(null);
  const [chaos, setChaos] = useState<ChaosConfig>(DEFAULT_CHAOS);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const refreshChaos = useCallback(async () => {
    try {
      const res = await fetch("/api/chaos", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { chaos: ChaosConfig };
        setChaos(data.chaos);
      }
    } catch {
      // Ignore transient network errors on chaos sync
    }
  }, []);

  const refreshSnapshot = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/account", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as AccountSnapshot;
        setSnapshotState(data);
        setChaos(data.chaos);
      } else {
        setSnapshotState(null);
        await refreshChaos();
      }
    } catch {
      await refreshChaos();
    } finally {
      setIsLoading(false);
    }
  }, [refreshChaos]);

  useEffect(() => {
    void refreshSnapshot();
    void refreshChaos();
  }, [refreshSnapshot, refreshChaos]);

  const setSnapshot: React.Dispatch<
    React.SetStateAction<AccountSnapshot | null>
  > = useCallback((action) => {
    setSnapshotState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      if (next) {
        setChaos(next.chaos);
      }
      if (
        prev &&
        next &&
        prev.account.id === next.account.id &&
        next.chaos.enabled &&
        next.chaos.staleBalanceDesync
      ) {
        return {
          ...next,
          account: {
            ...next.account,
            balanceCents: prev.account.balanceCents,
          },
        };
      }
      return next;
    });
  }, []);

  const resetEnvironment = useCallback(async () => {
    setIsResetting(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetChaos: false }),
      });
      if (res.ok) {
        const data = (await res.json()) as AccountSnapshot;
        setSnapshotState(data);
        setChaos(data.chaos);
        setStatusBanner(
          "Environment reset to deterministic baseline (Perseu B.)."
        );
      } else {
        setStatusBanner("Unable to reset environment. Check API status.");
      }
    } catch {
      setStatusBanner("Network error while resetting environment.");
    } finally {
      setIsResetting(false);
    }
  }, []);

  const updateChaos = useCallback(
    async (patch: Partial<ChaosConfig>) => {
      const res = await fetch("/api/chaos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = (await res.json()) as { chaos: ChaosConfig };
        setChaos(data.chaos);
        setSnapshotState((prev) =>
          prev ? { ...prev, chaos: data.chaos } : null
        );

        const recoveredOutage =
          patch.enabled === false ||
          patch.forceServerError === false ||
          patch.forceRateLimit === false ||
          patch.staleBalanceDesync === false;

        if (recoveredOutage) {
          void refreshSnapshot();
        }
      }
    },
    [refreshSnapshot]
  );

  const clearStatusBanner = useCallback(() => setStatusBanner(null), []);

  return (
    <EnvironmentContext.Provider
      value={{
        snapshot,
        chaos,
        isLoading,
        isResetting,
        statusBanner,
        refreshSnapshot,
        resetEnvironment,
        updateChaos,
        setSnapshot,
        clearStatusBanner,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    throw new Error("useEnvironment must be used within EnvironmentProvider");
  }
  return ctx;
}