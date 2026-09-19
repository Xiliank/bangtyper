<img width="1280" height="720" alt="bangtyper  logo" src="https://github.com/user-attachments/assets/a2e79149-6938-484d-b4a1-bc14bda54d31" />

Desktop typing test for Windows. Black + marble gold, three modes, optional timer, Escape to stop, post-run graphs.

**Product = the Electron / Windows app**, not a browser tab.

[Download Windows](#windows-download) · [Run from source](#run-from-source) · [License](#license)

## Screenshots

Add 2–3 real captures under `docs/screenshots/` after you go public (commit PNGs/WebPs, not the `.exe`). Suggested set:

| File | Show |
|------|------|
| `docs/screenshots/home-dark.png` | Home screen, dark theme |
| `docs/screenshots/typing.png` | In-run typing + HUD |
| `docs/screenshots/results.png` | Results graphs |

Then embed them here, for example:

```md
![Home](docs/screenshots/home-dark.png)
```

Until those land, the Releases page and a short About blurb are enough.

## Windows download

**Preferred for most people:** grab the latest Release asset from GitHub:

**[Releases → bangtyper-1.2.6.exe](https://github.com/Xiliank/bangtyper/releases/latest)**

Direct asset URL (after you publish the release):

`https://github.com/Xiliank/bangtyper/releases/latest/download/bangtyper-1.2.6.exe`

1. Download `bangtyper-1.2.6.exe`
2. Run it (portable build; extracts to a temp folder)

### If the portable .exe closes immediately

Some Windows setups (Defender / temp extraction) kill portable Electron apps on launch. Older builds also used product name `bangtyper.` (trailing period), which can break unpack paths.

**Fallback:** use an unpacked zip when one is published on the same Release:

1. Download `bangtyper-win-unpacked.zip` (or join split `.00.bin` + `.01.bin` parts)
2. Extract anywhere (e.g. `Desktop\bangtyper`)
3. Open `win-unpacked` and run **`bangtyper.exe`**
4. Leave the folder intact (DLLs next to the exe are required)

Join split parts (Windows CMD):

```bat
copy /b bangtyper-win-unpacked.zip.00.bin+bangtyper-win-unpacked.zip.01.bin bangtyper-win-unpacked.zip
```

## Features

- **Progress:** optional personal WPM/accuracy target (unset by default) · local history · quiet trends · saved custom texts
- **Modes:** random words (no near repeats) · richer movie-style scripts · custom paste
- **Fun:** mild defaults (quiet key click + soft caret trail); chaos/confetti stay off
- **End conditions:** timer presets (15/30/60/120s + custom) or free run
- **Escape:** `Esc` ends a started run (results) or returns home if you have not typed yet
- **Live HUD:** WPM, accuracy, timer/elapsed, errors
- **Results:** WPM over time (with peak), accuracy over time, mistake timeline + markers
- **Settings:** dark/light, accent + typed text colors, typing fonts, gradient backgrounds (persisted)
- **Accuracy:** incorrect keystrokes are permanent. Fixing later does not restore accuracy.

## Run from source

Needs Node.js 20+ (or current LTS) and npm.

```bash
git clone https://github.com/Xiliank/bangtyper.git
cd bangtyper
npm install
npm run dev:electron
```

Opens a frameless **bangtyper.** window (custom title bar).

Renderer-only helper (not the real product path):

```bash
npm run dev          # http://127.0.0.1:43127
```

## Build Windows artifacts (maintainers)

```bash
npm install
npm run pack:win:all
```

| Artifact | Notes |
|----------|--------|
| `release/bangtyper-win-unpacked.zip` | Unzip → `bangtyper.exe` |
| `release/bangtyper-1.2.6-portable.exe` | Stage / rename as `bangtyper-1.2.6.exe` for Releases |
| `release/win-unpacked/bangtyper.exe` | Unpacked tree before zipping |

Do **not** commit `release/` or `*.exe` into git. Attach binaries to a [GitHub Release](https://github.com/Xiliank/bangtyper/releases).

```bash
npm run pack:win:zip      # dir + zip only
npm run pack:win          # portable only
```

Cross-build from Linux uses `signAndEditExecutable=false` (no Wine needed for portable/dir).

## Brand assets

Logo wordmark (`bangtyper.`): `assets/logo.png`  
App icons: `assets/icon.png`, `assets/icon.ico`

## Stack

Electron · React · TypeScript · Vite · Recharts

## Changelog (recent)

- **v1.2.6** — Electron security hardening for public release  
- **v1.2.5** — description polish  
- **v1.2.4** — home hint without dash separators  
- **v1.2.3** — cleaner copy and spacing  
- **v1.2.2** — unset targets, no word near repeats, richer movies, mild Fun on  

## License

[MIT](LICENSE) — see `LICENSE` for the full text. Copyright holder listed there is `Xiliank`; change it if you prefer a different legal name before publishing.
