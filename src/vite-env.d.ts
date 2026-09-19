/// <reference types="vite/client" />

interface BangtyperWindowControls {
  minimize: () => Promise<void>;
  maximize: () => Promise<boolean>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
}

interface BangtyperApi {
  platform: string;
  version: string;
  isElectron?: boolean;
  windowControls?: BangtyperWindowControls;
}

interface Window {
  bangtyper?: BangtyperApi;
}

declare module "*.png" {
  const src: string;
  export default src;
}
