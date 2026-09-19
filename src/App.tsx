import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import logoUrl from "./logo.png";
import { generateRandomWords } from "@/data/words";
import { LiveStats } from "@/components/LiveStats";
import { TitleBar } from "@/components/TitleBar";
import { TypingPane } from "@/components/TypingPane";
import { HomeTargetBar } from "@/components/HomeTargetBar";
import { TargetDialog } from "@/components/TargetDialog";
import { useTypingTest } from "@/lib/useTypingTest";
import { useSettings } from "@/lib/SettingsContext";
import { appendHistory, targetSummaryLine } from "@/lib/progress";
import {
  CUSTOM_TEXT_MAX,
  clampCustomSeconds,
  normalizeCustomText,
  resolveTimerMs,
  type ModeId,
  type TestResult,
  type TimerPreset,
} from "@/lib/types";

const SettingsPanel = lazy(() =>
  import("@/components/SettingsPanel").then((m) => ({ default: m.SettingsPanel })),
);
const ResultsScreen = lazy(() =>
  import("@/components/ResultsScreen").then((m) => ({ default: m.ResultsScreen })),
);
const ProgressPanel = lazy(() =>
  import("@/components/ProgressPanel").then((m) => ({ default: m.ProgressPanel })),
);

type Screen = "home" | "test" | "results";

const MODES: ModeId[] = ["words", "movies", "custom"];
const TIMERS: TimerPreset[] = [15, 30, 60, 120, "custom", "none"];

const MODE_COPY: Record<ModeId, { title: string; blurb: string }> = {
  words: {
    title: "Words",
    blurb: "Everyday words, no repeats",
  },
  movies: {
    title: "Movies",
    blurb: "Short lines & full scenes",
  },
  custom: {
    title: "Custom",
    blurb: "Paste your own text",
  },
};

function timerLabel(p: TimerPreset): string {
  if (p === "none") return "No timer";
  if (p === "custom") return "Custom";
  return `${p}s`;
}

export default function App() {
  const { settings } = useSettings();
  const [screen, setScreen] = useState<Screen>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [mode, setMode] = useState<ModeId>("words");
  const [timerPreset, setTimerPreset] = useState<TimerPreset>(30);
  const [customSeconds, setCustomSeconds] = useState(45);
  const [customText, setCustomText] = useState("");
  const [target, setTarget] = useState("");
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [focusZone, setFocusZone] = useState<"mode" | "timer">("mode");
  const startRef = useRef<HTMLButtonElement>(null);

  const timerMs = resolveTimerMs(timerPreset, customSeconds);
  const customReady = customText.trim().length > 0;
  const goMainMenu = useCallback(() => {
    setScreen("home");
    setResult(null);
  }, []);

  const buildTarget = useCallback(async (nextMode: ModeId) => {
    if (nextMode === "words") return generateRandomWords(70);
    if (nextMode === "movies") {
      const { pickMovieScript } = await import("@/data/movies");
      return pickMovieScript();
    }
    return normalizeCustomText(customText);
  }, [customText]);

  const startTest = useCallback(async () => {
    if (mode === "custom" && !customReady) return;
    const next = await buildTarget(mode);
    if (!next) return;
    setTarget(next);
    setResult(null);
    setRunId((n) => n + 1);
    setScreen("test");
  }, [mode, customReady, buildTarget]);

  const onComplete = useCallback((r: TestResult) => {
    appendHistory(r);
    setResult(r);
    setScreen("results");
  }, []);

  const typing = useTypingTest({
    target,
    timerMs,
    active: screen === "test",
    inputEnabled: !settingsOpen && !progressOpen && !targetOpen,
    runId,
    mode,
    onComplete,
  });

  const liveTargetLine = useMemo(
    () =>
      screen === "test" && typing.startedAt
        ? targetSummaryLine(
            typing.wpm,
            typing.accuracy,
            settings.targetWpm,
            settings.targetAccuracy,
          )
        : null,
    [
      screen,
      typing.startedAt,
      typing.wpm,
      typing.accuracy,
      settings.targetWpm,
      settings.targetAccuracy,
    ],
  );

  // Esc closes overlays first; on test before first keystroke → home; else typing hook ends the run.
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (settingsOpen) {
        e.preventDefault();
        e.stopPropagation();
        setSettingsOpen(false);
        return;
      }
      if (targetOpen) {
        e.preventDefault();
        e.stopPropagation();
        setTargetOpen(false);
        return;
      }
      if (progressOpen) {
        e.preventDefault();
        e.stopPropagation();
        setProgressOpen(false);
        return;
      }
      // Match copy: Esc always leaves the test screen (results if started, home if not).
      if (screen === "test" && !typing.startedAt) {
        e.preventDefault();
        e.stopPropagation();
        goMainMenu();
      }
    };
    window.addEventListener("keydown", onEsc, true);
    return () => window.removeEventListener("keydown", onEsc, true);
  }, [settingsOpen, progressOpen, targetOpen, screen, typing.startedAt, goMainMenu]);

  const restart = async () => {
    const next = await buildTarget(mode);
    if (!next) {
      goMainMenu();
      return;
    }
    setTarget(next);
    setResult(null);
    setRunId((n) => n + 1);
    setScreen("test");
  };

  const tip = useMemo(() => {
    if (timerPreset === "none") return "stops a free run anytime.";
    return "always ends the run.";
  }, [timerPreset]);

  useEffect(() => {
    if (screen !== "home" || settingsOpen || progressOpen || targetOpen) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          startTest();
        }
        return;
      }

      if (e.key === "Tab") {
        if (!e.shiftKey && focusZone === "mode") {
          e.preventDefault();
          setFocusZone("timer");
        } else if (e.shiftKey && focusZone === "timer") {
          e.preventDefault();
          setFocusZone("mode");
        }
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        if (focusZone === "mode") {
          const i = MODES.indexOf(mode);
          setMode(MODES[(i + dir + MODES.length) % MODES.length]!);
        } else {
          const i = TIMERS.indexOf(timerPreset);
          setTimerPreset(TIMERS[(i + dir + TIMERS.length) % TIMERS.length]!);
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusZone("mode");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusZone("timer");
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        startTest();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, settingsOpen, progressOpen, targetOpen, focusZone, mode, timerPreset, startTest]);

  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden />
      <TitleBar />

      <div className="app-body">
        {screen === "home" ? (
          <main className="home screen-enter" key="home">
            <header className="hero">
              <img src={logoUrl} alt="bangtyper." className="hero-logo" />
              <p className="tagline">A focused typing desk. Pick a mode and start.</p>
              <HomeTargetBar
                onOpenTarget={() => setTargetOpen(true)}
                onOpenProgress={() => setProgressOpen(true)}
              />
            </header>

            <section className="desk">
              <div className={`desk-section ${focusZone === "mode" ? "focused" : ""}`}>
                <div className="desk-label">
                  <span className="desk-title">Choose a mode</span>
                  <span className="desk-hint">← → keys</span>
                </div>
                <div className="mode-seg" role="listbox" aria-label="Mode">
                  {MODES.map((id, i) => (
                    <button
                      key={id}
                      type="button"
                      role="option"
                      aria-selected={mode === id}
                      className={mode === id ? "mode-seg-item active" : "mode-seg-item"}
                      onClick={() => {
                        setMode(id);
                        setFocusZone("mode");
                      }}
                    >
                      <span className="mode-key">{String(i + 1).padStart(2, "0")}</span>
                      <span className="mode-name">{MODE_COPY[id].title}</span>
                      <span className="mode-blurb">{MODE_COPY[id].blurb}</span>
                    </button>
                  ))}
                </div>
              </div>

              {mode === "custom" ? (
                <div className="custom-box content-fade">
                  <label htmlFor="custom-text">Your text</label>
                  <textarea
                    id="custom-text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.slice(0, CUSTOM_TEXT_MAX))}
                    placeholder="Paste or type the passage to practice…"
                    rows={4}
                    maxLength={CUSTOM_TEXT_MAX}
                  />
                  {!customReady ? (
                    <p className="empty-state">Add text to enable Start.</p>
                  ) : (
                    <p className="empty-state ready">
                      Ready. Press Enter to begin.
                      {customText.length >= CUSTOM_TEXT_MAX
                        ? ` (${CUSTOM_TEXT_MAX} char limit)`
                        : ""}
                    </p>
                  )}
                </div>
              ) : null}

              <div className={`desk-section ${focusZone === "timer" ? "focused" : ""}`}>
                <div className="desk-label">
                  <span className="desk-title">How long</span>
                  <span className="desk-hint">← → and Tab</span>
                </div>
                <div className="duration-track" role="listbox" aria-label="Timer">
                  {TIMERS.map((p) => (
                    <button
                      key={String(p)}
                      type="button"
                      role="option"
                      aria-selected={timerPreset === p}
                      className={timerPreset === p ? "duration-chip active" : "duration-chip"}
                      onClick={() => {
                        setTimerPreset(p);
                        setFocusZone("timer");
                      }}
                    >
                      {timerLabel(p)}
                    </button>
                  ))}
                </div>
                {timerPreset === "custom" ? (
                  <label className="custom-seconds content-fade">
                    Seconds
                    <input
                      type="number"
                      min={5}
                      max={900}
                      value={customSeconds}
                      onChange={(e) =>
                        setCustomSeconds(clampCustomSeconds(Number(e.target.value) || 5))
                      }
                    />
                  </label>
                ) : null}
                <p className="hint">
                  <kbd>Esc</kbd> {tip} <kbd>Enter</kbd> starts the run.
                </p>
              </div>

              <div className="cta-row">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setSettingsOpen(true)}
                >
                  Settings
                </button>
                <button
                  ref={startRef}
                  type="button"
                  className="btn primary xl"
                  onClick={startTest}
                  disabled={mode === "custom" && !customReady}
                >
                  Start typing
                </button>
              </div>
            </section>
          </main>
        ) : null}

        {screen === "test" ? (
          <main className="test-screen screen-enter" key={`test-${runId}`}>
            <header className="test-top">
              <LiveStats
                wpm={typing.wpm}
                accuracy={typing.accuracy}
                remainingMs={typing.remainingMs}
                elapsedMs={typing.elapsedMs}
                timerEnabled={timerMs != null}
                errors={typing.errors}
              />
              <div className="test-actions">
                <button type="button" className="btn menu-btn" onClick={goMainMenu}>
                  Main menu
                </button>
                <button type="button" className="btn ghost" onClick={() => setSettingsOpen(true)}>
                  Settings
                </button>
                <button type="button" className="btn ghost" onClick={restart}>
                  Restart
                </button>
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => {
                    if (typing.startedAt) typing.finish("escape");
                    else goMainMenu();
                  }}
                  title="Also available via Escape"
                >
                  Stop (Esc)
                </button>
              </div>
            </header>

            <TypingPane
              target={target}
              typed={typing.typed}
              active={
                screen === "test" && !settingsOpen && !progressOpen && !targetOpen
              }
              onType={typing.handleType}
              onBackspace={typing.handleBackspace}
            />

            <footer className="test-foot">
              <p>
                {MODE_COPY[mode].title}
                {timerMs == null ? ", free run" : `, ${Math.round(timerMs / 1000)}s`}
                {liveTargetLine ? `, ${liveTargetLine}` : ""}
              </p>
              <p className="muted">
                Type to begin. <kbd>Esc</kbd> ends. Main menu returns home.
              </p>
            </footer>
          </main>
        ) : null}

        {screen === "results" && result ? (
          <Suspense fallback={null}>
            <ResultsScreen
              result={result}
              onRestart={restart}
              onHome={goMainMenu}
              onSettings={() => setSettingsOpen(true)}
            />
          </Suspense>
        ) : null}
      </div>

      {settingsOpen ? (
        <Suspense fallback={null}>
          <SettingsPanel onClose={() => setSettingsOpen(false)} />
        </Suspense>
      ) : null}

      {progressOpen ? (
        <Suspense fallback={null}>
          <ProgressPanel
            onClose={() => setProgressOpen(false)}
            draftCustomText={customText}
            onEditTarget={() => {
              setProgressOpen(false);
              setTargetOpen(true);
            }}
            onUseSavedText={(body) => {
              setCustomText(normalizeCustomText(body));
              setMode("custom");
              setScreen("home");
            }}
            onOpenRun={(r) => {
              setResult(r);
              setProgressOpen(false);
              setScreen("results");
            }}
          />
        </Suspense>
      ) : null}

      {targetOpen ? <TargetDialog onClose={() => setTargetOpen(false)} /> : null}
    </div>
  );
}
