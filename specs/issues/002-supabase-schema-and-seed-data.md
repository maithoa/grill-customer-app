## What to build

Create the Supabase database schema and seed it with mock data. All subsequent feature slices depend on this data being available in the live Supabase Cloud project (cloud-first dev — no local Docker).

## Acceptance criteria

- [ ] Supabase project created and credentials stored in `.env.local` (locally) following `.env.local.example`
- [ ] `.env.local.example` committed with placeholder values for `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- [ ] `customers` table created: `id` (UUID PK), `auth_id` (INT UNIQUE), `full_name`, `email`, `bio`, `country`
- [ ] `events` table created: `id` (UUID PK), `name`, `location`, `banner_url`, `tagline`, `description`, `country`, `start_time`, `end_time`
- [ ] `customer_events` junction table created: `customer_id` (FK), `event_id` (FK), `signed_up_at`, composite PK
- [ ] Row Level Security (RLS) enabled on `customer_events`; customers may only read/write their own rows
- [ ] At least 3 mock customers seeded (with `auth_id` matching IDs returned by `grill-excercise`)
- [ ] At least 5 mock events seeded across at least 2 countries
- [ ] `lib/supabase.ts` singleton client committed
- [ ] SQL migration file saved under `supabase/migrations/` for repeatability

## Blocked by

None — can start immediately.
