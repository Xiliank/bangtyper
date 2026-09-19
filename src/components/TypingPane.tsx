import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSettings } from "@/lib/SettingsContext";
import { chaosPalette } from "@/lib/settings";
import { playErrorBlip, playKeyClick } from "@/lib/sounds";

interface TypingPaneProps {
  target: string;
  typed: string;
  active: boolean;
  onType: (key: string) => void;
  onBackspace: () => void;
}

type LetterState = "pending" | "ok" | "bad" | "current";

const Letter = memo(function Letter({
  ch,
  state,
  chaos,
  index,
}: {
  ch: string;
  state: LetterState;
  chaos?: string;
  index: number;
}) {
  const style: CSSProperties | undefined = chaos ? { color: chaos } : undefined;
  const isSpace = ch === "\u00A0" || ch === " ";
  return (
    <span
      data-i={index}
      className={`letter${isSpace ? " letter-space" : ""} letter-${state}`}
      style={style}
    >
      {isSpace ? "\u00A0" : ch}
    </span>
  );
});

/** Monkeytype-style: full prompt visible; caret glides in-place; no visible input. */
export function TypingPane({ target, typed, active, onType, onBackspace }: TypingPaneProps) {
  const { settings } = useSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const caretIndex = Math.min(typed.length, target.length);
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0, h: 24, w: 2, ready: false });
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [fitPx, setFitPx] = useState<number | null>(null);
  const prevLen = useRef(0);
  const chaosColors = useRef<Map<number, string>>(new Map());
  const fitRaf = useRef(0);
  const palette = useMemo(() => chaosPalette(settings.theme), [settings.theme]);

  useEffect(() => {
    if (!active) return;
    const focus = () => inputRef.current?.focus({ preventScroll: true });
    focus();
    const id = window.setInterval(focus, 1800);
    return () => window.clearInterval(id);
  }, [active, target]);

  useEffect(() => {
    chaosColors.current.clear();
    setFitPx(null);
  }, [target, settings.chaosTypedColor, settings.typingFont]);

  /** Shrink prompt font until the full target fits in the typing block (no bottom clip). */
  useLayoutEffect(() => {
    const block = blockRef.current;
    const words = wordsRef.current;
    if (!block || !words) return;

    const fit = () => {
      const available = block.clientHeight - 8;
      if (available < 40) return;

      const cs = getComputedStyle(document.documentElement);
      const cssSize = parseFloat(cs.getPropertyValue("font-size")) || 16;
      words.style.fontSize = "";
      const base = parseFloat(getComputedStyle(words).fontSize) || cssSize * 1.25;
      let lo = Math.max(12, cssSize * 0.75);
      let hi = base;
      let best = lo;

      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        words.style.fontSize = `${mid}px`;
        if (words.scrollHeight <= available) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      words.style.fontSize = `${best}px`;
      setFitPx((prev) => (prev != null && Math.abs(prev - best) < 0.25 ? prev : best));
    };

    fit();
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(fitRaf.current);
      fitRaf.current = requestAnimationFrame(fit);
    });
    ro.observe(block);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(fitRaf.current);
      words.style.fontSize = "";
    };
  }, [target, settings.typingFont, active]);

  useLayoutEffect(() => {
    const root = wordsRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-i="${caretIndex}"]`);
    const measure = (node: HTMLElement) => {
      const r = node.getBoundingClientRect();
      const pr = root.getBoundingClientRect();
      const h = r.height || 24;
      const w =
        settings.caretStyle === "block"
          ? Math.max(r.width || h * 0.55, 8)
          : settings.caretStyle === "underline"
            ? Math.max(r.width || h * 0.55, 10)
            : 2;
      setCaretPos((prev) => {
        const x = r.left - pr.left;
        const y = r.top - pr.top;
        if (
          prev.ready &&
          Math.abs(prev.x - x) < 0.5 &&
          Math.abs(prev.y - y) < 0.5 &&
          Math.abs(prev.h - h) < 0.5 &&
          Math.abs(prev.w - w) < 0.5
        ) {
          return prev;
        }
        return { x, y, h, w, ready: true };
      });
    };
    if (!el) {
      const end = root.querySelector<HTMLElement>(".caret-end-anchor");
      if (end) measure(end);
      return;
    }
    measure(el);
  }, [caretIndex, typed, target, settings.caretStyle, fitPx]);

  useEffect(() => {
    if (typed.length === prevLen.current) return;
    if (typed.length > prevLen.current) {
      const i = typed.length - 1;
      const ok = typed[i] === target[i];
      if (!settings.reduceEffects) {
        setFlash(ok ? "ok" : "bad");
        const t = window.setTimeout(() => setFlash(null), 120);
        prevLen.current = typed.length;
        if (settings.soundEnabled) {
          if (ok) playKeyClick();
          else playErrorBlip();
        }
        if (settings.chaosTypedColor && ok) {
          const color = palette[Math.floor(Math.random() * palette.length)]!;
          chaosColors.current.set(i, color);
        }
        return () => window.clearTimeout(t);
      }
      if (settings.soundEnabled) {
        if (ok) playKeyClick();
        else playErrorBlip();
      }
      if (settings.chaosTypedColor && ok) {
        const color = palette[Math.floor(Math.random() * palette.length)]!;
        chaosColors.current.set(i, color);
      }
      prevLen.current = typed.length;
      return;
    }
    for (const key of [...chaosColors.current.keys()]) {
      if (key >= typed.length) chaosColors.current.delete(key);
    }
    prevLen.current = typed.length;
  }, [
    typed,
    target,
    settings.soundEnabled,
    settings.chaosTypedColor,
    settings.reduceEffects,
    palette,
  ]);

  const words = useMemo(() => target.split(" "), [target]);

  const caretStyle =
    settings.caretStyle === "block"
      ? {
          transform: `translate(${caretPos.x}px, ${caretPos.y}px)`,
          height: `${caretPos.h}px`,
          width: `${caretPos.w}px`,
        }
      : settings.caretStyle === "underline"
        ? {
            transform: `translate(${caretPos.x}px, ${caretPos.y + caretPos.h - 3}px)`,
            height: "3px",
            width: `${caretPos.w}px`,
          }
        : {
            transform: `translate(${caretPos.x}px, ${caretPos.y}px)`,
            height: `${caretPos.h}px`,
            width: "2px",
          };

  let globalIndex = 0;
  const nodes: ReactNode[] = [];
  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi]!;
    const letters = word.split("");
    const letterNodes = letters.map((ch, li) => {
      const i = globalIndex + li;
      let state: LetterState = "pending";
      if (i < typed.length) {
        state = typed[i] === ch ? "ok" : "bad";
      } else if (i === caretIndex) {
        state = "current";
      }
      return (
        <Letter
          key={`${wi}-${li}`}
          index={i}
          ch={ch}
          state={state}
          chaos={state === "ok" ? chaosColors.current.get(i) : undefined}
        />
      );
    });
    globalIndex += word.length;

    let spaceNode: ReactNode = null;
    if (wi < words.length - 1) {
      const spaceIndex = globalIndex;
      let spaceState: LetterState = "pending";
      if (spaceIndex < typed.length) {
        spaceState = typed[spaceIndex] === " " ? "ok" : "bad";
      } else if (spaceIndex === caretIndex) {
        spaceState = "current";
      }
      spaceNode = (
        <Letter
          key={`sp-${wi}`}
          index={spaceIndex}
          ch={"\u00A0"}
          state={spaceState}
          chaos={spaceState === "ok" ? chaosColors.current.get(spaceIndex) : undefined}
        />
      );
      globalIndex += 1;
    }

    nodes.push(
      <span className="word" key={`w-${wi}`}>
        {letterNodes}
        {spaceNode}
      </span>,
    );
  }

  return (
    <div
      ref={blockRef}
      className={`typing-block ${flash ? `flash-${flash}` : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }}
    >
      <input
        ref={inputRef}
        className="typing-hidden-input"
        type="text"
        value=""
        onChange={() => {
          /* keep empty — keys handled in onKeyDown */
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        tabIndex={0}
        aria-label="Type here"
        onKeyDown={(e) => {
          if (e.key === "Escape") return;
          if (e.key === "Tab") {
            e.preventDefault();
            return;
          }
          if (e.metaKey || e.ctrlKey || e.altKey) return;

          if (e.key === "Backspace") {
            e.preventDefault();
            onBackspace();
            return;
          }

          if (e.key.length !== 1) return;
          e.preventDefault();
          onType(e.key);
        }}
      />

      <div className="typing-words" ref={wordsRef}>
        {caretPos.ready ? (
          <span
            className={`inline-caret glide caret-${settings.caretStyle}${
              settings.caretTrail && !settings.reduceEffects ? " trail" : ""
            }`}
            aria-hidden
            style={caretStyle}
          />
        ) : null}
        {nodes}
        <span className="caret-end-anchor" data-i={target.length} aria-hidden />
      </div>
    </div>
  );
}
