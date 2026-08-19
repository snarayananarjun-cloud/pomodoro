import type { ReactNode } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { WeekDayCount } from '../hooks/useSessionHistory';
import { weekLabel } from '../lib/date';

interface Props {
  offset: number;
  days: WeekDayCount[];
  accentColor: string;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekChart({ offset, days, accentColor, onPrev, onNext }: Props) {
  const maxCount = Math.max(0, ...days.map((d) => d.count));

  return (
    <div style={{ background: '#F1E7DC', borderRadius: 22, padding: '18px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8C8079' }}>
          {weekLabel(offset)}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <NavButton onClick={onPrev} accentColor={accentColor} label="Previous week">
            <CaretLeft size={13} color={accentColor} />
          </NavButton>
          <NavButton onClick={onNext} accentColor={accentColor} disabled={offset === 0} label="Next week">
            <CaretRight size={13} color={accentColor} />
          </NavButton>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {days.map((d, i) => {
          const pct = maxCount > 0 ? Math.max(8, Math.round((d.count / maxCount) * 100)) : 8;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: 22, height: `${pct}%`, background: accentColor, borderRadius: '8px 8px 3px 3px' }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8C8079' }}>{d.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  accentColor: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 24,
        height: 24,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        background: 'none',
        border: 'none',
      }}
    >
      {children}
    </button>
  );
}
