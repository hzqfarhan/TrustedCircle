import { NextRequest, NextResponse } from "next/server";
import { getSharedFund } from "@/lib/data/funds";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fund = await getSharedFund(id);

  if (!fund) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(fund);
}
