'use server';

import { cookies } from 'next/headers';
import { getProfile } from '@/lib/data/profiles';

export async function demoLoginAction(userId: string) {
  const profile = await getProfile(userId);
  if (!profile) throw new Error('Demo user not found');

  const cookieStore = await cookies();
  cookieStore.set('demo_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return { success: true, role: profile.role };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('demo_user_id');
  cookieStore.delete('auth_token');
  return { success: true };
}
