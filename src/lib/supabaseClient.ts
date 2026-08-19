import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Set when required env vars are missing, so the app can show a visible
 *  message instead of crashing to a blank page. */
export const supabaseConfigError =
  !url || !anonKey ? 'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY environment variables.' : null;

export const supabase = supabaseConfigError ? null : createClient(url, anonKey);
