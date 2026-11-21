import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { payCurrentCardInvoice } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const chaosResponse = await applyChaosMiddleware({ allowServerError: true });
  if (chaosResponse) return chaosResponse;

  const idempotencyKey = request.headers.get("Idempotency-Key");
  const result = payCurrentCardInvoice({ idempotencyKey });

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
    status: result.data.idempotentReplay ? 200 : 200,
  });
}