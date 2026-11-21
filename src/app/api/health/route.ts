import { NextResponse } from "next/server";
import { getActiveSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getActiveSnapshot();
  return NextResponse.json(
    {
      service: "greias-fintech-qa",
      status: "ok",
      educationalEnvironment: true,
      activeAccountHolder: snapshot.account.fullName,
      chaosEnabled: snapshot.chaos.enabled,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
