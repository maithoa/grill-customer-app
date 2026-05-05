'use client';

import { useOptimistic, useState, useTransition } from 'react';
import type { SignUpActionResult } from '@/lib/actions/signUpAction';

type SignUpAction = () => Promise<SignUpActionResult>;

type SignUpButtonProps = {
  eventId: string;
  isAuthenticated: boolean;
  isInitiallySignedUp?: boolean;
  signUpAction?: SignUpAction;
};

function buildLoginHref(eventId: string): string {
  return `/login?redirect=/events/${eventId}`;
}

export function SignUpButton({
  eventId,
  isAuthenticated,
  isInitiallySignedUp = false,
  signUpAction,
}: SignUpButtonProps) {
  const [confirmedSignedUp, setConfirmedSignedUp] = useState(isInitiallySignedUp);
  const [optimisticSignedUp, setOptimisticSignedUp] = useOptimistic(
    confirmedSignedUp,
    (_currentState, nextState: boolean) => nextState
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const buttonLabel = optimisticSignedUp
    ? 'Signed Up ✓'
    : isPending
      ? 'Signing Up...'
      : 'Sign Up for Event';

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <a
          href={buildLoginHref(eventId)}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Sign Up for Event
        </a>
        <p className="text-xs text-zinc-600">
          Sign in is required. You will return to this event after logging in.
        </p>
      </div>
    );
  }

  if (!signUpAction) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700"
        >
          Sign Up for Event
        </button>
        <p className="text-xs text-zinc-600">
          Sign-up action is being finalized. Please check back shortly.
        </p>
      </div>
    );
  }

  const isDisabled = optimisticSignedUp || isPending;

  const handleSignUp = () => {
    if (isDisabled) {
      return;
    }

    setErrorMessage(null);
    setOptimisticSignedUp(true);

    startTransition(async () => {
      const result = await signUpAction();

      if (!result.success) {
        setOptimisticSignedUp(false);
        setErrorMessage(result.message ?? 'Unable to sign up right now. Please try again.');
        return;
      }

      setConfirmedSignedUp(true);
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSignUp}
        disabled={isDisabled}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-700"
      >
        {buttonLabel}
      </button>

      {errorMessage ? (
        <p role="alert" className="text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {optimisticSignedUp ? (
        <p className="text-xs text-zinc-600">You are already signed up for this event.</p>
      ) : null}

      <span className="sr-only">Sign up for event {eventId}</span>
    </div>
  );
}
