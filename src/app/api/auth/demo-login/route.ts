import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProfile } from '@/lib/data/profiles';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const profile = await getProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set('demo_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true, role: profile.role });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
