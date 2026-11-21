import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { getActiveCardCredentials } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  const chaosResponse = await applyChaosMiddleware({ allowServerError: true });
  if (chaosResponse) return chaosResponse;

  const credentials = getActiveCardCredentials();
  return NextResponse.json(credentials, { status: 200 });
}