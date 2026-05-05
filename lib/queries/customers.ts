import { supabase } from '@/lib/supabase';

export type CustomerProfile = {
  id: string;
  auth_id: number;
  full_name: string;
  email: string;
  bio: string | null;
  country: string;
};

export async function getCustomerByAuthId(
  authId: number
): Promise<CustomerProfile | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, auth_id, full_name, email, bio, country')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load customer profile: ${error.message}`);
  }

  return data;
}