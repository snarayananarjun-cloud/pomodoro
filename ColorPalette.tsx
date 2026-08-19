import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Palette } from '@phosphor-icons/react';

interface Props {
  accentColor: string;
  presets: string[];
  hue: number;
  sat: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectPreset: (color: string) => void;
  onWheelChange: (hue: number, sat: number) => void;
}

const WHEEL_SIZE = 130;
const WHEEL_R = WHEEL_SIZE / 2;
const KNOB = 16;

export function ColorPalette({ accentColor, presets, hue, sat, open, onToggle, onClose, onSelectPreset, onWheelChange }: Props) {
  const wheelRef = useRef<HTMLDivElement>(null);

  const updateFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = wheelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const frac = Math.min(1, dist / (rect.width / 2));
      onWheelChange(Math.round(angle), Math.round(frac * 100));
    },
    [onWheelChange],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      updateFromPoint(e.clientX, e.clientY);
    },
    [updateFromPoint],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      updateFromPoint(e.clientX, e.clientY);
    },
    [updateFromPoint],
  );

  const knobLeft = WHEEL_R + (sat / 100) * (WHEEL_R - 1) * Math.sin((hue * Math.PI) / 180) - KNOB / 2;
  const knobTop = WHEEL_R - (sat / 100) * (WHEEL_R - 1) * Math.cos((hue * Math.PI) / 180) - KNOB / 2;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-label="Choose accent color"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#EFE4D8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          border: 'none',
        }}
      >
        <Palette size={17} color={accentColor} />
      </button>
      {open && (
        <>
          <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
          <div
            style={{
              position: 'absolute',
              top: 44,
              right: 0,
              background: '#FFFFFF',
              borderRadius: 18,
              boxShadow: '0 16px 32px rgba(0,0,0,0.16)',
              padding: 16,
              zIndex: 10,
              width: 180,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#8A7B70', marginBottom: 10 }}>
              Presets
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 14 }}>
              {presets.map((color) => (
                <div
                  key={color}
                  onClick={() => onSelectPreset(color)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: color,
                    cursor: 'pointer',
                    boxShadow: color === accentColor ? `0 0 0 3px #FBF3EC, 0 0 0 5px ${color}` : 'none',
                  }}
                />
              ))}
            </div>
            <div style={{ height: 1, background: '#EFE4D8', marginBottom: 12 }} />
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#8A7B70', marginBottom: 10 }}>
              Custom
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                ref={wheelRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                style={{
                  position: 'relative',
                  width: WHEEL_SIZE,
                  height: WHEEL_SIZE,
                  borderRadius: '50%',
                  cursor: 'crosshair',
                  background:
                    'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0) 68%), conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                  touchAction: 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: knobLeft,
                    top: knobTop,
                    width: KNOB,
                    height: KNOB,
                    borderRadius: '50%',
                    background: accentColor,
                    border: '2.5px solid #FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
