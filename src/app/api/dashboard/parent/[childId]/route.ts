import { NextRequest, NextResponse } from 'next/server';
import { proxyToGateway } from '@/lib/api-gateway-proxy';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  try {
    const { childId } = await params;
    const res = await proxyToGateway(`/dashboard/parent/${childId}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
