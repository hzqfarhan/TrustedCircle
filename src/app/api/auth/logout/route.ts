import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('demo_user_id');
  cookieStore.delete('auth_token');
  return NextResponse.json({ success: true });
}
