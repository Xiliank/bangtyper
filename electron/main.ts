import { app, BrowserWindow, ipcMain, session, shell } from "electron";
import path from "node:path";
import fs from "node:fs";

/**
 * Software rendering path — keeps bangtyper reliable on weak / VM GPUs
 * (avoids prior GPU FATAL crashes). Still paints CSS animations fine.
 */
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");
app.commandLine.appendSwitch("in-process-gpu");
app.commandLine.appendSwitch("disable-background-networking");
app.commandLine.appendSwitch("disable-features", "Translate,BackForwardCache,MediaRouter");

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
let ipcReady = false;

/** Only allow http(s) for shell.openExternal — blocks file:, javascript:, custom protocols. */
function isSafeExternalUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Allow in-app navigations only (dev server or packaged file:// UI). */
function isAllowedNavigation(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      const dev = new URL(process.env.VITE_DEV_SERVER_URL);
      return u.origin === dev.origin;
    }
    return u.protocol === "file:";
  } catch {
    return false;
  }
}

function buildCsp(): string {
  // Vite HMR needs eval + websocket to the fixed dev port; production stays tight.
  const script = isDev ? "script-src 'self' 'unsafe-eval'; " : "script-src 'self'; ";
  const connect = isDev
    ? "connect-src 'self' http://127.0.0.1:43127 ws://127.0.0.1:43127 https://fonts.googleapis.com https://fonts.gstatic.com; "
    : "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; ";
  return (
    "default-src 'self'; " +
    script +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: blob:; " +
    connect +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'"
  );
}

function resolveAsset(...parts: string[]) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "assets", ...parts);
  }
  return path.join(__dirname, "..", "assets", ...parts);
}

/** Packaged: app.asar/dist/index.html — never rely on cwd. */
function resolveIndexHtml(): string {
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    return "";
  }
  const candidates = [
    path.join(app.getAppPath(), "dist", "index.html"),
    path.join(__dirname, "..", "dist", "index.html"),
    path.join(process.resourcesPath, "app.asar", "dist", "index.html"),
    path.join(process.resourcesPath, "app", "dist", "index.html"),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      /* continue */
    }
  }
  return candidates[0]!;
}

async function showFatal(title: string, detail: string) {
  try {
    const { dialog } = await import("electron");
    dialog.showErrorBox(title, detail);
  } catch {
    console.error(title, detail);
  }
}

process.on("uncaughtException", (err) => {
  void showFatal("bangtyper. — startup error", String(err?.stack || err));
});

process.on("unhandledRejection", (reason) => {
  void showFatal("bangtyper. — startup error", String(reason));
});

function registerIpc() {
  if (ipcReady) return;
  ipcReady = true;
  ipcMain.handle("window:minimize", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  ipcMain.handle("window:maximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
    return win.isMaximized();
  });
  ipcMain.handle("window:close", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });
  ipcMain.handle("window:isMaximized", (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false;
  });
}

async function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");
  const iconPath = resolveAsset("icon.png");

  const win = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0b0d10",
    title: "bangtyper.",
    frame: false,
    autoHideMenuBar: true,
    show: false,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: true,
      v8CacheOptions: "bypassHeatCheck",
    },
  });

  try {
    win.webContents.session.setSpellCheckerEnabled(false);
  } catch {
    /* older electron */
  }

  const reveal = () => {
    if (!win.isDestroyed() && !win.isVisible()) win.show();
  };
  win.once("ready-to-show", reveal);
  setTimeout(reveal, 350);

  // Deny unexpected in-window navigations (XSS / open-redirect style abuse).
  win.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedNavigation(url)) event.preventDefault();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    const msg = `Failed to load UI (${code}): ${desc}\nURL: ${url}\nApp path: ${app.getAppPath()}\n__dirname: ${__dirname}`;
    console.error(msg);
    void showFatal("bangtyper. — failed to load", msg);
    reveal();
  });

  try {
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      await win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      const indexHtml = resolveIndexHtml();
      if (!fs.existsSync(indexHtml)) {
        throw new Error(
          `Missing index.html at ${indexHtml}\nTried app path: ${app.getAppPath()}`,
        );
      }
      await win.loadFile(indexHtml);
    }
  } catch (err) {
    void showFatal("bangtyper. — failed to start", String(err));
    reveal();
  }

  return win;
}

app.whenReady().then(async () => {
  registerIpc();

  // Harden default session: CSP + deny sensitive permissions.
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(false);
  });
  ses.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders };
    headers["Content-Security-Policy"] = [buildCsp()];
    callback({ responseHeaders: headers });
  });

  try {
    await createWindow();
  } catch (err) {
    void showFatal("bangtyper. — failed to create window", String(err));
    app.quit();
    return;
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
