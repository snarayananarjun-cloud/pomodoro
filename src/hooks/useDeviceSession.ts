import { useEffect, useState } from 'react';
import { supabase, supabaseConfigError } from '../lib/supabaseClient';

/**
 * Silently establishes a per-device identity with no user-facing step: reuses
 * an existing Supabase session if the browser already has one (persisted in
 * localStorage by the SDK), or transparently creates an anonymous one on
 * first visit. Every focus session and accent preference is then scoped to
 * that identity via the same RLS policies used for regular accounts — an
 * anonymous session still has a real, unforgeable auth.uid().
 */
export function useDeviceSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!supabaseConfigError);
  const [error, setError] = useState<string | null>(supabaseConfigError);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase!.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setUserId(data.session.user.id);
        setLoading(false);
        return;
      }
      const { data: anon, error: anonError } = await supabase!.auth.signInAnonymously();
      if (cancelled) return;
      if (anonError) {
        setError(anonError.message);
      } else {
        setUserId(anon.user?.id ?? null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { userId, loading, error };
}
