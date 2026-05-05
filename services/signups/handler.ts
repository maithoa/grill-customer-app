import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { createClient } from '@supabase/supabase-js';

type SignUpPayload = {
  customerId: string;
  eventId: string;
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
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables.'
    );
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

function parseSignUpPayload(event: APIGatewayProxyEventV2): SignUpPayload | null {
  if (!event.body) {
    return null;
  }

  const parsed = JSON.parse(event.body) as Partial<SignUpPayload>;

  if (typeof parsed.customerId !== 'string' || typeof parsed.eventId !== 'string') {
    return null;
  }

  const customerId = parsed.customerId.trim();
  const eventId = parsed.eventId.trim();

  if (!customerId || !eventId) {
    return null;
  }

  return { customerId, eventId };
}

function isDuplicateSignUpError(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false;
  }

  return error.code === '23505' || error.message?.toLowerCase().includes('duplicate') === true;
}

export async function signUp(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext?.http?.method;

  if (!method) {
    return jsonResponse(200, { success: true, message: 'Warm.' });
  }

  if (method !== 'POST') {
    return jsonResponse(405, { success: false, message: 'Method not allowed.' });
  }

  let payload: SignUpPayload | null = null;

  try {
    payload = parseSignUpPayload(event);
  } catch {
    return jsonResponse(400, {
      success: false,
      message: 'Invalid request body. Expected { customerId, eventId }.',
    });
  }

  if (!payload) {
    return jsonResponse(400, {
      success: false,
      message: 'Invalid request body. Expected { customerId, eventId }.',
    });
  }

  try {
    const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseEnv();
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error } = await supabase.from('customer_events').insert({
      customer_id: payload.customerId,
      event_id: payload.eventId,
    });

    if (isDuplicateSignUpError(error)) {
      return jsonResponse(409, {
        success: false,
        message: 'Customer is already signed up for this event.',
      });
    }

    if (error) {
      console.error(
        JSON.stringify({
          boundary: 'signups.create',
          message: 'Failed to create customer signup.',
          details: error.message,
          code: error.code,
          customerId: payload.customerId,
          eventId: payload.eventId,
        })
      );

      return jsonResponse(500, {
        success: false,
        message: 'Unable to sign up right now. Please try again later.',
      });
    }

    return jsonResponse(201, { success: true });
  } catch (error) {
    console.error(
      JSON.stringify({
        boundary: 'signups.create',
        message: 'Unexpected failure while creating customer signup.',
        details: error instanceof Error ? error.message : String(error),
        customerId: payload?.customerId,
        eventId: payload?.eventId,
      })
    );

    return jsonResponse(500, {
      success: false,
      message: 'Unexpected server error while creating signup.',
    });
  }
}