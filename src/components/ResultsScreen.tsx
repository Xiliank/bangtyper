import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Cell,
} from "recharts";
import { useMemo, useEffect, useRef } from "react";
import type { TestResult } from "@/lib/types";
import { useSettings } from "@/lib/SettingsContext";
import { accentHex, loadBestWpm, saveBestWpm } from "@/lib/settings";
import { burstConfetti } from "@/lib/confetti";
import { compareWpm, targetSummaryLine } from "@/lib/progress";

interface ResultsScreenProps {
  result: TestResult;
  onRestart: () => void;
  onHome: () => void;
  onSettings?: () => void;
}

function fmtSec(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function ResultsScreen({ result, onRestart, onHome, onSettings }: ResultsScreenProps) {
  const { settings } = useSettings();
  const isLight = settings.theme === "light";
  const accent = accentHex(settings.accent);
  const celebrated = useRef(false);

  useEffect(() => {
    if (celebrated.current) return;
    celebrated.current = true;
    const score = Math.round(result.wpm);
    const prev = loadBestWpm();
    if (score > prev) {
      saveBestWpm(score);
      if (settings.confettiOnBest && !settings.reduceEffects && score > 0) burstConfetti();
    }
  }, [result.wpm, settings.confettiOnBest, settings.reduceEffects]);

  const animateCharts = !settings.reduceEffects;

  const chart = useMemo(() => {
    const muted = cssVar("--muted", isLight ? "#5c6370" : "#8b929c");
    const line = cssVar("--line", isLight ? "#c5cad3" : "#2a3038");
    const panel = cssVar("--bg-panel", isLight ? "#f7f8fa" : "#12151a");
    const text = cssVar("--text", isLight ? "#12151a" : "#e6e8ec");
    const danger = cssVar("--danger", "#e85a5a");
    return {
      muted,
      line,
      panel,
      text,
      danger,
      grid: isLight ? "#d5dae3" : "#1c222b",
      emptyBar: isLight ? "#e2e6ec" : "#1a1e26",
      areaFill: isLight ? `${accent}2e` : "#16120a",
      accent,
    };
  }, [settings.theme, settings.accent, accent, isLight]);

  const timeline = result.timeline.length
    ? result.timeline
    : [
        {
          t: result.durationMs,
          wpm: result.wpm,
          rawWpm: result.rawWpm,
          accuracy: result.accuracy,
          errors: result.errors,
          chars: result.totalTyped,
        },
      ];

  const chartData = timeline.map((p) => ({
    sec: Number((p.t / 1000).toFixed(1)),
    wpm: Math.round(p.wpm * 10) / 10,
    rawWpm: Math.round(p.rawWpm * 10) / 10,
    accuracy: Math.round(p.accuracy * 10) / 10,
    errors: p.errors,
  }));

  const mistakeBuckets = new Map<number, number>();
  for (const m of result.errorMarkers) {
    const bucket = Math.floor(m.t / 1000);
    mistakeBuckets.set(bucket, (mistakeBuckets.get(bucket) ?? 0) + 1);
  }
  const maxSec = Math.max(1, Math.ceil(result.durationMs / 1000));
  const mistakeData = Array.from({ length: maxSec + 1 }, (_, sec) => ({
    sec,
    mistakes: mistakeBuckets.get(sec) ?? 0,
  }));

  const targetLine = targetSummaryLine(
    result.wpm,
    result.accuracy,
    settings.targetWpm,
    settings.targetAccuracy,
  );
  const wpmVs = compareWpm(result.wpm, settings.targetWpm);

  const endedLabel =
    result.endedBy === "timer"
      ? "Timer expired"
      : result.endedBy === "escape"
        ? "Stopped with Escape"
        : "Text completed";

  const tooltipStyle = {
    background: chart.panel,
    border: `1px solid ${chart.line}`,
    borderRadius: 4,
    color: chart.text,
  };

  return (
    <section className="results panel-enter">
      <header className="results-header">
        <div>
          <p className="eyebrow">Run complete</p>
          <h2>Results</h2>
          <p className="muted">{endedLabel}</p>
          {targetLine ? (
            <p
              className={`target-result target-${wpmVs.status === "unset" ? "met" : wpmVs.status}`}
            >
              {targetLine}
            </p>
          ) : null}
        </div>
        <div className="results-actions">
          <button type="button" className="btn menu-btn" onClick={onHome}>
            Main menu
          </button>
          {onSettings ? (
            <button type="button" className="btn ghost" onClick={onSettings}>
              Settings
            </button>
          ) : null}
          <button type="button" className="btn primary" onClick={onRestart}>
            Restart
          </button>
        </div>
      </header>

      <div className="summary-grid">
        <div className="summary-card">
          <span>WPM</span>
          <strong>{Math.round(result.wpm)}</strong>
        </div>
        <div className="summary-card">
          <span>Raw WPM</span>
          <strong>{Math.round(result.rawWpm)}</strong>
        </div>
        <div className="summary-card">
          <span>Accuracy</span>
          <strong>{result.accuracy.toFixed(1)}%</strong>
        </div>
        <div className="summary-card">
          <span>Time</span>
          <strong>{fmtSec(result.durationMs)}</strong>
        </div>
        <div className="summary-card">
          <span>Errors</span>
          <strong>{result.errors}</strong>
        </div>
        <div className="summary-card highlight">
          <span>Peak WPM</span>
          <strong>
            {Math.round(result.peakWpm)}
            <small> @ {fmtSec(result.peakAtMs)}</small>
          </strong>
        </div>
      </div>

      <div className="charts-grid">
        <article className="chart-card">
          <h3>WPM over time</h3>
          <p className="chart-note">Accent line is corrected WPM, dotted is raw, marker is peak</p>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke={chart.grid} />
                <XAxis dataKey="sec" stroke={chart.muted} tickFormatter={(v) => `${v}s`} />
                <YAxis stroke={chart.muted} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  name="WPM"
                  stroke={chart.accent}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={animateCharts}
                  animationDuration={420}
                />
                <Line
                  type="monotone"
                  dataKey="rawWpm"
                  name="Raw WPM"
                  stroke={chart.muted}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={animateCharts}
                  animationDuration={420}
                />
                <ReferenceLine
                  x={Number((result.peakAtMs / 1000).toFixed(1))}
                  stroke={chart.accent}
                  strokeDasharray="3 3"
                  label={{ value: "peak", fill: chart.accent, fontSize: 11 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-card">
          <h3>Accuracy over time</h3>
          <p className="chart-note">Cumulative accuracy as you typed</p>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid stroke={chart.grid} />
                <XAxis dataKey="sec" stroke={chart.muted} tickFormatter={(v) => `${v}s`} />
                <YAxis domain={[0, 100]} stroke={chart.muted} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy %"
                  stroke={chart.accent}
                  fill={chart.areaFill}
                  strokeWidth={2}
                  isAnimationActive={animateCharts}
                  animationDuration={420}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-card wide">
          <h3>Mistake timeline</h3>
          <p className="chart-note">
            Errors per second, {result.errorMarkers.length} total mistake keystrokes
          </p>
          <div className="chart-box tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mistakeData}>
                <CartesianGrid stroke={chart.grid} />
                <XAxis dataKey="sec" stroke={chart.muted} tickFormatter={(v) => `${v}s`} />
                <YAxis allowDecimals={false} stroke={chart.muted} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="mistakes"
                  name="Mistakes"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={animateCharts}
                  animationDuration={360}
                >
                  {mistakeData.map((entry, i) => (
                    <Cell
                      key={`m-${i}`}
                      fill={entry.mistakes > 0 ? chart.danger : chart.emptyBar}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {result.errorMarkers.length > 0 ? (
            <ul className="error-list">
              {result.errorMarkers.slice(0, 12).map((m, i) => (
                <li key={`${m.index}-${i}`}>
                  <span className="mono">@{fmtSec(m.t)}</span>
                  <span>
                    expected <code>{m.expected === " " ? "␣" : m.expected}</code>, typed{" "}
                    <code>{m.typed === " " ? "␣" : m.typed}</code>
                  </span>
                  <span className="muted">char #{m.index + 1}</span>
                </li>
              ))}
              {result.errorMarkers.length > 12 ? (
                <li className="muted">+{result.errorMarkers.length - 12} more…</li>
              ) : null}
            </ul>
          ) : (
            <p className="empty-inline">Clean run. No mistakes recorded.</p>
          )}
        </article>
      </div>
    </section>
  );
}
