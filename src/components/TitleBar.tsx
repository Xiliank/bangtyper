import { useEffect, useState } from "react";
import logoUrl from "../logo.png";

export function TitleBar() {
  const isElectron = Boolean(window.bangtyper?.isElectron);
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    void window.bangtyper?.windowControls?.isMaximized().then(setMaximized);
  }, [isElectron]);

  if (!isElectron) {
    return (
      <header className="titlebar titlebar-web" aria-label="App title">
        <img src={logoUrl} alt="bangtyper." className="titlebar-logo" />
        <span className="titlebar-hint">Desktop app. Run via Electron / .exe</span>
      </header>
    );
  }

  return (
    <header className="titlebar" aria-label="Window title bar">
      <div className="titlebar-drag">
        <img src={logoUrl} alt="bangtyper." className="titlebar-logo" />
      </div>
      <div className="window-controls">
        <button
          type="button"
          className="win-btn"
          aria-label="Minimize"
          onClick={() => void window.bangtyper?.windowControls?.minimize()}
        >
          ─
        </button>
        <button
          type="button"
          className="win-btn"
          aria-label={maximized ? "Restore" : "Maximize"}
          onClick={() =>
            void window.bangtyper?.windowControls?.maximize().then(setMaximized)
          }
        >
          {maximized ? "❐" : "□"}
        </button>
        <button
          type="button"
          className="win-btn win-close"
          aria-label="Close"
          onClick={() => void window.bangtyper?.windowControls?.close()}
        >
          ✕
        </button>
      </div>
    </header>
  );
}
