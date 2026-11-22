import { NextResponse } from "next/server";
import { getChaosConfig, updateChaosConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ chaos: getChaosConfig() }, { status: 200 });
}

export async function PUT(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Chaos configuration payload must be valid JSON.",
        },
      },
      { status: 400 }
    );
  }

  const allowedLatencies = [0, 1500, 3500];
  const latencyMs =
    typeof body.latencyMs === "number" && allowedLatencies.includes(body.latencyMs)
      ? (body.latencyMs as 0 | 1500 | 3500)
      : undefined;

  const updated = updateChaosConfig({
    enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
    latencyMs,
    forceServerError:
      typeof body.forceServerError === "boolean"
        ? body.forceServerError
        : undefined,
    forceGatewayTimeout:
      typeof body.forceGatewayTimeout === "boolean"
        ? body.forceGatewayTimeout
        : undefined,
    forceRateLimit:
      typeof body.forceRateLimit === "boolean"
        ? body.forceRateLimit
        : undefined,
    bypassClientValidation:
      typeof body.bypassClientValidation === "boolean"
        ? body.bypassClientValidation
        : undefined,
    staleBalanceDesync:
      typeof body.staleBalanceDesync === "boolean"
        ? body.staleBalanceDesync
        : undefined,
    disableIdempotency:
      typeof body.disableIdempotency === "boolean"
        ? body.disableIdempotency
        : undefined,
  });

  return NextResponse.json({ chaos: updated }, { status: 200 });
}