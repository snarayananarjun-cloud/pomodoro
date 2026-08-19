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

interface UseTimerOptions {
  /** Called when a focus session is logged, via Save (with a trimmed note or null) or Skip (null). */
  onLogSession: (note: string | null) => void;
}

export function useTimer({ onLogSession }: UseTimerOptions) {
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [remaining, setRemaining] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const intervalRef = useRef<number | null>(null);
  const phaseTimeoutRef = useRef<number | null>(null);

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

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    setPhase('expanding');
    const type = sessionType;
    phaseTimeoutRef.current = window.setTimeout(() => setPhase('shrinking'), 420);
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimers();
          setRunning(false);
          setPhase('idle');
          if (type === 'focus') {
            setSessionModalOpen(true);
            setNoteInput('');
            return 0;
          }
          return DURATIONS[type];
        }
        return prev - 1;
      });
    }, 1000);
  }, [running, sessionType, clearTimers]);

  const pause = useCallback(() => {
    clearTimers();
    setRunning(false);
    setPhase('idle');
  }, [clearTimers]);

  const stopSession = useCallback(() => {
    clearTimers();
    setRunning(false);
    setPhase('idle');
    setRemaining(DURATIONS[sessionType]);
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
    setRemaining(DURATIONS[type]);
    setDropdownOpen(false);
  }, []);

  const onNoteChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNoteInput(e.target.value);
  }, []);

  const finishSession = useCallback(
    (note: string | null) => {
      onLogSession(note);
      setSessionModalOpen(false);
      setNoteInput('');
      setRemaining(DURATIONS[sessionType]);
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
