import type { ChangeEvent } from 'react';

interface Props {
  accentColor: string;
  noteInput: string;
  onNoteChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onSkip: () => void;
}

export function SessionCompleteModal({ accentColor, noteInput, onNoteChange, onSave, onSkip }: Props) {
  return (
    <div
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
        style={{
          background: '#FBF3EC',
          borderRadius: 22,
          padding: '24px 22px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
          animation: 'modal-in 0.25s ease',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Session complete</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#8A7B70', marginBottom: 16 }}>What did you focus on?</div>
        <input
          value={noteInput}
          onChange={onNoteChange}
          placeholder="e.g. Wrote the intro section"
          autoFocus
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: '1.5px solid #E4D6C6',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 14,
            fontFamily: "'Manrope', sans-serif",
            color: '#1A1A1A',
            background: '#FFFFFF',
            outline: 'none',
            marginBottom: 18,
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onSkip}
            style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#8A7B70', background: '#EFE4D8', cursor: 'pointer', border: 'none' }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onSave}
            style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#FFFFFF', background: accentColor, cursor: 'pointer', border: 'none' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
