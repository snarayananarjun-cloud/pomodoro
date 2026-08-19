import { useCallback, useState } from 'react';
import type { Screen } from './types';
import { useAccentColor } from './hooks/useAccentColor';
import { useSessionHistory } from './hooks/useSessionHistory';
import { useTimer } from './hooks/useTimer';
import { useAmbient } from './hooks/useAmbient';
import { dayModalTitle } from './lib/date';
import { TimerScreen } from './components/TimerScreen';
import { StatsScreen } from './components/StatsScreen';
import { SessionCompleteModal } from './components/SessionCompleteModal';
import { DayDetailModal } from './components/DayDetailModal';

function App() {
  const [screen, setScreen] = useState<Screen>('timer');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const accent = useAccentColor();
  const history = useSessionHistory();
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
