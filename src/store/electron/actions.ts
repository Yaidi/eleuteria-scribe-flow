export const getCurrentId: () => Promise<number> = async () => {
    return await window.Electron.ipcRenderer.invoke("get-project-id");
};

export const setCurrentId = async (id: number) => {
    await window.Electron.ipcRenderer.invoke("set-project-id", id);
};