import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { setCardInvoiceLimit } from "@/lib/store";
import { validateInvoiceLimitInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
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

  const limitInput =
    typeof body.invoiceLimitInput === "string"
      ? body.invoiceLimitInput
      : typeof body.invoiceLimitInput === "number"
        ? String(body.invoiceLimitInput)
        : "";

  const validation = validateInvoiceLimitInput(limitInput);
  if (!validation.valid) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invoice limit failed server validation.",
          details: validation.errors,
        },
      },
      { status: 422 }
    );
  }

  const snapshot = setCardInvoiceLimit(validation.parsedLimitCents);
  return NextResponse.json({ snapshot }, { status: 200 });
}