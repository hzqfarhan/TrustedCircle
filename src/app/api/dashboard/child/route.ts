import { NextResponse } from 'next/server';
import { GetChildDashboardData } from '@/lib/actions/dashboard-actions';

export async function GET() {
  try {
    const data = await GetChildDashboardData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message?.includes('Unauthorized') ? 403 : 500 });
  }
}


