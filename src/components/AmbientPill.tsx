import { Waveform } from '@phosphor-icons/react';

interface Props {
  accentColor: string;
  ambientOn: boolean;
  onToggle: () => void;
}

export function AmbientPill({ accentColor, ambientOn, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ambientOn ? 'Turn off ambient focus sound' : 'Turn on ambient focus sound'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#EFE4D8',
        borderRadius: 32,
        padding: '6px 20px 6px 6px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        whiteSpace: 'nowrap',
        border: 'none',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Waveform size={17} color="#FFFFFF" />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
        Ambient focus sound &mdash; {ambientOn ? 'on' : 'off'}
      </div>
    </button>
  );
}
