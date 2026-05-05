import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionUser = {
  id: number;
  identity: string;
  role: string;
};

export type SessionData = {
  user?: SessionUser;
};

const sessionSecret = process.env.SESSION_SECRET;
const sessionPassword =
  sessionSecret && sessionSecret.length >= 32
    ? sessionSecret
    : 'dev-only-change-me-session-secret-please-123456';

export const sessionOptions: SessionOptions = {
  cookieName: 'grill-customers-session',
  password: sessionPassword,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export function sanitizeRedirectPath(value: string | null | undefined): string {
  if (!value) {
    return '/';
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}
