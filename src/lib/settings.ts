export type ThemeMode = "dark" | "light";

export type TypingFontId =
  | "jetbrains"
  | "roboto"
  | "inter"
  | "montserrat"
  | "source-code"
  | "ibm-plex"
  | "georgia"
  | "source-serif"
  | "pacifico"
  | "comic-neue"
  | "anton"
  | "system";

export type AccentId =
  | "gold"
  | "amber"
  | "lime"
  | "cyan"
  | "sky"
  | "rose"
  | "coral"
  | "violet"
  | "mint"
  | "steel";

export type TypingColorId =
  | "white"
  | "soft-white"
  | "ivory"
  | "gold"
  | "amber"
  | "mint"
  | "cyan"
  | "sky"
  | "rose"
  | "coral"
  | "lavender"
  | "steel";

export type BackgroundId =
  | "flat"
  | "horizon"
  | "mesh"
  | "grid"
  | "aurora"
  | "paper";

export type CaretStyleId = "line" | "block" | "underline";

export interface AppSettings {
  theme: ThemeMode;
  accent: AccentId;
  typingColor: TypingColorId;
  typingFont: TypingFontId;
  background: BackgroundId;
  /** Fun — all calm defaults */
  soundEnabled: boolean;
  caretStyle: CaretStyleId;
  chaosTypedColor: boolean;
  caretTrail: boolean;
  confettiOnBest: boolean;
  /** Low-end opt-in — shortens transitions; default aesthetics unchanged when off. */
  reduceEffects: boolean;
  /** Optional personal goals — null means unset. */
  targetWpm: number | null;
  targetAccuracy: number | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  accent: "gold",
  typingColor: "white",
  typingFont: "jetbrains",
  background: "grid",
  /** Mild fun on for new installs — still easy to disable. */
  soundEnabled: true,
  caretStyle: "line",
  chaosTypedColor: false,
  caretTrail: true,
  confettiOnBest: false,
  reduceEffects: false,
  targetWpm: null,
  targetAccuracy: null,
};

export const ACCENT_SWATCHES: Array<{ id: AccentId; label: string; hex: string }> = [
  { id: "gold", label: "Gold", hex: "#edc956" },
  { id: "amber", label: "Amber", hex: "#f0a020" },
  { id: "lime", label: "Lime", hex: "#b8e05a" },
  { id: "cyan", label: "Cyan", hex: "#3dd6c6" },
  { id: "sky", label: "Sky", hex: "#5aa8ff" },
  { id: "rose", label: "Rose", hex: "#e85a7a" },
  { id: "coral", label: "Coral", hex: "#ff7a59" },
  { id: "violet", label: "Violet", hex: "#9b7bff" },
  { id: "mint", label: "Mint", hex: "#5ed4a5" },
  { id: "steel", label: "Steel", hex: "#8a93a6" },
];

/** Quick fun accent+typed pairings (does not enable chaos). */
export const FUN_ACCENT_PRESETS: Array<{
  id: string;
  label: string;
  accent: AccentId;
  typingColor: TypingColorId;
}> = [
  { id: "classic", label: "Classic gold", accent: "gold", typingColor: "white" },
  { id: "ocean", label: "Ocean", accent: "cyan", typingColor: "sky" },
  { id: "sunset", label: "Sunset", accent: "coral", typingColor: "ivory" },
  { id: "neon-mint", label: "Mint pop", accent: "mint", typingColor: "mint" },
  { id: "violet-haze", label: "Violet haze", accent: "violet", typingColor: "lavender" },
];

/** Swatch preview hex (dark-theme look). Light theme uses darker resolved ink. */
export const TYPING_COLOR_SWATCHES: Array<{
  id: TypingColorId;
  label: string;
  hex: string;
  /** Safe ink on light cream surfaces (≥4.5:1 vs #f4f2ea). */
  lightHex: string;
}> = [
  { id: "white", label: "White", hex: "#ffffff", lightHex: "#1a1814" },
  { id: "soft-white", label: "Soft white", hex: "#e8e8e8", lightHex: "#2a2822" },
  { id: "ivory", label: "Ivory", hex: "#f2efe6", lightHex: "#3a3428" },
  { id: "gold", label: "Gold", hex: "#edc956", lightHex: "#8a6a08" },
  { id: "amber", label: "Amber", hex: "#f0b429", lightHex: "#9a5a00" },
  { id: "mint", label: "Mint", hex: "#7dffa3", lightHex: "#0d7a48" },
  { id: "cyan", label: "Cyan", hex: "#6ef0e0", lightHex: "#0a7a72" },
  { id: "sky", label: "Sky", hex: "#8ec5ff", lightHex: "#1a5fb8" },
  { id: "rose", label: "Rose", hex: "#ff8fab", lightHex: "#c01848" },
  { id: "coral", label: "Coral", hex: "#ff9a7a", lightHex: "#c03a18" },
  { id: "lavender", label: "Lavender", hex: "#c4b5fd", lightHex: "#5b3cc4" },
  { id: "steel", label: "Steel", hex: "#b0b8c8", lightHex: "#3a4458" },
];

export const TYPING_FONTS: Array<{ id: TypingFontId; label: string; css: string; sample?: string }> = [
  { id: "jetbrains", label: "JetBrains Mono", css: '"JetBrains Mono", ui-monospace, monospace' },
  { id: "source-code", label: "Source Code Pro", css: '"Source Code Pro", ui-monospace, monospace' },
  { id: "ibm-plex", label: "IBM Plex Mono", css: '"IBM Plex Mono", ui-monospace, monospace' },
  { id: "inter", label: "Inter", css: '"Inter", "Segoe UI", sans-serif' },
  { id: "roboto", label: "Roboto", css: '"Roboto", "Segoe UI", sans-serif' },
  { id: "montserrat", label: "Montserrat", css: '"Montserrat", "Segoe UI", sans-serif' },
  { id: "georgia", label: "Georgia", css: 'Georgia, "Times New Roman", serif' },
  { id: "source-serif", label: "Source Serif", css: '"Source Serif 4", Georgia, serif' },
  { id: "pacifico", label: "Pacifico", css: '"Pacifico", "Segoe Script", cursive' },
  {
    id: "comic-neue",
    label: "Comic Neue",
    css: '"Comic Neue", "Comic Sans MS", "Comic Sans", cursive',
  },
  { id: "anton", label: "Anton", css: '"Anton", Impact, "Arial Black", sans-serif' },
  {
    id: "system",
    label: "System UI",
    css: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
];

export const CARET_STYLES: Array<{ id: CaretStyleId; label: string }> = [
  { id: "line", label: "Line" },
  { id: "block", label: "Block" },
  { id: "underline", label: "Underline" },
];

export const BACKGROUNDS: Array<{ id: BackgroundId; label: string }> = [
  { id: "grid", label: "Grid" },
  { id: "flat", label: "Flat" },
  { id: "horizon", label: "Horizon" },
  { id: "mesh", label: "Mesh" },
  { id: "aurora", label: "Aurora bands" },
  { id: "paper", label: "Paper grain" },
];

const STORAGE_KEY = "bangtyper.settings.v1";
const BEST_WPM_KEY = "bangtyper.bestWpm.v1";

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const merged: AppSettings = { ...DEFAULT_SETTINGS, ...parsed };
    // Validate enums so corrupt storage can't blank the UI
    if (!ACCENT_SWATCHES.some((s) => s.id === merged.accent)) merged.accent = DEFAULT_SETTINGS.accent;
    if (!TYPING_COLOR_SWATCHES.some((s) => s.id === merged.typingColor)) {
      merged.typingColor = DEFAULT_SETTINGS.typingColor;
    }
    if (!TYPING_FONTS.some((f) => f.id === merged.typingFont)) {
      merged.typingFont = DEFAULT_SETTINGS.typingFont;
    }
    if (!BACKGROUNDS.some((b) => b.id === merged.background)) {
      merged.background = DEFAULT_SETTINGS.background;
    }
    if (merged.theme !== "dark" && merged.theme !== "light") merged.theme = DEFAULT_SETTINGS.theme;
    if (!CARET_STYLES.some((c) => c.id === merged.caretStyle)) {
      merged.caretStyle = DEFAULT_SETTINGS.caretStyle;
    }
    // Booleans: missing keys keep DEFAULT_SETTINGS (mild fun on for fresh installs)
    merged.soundEnabled = parsed.soundEnabled === undefined ? DEFAULT_SETTINGS.soundEnabled : parsed.soundEnabled === true;
    merged.chaosTypedColor = parsed.chaosTypedColor === true;
    merged.caretTrail = parsed.caretTrail === undefined ? DEFAULT_SETTINGS.caretTrail : parsed.caretTrail === true;
    merged.confettiOnBest = parsed.confettiOnBest === true;
    merged.reduceEffects = parsed.reduceEffects === true;
    // Targets stay unset unless user saved a positive value (never force 60/95)
    const hasTw = Object.prototype.hasOwnProperty.call(parsed, "targetWpm");
    const hasTa = Object.prototype.hasOwnProperty.call(parsed, "targetAccuracy");
    const tw = hasTw ? (parsed.targetWpm as unknown) : null;
    const ta = hasTa ? (parsed.targetAccuracy as unknown) : null;
    merged.targetWpm =
      tw == null || tw === "" || Number.isNaN(Number(tw)) || Number(tw) <= 0
        ? null
        : Math.max(1, Math.min(300, Math.round(Number(tw))));
    merged.targetAccuracy =
      ta == null || ta === "" || Number.isNaN(Number(ta)) || Number(ta) <= 0
        ? null
        : Math.max(1, Math.min(100, Math.round(Number(ta))));
    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota */
  }
}

export function loadBestWpm(): number {
  try {
    const n = Number(localStorage.getItem(BEST_WPM_KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveBestWpm(wpm: number) {
  try {
    localStorage.setItem(BEST_WPM_KEY, String(Math.max(0, Math.round(wpm))));
  } catch {
    /* ignore */
  }
}

export function accentHex(id: AccentId): string {
  return ACCENT_SWATCHES.find((s) => s.id === id)?.hex ?? "#edc956";
}

/** Raw swatch hex (for settings chip preview). Prefer `typingColorForTheme`. */
export function typingColorHex(id: TypingColorId): string {
  return TYPING_COLOR_SWATCHES.find((s) => s.id === id)?.hex ?? "#ffffff";
}

/** Theme-aware typed character color — light pastels auto-map to dark inks on light theme. */
export function typingColorForTheme(id: TypingColorId, theme: ThemeMode): string {
  const swatch = TYPING_COLOR_SWATCHES.find((s) => s.id === id);
  if (!swatch) return theme === "light" ? "#1a1814" : "#ffffff";
  return theme === "light" ? swatch.lightHex : swatch.hex;
}

export function typingFontCss(id: TypingFontId): string {
  return TYPING_FONTS.find((f) => f.id === id)?.css ?? TYPING_FONTS[0]!.css;
}

/** Chaos-mode palette (theme-aware). */
export function chaosPalette(theme: ThemeMode): string[] {
  return TYPING_COLOR_SWATCHES.map((s) => (theme === "light" ? s.lightHex : s.hex));
}
