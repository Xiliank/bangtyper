# bangtyper 1.2.6

Paste this into the GitHub Release description for tag **`v1.2.6`**.

---

**bangtyper** is a focused Windows desktop typing test (Electron) — black + marble gold, local-only, no accounts.

## Download

Grab **`bangtyper-1.2.6.exe`** (portable) from this release:

https://github.com/Xiliank/bangtyper/releases/latest

The exe is **unsigned**. Windows Defender may flag or block portable Electron apps — *More info → Run anyway* if you trust the build, or use an **unpacked zip** when published on the same Release (`extract → win-unpacked\bangtyper.exe`).

### SHA-256

```
5b3d885016d163e2de3d8c8133bdaed510b60d2e3c1ce2673bbd96b4adb78dce  bangtyper-1.2.6.exe
```

Verify (PowerShell):

```powershell
Get-FileHash .\bangtyper-1.2.6.exe -Algorithm SHA256
```

## Highlights

### Security harden (Electron)

- Content-Security-Policy for the renderer
- `shell.openExternal` allowlist
- Navigation lockdown (`will-navigate` / deny unexpected loads)
- Permission requests denied by default

### Bugfixes

- **Esc before typing** returns home (no stuck test screen)
- Custom paste capped at **2500** characters
- Custom seconds clamped to a sane range
- Keystroke counting fixed under React Strict Mode (no double-count in dev)

### Product

- Personal target + progress (history / trends / saved texts)
- Modes, timer presets, results graphs, settings (theme, fonts, backgrounds, Fun)

## What’s included

- Modes: Words · Movies · Custom
- Timer: 15 / 30 / 60 / 120s · custom · no timer
- Live HUD + post-run WPM / accuracy / mistake graphs
- Settings persisted locally

MIT · [Source](https://github.com/Xiliank/bangtyper)
