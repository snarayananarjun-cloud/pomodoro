import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { ChartBar, Pause, Play, X } from '@phosphor-icons/react';
import type { SessionType, TimerPhase } from '../types';
import { DURATIONS, SESSION_GOAL } from '../hooks/useTimer';
import { SessionTypeDropdown } from './SessionTypeDropdown';
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

/** LIVE dot + label, in whichever tone is legible against what's currently behind it. */
function LiveBadgeTone({ tone }: { tone: 'dark' | 'cream' }) {
  const color = tone === 'cream' ? '#FBF3EC' : '#1A1A1A';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: 'pulse-dot 1.4s ease-in-out infinite' }} />
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color }}>LIVE</div>
    </div>
  );
}

/** The countdown digits + subtitle, in whichever tone is legible against what's currently behind it. */
function CountdownTone({
  tone,
  mm,
  ss,
  running,
  sessionsToday,
  innerRef,
}: {
  tone: 'dark' | 'cream';
  mm: string;
  ss: string;
  running: boolean;
  sessionsToday: number;
  innerRef?: Ref<HTMLDivElement>;
}) {
  const digitColor = tone === 'cream' ? '#FBF3EC' : '#1A1A1A';
  const runningSubtitleColor = tone === 'cream' ? 'rgba(251,243,236,0.75)' : '#8A7B70';
  return (
    <div ref={innerRef} style={{ textAlign: 'center' }}>
      <div
        key={`${mm}${ss}`}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(64px, 22vw, 104px)',
          letterSpacing: '-3px',
          lineHeight: 1,
          color: digitColor,
          animation: 'digit-bounce 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {mm}:{ss}
      </div>
      <div style={{ height: 20, marginTop: 6 }}>
        {running ? (
          <div style={{ fontSize: 13, fontWeight: 600, color: runningSubtitleColor }}>Focus mode on</div>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8C8079' }}>
            session {sessionsToday} of {SESSION_GOAL} today
          </div>
        )}
      </div>
    </div>
  );
}

interface HeaderRowProps {
  running: boolean;
  tone: 'dark' | 'cream';
  sessionType: SessionType;
  accentColor: string;
  dropdownOpen?: boolean;
  onToggleDropdown?: () => void;
  onSelectType?: (type: SessionType) => void;
  presets?: string[];
  hue?: number;
  sat?: number;
  paletteOpen?: boolean;
  onTogglePalette?: () => void;
  onClosePalette?: () => void;
  onSelectPreset?: (color: string) => void;
  onWheelChange?: (hue: number, sat: number) => void;
  onStopSession?: () => void;
}

/**
 * The idle branch (dropdown + palette) is only ever rendered in the interactive
 * "dark" base layer — it's never covered by the accent fill (which starts at the
 * play button and only exists while running), so it never needs a cream twin.
 * The running branch (LIVE badge + cancel) renders in both tones: interactive in
 * the base layer, inert in the cream overlay.
 */
function HeaderRow({
  running,
  tone,
  sessionType,
  accentColor,
  dropdownOpen,
  onToggleDropdown,
  onSelectType,
  presets,
  hue,
  sat,
  paletteOpen,
  onTogglePalette,
  onClosePalette,
  onSelectPreset,
  onWheelChange,
  onStopSession,
}: HeaderRowProps) {
  let left: ReactNode = null;
  let right: ReactNode = null;

  if (running) {
    left = <LiveBadgeTone tone={tone} />;
    right =
      tone === 'dark' ? (
        <button
          type="button"
          onClick={onStopSession}
          aria-label="Cancel session"
          style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          <X size={20} color="#1A1A1A" />
        </button>
      ) : (
        <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} color="#FBF3EC" />
        </div>
      );
  } else if (tone === 'dark') {
    left = (
      <SessionTypeDropdown
        sessionType={sessionType}
        accentColor={accentColor}
        open={!!dropdownOpen}
        onToggle={onToggleDropdown!}
        onSelect={onSelectType!}
      />
    );
    right = (
      <ColorPalette
        accentColor={accentColor}
        presets={presets!}
        hue={hue!}
        sat={sat!}
        open={!!paletteOpen}
        onToggle={onTogglePalette!}
        onClose={onClosePalette!}
        onSelectPreset={onSelectPreset!}
        onWheelChange={onWheelChange!}
      />
    );
  }

  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 24px 0' }}>{left}{right}</div>;
}

interface PlayAndAmbientProps {
  running: boolean;
  accentColor: string;
  ambientOn: boolean;
  onToggleRunning: () => void;
  onToggleAmbient: () => void;
  buttonRef?: Ref<HTMLDivElement>;
  /** false for the cream overlay's copy — same footprint, nothing painted or clickable. */
  interactive: boolean;
}

/**
 * Rendered once in the interactive base layer and once (invisibly) in the cream
 * overlay, purely so the overlay's flex column has an identically-sized block in
 * this slot — the play icon is already always-white and always inside the fill
 * circle, and the ambient pill sits on its own opaque card, so neither actually
 * needs a cream twin, only the space it occupies.
 */
function PlayAndAmbient({ running, accentColor, ambientOn, onToggleRunning, onToggleAmbient, buttonRef, interactive }: PlayAndAmbientProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        paddingBottom: 56,
        visibility: interactive ? 'visible' : 'hidden',
      }}
    >
      <div
        ref={interactive ? buttonRef : undefined}
        onClick={interactive ? onToggleRunning : undefined}
        role={interactive ? 'button' : undefined}
        aria-label={interactive ? (running ? 'Pause session' : 'Start session') : undefined}
        style={{
          width: BTN_SIZE,
          height: BTN_SIZE,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: interactive ? 'pointer' : 'default',
        }}
      >
        {running ? <Pause weight="fill" size={22} color="#FFFFFF" /> : <Play weight="fill" size={22} color="#FFFFFF" />}
      </div>
      <AmbientPill accentColor={accentColor} ambientOn={ambientOn} onToggle={interactive ? onToggleAmbient : () => {}} />
    </div>
  );
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
  const clipPath = `circle(${radius}px at ${anchor.x}px ${anchor.y}px)`;

  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(remaining % 60)
    .toString()
    .padStart(2, '0');

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: accentColor, clipPath, transition: clipTransition, zIndex: 0 }} />

      {/* Always-dark base layer. Legible against the cream background wherever the
          accent fill above hasn't (or no longer) reaches. */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <HeaderRow
          running={running}
          tone="dark"
          sessionType={sessionType}
          accentColor={accentColor}
          dropdownOpen={dropdownOpen}
          onToggleDropdown={onToggleDropdown}
          onSelectType={onSelectType}
          presets={presets}
          hue={hue}
          sat={sat}
          paletteOpen={paletteOpen}
          onTogglePalette={onTogglePalette}
          onClosePalette={onClosePalette}
          onSelectPreset={onSelectPreset}
          onWheelChange={onWheelChange}
          onStopSession={onStopSession}
        />
        <div style={{ flex: 1.4 }} />
        <CountdownTone tone="dark" mm={mm} ss={ss} running={running} sessionsToday={sessionsToday} innerRef={countdownRef} />
        <div style={{ flex: 1 }} />
        <PlayAndAmbient
          running={running}
          accentColor={accentColor}
          ambientOn={ambientOn}
          onToggleRunning={onToggleRunning}
          onToggleAmbient={onToggleAmbient}
          buttonRef={buttonRef}
          interactive
        />
        <div style={{ flex: 0.8 }} />
      </div>

      {/* Cream overlay: the exact same column skeleton as the base layer above
          (so header/countdown land at pixel-identical positions), clipped to the
          same circle as the fill layer. Wherever the accent fill actually covers,
          this cream copy (legible on that fill) is what shows; everywhere else
          it's clipped away and the dark copy underneath shows through instead. */}
      {running && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, clipPath, transition: clipTransition, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>
          <HeaderRow running={running} tone="cream" sessionType={sessionType} accentColor={accentColor} />
          <div style={{ flex: 1.4 }} />
          <CountdownTone tone="cream" mm={mm} ss={ss} running={running} sessionsToday={sessionsToday} />
          <div style={{ flex: 1 }} />
          <PlayAndAmbient
            running={running}
            accentColor={accentColor}
            ambientOn={ambientOn}
            onToggleRunning={onToggleRunning}
            onToggleAmbient={onToggleAmbient}
            interactive={false}
          />
          <div style={{ flex: 0.8 }} />
        </div>
      )}

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
