import type { IpcRendererEvent } from "electron";

export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on: (
          channel: string,
          listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
        ) => void;
        off: (channel: string, listener: (...args: unknown[]) => void) => void;
        send: (channel: string, ...args: unknown[]) => void;
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      };
    };
  }
}
