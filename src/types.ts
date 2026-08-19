export type SessionType = 'focus' | 'short' | 'long';

export type TimerPhase = 'idle' | 'expanding' | 'shrinking';

export type Screen = 'timer' | 'stats';

export interface FocusSession {
  id: string;
  /** epoch ms when the session was completed */
  completedAt: number;
  note: string | null;
}
