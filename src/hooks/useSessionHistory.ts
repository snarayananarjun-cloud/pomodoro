import { useCallback, useEffect, useState } from 'react';
import type { FocusSession } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  addDays,
  dateKey,
  daysInMonth,
  monthForOffset,
  startOfWeekMonday,
  weekDayLetters,
  weekDays,
} from '../lib/date';

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export interface WeekDayCount {
  day: string;
  count: number;
}

export interface MonthDay {
  day: number;
  count: number;
  sessions: FocusSession[];
}

interface SessionRow {
  id: string;
  completed_at: string;
  note: string | null;
}

/** Reads/writes the signed-in user's focus-session log from the `focus_sessions` table. */
export function useSessionHistory(userId: string | null) {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    if (!userId || !supabase) {
      setSessions([]);
      return;
    }
    let cancelled = false;
    supabase
      .from('focus_sessions')
      .select('id, completed_at, note')
      .eq('user_id', userId)
      .order('completed_at', { ascending: true })
      .then(({ data, error }: { data: SessionRow[] | null; error: { message: string } | null }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load focus sessions', error);
          return;
        }
        setSessions((data ?? []).map((row) => ({ id: row.id, completedAt: new Date(row.completed_at).getTime(), note: row.note })));
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addSession = useCallback(
    (note: string | null) => {
      if (!userId || !supabase) return;
      const completedAt = Date.now();
      const optimisticId = makeId();
      setSessions((prev) => [...prev, { id: optimisticId, completedAt, note }]);
      supabase
        .from('focus_sessions')
        .insert({ user_id: userId, completed_at: new Date(completedAt).toISOString(), note })
        .select('id')
        .single()
        .then(({ data, error }: { data: { id: string } | null; error: { message: string } | null }) => {
          if (error) {
            console.error('Failed to save focus session', error);
            return;
          }
          if (data) {
            setSessions((prev) => prev.map((s) => (s.id === optimisticId ? { ...s, id: data.id } : s)));
          }
        });
    },
    [userId],
  );

  const today = dateKey(new Date());
  const sessionsToday = sessions.filter((s) => dateKey(new Date(s.completedAt)) === today).length;
  const totalAllTime = sessions.length;

  const weekCounts = useCallback(
    (offset: number): WeekDayCount[] => {
      const weekStart = addDays(startOfWeekMonday(new Date()), -offset * 7);
      const letters = weekDayLetters();
      return weekDays(weekStart).map((d, i) => {
        const key = dateKey(d);
        const count = sessions.filter((s) => dateKey(new Date(s.completedAt)) === key).length;
        return { day: letters[i], count };
      });
    },
    [sessions],
  );

  const monthDays = useCallback(
    (offset: number): { year: number; month: number; days: MonthDay[] } => {
      const { year, month } = monthForOffset(offset);
      const total = daysInMonth(year, month);
      const days: MonthDay[] = Array.from({ length: total }, (_, i) => {
        const day = i + 1;
        const key = dateKey(new Date(year, month, day));
        const daySessions = sessions
          .filter((s) => dateKey(new Date(s.completedAt)) === key)
          .sort((a, b) => a.completedAt - b.completedAt);
        return { day, count: daySessions.length, sessions: daySessions };
      });
      return { year, month, days };
    },
    [sessions],
  );

  return { sessionsToday, totalAllTime, addSession, weekCounts, monthDays };
}
