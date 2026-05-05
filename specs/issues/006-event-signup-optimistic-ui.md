## What to build

Implement the end-to-end event sign-up flow. This includes the Signups Lambda (`POST /signups`), the `signUpAction` Server Action, and the `SignUpButton` client component with Optimistic UI via `useOptimistic` and shadcn/ui toast rollback on failure.

## Acceptance criteria

- [ ] `services/signups/handler.ts` Lambda handles `POST /signups` with body `{ customerId, eventId }`
- [ ] Signups Lambda inserts into `customer_events` and returns 201 on success; returns 409 if already signed up
- [ ] `services/signups/serverless.yml` configures EventBridge warm-up ping at `rate(5 minutes)` on this Lambda only
- [ ] `lib/actions/signUpAction.ts` Server Action calls the Signups Lambda and revalidates the dashboard path
- [ ] `SignUpButton` is a `"use client"` component using `useOptimistic` — button immediately shows "Signed Up ✓" on click
- [ ] If `signUpAction` fails, the button reverts and a shadcn/ui `toast` displays the error message
- [ ] Already-signed-up events show a disabled "Signed Up ✓" button with no re-submit possible
- [ ] Sign-up works from both the Event Detail page and the Home Dashboard

## Blocked by

- #004 (Event Detail page with Sign Up button must exist)
- #005 (Home Dashboard must exist to reflect updated sign-up state)
