const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Monday-start week containing `d`, at local midnight Monday. */
export function startOfWeekMonday(d: Date): Date {
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(startOfDay(d), diff);
}

export function weekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function weekDayLetters(): string[] {
  return DAY_LETTERS;
}

export function weekLabel(offset: number): string {
  if (offset === 0) return 'this week';
  if (offset === 1) return 'last week';
  return `${offset} weeks ago`;
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** year/month (0-indexed) for the calendar `monthOffset` months before the current one. */
export function monthForOffset(offset: number): { year: number; month: number } {
  const now = new Date();
  const total = now.getFullYear() * 12 + now.getMonth() - offset;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function dayModalTitle(year: number, month: number, day: number): string {
  return new Date(year, month, day).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
