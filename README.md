<img width="256" height="256" alt="bangtyper  logo" src="https://github.com/user-attachments/assets/a2e79149-6938-484d-b4a1-bc14bda54d31" />

Desktop typing test for Windows. Black + marble gold, three modes, optional timer, Escape to stop, post-run graphs.

**Product = the Electron / Windows app**, not a browser tab.

[Download Windows](#windows-download) · [Run from source](#run-from-source) · [License](#license)

## Screenshots

Add 2–3 real captures under `docs/screenshots/` after you go public (commit PNGs/WebPs, not the `.exe`). Suggested set:

| File | Show |
|------|------|
| `<img width="1180" height="780" alt="bangtyper1" src="https://github.com/user-attachments/assets/9a46d90a-34f1-4158-8528-ba1c8f8c72a8" />` | Home screen, dark theme |
| `<img width="1180" height="780" alt="bangtyper2" src="https://github.com/user-attachments/assets/9a1d82d2-1999-4609-bce1-e1b6cb8da80e" />` | In-run typing + HUD |
| `<img width="1180" height="780" alt="bangtyper3" src="https://github.com/user-attachments/assets/b095b6f4-7db9-41e4-bb5d-74bfe8b5096a" />` | Results graphs |
| `<img width="1180" height="780" alt="bangtyper4" src="https://github.com/user-attachments/assets/c80f6829-f919-43b4-a3b0-f2765273185e" />` | Settings menu |
| `<img width="1180" height="780" alt="bangtyper5" src="https://github.com/user-attachments/assets/43923dc6-8997-4b7d-a681-f0b330e506e8" />` | Set target menu |
| `<img width="1180" height="780" alt="bangtyper6" src="https://github.com/user-attachments/assets/cb2f548b-1c22-4961-8595-ac5e1378b4b2" />` | Show progress menu |

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
