## What to build

Build the protected Home Dashboard page. Read the iron-session in `layout.tsx` to get the logged-in customer's `auth_id`, look up their Supabase `customer_id`, then fetch their signed-up events and a selection of "hot" upcoming events. Render both as `EventCard` grids.

## Acceptance criteria

- [ ] `app/(protected)/page.tsx` is a React Server Component readable only when authenticated
- [ ] Unauthenticated requests to `/` are redirected to `/login` by `middleware.ts`
- [ ] Page reads iron-session to get `auth_id` and resolves the Supabase customer record
- [ ] "My Events" section renders `EventCard`s for events the customer has signed up for
- [ ] "Hot Upcoming Events" section renders the next 4 events ordered by `start_time`
- [ ] If customer has no sign-ups, "My Events" shows an empty state message
- [ ] A Logout button clears the iron-session cookie and redirects to `/login`

## Blocked by

- #001 (iron-session and layout.tsx must exist)
- #002 (customer and event data must be seeded in Supabase)
