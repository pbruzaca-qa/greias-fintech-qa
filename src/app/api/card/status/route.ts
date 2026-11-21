import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { setCardStatus } from "@/lib/store";

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

  if (body.status !== "ACTIVE" && body.status !== "FROZEN") {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Card status must be either ACTIVE or FROZEN.",
        },
      },
      { status: 422 }
    );
  }

  const snapshot = setCardStatus(body.status);
  return NextResponse.json({ snapshot }, { status: 200 });
}