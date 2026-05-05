import { notFound } from 'next/navigation';
import { SignUpButton } from '@/components/events/SignUpButton';
import { signUpAction } from '@/lib/actions/signUpAction';
import { getCustomerByAuthId } from '@/lib/queries/customers';
import { getCustomerSignedUpEvents } from '@/lib/queries/events';
import { getSession } from '@/lib/session';

type EventDetail = {
  id: string;
  name: string;
  location: string;
  banner_url: string;
  tagline: string;
  description: string;
  country: string;
  start_time: string;
  end_time: string;
};

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function getEventDetail(id: string): Promise<EventDetail> {
  const baseUrl = process.env.EVENTS_API_BASE_URL ?? 'http://localhost:3001';
  const url = new URL(`/events/${id}`, baseUrl);

  const response = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to load event detail: ${response.status}`);
  }

  const payload = (await response.json()) as EventDetail;

  if (!payload?.id) {
    notFound();
  }

  return payload;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const [event, session] = await Promise.all([getEventDetail(id), getSession()]);
  const isAuthenticated = Boolean(session.user);
  let isInitiallySignedUp = false;

  if (session.user) {
    const customer = await getCustomerByAuthId(session.user.id);

    if (customer) {
      const signedUpEvents = await getCustomerSignedUpEvents(customer.id);
      isInitiallySignedUp = signedUpEvents.some((signedUpEvent) => signedUpEvent.id === event.id);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <article className="space-y-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <img src={event.banner_url} alt={event.name} className="h-64 w-full object-cover sm:h-80" />

        <div className="space-y-6 p-6 sm:p-8">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {event.country}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{event.name}</h1>
            <p className="text-lg text-zinc-700">{event.tagline}</p>
          </header>

          <dl className="grid gap-4 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Location</dt>
              <dd className="mt-1 text-sm text-zinc-800">{event.location}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Starts</dt>
              <dd className="mt-1 text-sm text-zinc-800">{formatDateTime(event.start_time)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Ends</dt>
              <dd className="mt-1 text-sm text-zinc-800">{formatDateTime(event.end_time)}</dd>
            </div>
          </dl>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">About this event</h2>
            <p className="whitespace-pre-line text-zinc-700">{event.description}</p>
          </section>

          <section className="border-t border-zinc-200 pt-6">
            <SignUpButton
              eventId={event.id}
              isAuthenticated={isAuthenticated}
              isInitiallySignedUp={isInitiallySignedUp}
              signUpAction={isAuthenticated ? signUpAction.bind(null, event.id) : undefined}
            />
          </section>
        </div>
      </article>
    </main>
  );
}
