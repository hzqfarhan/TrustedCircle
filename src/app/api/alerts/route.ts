import { NextRequest, NextResponse } from "next/server";
import { proxyToGateway } from "@/lib/api-gateway-proxy";

export async function GET(_req: NextRequest) {
  const res = await proxyToGateway("/alerts");
  const data = await res.json();

  // Gateway returns { value: [...], Count: N } — unwrap for frontend
  const alerts = Array.isArray(data) ? data : data.value ?? [];

  return NextResponse.json(alerts, { status: res.status });
}
