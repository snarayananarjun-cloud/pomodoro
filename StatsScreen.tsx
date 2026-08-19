import { ArrowLeft } from '@phosphor-icons/react';
import type { MonthDay, WeekDayCount } from '../hooks/useSessionHistory';
import { WeekChart } from './WeekChart';
import { MonthHeatmap } from './MonthHeatmap';

interface Props {
  sessionsToday: number;
  totalAllTime: number;
  accentColor: string;
  weekOffset: number;
  weekDays: WeekDayCount[];
  monthOffset: number;
  monthYear: number;
  monthMonth: number;
  monthDays: MonthDay[];
  onGoTimer: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: number) => void;
}

export function StatsScreen(props: Props) {
  const {
    sessionsToday,
    totalAllTime,
    accentColor,
    weekOffset,
    weekDays,
    monthOffset,
    monthYear,
    monthMonth,
    monthDays,
    onGoTimer,
    onPrevWeek,
    onNextWeek,
    onPrevMonth,
    onNextMonth,
    onDayClick,
  } = props;

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '28px 22px 24px', boxSizing: 'border-box' }}>
      <button
        type="button"
        onClick={onGoTimer}
        aria-label="Back to timer"
        style={{ display: 'inline-flex', marginBottom: 20, cursor: 'pointer', width: 32, background: 'none', border: 'none', padding: 0 }}
      >
        <ArrowLeft size={22} color="#1A1A1A" />
      </button>

      <div style={{ background: '#1A1A1A', borderRadius: 22, padding: '20px 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: 'rgba(251,243,236,0.55)', marginBottom: 10 }}>
          YOUR FOCUS LOG
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 36, color: '#FBF3EC' }}>{sessionsToday}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(251,243,236,0.6)' }}>today</span>
          <span style={{ fontSize: 16, color: 'rgba(251,243,236,0.35)' }}>&middot;</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 36, color: '#FBF3EC' }}>{totalAllTime}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(251,243,236,0.6)' }}>total</span>
        </div>
      </div>

      <WeekChart offset={weekOffset} days={weekDays} accentColor={accentColor} onPrev={onPrevWeek} onNext={onNextWeek} />

      <MonthHeatmap
        offset={monthOffset}
        year={monthYear}
        month={monthMonth}
        days={monthDays}
        accentColor={accentColor}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
        onDayClick={onDayClick}
      />
    </div>
  );
}
