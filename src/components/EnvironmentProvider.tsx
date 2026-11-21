"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AccountSnapshot, ChaosConfig } from "@/lib/types";

interface EnvironmentContextValue {
  snapshot: AccountSnapshot | null;
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
  const [snapshot, setSnapshot] = useState<AccountSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const refreshSnapshot = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/account", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as AccountSnapshot;
        setSnapshot(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSnapshot();
  }, [refreshSnapshot]);

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
        setSnapshot(data);
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

  const updateChaos = useCallback(async (patch: Partial<ChaosConfig>) => {
    const res = await fetch("/api/chaos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = (await res.json()) as { chaos: ChaosConfig };
      setSnapshot((prev) =>
        prev
          ? { ...prev, chaos: data.chaos }
          : null
      );
    }
  }, []);

  const clearStatusBanner = useCallback(() => setStatusBanner(null), []);

  return (
    <EnvironmentContext.Provider
      value={{
        snapshot,
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