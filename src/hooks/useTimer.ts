import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { SessionType, TimerPhase } from '../types';

export const DURATIONS: Record<SessionType, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export const SESSION_GOAL = 4;

export const TYPE_LABELS: Record<SessionType, string> = {
  focus: 'Focus',
  short: 'Short Break',
  long: 'Long Break',
};

export const CYCLE_TYPES: SessionType[] = ['focus', 'short', 'long'];

const STORAGE_KEY = 'ptln-active-timer';

interface StoredTimer {
  sessionType: SessionType;
  running: boolean;
  /** Absolute epoch ms the session ends at — only set while running. */
  endAt?: number;
  /** Frozen seconds remaining — only set while not running. */
  remaining?: number;
}

function loadStored(): StoredTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTimer) : null;
  } catch {
    return null;
  }
}

function saveStored(next: StoredTimer): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — the countdown just won't survive a reload this run
  }
}

interface InitialTimerState {
  sessionType: SessionType;
  remaining: number;
  running: boolean;
  sessionModalOpen: boolean;
  endAt: number | null;
}

/**
 * Resolves what the timer should show right now, accounting for real time
 * that passed while the app was closed or backgrounded — a running session
 * whose end time has already passed is resolved as completed immediately
 * (focus sessions still surface the note modal, same as finishing in the
 * foreground would have).
 */
function resolveInitialState(): InitialTimerState {
  const stored = loadStored();
  const sessionType: SessionType = stored?.sessionType ?? 'focus';

  if (stored?.running && stored.endAt) {
    const secondsLeft = Math.ceil((stored.endAt - Date.now()) / 1000);
    if (secondsLeft > 0) {
      return { sessionType, remaining: secondsLeft, running: true, sessionModalOpen: false, endAt: stored.endAt };
    }
    if (sessionType === 'focus') {
      return { sessionType, remaining: 0, running: false, sessionModalOpen: true, endAt: null };
    }
    return { sessionType, remaining: DURATIONS[sessionType], running: false, sessionModalOpen: false, endAt: null };
  }

  if (stored && typeof stored.remaining === 'number') {
    return { sessionType, remaining: stored.remaining, running: false, sessionModalOpen: false, endAt: null };
  }

  return { sessionType, remaining: DURATIONS[sessionType], running: false, sessionModalOpen: false, endAt: null };
}

interface UseTimerOptions {
  /** Called when a focus session is logged, via Save (with a trimmed note or null) or Skip (null). */
  onLogSession: (note: string | null) => void;
}

export function useTimer({ onLogSession }: UseTimerOptions) {
  const initial = resolveInitialState();

  const [sessionType, setSessionType] = useState<SessionType>(initial.sessionType);
  const [remaining, setRemaining] = useState(initial.remaining);
  const [running, setRunning] = useState(initial.running);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(initial.sessionModalOpen);
  const [noteInput, setNoteInput] = useState('');

  const intervalRef = useRef<number | null>(null);
  const phaseTimeoutRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(initial.endAt);

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (phaseTimeoutRef.current !== null) {
      window.clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const finishRunningSession = useCallback(() => {
    clearTimers();
    endAtRef.current = null;
    setRunning(false);
    setPhase('idle');
    if (sessionType === 'focus') {
      setRemaining(0);
      setSessionModalOpen(true);
      setNoteInput('');
      saveStored({ sessionType, running: false, remaining: 0 });
    } else {
      const fresh = DURATIONS[sessionType];
      setRemaining(fresh);
      saveStored({ sessionType, running: false, remaining: fresh });
    }
  }, [clearTimers, sessionType]);

  // Recomputes remaining time from the fixed end timestamp, rather than
  // decrementing by one — self-correcting no matter how long a tick was
  // delayed (or skipped entirely) while the tab was backgrounded.
  const tick = useCallback(() => {
    if (!endAtRef.current) return;
    const secondsLeft = Math.ceil((endAtRef.current - Date.now()) / 1000);
    if (secondsLeft <= 0) finishRunningSession();
    else setRemaining(secondsLeft);
  }, [finishRunningSession]);

  // If we resumed straight into an already-running session (page reload,
  // reopening a closed tab), start its interval immediately.
  useEffect(() => {
    if (initial.running) {
      intervalRef.current = window.setInterval(tick, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute the instant the tab/app regains visibility, instead of waiting
  // for the next (possibly throttled) interval tick — this is what makes the
  // countdown reflect real elapsed time right away after being backgrounded.
  useEffect(() => {
    if (!running) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [running, tick]);

  const start = useCallback(() => {
    if (running) return;
    endAtRef.current = Date.now() + remaining * 1000;
    saveStored({ sessionType, running: true, endAt: endAtRef.current });
    setRunning(true);
    setPhase('expanding');
    phaseTimeoutRef.current = window.setTimeout(() => setPhase('shrinking'), 420);
    intervalRef.current = window.setInterval(tick, 1000);
  }, [running, sessionType, remaining, tick]);

  const pause = useCallback(() => {
    clearTimers();
    endAtRef.current = null;
    setRunning(false);
    setPhase('idle');
    saveStored({ sessionType, running: false, remaining });
  }, [clearTimers, sessionType, remaining]);

  const stopSession = useCallback(() => {
    clearTimers();
    endAtRef.current = null;
    setRunning(false);
    setPhase('idle');
    const fresh = DURATIONS[sessionType];
    setRemaining(fresh);
    saveStored({ sessionType, running: false, remaining: fresh });
  }, [clearTimers, sessionType]);

  const toggleRunning = useCallback(() => {
    if (running) pause();
    else start();
  }, [running, pause, start]);

  const toggleDropdown = useCallback(() => {
    if (running) return;
    setDropdownOpen((open) => !open);
  }, [running]);

  const selectType = useCallback((type: SessionType) => {
    setSessionType(type);
    const fresh = DURATIONS[type];
    setRemaining(fresh);
    setDropdownOpen(false);
    saveStored({ sessionType: type, running: false, remaining: fresh });
  }, []);

  const onNoteChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNoteInput(e.target.value);
  }, []);

  const finishSession = useCallback(
    (note: string | null) => {
      onLogSession(note);
      setSessionModalOpen(false);
      setNoteInput('');
      const fresh = DURATIONS[sessionType];
      setRemaining(fresh);
      saveStored({ sessionType, running: false, remaining: fresh });
    },
    [onLogSession, sessionType],
  );

  const saveSession = useCallback(() => finishSession(noteInput.trim() || null), [finishSession, noteInput]);
  const skipSession = useCallback(() => finishSession(null), [finishSession]);

  return {
    sessionType,
    remaining,
    running,
    phase,
    dropdownOpen,
    sessionModalOpen,
    noteInput,
    toggleRunning,
    stopSession,
    toggleDropdown,
    selectType,
    onNoteChange,
    saveSession,
    skipSession,
  };
}
