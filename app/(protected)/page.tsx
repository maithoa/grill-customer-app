import { redirect } from 'next/navigation';
import { SignUpButton } from '@/components/events/SignUpButton';
import { logoutAction } from '@/lib/actions/logoutAction';
import { signUpAction } from '@/lib/actions/signUpAction';
import { getCustomerByAuthId } from '@/lib/queries/customers';
import {
  getCustomerSignedUpEvents,
  getHotUpcomingEvents,
  type EventSummary,
} from '@/lib/queries/events';
import { getSession } from '@/lib/session';

function formatEventWindow(start: string, end: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

function EventCard({
  event,
  isInitiallySignedUp,
}: {
  event: EventSummary;
  isInitiallySignedUp: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div
        className="h-32 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${event.banner_url})` }}
        aria-hidden
      />
      <div className="space-y-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {event.country}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{event.name}</h3>
        <p className="text-sm text-zinc-600">{event.tagline}</p>
        <p className="text-sm text-zinc-700">{event.location}</p>
        <p className="text-xs text-zinc-500">
          {formatEventWindow(event.start_time, event.end_time)}
        </p>
        <SignUpButton
          eventId={event.id}
          isAuthenticated
          isInitiallySignedUp={isInitiallySignedUp}
          signUpAction={signUpAction.bind(null, event.id)}
        />
      </div>
    </article>
  );
}

export default async function ProtectedDashboardPage() {
  const session = await getSession();

  if (!session.user) {
    redirect('/login?redirect=/');
  }

  const customer = await getCustomerByAuthId(session.user.id);

  if (!customer) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center px-6 py-10">
        <section className="w-full max-w-xl rounded-2xl border border-amber-300/70 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-xl font-semibold">Profile missing</h1>
          <p className="mt-2 text-sm">
            We could not find your customer profile for auth id {session.user.id}. Contact support or
            try again later.
          </p>
          <form action={logoutAction} className="mt-4">
            <button
              type="submit"
              className="rounded-md border border-amber-500/60 bg-white px-3 py-2 text-sm font-medium hover:bg-amber-100"
            >
              Logout
            </button>
          </form>
        </section>
      </main>
    );
  }

  const [myEvents, hotUpcomingEvents] = await Promise.all([
    getCustomerSignedUpEvents(customer.id),
    getHotUpcomingEvents(4),
  ]);
  const signedUpEventIds = new Set(myEvents.map((event) => event.id));

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {customer.full_name} • {customer.country}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Logout
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">My Events</h2>
        <p className="mt-1 text-sm text-zinc-600">Events you have already signed up for.</p>

        {myEvents.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
            <p className="text-sm text-zinc-700">
              You have not signed up for any events yet. Explore upcoming events and reserve your
              spot.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {myEvents.map((event) => (
              <EventCard key={event.id} event={event} isInitiallySignedUp />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Hot Upcoming Events</h2>
        <p className="mt-1 text-sm text-zinc-600">Next 4 events ordered by start time.</p>

        {hotUpcomingEvents.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
            <p className="text-sm text-zinc-700">No upcoming events are available right now.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {hotUpcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isInitiallySignedUp={signedUpEventIds.has(event.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}