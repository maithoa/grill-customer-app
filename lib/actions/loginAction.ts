'use server';

import { redirect } from 'next/navigation';
import { getSession, sanitizeRedirectPath } from '@/lib/session';

type LoginResponse = {
  success?: boolean;
  id?: number;
  identity?: string;
  role?: string;
  message?: string;
};

function redirectToLoginError(target: string, message: string): never {
  const params = new URLSearchParams();

  if (target !== '/') {
    params.set('redirect', target);
  }

  params.set('error', message);
  redirect(`/login?${params.toString()}` as never);
}

export async function loginAction(formData: FormData) {
  const rawRedirect = formData.get('redirect');
  const redirectTarget = sanitizeRedirectPath(
    typeof rawRedirect === 'string' ? rawRedirect : '/'
  );

  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    redirectToLoginError(redirectTarget, 'Invalid credentials.');
  }

  const authServiceBaseUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3000';
  const loginUrl = `${authServiceBaseUrl.replace(/\/$/, '')}/api/customer/login`;

  let payload: LoginResponse | null = null;

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
      cache: 'no-store',
    });

    payload = (await response.json().catch(() => null)) as LoginResponse | null;

    const isValidPayload =
      payload?.success === true &&
      typeof payload.id === 'number' &&
      typeof payload.identity === 'string' &&
      typeof payload.role === 'string';

    if (!response.ok || !isValidPayload) {
      redirectToLoginError(
        redirectTarget,
        payload?.message ?? 'Invalid username or password.'
      );
    }
  } catch {
    redirectToLoginError(
      redirectTarget,
      'Unable to sign in right now. Please try again.'
    );
  }

  const session = await getSession();
  const authenticatedPayload = payload as {
    id: number;
    identity: string;
    role: string;
  };

  session.user = {
    id: authenticatedPayload.id,
    identity: authenticatedPayload.identity,
    role: authenticatedPayload.role,
  };
  await session.save();

  redirect(redirectTarget as never);
}
