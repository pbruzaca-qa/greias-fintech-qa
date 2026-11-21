import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { resetEnvironment } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Apply latency if active, but never fail /api/reset with simulated 500 so QA can always recover
  const chaosResponse = await applyChaosMiddleware({ allowServerError: false });
  if (chaosResponse) return chaosResponse;

  let resetChaos = false;
  try {
    const body = (await request.json()) as { resetChaos?: boolean };
    resetChaos = body?.resetChaos === true;
  } catch {
    resetChaos = false;
  }

  const snapshot = resetEnvironment(resetChaos);
  return NextResponse.json(
    {
      reset: true,
      ...snapshot,
    },
    { status: 200 }
  );
}