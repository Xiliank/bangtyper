import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSettings } from "@/lib/SettingsContext";
import { accentHex } from "@/lib/settings";

interface TrendsChartProps {
  data: Array<{ i: number; label: string; wpm: number; accuracy: number }>;
  targetWpm: number | null;
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function TrendsChart({ data, targetWpm }: TrendsChartProps) {
  const { settings } = useSettings();
  const isLight = settings.theme === "light";
  const accent = accentHex(settings.accent);
  const animate = !settings.reduceEffects;

  const colors = useMemo(() => {
    return {
      muted: cssVar("--muted", isLight ? "#5c6370" : "#8b929c"),
      line: cssVar("--line", isLight ? "#c5cad3" : "#2a3038"),
      panel: cssVar("--bg-panel", isLight ? "#f7f8fa" : "#12151a"),
      text: cssVar("--text", isLight ? "#12151a" : "#e6e8ec"),
      grid: isLight ? "#d5dae3" : "#1c222b",
      accent,
    };
  }, [isLight, accent]);

  return (
    <div className="trends-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 4" />
          <XAxis dataKey="label" stroke={colors.muted} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis stroke={colors.muted} tick={{ fontSize: 11 }} width={36} />
          <Tooltip
            contentStyle={{
              background: colors.panel,
              border: `1px solid ${colors.line}`,
              borderRadius: 2,
              color: colors.text,
            }}
          />
          {targetWpm != null ? (
            <ReferenceLine
              y={targetWpm}
              stroke={colors.accent}
              strokeDasharray="4 4"
              label={{ value: "target", fill: colors.accent, fontSize: 10 }}
            />
          ) : null}
          <Line
            type="monotone"
            dataKey="wpm"
            name="WPM"
            stroke={colors.accent}
            strokeWidth={2}
            dot={false}
            isAnimationActive={animate}
            animationDuration={360}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            name="Accuracy %"
            stroke={colors.muted}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={animate}
            animationDuration={360}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
