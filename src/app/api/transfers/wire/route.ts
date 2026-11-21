import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { executeWireTransfer } from "@/lib/store";
import { validateWireTransferInput } from "@/lib/validation";

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

  const bankCode = typeof body.bankCode === "string" ? body.bankCode : "";
  const branchCode = typeof body.branchCode === "string" ? body.branchCode : "";
  const accountNumber =
    typeof body.accountNumber === "string" ? body.accountNumber : "";
  const beneficiaryName =
    typeof body.beneficiaryName === "string" ? body.beneficiaryName : "";
  const beneficiaryDocumentId =
    typeof body.beneficiaryDocumentId === "string"
      ? body.beneficiaryDocumentId
      : "";
  const amountInput =
    typeof body.amountInput === "string"
      ? body.amountInput
      : typeof body.amountInput === "number"
        ? String(body.amountInput)
        : "";
  const memo = typeof body.memo === "string" ? body.memo : undefined;

  const validation = validateWireTransferInput({
    bankCode,
    branchCode,
    accountNumber,
    beneficiaryName,
    beneficiaryDocumentId,
    amountInput,
    memo,
  });

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more Wire transfer fields failed server validation.",
          details: validation.errors,
        },
      },
      { status: 422 }
    );
  }

  const idempotencyKey = request.headers.get("Idempotency-Key");
  const result = executeWireTransfer({
    bankCode,
    branchCode,
    accountNumber,
    beneficiaryName,
    beneficiaryDocumentId,
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