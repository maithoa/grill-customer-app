# 1. Overview 
This is the second part of a microservice architect (for the learning purpose of software architecture) that would use authentication from repo `grill-excercise` and this instruciton is for the second app that will be used by customers. Customers will login and browse events in the future and check their upcoming events that they have signed up for. The app scope can be expanded later however with the 4hrs limitation, we would focus on integrate with the login service http://localhost:3000/api/customer/login and then create mock data of users (few of them) and then mock data of events. 

# 2. Data Entities

## Data Ownership
- **Auth Service (`grill-excercise`)** owns: `id`, `email`, `passwordHash` — identity verification only.
- **Supabase (Customer App)** owns: full Customer profile and all Events data.

## Supabase Schema
- Customers table: `id`, `auth_id` (FK to Auth Service id), `full_name`, `email`, `bio`, `country`
- Events table: `id`, `name`, `location`, `banner_url`, `tagline`, `description`, `country`, `start_time`, `end_time`
- Customer_Events table (signup junction): `customer_id`, `event_id`

# 3. Pages & Route Protection

| Page | Route | Auth Required | Notes |
|---|---|---|---|
| Login | `/login` | No | Redirects to `/` if already logged in |
| Home | `/` | ✅ Yes | Shows signed-up events + hot upcoming events. Redirects to `/login` if unauthenticated |
| Upcoming Events | `/events` | No | Public, SEO-indexable. Filtered by customer country by default |
| Event Detail | `/events/[id]` | No | Public, SEO-indexable. "Sign Up" button redirects to `/login` if unauthenticated |

## Route Protection Strategy
- `middleware.ts` at the root intercepts requests to `/` and redirects unauthenticated users to `/login`.
- The "Sign Up for Event" button on Event Detail checks session client-side; if no session → redirect to `/login?redirect=/events/[id]` so user lands back on the event after login.
- The app will have Home page where displaying cards of signed up events and future events that is 'hot' 
- Then app will also have Upcoming events page where it shows all upcoming events and default filtered by customer's country
- The app will also have event detail page where we show all information related to an event
- **Sign Up for Event** uses Optimistic UI (`useOptimistic` hook): button immediately shows "Signed Up ✓" on click; reverts with a `shadcn/ui` toast error if the Server Action fails.

## Future Scope (Out of current sprint)
- Event capacity management: add `max_attendees` to Events table, enforce `COUNT(customer_events) >= max_attendees` check in the sign-up Server Action before inserting.
- Email confirmation on sign-up.
- Waitlist when event is full.


# 3. Designing a New Frontend Architecture (Next.js Application)

A new application for Customers was proposed. The goal is to provide a frontend for customers to view upcoming events and sign up.

### Recommended Stack:
- **Frontend / SSR / BFF:** React & Next.js (App Router) with React Server Components for SEO-optimised server-side rendering.
- **Styling:** shadcn/ui + Tailwind CSS.
- **Session Management:** HTTP-only Cookie via `iron-session`. Server is the single source of truth for auth state — `layout.tsx` reads the session and passes `user` as props to child components. No client-side state library.
- **Backend Auth:** The current Node.js/Express service (`grill-excercise`) — returns `{ id, identity, role }` on success.
- **Database:** Supabase (PostgreSQL) — owns Customer profiles and Events data.

### Architectural Blueprint (Microservices combined with DBaaS):
- `grill-customer-nextjs` handles routing, SSR events, and fetching from Supabase.
- `grill-excercise-auth` handles identity verification.

## 7. Project Folder Structure

```
app/
  (public)/
    events/
      page.tsx              ← Upcoming Events list (SEO, public)
      [id]/
        page.tsx            ← Event Detail (SEO, public)
  (protected)/
    page.tsx                ← Home / Dashboard (requires login)
  login/
    page.tsx                ← Login page
  layout.tsx                ← Root layout — reads iron-session, passes user as props
middleware.ts               ← Redirects unauthenticated users away from (protected) routes
components/
  events/
    EventCard.tsx
    SignUpButton.tsx         ← "use client" — uses useOptimistic
  layout/
    Navbar.tsx
lib/
  supabase.ts               ← Supabase client singleton
  session.ts                ← iron-session config and helpers
  actions/
    signUpAction.ts         ← Server Action: write Customer_Events to Supabase
    loginAction.ts          ← Server Action: call grill-excercise auth service
```

To make the architecture heavily "Enterprise/Interview Ready", an AWS path was designed:
1. **Next.js Hosting:** AWS Amplify Hosting (CloudFront + Lambda@Edge).
2. **Express Backend:** AWS Lambda wrapped via `serverless-http` coupled with Amazon API Gateway.
3. **Database Alternative (Discussed):** Amazon DynamoDB, as a pure NoSQL Serverless alternative to Supabase.

## 5. Development Strategy: Monorepo vs Polyrepo

For a tight 4-hour timeline:
- **Selected Method:** **Polyrepo (Separate Repositories).** Isolates complexity, removes build-tool overhead (like Turborepo), and ensures fast AWS Amplify deployments.
- **Interview Talking Point:** Propose Turborepo/Monorepo as the *future* optimization to share TypeScript types/schemas between frontend and backend.

## 6. Serverless Local Development & Database

Clarifications around local development in a serverless environment:
- **Express Backend:** Can easily be tested locally using the `serverless-offline` plugin, which simulates API Gateway & Lambda at `localhost:3000`.
- **Database (Supabase Strategy):** Decided to completely skip local database setups (like Docker or local Postgres). Instead, connecting the local environment directly to the live Supabase Cloud Database (Cloud-first Development) was chosen as the most efficient, production-parity approach for a 4-hour objective.