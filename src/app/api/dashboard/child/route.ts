import { NextResponse } from 'next/server';
import { getChildDashboardData } from '@/lib/actions/dashboard-actions';

export async function GET() {
  try {
    const data = await getChildDashboardData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message?.includes('Unauthorized') ? 403 : 500 });
  }
}
