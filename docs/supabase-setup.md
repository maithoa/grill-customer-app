# Supabase Setup (Sprint 1 Issue 002)

This document covers how to apply the foundational schema and seed data for Sprint 1 Phase 1 Lane B.

## Prerequisites

- A Supabase cloud project created in the dashboard.
- Local env file created from `.env.local.example`.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) set locally.

## Apply Order

1. Apply schema migration: `supabase/migrations/20260505_sprint1_init.sql`
2. Apply seed data: `supabase/seed.sql`

Do not run seed before migration because the seed depends on table and policy definitions.

## Option A: Supabase SQL Editor (Cloud-first)

1. Open your Supabase project dashboard.
2. Go to SQL Editor.
3. Run `supabase/migrations/20260505_sprint1_init.sql`.
4. After success, run `supabase/seed.sql`.

## Option B: Supabase CLI (if configured)

```bash
supabase db push
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

Notes:
- `supabase db push` applies migrations from `supabase/migrations/`.
- `SUPABASE_DB_URL` should be a privileged connection string for running seeds.

## Quick Verification Queries

```sql
select count(*) as customer_count from public.customers;
select count(*) as event_count from public.events;
select count(*) as customer_event_count from public.customer_events;
```

Expected minimums after seed:
- customers: 3
- events: 5
- customer_events: 4

## RLS Model Assumption

RLS is enabled on `public.customer_events`.
Ownership policies assume the authenticated JWT includes an integer `auth_id` claim that maps to `public.customers.auth_id`.

If your auth pipeline does not currently inject `auth_id`, customer-facing queries to `customer_events` using anon/authenticated keys will be denied by policy until that claim mapping is added.
