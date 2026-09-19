import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("bangtyper", {
  platform: process.platform,
  version: "1.2.6",
  isElectron: true,
  windowControls: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize") as Promise<boolean>,
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:isMaximized") as Promise<boolean>,
  },
});
