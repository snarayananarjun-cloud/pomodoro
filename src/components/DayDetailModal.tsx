import type { FocusSession } from '../types';
import { formatTime } from '../lib/date';

interface Props {
  title: string;
  sessions: FocusSession[];
  accentColor: string;
  onClose: () => void;
}

export function DayDetailModal({ title, sessions, accentColor, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,26,26,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        padding: '0 28px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FBF3EC',
          borderRadius: 22,
          padding: 22,
          width: '100%',
          maxWidth: 380,
          maxHeight: '70%',
          overflowY: 'auto',
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
          animation: 'modal-in 0.25s ease',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 14 }}>{title}</div>
        {sessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map((sess) => (
              <div key={sess.id} style={{ background: '#F1E7DC', borderRadius: 14, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: accentColor, marginBottom: 3 }}>{formatTime(sess.completedAt)}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: sess.note ? '#1A1A1A' : '#8A7B70' }}>{sess.note || 'No note added'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8A7B70', padding: '8px 0 4px' }}>No sessions logged this day.</div>
        )}
      </div>
    </div>
  );
}
