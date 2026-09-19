import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { contrastRatio, ensureContrast, inkOn } from "@/lib/contrast";
import {
  accentHex,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  typingColorForTheme,
  typingFontCss,
  type AppSettings,
} from "@/lib/settings";
import { ensureTypingFont, prefetchDefaultTypingFont } from "@/lib/fonts";

interface SettingsContextValue {
  settings: AppSettings;
  setSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const LIGHT_BG = "#eef0f3";
const DARK_BG = "#0b0d10";
const LIGHT_PANEL = "#f7f8fa";
const DARK_PANEL = "#12151a";

function applyCssVars(settings: AppSettings) {
  const root = document.documentElement;
  const accent = accentHex(settings.accent);
  const isLight = settings.theme === "light";
  const bg = isLight ? LIGHT_BG : DARK_BG;
  const typed = typingColorForTheme(settings.typingColor, settings.theme);

  root.dataset.theme = settings.theme;
  root.dataset.bg = settings.background;
  root.dataset.caret = settings.caretStyle;
  root.dataset.caretTrail = settings.caretTrail ? "on" : "off";
  root.dataset.reduceEffects = settings.reduceEffects ? "on" : "off";
  root.style.setProperty("--accent", accent);
  ensureTypingFont(settings.typingFont);
  root.style.setProperty("--gold", accent);
  root.style.setProperty("--gold-bright", accent);
  root.style.setProperty("--on-accent", inkOn(accent));
  // Labels that use accent as ink must stay readable on the page bg
  root.style.setProperty("--accent-text", ensureContrast(accent, bg, 4.5));
  // Selection borders / focus rings: ≥3:1 non-text UI contrast
  root.style.setProperty("--accent-line", ensureContrast(accent, bg, 3));
  root.style.setProperty("--typed-color", ensureContrast(typed, bg, 4.5));
  root.style.setProperty("--typing-font", typingFontCss(settings.typingFont));

  if (isLight) {
    root.style.setProperty("--bg", LIGHT_BG);
    root.style.setProperty("--bg-panel", LIGHT_PANEL);
    root.style.setProperty("--bg-elev", "#e4e7ec");
    root.style.setProperty("--text", "#12151a");
    root.style.setProperty("--muted", ensureContrast("#5c6370", LIGHT_BG, 4.5));
    root.style.setProperty("--line", "#c5cad3");
    root.style.setProperty("--pending", ensureContrast("#5c6370", LIGHT_BG, 4.5));
    root.style.setProperty("--danger", ensureContrast("#c62828", LIGHT_BG, 4.5));
    root.style.setProperty("--danger-soft", "#8a3030");
    document.documentElement.style.colorScheme = "light";
  } else {
    root.style.setProperty("--bg", DARK_BG);
    root.style.setProperty("--bg-panel", DARK_PANEL);
    root.style.setProperty("--bg-elev", "#1a1e26");
    root.style.setProperty("--text", "#e6e8ec");
    root.style.setProperty("--muted", ensureContrast("#8b929c", DARK_BG, 4.5));
    root.style.setProperty("--line", "#2a3038");
    root.style.setProperty("--pending", ensureContrast("#8b929c", DARK_BG, 4.5));
    root.style.setProperty("--danger", ensureContrast("#e85a5a", DARK_BG, 4.5));
    root.style.setProperty("--danger-soft", "#e8a0a0");
    document.documentElement.style.colorScheme = "dark";
  }

  // Keep typed vs pending distinct (if clamp collapsed them, nudge pending)
  const pending = getComputedStyle(root).getPropertyValue("--pending").trim() || "#8b929c";
  if (contrastRatio(typed, pending) < 1.8) {
    root.style.setProperty(
      "--pending",
      ensureContrast(isLight ? "#4a5160" : "#6e7682", bg, 4.5),
    );
  }

  // Chart / elevated surfaces
  root.style.setProperty("--chart-bg", isLight ? "#e8ebf0" : "#0f1217");
  root.style.setProperty("--chart-fg", isLight ? "#12151a" : "#e6e8ec");
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    prefetchDefaultTypingFont();
  }, []);

  useEffect(() => {
    applyCssVars(settings);
    saveSettings(settings);
  }, [settings]);

  const setSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState({ ...DEFAULT_SETTINGS });
  }, []);

  const value = useMemo(
    () => ({ settings, setSettings, resetSettings }),
    [settings, setSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings requires SettingsProvider");
  return ctx;
}
