# PRD: Grill Customers App

**Version:** 1.0  
**Date:** 2026-05-05  
**Status:** Approved  
**Scope:** 4-hour sprint

---

## 1. Overview

The **Grill Customers App** is the customer-facing frontend of a microservices architecture built for learning purposes. It integrates with the existing `grill-excercise` authentication service and provides customers with the ability to log in, browse upcoming events, and sign up for them.

**Goal:** Deliver a production-parity, interview-ready Next.js application hosted on AWS, backed by Supabase, with explicit Lambda functions for backend operations.

---

## 2. Problem Statement

Customers need a dedicated interface to:
- Authenticate using the existing auth microservice.
- Browse and discover upcoming events (publicly, without login).
- Sign up for events they are interested in attending.
- View a personalised home dashboard of events they have signed up for.

---

## 3. User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| 1 | Unauthenticated visitor | Browse all upcoming events without logging in | I can discover events freely |
| 2 | Unauthenticated visitor | View full event details without logging in | I can decide if I want to attend |
| 3 | Unauthenticated visitor | Click "Sign Up for Event" and be redirected to login | I am prompted to authenticate before committing |
| 4 | Customer | Log in with my email and password | I can access my personalised dashboard |
| 5 | Logged-in customer | See my home dashboard with my signed-up events and hot upcoming events | I have a quick overview of my schedule |
| 6 | Logged-in customer | Sign up for an event with instant feedback | I know immediately whether my sign-up succeeded |
| 7 | Logged-in customer | Be redirected back to the event detail page after login | My intent is preserved after authentication |

---

## 4. Scope

### In Scope (Sprint 1 — 4hr)
- Login page integrating with `grill-excercise` auth service
- Home dashboard (protected): my signed-up events + hot upcoming events
- Upcoming Events page (public, SEO-indexable), filtered by customer country by default
- Event Detail page (public, SEO-indexable) with Sign Up button
- Optimistic UI for sign-up action
- iron-session HTTP-only cookie session management
- Supabase for Customer profiles and Events data
- AWS Lambda (explicit, standalone) for Signups and Events APIs
- AWS Amplify hosting

### Out of Scope (Future)
- Event capacity management (`max_attendees`, sold-out enforcement)
- Waitlist when event is full
- Email confirmation on sign-up
- Turborepo/Monorepo consolidation with `grill-excercise`

---

## 5. Architecture Decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Session Management | `iron-session` (HTTP-only cookie) | Secure, no JS-accessible tokens; server is single auth source of truth |
| 2 | Auth Service | `grill-excercise` POST `/api/customer/login` → `{ id, identity, role }` | Existing microservice; owns credentials |
| 3 | Data Ownership | Supabase owns profiles & events; Auth Service owns credentials only | Clear domain separation |
| 4 | Next.js Routing | App Router + React Server Components | SEO, streaming, server-side session reads |
| 5 | Route Protection | Home protected via `middleware.ts`; Events/Detail public | Balance of UX and SEO |
| 6 | Styling | shadcn/ui + Tailwind CSS | Rapid UI, accessible components |
| 7 | Auth State | Server-side only via `layout.tsx` + iron-session; no Zustand/Context | Simpler, no client-side state bugs |
| 8 | Sign Up UX | `useOptimistic` hook + shadcn `toast` rollback on error | Perceived speed; capacity management deferred |
| 9 | Folder Structure | Route Groups `(public)` / `(protected)` + `services/` for Lambdas | Clean separation; easy to extend |
| 10 | Serverless Approach | Option B — Explicit standalone AWS Lambda functions behind API Gateway | Granular control; easier to reason about individually |
| 11 | Lambda Location | `grill-customers-app/services/` | Co-located with the frontend in the same polyrepo |
| 12 | Database | Supabase (PostgreSQL) | Relational data model; Realtime optional; no local setup needed |
| 13 | Secrets Management | AWS SSM Parameter Store (prod); `.env.local` (local dev) | Production parity without secret sprawl |
| 14 | Cold Start Mitigation | EventBridge warm-up ping every 5 min on Signups Lambda only | Signups are user-triggered and latency-sensitive |
| 15 | Concurrency | Auth: PC=60/RC=100; Events List+Detail: PC=10/RC=200; Signups: shared pool | Optimised per traffic pattern and criticality |
| 16 | CORS | Configured at API Gateway level in `serverless.yml` | Inherited by all Lambdas; single source of truth |
| 17 | Repo Strategy | Polyrepo | Isolates complexity; fast Amplify deploys; Turborepo proposed as future optimisation |

---

## 6. Data Model

### Supabase Schema

```sql
-- Customers (profile data, owned by this app)
CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     INTEGER NOT NULL UNIQUE,  -- FK to grill-excercise auth service id
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  bio         TEXT,
  country     TEXT NOT NULL
);

-- Events
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location    TEXT NOT NULL,
  banner_url  TEXT,
  tagline     TEXT,
  description TEXT,
  country     TEXT NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL
);

-- Signups (junction table)
CREATE TABLE customer_events (
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  signed_up_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (customer_id, event_id)
);
```

---

## 7. Pages & Route Map

| Page | Route | Auth Required | Notes |
|---|---|---|---|
| Login | `/login` | No | Redirects to `/` if already logged in |
| Home / Dashboard | `/` | Yes | Signed-up events + hot upcoming events |
| Upcoming Events | `/events` | No | Public, SEO-indexable; filtered by country |
| Event Detail | `/events/[id]` | No | Public, SEO-indexable; Sign Up button |

### Route Protection
- `middleware.ts` at root: intercepts `/` and sub-paths → redirects unauthenticated users to `/login`.
- Sign Up button on Event Detail: if no session → redirect to `/login?redirect=/events/[id]` so user returns to the event after login.

---

## 8. Folder Structure

```
app/
  (public)/
    events/
      page.tsx              ← Upcoming Events list (public, SEO)
      [id]/
        page.tsx            ← Event Detail (public, SEO)
  (protected)/
    page.tsx                ← Home / Dashboard (auth required)
  login/
    page.tsx                ← Login page
  layout.tsx                ← Root layout — reads iron-session, passes user as props

middleware.ts               ← Redirects unauthenticated users from (protected) routes

components/
  events/
    EventCard.tsx
    SignUpButton.tsx         ← "use client" — uses useOptimistic + toast
  layout/
    Navbar.tsx

lib/
  supabase.ts               ← Supabase client singleton
  session.ts                ← iron-session config + getSession helper
  actions/
    signUpAction.ts         ← Server Action: writes to customer_events in Supabase
    loginAction.ts          ← Server Action: calls grill-excercise auth service

services/
  events/
    handler.ts              ← Lambda: GET /events, GET /events/:id
    serverless.yml
  signups/
    handler.ts              ← Lambda: POST /signups
    serverless.yml
```

---

## 9. API Contracts

### Auth Service (grill-excercise)
```
POST http://localhost:3000/api/customer/login
Body: { "username": string, "password": string }
Success: 200 { "success": true, "id": number, "identity": string, "role": string }
Failure: 401 { "success": false, "message": string }
```

### Events Lambda
```
GET /events?country=AU         → list of Event[]
GET /events/:id                → single Event
```

### Signups Lambda
```
POST /signups
Body: { "customerId": string, "eventId": string }
Success: 201 { "success": true }
Failure: 400 | 409 (already signed up)
```

---

## 10. Infrastructure

### Hosting
- **Next.js Frontend:** AWS Amplify Hosting (CloudFront + Lambda@Edge for SSR)
- **Backend Lambdas:** AWS API Gateway + Lambda via Serverless Framework

### Serverless Configuration (per Lambda service)
```yaml
provider:
  name: aws
  runtime: nodejs20.x
  region: ap-southeast-2
  environment:
    SUPABASE_URL: ${ssm:/grill-customers/supabase-url}
    SUPABASE_ANON_KEY: ${ssm:/grill-customers/supabase-anon-key}
  httpApi:
    cors:
      allowedOrigins:
        - https://your-amplify-domain.amplifyapp.com
      allowedMethods: [GET, POST, OPTIONS]
      allowedHeaders: [Content-Type, Authorization]

functions:
  warmUp:
    handler: handler.warmUp
    events:
      - schedule: rate(5 minutes)  # Signups Lambda only
```

### Concurrency Settings
```yaml
# Auth Lambda
provisionedConcurrency: 60
reservedConcurrency: 100

# Events Lambda (List + Detail)
provisionedConcurrency: 10
reservedConcurrency: 200

# Signups Lambda
# No reserved concurrency — draws from shared account pool
```

### Local Development
- `serverless-offline` simulates API Gateway + Lambda at `localhost:3001`
- Secrets: `.env.local` pointing to live Supabase Cloud (cloud-first dev, no Docker)
- Auth service: run `grill-excercise` locally at `localhost:3000`

---

## 11. Security Considerations

- Session token stored in HTTP-only, Secure, SameSite=Strict cookie via iron-session — not accessible to JavaScript.
- Auth credentials never stored client-side.
- Supabase Row Level Security (RLS) to be enabled; customers may only read/write their own `customer_events` rows.
- AWS SSM stores all production secrets; no secrets in environment variables or source code.
- CORS restricted to Amplify domain only.

---

## 12. Tech Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Session | iron-session (HTTP-only cookie) |
| Database | Supabase (PostgreSQL) |
| Auth Service | grill-excercise (Node.js/Express) |
| Lambda Runtime | Node.js 20.x |
| IaC / Deploy | Serverless Framework |
| Frontend Hosting | AWS Amplify |
| Secrets (Prod) | AWS SSM Parameter Store |
| Local Dev | serverless-offline + .env.local |
