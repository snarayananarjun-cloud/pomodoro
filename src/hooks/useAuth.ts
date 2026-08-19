import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  // undefined = still checking for an existing session; null = signed out.
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return error?.message;
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return {
    loading: session === undefined,
    user: session?.user ?? null,
    signInWithEmail,
    signOut,
  };
}
