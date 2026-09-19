import { lazy, Suspense, useMemo, useState } from "react";
import { useSettings } from "@/lib/SettingsContext";
import {
  deleteSavedText,
  HISTORY_CAP,
  historyToResult,
  loadHistory,
  loadSavedTexts,
  SAVED_TEXTS_CAP,
  saveSavedTexts,
  trendPoints,
  upsertSavedText,
  type HistoryEntry,
  type SavedText,
} from "@/lib/progress";
import type { TestResult } from "@/lib/types";

const TrendsChart = lazy(() =>
  import("@/components/TrendsChart").then((m) => ({ default: m.TrendsChart })),
);

type TabId = "overview" | "history" | "trends" | "texts";

interface ProgressPanelProps {
  onClose: () => void;
  onOpenRun: (result: TestResult) => void;
  onUseSavedText: (body: string) => void;
  onEditTarget: () => void;
  draftCustomText?: string;
}

function fmtWhen(at: number): string {
  return new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "history", label: "History" },
  { id: "trends", label: "Trends" },
  { id: "texts", label: "Saved texts" },
];

export function ProgressPanel({
  onClose,
  onOpenRun,
  onUseSavedText,
  onEditTarget,
  draftCustomText = "",
}: ProgressPanelProps) {
  const { settings } = useSettings();
  const [tab, setTab] = useState<TabId>("overview");
  const [history, setHistory] = useState(() => loadHistory());
  const [texts, setTexts] = useState(() => loadSavedTexts());
  const [textName, setTextName] = useState("");
  const trends = useMemo(() => trendPoints(history, 24), [history]);

  const saveCurrentText = () => {
    const next = upsertSavedText(texts, { name: textName, body: draftCustomText });
    setTexts(next);
    saveSavedTexts(next);
    setTextName("");
  };

  const removeText = (id: string) => {
    const next = deleteSavedText(texts, id);
    setTexts(next);
    saveSavedTexts(next);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("bangtyper.history.v1");
    } catch {
      /* ignore */
    }
  };

  const targetSummary =
    settings.targetWpm != null || settings.targetAccuracy != null
      ? [
          settings.targetWpm != null ? `${settings.targetWpm} WPM` : null,
          settings.targetAccuracy != null ? `${settings.targetAccuracy}% Acc` : null,
        ]
          .filter(Boolean)
          .join(", ")
      : "Not set";

  return (
    <div className="settings-overlay" role="dialog" aria-label="Progress">
      <div className="settings-panel progress-panel screen-enter">
        <header className="settings-header">
          <div>
            <p className="eyebrow">You vs you</p>
            <h2>Your progress</h2>
          </div>
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="progress-tabs" role="tablist" aria-label="Progress sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "progress-tab active" : "progress-tab"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="progress-tab-body">
          {tab === "overview" ? (
            <section className="settings-section">
              <h3>Personal target</h3>
              <p className="settings-hint">Optional WPM and accuracy goal. Leave unset if you prefer so.</p>
              <div className="overview-target-card">
                <div>
                  <p className="overview-target-value">{targetSummary}</p>
                  <p className="muted">Checked after each run.</p>
                </div>
                <button type="button" className="btn primary" onClick={onEditTarget}>
                  {settings.targetWpm != null || settings.targetAccuracy != null
                    ? "Edit target"
                    : "Set target"}
                </button>
              </div>
              <div className="overview-stats">
                <div className="overview-stat">
                  <span>Runs saved</span>
                  <strong>{history.length}</strong>
                </div>
                <div className="overview-stat">
                  <span>Saved texts</span>
                  <strong>{texts.length}</strong>
                </div>
              </div>
            </section>
          ) : null}

          {tab === "history" ? (
            <section className="settings-section">
              <div className="section-row">
                <h3>History</h3>
                {history.length > 0 ? (
                  <button type="button" className="btn ghost tiny" onClick={clearHistory}>
                    Clear
                  </button>
                ) : null}
              </div>
              <p className="settings-hint">Last {HISTORY_CAP} runs, tap to reopen results</p>
              {history.length === 0 ? (
                <p className="empty-state">No runs yet.</p>
              ) : (
                <ul className="history-list tall">
                  {history.map((e: HistoryEntry) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        className="history-item"
                        onClick={() => onOpenRun(historyToResult(e))}
                      >
                        <span className="history-main">
                          <strong>{Math.round(e.wpm)} WPM</strong>
                          <span className="muted">
                            {Math.round(e.accuracy)}%, {e.mode},{" "}
                            {Math.round(e.durationMs / 1000)}s
                          </span>
                        </span>
                        <span className="history-when muted">{fmtWhen(e.at)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {tab === "trends" ? (
            <section className="settings-section">
              <h3>Trends</h3>
              <p className="settings-hint">Recent sessions, your pace over time</p>
              {trends.length < 2 ? (
                <p className="empty-state">Complete a few runs to see a trend line.</p>
              ) : (
                <Suspense fallback={<p className="muted">Loading chart…</p>}>
                  <TrendsChart data={trends} targetWpm={settings.targetWpm} />
                </Suspense>
              )}
            </section>
          ) : null}

          {tab === "texts" ? (
            <section className="settings-section">
              <h3>Saved custom texts</h3>
              <p className="settings-hint">Up to {SAVED_TEXTS_CAP} pastes for Custom mode</p>
              <div className="save-text-row">
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={textName}
                  onChange={(e) => setTextName(e.target.value)}
                  maxLength={40}
                />
                <button
                  type="button"
                  className="btn primary"
                  disabled={!draftCustomText.trim() || texts.length >= SAVED_TEXTS_CAP}
                  onClick={saveCurrentText}
                >
                  Save current
                </button>
              </div>
              {texts.length === 0 ? (
                <p className="empty-state">Insert text on home (Custom), then save it here.</p>
              ) : (
                <ul className="saved-text-list tall">
                  {texts.map((t: SavedText) => (
                    <li key={t.id} className="saved-text-item">
                      <button
                        type="button"
                        className="saved-text-use"
                        onClick={() => {
                          onUseSavedText(t.body);
                          onClose();
                        }}
                      >
                        <strong>{t.name}</strong>
                        <span className="muted">
                          {t.body.slice(0, 72)}
                          {t.body.length > 72 ? "…" : ""}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="btn ghost tiny"
                        aria-label={`Delete ${t.name}`}
                        onClick={() => removeText(t.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>

        <footer className="settings-footer">
          <button type="button" className="btn primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
