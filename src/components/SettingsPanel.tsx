import {
  ACCENT_SWATCHES,
  BACKGROUNDS,
  CARET_STYLES,
  FUN_ACCENT_PRESETS,
  TYPING_COLOR_SWATCHES,
  TYPING_FONTS,
  type AccentId,
  type BackgroundId,
  type CaretStyleId,
  type TypingColorId,
  type TypingFontId,
} from "@/lib/settings";
import { useSettings } from "@/lib/SettingsContext";

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, setSettings, resetSettings } = useSettings();

  return (
    <div className="settings-overlay" role="dialog" aria-label="Settings">
      <div className="settings-panel screen-enter">
        <header className="settings-header">
          <div>
            <p className="eyebrow">Preferences</p>
            <h2>Settings</h2>
          </div>
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <section className="settings-section">
          <h3>Theme</h3>
          <div className="theme-switch" role="group" aria-label="Theme">
            <button
              type="button"
              className={settings.theme === "dark" ? "option-pill active" : "option-pill"}
              onClick={() => setSettings({ theme: "dark" })}
            >
              Dark
            </button>
            <button
              type="button"
              className={settings.theme === "light" ? "option-pill active" : "option-pill"}
              onClick={() => setSettings({ theme: "light" })}
            >
              Light
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>App accent</h3>
          <p className="settings-hint">Buttons, selection, caret</p>
          <div className="swatch-grid">
            {ACCENT_SWATCHES.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.label}
                aria-label={s.label}
                aria-pressed={settings.accent === s.id}
                className={settings.accent === s.id ? "swatch active" : "swatch"}
                style={{ background: s.hex }}
                onClick={() => setSettings({ accent: s.id as AccentId })}
              />
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3>Typed text color</h3>
          <p className="settings-hint">
            Correctly typed characters (auto-adjusted on light theme for contrast)
          </p>
          <div className="swatch-grid">
            {TYPING_COLOR_SWATCHES.map((s) => {
              const preview = settings.theme === "light" ? s.lightHex : s.hex;
              return (
                <button
                  key={s.id}
                  type="button"
                  title={
                    settings.theme === "light"
                      ? `${s.label} (auto-adjusted for light theme)`
                      : s.label
                  }
                  aria-label={s.label}
                  aria-pressed={settings.typingColor === s.id}
                  className={settings.typingColor === s.id ? "swatch active" : "swatch"}
                  style={{ background: preview }}
                  onClick={() => setSettings({ typingColor: s.id as TypingColorId })}
                />
              );
            })}
          </div>
        </section>

        <section className="settings-section">
          <h3>Typing font</h3>
          <div className="font-list">
            {TYPING_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={settings.typingFont === f.id ? "font-option active" : "font-option"}
                style={{ fontFamily: f.css }}
                onClick={() => setSettings({ typingFont: f.id as TypingFontId })}
              >
                {f.label}
                <span className="font-sample">the quick brown fox</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3>Background</h3>
          <div className="bg-list">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={
                  settings.background === b.id
                    ? `bg-option bg-preview-${b.id} active`
                    : `bg-option bg-preview-${b.id}`
                }
                onClick={() => setSettings({ background: b.id as BackgroundId })}
              >
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section fun-section">
          <h3>Fun</h3>
          <p className="settings-hint">
            Mild by default (quiet clicks + soft caret trail). Chaos and confetti stay off until you turn them on.
          </p>

          <div className="fun-row">
            <span className="fun-label">Quiet key click</span>
            <button
              type="button"
              className={settings.soundEnabled ? "option-pill active" : "option-pill"}
              aria-pressed={settings.soundEnabled}
              onClick={() => setSettings({ soundEnabled: !settings.soundEnabled })}
            >
              {settings.soundEnabled ? "On" : "Off"}
            </button>
          </div>

          <div className="fun-row">
            <span className="fun-label">Caret style</span>
            <div className="theme-switch" role="group" aria-label="Caret style">
              {CARET_STYLES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={settings.caretStyle === c.id ? "option-pill active" : "option-pill"}
                  onClick={() => setSettings({ caretStyle: c.id as CaretStyleId })}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fun-row">
            <span className="fun-label">Soft caret trail</span>
            <button
              type="button"
              className={settings.caretTrail ? "option-pill active" : "option-pill"}
              aria-pressed={settings.caretTrail}
              onClick={() => setSettings({ caretTrail: !settings.caretTrail })}
            >
              {settings.caretTrail ? "On" : "Off"}
            </button>
          </div>

          <div className="fun-row">
            <span className="fun-label">Chaos typing colors</span>
            <button
              type="button"
              className={settings.chaosTypedColor ? "option-pill active" : "option-pill"}
              aria-pressed={settings.chaosTypedColor}
              onClick={() => setSettings({ chaosTypedColor: !settings.chaosTypedColor })}
            >
              {settings.chaosTypedColor ? "On" : "Off"}
            </button>
          </div>

          <div className="fun-row">
            <span className="fun-label">Confetti on personal best</span>
            <button
              type="button"
              className={settings.confettiOnBest ? "option-pill active" : "option-pill"}
              aria-pressed={settings.confettiOnBest}
              onClick={() => setSettings({ confettiOnBest: !settings.confettiOnBest })}
            >
              {settings.confettiOnBest ? "On" : "Off"}
            </button>
          </div>

          <div className="fun-row">
            <span className="fun-label">Reduce effects (For lower end PCs)</span>
            <button
              type="button"
              className={settings.reduceEffects ? "option-pill active" : "option-pill"}
              aria-pressed={settings.reduceEffects}
              title="Shorter transitions for slower PCs (off by default)"
              onClick={() => setSettings({ reduceEffects: !settings.reduceEffects })}
            >
              {settings.reduceEffects ? "On" : "Off"}
            </button>
          </div>

          <p className="settings-hint" style={{ marginTop: "0.85rem" }}>
            Accent presets
          </p>
          <div className="fun-presets">
            {FUN_ACCENT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="option-pill"
                onClick={() =>
                  setSettings({
                    accent: p.accent,
                    typingColor: p.typingColor,
                    chaosTypedColor: false,
                  })
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <footer className="settings-footer">
          <button type="button" className="btn ghost" onClick={resetSettings}>
            Reset defaults
          </button>
          <button type="button" className="btn primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
