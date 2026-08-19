import { CaretDown, CaretUp } from '@phosphor-icons/react';
import type { SessionType } from '../types';
import { CYCLE_TYPES, TYPE_LABELS } from '../hooks/useTimer';

interface Props {
  sessionType: SessionType;
  accentColor: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (type: SessionType) => void;
}

export function SessionTypeDropdown({ sessionType, accentColor, open, onToggle, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>Time to</div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {TYPE_LABELS[sessionType]}
        </div>
        {open ? <CaretUp size={12} color={accentColor} /> : <CaretDown size={12} color={accentColor} />}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 52,
            background: '#FFFFFF',
            border: '1px solid rgba(26,26,26,0.08)',
            borderRadius: 14,
            boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            padding: 6,
            zIndex: 10,
            minWidth: 150,
          }}
        >
          {CYCLE_TYPES.map((type) => {
            const selected = type === sessionType;
            return (
              <div
                key={type}
                onClick={() => onSelect(type)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 9,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  color: selected ? accentColor : '#1A1A1A',
                  background: selected ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
              >
                {TYPE_LABELS[type]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
