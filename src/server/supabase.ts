import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.js';
import { getEnv } from '../lib/env.js';
let service: SupabaseClient<Database> | undefined;
export function getServiceClient(): SupabaseClient<Database> {
  if (!service) { const env = getEnv(); service = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }); }
  return service;
}
export function getUserClient(token: string): SupabaseClient<Database> {
  const env = getEnv();
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
}
