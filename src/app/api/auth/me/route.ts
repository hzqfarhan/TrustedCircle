import { NextResponse } from 'next/server';
import { GetCurrentUser } from '@/lib/auth/auth';
import { GetProfile } from '@/lib/data/profiles';

export async function GET() {
  try {
    const user = await GetCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const profile = await GetProfile(user.sub);
    if (!profile) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: profile });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

