import { NextResponse } from "next/server";
import { getChaosConfig } from "./store";
import { ApiErrorPayload } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function applyChaosMiddleware(options?: {
  allowServerError?: boolean;
}): Promise<NextResponse<ApiErrorPayload> | null> {
  const chaos = getChaosConfig();
  if (!chaos.enabled) return null;

  if (chaos.latencyMs > 0) {
    await sleep(chaos.latencyMs);
  }

  if (options?.allowServerError !== false && chaos.forceServerError) {
    return NextResponse.json(
      {
        error: {
          code: "CHAOS_SIMULATED_OUTAGE",
          message:
            "Simulated HTTP 500 failure injected by Chaos Monkey. Disable Force Server Error to restore normal processing.",
          chaosInjected: true,
        },
      },
      { status: 500 }
    );
  }

  return null;
}