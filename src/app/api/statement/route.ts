import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { getStatementEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const chaosResponse = await applyChaosMiddleware({ allowServerError: true });
  if (chaosResponse) return chaosResponse;

  const statement = getStatementEntries();
  return NextResponse.json(statement, { status: 200 });
}