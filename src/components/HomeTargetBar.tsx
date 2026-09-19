import { useSettings } from "@/lib/SettingsContext";

interface HomeTargetBarProps {
  onOpenTarget: () => void;
  onOpenProgress: () => void;
}

/** Home bar: clear Target + Progress buttons (no inline janky underlines). */
export function HomeTargetBar({ onOpenTarget, onOpenProgress }: HomeTargetBarProps) {
  const { settings } = useSettings();
  const hasTarget = settings.targetWpm != null || settings.targetAccuracy != null;
  const summary = hasTarget
    ? [
        settings.targetWpm != null ? `${settings.targetWpm} WPM` : null,
        settings.targetAccuracy != null ? `${settings.targetAccuracy}% Acc` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "Not set";

  return (
    <div className="home-actions">
      <button
        type="button"
        className="home-action-btn target-btn"
        onClick={onOpenTarget}
        title="Set an optional personal WPM and accuracy goal"
      >
        <span className="home-action-kicker">Personal target</span>
        <span className={`home-action-value${hasTarget ? "" : " is-unset"}`}>{summary}</span>
        <span className="home-action-hint">{hasTarget ? "Tap to edit" : "Optional. Tap to set"}</span>
      </button>
      <button
        type="button"
        className="home-action-btn progress-btn"
        onClick={onOpenProgress}
        title="Open history, trends, and saved texts"
      >
        <span className="home-action-kicker">Your progress</span>
        <span className="home-action-value">History, Trends, Texts</span>
        <span className="home-action-hint">Review past runs</span>
      </button>
    </div>
  );
}
