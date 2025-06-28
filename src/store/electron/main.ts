import Store from "electron-store";
import ipcMain = Electron.ipcMain;

const store = new Store();

store.set("projectId", 0);

const id = store.get("projectId");
console.log("Project ID:", id);


ipcMain.handle("get-project-id", () => {
    return store.get("projectId");
});

ipcMain.handle("set-project-id", (_, id: number) => {
    store.set("projectId", id);
});