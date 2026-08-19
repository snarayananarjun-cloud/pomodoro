import type { FocusSession } from '../types';

export interface StoredAccent {
  color: string;
  hue: number;
  sat: number;
}

const ACCENT_KEY = 'ptln-accent';
const SESSIONS_KEY = 'ptln-focus-sessions';

export function loadAccent(): StoredAccent | null {
  try {
    const raw = localStorage.getItem(ACCENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.color === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveAccent(accent: StoredAccent): void {
  try {
    localStorage.setItem(ACCENT_KEY, JSON.stringify(accent));
  } catch {
    // storage unavailable (private mode, quota) — accent just won't persist
  }
}

export function loadSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // storage unavailable — history just won't persist this run
  }
}
