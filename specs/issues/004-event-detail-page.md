## What to build

Build the public, SEO-indexable Event Detail page. Extend the Events Lambda with a `GET /events/:id` endpoint and render full event information in Next.js. Add the "Sign Up for Event" button that redirects unauthenticated users to `/login?redirect=/events/[id]`.

## Acceptance criteria

- [ ] Events Lambda handles `GET /events/:id` — returns a single `Event` object or 404
- [ ] `app/(public)/events/[id]/page.tsx` is a React Server Component rendering full event details: name, banner, tagline, description, location, country, start/end times
- [ ] Page is publicly accessible and server-rendered for SEO
- [ ] "Sign Up for Event" button appears on the page
- [ ] If user is NOT logged in, clicking "Sign Up" redirects to `/login?redirect=/events/[id]`
- [ ] If user IS logged in, clicking "Sign Up" triggers the sign-up action (wired in #006)
- [ ] Navigating from Upcoming Events list to Event Detail works correctly

## Blocked by

- #003 (Events Lambda base must exist; `GET /events/:id` extends it)
