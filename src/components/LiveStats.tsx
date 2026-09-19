import { memo } from "react";

interface LiveStatsProps {
  wpm: number;
  accuracy: number;
  remainingMs: number | null;
  elapsedMs: number;
  timerEnabled: boolean;
  errors: number;
}

function formatMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const LiveStats = memo(function LiveStats({
  wpm,
  accuracy,
  remainingMs,
  elapsedMs,
  timerEnabled,
  errors,
}: LiveStatsProps) {
  return (
    <div className="live-stats" role="status">
      <div className="stat">
        <span className="stat-label">WPM</span>
        <span className="stat-value gold">{Math.round(wpm)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Accuracy</span>
        <span className="stat-value">{Math.round(accuracy)}%</span>
      </div>
      <div className="stat">
        <span className="stat-label">{timerEnabled ? "Time left" : "Elapsed"}</span>
        <span className="stat-value mono">
          {timerEnabled && remainingMs != null ? formatMs(remainingMs) : formatMs(elapsedMs)}
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">Errors</span>
        <span className="stat-value">{errors}</span>
      </div>
    </div>
  );
});
