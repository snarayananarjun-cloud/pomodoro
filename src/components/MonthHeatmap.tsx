import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { MonthDay } from '../hooks/useSessionHistory';
import { monthLabel } from '../lib/date';

/** Fill strength grows with session count so busier days read as visibly stronger. */
function cellBackground(count: number, accent: string): string {
  if (count === 0) return '#FFFFFF';
  const strength = Math.min(1, 0.32 + count * 0.17);
  return `color-mix(in srgb, ${accent} ${Math.round(strength * 100)}%, #FFFFFF)`;
}

function cellBorder(count: number, accent: string): string {
  return count === 0 ? '1px solid rgba(26,26,26,0.12)' : `1px solid color-mix(in srgb, ${accent} 45%, rgba(26,26,26,0.12))`;
}

interface Props {
  offset: number;
  year: number;
  month: number;
  days: MonthDay[];
  accentColor: string;
  onPrev: () => void;
  onNext: () => void;
  onDayClick: (day: number) => void;
}

export function MonthHeatmap({ offset, year, month, days, accentColor, onPrev, onNext, onDayClick }: Props) {
  return (
    <div style={{ background: '#F1E7DC', borderRadius: 22, padding: '18px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8C8079' }}>
          {monthLabel(year, month)}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous month"
            style={{ width: 24, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <CaretLeft size={13} color={accentColor} />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={offset === 0}
            aria-label="Next month"
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: offset === 0 ? 'default' : 'pointer',
              opacity: offset === 0 ? 0.3 : 1,
              background: 'none',
              border: 'none',
            }}
          >
            <CaretRight size={13} color={accentColor} />
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 7 }}>
        {days.map((d) => (
          <div
            key={d.day}
            onClick={() => onDayClick(d.day)}
            role="button"
            aria-label={`${monthLabel(year, month)} ${d.day}, ${d.count} session${d.count === 1 ? '' : 's'}`}
            style={{
              aspectRatio: '1',
              borderRadius: 6,
              background: cellBackground(d.count, accentColor),
              border: cellBorder(d.count, accentColor),
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}
