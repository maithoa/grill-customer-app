import { EventCard } from '@/components/events/EventCard';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type EventRecord = {
  id: string;
  name: string;
  location: string;
  banner_url: string;
  tagline: string;
  country: string;
  start_time: string;
  end_time: string;
};

export const metadata = {
  title: 'Upcoming Events | Grill Customers App',
  description: 'Browse upcoming grill events near you and around the world.',
};

async function getPreferredCountry(authId?: number): Promise<string | null> {
  if (!authId) {
    return null;
  }

  const { data, error } = await supabase
    .from('customers')
    .select('country')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error) {
    console.error(
      JSON.stringify({
        boundary: 'events.page.country',
        message: 'Failed to resolve customer country for events filter.',
        authId,
        details: error.message,
      })
    );

    return null;
  }

  const customer = data as { country?: string } | null;
  return customer?.country ?? null;
}

async function getUpcomingEvents(country?: string | null): Promise<EventRecord[]> {
  const baseUrl = process.env.EVENTS_API_BASE_URL ?? 'http://localhost:3001';
  const url = new URL('/events', baseUrl);

  if (country && country.length > 0) {
    url.searchParams.set('country', country);
  }

  const response = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(
      JSON.stringify({
        boundary: 'events.page.fetch',
        message: 'Events API returned a non-success status.',
        status: response.status,
        url: url.toString(),
      })
    );
    return [];
  }

  const payload = (await response.json()) as EventRecord[];
  return Array.isArray(payload) ? payload : [];
}

export default async function EventsPage() {
  const session = await getSession();
  const preferredCountry = await getPreferredCountry(session.user?.id);
  const events = await getUpcomingEvents(preferredCountry);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Upcoming Events</h1>
        <p className="text-zinc-600">
          {preferredCountry
            ? `Showing upcoming events in ${preferredCountry}.`
            : 'Showing all upcoming events.'}
        </p>
      </section>

      {events.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-zinc-600">
          No upcoming events found right now.
        </section>
      ) : (
        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
              aria-label={`View details for ${event.name}`}
            >
              <EventCard event={event} />
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
