import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const fund = await prisma.sharedFund.findUnique({
    where: { id: params.id },
    include: {
      members: { include: { user: { select: { id: true, name: true, role: true } } } },
      contributions: { orderBy: { createdAt: "desc" }, take: 20 },
      withdrawals: {
        orderBy: { createdAt: "desc" },
        include: {
          requester: { select: { id: true, name: true } },
          approvals: {
            include: { approver: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  if (!fund) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(fund);
}
