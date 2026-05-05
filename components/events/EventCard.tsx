type EventCardProps = {
  event: {
    id: string;
    name: string;
    location: string;
    banner_url: string;
    tagline: string;
    country: string;
    start_time: string;
    end_time: string;
  };
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <img
        src={event.banner_url}
        alt={event.name}
        className="h-44 w-full object-cover"
        loading="lazy"
      />
      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {event.country}
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{event.name}</h2>
        <p className="text-sm text-zinc-600">{event.tagline}</p>
        <p className="text-sm text-zinc-700">{event.location}</p>
        <p className="text-xs text-zinc-600">
          {formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}
        </p>
      </div>
    </article>
  );
}
