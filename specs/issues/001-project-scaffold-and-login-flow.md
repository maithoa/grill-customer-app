## What to build

Scaffold the Next.js 15 project with Tailwind, shadcn/ui, and iron-session. Implement the Login page end-to-end: the UI form, a `loginAction` Server Action that calls the `grill-excercise` auth service (`POST /api/customer/login`), sets an iron-session HTTP-only cookie on success, and redirects to `/`. Add `middleware.ts` to protect the `(protected)` route group, redirecting unauthenticated users to `/login`.

## Acceptance criteria

- [ ] `npx create-next-app` scaffold exists with TypeScript, Tailwind, App Router, no `src/` dir
- [ ] shadcn/ui and iron-session installed and configured in `lib/session.ts`
- [ ] `/login` page renders a username + password form
- [ ] `loginAction` calls `grill-excercise` and sets an iron-session cookie containing `{ id, identity, role }`
- [ ] Invalid credentials show an inline error message
- [ ] `middleware.ts` redirects unauthenticated requests to `/` → `/login`
- [ ] Already-logged-in users visiting `/login` are redirected to `/`
- [ ] `layout.tsx` reads the session and passes `user` as props to child components
- [ ] `/login?redirect=/events/abc` preserves the redirect param and navigates there after successful login

## Blocked by

None — can start immediately.
