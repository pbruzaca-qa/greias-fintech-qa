import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { executeCardPurchase } from "@/lib/store";
import { validateCardPurchaseInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const chaosResponse = await applyChaosMiddleware({ allowServerError: true });
  if (chaosResponse) return chaosResponse;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 }
    );
  }

  const merchantName =
    typeof body.merchantName === "string" ? body.merchantName : "";
  const amountInput =
    typeof body.amountInput === "string"
      ? body.amountInput
      : typeof body.amountInput === "number"
        ? String(body.amountInput)
        : "";

  const validation = validateCardPurchaseInput({ merchantName, amountInput });
  if (!validation.valid) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Card purchase fields failed server validation.",
          details: validation.errors,
        },
      },
      { status: 422 }
    );
  }

  const idempotencyKey = request.headers.get("Idempotency-Key");
  const result = executeCardPurchase({
    merchantName,
    amountCents: validation.parsedAmountCents,
    idempotencyKey,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code: result.code,
          message: result.message,
          snapshot: result.snapshot,
        },
      },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data, {
    status: result.data.idempotentReplay ? 200 : 201,
  });
}