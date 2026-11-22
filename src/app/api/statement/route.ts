import { NextResponse } from "next/server";
import { applyChaosMiddleware } from "@/lib/chaos";
import { getStatementEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const chaosResponse = await applyChaosMiddleware({ allowServerError: true });
  if (chaosResponse) return chaosResponse;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "ALL";
  const status = searchParams.get("status") ?? "ALL";
  const q = searchParams.get("q") ?? "";

  const statement = getStatementEntries({ type, status, q });
  return NextResponse.json(statement, { status: 200 });
}