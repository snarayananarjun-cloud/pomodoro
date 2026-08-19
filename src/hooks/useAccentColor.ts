import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const ACCENT_PRESETS = ['#C97B63', '#7A8B7F', '#5B7A9C', '#8B6BA8', '#3A3A3A', '#B0654A'];
const DEFAULT_ACCENT = { color: '#C97B63', hue: 16, sat: 46 };

function hexToHsl(hex: string): { h: number; s: number } | null {
  if (!hex.startsWith('#') || hex.length < 7) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100) };
}

/** Reads/writes the signed-in user's accent preference from the `profiles` table. */
export function useAccentColor(userId: string | null) {
  const [accent, setAccent] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    if (!userId || !supabase) {
      setAccent(DEFAULT_ACCENT);
      return;
    }
    let cancelled = false;
    supabase
      .from('profiles')
      .select('accent_color, accent_hue, accent_sat')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load accent color', error);
          return;
        }
        if (data) {
          setAccent({ color: data.accent_color, hue: data.accent_hue, sat: data.accent_sat });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = useCallback(
    (next: typeof DEFAULT_ACCENT) => {
      if (!userId || !supabase) return;
      supabase
        .from('profiles')
        .upsert(
          { user_id: userId, accent_color: next.color, accent_hue: next.hue, accent_sat: next.sat, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
        .then(({ error }) => {
          if (error) console.error('Failed to save accent color', error);
        });
    },
    [userId],
  );

  const selectPreset = useCallback(
    (color: string) => {
      const hs = hexToHsl(color) ?? { h: DEFAULT_ACCENT.hue, s: DEFAULT_ACCENT.sat };
      const next = { color, hue: hs.h, sat: hs.s };
      setAccent(next);
      persist(next);
    },
    [persist],
  );

  const setFromWheel = useCallback(
    (hue: number, sat: number) => {
      const color = `hsl(${hue} ${sat}% 55%)`;
      const next = { color, hue, sat };
      setAccent(next);
      persist(next);
    },
    [persist],
  );

  return {
    accentColor: accent.color,
    hue: accent.hue,
    sat: accent.sat,
    presets: ACCENT_PRESETS,
    selectPreset,
    setFromWheel,
  };
}
