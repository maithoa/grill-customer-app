-- Sprint 1 / Issue 002 seed data
-- Apply after supabase/migrations/20260505_sprint1_init.sql

insert into public.customers (id, auth_id, full_name, email, bio, country)
values
  ('0c4fb098-5818-4e3f-a452-632f4f95ac03', 1, 'Alex Nguyen', 'customer@example.com', 'Always first to sign up for a grill night.', 'Vietnam'),
  ('0dd39a36-c109-4586-8fc5-1d2c03ae06f0', 101, 'Minh Tran', 'customer@gmail.com', 'Loves regional BBQ events and food tours.', 'Singapore'),
  ('f0f06259-69fc-4641-b728-f8da8f64ad35', 102, 'Taylor Brooks', 'taylor@example.com', 'Community organizer for weekend grill meetups.', 'United States')
on conflict (auth_id)
do update set
  full_name = excluded.full_name,
  email = excluded.email,
  bio = excluded.bio,
  country = excluded.country,
  updated_at = timezone('utc', now());

insert into public.events (id, name, location, banner_url, tagline, description, country, start_time, end_time)
values
  ('afe71ff9-ae9b-4900-b3f8-d57cac5216f3', 'Saigon Smoke Sessions', 'District 1, Ho Chi Minh City', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 'Street-side smoke and signature sauces.', 'An evening tasting with pitmasters and live acoustic music.', 'Vietnam', '2026-06-14T11:00:00Z', '2026-06-14T15:00:00Z'),
  ('a6e95ab8-22dd-4114-b47f-6082ec40758d', 'Hanoi Riverside Grill Fest', 'Tay Ho, Hanoi', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd', 'Charcoal flavors by the water.', 'Family-friendly festival with regional skewers and chef demos.', 'Vietnam', '2026-07-05T09:00:00Z', '2026-07-05T14:00:00Z'),
  ('62b44036-831d-4066-9933-f8450d4b37ef', 'Marina Bay Fire & Feast', 'Marina Bay, Singapore', 'https://images.unsplash.com/photo-1529692236671-f1de7f5f5f7b', 'City lights, open flames.', 'Night market style grill showcase featuring local vendors.', 'Singapore', '2026-06-21T10:00:00Z', '2026-06-21T16:00:00Z'),
  ('4ad96f61-aa98-4ce4-aa25-b8b65c14da2f', 'Sentosa Beach Barbecue Jam', 'Siloso Beach, Sentosa', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', 'Beachfront grills and sunset vibes.', 'Beach cookout competition with guest judges and live DJ sets.', 'Singapore', '2026-08-02T08:00:00Z', '2026-08-02T13:00:00Z'),
  ('68f79f1e-aaf2-45b8-8e43-ea8cc0f24ce9', 'Austin Backyard Pit Classic', 'South Congress, Austin', 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a', 'Low and slow all day.', 'Texas-style brisket showcase with pit technique workshops.', 'United States', '2026-09-12T15:00:00Z', '2026-09-12T21:00:00Z')
on conflict (id)
do update set
  name = excluded.name,
  location = excluded.location,
  banner_url = excluded.banner_url,
  tagline = excluded.tagline,
  description = excluded.description,
  country = excluded.country,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  updated_at = timezone('utc', now());

insert into public.customer_events (customer_id, event_id, signed_up_at)
values
  ('0c4fb098-5818-4e3f-a452-632f4f95ac03', 'afe71ff9-ae9b-4900-b3f8-d57cac5216f3', '2026-05-02T09:00:00Z'),
  ('0c4fb098-5818-4e3f-a452-632f4f95ac03', '62b44036-831d-4066-9933-f8450d4b37ef', '2026-05-03T10:30:00Z'),
  ('0dd39a36-c109-4586-8fc5-1d2c03ae06f0', '4ad96f61-aa98-4ce4-aa25-b8b65c14da2f', '2026-05-01T14:15:00Z'),
  ('f0f06259-69fc-4641-b728-f8da8f64ad35', '68f79f1e-aaf2-45b8-8e43-ea8cc0f24ce9', '2026-05-04T18:45:00Z')
on conflict (customer_id, event_id)
do update set
  signed_up_at = excluded.signed_up_at,
  updated_at = timezone('utc', now());
