import { supabase } from '@/lib/supabase';

export type EventSummary = {
  id: string;
  name: string;
  location: string;
  country: string;
  tagline: string;
  banner_url: string;
  start_time: string;
  end_time: string;
};

type CustomerEventRow = {
  signed_up_at: string;
  events: EventSummary | EventSummary[] | null;
};

export async function getCustomerSignedUpEvents(
  customerId: string
): Promise<EventSummary[]> {
  const { data, error } = await supabase
    .from('customer_events')
    .select(
      'signed_up_at, events(id, name, location, country, tagline, banner_url, start_time, end_time)'
    )
    .eq('customer_id', customerId)
    .order('signed_up_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load customer signups: ${error.message}`);
  }

  const rows = (data ?? []) as CustomerEventRow[];

  return rows
    .map((row) => {
      if (!row.events) {
        return null;
      }

      return Array.isArray(row.events) ? row.events[0] : row.events;
    })
    .filter((event): event is EventSummary => Boolean(event));
}

export async function getHotUpcomingEvents(limit = 4): Promise<EventSummary[]> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('id, name, location, country, tagline, banner_url, start_time, end_time')
    .gte('start_time', nowIso)
    .order('start_time', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load upcoming events: ${error.message}`);
  }

  return data ?? [];
}