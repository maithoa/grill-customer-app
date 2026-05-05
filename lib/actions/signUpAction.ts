'use server';

import { revalidatePath } from 'next/cache';
import { getCustomerByAuthId } from '@/lib/queries/customers';
import { getSession } from '@/lib/session';

export type SignUpActionResult = {
  success: boolean;
  message?: string;
};

type SignUpApiResponse = {
  success?: boolean;
  message?: string;
};

export async function signUpAction(eventId: string): Promise<SignUpActionResult> {
  if (typeof eventId !== 'string' || eventId.trim().length === 0) {
    return { success: false, message: 'Invalid event id.' };
  }

  const session = await getSession();

  if (!session.user) {
    return { success: false, message: 'Please sign in to continue.' };
  }

  const customer = await getCustomerByAuthId(session.user.id);

  if (!customer) {
    return { success: false, message: 'Customer profile not found.' };
  }

  const signupsServiceBaseUrl = process.env.SIGNUPS_API_BASE_URL ?? 'http://localhost:4200';
  const signupsUrl = `${signupsServiceBaseUrl.replace(/\/$/, '')}/signups`;

  try {
    const response = await fetch(signupsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customer.id,
        eventId: eventId.trim(),
      }),
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => null)) as SignUpApiResponse | null;

    if (response.status === 409) {
      return {
        success: false,
        message: payload?.message ?? 'You are already signed up for this event.',
      };
    }

    if (!response.ok || payload?.success !== true) {
      return {
        success: false,
        message: payload?.message ?? 'Unable to sign up right now. Please try again.',
      };
    }

    revalidatePath('/');
    revalidatePath(`/events/${eventId.trim()}`);

    return { success: true };
  } catch {
    return {
      success: false,
      message: 'Network error while signing up. Please try again.',
    };
  }
}