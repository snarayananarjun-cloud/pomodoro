import { useCallback, useState } from 'react';
import type { Screen } from './types';
import { useAccentColor } from './hooks/useAccentColor';
import { useSessionHistory } from './hooks/useSessionHistory';
import { useTimer } from './hooks/useTimer';
import { useAmbient } from './hooks/useAmbient';
import { useAuth } from './hooks/useAuth';
import { dayModalTitle } from './lib/date';
import { TimerScreen } from './components/TimerScreen';
import { StatsScreen } from './components/StatsScreen';
import { SessionCompleteModal } from './components/SessionCompleteModal';
import { DayDetailModal } from './components/DayDetailModal';
import { SignInScreen } from './components/SignInScreen';

function App() {
  const [screen, setScreen] = useState<Screen>('timer');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const accent = useAccentColor(userId);
  const history = useSessionHistory(userId);
  const ambient = useAmbient();
  const timer = useTimer({ onLogSession: history.addSession });

  const goStats = useCallback(() => setScreen('stats'), []);
  const goTimer = useCallback(() => setScreen('timer'), []);
  const togglePalette = useCallback(() => setPaletteOpen((open) => !open), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const selectPreset = useCallback(
    (color: string) => {
      accent.selectPreset(color);
      setPaletteOpen(false);
    },
    [accent],
  );

  const prevWeek = useCallback(() => setWeekOffset((o) => o + 1), []);
  const nextWeek = useCallback(() => setWeekOffset((o) => Math.max(0, o - 1)), []);
  const prevMonth = useCallback(() => setMonthOffset((o) => o + 1), []);
  const nextMonth = useCallback(() => setMonthOffset((o) => Math.max(0, o - 1)), []);

  const monthData = history.monthDays(monthOffset);
  const closeDayModal = useCallback(() => setSelectedDay(null), []);

  const selectedDaySessions = selectedDay != null ? monthData.days.find((d) => d.day === selectedDay)?.sessions ?? [] : [];

  if (auth.configError) {
    return (
      <div className="app-shell">
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, boxSizing: 'border-box' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#8A7B70', textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Setup needed</div>
            {auth.configError}
          </div>
        </div>
      </div>
    );
  }

  if (auth.loading) {
    return <div className="app-shell" />;
  }

  if (!auth.user) {
    return (
      <div className="app-shell">
        <SignInScreen onSignIn={auth.signInWithEmail} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {screen === 'timer' ? (
        <TimerScreen
          sessionType={timer.sessionType}
          remaining={timer.remaining}
          running={timer.running}
          phase={timer.phase}
          dropdownOpen={timer.dropdownOpen}
          sessionsToday={history.sessionsToday}
          accentColor={accent.accentColor}
          presets={accent.presets}
          hue={accent.hue}
          sat={accent.sat}
          paletteOpen={paletteOpen}
          ambientOn={ambient.ambientOn}
          onToggleRunning={timer.toggleRunning}
          onStopSession={timer.stopSession}
          onToggleDropdown={timer.toggleDropdown}
          onSelectType={timer.selectType}
          onTogglePalette={togglePalette}
          onClosePalette={closePalette}
          onSelectPreset={selectPreset}
          onWheelChange={accent.setFromWheel}
          onToggleAmbient={ambient.toggleAmbient}
          onGoStats={goStats}
        />
      ) : (
        <StatsScreen
          sessionsToday={history.sessionsToday}
          totalAllTime={history.totalAllTime}
          accentColor={accent.accentColor}
          weekOffset={weekOffset}
          weekDays={history.weekCounts(weekOffset)}
          monthOffset={monthOffset}
          monthYear={monthData.year}
          monthMonth={monthData.month}
          monthDays={monthData.days}
          onGoTimer={goTimer}
          onPrevWeek={prevWeek}
          onNextWeek={nextWeek}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onDayClick={setSelectedDay}
          onSignOut={auth.signOut}
        />
      )}

      {timer.sessionModalOpen && (
        <SessionCompleteModal
          accentColor={accent.accentColor}
          noteInput={timer.noteInput}
          onNoteChange={timer.onNoteChange}
          onSave={timer.saveSession}
          onSkip={timer.skipSession}
        />
      )}

      {selectedDay != null && (
        <DayDetailModal
          title={dayModalTitle(monthData.year, monthData.month, selectedDay)}
          sessions={selectedDaySessions}
          accentColor={accent.accentColor}
          onClose={closeDayModal}
        />
      )}
    </div>
  );
}

export default App;
