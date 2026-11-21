import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { executePixTransfer } from "@/lib/store";
import { PixKeyType } from "@/lib/types";
import { validatePixTransferInput } from "@/lib/validation";

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

  const keyType = (
    typeof body.keyType === "string" ? body.keyType : "EMAIL"
  ) as PixKeyType;
  const pixKey = typeof body.pixKey === "string" ? body.pixKey : "";
  const recipientName =
    typeof body.recipientName === "string" ? body.recipientName : "";
  const amountInput =
    typeof body.amountInput === "string"
      ? body.amountInput
      : typeof body.amountInput === "number"
        ? String(body.amountInput)
        : "";
  const memo = typeof body.memo === "string" ? body.memo : undefined;

  const validation = validatePixTransferInput({
    keyType,
    pixKey,
    recipientName,
    amountInput,
    memo,
  });

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more Pix transfer fields failed server validation.",
          details: validation.errors,
        },
      },
      { status: 422 }
    );
  }

  const idempotencyKey = request.headers.get("Idempotency-Key");
  const result = executePixTransfer({
    keyType,
    pixKey,
    recipientName,
    amountCents: validation.parsedAmountCents,
    memo,
    idempotencyKey,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code: result.code,
          message: result.message,
        },
      },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data, {
    status: result.data.idempotentReplay ? 200 : 201,
  });
}