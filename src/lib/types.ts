export type ModeId = "words" | "movies" | "custom";

export type TimerPreset = 15 | 30 | 60 | 120 | "custom" | "none";

export interface AppSettings {
  mode: ModeId;
  timerPreset: TimerPreset;
  customSeconds: number;
  customText: string;
}

export interface KeySample {
  t: number;
  correct: boolean;
  expected: string;
  typed: string;
  index: number;
}

export interface TimelinePoint {
  t: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  chars: number;
}

export interface TestResult {
  mode: ModeId;
  endedBy: "timer" | "escape" | "complete";
  durationMs: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  totalTyped: number;
  targetLength: number;
  samples: KeySample[];
  timeline: TimelinePoint[];
  errorMarkers: Array<{ index: number; expected: string; typed: string; t: number }>;
  peakWpm: number;
  peakAtMs: number;
}

export function calcWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return (correctChars / 5) / (elapsedMs / 60000);
}

export function calcRawWpm(totalTyped: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return (totalTyped / 5) / (elapsedMs / 60000);
}

export function calcAccuracy(correctChars: number, totalTyped: number): number {
  if (totalTyped <= 0) return 100;
  return (correctChars / totalTyped) * 100;
}

/** Soft cap so Custom mode / saved texts cannot freeze the letter renderer. */
export const CUSTOM_TEXT_MAX = 2500;

export function normalizeCustomText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, CUSTOM_TEXT_MAX);
}

export function clampCustomSeconds(n: number): number {
  if (!Number.isFinite(n)) return 5;
  return Math.max(5, Math.min(900, Math.round(n)));
}

export function resolveTimerMs(preset: TimerPreset, customSeconds: number): number | null {
  if (preset === "none") return null;
  if (preset === "custom") return clampCustomSeconds(customSeconds) * 1000;
  return preset * 1000;
}
