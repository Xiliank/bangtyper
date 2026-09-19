import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  calcRawWpm,
  calcWpm,
  type KeySample,
  type ModeId,
  type TestResult,
  type TimelinePoint,
} from "@/lib/types";

interface UseTypingTestArgs {
  target: string;
  timerMs: number | null;
  /** Test screen is live (timer/timeline keep running). */
  active: boolean;
  /** When false (e.g. Settings open), ignore keystrokes / Esc-to-end. */
  inputEnabled: boolean;
  /** Bumps on every Start/Restart so identical prompts still reset. */
  runId: number;
  mode: ModeId;
  onComplete: (result: TestResult) => void;
}

/**
 * Accuracy model:
 * - Every incorrect keystroke permanently increments `errorKeystrokes`.
 * - Backspacing / later correcting does NOT reduce `errorKeystrokes`.
 * - `correctKeystrokes` counts only keystrokes that matched at press time.
 * - accuracy = correctKeystrokes / (correctKeystrokes + errorKeystrokes) * 100
 *   (errors once counted stay counted).
 */
export function useTypingTest({
  target,
  timerMs,
  active,
  inputEnabled,
  runId,
  mode,
  onComplete,
}: UseTypingTestArgs) {
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => performance.now());
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);

  const finishedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const typedRef = useRef("");
  const correctRef = useRef(0);
  const errorRef = useRef(0);
  const samplesRef = useRef<KeySample[]>([]);
  const timelineRef = useRef<TimelinePoint[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);
  useEffect(() => {
    typedRef.current = typed;
  }, [typed]);
  useEffect(() => {
    correctRef.current = correctKeystrokes;
  }, [correctKeystrokes]);
  useEffect(() => {
    errorRef.current = errorKeystrokes;
  }, [errorKeystrokes]);

  const elapsedMs = startedAt == null ? 0 : Math.max(0, now - startedAt);
  const remainingMs =
    timerMs == null || startedAt == null ? timerMs : Math.max(0, timerMs - elapsedMs);

  const liveCorrectInBuffer = useMemo(() => {
    let n = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) n += 1;
    }
    return n;
  }, [typed, target]);

  const wpm = calcWpm(liveCorrectInBuffer, elapsedMs);
  const rawWpm = calcRawWpm(correctKeystrokes + errorKeystrokes, elapsedMs);
  const totalAttempts = correctKeystrokes + errorKeystrokes;
  const accuracy = totalAttempts <= 0 ? 100 : (correctKeystrokes / totalAttempts) * 100;
  const errors = errorKeystrokes;

  const finish = useCallback(
    (endedBy: TestResult["endedBy"]) => {
      const start = startedAtRef.current;
      const currentTyped = typedRef.current;
      if (finishedRef.current || !start) return;
      finishedRef.current = true;
      const end = performance.now();
      const durationMs = Math.max(1, end - start);
      const finalCorrect = correctRef.current;
      const finalErrors = errorRef.current;
      const attempts = finalCorrect + finalErrors;
      const samples = samplesRef.current;
      const timeline = timelineRef.current;
      const errorMarkers = samples
        .filter((s) => !s.correct)
        .map((s) => ({ index: s.index, expected: s.expected, typed: s.typed, t: s.t }));

      let peakWpm = 0;
      let peakAtMs = 0;
      for (const p of timeline) {
        if (p.wpm >= peakWpm) {
          peakWpm = p.wpm;
          peakAtMs = p.t;
        }
      }
      let bufferCorrect = 0;
      for (let i = 0; i < currentTyped.length; i++) {
        if (currentTyped[i] === target[i]) bufferCorrect += 1;
      }
      const endWpm = calcWpm(bufferCorrect, durationMs);
      if (endWpm >= peakWpm) {
        peakWpm = endWpm;
        peakAtMs = durationMs;
      }

      onCompleteRef.current({
        mode,
        endedBy,
        durationMs,
        wpm: endWpm,
        rawWpm: calcRawWpm(attempts, durationMs),
        accuracy: attempts <= 0 ? 100 : (finalCorrect / attempts) * 100,
        errors: finalErrors,
        correctChars: finalCorrect,
        totalTyped: attempts,
        targetLength: target.length,
        samples,
        timeline,
        errorMarkers,
        peakWpm,
        peakAtMs,
      });
    },
    [target, mode],
  );

  const reset = useCallback(() => {
    finishedRef.current = false;
    typedRef.current = "";
    startedAtRef.current = null;
    correctRef.current = 0;
    errorRef.current = 0;
    samplesRef.current = [];
    timelineRef.current = [];
    setTyped("");
    setStartedAt(null);
    setNow(performance.now());
    setCorrectKeystrokes(0);
    setErrorKeystrokes(0);
  }, []);

  useEffect(() => {
    reset();
  }, [target, timerMs, runId, reset]);

  // HUD tick — timeline stored in ref (no React re-render for chart samples).
  useEffect(() => {
    if (!active || startedAt == null || finishedRef.current) return;
    const id = window.setInterval(() => {
      const t = performance.now();
      setNow(t);
      const elapsed = t - startedAt;
      const current = typedRef.current;
      let bufferCorrect = 0;
      for (let i = 0; i < current.length; i++) {
        if (current[i] === target[i]) bufferCorrect += 1;
      }
      const c = correctRef.current;
      const e = errorRef.current;
      const attempts = c + e;
      timelineRef.current.push({
        t: elapsed,
        wpm: calcWpm(bufferCorrect, elapsed),
        rawWpm: calcRawWpm(attempts, elapsed),
        accuracy: attempts <= 0 ? 100 : (c / attempts) * 100,
        errors: e,
        chars: attempts,
      });
      if (timerMs != null && elapsed >= timerMs) {
        finish("timer");
      }
    }, 330);
    return () => window.clearInterval(id);
  }, [active, startedAt, timerMs, target, finish]);

  useEffect(() => {
    if (!active || finishedRef.current) return;
    if (target.length > 0 && typed.length >= target.length) {
      finish("complete");
    }
  }, [typed, target, active, finish]);

  useEffect(() => {
    if (!active || !inputEnabled) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (startedAtRef.current && !finishedRef.current) finish("escape");
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [active, inputEnabled, finish]);

  const ensureStarted = useCallback(() => {
    if (startedAtRef.current != null) return startedAtRef.current;
    const start = performance.now();
    startedAtRef.current = start;
    setStartedAt(start);
    setNow(start);
    return start;
  }, []);

  const handleType = useCallback(
    (key: string) => {
      if (!active || !inputEnabled || finishedRef.current) return;
      // Side effects stay outside setState — Strict Mode may double-invoke updaters in dev.
      if (typedRef.current.length >= target.length) return;
      const start = ensureStarted();
      const index = typedRef.current.length;
      const expected = target[index] ?? "";
      const correct = key === expected;
      const t = performance.now() - start;
      samplesRef.current.push({ t, correct, expected, typed: key, index });
      if (correct) {
        correctRef.current += 1;
        setCorrectKeystrokes(correctRef.current);
      } else {
        errorRef.current += 1;
        setErrorKeystrokes(errorRef.current);
      }
      const next = typedRef.current + key;
      typedRef.current = next;
      setTyped(next);
    },
    [active, inputEnabled, ensureStarted, target],
  );

  const handleBackspace = useCallback(() => {
    if (!active || !inputEnabled || finishedRef.current || !startedAtRef.current) return;
    if (typedRef.current.length === 0) return;
    const next = typedRef.current.slice(0, -1);
    typedRef.current = next;
    setTyped(next);
  }, [active, inputEnabled]);

  return {
    typed,
    startedAt,
    elapsedMs,
    remainingMs,
    wpm,
    rawWpm,
    accuracy,
    errors,
    reset,
    finish,
    handleType,
    handleBackspace,
  };
}
