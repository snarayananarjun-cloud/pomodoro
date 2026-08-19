import { useCallback, useState } from 'react';
import type { FocusSession } from '../types';
import { loadSessions, saveSessions } from '../lib/storage';
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

export function useSessionHistory() {
  const [sessions, setSessions] = useState<FocusSession[]>(() => loadSessions());

  const addSession = useCallback((note: string | null) => {
    setSessions((prev) => {
      const next = [...prev, { id: makeId(), completedAt: Date.now(), note }];
      saveSessions(next);
      return next;
    });
  }, []);

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
