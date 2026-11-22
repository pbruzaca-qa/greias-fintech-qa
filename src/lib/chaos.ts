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

  if (options?.allowServerError !== false) {
    if (chaos.forceServerError) {
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

    if (chaos.forceGatewayTimeout) {
      return NextResponse.json(
        {
          error: {
            code: "CHAOS_GATEWAY_TIMEOUT",
            message:
              "Simulated HTTP 504 Gateway Timeout injected by Chaos Monkey (webhook/clearing timeout). Disable Force 504 to restore normal processing.",
            chaosInjected: true,
          },
        },
        { status: 504 }
      );
    }

    if (chaos.forceRateLimit) {
      return NextResponse.json(
        {
          error: {
            code: "CHAOS_RATE_LIMITED",
            message:
              "Simulated HTTP 429 Too Many Requests injected by Chaos Monkey. Retry after 5 seconds or disable Force Rate Limit.",
            chaosInjected: true,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": "5",
          },
        }
      );
    }
  }

  return null;
}