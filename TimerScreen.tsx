import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChartBar, Pause, Play, X } from '@phosphor-icons/react';
import type { SessionType, TimerPhase } from '../types';
import { DURATIONS, SESSION_GOAL } from '../hooks/useTimer';
import { SessionTypeDropdown } from './SessionTypeDropdown';
import { LiveBadge } from './LiveBadge';
import { ColorPalette } from './ColorPalette';
import { AmbientPill } from './AmbientPill';

const SMALL_R = 46;
const BTN_SIZE = 92;

interface Anchor {
  x: number;
  y: number;
  maxR: number;
}

function useRadialAnchor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<Anchor>({ x: 0, y: 0, maxR: 0 });

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const button = buttonRef.current;
      if (!container || !button) return;
      const cRect = container.getBoundingClientRect();
      const bRect = button.getBoundingClientRect();
      const x = bRect.left + bRect.width / 2 - cRect.left;
      const y = bRect.top + bRect.height / 2 - cRect.top;
      const maxR = Math.hypot(Math.max(x, cRect.width - x), Math.max(y, cRect.height - y));
      setAnchor({ x, y, maxR });
    }
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);

    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    if (countdownRef.current) observer.observe(countdownRef.current);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, []);

  return { containerRef, buttonRef, countdownRef, anchor };
}

interface Props {
  sessionType: SessionType;
  remaining: number;
  running: boolean;
  phase: TimerPhase;
  dropdownOpen: boolean;
  sessionsToday: number;
  accentColor: string;
  presets: string[];
  hue: number;
  sat: number;
  paletteOpen: boolean;
  ambientOn: boolean;
  onToggleRunning: () => void;
  onStopSession: () => void;
  onToggleDropdown: () => void;
  onSelectType: (type: SessionType) => void;
  onTogglePalette: () => void;
  onClosePalette: () => void;
  onSelectPreset: (color: string) => void;
  onWheelChange: (hue: number, sat: number) => void;
  onToggleAmbient: () => void;
  onGoStats: () => void;
}

export function TimerScreen(props: Props) {
  const {
    sessionType,
    remaining,
    running,
    phase,
    dropdownOpen,
    sessionsToday,
    accentColor,
    presets,
    hue,
    sat,
    paletteOpen,
    ambientOn,
    onToggleRunning,
    onStopSession,
    onToggleDropdown,
    onSelectType,
    onTogglePalette,
    onClosePalette,
    onSelectPreset,
    onWheelChange,
    onToggleAmbient,
    onGoStats,
  } = props;

  const { containerRef, buttonRef, countdownRef, anchor } = useRadialAnchor();

  const measured = anchor.maxR > 0;
  // Skip the CSS transition for the one render where we snap from "unmeasured"
  // to the real anchor — otherwise the browser animates clip-path from the
  // placeholder (0,0) position to the button's real position.
  const settledRef = useRef(false);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (measured && !settledRef.current) {
      settledRef.current = true;
      const id = requestAnimationFrame(() => setSettled(true));
      return () => cancelAnimationFrame(id);
    }
  }, [measured]);

  const total = DURATIONS[sessionType];
  const fraction = total > 0 ? remaining / total : 0;
  const radius = !measured ? 0 : running ? SMALL_R + (anchor.maxR - SMALL_R) * fraction : SMALL_R;
  const clipTransition = !settled ? 'none' : phase === 'expanding' ? 'clip-path 0.4s cubic-bezier(0.22,1,0.36,1)' : 'clip-path 0.95s linear';
  const textColor = running ? '#FBF3EC' : '#1A1A1A';

  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(remaining % 60)
    .toString()
    .padStart(2, '0');

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: accentColor,
          clipPath: `circle(${radius}px at ${anchor.x}px ${anchor.y}px)`,
          transition: clipTransition,
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 24px 0' }}>
          {!running && (
            <SessionTypeDropdown
              sessionType={sessionType}
              accentColor={accentColor}
              open={dropdownOpen}
              onToggle={onToggleDropdown}
              onSelect={onSelectType}
            />
          )}
          {running && <LiveBadge />}
          {!running && (
            <ColorPalette
              accentColor={accentColor}
              presets={presets}
              hue={hue}
              sat={sat}
              open={paletteOpen}
              onToggle={onTogglePalette}
              onClose={onClosePalette}
              onSelectPreset={onSelectPreset}
              onWheelChange={onWheelChange}
            />
          )}
          {running && (
            <button
              type="button"
              onClick={onStopSession}
              aria-label="Cancel session"
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
            >
              <X size={20} color="#FBF3EC" />
            </button>
          )}
        </div>

        <div style={{ flex: 1.4 }} />

        <div ref={countdownRef} style={{ textAlign: 'center' }}>
          <div
            key={`${mm}${ss}`}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(64px, 22vw, 104px)',
              letterSpacing: '-3px',
              lineHeight: 1,
              color: textColor,
              animation: 'digit-slide 0.35s ease',
            }}
          >
            {mm}:{ss}
          </div>
          <div style={{ height: 20, marginTop: 6 }}>
            {running ? (
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(251,243,236,0.75)' }}>Focus mode on</div>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8C8079' }}>
                session {sessionsToday} of {SESSION_GOAL} today
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingBottom: 56 }}>
          <div
            ref={buttonRef}
            onClick={onToggleRunning}
            role="button"
            aria-label={running ? 'Pause session' : 'Start session'}
            style={{
              width: BTN_SIZE,
              height: BTN_SIZE,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {running ? <Pause weight="fill" size={22} color="#FFFFFF" /> : <Play weight="fill" size={22} color="#FFFFFF" />}
          </div>

          <AmbientPill accentColor={accentColor} ambientOn={ambientOn} onToggle={onToggleAmbient} />
        </div>

        <div style={{ flex: 0.8 }} />
      </div>

      {!running && (
        <button
          type="button"
          onClick={onGoStats}
          aria-label="View focus stats"
          style={{
            position: 'absolute',
            right: 24,
            bottom: 26,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#EFE4D8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            zIndex: 1,
          }}
        >
          <ChartBar size={20} color={accentColor} />
        </button>
      )}
    </div>
  );
}
