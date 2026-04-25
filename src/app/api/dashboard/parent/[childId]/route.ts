import { NextRequest, NextResponse } from 'next/server';
import { GetChildDetailData } from '@/lib/actions/dashboard-actions';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ childId: string }> }) {
  try {
    const { childId } = await params;
    const data = await GetChildDetailData(childId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message?.includes('Unauthorized') ? 403 : 500 });
  }
}
