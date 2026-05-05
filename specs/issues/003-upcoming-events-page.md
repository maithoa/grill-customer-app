## What to build

Build the public, SEO-indexable Upcoming Events page. This includes an Events Lambda (GET /events) deployed via Serverless Framework, `serverless-offline` for local dev, and the Next.js RSC page that fetches and renders events filtered by country.

## Acceptance criteria

- [ ] `services/events/handler.ts` Lambda handles `GET /events?country=` — queries Supabase and returns `Event[]`
- [ ] `services/events/serverless.yml` configured with CORS at API Gateway level, SSM secrets, and Node 20.x runtime
- [ ] `serverless-offline` runs the Lambda locally at `localhost:3001`
- [ ] `app/(public)/events/page.tsx` is a React Server Component that fetches from the Events Lambda
- [ ] Events are filtered by customer's country when logged in; shows all events when not logged in
- [ ] `EventCard` component renders: name, location, country, tagline, banner image, start/end times
- [ ] Page is publicly accessible (no auth required)
- [ ] Page is statically or server-rendered for SEO (no client-side-only fetch)

## Blocked by

- #001 (project scaffold must exist)
- #002 (events data must be seeded in Supabase)
