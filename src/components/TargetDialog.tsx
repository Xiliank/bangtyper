import { useEffect, useState } from "react";
import { useSettings } from "@/lib/SettingsContext";

interface TargetDialogProps {
  onClose: () => void;
}

/** Centered dialog to set personal WPM / accuracy targets. */
export function TargetDialog({ onClose }: TargetDialogProps) {
  const { settings, setSettings } = useSettings();
  const [wpm, setWpm] = useState(
    settings.targetWpm != null ? String(settings.targetWpm) : "",
  );
  const [acc, setAcc] = useState(
    settings.targetAccuracy != null ? String(settings.targetAccuracy) : "",
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const save = () => {
    const w = wpm.trim() === "" ? null : Math.max(1, Math.min(300, Number(wpm) || 0));
    const a = acc.trim() === "" ? null : Math.max(1, Math.min(100, Number(acc) || 0));
    setSettings({
      targetWpm: w && w > 0 ? Math.round(w) : null,
      targetAccuracy: a && a > 0 ? Math.round(a) : null,
    });
    onClose();
  };

  const clear = () => {
    setWpm("");
    setAcc("");
    setSettings({ targetWpm: null, targetAccuracy: null });
  };

  return (
    <div className="dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="target-dialog screen-enter"
        role="dialog"
        aria-label="Personal target"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="target-dialog-head">
          <div>
            <p className="eyebrow">Personal goal</p>
            <h2>Set your target</h2>
          </div>
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
        </header>
        <p className="settings-hint">
          Leave blank for “Not set.” Compare each run to your own pace, never a leaderboard.
        </p>
        <div className="target-dialog-fields">
          <label>
            Target WPM
            <input
              type="number"
              min={1}
              max={300}
              placeholder="Not set"
              value={wpm}
              autoFocus
              onChange={(e) => setWpm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
            />
          </label>
          <label>
            Target accuracy %
            <input
              type="number"
              min={1}
              max={100}
              placeholder="Not set"
              value={acc}
              onChange={(e) => setAcc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
            />
          </label>
        </div>
        <footer className="target-dialog-foot">
          <button type="button" className="btn ghost" onClick={clear}>
            Clear to Not set
          </button>
          <button type="button" className="btn primary" onClick={save}>
            Save target
          </button>
        </footer>
      </div>
    </div>
  );
}
