import { normalizeCustomText, type ModeId, type TestResult, type TimelinePoint } from "@/lib/types";

const HISTORY_KEY = "bangtyper.history.v1";
const TEXTS_KEY = "bangtyper.savedTexts.v1";
export const HISTORY_CAP = 50;
export const SAVED_TEXTS_CAP = 10;

/** Slim run record for local history (enough to reopen results charts). */
export interface HistoryEntry {
  id: string;
  at: number;
  mode: ModeId;
  durationMs: number;
  wpm: number;
  accuracy: number;
  errors: number;
  peakWpm: number;
  peakAtMs: number;
  endedBy: TestResult["endedBy"];
  timeline: Array<{ t: number; wpm: number; accuracy: number; rawWpm?: number; errors?: number }>;
  errorMarkers: TestResult["errorMarkers"];
}

export interface SavedText {
  id: string;
  name: string;
  body: string;
  updatedAt: number;
}

export type TargetStatus = "unset" | "met" | "above" | "below";

export function compareWpm(wpm: number, targetWpm: number | null): {
  status: TargetStatus;
  delta: number | null;
} {
  if (targetWpm == null || targetWpm <= 0) return { status: "unset", delta: null };
  const delta = Math.round(wpm) - Math.round(targetWpm);
  if (delta === 0) return { status: "met", delta: 0 };
  if (delta > 0) return { status: "above", delta };
  return { status: "below", delta };
}

export function compareAccuracy(accuracy: number, targetAccuracy: number | null): {
  status: TargetStatus;
  delta: number | null;
} {
  if (targetAccuracy == null || targetAccuracy <= 0) return { status: "unset", delta: null };
  const delta = Math.round(accuracy) - Math.round(targetAccuracy);
  if (delta === 0) return { status: "met", delta: 0 };
  if (delta > 0) return { status: "above", delta };
  return { status: "below", delta };
}

export function targetSummaryLine(
  wpm: number,
  accuracy: number,
  targetWpm: number | null,
  targetAccuracy: number | null,
): string | null {
  const w = compareWpm(wpm, targetWpm);
  const a = compareAccuracy(accuracy, targetAccuracy);
  if (w.status === "unset" && a.status === "unset") return null;

  const parts: string[] = [];
  if (w.status !== "unset" && w.delta != null) {
    if (w.status === "met") parts.push(`met ${Math.round(targetWpm!)} WPM`);
    else if (w.status === "above") parts.push(`${w.delta} above ${Math.round(targetWpm!)} WPM`);
    else parts.push(`${Math.abs(w.delta)} below ${Math.round(targetWpm!)} WPM`);
  }
  if (a.status !== "unset" && a.delta != null) {
    if (a.status === "met") parts.push(`met ${Math.round(targetAccuracy!)}% accuracy`);
    else if (a.status === "above")
      parts.push(`${a.delta} pts above ${Math.round(targetAccuracy!)}%`);
    else parts.push(`${Math.abs(a.delta)} pts below ${Math.round(targetAccuracy!)}%`);
  }
  return parts.join(", ");
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadHistory(): HistoryEntry[] {
  const list = safeParse<HistoryEntry[]>(localStorage.getItem(HISTORY_KEY), []);
  return Array.isArray(list) ? list.slice(0, HISTORY_CAP) : [];
}

export function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_CAP)));
  } catch {
    /* ignore */
  }
}

export function appendHistory(result: TestResult): HistoryEntry[] {
  const slimTimeline = result.timeline
    .filter((_, i, arr) => i % 2 === 0 || i === arr.length - 1)
    .map((p) => ({
      t: p.t,
      wpm: Math.round(p.wpm * 10) / 10,
      accuracy: Math.round(p.accuracy * 10) / 10,
      rawWpm: Math.round(p.rawWpm * 10) / 10,
      errors: p.errors,
    }));

  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    mode: result.mode,
    durationMs: result.durationMs,
    wpm: result.wpm,
    accuracy: result.accuracy,
    errors: result.errors,
    peakWpm: result.peakWpm,
    peakAtMs: result.peakAtMs,
    endedBy: result.endedBy,
    timeline: slimTimeline,
    errorMarkers: result.errorMarkers.slice(0, 80),
  };

  const next = [entry, ...loadHistory()].slice(0, HISTORY_CAP);
  saveHistory(next);
  return next;
}

export function historyToResult(entry: HistoryEntry): TestResult {
  const timeline: TimelinePoint[] = entry.timeline.map((p) => ({
    t: p.t,
    wpm: p.wpm,
    rawWpm: p.rawWpm ?? p.wpm,
    accuracy: p.accuracy,
    errors: p.errors ?? 0,
    chars: 0,
  }));
  return {
    mode: entry.mode,
    endedBy: entry.endedBy,
    durationMs: entry.durationMs,
    wpm: entry.wpm,
    rawWpm: entry.wpm,
    accuracy: entry.accuracy,
    errors: entry.errors,
    correctChars: 0,
    totalTyped: 0,
    targetLength: 0,
    samples: [],
    timeline,
    errorMarkers: entry.errorMarkers ?? [],
    peakWpm: entry.peakWpm,
    peakAtMs: entry.peakAtMs,
  };
}

export function loadSavedTexts(): SavedText[] {
  const list = safeParse<SavedText[]>(localStorage.getItem(TEXTS_KEY), []);
  return Array.isArray(list) ? list.slice(0, SAVED_TEXTS_CAP) : [];
}

export function saveSavedTexts(texts: SavedText[]) {
  try {
    localStorage.setItem(TEXTS_KEY, JSON.stringify(texts.slice(0, SAVED_TEXTS_CAP)));
  } catch {
    /* ignore */
  }
}

export function upsertSavedText(
  texts: SavedText[],
  patch: { id?: string; name: string; body: string },
): SavedText[] {
  const name = patch.name.trim() || "Untitled";
  const body = normalizeCustomText(patch.body);
  if (!body) return texts;
  if (patch.id) {
    return texts.map((t) =>
      t.id === patch.id ? { ...t, name, body, updatedAt: Date.now() } : t,
    );
  }
  if (texts.length >= SAVED_TEXTS_CAP) return texts;
  return [
    { id: `t-${Date.now()}`, name, body, updatedAt: Date.now() },
    ...texts,
  ].slice(0, SAVED_TEXTS_CAP);
}

export function deleteSavedText(texts: SavedText[], id: string): SavedText[] {
  return texts.filter((t) => t.id !== id);
}

/** Recent sessions for trend chart (newest last for left→right time). */
export function trendPoints(history: HistoryEntry[], limit = 20) {
  return [...history]
    .slice(0, limit)
    .reverse()
    .map((e, i) => ({
      i: i + 1,
      label: new Date(e.at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      wpm: Math.round(e.wpm * 10) / 10,
      accuracy: Math.round(e.accuracy * 10) / 10,
      at: e.at,
    }));
}
