import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { getProfile } from '@/lib/data/profiles';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const profile = await getProfile(user.sub);
    if (!profile) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: profile });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
