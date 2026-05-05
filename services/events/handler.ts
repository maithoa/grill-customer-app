import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { createClient } from '@supabase/supabase-js';

type EventRow = {
  id: string;
  name: string;
  location: string;
  banner_url: string;
  tagline: string;
  country: string;
  start_time: string;
  end_time: string;
};

type EventDetailRow = EventRow & {
  description: string;
};

function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function getSupabaseEnv() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function listEvents(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  if (event.requestContext.http.method !== 'GET') {
    return jsonResponse(405, { message: 'Method not allowed.' });
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const eventId = event.pathParameters?.id?.trim();

    if (eventId) {
      const { data, error } = await supabase
        .from('events')
        .select(
          'id, name, location, banner_url, tagline, description, country, start_time, end_time'
        )
        .eq('id', eventId)
        .maybeSingle();

      if (error) {
        console.error(
          JSON.stringify({
            boundary: 'events.detail',
            message: 'Failed to query event detail from Supabase.',
            details: error.message,
            eventId,
          })
        );

        return jsonResponse(500, {
          message: 'Unable to load event right now. Please try again later.',
        });
      }

      if (!data) {
        return jsonResponse(404, {
          message: 'Event not found.',
        });
      }

      return jsonResponse(200, data satisfies EventDetailRow);
    }

    const rawCountry = event.queryStringParameters?.country;
    const country = typeof rawCountry === 'string' ? rawCountry.trim() : '';

    let query = supabase
      .from('events')
      .select('id, name, location, banner_url, tagline, country, start_time, end_time')
      .order('start_time', { ascending: true });

    if (country.length > 0) {
      query = query.eq('country', country);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        JSON.stringify({
          boundary: 'events.list',
          message: 'Failed to query events from Supabase.',
          details: error.message,
          country,
        })
      );

      return jsonResponse(500, {
        message: 'Unable to load events right now. Please try again later.',
      });
    }

    return jsonResponse(200, data satisfies EventRow[]);
  } catch (error) {
    console.error(
      JSON.stringify({
        boundary: 'events.list',
        message: 'Unexpected failure while listing events.',
        details: error instanceof Error ? error.message : String(error),
      })
    );

    return jsonResponse(500, {
      message: 'Unexpected server error while loading events.',
    });
  }
}
