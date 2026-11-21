import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { createDigitalAccount, getCachedIdempotentAccount } from "@/lib/store";
import { validateOnboardingInput } from "@/lib/validation";

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

  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (idempotencyKey) {
    const cached = getCachedIdempotentAccount(idempotencyKey);
    if (cached) {
      return NextResponse.json(
        {
          ...cached,
          idempotentReplay: true,
        },
        { status: 200 }
      );
    }
  }

  const validation = validateOnboardingInput({
    fullName: typeof body.fullName === "string" ? body.fullName : "",
    email: typeof body.email === "string" ? body.email : "",
    documentId: typeof body.documentId === "string" ? body.documentId : "",
    initialDepositInput:
      typeof body.initialDepositInput === "string"
        ? body.initialDepositInput
        : typeof body.initialDepositInput === "number"
          ? String(body.initialDepositInput)
          : "",
    acceptedTerms: body.acceptedTerms === true,
  });

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more account fields failed server validation.",
          details: validation.errors,
        },
      },
      { status: 422 }
    );
  }

  const snapshot = createDigitalAccount({
    fullName: String(body.fullName),
    email: String(body.email),
    documentId: String(body.documentId),
    initialDepositCents: validation.parsedDepositCents,
    idempotencyKey,
  });

  return NextResponse.json(snapshot, { status: 201 });
}