-- Sprint 1 / Issue 002 foundational schema
-- Apply before supabase/seed.sql

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_id integer not null unique,
  full_name text not null,
  email text not null unique,
  bio text,
  country text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_customers_set_updated_at on public.customers;
create trigger trg_customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  banner_url text not null,
  tagline text not null,
  description text not null,
  country text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint chk_events_time_range check (end_time > start_time)
);

drop trigger if exists trg_events_set_updated_at on public.events;
create trigger trg_events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

create table if not exists public.customer_events (
  customer_id uuid not null references public.customers(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  signed_up_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (customer_id, event_id)
);

drop trigger if exists trg_customer_events_set_updated_at on public.customer_events;
create trigger trg_customer_events_set_updated_at
before update on public.customer_events
for each row
execute function public.set_updated_at();

alter table public.customer_events enable row level security;

-- Ownership model assumption:
-- JWT includes an integer claim named `auth_id` that maps to customers.auth_id.
drop policy if exists customer_events_select_own on public.customer_events;
create policy customer_events_select_own
on public.customer_events
for select
to authenticated
using (
  exists (
    select 1
    from public.customers c
    where c.id = customer_events.customer_id
      and (auth.jwt() ->> 'auth_id') is not null
      and (auth.jwt() ->> 'auth_id') ~ '^[0-9]+$'
      and c.auth_id = (auth.jwt() ->> 'auth_id')::integer
  )
);

drop policy if exists customer_events_insert_own on public.customer_events;
create policy customer_events_insert_own
on public.customer_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.customers c
    where c.id = customer_events.customer_id
      and (auth.jwt() ->> 'auth_id') is not null
      and (auth.jwt() ->> 'auth_id') ~ '^[0-9]+$'
      and c.auth_id = (auth.jwt() ->> 'auth_id')::integer
  )
);

drop policy if exists customer_events_update_own on public.customer_events;
create policy customer_events_update_own
on public.customer_events
for update
to authenticated
using (
  exists (
    select 1
    from public.customers c
    where c.id = customer_events.customer_id
      and (auth.jwt() ->> 'auth_id') is not null
      and (auth.jwt() ->> 'auth_id') ~ '^[0-9]+$'
      and c.auth_id = (auth.jwt() ->> 'auth_id')::integer
  )
)
with check (
  exists (
    select 1
    from public.customers c
    where c.id = customer_events.customer_id
      and (auth.jwt() ->> 'auth_id') is not null
      and (auth.jwt() ->> 'auth_id') ~ '^[0-9]+$'
      and c.auth_id = (auth.jwt() ->> 'auth_id')::integer
  )
);

drop policy if exists customer_events_delete_own on public.customer_events;
create policy customer_events_delete_own
on public.customer_events
for delete
to authenticated
using (
  exists (
    select 1
    from public.customers c
    where c.id = customer_events.customer_id
      and (auth.jwt() ->> 'auth_id') is not null
      and (auth.jwt() ->> 'auth_id') ~ '^[0-9]+$'
      and c.auth_id = (auth.jwt() ->> 'auth_id')::integer
  )
);
