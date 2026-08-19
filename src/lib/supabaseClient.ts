import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function resolveConfig(): { url: string; error: null } | { url: null; error: string } {
  if (!rawUrl || !anonKey) {
    return { url: null, error: 'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY environment variables.' };
  }
  try {
    // Catches the easy mistake of pasting just the project ref (e.g. "abcxyz")
    // instead of the full "https://abcxyz.supabase.co" — a bare ref parses as
    // a path relative to the app's own origin instead of Supabase's API.
    const parsed = new URL(rawUrl);
    return { url: parsed.origin, error: null };
  } catch {
    return {
      url: null,
      error: `VITE_SUPABASE_URL isn't a full URL — got "${rawUrl}". It needs the protocol too, e.g. https://your-project.supabase.co`,
    };
  }
}

const config = resolveConfig();

/** Set when required env vars are missing or malformed, so the app can show a
 *  visible message instead of crashing to a blank page or failing mysteriously. */
export const supabaseConfigError = config.error;

export const supabase = config.url ? createClient(config.url, anonKey) : null;
