// ─────────────────────────────────────────────
//  Auth Helpers — Server-side
// ─────────────────────────────────────────────

import { cookies } from 'next/headers';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { getProfile } from '@/lib/data/profiles';
import type { Profile } from '@/types';

const COGNITO_REGION = process.env.AWS_REGION || 'ap-southeast-1';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
const JWKS_URL = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJWKS() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(JWKS_URL));
  return jwks;
}

export interface AuthUser {
  sub: string;
  email: string;
  role?: string;
}

/**
 * For MVP/demo: We support both Cognito JWT and simple demo token modes.
 * Demo mode uses a cookie `demo_user_id` for quick login without Cognito.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  // Check demo mode first (for development without Cognito)
  const demoUserId = cookieStore.get('demo_user_id')?.value;
  
  if (demoUserId) {
    const profile = await getProfile(demoUserId);
    if (profile) {
      return { sub: profile.id, email: `${profile.fullName.toLowerCase()}@example.com`, role: profile.role };
    }
  } else if (process.env.USE_MOCK_DB === 'true') {
    // Auto-login bypass for local development if no cookie exists
    const profile = await getProfile('demo_parent');
    if (profile) {
      return { sub: profile.id, email: `${profile.fullName.toLowerCase()}@example.com`, role: profile.role };
    }
  }

  // Cognito JWT mode
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    if (!USER_POOL_ID) {
      // If no Cognito configured, skip JWT verification
      return null;
    }
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${USER_POOL_ID}`,
    });
    return {
      sub: payload.sub as string,
      email: (payload.email as string) || '',
      role: payload['custom:role'] as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }
  return user;
}

export async function requireRole(requiredRole: string): Promise<AuthUser> {
  const user = await requireCurrentUser();
  const profile = await getProfile(user.sub);
  if (!profile || profile.role !== requiredRole) {
    throw new Error(`Unauthorized: Requires ${requiredRole} role`);
  }
  return user;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getProfile(user.sub);
}
