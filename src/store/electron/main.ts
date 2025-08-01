import { ipcMain } from "electron";
import Store from "electron-store";

const store = new Store();

export function registerIpcHandlers() {
  ipcMain.handle("set-project-id", (_event, id: number) => {
    store.set("projectId", id);
  });

  ipcMain.handle("get-project-id", () => {
    return store.get("projectId");
  });
}

registerIpcHandlers();
