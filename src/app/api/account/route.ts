import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { getActiveSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const chaosResponse = await applyChaosMiddleware({ allowServerError: true });
  if (chaosResponse) return chaosResponse;

  return NextResponse.json(getActiveSnapshot(), { status: 200 });
}